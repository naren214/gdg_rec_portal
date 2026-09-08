# Work Log

## GDG on Campus · VIT Chennai Recruitment Portal

This is the detailed engineering record for the work represented by the current
`main` branch. It describes the project from the initial upload through the
backend correction, UI redesign, deployment preparation, and verification work.
The README is the user-facing guide; this file preserves the reasoning behind
the implementation and the boundaries that still matter.

## 1. Starting point: the initial portal

The initial commit already contained a working recruitment-portal concept:

- Next.js App Router pages for the landing page, departments, join flow, sign-in,
  admin, and sign-out.
- Better Auth backed by a Firestore adapter.
- Firebase Admin/Firestore access through server code.
- Applicant and admin API routes for submission, retrieval, shortlist updates,
  and email sending.
- A large collection of UI components, including the original department cards,
  table, dialogs, filters, animated components, and theme components.
- A Firestore `formData` collection and a two-application product rule.

The starting implementation also had important weaknesses:

1. The submission path destructured `Questions` and then wrote with
   `collection.add()`. The alternate legacy server action/model also spread
   arbitrary fields into a new document. There was no single enforced response
   contract.
2. Common answers, gender, and year-of-study values could be present in the
   browser form but not appear in the stored application in the expected shape.
3. Duplicate and maximum-application checks used a read-then-write sequence.
   Concurrent requests could both pass the checks.
4. The deadline was hard-coded in the route.
5. Several sensitive admin operations were not consistently protected by a
   server-side admin check.
6. Department identity was more tightly coupled to display values and older
   identifiers than it needed to be.
7. The original UI contained dead components, fake telemetry/busy-loop logic,
   unstable random keys, and a visually inconsistent flow.

The later work kept the useful product behavior but replaced the risky data and
authorization paths instead of treating the client UI as a security boundary.

## 2. Timeline of the implementation

### Initial upload — `b33d4fe`

The repository was uploaded with the original recruitment portal, its Firebase
configuration, its first applicant/admin flows, and its initial design system.
At this point the package used Next.js 14 and React 18, and both the newer route
handler and older action/model patterns existed in the repository.

### Core overhaul — `a4a65f2`

This was the main correctness and security pass. It:

- Repaired the response-storage path.
- Added a stable response schema keyed by question IDs.
- Added department-specific response validation.
- Made duplicate and two-application checks transactional.
- Added shared `requireUser()`/`requireAdmin()` authorization helpers.
- Restricted account creation and submissions to allowed VIT email domains.
- Moved the applicant email source to the authenticated session.
- Added server-side validation for identity fields, departments, required answers,
  and URLs.
- Replaced hard-coded recruitment-window behavior with environment variables.
- Replaced fragile department identifiers with stable slugs.
- Denied direct client Firestore access through restrictive rules.
- Rebuilt the main applicant, form, and admin UI around a cleaner flow.
- Removed dead components, fake telemetry, busy-loop work, random React keys, and
  unused routes from the active application path.
- Added the first route-level integration harness and test suite.
- Switched dependency installation from the original Bun lockfile to npm with a
  generated `package-lock.json`.

### Interaction and visual system — `72e3de1`

The second pass focused on the product experience without weakening the backend
contract:

- Added reusable components in `components/premium/` for reveal motion,
  count-up statistics, spotlight/tilt cards, section headings, marquees, and
  animated buttons.
- Rebuilt the landing page from composed sections: hero, stats, how-it-works,
  department showcase, and call to action.
- Added Google-color signals, restrained surfaces, responsive layouts, and
  self-hosted Product Sans.
- Added motion to department cards, the sticky selection action bar, the form,
  sign-in page, and admin rows.
- Added focus treatment, loading and empty states, not-found/access-denied
  states, and reduced-motion handling.

### Prefinal hardening — `4346e40`

The prefinal pass aligned the code with the current runtime and deployment
shape:

- Updated the runtime stack to Next.js `16.3.4` and React `19.2.8`.
- Updated Better Auth, Firestore adapter, Firebase Admin, Nodemailer, and
  related dependencies.
- Moved linting to the repository's ESLint configuration.
- Added Google OAuth configuration and the sign-in button while keeping it
  disabled unless credentials are configured.
- Added client-safe environment mirrors for email-domain and display-date hints.
- Tightened email validation, recipient limits, subject/body length limits,
  header-newline protection, and SMTP transport settings.
- Added more integration coverage for current-user isolation, department status,
  shortlist payload validation, invalid email recipients, and header injection.
- Improved Next.js 16 dynamic route-param compatibility and build behavior.
- Added the production-oriented `engines` declaration requiring Node.js 20.9+.

### Vercel preparation — `90282a3`

The deployment pass addressed the remaining local/production differences:

- Made the Better Auth base URL handling explicit.
- Added trusted localhost origins for local development while keeping the
  configured production origin authoritative.
- Added the Google OAuth callback instructions and final-origin guidance.
- Improved the sign-out flow so it does not redirect before a failed sign-out
  completes.
- Polished the post-submission success state and form behavior.
- Adjusted the build configuration for constrained local/CI machines.
- Removed the temporary cursor-trail experiment before final deployment.

### Redeploy trigger — `ec006cc`

This commit was used to trigger a deployment refresh. It did not introduce a
new application feature.

### Previous documentation pass — `720b529`

The repository documentation was expanded with a README and this work log. The
current update corrects documentation that had drifted from the final source,
especially around the response schema and build state.

## 3. Final applicant architecture

### Landing and discovery

`app/page.jsx` composes the landing page from reusable sections:

- `LandingHero` — primary message, recruitment call to action, and visual system.
- `StatsBand` — animated product/recruitment facts.
- `HowItWorks` — four-step explanation of the application journey.
- `DepartmentsShowcase` — department preview and navigation.
- `CallToAction` — final route into department selection.

`app/(pages)/departments/page.jsx` groups the 12 configured departments into
technical and community categories. It uses stable slugs, disables already
submitted departments, tracks remaining slots, and routes selections to the
join page.

### Join route and form

`app/(pages)/join/[...joinIds]/page.jsx`:

- Resolves one or two department slugs.
- Shows a recoverable invalid-department state for unknown slugs.
- Shows an explicit sign-in-required state for anonymous visitors.
- Passes valid department definitions to `FormComp`.

`components/FormComp.jsx`:

- Uses React Hook Form.
- Creates one shared response map for common questions.
- Creates a department-keyed response map for each selected department.
- Saves drafts in `localStorage` under a department-selection-specific key.
- Restores a draft when the same selection is reopened.
- Submits each pending department independently and reports successes and
  failures separately.
- Marks successful departments in `SubmissionsProvider`.
- Clears the draft after successful submission and keeps the form mounted for a
  retry when another selected department fails.

`components/SubmissionsProvider.jsx` obtains application status from the
authenticated user's own endpoint. It is client state for navigation and UX;
the API rechecks the session and email ownership on every request.

## 4. Response-storage correction

### Original failure mode

The original route accepted a `Questions` object and wrote a flexible document
using an auto-generated Firestore ID. The older `form.action.js` and
`form.modal.ts` paths also represented different data shapes. This created three
problems:

- The stored response shape depended on which caller submitted the form.
- Common responses and profile fields could be collected but omitted or stored
  inconsistently.
- The admin viewer and CSV path could not rely on one canonical set of keys.

### Final contract

`app/api/submit-form/route.js` is the active canonical write path. It writes:

- Profile fields: `Name`, session-derived `Email`, `RegistrationNumber`,
  `Phone`, `Gender`, and `YearOfStudy`.
- Department identity: `departmentSlug` and display `Department`.
- Common answers under `Responses` using `whyJoin`, `githubUrl`, and
  `linkedinUrl`.
- Department answers under `DepartmentResponses[departmentSlug]` using the
  stable department-question IDs.
- `shortlisted: false` and `createdAt`.

Unknown response keys are ignored. Known answers are trimmed and length-capped.
Required answers are checked before any database write. The admin response
viewer and CSV formatter consume these same maps.

### Important reconciliation with the supplied summary

The supplied project summary mentioned a canonical `Questions` object and a
deterministic application-document ID derived from `email:department`. That is
not what exists in the current repository at `HEAD`. After inspecting the route,
tests, and admin components, the accurate final design is:

- canonical `Responses` and `DepartmentResponses` maps;
- generated IDs for `formData` application documents;
- a hashed per-applicant lock document plus a transaction for duplicate and
  quota protection.

This work log intentionally documents the code that is actually present rather
than repeating those stale details.

## 5. Atomic duplicate and quota protection

The original code performed a query, checked the result, and then called
`add()`. That is unsafe when two requests arrive close together.

The final submission route:

1. Normalises the session email.
2. Hashes it with SHA-256 for the `applicationLocks` document ID.
3. Reads the applicant lock and the applicant's existing `formData` documents
   in the same Firestore transaction.
4. Builds the submitted department set from both the lock and existing records.
5. Rejects a duplicate department.
6. Rejects the request when the count is already two.
7. Writes the application document and updates the lock in the same transaction.

The lock is read even for a first-time applicant. That means concurrent first
submissions contend on the same transaction document instead of both observing
an empty query and creating over-limit records.

## 6. Authentication and authorization

`lib/auth.js` configures Better Auth with:

- Firestore persistence through `better-auth-firestore`;
- seven-day sessions;
- daily session refresh and a one-day cookie cache;
- email/password authentication;
- optional Google OAuth;
- account linking for trusted Google sign-in;
- a database hook that rejects non-VIT email domains;
- automatic admin-role assignment for configured admin emails.

`lib/auth-guard.js` exposes:

- `getSessionUser()` for the current authenticated user;
- `requireUser()` for applicant-protected handlers;
- `requireAdmin()` for applicant-list, shortlist, and email operations.

The client role flag is not trusted for authorization. The admin page can show
an access-denied state, but the API still rejects a non-admin even if the client
is modified manually.

Applicant-facing endpoints compare a requested email with the normalised session
email before querying Firestore. This prevents a signed-in user from using the
status or legacy retrieval endpoints to inspect another applicant's records.

## 7. Validation and operational safety

Server-side validation includes:

- valid session and email format;
- allowed VIT email domain;
- configured recruitment window;
- known department slug;
- full name length;
- registration number matching `two digits + three uppercase letters + four
  digits`;
- exactly ten phone digits;
- plain-object response maps rather than arrays;
- known common and department question IDs;
- required answers with minimum length for department questions;
- `http` and `https` URLs only;
- bounded name, answer, URL, gender, and year-of-study lengths;
- valid boolean shortlist payloads;
- official VIT recipients for coordinator emails;
- email subject newline rejection to prevent header injection;
- email body and subject length limits.

The Firestore rule set denies all browser reads and writes. The Admin SDK is
used only from server code. `lib/db.ts` reuses a Firestore connection in the
warm process and serializes timestamps before returning JSON.

## 8. Admin workflow

`app/(pages)/admin/page.jsx`:

- redirects anonymous users to sign-in;
- loads applicant data only through the protected admin endpoint;
- refreshes the visible dashboard periodically while the tab is visible;
- cleans up the polling interval and visibility listener on unmount;
- displays loading and access-denied states.

`components/DataTable.jsx` provides:

- total, shortlisted, represented-department, and selected-recipient stats;
- search by applicant fields;
- department and shortlist filters;
- checkbox selection;
- response-review dialog for common and department answers;
- shortlist updates through `PATCH /api/shortlist/:id`;
- filtered CSV export with flattened response maps;
- access to the email composer.

`components/MailComposer.jsx` supports `#name` and `#dept` placeholders. The
server validates recipients and sends at most 100 emails per request using
`Promise.allSettled`, returning successful and failed counts. There is no durable
email queue yet.

## 9. Visual and accessibility work

The visual overhaul introduced a consistent Google-inspired system without
turning the recruitment flow into a visual-only experiment:

- Product Sans is self-hosted so builds do not depend on Google Fonts.
- Blue, red, yellow, and green are used as restrained signals.
- Reusable surfaces, field styles, buttons, section headings, and responsive
  spacing are defined in the global CSS and component layers.
- Framer Motion provides reveals, count-ups, selection feedback, success states,
  and table-row transitions.
- The UI includes visible focus states, labels, inline errors, loading states,
  toasts, empty states, and recoverable not-found/access-denied screens.
- `prefers-reduced-motion` support keeps the motion layer optional.

The design layer is deliberately decoupled from the data contract: animations
can be reduced or removed without changing authentication, validation, or
Firestore behavior.

## 10. Verification performed

The repository's real route handlers were tested using the in-memory harness in
`scripts/harness.mjs`. The current suite passes 30 checks, including:

- authentication and VIT-domain rejection;
- malformed registration, phone, department, body, and answer validation;
- persistence of common answers, gender, and year of study;
- unknown-key filtering and email normalisation;
- invalid URL rejection;
- concurrent application-limit protection;
- duplicate and third-application rejection;
- isolation between two student accounts;
- current-user status and retrieval protection;
- anonymous/non-admin/admin applicant-list behavior;
- shortlist authorization, update behavior, and payload validation;
- email authorization, recipient validation, and header-injection protection.

Verification on the current working tree:

```text
npm test       -> 30 checks passed
npm run lint   -> passed
npm run build  -> passed with BETTER_AUTH_URL=http://localhost:3000
```

The first unmodified local build used a `.env.local` value containing two
comma-separated origins. Better Auth correctly rejected that as an invalid base
URL. The source code was not changed for the successful verification; the build
was rerun with a single-origin process override. The repository therefore
requires `BETTER_AUTH_URL` to be one URL in local and Vercel environments.

## 11. Important files

| Area | Files | Responsibility |
| --- | --- | --- |
| Product pages | `app/page.jsx`, `app/(pages)/departments/page.jsx`, `app/(pages)/join/[...joinIds]/page.jsx` | Landing, department selection, and application flow |
| Authentication | `app/auth/signin/page.jsx`, `app/auth/signout/page.jsx`, `lib/auth.js`, `lib/auth-guard.js` | Account flow and server authorization |
| Applicant APIs | `app/api/submit-form/route.js`, `app/api/check-applications/route.js`, `app/api/check-department-submission/route.js`, `app/api/recruitment-status/route.js` | Submission, status, and recruitment-window behavior |
| Admin APIs | `app/api/admin/applicants/route.js`, `app/api/shortlist/[id]/route.js`, `app/api/send-email/route.js` | Protected review, shortlist, and email operations |
| Applicant UI | `components/FormComp.jsx`, `components/SubmissionsProvider.jsx` | Form state, drafts, submission feedback, and status |
| Admin UI | `components/DataTable.jsx`, `components/MailComposer.jsx` | Review, filters, CSV, shortlist, and email actions |
| Shared contract | `constants/index.js`, `lib/config.js`, `components/recruitmentConfig.js` | Departments, question IDs, domains, dates, and limits |
| Persistence | `lib/db.ts`, `firestore.rules` | Firebase Admin connection, serialization, and client-access policy |
| Verification | `scripts/harness.mjs`, `scripts/register.mjs`, `scripts/setup-env.mjs`, `scripts/integration.test.mjs` | Route-level test environment and 30 checks |

## 12. Known limitations and next improvements

These are not claims about work already completed:

1. Add server-side pagination, filtering, and count queries for the admin
   collection instead of loading every applicant into the browser.
2. Add an audit trail for shortlist changes and outbound email events.
3. Add a durable email queue with retry/backoff for larger broadcasts.
4. Revisit draft cleanup for mixed-success submissions if users must leave and
   later resume a partially completed multi-department application.
5. Connect the existing pagination UI primitives if client-side pagination is
   needed before server-side pagination is implemented.
6. Decide whether the landing countdown should mirror the configured recruitment
   end time instead of remaining a rolling display element.
7. Add custom response security headers if required by the final deployment
   policy; the current `next.config.mjs` does not define them.
8. Remove or migrate any unused legacy helper files if a future migration needs
   to preserve old Firestore records. The active browser flow uses the route
   handler and shared constants described above.

## 13. Final implementation boundary

The current branch is a deployment-ready student recruitment portal, not a
general-purpose recruitment platform. Its strongest completed engineering
decisions are:

1. Treat the authenticated session and server validation as authoritative.
2. Store responses under stable question IDs and a consistent schema.
3. Use stable department slugs across the full application.
4. Protect the two-application rule with a Firestore transaction and per-user
   lock document.
5. Keep Firestore inaccessible from the browser.
6. Keep admin review and outbound email behind server-side authorization.
7. Keep the visual layer reusable, responsive, and optional with reduced motion.
8. Verify the actual route handlers instead of only testing UI helpers.
