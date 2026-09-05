import { NextResponse } from "next/server";
import { connect } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

// Checks whether the signed-in user already applied to a department slug.
// Uses a single-field (Email) query — which needs no composite index — and
// filters the slug in code, keeping Firestore index/cost requirements minimal.
export async function GET(request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const userEmail = session.user.email;
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const slug = searchParams.get("slug");

    if (!email || !slug) {
      return NextResponse.json(
        { error: "Missing email or department slug" },
        { status: 400 }
      );
    }

    if (email.toLowerCase() !== userEmail.toLowerCase()) {
      return NextResponse.json(
        { error: "You can only check your own submissions" },
        { status: 403 }
      );
    }

    const db = await connect();
    const snapshot = await db
      .collection("formData")
      .where("Email", "==", email)
      .select("departmentSlug")
      .get();

    const submitted = snapshot.docs.some(
      (doc) => doc.data().departmentSlug === slug
    );

    return NextResponse.json({ submitted }, { status: 200 });
  } catch (error) {
    console.error("Error checking department submission:", error);
    return NextResponse.json(
      { error: "Database query failed" },
      { status: 500 }
    );
  }
}
