"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, RefreshCw } from "lucide-react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import DataTable from "@/components/DataTable";
import { authClient } from "@/lib/auth-client";
import GDGLoader from "@/components/GDGLoader";

export default function AdminPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const load = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    setAuthError(null);
    try {
      const res = await fetch("/api/admin/applicants", { cache: "no-store" });
      if (res.status === 401 || res.status === 403) {
        setAuthError(res.status);
        setApplicants([]);
      } else if (res.ok) {
        const data = await res.json();
        setApplicants(data.applicants || []);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isPending) return;
    if (!session?.user) {
      router.push("/auth/signin");
      return;
    }
    void Promise.resolve().then(() => load());

    // New applications appear automatically while the admin dashboard is open.
    // Poll only while visible to avoid unnecessary Firestore reads in a hidden
    // tab; returning to the tab triggers an immediate refresh.
    const refreshSilently = () => {
      if (document.visibilityState === "visible") void load({ silent: true });
    };
    const intervalId = window.setInterval(refreshSilently, 10000);
    document.addEventListener("visibilitychange", refreshSilently);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", refreshSilently);
    };
  }, [isPending, session, load, router]);

  return (
    <main className="min-h-screen flex flex-col">
      <NavBar />

      <section className="flex-1 px-4 py-12 sm:px-6 sm:py-16 max-w-6xl mx-auto w-full">
        {isPending || loading ? (
          <GDGLoader label="Loading applicants…" />
        ) : authError === 403 ? (
          <div className="flex flex-col items-center justify-center text-center py-24 rise-in">
            <div className="neu-surface p-10 max-w-md">
              <ShieldCheck size={52} className="mx-auto text-[#202124]" />
              <h2 className="text-2xl font-bold mt-4">Access denied</h2>
              <p className="mt-2 text-[#54596b]">
                You need administrator privileges to view this page.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-10 flex flex-col gap-5 border-b border-[#202124] pb-7 rise-in sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="signal-rule" aria-hidden="true"><span /><span /><span /><span /></div>
                <h1 className="mt-5 text-[clamp(2.8rem,5vw,4.8rem)] font-bold tracking-[-0.06em] leading-none">Applicant review.</h1>
                <p className="text-[#54596b] text-sm mt-1">
                  {applicants.length} application{applicants.length === 1 ? "" : "s"} received
                  {lastUpdated && (
                    <span className="text-[#8a90a2]"> · Updated just now</span>
                  )}
                </p>
              </div>
              <button
                onClick={load}
                className="neu-button inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold text-[#202124]"
              >
                <RefreshCw size={16} /> Refresh
              </button>
            </div>
            <DataTable data={applicants} onChanged={load} />
          </>
        )}
      </section>

      <Footer />
    </main>
  );
}
