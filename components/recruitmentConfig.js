// Public, client-safe recruitment values. The server recruitment window is
// authoritative for whether applications can be submitted. The landing-page
// countdown is intentionally a rolling demo/display timer for now.
export const RECRUITMENT_START_AT_PUBLIC =
  process.env.NEXT_PUBLIC_RECRUITMENT_START_AT || "2026-08-01T00:00:00+05:30";
export const ROLLING_COUNTDOWN_TARGET = "rolling-15-days";
export const RECRUITMENT_END_AT_PUBLIC = ROLLING_COUNTDOWN_TARGET;

// Client-safe allowed email domains (mirrors server VIT_EMAIL_DOMAINS).
export const VIT_DOMAINS_PUBLIC = (
  process.env.NEXT_PUBLIC_VIT_EMAIL_DOMAINS || "vitstudent.ac.in,vit.ac.in"
)
  .split(",")
  .map((d) => d.trim().toLowerCase())
  .filter(Boolean);
