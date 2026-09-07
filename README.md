# GDG Recruitment Portal

A Next.js 16 recruitment portal for a **Google Developer Groups** campus club.
Applicants sign in with their official student email, pick up to two of twelve
departments, and answer common plus department-specific questions. Admins review applications,
shortlist candidates, export CSV and email shortlisted applicants.

Data is stored in **Cloud Firestore** and accessed **exclusively server-side**
via the Firebase **Admin SDK** (the web client never talks to Firestore
directly). Authentication uses [Better Auth](https://www.better-auth.com/) with
the Firestore adapter.

---

## Quick start

```bash
npm ci                 # install from package-lock.json
cp .env.example .env.local   # fill in the values below
npm run dev            # http://localhost:3000
```

Other commands:

```bash
npm run lint           # ESLint (next/core-web-vitals)
npm run build          # production build
npm test               # backend integration tests (in-memory Firestore)
```

> Self-hosting note: fonts are **self-hosted** (`Product Sans` in
> `public/assets/fonts`) so the build never depends on Google Fonts being
> reachable at build time — faster and offline-friendly.

---

## Environment variables

Set these in Vercel → Project → Settings → Environment Variables.

**Required**

| Variable | Purpose |
| --- | --- |
| `FIREBASE_PROJECT_ID` | Firebase project id |
| `FIREBASE_CLIENT_EMAIL` | Admin SDK service-account email |
| `FIREBASE_PRIVATE_KEY` | Admin SDK private key (keep the `\n` escapes) |
| `BETTER_AUTH_SECRET` | Auth session secret (`openssl rand -base64 32`) |
| `BETTER_AUTH_URL` | Final Vercel URL, e.g. `https://your-app.vercel.app` |
| `VIT_EMAIL_DOMAINS` | Comma-separated allowed email domains |
| `ADMIN_EMAILS` | Comma-separated club-admin emails |
| `RECRUITMENT_START_AT` | ISO timestamp when applications open |
| `RECRUITMENT_END_AT` | ISO timestamp when applications close |

**Optional**

`ENABLE_GOOGLE_AUTH`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`,
`EMAIL_USERNAME`, `EMAIL_PASSWORD` (Nodemailer/Gmail app password).

Optional client-exposed mirrors used for client-side hints:
`NEXT_PUBLIC_VIT_EMAIL_DOMAINS`, `NEXT_PUBLIC_RECRUITMENT_START_AT`. The
landing-page countdown currently shows a rolling 15-day display timer; the
server-side `RECRUITMENT_START_AT` and `RECRUITMENT_END_AT` values still
control application availability.

For production Google sign-in, set `ENABLE_GOOGLE_AUTH=true` and register the
Better Auth callback URL for the final Vercel domain with Google OAuth.

---

## Firebase setup

1. Create a Firebase project and enable **Cloud Firestore**. Authentication is
   handled by Better Auth using Firestore; Firebase Authentication is not used.
2. Create a **service account** (Project Settings → Service Accounts) and add
   its project id / client email / private key to Vercel.
3. Deploy the locked-down rules (client access blocked, all access is via Admin
   SDK which bypasses rules):

```bash
firebase login
firebase use <firebase-project-id>
firebase deploy --only firestore:rules
```

## Vercel setup

Connect the GitHub repo. Framework **Next.js**, install `npm ci`, build
`npm run build`, output automatic, Node.js **20.9+**. Add the environment
variables above, setting `BETTER_AUTH_URL` to the final production URL.

---

## Data model (`formData` collection)

Each application document:

```jsonc
{
  "Name": "Jane Doe",
  "Email": "jane@vitstudent.ac.in",      // from session, never request body
  "RegistrationNumber": "25BCE5612",
  "Phone": "9876543210",
  "Gender": "Female",
  "YearOfStudy": "2nd year",
  "departmentSlug": "web-dev",            // stable key, used for lookups
  "Department": "Web Development",        // canonical display name
  "Responses": {                          // common questions, by stable id
    "whyJoin": "...",
    "githubUrl": "",
    "linkedinUrl": ""
  },
  "DepartmentResponses": {                // keyed by stable department slug
    "web-dev": {
      "interest": "...",
      "experience": "...",
      "toolsSkills": "...",
      "problemSolving": "...",
      "collaboration": "...",
      "contribution": "..."
    }
  },
  "shortlisted": false,
  "createdAt": "<timestamp>"
}
```

Each applicant also has one private `applicationLocks/{sha256(email)}` document
containing the application count and department slugs. It is read and updated
inside the submission transaction so concurrent first submissions cannot bypass
the duplicate or maximum-two checks. The email itself is never used as the
lock document ID.

---

## Notable fixes & improvements

### 🐛 The hidden backend bug — responses were never stored
The original submit handler built the answers object from
`QuestionnaireData.find(...)` keyed by the (junk) department-specific question
text, but the **common "Why do you want to join…?"** answer — and the
**Gender** / **Year of Study** fields — were collected in the form and never
included in the payload written to Firestore. So the headline question's answer
(and, once department questions were removed, *every* answer) was silently
discarded. Responses are now stored under a stable `Responses` map keyed by
question id, every field is persisted, and required answers are validated on
the server.

### 🔐 Security
- **Admin APIs had zero server-side authorization** — `/api/admin/applicants`,
  `/api/shortlist/[id]` and `/api/send-email` were open to anyone. All are now
  gated by `requireAdmin()` (session role **and** `ADMIN_EMAILS` allow-list,
  checked server-side).
- The admin page no longer server-renders applicant data; it fetches from the
  protected API and shows an access-denied state for non-admins.
- **Firestore rules now deny all client access** (was `allow read, write: if
  true`).
- **VIT email restriction** enforced in a Better Auth `databaseHooks.user.create`
  hook so it covers email/password **and** Google sign-up; also hinted client-side.
- Email is always taken from the session (can't spoof another applicant's data).
- Admins are auto-promoted based on `ADMIN_EMAILS`.

### ⚙️ Server correctness & cost
- **Race condition** in "already applied / max 2" checks (read-then-write) is
  fixed with a Firestore **transaction** plus a per-applicant lock document,
  preventing duplicate/over-limit docs from concurrent requests, including a
  user's first simultaneous submissions.
- Hard-coded deadline replaced with `RECRUITMENT_START_AT/END_AT` env vars.
- Server-side validation (reg-no, phone, department, required answers, length
  caps, and GitHub/LinkedIn URL protocols).
- Department-specific answers are validated and stored under a stable slug so
  selected departments never overwrite one another.
- Departments identified by stable **slugs** instead of fragile UUIDs (many of
  which pointed at the wrong department).
- Single-field queries avoid extra composite indexes (less cost/ops burden).
- Better Auth session tuning (7-day expiry, 1-day cookie cache, daily update)
  cuts Firestore writes; transporter + Admin/Firestore instances are cached.

### ⚡ Client performance & best practices
- Removed large **junk hot-path code**: busy-work loops (200k–300k iterations)
  that ran on every render of the home/hero/footer/form/admin/departments
  pages, plus fake "telemetry" state and missing event-listener cleanups.
- Removed `Math.random()` React `key`s that forced remounts, and dead
  components/routes.
- Static pages where possible, fonts self-hosted, `cache: "no-store"` only where
  data must be fresh, draft autosave debounced.
- Cleaner shared state via the `SubmissionsProvider` (tracks slugs + names).

### 🎨 UI/UX
- Full visual redesign with the **Google palette** (blue `#4285F4`, red
  `#EA4335`, yellow `#FBBC04`, green `#34A853`).
- Animated aurora **background**, dot grid, gradient text, animated conic
  Google-ring buttons, Google-dot loader.
- **Glassmorphism** cards/nav and **neumorphism** controls/stat tiles.
- Polished home/hero with live countdown, department picker with a sticky
  action bar, a single shared application form with inline validation and
  draft saving, and a redesigned admin dashboard (stat cards, search, filters,
  response viewer, CSV export, email composer).
- Mobile responsive nav/menus and `prefers-reduced-motion` support.

### 🧪 Tests
`npm test` runs the **real route handlers** against an in-memory Firestore
(30 checks): auth, VIT-domain enforcement, validation, response storage,
concurrent duplicate/limit protection, per-user isolation, shortlisting, and
admin email authorization.

The test double serializes transactions so the concurrent-submission test
models Firestore conflict handling instead of allowing a false positive.

Before deployment, run `npm audit --omit=dev` and review any remaining
transitive Firebase Admin advisories; Firebase CLI advisories are development
tooling and do not ship in the Vercel runtime bundle.
