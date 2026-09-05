"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Globe,
  Smartphone,
  Palette,
  Cloud,
  BrainCircuit,
  Code2,
  Gamepad2,
  Blocks,
  PenTool,
  Handshake,
  Megaphone,
  Users,
  Check,
  ArrowRight,
  Lock,
} from "lucide-react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { DEPARTMENTS } from "@/constants";
import { useSubmissions } from "@/components/SubmissionsProvider";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

const ICONS = {
  Globe,
  Smartphone,
  Palette,
  Cloud,
  BrainCircuit,
  Code2,
  Gamepad2,
  Blocks,
  PenTool,
  Handshake,
  Megaphone,
  Users,
};

const DepartmentCard = ({
  dept,
  selected,
  submitted,
  disabled,
  onToggle,
  index,
}) => {
  const Icon = ICONS[dept.icon] || Globe;

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className="group relative text-left rounded-3xl p-6 transition-all duration-300 rise-in disabled:cursor-not-allowed"
      style={{
        animationDelay: `${index * 0.04}s`,
        background: selected
          ? `linear-gradient(135deg, ${dept.color}14, ${dept.color}05)`
          : "rgba(255,255,255,0.7)",
        backdropFilter: "blur(16px)",
        border: selected
          ? `2px solid ${dept.color}`
          : "1px solid rgba(20,24,60,0.08)",
        boxShadow: selected
          ? `0 18px 40px ${dept.color}33`
          : "0 10px 30px rgba(31,45,102,0.08)",
        opacity: disabled && !submitted ? 0.55 : 1,
      }}
    >
      {/* accent blob */}
      <span
        className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"
        style={{ background: dept.color }}
      />

      <div className="flex items-start justify-between">
        <span
          className="flex items-center justify-center w-12 h-12 rounded-2xl text-white shadow-lg transition-transform group-hover:scale-110"
          style={{ background: dept.color, boxShadow: `0 10px 22px ${dept.color}55` }}
        >
          {submitted ? <Lock size={22} /> : <Icon size={22} />}
        </span>

        <span
          className="flex items-center justify-center w-7 h-7 rounded-full border-2 transition-all"
          style={{
            borderColor: submitted || selected ? dept.color : "#c9cfdd",
            background: submitted || selected ? dept.color : "transparent",
          }}
        >
          {(submitted || selected) && <Check size={15} className="text-white" />}
        </span>
      </div>

      <h3 className="mt-4 text-lg font-bold tracking-tight flex items-center gap-2">
        {dept.name}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-[#54596b]">
        {dept.description}
      </p>

      <div className="mt-4">
        <span
          className="text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full"
          style={{ background: `${dept.color}18`, color: dept.color }}
        >
          {dept.category}
        </span>
        {submitted && (
          <span className="ml-2 text-xs font-semibold text-[#34A853]">
            Applied
          </span>
        )}
      </div>
    </button>
  );
};

const DepartmentsListPage = () => {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const { submittedSlugs } = useSubmissions();
  const [selected, setSelected] = useState([]);

  const submittedSet = useMemo(() => new Set(submittedSlugs), [submittedSlugs]);
  const remainingSlots = Math.max(0, 2 - submittedSet.size);

  const toggle = (slug) => {
    if (submittedSet.has(slug)) {
      toast.info("You've already applied to this department.");
      return;
    }
    setSelected((cur) => {
      if (cur.includes(slug)) return cur.filter((s) => s !== slug);
      if (cur.length >= remainingSlots) {
        toast.error(`You can select at most ${remainingSlots} department(s).`);
        return cur;
      }
      return [...cur, slug];
    });
  };

  const continueToForm = () => {
    if (!selected.length) return;
    if (!session?.user) {
      toast.info("Please sign in to continue.");
      router.push("/auth/signin");
      return;
    }
    router.push(`/join/${selected.join("/")}`);
  };

  const technical = DEPARTMENTS.filter((d) => d.category === "technical");
  const nonTechnical = DEPARTMENTS.filter((d) => d.category === "non-technical");

  return (
    <main className="min-h-screen flex flex-col">
      <NavBar />

      <section className="flex-1 px-5 sm:px-8 max-w-6xl mx-auto w-full pt-10 pb-40">
        <div className="text-center rise-in">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#4285F4]">
            Step 01 · Select
          </p>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mt-2">
            Pick your <span className="text-gradient">departments</span>
          </h1>
          <p className="mt-4 text-[#54596b] max-w-xl mx-auto">
            Choose up to <strong>two</strong> teams you would like to join. You
            can always apply to more later — as long as you have not already
            applied to them.
          </p>
        </div>

        {[
          { title: "Technical", list: technical },
          { title: "Non-technical", list: nonTechnical },
        ].map((group) => (
          <div key={group.title} className="mt-12">
            <h2 className="text-xl font-bold mb-5 flex items-center gap-3">
              <span className="w-1.5 h-6 rounded-full" style={{ background: "linear-gradient(#4285F4,#34A853)" }} />
              {group.title}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {group.list.map((dept, i) => (
                <DepartmentCard
                  key={dept.slug}
                  dept={dept}
                  index={i}
                  selected={selected.includes(dept.slug)}
                  submitted={submittedSet.has(dept.slug)}
                  disabled={
                    !submittedSet.has(dept.slug) &&
                    selected.length >= remainingSlots &&
                    !selected.includes(dept.slug)
                  }
                  onToggle={() => toggle(dept.slug)}
                />
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* Sticky action bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 px-4 pb-5">
        <div className="glass-strong max-w-6xl mx-auto rounded-2xl px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-sm font-medium text-[#54596b]">
            {selected.length === 0 ? (
              <>Select up to <strong className="text-[#1a1c22]">2</strong> departments</>
            ) : (
              <>
                <strong className="text-[#1a1c22]">{selected.length}</strong> of{" "}
                {remainingSlots} slot{remainingSlots === 1 ? "" : "s"} selected
              </>
            )}
          </div>
          <button
            type="button"
            onClick={continueToForm}
            disabled={!selected.length}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed enabled:hover:scale-105"
            style={{ background: "linear-gradient(135deg,#4285F4,#34A853)" }}
          >
            Continue to application <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </main>
  );
};

export default DepartmentsListPage;
