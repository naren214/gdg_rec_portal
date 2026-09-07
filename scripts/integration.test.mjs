import assert from "node:assert";
import { POST as submitPost } from "../app/api/submit-form/route.js";
import { GET as applicantsGet } from "../app/api/admin/applicants/route.js";
import { PATCH as shortlistPatch } from "../app/api/shortlist/[id]/route.js";
import { POST as emailPost } from "../app/api/send-email/route.js";
import { GET as checkApps } from "../app/api/check-applications/route.js";
import { GET as getSubmissions } from "../app/api/get-submissions/route.js";
import { GET as checkDepartment } from "../app/api/check-department-submission/route.js";
import { setMockUser, resetStore, stores } from "./harness.mjs";
import {
  COMMON_QUESTIONS,
  DEPARTMENTS,
  getDepartmentQuestions,
} from "../constants/index.js";

let passed = 0;
const test = async (name, fn) => {
  try {
    await fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (e) {
    console.error(`  ✗ ${name}\n    ${e.message}`);
    process.exitCode = 1;
  }
};

const req = (body) =>
  new Request("http://localhost/api/submit-form", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

const validBody = (over = {}) => ({
  Name: "Jane Doe",
  RegistrationNumber: "25BCE5612",
  Phone: "9876543210",
  Gender: "Female",
  YearOfStudy: "2nd year",
  departmentSlug: "web-dev",
  Responses: Object.fromEntries(
    COMMON_QUESTIONS.map((q) => [q.id, q.required ? "A solid answer." : ""])
  ),
  DepartmentResponses: Object.fromEntries(
    DEPARTMENTS.map((department) => [
      department.slug,
      Object.fromEntries(
        getDepartmentQuestions(department.name).map((q) => [
          q.id,
          q.required ? "A solid department answer." : "",
        ])
      ),
    ])
  ),
  ...over,
});

const student = { email: "jane@vitstudent.ac.in", role: "user", name: "Jane" };
const otherStudent = { email: "john@vitstudent.ac.in", role: "user", name: "John" };
const admin = { email: "admin@vitstudent.ac.in", role: "admin", name: "Admin" };
const nonVit = { email: "jane@gmail.com", role: "user", name: "Jane" };

console.log("\n== submit-form: auth ==");
await test("rejects unauthenticated submit (401)", async () => {
  resetStore();
  setMockUser(null);
  const res = await submitPost(req(validBody()));
  assert.equal(res.status, 401);
});

await test("rejects authenticated non-VIT user (403)", async () => {
  resetStore();
  setMockUser(nonVit);
  const res = await submitPost(req(validBody()));
  assert.equal(res.status, 403);
});

console.log("\n== submit-form: validation ==");
await test("rejects bad registration number (400)", async () => {
  resetStore();
  setMockUser(student);
  const res = await submitPost(req(validBody({ RegistrationNumber: "BAD" })));
  assert.equal(res.status, 400);
  const j = await res.json();
  assert.match(j.message, /Registration number/);
});

await test("rejects bad phone (400)", async () => {
  resetStore();
  setMockUser(student);
  const res = await submitPost(req(validBody({ Phone: "123" })));
  assert.equal(res.status, 400);
});

await test("rejects unknown department (400)", async () => {
  resetStore();
  setMockUser(student);
  const res = await submitPost(req(validBody({ departmentSlug: "nope" })));
  assert.equal(res.status, 400);
});

await test("rejects missing required answer (400)", async () => {
  resetStore();
  setMockUser(student);
  const body = validBody();
  body.Responses.whyJoin = "  ";
  const res = await submitPost(req(body));
  assert.equal(res.status, 400);
  const j = await res.json();
  assert.match(j.message, /want to join/i);
});

console.log("\n== submit-form: RESPONSE STORAGE (hidden bug) ==");
await test("STORES common answers, Gender & YearOfStudy (the fixed bug)", async () => {
  resetStore();
  setMockUser(student);
  const res = await submitPost(req(validBody()));
  assert.equal(res.status, 201, await res.text());
  const docs = Object.values(stores.formData);
  assert.equal(docs.length, 1, "one application stored");
  const d = docs[0];
  // The common-question responses must now actually be persisted:
  assert.ok(d.Responses, "Responses map exists");
  assert.equal(d.Responses.whyJoin, "A solid answer.");
  assert.equal(
    d.DepartmentResponses["web-dev"].interest,
    "A solid department answer."
  );
  // Fields that were previously dropped:
  assert.equal(d.Gender, "Female");
  assert.equal(d.YearOfStudy, "2nd year");
  // Email comes from the session, not the body:
  assert.equal(d.Email, "jane@vitstudent.ac.in");
  assert.equal(d.Department, "Web Development");
  assert.equal(d.departmentSlug, "web-dev");
  assert.equal(d.shortlisted, false);
  assert.equal(Object.keys(stores.applicationLocks).length, 1);
  assert.deepEqual(Object.values(stores.applicationLocks)[0].departmentSlugs, ["web-dev"]);
});

await test("ignores unknown response keys and normalizes session email", async () => {
  resetStore();
  setMockUser({ ...student, email: "JANE@VITSTUDENT.AC.IN" });
  const res = await submitPost(
    req(
      validBody({
        Email: "attacker@vitstudent.ac.in",
        Responses: {
          ...validBody().Responses,
          unknownInternalField: "must not be stored",
        },
      })
    )
  );
  assert.equal(res.status, 201);
  const stored = Object.values(stores.formData)[0];
  assert.equal(stored.Email, "jane@vitstudent.ac.in");
  assert.equal(stored.Responses.unknownInternalField, undefined);
});

await test("rejects array-shaped responses (400)", async () => {
  resetStore();
  setMockUser(student);
  const res = await submitPost(req(validBody({ Responses: [] })));
  assert.equal(res.status, 400);
});

await test("rejects missing department-specific responses (400)", async () => {
  resetStore();
  setMockUser(student);
  const res = await submitPost(
    req(validBody({ DepartmentResponses: undefined }))
  );
  assert.equal(res.status, 400);
});

await test("rejects invalid GitHub URLs (400)", async () => {
  resetStore();
  setMockUser(student);
  const responses = validBody().Responses;
  responses.githubUrl = "javascript:alert(1)";
  const res = await submitPost(req(validBody({ Responses: responses })));
  assert.equal(res.status, 400);
});

await test("serializes concurrent submissions without exceeding the limit", async () => {
  resetStore();
  setMockUser(student);
  const responses = await Promise.all(
    ["web-dev", "app-dev", "ui-ux"].map((departmentSlug) =>
      submitPost(req(validBody({ departmentSlug })))
    )
  );
  assert.equal(responses.filter((res) => res.status === 201).length, 2);
  assert.equal(responses.filter((res) => res.status === 400).length, 1);
  assert.equal(Object.keys(stores.formData).length, 2);
});

console.log("\n== submit-form: duplicates & limits ==");
await test("blocks duplicate application to the same department (400)", async () => {
  resetStore();
  setMockUser(student);
  await submitPost(req(validBody()));
  const res = await submitPost(req(validBody()));
  assert.equal(res.status, 400);
  const j = await res.json();
  assert.match(j.message, /already applied/);
});

await test("allows a second, different department", async () => {
  resetStore();
  setMockUser(student);
  await submitPost(req(validBody()));
  const res = await submitPost(req(validBody({ departmentSlug: "app-dev" })));
  assert.equal(res.status, 201);
  assert.equal(Object.keys(stores.formData).length, 2);
});

await test("blocks a THIRD application (max 2)", async () => {
  resetStore();
  setMockUser(student);
  await submitPost(req(validBody()));
  await submitPost(req(validBody({ departmentSlug: "app-dev" })));
  const res = await submitPost(req(validBody({ departmentSlug: "ui-ux" })));
  assert.equal(res.status, 400);
  const j = await res.json();
  assert.match(j.message, /up to 2/);
  assert.equal(Object.keys(stores.formData).length, 2, "no third doc created");
});

await test("applications are isolated per user (two students can both apply to web-dev)", async () => {
  resetStore();
  setMockUser(student);
  await submitPost(req(validBody()));
  setMockUser(otherStudent);
  const res = await submitPost(req(validBody()));
  assert.equal(res.status, 201);
});

console.log("\n== check-applications ==");
await test("returns count + slugs for the signed-in user", async () => {
  resetStore();
  setMockUser(student);
  await submitPost(req(validBody()));
  await submitPost(req(validBody({ departmentSlug: "app-dev" })));
  const url = new URL("http://localhost/api/check-applications");
  url.searchParams.set("email", "jane@vitstudent.ac.in");
  const res = await checkApps(new Request(url));
  assert.equal(res.status, 200);
  const j = await res.json();
  assert.equal(j.count, 2);
  assert.deepEqual(j.submittedSlugs.sort(), ["app-dev", "web-dev"]);
});

await test("forbids checking another user's email (403)", async () => {
  setMockUser(student);
  const url = new URL("http://localhost/api/check-applications");
  url.searchParams.set("email", "john@vitstudent.ac.in");
  const res = await checkApps(new Request(url));
  assert.equal(res.status, 403);
});

await test("returns only the signed-in user's submissions", async () => {
  resetStore();
  setMockUser(student);
  await submitPost(req(validBody()));
  setMockUser(otherStudent);
  await submitPost(req(validBody({ departmentSlug: "app-dev" })));
  setMockUser(student);
  const url = new URL("http://localhost/api/get-submissions");
  url.searchParams.set("email", "JANE@VITSTUDENT.AC.IN");
  const res = await getSubmissions(new Request(url));
  assert.equal(res.status, 200);
  const j = await res.json();
  assert.equal(j.data.length, 1);
  assert.equal(j.data[0].Email, "jane@vitstudent.ac.in");
});

await test("checks a user's department submission without trusting another email", async () => {
  resetStore();
  setMockUser(student);
  await submitPost(req(validBody()));
  const url = new URL("http://localhost/api/check-department-submission");
  url.searchParams.set("email", "jane@vitstudent.ac.in");
  url.searchParams.set("slug", "web-dev");
  const res = await checkDepartment(new Request(url));
  assert.equal(res.status, 200);
  assert.equal((await res.json()).submitted, true);
});

console.log("\n== admin authorization ==");
await test("blocks anonymous applicant list (401)", async () => {
  setMockUser(null);
  const res = await applicantsGet();
  assert.equal(res.status, 401);
});

await test("blocks non-admin from applicant list (403)", async () => {
  setMockUser(student);
  const res = await applicantsGet();
  assert.equal(res.status, 403);
});

await test("admin can list applicants", async () => {
  resetStore();
  setMockUser(student);
  await submitPost(req(validBody()));
  setMockUser(admin);
  const res = await applicantsGet();
  assert.equal(res.status, 200);
  const j = await res.json();
  assert.equal(j.applicants.length, 1);
  assert.equal(j.applicants[0].Responses.whyJoin, "A solid answer.");
});

await test("non-admin cannot shortlist (403)", async () => {
  setMockUser(student);
  const id = Object.keys(stores.formData)[0];
  const res = await shortlistPatch(
    new Request("http://localhost/api/shortlist/" + id, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ shortlisted: true }),
    }),
    { params: { id } }
  );
  assert.equal(res.status, 403);
});

await test("admin can shortlist an applicant", async () => {
  setMockUser(admin);
  const id = Object.keys(stores.formData)[0];
  const res = await shortlistPatch(
    new Request("http://localhost/api/shortlist/" + id, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ shortlisted: true }),
    }),
    { params: { id } }
  );
  assert.equal(res.status, 200);
  const j = await res.json();
  assert.equal(j.data.shortlisted, true);
});

await test("rejects non-boolean shortlist values (400)", async () => {
  setMockUser(admin);
  const id = Object.keys(stores.formData)[0];
  const res = await shortlistPatch(
    new Request("http://localhost/api/shortlist/" + id, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ shortlisted: "false" }),
    }),
    { params: { id } }
  );
  assert.equal(res.status, 400);
});

console.log("\n== send-email authorization ==");
await test("blocks non-admin email send (403)", async () => {
  setMockUser(student);
  const res = await emailPost(
    new Request("http://localhost/api/send-email", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        recipients: [{ Email: "a@b.c", Name: "A", departmentSlug: "web-dev" }],
        payloadData: { subject: "s", body: "Hi #name #dept" },
      }),
    })
  );
  assert.equal(res.status, 403);
});

await test("admin email send returns 200 with personalisation", async () => {
  setMockUser(admin);
  const res = await emailPost(
    new Request("http://localhost/api/send-email", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        recipients: [
          { Email: "jane@vitstudent.ac.in", Name: "Jane", departmentSlug: "web-dev" },
        ],
        payloadData: { subject: "GDG update", body: "<p>Hi #name, dept #dept</p>" },
      }),
    })
  );
  assert.equal(res.status, 200);
  const j = await res.json();
  assert.equal(j.sent, 1);
});

await test("rejects invalid email recipients before sending (400)", async () => {
  setMockUser(admin);
  const res = await emailPost(
    new Request("http://localhost/api/send-email", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        recipients: [{ Email: "outside@example.com", Name: "A", departmentSlug: "web-dev" }],
        payloadData: { subject: "s", body: "Hi" },
      }),
    })
  );
  assert.equal(res.status, 400);
});

await test("rejects email subjects containing header newlines (400)", async () => {
  setMockUser(admin);
  const res = await emailPost(
    new Request("http://localhost/api/send-email", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        recipients: [{ Email: "jane@vitstudent.ac.in", Name: "Jane", departmentSlug: "web-dev" }],
        payloadData: { subject: "bad\nsubject", body: "Hi" },
      }),
    })
  );
  assert.equal(res.status, 400);
});

console.log(`\n${passed} checks passed.\n`);
