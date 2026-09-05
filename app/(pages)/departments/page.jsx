"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Globe, Smartphone, Palette, Cloud, BrainCircuit, Code2, Gamepad2,
  Blocks, PenTool, Handshake, Megaphone, Users, Check, ArrowRight,
  Lock, Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import PremiumButton from "@/components/premium/Button";
import SectionHeading from "@/components/premium/SectionHeading";
import { DEPARTMENTS } from "@/constants";
import { useSubmissions } from "@/components/SubmissionsProvider";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

const ICONS = {
  Globe, Smartphone, Palette, Cloud, BrainCircuit, Code2, Gamepad2,
  Blocks, PenTool, Handshake, Megaphone, Users,
};

const DepartmentCard = ({ dept, selected, submitted, disabled, onToggle, index }) => {
  const Icon = ICONS[dept.icon] || Globe;

  return (
    <motion.button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      initial={{ opacity: 0, y: 26, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.07, ease: [0.22, 1, 0.36, 1] }}
      whileHover={disabled ? undefined : { y: -6 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      className="relative text-left rounded-3xl p-6 transition-colors duration-300 disabled:cursor-not-allowed h-full"
      style={{
        background: selected
          ? `linear-gradient(135deg, ${dept.color}16, ${dept.color}05)`
          : "rgba(255,255,255,0.72)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        border: selected ? `2px solid ${dept.color}` : "1px solid rgba(20,24,60,0.08)",
        boxShadow: selected
          ? `0 22px 50px ${dept.color}33`
          : "0 12px 34px rgba(31,45,102,0.08)",
        opacity: disabled && !submitted ? 0.55 : 1,
      }}
    >
      <span
        className="absolute -top-12 -right-12 w-36 h-36 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ background: dept.color }}
      />

      <div className="flex items-start justify-between relative z-10">
        <motion.span
          className="flex items-center justify-center w-[52px] h-[52px] rounded-2xl text-white"
          style={{ background: dept.color, boxShadow: `0 14px 28px ${dept.color}55` }}
        >
          {submitted ? <Lock size={22} /> : <Icon size={24} />}
        </motion.span>

        <motion.span
          className="flex items-center justify-center w-7 h-7 rounded-full border-2"
          animate={{
            borderColor: submitted || selected ? dept.color : "#c9cfdd",
            background: submitted || selected ? dept.color : "transparent",
            scale: selected ? [1, 1.25, 1] : 1,
          }}
        >
          {(submitted || selected) && <Check size={15} className="text-white" />}
        </motion.span>
      </div>

      <h3 className="mt-4 text-lg font-bold tracking-tight">{dept.name}</h3>
      <p className="mt-2 text-sm leading-relaxed text-[#4a5163]">{dept.description}</p>

      <div className="mt-4 flex items-center gap-2">
        <span
          className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full"
          style={{ background: `${dept.color}18`, color: dept.color }}
        >
          {dept.category}
        </span>
        {submitted && (
          <span className="text-xs font-bold text-[#34A853] inline-flex items-center gap-1">
            <Check size={13} /> Applied
          </span>
        )}
      </div>
    </motion.button>
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
      toast.info("You have already applied to this department.");
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

  const groups = [
    { title: "Technical", list: DEPARTMENTS.filter((d) => d.category === "technical") },
    { title: "Non-technical", list: DEPARTMENTS.filter((d) => d.category === "non-technical") },
  ];

  return (
    <main className="min-h-screen flex flex-col noise">
      <NavBar />

      <section className="flex-1 px-4 sm:px-8 max-w-6xl mx-auto w-full pt-14 pb-44">
        <SectionHeading
          kicker="Step 01 · Select"
          title="Pick your"
          highlight="departments"
          subtitle="Choose up to two teams you would like to join. Departments you have already applied to are locked in."
        />

        {groups.map((group) => (
          <div key={group.title} className="mt-14">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
              <span
                className="w-1.5 h-7 rounded-full"
                style={{ background: "linear-gradient(#4285F4,#34A853)" }}
              />
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
      <AnimatePresence>
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 24 }}
          className="fixed bottom-0 inset-x-0 z-40 px-4 pb-5"
        >
          <div className="glass-strong max-w-6xl mx-auto rounded-2xl px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-sm font-medium text-[#4a5163] flex items-center gap-2">
              <Sparkles size={16} className="text-[#FBBC04]" />
              {selected.length === 0 ? (
                <>Select up to <strong className="text-[#14181f]">2</strong> departments</>
              ) : (
                <>
                  <strong className="text-[#14181f]">{selected.length}</strong> of{" "}
                  {remainingSlots} slot{remainingSlots === 1 ? "" : "s"} selected
                </>
              )}
            </div>
            <PremiumButton
              onClick={continueToForm}
              disabled={!selected.length}
              className="w-full sm:w-auto"
            >
              Continue to application <ArrowRight size={18} />
            </PremiumButton>
          </div>
        </motion.div>
      </AnimatePresence>

      <Footer />
    </main>
  );
};

export default DepartmentsListPage;
