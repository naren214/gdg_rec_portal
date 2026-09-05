"use client";

import React, { useEffect, useState } from "react";
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

  const load = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      const res = await fetch("/api/admin/applicants", { cache: "no-store" });
      if (res.status === 401 || res.status === 403) {
        setAuthError(res.status);
        setApplicants([]);
      } else if (res.ok) {
        const data = await res.json();
        setApplicants(data.applicants || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isPending) return;
    if (!session?.user) {
      router.push("/auth/signin");
      return;
    }
    if (session.user.role !== "admin") {
      setAuthError(403);
      setLoading(false);
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPending, session]);

  const isAdmin = session?.user?.role === "admin";

  return (
    <main className="min-h-screen flex flex-col">
      <NavBar />

      <section className="flex-1 px-4 sm:px-6 py-10 max-w-6xl mx-auto w-full">
        {isPending || loading ? (
          <GDGLoader label="Loading applicants…" />
        ) : authError === 403 || !isAdmin ? (
          <div className="flex flex-col items-center justify-center text-center py-24 rise-in">
            <div className="glass-strong rounded-3xl p-10 max-w-md">
              <ShieldCheck size={52} className="mx-auto text-[#EA4335]" />
              <h2 className="text-2xl font-bold mt-4">Access denied</h2>
              <p className="mt-2 text-[#54596b]">
                You need administrator privileges to view this page.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6 rise-in">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight">
                  Admin <span className="text-gradient">dashboard</span>
                </h1>
                <p className="text-[#54596b] text-sm mt-1">
                  {applicants.length} application{applicants.length === 1 ? "" : "s"} received
                </p>
              </div>
              <button
                onClick={load}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full neu neu-press text-sm font-semibold"
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
