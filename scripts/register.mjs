// Node ESM loader that rewrites the "@/..." alias and stubs server-only
// dependencies so the real Next.js route handlers can run under plain Node.
import { pathToFileURL, fileURLToPath } from "node:url";
import { resolve as pathResolve, dirname } from "node:path";
import { existsSync } from "node:fs";

const ROOT = pathResolve(dirname(fileURLToPath(import.meta.url)), "..");

// Resolve a repo-relative path to a real file URL, trying .js / .ts / index.
function resolveFile(rel) {
  const candidates = [
    pathResolve(ROOT, rel, "index.js"),
    pathResolve(ROOT, rel, "index.ts"),
    pathResolve(ROOT, rel + ".js"),
    pathResolve(ROOT, rel + ".ts"),
    pathResolve(ROOT, rel + ".tsx"),
    pathResolve(ROOT, rel),
  ];
  const found = candidates.find((c) => existsSync(c));
  return found || candidates[0];
}

const STUBS = new Set([
  "next/server",
  "next/headers",
  "nodemailer",
  "@/lib/db",
  "@/lib/auth",
  "@/lib/auth-guard",
]);

export async function resolve(specifier, context, nextResolve) {
  if (specifier === "@/test-harness") {
    return nextResolve(
      pathToFileURL(pathResolve(ROOT, "scripts/harness.mjs")).href,
      context
    );
  }

  if (STUBS.has(specifier)) {
    return { url: "stub:" + specifier, shortCircuit: true, format: "module" };
  }

  if (specifier.startsWith("@/")) {
    const rest = specifier.slice(2);
    return nextResolve(pathToFileURL(resolveFile(rest)).href, context);
  }

  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  const out = (source) => ({ format: "module", shortCircuit: true, source });

  if (url === "stub:next/server") {
    return out(`
      export class NextResponse {
        static json(obj, init) {
          return new Response(JSON.stringify(obj), {
            status: (init && init.status) || 200,
            headers: { 'content-type': 'application/json' },
          });
        }
      }
    `);
  }
  if (url === "stub:next/headers") {
    return out(`export const headers = async () => ({});`);
  }
  if (url === "stub:nodemailer") {
    return out(`
      export default { createTransport: () => ({ sendMail: async () => ({}) }) };
    `);
  }
  if (url === "stub:@/lib/db") {
    return out(`export { connect, serializeFirestoreData } from "@/test-harness";`);
  }
  if (url === "stub:@/lib/auth") {
    return out(`
      import { getMockUser } from "@/test-harness";
      export const auth = {
        api: {
          getSession: async () => {
            const u = getMockUser();
            return u ? { user: u } : null;
          },
        },
      };
    `);
  }
  if (url === "stub:@/lib/auth-guard") {
    return out(`
      import { getMockUser } from "@/test-harness";
      import { isAdminEmail } from "@/lib/config";
      const err = (status, message) =>
        new Response(JSON.stringify({ message }), {
          status,
          headers: { "content-type": "application/json" },
        });
      export async function getSessionUser() {
        return getMockUser();
      }
      export async function requireUser() {
        const user = getMockUser();
        if (!user) return { error: err(401, "Authentication required") };
        return { user };
      }
      export async function requireAdmin() {
        const user = getMockUser();
        if (!user) return { error: err(401, "Authentication required") };
        if (!(user.role === "admin" || isAdminEmail(user.email)))
          return { error: err(403, "Forbidden - admin access only") };
        return { user };
      }
    `);
  }

  return nextLoad(url, context);
}
