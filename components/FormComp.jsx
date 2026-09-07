"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  User,
  Hash,
  Mail,
  Phone,
  GraduationCap,
  Users as UsersIcon,
  Link as LinkIcon,
  Send,
  Loader2,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  COMMON_QUESTIONS,
  getDepartmentQuestions,
  MAX_APPLICATIONS_PER_USER as MAX_APPS,
} from "@/constants";
import { useSubmissions } from "@/components/SubmissionsProvider";
import PremiumButton from "@/components/premium/Button";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

const GOOGLE = ["#4285F4", "#EA4335", "#FBBC04", "#34A853"];

function Field({ label, icon: Icon, error, children }) {
  return (
    <label className="block">
      <span className="flex items-center gap-2 text-sm font-semibold text-[#1a1c22] mb-1.5">
        {Icon && <Icon size={15} className="text-[#4285F4]" />}
        {label}
      </span>
      {children}
      {error && <span className="text-xs text-[#EA4335] mt-1 block">{error}</span>}
    </label>
  );
}

const inputClass = "field-input";

const FormComp = ({ departments = [] }) => {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const { submittedSlugs, markSubmitted, refreshSubmissions } = useSubmissions();

  const deptSlugs = departments.map((d) => d.slug);
  const departmentQuestionSets = useMemo(
    () =>
      departments.map((department) => ({
        ...department,
        questions: getDepartmentQuestions(department.name),
      })),
    [departments]
  );

  // Which of these departments still need an application.
  const pending = useMemo(
    () => departments.filter((d) => !submittedSlugs.includes(d.slug)),
    [departments, submittedSlugs]
  );

  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState(null); // { successful: [], failed: [] }

  const draftKey = `gdg-draft:${deptSlugs.sort().join("|")}`;

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      Name: "",
      RegistrationNumber: "",
      Phone: "",
      Gender: "",
      YearOfStudy: "",
      ...Object.fromEntries(COMMON_QUESTIONS.map((q) => [q.id, ""])),
      DepartmentResponses: Object.fromEntries(
        departmentQuestionSets.map((department) => [
          department.slug,
          Object.fromEntries(department.questions.map((q) => [q.id, ""])),
        ])
      ),
    },
  });

  // Hydrate draft once.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey);
      if (raw) reset({ ...JSON.parse(raw) });
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftKey]);

  // Autosave draft (debounced via watch).
  // React Hook Form's watch() is intentionally used as the autosave source.
  // eslint-disable-next-line react-hooks/incompatible-library
  const values = watch();
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem(draftKey, JSON.stringify(values));
      } catch {
        /* ignore */
      }
    }, 400);
    return () => clearTimeout(t);
  }, [values, draftKey]);

  const onSubmit = async (formValues) => {
    if (!pending.length) {
      toast.info("You've already applied to these departments.");
      router.push("/departments");
      return;
    }

    setSubmitting(true);
    setResults(null);

    const shared = {
      Name: formValues.Name,
      RegistrationNumber: formValues.RegistrationNumber,
      Phone: formValues.Phone,
      Gender: formValues.Gender,
      YearOfStudy: formValues.YearOfStudy,
      Responses: Object.fromEntries(
        COMMON_QUESTIONS.map((q) => [q.id, formValues[q.id] || ""])
      ),
    };

    // Submit sequentially so each department application is independent and
    // a failure for one doesn't block the other.
    const successful = [];
    const failed = [];

    for (const dept of pending) {
      try {
        const res = await fetch("/api/submit-form", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...shared,
            departmentSlug: dept.slug,
            DepartmentResponses: {
              [dept.slug]: formValues.DepartmentResponses?.[dept.slug] || {},
            },
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          successful.push(dept);
        } else {
          failed.push({ dept, message: data.message });
          toast.error(data.message || `Could not submit for ${dept.name}`);
        }
      } catch {
        failed.push({ dept, message: "Network error" });
        toast.error(`Network error while applying to ${dept.name}`);
      }
    }

    if (successful.length) {
      markSubmitted(
        successful.map((d) => d.slug),
        successful.map((d) => d.name)
      );
      try {
        localStorage.removeItem(draftKey);
      } catch {
        /* ignore */
      }
      toast.success(
        `Application submitted for ${successful.map((d) => d.name).join(" & ")}!`
      );
    }

    await refreshSubmissions();
    setResults({ successful, failed });
    setSubmitting(false);

    if (!failed.length) {
      setTimeout(() => router.push("/departments"), 6000);
    }
  };

  // If every selected department is already applied to, show a success state.
  if (results && !results.failed.length) {
    return (
      <div className="relative flex flex-1 items-center justify-center overflow-hidden px-5 py-16 sm:py-24">
        <div className="pointer-events-none absolute inset-x-0 top-0 flex h-1.5" aria-hidden="true">
          <motion.span initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.8, ease: "easeOut" }} className="flex-1 origin-left bg-[#4285F4]" />
          <motion.span initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.8, delay: 0.12, ease: "easeOut" }} className="flex-1 origin-left bg-[#EA4335]" />
          <motion.span initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.8, delay: 0.24, ease: "easeOut" }} className="flex-1 origin-left bg-[#FBBC04]" />
          <motion.span initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.8, delay: 0.36, ease: "easeOut" }} className="flex-1 origin-left bg-[#34A853]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-2xl"
        >
          <div className="neu-surface overflow-hidden px-6 py-8 text-center sm:px-12 sm:py-12">
            <div className="mx-auto flex max-w-xl flex-col items-center">
              <motion.div
                initial={{ scale: 0.6, rotate: -12, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 240, damping: 16, delay: 0.15 }}
                className="relative flex h-24 w-24 items-center justify-center rounded-[2rem] bg-[#e6f4ea] text-[#188038] shadow-[inset_5px_5px_12px_rgba(24,128,56,0.08),inset_-5px_-5px_12px_rgba(255,255,255,0.9)]"
              >
                <motion.span
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.45, delay: 0.45, ease: "easeOut" }}
                  className="absolute inset-2 rounded-[1.35rem] border border-[#34A853]/20"
                />
                <CheckCircle2 size={48} strokeWidth={1.8} aria-hidden="true" />
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.35 }}
                className="mt-7 text-[clamp(2.2rem,5vw,3.8rem)] font-bold leading-none tracking-[-0.06em] text-[#202124]"
              >
                You’re officially in.
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="mt-4 max-w-lg text-base leading-relaxed text-[#5f6368]"
              >
                Your application{results.successful.length > 1 ? "s have" : " has"} been submitted successfully. Keep building, keep learning, and we’ll take it from here.
              </motion.p>

              <div className="mt-8 w-full divide-y divide-[#dadce0] overflow-hidden rounded-2xl border border-[#dadce0] bg-[#f8f9fa] text-left">
                <div className="flex items-center justify-between px-4 py-3.5 sm:px-5">
                  <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#80868b]">Submitted applications</span>
                  <span className="rounded-full bg-[#e6f4ea] px-2.5 py-1 text-xs font-bold text-[#188038]">{results.successful.length} complete</span>
                </div>
                {results.successful.map((department, index) => (
                  <motion.div
                    key={department.slug}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.65 + index * 0.1 }}
                    className="flex items-center gap-3 px-4 py-4 sm:px-5"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#e6f4ea] text-[#188038]">
                      <CheckCircle2 size={18} aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-bold text-[#202124]">{department.name}</span>
                    <span className="text-xs font-semibold text-[#80868b]">Received</span>
                  </motion.div>
                ))}
              </div>

              <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
                <button
                  type="button"
                  onClick={() => router.push("/departments")}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#202124] px-6 text-sm font-bold text-white transition-colors hover:bg-[#3c4043]"
                >
                  Continue to departments <ArrowRight size={17} aria-hidden="true" />
                </button>
              </div>
              <p className="mt-4 text-xs text-[#80868b]">You’ll be redirected automatically in a few seconds.</p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 px-4 py-12 sm:px-6 sm:py-16">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-10 rise-in">
          <div className="signal-rule" aria-hidden="true"><span /><span /><span /><span /></div>
          <h1 className="mt-6 text-[clamp(3rem,6vw,4.8rem)] font-bold leading-[0.95] tracking-[-0.06em]">
            Your application.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-[#5f6368]">Write clearly, answer honestly, and take your time. Your draft is saved on this device.</p>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            {departments.map((d, i) => {
              const applied = submittedSlugs.includes(d.slug);
              return (
                <React.Fragment key={d.slug}>
                  <span
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold text-white"
                    style={{
                      background: applied ? "#34A853" : GOOGLE[i % GOOGLE.length],
                    }}
                  >
                    {applied && <CheckCircle2 size={15} />}
                    {d.name}
                  </span>
                  {i < departments.length - 1 && (
                    <ChevronRight size={16} className="text-[#a4aabf]" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <motion.form
          onSubmit={handleSubmit(onSubmit)}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="neu-surface space-y-8 p-6 sm:p-9"
        >
          {/* About you */}
          <section>
            <h2 className="mb-5 flex items-center gap-2 text-xl font-bold tracking-[-0.03em]">
              <User size={18} className="text-[#202124]" /> About you
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Full name" icon={User} error={errors.Name?.message}>
                <input
                  className={inputClass}
                  placeholder="Jane Doe"
                  {...register("Name", { required: "Name is required" })}
                />
              </Field>

              <Field
                label="Registration number"
                icon={Hash}
                error={errors.RegistrationNumber?.message}
              >
                <input
                  className={inputClass}
                  placeholder="e.g. 25BCE5612"
                  {...register("RegistrationNumber", {
                    required: "Registration number is required",
                    pattern: {
                      value: /^\d{2}[A-Z]{3}\d{4}$/,
                      message:
                        "Format: 2 digits, 3 uppercase letters, 4 digits (25BCE5612)",
                    },
                  })}
                />
              </Field>

              <Field label="Email (VIT)" icon={Mail}>
                <input
                  className={inputClass}
                  type="email"
                  readOnly
                  disabled
                  value={session?.user?.email || ""}
                  placeholder="Use your signed-in VIT email"
                />
              </Field>

              <Field
                label="Phone / WhatsApp"
                icon={Phone}
                error={errors.Phone?.message}
              >
                <input
                  className={inputClass}
                  placeholder="10-digit number, e.g. 9876543210"
                  inputMode="numeric"
                  {...register("Phone", {
                    required: "Phone number is required",
                    pattern: {
                      value: /^\d{10}$/,
                      message: "Must be exactly 10 digits",
                    },
                  })}
                />
              </Field>

              <Field label="Gender" icon={UsersIcon}>
                <select className={inputClass} {...register("Gender")}>
                  <option value="">Select…</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                  <option>Prefer not to say</option>
                </select>
              </Field>

              <Field label="Year of study" icon={GraduationCap}>
                <select className={inputClass} {...register("YearOfStudy")}>
                  <option value="">Select…</option>
                  <option>1st year</option>
                  <option>2nd year</option>
                  <option>3rd year</option>
                  <option>4th year</option>
                  <option>5th year</option>
                </select>
              </Field>
            </div>
          </section>

          <div className="section-divider" />

          {/* Common questions */}
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold tracking-[-0.03em]">
              <GraduationCap size={18} className="text-[#202124]" /> Common
              question
            </h2>
            <div className="space-y-6">
              {COMMON_QUESTIONS.map((q, i) => (
                <Field
                  key={q.id}
                  label={`${i + 1}. ${q.label}${q.required ? " *" : ""}`}
                  icon={q.type === "url" ? LinkIcon : undefined}
                  error={errors[q.id]?.message}
                >
                  {q.type === "url" ? (
                    <input
                      type="url"
                      className={inputClass}
                      placeholder={q.placeholder}
                      {...register(q.id, {
                        validate: (v) =>
                          !v || /^https?:\/\//i.test(v.trim()) ||
                          "Please enter a valid http(s) URL",
                      })}
                    />
                  ) : (
                    <textarea
                      rows={4}
                      className={`${inputClass} resize-y`}
                      placeholder={q.placeholder}
                      {...register(q.id, {
                        required: q.required ? "This question is required" : false,
                        validate: (v) =>
                          !q.required ||
                          (v && v.trim().length >= 10) ||
                          "Please write at least 10 characters",
                      })}
                    />
                  )}
                </Field>
              ))}
            </div>
          </section>

          {departmentQuestionSets.map((department, departmentIndex) => (
            <React.Fragment key={department.slug}>
              <div className="section-divider" />
              <section>
                <div className="mb-5">
                  <p className="text-sm font-semibold tabular-nums text-[#5f6368]">
                    {String(departmentIndex + 2).padStart(2, "0")}
                  </p>
                  <h2 className="text-2xl font-extrabold tracking-tight mt-1">
                    {department.name}
                  </h2>
                  <p className="text-sm text-[#8a90a2] mt-1">
                    Tell us how you think. Honest answers beat perfect ones.
                  </p>
                </div>

                <div className="space-y-6">
                  {department.questions.map((q) => {
                    const fieldName = `DepartmentResponses.${department.slug}.${q.id}`;
                    const error =
                      errors.DepartmentResponses?.[department.slug]?.[q.id]
                        ?.message;

                    return (
                      <Field
                        key={q.id}
                        label={`${q.label}${q.required ? " *" : ""}`}
                        icon={q.type === "url" ? LinkIcon : undefined}
                        error={error}
                      >
                        {q.type === "url" ? (
                          <input
                            type="url"
                            className={inputClass}
                            placeholder={q.placeholder}
                            {...register(fieldName)}
                          />
                        ) : (
                          <textarea
                            rows={4}
                            className={`${inputClass} resize-y`}
                            placeholder={q.placeholder}
                            {...register(fieldName, {
                              required: q.required
                                ? "This question is required"
                                : false,
                              validate: (v) =>
                                !q.required ||
                                (v && v.trim().length >= 10) ||
                                "Please write at least 10 characters",
                            })}
                          />
                        )}
                      </Field>
                    );
                  })}
                </div>
              </section>
            </React.Fragment>
          ))}

          {results?.failed?.length > 0 && (
            <div className="rounded-xl bg-[#EA4335]/10 border border-[#EA4335]/20 p-4 text-sm text-[#EA4335]">
              {results.failed.length} application(s) did not go through — your
              answers are saved. Fix the issue above and press submit again.
            </div>
          )}

          <PremiumButton
            type="submit"
            size="lg"
            disabled={submitting || !pending.length}
            className="w-full !rounded-2xl"
          >
            {submitting ? (
              <>
                <Loader2 size={20} className="animate-spin" /> Submitting…
              </>
            ) : (
              <>
                <Send size={19} /> Submit application
                {pending.length > 1 ? `s (${pending.length})` : ""}
              </>
            )}
          </PremiumButton>

          <p className="text-center text-xs text-[#a4aabf]">
            Drafts are saved on this device. You can apply to at most{" "}
            {MAX_APPS} departments.
          </p>
        </motion.form>
      </div>
    </div>
  );
};

export default FormComp;
