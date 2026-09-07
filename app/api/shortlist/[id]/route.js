import { NextResponse } from "next/server";
import { connect, serializeFirestoreData } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

export async function PATCH(req, { params }) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const resolvedParams = await params;
    const id = typeof resolvedParams?.id === "string" ? resolvedParams.id.trim() : "";
    if (!id || id.length > 200) {
      return NextResponse.json(
        { success: false, message: "Invalid applicant id" },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { success: false, message: "Invalid request body" },
        { status: 400 }
      );
    }
    if (typeof body.shortlisted !== "boolean") {
      return NextResponse.json(
        { success: false, message: "shortlisted must be a boolean" },
        { status: 400 }
      );
    }
    const shortlisted = body.shortlisted;

    const db = await connect();
    const docRef = db.collection("formData").doc(id);
    const snapshot = await docRef.get();

    if (!snapshot.exists) {
      return NextResponse.json(
        { success: false, message: "Applicant not found" },
        { status: 404 }
      );
    }

    await docRef.update({ shortlisted, updatedAt: new Date() });
    const updated = await docRef.get();

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        _id: updated.id,
        ...serializeFirestoreData(updated.data()),
      },
    });
  } catch (err) {
    console.error("Error updating applicant:", err);
    return NextResponse.json(
      { success: false, message: "Could not update applicant" },
      { status: 500 }
    );
  }
}
