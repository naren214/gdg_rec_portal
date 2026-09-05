// Loaded before tests via --import. Sets env vars so the real server logic
// runs with the recruitment window open, an admin defined, and email enabled.
process.env.BETTER_AUTH_SECRET = "test_secret_0123456789abcdef";
process.env.BETTER_AUTH_URL = "http://localhost:3000";
process.env.FIREBASE_PROJECT_ID = "demo-gdg-recruitment";
process.env.VIT_EMAIL_DOMAINS = "vitstudent.ac.in,vit.ac.in";
process.env.ADMIN_EMAILS = "admin@vitstudent.ac.in";
// Wide-open window so tests don't depend on the current date.
process.env.RECRUITMENT_START_AT = "2000-01-01T00:00:00+05:30";
process.env.RECRUITMENT_END_AT = "2100-01-01T00:00:00+05:30";
// Nodemailer is stubbed; these just need to be present to pass the guard.
process.env.EMAIL_USERNAME = "test@example.com";
process.env.EMAIL_PASSWORD = "stub-password";
