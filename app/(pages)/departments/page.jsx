"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, CheckCircle2, Cloud, Code2, Gamepad2, Globe, Handshake, LayoutGrid, Lock, Megaphone, Palette, PenTool, Smartphone, Users, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import PremiumButton from "@/components/premium/Button";
import { DEPARTMENTS } from "@/constants";
import { useSubmissions } from "@/components/SubmissionsProvider";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

const ICONS = { Globe, Smartphone, Palette, Cloud, Code2, Gamepad2, Handshake, Megaphone, PenTool, Users };

function SignalRule() { return <div className="signal-rule" aria-hidden="true"><span /><span /><span /><span /></div>; }

function DepartmentCard({ dept, selected, submitted, disabled, onToggle, index }) {
  const Icon = ICONS[dept.icon] || LayoutGrid;
  const stateText = submitted ? "Applied" : selected ? "Selected" : "Select team";
  return (
    <motion.button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.38, delay: (index % 3) * 0.045, ease: [0.16, 1, 0.3, 1] }}
      className={`neu-surface neu-surface--interactive group relative flex min-h-64 flex-col overflow-hidden p-5 text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#1a73e8]/20 disabled:cursor-not-allowed ${
        selected || submitted ? "neu-surface--selected" : ""
      } ${disabled && !submitted ? "opacity-45" : ""}`}
    >
      <div className="flex items-start justify-between gap-4">
        <span className="text-sm font-bold tabular-nums text-[#80868b]">{String(index + 1).padStart(2, "0")}</span>
        <span className="neu-icon flex h-10 w-10 items-center justify-center rounded-full" style={{ color: dept.color }}>
          {submitted ? <Lock size={17} aria-hidden="true" /> : <Icon size={18} aria-hidden="true" />}
        </span>
      </div>
      <h2 className="mt-8 text-2xl font-bold tracking-[-0.045em]">{dept.name}</h2>
      <p className="mt-3 text-sm leading-relaxed text-[#5f6368]">{dept.description}</p>
      <div className="mt-auto flex items-center justify-between border-t border-[#dadce0] pt-4">
        <span className="text-xs font-semibold text-[#5f6368]">{dept.category === "technical" ? "Technical" : "Community"}</span>
        <span className="inline-flex items-center gap-1.5 text-sm font-bold" style={{ color: selected || submitted ? dept.color : "#202124" }}>{(selected || submitted) && <Check size={15} aria-hidden="true" />}{stateText}</span>
      </div>
    </motion.button>
  );
}

export default function DepartmentsListPage() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const {
    submittedSlugs,
    submittedDepartments,
    recentSubmission,
    clearRecentSubmission,
  } = useSubmissions();
  const [selected, setSelected] = useState([]);
  const [dismissedSubmissionKey, setDismissedSubmissionKey] = useState(null);
  const submittedSet = useMemo(() => new Set(submittedSlugs), [submittedSlugs]);
  const remainingSlots = Math.max(0, 2 - submittedSet.size);
  const submissionNotice = recentSubmission || (
    submittedSet.size > 0
      ? { names: submittedDepartments }
      : null
  );
  const submissionNoticeKey = recentSubmission?.createdAt
    ? `recent-${recentSubmission.createdAt}`
    : `submitted-${submittedSlugs.join("|")}`;

  const toggle = (slug) => {
    if (submittedSet.has(slug)) return toast.info("You have already applied to this department.");
    setSelected((current) => {
      if (current.includes(slug)) return current.filter((value) => value !== slug);
      if (current.length >= remainingSlots) { toast.error(`You can select at most ${remainingSlots} department(s).`); return current; }
      return [...current, slug];
    });
  };

  const continueToForm = () => {
    if (!selected.length) return;
    if (!session?.user) { toast.info("Please sign in to continue."); router.push("/auth/signin"); return; }
    router.push(`/join/${selected.join("/")}`);
  };
  const groups = [
    { title: "Technical departments", note: "Build products, systems, interfaces, and ideas.", list: DEPARTMENTS.filter((department) => department.category === "technical") },
    { title: "Community departments", note: "Shape how the club communicates, collaborates, and grows.", list: DEPARTMENTS.filter((department) => department.category === "non-technical") },
  ];

  return (
    <main className="min-h-screen">
      <NavBar />
      <AnimatePresence>
        {submissionNotice && dismissedSubmissionKey !== submissionNoticeKey && (
          <motion.section
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12, transition: { duration: 0.2 } }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="container-x pt-10 sm:pt-14"
            aria-live="polite"
          >
            <div className="relative overflow-hidden rounded-[1.75rem] border border-[#dadce0] bg-white shadow-[0_18px_50px_rgba(60,64,67,0.10)]">
              <div className="flex h-1.5" aria-hidden="true">
                <motion.span initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.7 }} className="flex-1 origin-left bg-[#4285F4]" />
                <motion.span initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.7, delay: 0.1 }} className="flex-1 origin-left bg-[#EA4335]" />
                <motion.span initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.7, delay: 0.2 }} className="flex-1 origin-left bg-[#FBBC04]" />
                <motion.span initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.7, delay: 0.3 }} className="flex-1 origin-left bg-[#34A853]" />
              </div>

              <button
                type="button"
                aria-label="Dismiss application submitted message"
                className="absolute right-4 top-5 rounded-full p-2 text-[#80868b] transition-colors hover:bg-[#f1f3f4] hover:text-[#202124] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#1a73e8]/20"
                onClick={() => {
                  setDismissedSubmissionKey(`submitted-${submittedSlugs.join("|")}`);
                  clearRecentSubmission();
                }}
              >
                <X size={18} aria-hidden="true" />
              </button>

              <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
                <div className="px-6 py-8 sm:px-10 sm:py-10">
                  <div className="flex items-start gap-4">
                    <motion.div
                      initial={{ scale: 0.6, rotate: -10, opacity: 0 }}
                      animate={{ scale: 1, rotate: 0, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 230, damping: 16, delay: 0.15 }}
                      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#e6f4ea] text-[#188038] shadow-[inset_4px_4px_10px_rgba(24,128,56,0.08),inset_-4px_-4px_10px_rgba(255,255,255,0.9)]"
                    >
                      <CheckCircle2 size={30} strokeWidth={1.8} aria-hidden="true" />
                    </motion.div>
                    <div className="pr-8">
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#188038]">Application submitted</p>
                      <h2 className="mt-2 text-3xl font-bold leading-none tracking-[-0.055em] text-[#202124] sm:text-4xl">You’re officially in.</h2>
                      <p className="mt-4 max-w-xl text-sm leading-6 text-[#5f6368] sm:text-base">
                        Your application{submissionNotice.names.length > 1 ? "s have" : " has"} been received. Thank you for taking the time to share what you want to learn and build.
                      </p>
                    </div>
                  </div>

                  <div className="mt-7 flex flex-wrap gap-2">
                    {submissionNotice.names.map((name, index) => (
                      <motion.span
                        key={`${name}-${index}`}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.35, delay: 0.45 + index * 0.1 }}
                        className="inline-flex items-center gap-2 rounded-full bg-[#e6f4ea] px-3.5 py-2 text-sm font-bold text-[#188038]"
                      >
                        <CheckCircle2 size={15} aria-hidden="true" />
                        {name}
                      </motion.span>
                    ))}
                  </div>
                </div>

                <div className="border-t border-[#dadce0] bg-[#f8f9fa] px-6 py-8 sm:px-10 sm:py-10 lg:border-l lg:border-t-0">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#80868b]">What happens next</p>
                  <div className="mt-5 space-y-4">
                    <div className="flex gap-3">
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#202124] text-xs font-bold text-white">1</span>
                      <p className="text-sm leading-5 text-[#3c4043]">The team will review your application carefully.</p>
                    </div>
                    <div className="flex gap-3">
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#202124] text-xs font-bold text-white">2</span>
                      <p className="text-sm leading-5 text-[#3c4043]">Keep an eye on your VIT email for updates.</p>
                    </div>
                  </div>
                  <p className="mt-7 text-xs leading-5 text-[#80868b]">You can still explore the other departments below, but submitted applications cannot be changed.</p>
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
      <section className="page-intro"><div className="container-x"><SignalRule /><h1 className="page-title">Choose the work you want to get better at.</h1><p className="page-subtitle">Select up to two departments. Your selections stay editable until you continue to the application.</p></div></section>
      <section className="container-x pb-40 pt-14 sm:pt-20">
        {groups.map((group) => (
          <div key={group.title} className="mb-20 last:mb-0">
            <div className="mb-7 flex flex-col gap-2 border-b border-[#202124] pb-5 sm:flex-row sm:items-end sm:justify-between"><h2 className="text-3xl font-bold tracking-[-0.045em]">{group.title}</h2><p className="text-sm text-[#5f6368]">{group.note}</p></div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {group.list.map((dept, index) => <DepartmentCard key={dept.slug} dept={dept} index={index} selected={selected.includes(dept.slug)} submitted={submittedSet.has(dept.slug)} disabled={!submittedSet.has(dept.slug) && selected.length >= remainingSlots && !selected.includes(dept.slug)} onToggle={() => toggle(dept.slug)} />)}
            </div>
          </div>
        ))}
      </section>
      <AnimatePresence>
        <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15, duration: 0.35, ease: [0.16, 1, 0.3, 1] }} className="fixed inset-x-0 bottom-0 z-40 px-3 pb-3 pt-2 sm:px-5 sm:pb-5">
          <div className="container-x glass-panel flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5"><div><p className="text-sm font-bold">{selected.length} of {remainingSlots} available teams selected</p><p className="mt-0.5 text-xs text-[#5f6368]">{selected.length ? "Continue when your choices feel right." : "Select the teams you want to apply to."}</p></div><PremiumButton onClick={continueToForm} disabled={!selected.length} className="w-full sm:w-auto">Continue to application <ArrowRight size={17} aria-hidden="true" /></PremiumButton></div>
        </motion.div>
      </AnimatePresence>
      <Footer />
    </main>
  );
}
