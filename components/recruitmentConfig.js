// Public, client-safe recruitment window. Mirrors the server env vars with
// safe fallbacks so pages can render the countdown without server fetches.
export const RECRUITMENT_START_AT_PUBLIC =
  process.env.NEXT_PUBLIC_RECRUITMENT_START_AT || "2026-08-01T00:00:00+05:30";
export const RECRUITMENT_END_AT_PUBLIC =
  process.env.NEXT_PUBLIC_RECRUITMENT_END_AT || "2026-08-31T23:59:59+05:30";

// Client-safe allowed email domains (mirrors server VIT_EMAIL_DOMAINS).
export const VIT_DOMAINS_PUBLIC = (
  process.env.NEXT_PUBLIC_VIT_EMAIL_DOMAINS || "vitstudent.ac.in,vit.ac.in"
)
  .split(",")
  .map((d) => d.trim().toLowerCase())
  .filter(Boolean);
