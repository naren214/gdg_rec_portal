import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { connect } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  COMMON_QUESTIONS,
  getDepartmentBySlug,
  getDepartmentQuestions,
} from "@/constants";
import {
  isRecruitmentOpen,
  isAllowedStudentEmail,
  MAX_APPLICATIONS_PER_USER,
} from "@/lib/config";

export const dynamic = "force-dynamic";

const COLLECTION = "formData";
const LOCK_COLLECTION = "applicationLocks";

const REG_NO_REGEX = /^\d{2}[A-Z]{3}\d{4}$/;
const PHONE_REGEX = /^\d{10}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getApplicantLockId = (email) =>
  createHash("sha256").update(email).digest("hex");

export async function POST(req) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    const userEmail = String(session.user.email || "").trim().toLowerCase();

    if (!isAllowedStudentEmail(userEmail)) {
      return NextResponse.json(
        { message: "Only official VIT student email addresses are allowed." },
        { status: 403 }
      );
    }

    // Recruitment window (configured via env, not hard-coded).
    if (!isRecruitmentOpen()) {
      return NextResponse.json(
        { message: "Applications are currently closed." },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ message: "Invalid request body" }, { status: 400 });
    }

    // Department is sent as a slug from the join URL.
    const departmentSlug = String(
      body.departmentSlug || body.DepartmentSlug || ""
    ).trim();
    const department = getDepartmentBySlug(departmentSlug);
    if (!department) {
      return NextResponse.json(
        { message: "Unknown department." },
        { status: 400 }
      );
    }

    // ---- Server-side validation (never trust the client) ----
    const {
      Name,
      RegistrationNumber,
      Phone,
      Gender,
      YearOfStudy,
      Responses,
      DepartmentResponses,
    } = body;

    if (
      !Name ||
      typeof Name !== "string" ||
      Name.trim().length < 2 ||
      Name.trim().length > 120
    ) {
      return NextResponse.json(
        { message: "A valid full name is required." },
        { status: 400 }
      );
    }
    if (!EMAIL_REGEX.test(userEmail)) {
      return NextResponse.json(
        { message: "A valid email is required." },
        { status: 400 }
      );
    }
    const registrationNumber = String(RegistrationNumber || "")
      .trim()
      .toUpperCase();
    if (!REG_NO_REGEX.test(registrationNumber)) {
      return NextResponse.json(
        {
          message:
            "Registration number must be 2 numbers, 3 uppercase letters and 4 numbers (e.g. 25BCE5612).",
        },
        { status: 400 }
      );
    }
    const phone = String(Phone || "").trim();
    if (!PHONE_REGEX.test(phone)) {
      return NextResponse.json(
        { message: "Phone number must be exactly 10 digits." },
        { status: 400 }
      );
    }

    if (
      !Responses ||
      typeof Responses !== "object" ||
      Array.isArray(Responses)
    ) {
      return NextResponse.json(
        { message: "Application responses are missing." },
        { status: 400 }
      );
    }

    // Sanitise answers: only keep the known common questions, enforce
    // required ones, clamp lengths. This guarantees every application stores
    // the SAME response shape for admins.
    const cleanResponses = {};
    for (const question of COMMON_QUESTIONS) {
      const answer = String(Responses[question.id] ?? "")
        .trim()
        .slice(0, question.type === "url" ? 500 : 4000);
      if (question.required && !answer) {
        return NextResponse.json(
          { message: `Please answer: ${question.label}` },
          { status: 400 }
        );
      }

      if (question.type === "url" && answer) {
        try {
          const url = new URL(answer);
          if (!/^https?:$/.test(url.protocol)) throw new Error("Unsupported URL protocol");
        } catch {
          return NextResponse.json(
            { message: `${question.label} must be a valid http(s) URL.` },
            { status: 400 }
          );
        }
      }

      cleanResponses[question.id] = answer;
    }

    const departmentAnswers = DepartmentResponses?.[department.slug];
    if (
      !DepartmentResponses ||
      typeof DepartmentResponses !== "object" ||
      Array.isArray(DepartmentResponses) ||
      !departmentAnswers ||
      typeof departmentAnswers !== "object" ||
      Array.isArray(departmentAnswers)
    ) {
      return NextResponse.json(
        { message: "Department-specific responses are missing." },
        { status: 400 }
      );
    }

    const cleanDepartmentResponses = {};
    for (const question of getDepartmentQuestions(department.name)) {
      const answer = String(departmentAnswers[question.id] ?? "")
        .trim()
        .slice(0, question.type === "url" ? 500 : 4000);

      if (question.required && answer.length < 10) {
        return NextResponse.json(
          { message: `Please answer: ${question.label}` },
          { status: 400 }
        );
      }

      if (question.type === "url" && answer) {
        try {
          const url = new URL(answer);
          if (!/^https?:$/.test(url.protocol)) throw new Error("Unsupported URL protocol");
        } catch {
          return NextResponse.json(
            { message: `${question.label} must be a valid http(s) URL.` },
            { status: 400 }
          );
        }
      }

      cleanDepartmentResponses[question.id] = answer;
    }

    const db = await connect();
    const collection = db.collection(COLLECTION);
    const lockRef = db
      .collection(LOCK_COLLECTION)
      .doc(getApplicantLockId(userEmail));

    // ---- Atomic duplicate + limit check using a Firestore transaction ----
    // A non-transactional read-then-write allowed two concurrent requests to
    // both pass the "already applied" / "max 2" checks and create extra docs.
    try {
      const result = await db.runTransaction(async (tx) => {
        // The lock document is read even for a first-time applicant. A
        // transaction that creates this missing document conflicts with any
        // concurrent transaction for the same applicant, preventing phantom
        // query results from bypassing the two-application limit.
        const lockSnapshot = await tx.get(lockRef);
        const existing = await tx.get(
          collection.where("Email", "==", userEmail)
        );

        const docs = existing.docs.map((d) => ({ id: d.id, ...d.data() }));
        const lockData = lockSnapshot.exists ? lockSnapshot.data() : {};
        const submittedSlugs = new Set([
          ...(Array.isArray(lockData?.departmentSlugs)
            ? lockData.departmentSlugs
            : []),
          ...docs.map((d) => d.departmentSlug).filter(Boolean),
        ]);

        const dup = submittedSlugs.has(department.slug);
        if (dup) {
          return { error: `You have already applied to ${department.name}.`, status: 400 };
        }
        const applicationCount = Math.max(
          Number(lockData?.count) || 0,
          submittedSlugs.size,
          docs.length
        );
        if (applicationCount >= MAX_APPLICATIONS_PER_USER) {
          return {
            error: `You can only submit up to ${MAX_APPLICATIONS_PER_USER} applications.`,
            status: 400,
          };
        }

        const newRef = collection.doc();
        tx.set(newRef, {
          Name: Name.trim(),
          Email: userEmail, // always taken from the session, never the body
          RegistrationNumber: registrationNumber,
          Phone: phone,
          Gender: Gender ? String(Gender).trim().slice(0, 60) : "",
          YearOfStudy: YearOfStudy ? String(YearOfStudy).trim().slice(0, 60) : "",
          departmentSlug: department.slug,
          Department: department.name,
          Responses: cleanResponses,
          DepartmentResponses: {
            [department.slug]: cleanDepartmentResponses,
          },
          shortlisted: false,
          createdAt: new Date(),
        });
        tx.set(
          lockRef,
          {
            count: applicationCount + 1,
            departmentSlugs: [...submittedSlugs, department.slug],
            updatedAt: new Date(),
          },
          { merge: true }
        );
        return { ok: true };
      });

      if (result.error) {
        return NextResponse.json({ message: result.error }, { status: result.status });
      }
    } catch (txError) {
      console.error("Submit transaction error:", txError);
      return NextResponse.json(
        { message: "Could not submit your application. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: `Application submitted for ${department.name}!`,
        departmentSlug: department.slug,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Form submission error:", error);
    return NextResponse.json(
      { message: "Error submitting form" },
      { status: 500 }
    );
  }
}
