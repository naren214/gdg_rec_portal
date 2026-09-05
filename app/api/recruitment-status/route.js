import { NextResponse } from "next/server";
import {
  isRecruitmentOpen,
  RECRUITMENT_START_AT,
  RECRUITMENT_END_AT,
} from "@/lib/config";

export const dynamic = "force-dynamic";

// Public endpoint so the UI can show the countdown / closed state without
// leaking any applicant data.
export async function GET() {
  const now = new Date();
  return NextResponse.json({
    open: isRecruitmentOpen(now),
    startAt: RECRUITMENT_START_AT.toISOString(),
    endAt: RECRUITMENT_END_AT.toISOString(),
    now: now.toISOString(),
  });
}
