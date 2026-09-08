# GDG on Campus · VIT Chennai Recruitment Portal

An end-to-end recruitment portal for GDG on Campus, VIT Chennai. Students can
create an account with an allowed VIT email, choose up to two departments, and
submit department-specific applications. Authorised coordinators can review
applications, shortlist applicants, export data, and send personalised emails.

The project was developed from an existing portal and then substantially
overhauled. The important engineering goal was to keep the student experience
simple while enforcing identity, validation, application limits, and admin
access on the server.

## What the portal supports

### Applicants

- Email/password authentication with optional Google OAuth.
- VIT-domain restrictions for account creation and application submission.
- Browse 12 departments: 8 technical and 4 community-focused departments.
- Apply to at most two different departments.
- Complete shared questions plus six department-specific questions.
- Save and restore an interrupted form draft on the current device.
- See already-submitted departments and remaining application slots.
- Receive inline validation, loading, toast, success, and partial-failure states.

### Coordinators

- Protected admin dashboard backed by server-side authorization.
- Newest-first applicant retrieval.
- Search by name, email, registration number, or phone.
- Filter by department and shortlist status.
- Select applicants for email actions.
- Review shared and department-specific responses.
- Shortlist or remove an applicant from the shortlist.
- Export the currently filtered table as CSV.
- Send personalised HTML emails using `#name` and `#dept` placeholders.

## Architecture

The browser communicates with Next.js route handlers. Route handlers authenticate
the request, validate and normalise the input, and then use Firebase Admin SDK
credentials to access Firestore. The browser does not access Firestore directly.

```text
Student or coordinator browser
              │
              ▼
       Next.js App Router
       pages + route handlers
              │
       ┌──────┼───────────┐
       ▼      ▼           ▼
  Better Auth  validation  admin authorization
              │
              ▼
       Firebase Admin SDK
              │
              ▼
          Firestore
```

## Current stack

| Area | Technology |
| --- | --- |
| Framework | Next.js `16.3.4` App Router |
| UI runtime | React `19.2.8` |
| Authentication | Better Auth with the Firestore adapter |
| Database | Cloud Firestore through Firebase Admin SDK |
| Forms | React Hook Form with shared question definitions |
| Styling | Tailwind CSS, custom CSS, self-hosted Product Sans |
| Interaction | Framer Motion, custom premium components, Radix UI, Lucide |
| Export | `react-csv` |
| Email | Nodemailer with Gmail SMTP |
| Deployment target | Vercel |
| Runtime | Node.js `>=20.9.0` |

## Applicant flow

1. The landing page explains GDG and the recruitment process.
2. The student opens the department catalogue.
3. The portal checks the signed-in student's existing applications and disables
   submitted departments.
4. The student selects up to the remaining number of allowed departments.
5. `/join/[...joinIds]` validates the slugs and renders one shared form for the
   selected departments.
6. The browser submits each pending department application independently to
   `POST /api/submit-form`.
7. Successful and failed department submissions are shown separately. The form
   remains available for retry when a submission fails.

The client-side form improves usability, but it is not the source of truth. The
server repeats the important checks before writing anything.

## Data model

Applications are stored in the `formData` collection. Each application document
uses a generated Firestore document ID and contains a stable response shape:

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
  "createdAt": "<Firestore timestamp>"
}
```

Question IDs are stable machine keys, so stored responses do not depend on the
editable wording of a question. Department slugs are also used consistently in
URLs, validation, status checks, duplicate checks, filters, and storage.

Each applicant also has an `applicationLocks/{sha256(normalizedEmail)}`
document. It stores the application count and submitted department slugs without
placing the raw email in the lock document ID. The lock and the application
query are read and updated in one Firestore transaction.

## Data integrity and security

The canonical write path is `POST /api/submit-form`. It:

- Requires a Better Auth session.
- Uses the normalised email from the session, never an email supplied in the
  request body.
- Requires an allowed VIT email domain.
- Enforces the configured recruitment window.
- Validates the department slug, name, registration number, phone number,
  response object shapes, required answers, and URL protocols.
- Keeps only known response keys and caps answer lengths.
- Rejects duplicate department applications.
- Rejects a third application.
- Performs the duplicate and two-application checks inside a transaction so
  concurrent requests cannot bypass the limit.

Authentication and authorization are enforced on the server:

- `lib/auth.js` configures Better Auth, Firestore persistence, sessions, email
  and password auth, and optional Google OAuth.
- Account creation is blocked outside the configured VIT domains.
- Admin emails are assigned the admin role during account creation.
- `requireAdmin()` accepts the persisted admin role or a server-side
  `ADMIN_EMAILS` allow-list.
- Admin applicant, shortlist, and email endpoints reject unauthenticated and
  non-admin requests.
- Applicant-facing status and submission routes can only return the current
  user's records.
- `firestore.rules` denies all direct client reads and writes. Server routes use
  the Admin SDK, which is intentionally separate from browser access.
- Firestore timestamps are converted to JSON-safe ISO strings before API
  responses.

## Routes

### Pages

| Route | Purpose | Access |
| --- | --- | --- |
| `/` | Landing page and recruitment overview | Public |
| `/auth/signin` | Sign in or create an account | Public |
| `/auth/signout` | Sign out and return home | Signed-in user |
| `/departments` | Browse and choose departments | Public UI; submission state is authenticated |
| `/join/[...joinIds]` | Complete applications for selected slugs | Signed-in student |
| `/admin` | Review and manage applicants | Authenticated admin |

### API endpoints

| Method and route | Purpose | Access |
| --- | --- | --- |
| `POST /api/submit-form` | Validate and persist one department application | Signed-in allowed student |
| `GET /api/check-applications` | Return the current user's count and submitted departments | Signed-in user; own email only |
| `GET /api/check-department-submission` | Check one submitted department | Signed-in user; own email only |
| `GET /api/recruitment-status` | Return the configured public recruitment window and open state | Public |
| `GET /api/get-submissions` | Return the current user's stored applications | Signed-in user; own email only |
| `GET /api/admin/applicants` | Return newest-first applicant records | Admin only |
| `PATCH /api/shortlist/:id` | Update an applicant's shortlist state | Admin only |
| `POST /api/send-email` | Validate and send personalised coordinator emails | Admin only; maximum 100 recipients |
| `GET /api/auth/[...all]` | Better Auth session and account routes | Auth flow |

## Repository guide

```text
app/
  page.jsx                         landing page
  (pages)/departments/             department catalogue and selection
  (pages)/join/[...joinIds]/       application form flow
  (pages)/admin/                   protected admin dashboard
  api/                             server-side route handlers
  auth/                            sign-in and sign-out pages
components/
  sections/                        landing-page sections
  premium/                         reusable motion and interaction primitives
  ui/                              Radix-based UI wrappers
  FormComp.jsx                     applicant form, drafts, and submission retry
  DataTable.jsx                    admin review, filtering, CSV, and shortlist UI
  MailComposer.jsx                 admin email composer
  SubmissionsProvider.jsx          authenticated submission-status state
constants/index.js                 departments and stable question definitions
lib/
  auth.js                          Better Auth and Firestore adapter setup
  auth-guard.js                    reusable user/admin authorization checks
  config.js                        server-side domains, dates, and limits
  db.ts                            Firestore connection and serialization
scripts/
  integration.test.mjs             route-level integration checks
  harness.mjs                      in-memory Firestore/auth test double
  register.mjs                     test-time module wiring
  setup-env.mjs                    safe test configuration
```

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

On Windows PowerShell:

```powershell
npm ci
Copy-Item .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. Edit `.env.local` before using authentication or
Firestore-backed flows.

### Environment variables

Required server variables are documented in `.env.example`:

| Variable | Purpose |
| --- | --- |
| `FIREBASE_PROJECT_ID` | Firebase project ID |
| `FIREBASE_CLIENT_EMAIL` | Firebase service-account email |
| `FIREBASE_PRIVATE_KEY` | Service-account key; preserve `\\n` escapes |
| `BETTER_AUTH_SECRET` | Session secret |
| `BETTER_AUTH_URL` | One valid origin, such as `http://localhost:3000` |
| `VIT_EMAIL_DOMAINS` | Comma-separated allowed student domains |
| `ADMIN_EMAILS` | Comma-separated admin emails |
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

`BETTER_AUTH_URL` must be one origin, not a comma-separated list. During local
development the code trusts both common localhost ports, but Better Auth still
needs a single base URL. `NEXT_PUBLIC_*` values only provide client-side hints;
the server-side values remain authoritative.

### Google OAuth callback

When Google OAuth is enabled, register:

```text
http://localhost:3000/api/auth/callback/google
```

Register the equivalent path on the production domain and set
`BETTER_AUTH_URL` to that production origin.

## Deployment

### Firestore rules

Deploy the restrictive rules before opening applications:

```bash
firebase login
firebase use <firebase-project-id>
firebase deploy --only firestore:rules
```

### Vercel

1. Import the GitHub repository.
2. Use the Next.js framework preset.
3. Use `npm ci` for installation and `npm run build` for the build command.
4. Use Node.js `20.9+`.
5. Add all required variables from `.env.example` in Project Settings.
6. Set `BETTER_AUTH_URL` to the final Vercel origin.

## Verification

```bash
npm test
npm run lint
npm run build
```

The route-level integration suite currently passes 30 checks covering:

- unauthenticated and non-VIT submissions;
- malformed registration and phone values;
- unknown departments and missing answers;
- common, gender, and year-of-study persistence;
- unknown-key filtering and session-email normalisation;
- invalid URL rejection;
- concurrent submissions;
- duplicate and third-application rejection;
- per-user isolation;
- applicant-facing data isolation;
- anonymous, non-admin, and admin applicant access;
- shortlist validation and updates;
- email recipient validation and subject header-injection protection.

For a local production build, keep `BETTER_AUTH_URL` set to one origin. For
example, if a local `.env.local` contains multiple origins, run the build with a
single-origin override in PowerShell:

```powershell
$env:BETTER_AUTH_URL = "http://localhost:3000"
npm run build
```

## Current limitations and follow-up work

- The admin endpoint currently loads the full `formData` collection and applies
  search/filtering in the browser. Server-side pagination and indexed filters
  should be added before the collection becomes large.
- A pagination UI wrapper exists in `components/ui`, but the current admin table
  does not yet use it.
- The form submits selected departments sequentially. A mixed success/failure
  result remains retryable in the mounted form, but draft cleanup should be
  revisited if cross-navigation recovery for partial submissions is required.
- Email sends are concurrent with `Promise.allSettled`, but there is no durable
  queue, retry worker, or audit log.
- Shortlist changes and email sends are not written to an audit trail.
- The landing-page countdown is a rolling display target. The server's
  `RECRUITMENT_START_AT` and `RECRUITMENT_END_AT` values, exposed through
  `/api/recruitment-status`, control whether submissions are accepted.
- The current branch denies direct Firestore access but does not add a separate
  custom security-header policy in `next.config.mjs`; add one if the deployment
  requires headers beyond the platform defaults.

## Documentation

- `README.md` explains the product, architecture, setup, and current behavior.
- `WORK.md` is the detailed engineering record from the initial upload through
  the current deployment-ready branch.
