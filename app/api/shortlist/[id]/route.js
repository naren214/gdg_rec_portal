import { NextResponse } from "next/server";
import { connect, serializeFirestoreData } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

export async function PATCH(req, { params }) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { id } = params;
    const body = await req.json().catch(() => ({}));
    const shortlisted = Boolean(body?.shortlisted);

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
    console.error("Error updating applicant:", err.message);
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 400 }
    );
  }
}
