import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { requireAdmin } from "@/lib/auth-guard";
import { DEPARTMENTS, DEPARTMENTS_BY_SLUG } from "@/constants";
import { isAllowedStudentEmail } from "@/lib/config";

export const dynamic = "force-dynamic";

let transporterPromise = null;

function getTransporter() {
  if (!transporterPromise) {
    transporterPromise = Promise.resolve(
      nodemailer.createTransport({
        service: "gmail",
        disableFileAccess: true,
        disableUrlAccess: true,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      })
    );
  }
  return transporterPromise;
}

export async function POST(req) {
  const { error } = await requireAdmin();
  if (error) return error;

  if (!process.env.EMAIL_USERNAME || !process.env.EMAIL_PASSWORD) {
    return NextResponse.json(
      { error: "Email service is not configured." },
      { status: 503 }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { recipients, payloadData } = body || {};

  if (!Array.isArray(recipients) || recipients.length === 0 || recipients.length > 100) {
    return NextResponse.json(
      { error: "No recipients provided" },
      { status: 400 }
    );
  }
  if (
    typeof payloadData?.subject !== "string" ||
    typeof payloadData?.body !== "string" ||
    !payloadData.subject.trim() ||
    !payloadData.body.trim() ||
    payloadData.subject.length > 200 ||
    payloadData.body.length > 50000 ||
    /[\r\n]/.test(payloadData.subject)
  ) {
    return NextResponse.json(
      { error: "Subject and body are required" },
      { status: 400 }
    );
  }

  const isValidRecipient = (recipient) =>
    recipient &&
    typeof recipient === "object" &&
    typeof recipient.Email === "string" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient.Email.trim()) &&
    isAllowedStudentEmail(recipient.Email);

  if (!recipients.every(isValidRecipient)) {
    return NextResponse.json(
      { error: "Recipients must be valid official student email addresses" },
      { status: 400 }
    );
  }

  try {
    const transporter = await getTransporter();

    // Send all emails concurrently with per-recipient personalisation.
    const results = await Promise.allSettled(
      recipients.map(async (recipient) => {
        // Resolve the canonical department name from slug or stored name.
        const dept =
          DEPARTMENTS_BY_SLUG[recipient.departmentSlug] ||
          DEPARTMENTS.find(
            (d) => d.name === recipient.Department
          );
        const deptName = dept ? dept.name : recipient.Department || "GDG";

        const html = String(payloadData.body)
          .replace(/#name/g, recipient.Name || "there")
          .replace(/#dept/g, deptName);

        await transporter.sendMail({
          from: process.env.EMAIL_USERNAME,
          to: recipient.Email.trim().toLowerCase(),
          subject: payloadData.subject.trim(),
          html,
        });
      })
    );

    const sent = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    if (failed > 0) {
      console.error(
        "Some emails failed:",
        results.filter((r) => r.status === "rejected").map((r) => r.reason)
      );
    }

    return NextResponse.json(
      { message: `Emails sent: ${sent} successful, ${failed} failed.`, sent, failed },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error sending emails:", err);
    return NextResponse.json(
      { error: "Failed to send emails" },
      { status: 500 }
    );
  }
}
