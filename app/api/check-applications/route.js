import { NextResponse } from "next/server";
import { connect } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { MAX_APPLICATIONS_PER_USER } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }

    const userEmail = String(session.user.email || "").trim().toLowerCase();

    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    if (email.trim().toLowerCase() !== userEmail) {
      return NextResponse.json(
        { message: "You can only check your own applications" },
        { status: 403 }
      );
    }

    const db = await connect();
    const snapshot = await db
      .collection("formData")
      .where("Email", "==", userEmail)
      .select("Department", "departmentSlug")
      .get();

    const submittedDepartments = snapshot.docs
      .map((doc) => doc.data().Department)
      .filter(Boolean);
    const submittedSlugs = snapshot.docs
      .map((doc) => doc.data().departmentSlug)
      .filter(Boolean);

    return NextResponse.json(
      {
        count: snapshot.size,
        maxAllowed: MAX_APPLICATIONS_PER_USER,
        submittedDepartments,
        submittedSlugs,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error checking applications:", error);
    return NextResponse.json(
      { message: "Could not check applications" },
      { status: 500 }
    );
  }
}
