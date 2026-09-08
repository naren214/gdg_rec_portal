# GDG on Campus · VIT Chennai Recruitment Portal

An end-to-end recruitment portal for GDG on Campus, VIT Chennai. It gives students a focused application experience and gives authorised club administrators a reliable way to review, shortlist, export, and contact applicants.

The project is built around one principle: the application should feel simple to a student while remaining careful with identity, data integrity, and administrative access behind the scenes.

## What the portal supports

### For applicants

- Sign up or sign in with an official VIT student email.
- Browse 12 technical and non-technical departments.
- Apply to up to two different departments.
- Complete common and department-specific questions in one guided form.
- Continue from a locally saved draft if the form is interrupted.
- Receive clear validation and submission feedback.

### For administrators

- Access a protected applicant dashboard.
- Search and filter applications by department and shortlist status.
- Open an application and review its complete response set.
- Shortlist or remove an applicant from the shortlist.
- Export application data as CSV.
- Send personalised emails to selected applicants.

## Why the implementation matters

The visible UI is only one part of the project. Recruitment data is identity-sensitive and the important rules must hold even when someone bypasses the browser and calls the API directly.

The portal therefore enforces the core rules on the server:

- The applicant email is taken from the authenticated session, never from the request body.
- VIT email-domain checks apply to every account-creation path.
- The recruitment window is controlled by environment variables.
- Names, registration numbers, phone numbers, URLs, departments, and required answers are validated server-side.
- A Firestore transaction plus a per-applicant lock prevents concurrent requests from creating duplicate or third applications.
- Admin endpoints require a server-side session and an `ADMIN_EMAILS` allow-list/role check.
- Firestore client access is denied; application data is accessed through the Firebase Admin SDK on the server.

## Technical overview

| Area | Choice |
| --- | --- |
| Application | Next.js App Router with React 19 |
| Authentication | Better Auth with email/password and optional Google OAuth |
| Database | Cloud Firestore through the Firebase Admin SDK |
| Styling | Tailwind CSS, custom CSS, Framer Motion, GSAP |
| UI primitives | Radix UI and Lucide icons |
| Email | Nodemailer |
| Hosting target | Vercel |
| Runtime | Node.js 20.9 or newer |

The browser communicates with Next.js route handlers. Route handlers authenticate the request, validate and normalise the data, and then use the server-only Firestore connection. The browser does not connect directly to Firestore.

```text
Student / admin browser
          │
          ▼
Next.js pages + route handlers
          │
          ├── Better Auth session checks
          ├── applicant/admin authorisation
          ├── server-side validation
          └── Firebase Admin SDK
                         │
                         ▼
                   Cloud Firestore
```

## Main routes

| Route | Purpose | Access |
| --- | --- | --- |
| `/` | Landing page and recruitment overview | Public |
| `/auth/signin` | Sign in or create an account | Public |
| `/departments` | Browse departments and choose applications | Signed-in student |
| `/join/[...joinIds]` | Complete an application for the selected department(s) | Signed-in student |
| `/admin` | Review, filter, shortlist, export, and contact applicants | Authorised admin |

The API routes mirror those responsibilities. Applicant-facing routes only return the current user's data; the applicant list, shortlist, and email routes are protected by `requireAdmin()`.

## Data model

Applications are stored in the `formData` collection. The schema uses stable IDs rather than question text, so editing wording does not invalidate stored responses.

```jsonc
{
  "Name": "Jane Doe",
  "Email": "jane@vitstudent.ac.in",
  "RegistrationNumber": "25BCE5612",
  "Phone": "9876543210",
  "Gender": "Female",
  "YearOfStudy": "2nd year",
  "departmentSlug": "web-dev",
  "Department": "Web Development",
  "Responses": {
    "whyJoin": "...",
    "githubUrl": "",
    "linkedinUrl": ""
  },
  "DepartmentResponses": {
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

Each applicant also has an `applicationLocks/{sha256(email)}` document. It records the number of submissions and selected department slugs without putting the raw email in the lock document ID. The lock is read and updated in the same transaction as the application write.

## Run locally

### Requirements

- Node.js `>=20.9.0`
- A Firebase project with Cloud Firestore enabled
- A Firebase service account for server-side access

### Setup

```bash
npm ci
cp .env.example .env.local
npm run dev
```

On Windows PowerShell, the copy step is:

```powershell
Copy-Item .env.example .env.local
```

Open `http://localhost:3000` after the development server starts. Edit `.env.local` before using authentication or Firestore-backed flows.

### Environment variables

Required server variables:

| Variable | Purpose |
| --- | --- |
| `FIREBASE_PROJECT_ID` | Firebase project ID |
| `FIREBASE_CLIENT_EMAIL` | Firebase service-account email |
| `FIREBASE_PRIVATE_KEY` | Service-account private key; preserve `\\n` escapes in `.env` |
| `BETTER_AUTH_SECRET` | Session secret; generate with `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | One valid origin, such as `http://localhost:3000` |
| `VIT_EMAIL_DOMAINS` | Comma-separated permitted student domains |
| `ADMIN_EMAILS` | Comma-separated authorised admin emails |
| `RECRUITMENT_START_AT` | ISO timestamp when applications open |
| `RECRUITMENT_END_AT` | ISO timestamp when applications close |

Optional variables enable Google OAuth and email delivery:

```text
ENABLE_GOOGLE_AUTH
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
EMAIL_USERNAME
EMAIL_PASSWORD
```

The `NEXT_PUBLIC_*` values in `.env.example` are client-safe mirrors for UI hints. The server-side values remain authoritative for access, dates, and authorisation.

### Google OAuth callback

If Google sign-in is enabled, register this callback URL in Google Cloud Console:

```text
http://localhost:3000/api/auth/callback/google
```

Register the equivalent path on the production domain as well.

## Firebase and deployment

Deploy the restrictive Firestore rules:

```bash
firebase login
firebase use <firebase-project-id>
firebase deploy --only firestore:rules
```

For Vercel:

1. Import the GitHub repository.
2. Use the Next.js framework preset.
3. Keep the install command as `npm ci` and the build command as `npm run build`.
4. Use Node.js `20.9+`.
5. Add the required environment variables in Project Settings.
6. Set `BETTER_AUTH_URL` to the final production origin.

## Verification

```bash
npm test       # 30 route-level integration checks
npm run lint   # ESLint
npm run build  # production build
```

The integration suite executes the real route handlers against an in-memory Firestore test double. It covers authentication, VIT-domain enforcement, validation, response persistence, concurrent application limits, per-user isolation, admin authorisation, shortlisting, and email input validation.

Before deployment, run:

```bash
npm audit --omit=dev
```

Review any transitive Firebase Admin advisories separately from development-only Firebase CLI advisories.

## Repository guide

```text
app/
  page.jsx                         landing page
  (pages)/departments/             department selection
  (pages)/join/[...joinIds]/       application form flow
  (pages)/admin/                   protected admin dashboard
  api/                             server-side route handlers
  auth/                            sign-in and sign-out pages
components/
  sections/                        landing-page sections
  premium/                         motion and interaction primitives
  ui/                              reusable Radix-based components
  FormComp.jsx                     application form and draft persistence
  DataTable.jsx                    admin review and action surface
constants/index.js                departments, question IDs, and shared copy
lib/
  auth.js                          Better Auth + Firestore configuration
  auth-guard.js                    user/admin route guards
  config.js                        server-side recruitment configuration
  db.js                            Firestore connection and serialisation
scripts/
  integration.test.mjs             route-level integration tests
  harness.mjs                      in-memory Firestore/auth test harness
```

## Project notes

- `WORK.md` is the detailed engineering record for the changes represented in the current `main` branch.
- The server-side recruitment window controls whether an application can be submitted. The landing-page countdown is a display element and is intentionally not used as an authorisation mechanism.
- No production secrets belong in Git. Use `.env.example` as the configuration contract and keep `.env.local` untracked.
