// ============================================================
// Central server-side configuration parsed from environment vars.
// Keeping this in one place avoids scattered/hardcoded values.
// ============================================================

// Recruitment window — configured in Vercel via env vars so the club
// never has to redeploy to change the dates.
const parseDate = (value, fallback) => {
  const date = new Date(value || fallback);
  return Number.isNaN(date.getTime()) ? new Date(fallback) : date;
};

// Safe local-development fallbacks. Production must provide both values in
// Vercel so an old fallback can never accidentally reopen recruitment.
export const RECRUITMENT_START_AT = parseDate(
  process.env.RECRUITMENT_START_AT,
  "2026-08-01T00:00:00+05:30"
);

export const RECRUITMENT_END_AT = parseDate(
  process.env.RECRUITMENT_END_AT,
  "2026-08-31T23:59:59+05:30"
);

// Admin email allow-list (comma separated in the env).
export const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

// Allowed student email domains (comma separated). Defaults to VIT domains.
export const VIT_EMAIL_DOMAINS = (
  process.env.VIT_EMAIL_DOMAINS || "vitstudent.ac.in,vit.ac.in"
)
  .split(",")
  .map((domain) => domain.trim().toLowerCase())
  .filter(Boolean);

export const isAdminEmail = (email) =>
  typeof email === "string" && ADMIN_EMAILS.includes(email.trim().toLowerCase());

// Returns true when an email's domain is in the allowed list.
export const isAllowedStudentEmail = (email) => {
  if (!email || typeof email !== "string") return false;
  const domain = email.trim().split("@")[1]?.toLowerCase().trim();
  return !!domain && VIT_EMAIL_DOMAINS.includes(domain);
};

export const isRecruitmentOpen = (now = new Date()) =>
  now >= RECRUITMENT_START_AT && now <= RECRUITMENT_END_AT;

export const MAX_APPLICATIONS_PER_USER = 2;
