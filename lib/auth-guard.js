import { auth } from "./auth";
import { headers } from "next/headers";
import { isAdminEmail } from "./config";

// Returns the session user or null.
export async function getSessionUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
}

// Requires a signed-in user. Returns { user } or { error: NextResponse }.
export async function requireUser() {
  const user = await getSessionUser();
  if (!user) {
    return {
      error: new Response(
        JSON.stringify({ message: "Authentication required" }),
        {
          status: 401,
          headers: { "content-type": "application/json" },
        }
      ),
    };
  }
  return { user };
}

// Requires a signed-in ADMIN.
// Authorization is enforced server-side — the client role flag is only UI.
export async function requireAdmin() {
  const user = await getSessionUser();
  if (!user) {
    return {
      error: new Response(
        JSON.stringify({ message: "Authentication required" }),
        {
          status: 401,
          headers: { "content-type": "application/json" },
        }
      ),
    };
  }

  const roleOk = user.role === "admin" || isAdminEmail(user.email);
  if (!roleOk) {
    return {
      error: new Response(
        JSON.stringify({ message: "Forbidden — admin access only" }),
        {
          status: 403,
          headers: { "content-type": "application/json" },
        }
      ),
    };
  }
  return { user };
}
