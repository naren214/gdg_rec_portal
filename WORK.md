# Work Log

## GDG on Campus · VIT Chennai Recruitment Portal

This document records the implementation work represented in the current `main` branch relative to the initial project upload. It is intentionally more detailed than the README: the README explains the product; this file explains the engineering decisions, fixes, and additions.

## 1. Product and user-flow work

### Reworked the applicant journey

- Reorganised the public experience around a clear sequence: understand GDG, browse departments, choose up to two, and complete the application.
- Added a dedicated recruitment landing page with a hero section, recruitment status/countdown, department discovery, process explanation, statistics band, call to action, and responsive navigation.
- Added a dedicated department browsing experience with technical/non-technical grouping, department descriptions, stable department links, and a clear selection state.
- Reworked the join route so selected department slugs drive the form instead of fragile display names or old identifier values.
- Added a not-found state for invalid department paths and a clear sign-in state when a student reaches the application flow without an authenticated session.

### Made the form resilient to interruption

- Added debounced local draft persistence to `components/FormComp.jsx`.
- Namespaced draft keys by selected department slugs so drafts do not collide across different application combinations.
- Restored saved values when the student returns to the form.
- Removed the local draft after a successful submission.
- Kept the final write authoritative on the server; local storage is only a convenience for the browser.

## 2. Application correctness and data integrity

### Fixed the response-storage bug

The earlier submit flow did not persist the complete answer set reliably. Common answers, gender, and year of study could be collected in the form but omitted from the Firestore document. Department answers were also too dependent on editable question text.

The submission route now:

- Stores common responses under stable IDs such as `whyJoin`, `githubUrl`, and `linkedinUrl`.
- Stores department responses under the selected department slug.
- Persists `Gender` and `YearOfStudy` along with the rest of the application.
- Ignores unknown response keys instead of allowing arbitrary fields into the stored shape.
- Validates required answers before writing anything.
- Applies length caps to text and URL fields.
- Normalises the session email and registration number before storage.

### Added server-side validation

The browser validates for user experience, but the route handler is the final authority. It validates:

- authenticated session presence;
- allowed VIT email domain;
- recruitment-window status;
- known department slug;
- full name length;
- registration-number format;
- exactly ten phone digits;
- object-shaped common and department response maps;
- required common and department answers;
- `http`/`https` URL protocols for GitHub and LinkedIn links.

### Replaced fragile department identifiers with slugs

The department catalogue now exposes stable slugs such as `web-dev`, `app-dev`, and `data-science`. The same slugs are used in URLs, duplicate checks, response storage, admin filters, and the application lock document. This prevents a display-label or generated-ID change from breaking existing application lookups.

### Made the two-application limit atomic

The old read-then-write pattern could allow two concurrent requests to both pass the duplicate/limit check. The new flow:

1. Hashes the normalised applicant email for the lock-document ID.
2. Reads the applicant lock and existing application records in a Firestore transaction.
3. Rejects a duplicate department.
4. Rejects a third application.
5. Writes the application and updates the lock in the same transaction.

The lock is read even for a first-time applicant, so concurrent first submissions for the same person conflict instead of both creating records.

## 3. Authentication and authorisation

### Restricted account creation to official student domains

- Added a central server-side configuration module in `lib/config.js`.
- Enforced the allowed-domain rule in Better Auth's `databaseHooks.user.create` hook.
- Applied the same rule to email/password and Google OAuth sign-up paths.
- Added a client-side domain hint for faster feedback; it does not replace server validation.

### Added real admin route protection

Created `lib/auth-guard.js` with reusable `requireUser()` and `requireAdmin()` checks. The following operations now require server-side admin authorisation:

- listing applicants;
- changing shortlist state;
- sending recruitment email.

The check accepts either the persisted admin role or an email in the server-side `ADMIN_EMAILS` allow-list. Client-side role flags are treated as UI state only and are not trusted for access control.

### Removed applicant-data exposure from the page render

The admin page no longer receives applicant records through an unprotected server render. It requests the data through the protected admin API and renders an explicit access-denied state for non-admin users.

### Tightened session and identity handling

- Applicant email is always derived from the active Better Auth session.
- Applicant-facing checks only query the current user's records.
- Sessions are configured for a seven-day lifetime with daily refresh and a one-day cookie cache to reduce unnecessary Firestore writes.
- Local development trusts both common localhost ports without changing the production origin configuration.

## 4. Firestore and operational security

- Changed Firestore rules to deny direct client reads and writes.
- Kept database access behind the Firebase Admin SDK and server-only route handlers.
- Added environment-driven recruitment start/end timestamps instead of relying on a hard-coded deadline.
- Centralised email-domain, admin, date-window, and application-limit configuration.
- Added defensive checks for malformed request bodies and invalid email content/header newlines.
- Cached reusable Firebase/Firestore and mailer instances where appropriate.
- Used single-field reads/queries where possible to avoid unnecessary composite-index requirements.

## 5. Admin workflow

Reworked `components/DataTable.jsx` into a practical review surface:

- total and shortlisted applicant statistics;
- search by applicant information;
- department filtering;
- shortlist-status filtering;
- newest-first application ordering;
- full response viewer;
- shortlist toggle with feedback;
- CSV export using the shared column definition;
- email composer integration;
- responsive table and detail presentation.

The admin response viewer reads the stable common-response and department-response maps, so the dashboard stays aligned with the data written by the submission route.

## 6. UI and accessibility work

- Replaced the earlier visual treatment with a restrained Google-inspired palette: blue, red, yellow, and green used as signals rather than as a background wash.
- Added self-hosted Product Sans files so builds do not depend on Google Fonts being available.
- Built reusable landing-page sections and premium interaction primitives for reveal motion, count-up statistics, spotlight cards, section headings, marquees, and action buttons.
- Added responsive navigation and mobile-friendly application/admin layouts.
- Added inline form states, loading states, toast feedback, empty states, not-found handling, and access-denied handling.
- Added visible focus treatment and `prefers-reduced-motion` support in the global stylesheet.
- Removed render-time busy-work loops, fake telemetry state, unstable random React keys, and missing event-listener cleanup from the hot path.

The visual additions are kept separate from the security and data rules: animation can be reduced or removed without changing the application contract.

## 7. Testing and verification

Added a route-level integration harness under `scripts/`:

- `scripts/harness.mjs` provides an in-memory Firestore/auth test environment.
- `scripts/register.mjs` maps project aliases and supplies test-time module wiring.
- `scripts/setup-env.mjs` provides safe test configuration.
- `scripts/integration.test.mjs` executes the real route handlers.

The suite currently covers 30 checks across:

- unauthenticated and non-VIT submissions;
- malformed registration and phone values;
- unknown departments and missing responses;
- common response, gender, and year persistence;
- unknown-key filtering and session-email normalisation;
- invalid URLs;
- concurrent submissions;
- duplicate and third-application rejection;
- per-user isolation;
- applicant-facing data isolation;
- anonymous/non-admin/admin applicant access;
- shortlist validation and updates;
- email-recipient validation and header-injection protection.

Verification run during this documentation update:

```text
npm test  → 30 checks passed
```

`npm run lint` is part of the repository verification commands. A production build also requires `BETTER_AUTH_URL` to be a single valid URL; if a local `.env.local` contains multiple comma-separated origins, set it to one origin for the build. The application code already keeps the additional localhost origin in Better Auth's `trustedOrigins` list for local development.

## 8. Main files changed or introduced

| Area | Files |
| --- | --- |
| Product pages | `app/page.jsx`, `app/(pages)/departments/page.jsx`, `app/(pages)/join/[...joinIds]/page.jsx` |
| Authentication | `app/auth/signin/page.jsx`, `app/auth/signout/page.jsx`, `lib/auth.js`, `lib/auth-guard.js`, `lib/config.js` |
| Applicant APIs | `app/api/submit-form/route.js`, `app/api/check-applications/route.js`, `app/api/check-department-submission/route.js`, `app/api/recruitment-status/route.js` |
| Admin APIs | `app/api/admin/applicants/route.js`, `app/api/shortlist/[id]/route.js`, `app/api/send-email/route.js` |
| UI system | `app/globals.css`, `components/sections/*`, `components/premium/*`, `components/NavBar.jsx`, `components/Footer.jsx` |
| Applicant form | `components/FormComp.jsx`, `components/SubmissionsProvider.jsx`, `components/common/CountdownTimer.jsx` |
| Admin dashboard | `components/DataTable.jsx`, `components/MailComposer.jsx` |
| Shared configuration | `constants/index.js`, `components/recruitmentConfig.js`, `.env.example`, `firestore.rules` |
| Verification | `scripts/harness.mjs`, `scripts/register.mjs`, `scripts/setup-env.mjs`, `scripts/integration.test.mjs` |

## 9. Deliberate boundaries and next improvements

The current implementation is intentionally focused on the recruitment workflow. Practical next steps would be:

- add CI to run lint, tests, and a build on every pull request;
- add an audit trail for shortlist changes and outbound email events;
- add pagination/server-side filtering when the applicant collection grows;
- move draft persistence to an encrypted or account-scoped mechanism if cross-device resume becomes a requirement;
- replace the display-only rolling countdown with an explicitly configured public countdown if the product needs the landing timer to mirror the recruitment window exactly.

These are follow-up improvements, not prerequisites for the current student application and admin review flow.
