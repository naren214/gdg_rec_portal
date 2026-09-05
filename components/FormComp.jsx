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
  Send,
  Loader2,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { COMMON_QUESTIONS } from "@/constants";
import { MAX_APPLICATIONS_PER_USER as MAX_APPS } from "@/lib/config";
import { useSubmissions } from "@/components/SubmissionsProvider";
import { toast } from "sonner";

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

const inputClass =
  "w-full rounded-xl border border-black/10 bg-white/70 px-4 py-3 text-[#1a1c22] placeholder:text-[#a4aabf] outline-none transition-all focus:border-[#4285F4] focus:ring-4 focus:ring-[#4285F4]/15";

const FormComp = ({ departments = [] }) => {
  const router = useRouter();
  const { submittedSlugs, markSubmitted, refreshSubmissions } = useSubmissions();

  const deptSlugs = departments.map((d) => d.slug);
  const deptNames = departments.map((d) => d.name);

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
          body: JSON.stringify({ ...shared, departmentSlug: dept.slug }),
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
      setTimeout(() => router.push("/departments"), 1400);
    }
  };

  // If every selected department is already applied to, show a success state.
  if (results && !results.failed.length) {
    return (
      <div className="flex-1 flex items-center justify-center px-5 py-16">
        <div className="glass-strong rounded-3xl p-10 text-center max-w-md rise-in">
          <CheckCircle2 size={56} className="mx-auto text-[#34A853]" />
          <h2 className="text-2xl font-bold mt-4">All set!</h2>
          <p className="mt-2 text-[#54596b]">
            Your application{results.successful.length > 1 ? "s were" : " was"}{" "}
            submitted. Redirecting you back…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 px-4 sm:px-6 py-10">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center rise-in mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#4285F4]">
            Step 02 · Apply
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-2">
            Your <span className="text-gradient">application</span>
          </h1>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
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

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="glass-strong rounded-3xl p-6 sm:p-9 space-y-8 rise-in"
          style={{ animationDelay: "0.1s" }}
        >
          {/* About you */}
          <section>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <User size={18} className="text-[#EA4335]" /> About you
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
                  value=""
                  disabled
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

          <div className="h-px bg-black/5" />

          {/* Common questions */}
          <section>
            <h2 className="text-lg font-bold mb-1 flex items-center gap-2">
              <GraduationCap size={18} className="text-[#FBBC04]" /> Your
              responses
            </h2>
            <p className="text-sm text-[#8a90a2] mb-5">
              The same questions apply to every department — answer once and we
              attach them to each application.
            </p>
            <div className="space-y-6">
              {COMMON_QUESTIONS.map((q, i) => (
                <Field
                  key={q.id}
                  label={`${i + 1}. ${q.label}${q.required ? " *" : ""}`}
                  error={errors[q.id]?.message}
                >
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
                </Field>
              ))}
            </div>
          </section>

          {results?.failed?.length > 0 && (
            <div className="rounded-xl bg-[#EA4335]/10 border border-[#EA4335]/20 p-4 text-sm text-[#EA4335]">
              {results.failed.length} application(s) did not go through — your
              answers are saved. Fix the issue above and press submit again.
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !pending.length}
            className="w-full inline-flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold text-white text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed enabled:hover:scale-[1.01] google-ring"
            style={{ background: "linear-gradient(135deg,#4285F4,#34A853)" }}
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
          </button>

          <p className="text-center text-xs text-[#a4aabf]">
            Drafts are saved on this device. You can apply to at most{" "}
            {MAX_APPS} departments.
          </p>
        </form>
      </div>
    </div>
  );
};

export default FormComp;
