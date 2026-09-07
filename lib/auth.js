import { betterAuth } from "better-auth";
import { firestoreAdapter } from "better-auth-firestore";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { nextCookies } from "better-auth/next-js";
import { admin } from "better-auth/plugins";
import { isAdminEmail, isAllowedStudentEmail } from "./config";

const firebaseProjectId =
  process.env.FIREBASE_PROJECT_ID || "demo-gdg-recruitment";
const firebaseClientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const firebasePrivateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(
  /\\n/g,
  "\n"
);

const appOptions = { projectId: firebaseProjectId };
if (firebaseClientEmail && firebasePrivateKey) {
  appOptions.credential = cert({
    projectId: firebaseProjectId,
    clientEmail: firebaseClientEmail,
    privateKey: firebasePrivateKey,
  });
}

const app = getApps().length > 0 ? getApps()[0] : initializeApp(appOptions);
const firestore = getFirestore(app);

// Google OAuth is only enabled when both credentials are present.
const googleEnabled = Boolean(
  process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.ENABLE_GOOGLE_AUTH !== "false"
);

// Static generation imports the auth configuration before runtime secrets are
// available in a local build. Use a build-only placeholder; a real production
// request still requires BETTER_AUTH_SECRET.
const authSecret =
  process.env.BETTER_AUTH_SECRET ||
  (process.env.NEXT_PHASE === "phase-production-build"
    ? "build-only-secret-do-not-use-at-runtime"
    : undefined);

export const auth = betterAuth({
  secret: authSecret,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  database: firestoreAdapter({ firestore }),
  // Session tuning reduces Firestore write volume (cost optimisation):
  // 7-day sessions, 1-day cookie cache, update at most once a day.
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24,
    },
  },
  emailAndPassword: {
    enabled: true,
    // Block sign-up for emails outside the allowed (VIT) domains.
    requireEmailVerification: false,
  },
  socialProviders: googleEnabled
    ? {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        },
      }
    : undefined,
  databaseHooks: {
    user: {
      create: {
        before: async (userData) => {
          const email = userData?.email;

          // Enforce VIT email restriction for ALL sign-up paths
          // (email/password and Google OAuth alike).
          if (!isAllowedStudentEmail(email)) {
            throw new Error(
              "Only official VIT student email addresses are allowed. Please use your @vitstudent.ac.in / @vit.ac.in email."
            );
          }

          // Auto-promote club-admin emails to the admin role.
          const role = isAdminEmail(email) ? "admin" : "user";
          return { data: { ...userData, role } };
        },
      },
      // Ensure admins keep their role even for accounts that predate the
      // ADMIN_EMAILS allow-list.
      update: {
        before: async (userData) => {
          if (userData?.email && isAdminEmail(userData.email)) {
            return { data: { ...userData, role: "admin" } };
          }
          return { data: userData };
        },
      },
    },
  },
  plugins: [
    admin({
      defaultRole: "user",
      adminRoles: ["admin"],
    }),
    nextCookies(), // must be the last plugin
  ],
});
