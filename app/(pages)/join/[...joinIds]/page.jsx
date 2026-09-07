"use client";

import React, { use } from "react";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import FormComp from "@/components/FormComp";
import GDGLoader from "@/components/GDGLoader";
import { authClient } from "@/lib/auth-client";
import { DEPARTMENTS_BY_SLUG, DEPARTMENTS } from "@/constants";

const JoinDepartmentPage = ({ params }) => {
  // Next.js 16 provides dynamic route params as a Promise. The fallback keeps
  // this page compatible with object-shaped params in older local tooling.
  const resolvedParams =
    params && typeof params.then === "function" ? use(params) : params;
  const joinIds = resolvedParams?.joinIds || [];
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const slugs = Array.isArray(joinIds) ? joinIds.slice(0, 2) : [];
  const departments = slugs.map((s) => DEPARTMENTS_BY_SLUG[s]).filter(Boolean);

  // Bad slug -> 404 content (computed directly from route params).
  const notFound =
    slugs.length === 0 || departments.length !== slugs.length;

  if (isPending) {
    return (
      <main className="min-h-screen">
        <NavBar />
        <GDGLoader label="Loading application…" />
        <Footer />
      </main>
    );
  }

  if (notFound) {
    return (
      <main className="min-h-screen flex flex-col">
        <NavBar />
        <div className="flex-1 flex items-center justify-center px-5">
          <div className="data-surface rounded-[1.125rem] p-10 text-center max-w-md rise-in">
            <h2 className="text-2xl font-bold">Department not found</h2>
            <p className="mt-2 text-[#54596b]">
              That department does not exist or may have been removed.
            </p>
            <button
              onClick={() => router.push("/departments")}
              className="mt-6 inline-flex min-h-12 items-center rounded-full bg-[#202124] px-6 text-sm font-semibold text-white hover:bg-[#3c4043]"
            >
              Browse departments
            </button>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  const user = session?.user;

  return (
    <main className="min-h-screen flex flex-col">
      <NavBar />
      {user ? (
        <FormComp
          departments={departments}
          submittedSlugs={departments.map((d) => d.slug)}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center px-5">
          <div className="data-surface rounded-[1.125rem] p-10 text-center max-w-md rise-in">
            <h2 className="text-2xl font-bold">Sign in required</h2>
            <p className="mt-2 text-[#54596b]">
              Please sign in with your VIT email to access the application form.
            </p>
            <button
              onClick={() => router.push("/auth/signin")}
              className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#202124] px-6 text-sm font-semibold text-white hover:bg-[#3c4043]"
            >
              <LogIn size={18} /> Sign in
            </button>
          </div>
        </div>
      )}
      <Footer />
    </main>
  );
};

export default JoinDepartmentPage;
