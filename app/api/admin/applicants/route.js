import { NextResponse } from "next/server";
import { connect, serializeFirestoreData } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const db = await connect();
    // Order newest-first for the admin dashboard.
    const snapshot = await db
      .collection("formData")
      .orderBy("createdAt", "desc")
      .get();

    const applicants = snapshot.docs.map((doc) => ({
      id: doc.id,
      _id: doc.id,
      ...serializeFirestoreData(doc.data()),
    }));

    return NextResponse.json({ applicants });
  } catch (err) {
    console.error("Error fetching applicants:", err);
    return NextResponse.json(
      { error: "Failed to fetch applicants" },
      { status: 500 }
    );
  }
}
