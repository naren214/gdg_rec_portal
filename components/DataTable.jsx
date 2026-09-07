"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Download,
  Mail,
  CheckCircle2,
  Circle,
  Eye,
  Users,
  Star,
  ExternalLink,
  GraduationCap,
  Hash,
  Phone,
} from "lucide-react";
import { toast } from "sonner";
import { CSVLink } from "react-csv";
import {
  CSV_Header,
  COMMON_QUESTIONS,
  DEPARTMENTS_BY_SLUG,
  getDepartmentQuestions,
} from "@/constants";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import MailComposer from "./MailComposer";

const GOOGLE = ["#4285F4", "#EA4335", "#FBBC04", "#34A853"];

const deptColor = (slug) => DEPARTMENTS_BY_SLUG[slug]?.color || "#4285F4";
const deptName = (row) =>
  DEPARTMENTS_BY_SLUG[row.departmentSlug]?.name || row.Department || "—";

// Flatten the structured Responses map into readable text for CSV.
function responsesToText(row) {
  const r = row.Responses || {};
  return COMMON_QUESTIONS.map((q) => {
    const ans = (r[q.id] ?? "").toString().replace(/\s+/g, " ").trim();
    return `${q.label} => ${ans}`;
  }).join("  ||  ");
}

function departmentResponsesToText(row) {
  const department = getDepartmentQuestions(deptName(row)).map((q) => {
    const ans = (row.DepartmentResponses?.[row.departmentSlug]?.[q.id] ?? "")
      .toString()
      .replace(/\s+/g, " ")
      .trim();
    return `${q.label} => ${ans}`;
  });
  return department.join("  ||  ");
}

function initialsFor(name) {
  return (name || "?")
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function ResponseValue({ question, value }) {
  const answer = String(value ?? "").trim();

  if (!answer) {
    return <span className="text-sm italic text-[#80868b]">No answer provided</span>;
  }

  if (question.type === "url" && /^https?:\/\//i.test(answer)) {
    return (
      <a
        href={answer}
        target="_blank"
        rel="noreferrer"
        className="inline-flex max-w-full items-start gap-2 break-all text-sm font-semibold text-[#1a73e8] underline decoration-[#1a73e8]/30 underline-offset-4 hover:decoration-[#1a73e8]"
      >
        <span>{answer}</span>
        <ExternalLink size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
      </a>
    );
  }

  return <p className="whitespace-pre-wrap text-sm leading-6 text-[#3c4043]">{answer}</p>;
}

function ResponseSection({ eyebrow, title, questions, answers, color }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-[#dadce0] bg-white shadow-[0_8px_24px_rgba(60,64,67,0.06)]">
      <header className="flex items-end justify-between gap-4 border-b border-[#dadce0] px-4 py-4 sm:px-5">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#80868b]">{eyebrow}</p>
          <h3 className="mt-1 text-base font-bold tracking-[-0.02em] text-[#202124]">{title}</h3>
        </div>
        <span className="shrink-0 rounded-full bg-[#f1f3f4] px-2.5 py-1 text-xs font-bold text-[#5f6368]">
          {questions.length} {questions.length === 1 ? "question" : "questions"}
        </span>
      </header>

      <div className="divide-y divide-[#eef0f2]">
        {questions.map((question, index) => (
          <article key={question.id} className="flex gap-3 px-4 py-5 sm:gap-4 sm:px-5">
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold"
              style={{ color, backgroundColor: `${color}16` }}
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold leading-5 text-[#202124]">{question.label}</p>
              <div className="mt-2.5">
                <ResponseValue question={question} value={answers?.[question.id]} />
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function DataTable({ data = [], onChanged }) {
  const [query, setQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [shortFilter, setShortFilter] = useState("all");
  const [checked, setChecked] = useState(() => new Set());
  const [viewing, setViewing] = useState(null); // applicant being viewed
  const [mailOpen, setMailOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.filter((row) => {
      if (deptFilter !== "all" && row.departmentSlug !== deptFilter)
        return false;
      if (shortFilter === "yes" && !row.shortlisted) return false;
      if (shortFilter === "no" && row.shortlisted) return false;
      if (!q) return true;
      return [row.Name, row.Email, row.RegistrationNumber, row.Phone]
        .filter(Boolean)
        .some((v) => v.toLowerCase().includes(q));
    });
  }, [data, query, deptFilter, shortFilter]);

  const stats = useMemo(() => {
    const shortlisted = data.filter((d) => d.shortlisted).length;
    const byDept = {};
    data.forEach((d) => {
      const name = deptName(d);
      byDept[name] = (byDept[name] || 0) + 1;
    });
    return { total: data.length, shortlisted, byDept };
  }, [data]);

  const toggleCheck = (id) =>
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleAll = () =>
    setChecked((prev) =>
      prev.size === filtered.length
        ? new Set()
        : new Set(filtered.map((r) => r._id))
    );

  const toggleShortlist = async (row) => {
    // Optimistic update.
    const next = !row.shortlisted;
    onChanged && onChanged; // no-op guard
    try {
      const res = await fetch(`/api/shortlist/${row._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shortlisted: next }),
      });
      if (res.ok) {
        toast.success(next ? "Applicant shortlisted" : "Removed from shortlist");
        onChanged && onChanged();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || "Failed to update");
      }
    } catch {
      toast.error("Network error");
    }
  };

  const selectedApplicants = data.filter((r) => checked.has(r._id));

  const csvData = filtered.map((item) => ({
    ...item,
    Department: deptName(item),
    Responses: responsesToText(item),
    DepartmentResponses: departmentResponsesToText(item),
  }));

  return (
    <div className="space-y-5 rise-in">
      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total applicants", value: stats.total, icon: Users, color: GOOGLE[0] },
          { label: "Shortlisted", value: stats.shortlisted, icon: Star, color: GOOGLE[3] },
          { label: "Departments", value: Object.keys(stats.byDept).length, icon: CheckCircle2, color: GOOGLE[1] },
          { label: "Selected", value: checked.size, icon: Mail, color: GOOGLE[2] },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -4 }}
            className="neu-surface p-4"
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white mb-2"
              style={{ background: s.color }}
            >
              <s.icon size={17} />
            </div>
            <div className="text-2xl font-extrabold leading-none">{s.value}</div>
            <div className="text-xs text-[#8b92a5] mt-1">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="neu-surface flex flex-wrap items-center gap-3 p-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8b92a5]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email, reg no…"
            className="field-input !pl-10 !py-2.5 text-sm"
          />
        </div>

        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="field-input !py-2.5 text-sm w-auto"
        >
          <option value="all">All departments</option>
          {Object.values(DEPARTMENTS_BY_SLUG).map((d) => (
            <option key={d.slug} value={d.slug}>
              {d.name}
            </option>
          ))}
        </select>

        <select
          value={shortFilter}
          onChange={(e) => setShortFilter(e.target.value)}
          className="field-input !py-2.5 text-sm w-auto"
        >
          <option value="all">Any status</option>
          <option value="yes">Shortlisted</option>
          <option value="no">Not shortlisted</option>
        </select>

        <CSVLink
          data={csvData}
          headers={CSV_Header}
          filename="gdg-applicants.csv"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ background: "#202124" }}
        >
          <Download size={16} /> CSV
        </CSVLink>

        <button
          onClick={() => setMailOpen(true)}
          disabled={!selectedApplicants.length}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40"
          style={{ background: "#1a73e8" }}
        >
          <Mail size={16} /> Email {selectedApplicants.length ? `(${selectedApplicants.length})` : ""}
        </button>
      </div>

      {/* Table */}
      <div className="data-surface rounded-[1.125rem]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/5 text-left text-[#8a90a2]">
                <th className="p-3 w-10">
                  <input
                    type="checkbox"
                    checked={filtered.length > 0 && checked.size === filtered.length}
                    onChange={toggleAll}
                  />
                </th>
                <th className="p-3 font-semibold">Applicant</th>
                <th className="p-3 font-semibold">Department</th>
                <th className="p-3 font-semibold">Contact</th>
                <th className="p-3 font-semibold">Status</th>
                <th className="p-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-[#8a90a2]">
                    No applicants match your filters.
                  </td>
                </tr>
              )}
              {filtered.map((row, idx) => {
                const color = deptColor(row.departmentSlug);
                const initials = (row.Name || "?")
                  .split(" ")
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase();
                return (
                  <motion.tr
                    key={row._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: Math.min(idx * 0.03, 0.4) }}
                    className="border-b border-[#dadce0] hover:bg-[#f8f9fa] transition-colors"
                  >
                    <td className="p-3">
                      <input
                        type="checkbox"
                        checked={checked.has(row._id)}
                        onChange={() => toggleCheck(row._id)}
                      />
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <span
                          className="flex items-center justify-center w-9 h-9 rounded-full text-white text-xs font-bold shrink-0"
                          style={{ background: color }}
                        >
                          {initials}
                        </span>
                        <div>
                          <div className="font-semibold text-[#14181f]">{row.Name}</div>
                          <div className="text-xs text-[#8b92a5]">
                            {row.RegistrationNumber}
                            {row.YearOfStudy ? ` · ${row.YearOfStudy}` : ""}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span
                        className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-white"
                        style={{ background: color }}
                      >
                        {deptName(row)}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="text-[#1a1c22]">{row.Email}</div>
                      <div className="text-xs text-[#8a90a2]">{row.Phone}</div>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => toggleShortlist(row)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white transition-transform hover:scale-105`}
                        style={{
                          background: row.shortlisted ? "#34A853" : "#c3c9d8",
                        }}
                      >
                        {row.shortlisted ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                        {row.shortlisted ? "Shortlisted" : "Shortlist"}
                      </button>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setViewing(row)}
                        className="neu-button inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold"
                      >
                        <Eye size={14} /> Responses
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Applicant response review */}
      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="!flex !max-h-[90vh] !max-w-4xl !flex-col !gap-0 !overflow-hidden !p-0">
          {viewing && (
            <>
              {(() => {
                const color = deptColor(viewing.departmentSlug);
                const departmentQuestions = getDepartmentQuestions(deptName(viewing));
                const contactDetails = [
                  { label: "Email", value: viewing.Email, icon: Mail },
                  { label: "Registration", value: viewing.RegistrationNumber, icon: Hash },
                  { label: "Phone", value: viewing.Phone, icon: Phone },
                  { label: "Year", value: viewing.YearOfStudy || "Not provided", icon: GraduationCap },
                ];

                return (
                  <>
                    <div className="shrink-0 border-b border-[#dadce0] bg-white">
                      <div className="flex h-1.5 overflow-hidden">
                        <span className="flex-1 bg-[#4285F4]" />
                        <span className="flex-1 bg-[#EA4335]" />
                        <span className="flex-1 bg-[#FBBC04]" />
                        <span className="flex-1 bg-[#34A853]" />
                      </div>
                      <div className="px-5 py-6 sm:px-8 sm:py-7">
                        <DialogHeader className="pr-8 text-left">
                          <div className="flex items-start gap-4">
                            <div
                              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-bold text-white shadow-[0_8px_18px_rgba(60,64,67,0.14)]"
                              style={{ background: color }}
                            >
                              {initialsFor(viewing.Name)}
                            </div>
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <DialogTitle className="text-2xl tracking-[-0.04em] text-[#202124] sm:text-3xl">
                                  {viewing.Name}
                                </DialogTitle>
                                <span
                                  className="rounded-full px-2.5 py-1 text-xs font-bold"
                                  style={{ color, backgroundColor: `${color}16` }}
                                >
                                  {deptName(viewing)}
                                </span>
                              </div>
                              <p className="mt-1 text-sm text-[#5f6368]">Applicant response review</p>
                            </div>
                          </div>
                        </DialogHeader>

                        <div className="mt-6 grid gap-px overflow-hidden rounded-2xl border border-[#dadce0] bg-[#dadce0] sm:grid-cols-2 lg:grid-cols-4">
                          {contactDetails.map(({ label, value, icon: Icon }) => (
                            <div key={label} className="bg-[#f8f9fa] px-4 py-3">
                              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.1em] text-[#80868b]">
                                <Icon size={14} aria-hidden="true" />
                                {label}
                              </div>
                              <p className="mt-1 truncate text-sm font-semibold text-[#202124]" title={value}>
                                {value}
                              </p>
                            </div>
                          ))}
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-3">
                          <p className="text-xs text-[#80868b]">
                            {viewing.Gender ? `${viewing.Gender} · ` : ""}Responses shown as submitted
                          </p>
                          <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${viewing.shortlisted ? "bg-[#e6f4ea] text-[#188038]" : "bg-[#f1f3f4] text-[#5f6368]"}`}>
                            {viewing.shortlisted ? "Shortlisted" : "Under review"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="min-h-0 flex-1 overflow-y-auto bg-[#f8f9fa] px-4 py-5 sm:px-7 sm:py-7">
                      <div className="space-y-6">
                        <ResponseSection
                          eyebrow="Shared responses"
                          title="About the applicant"
                          questions={COMMON_QUESTIONS}
                          answers={viewing.Responses}
                          color={color}
                        />
                        <ResponseSection
                          eyebrow="Department responses"
                          title={`${deptName(viewing)} application`}
                          questions={departmentQuestions}
                          answers={viewing.DepartmentResponses?.[viewing.departmentSlug]}
                          color={color}
                        />
                      </div>
                    </div>
                  </>
                );
              })()}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Mail composer */}
      <MailComposer
        open={mailOpen}
        onOpenChange={setMailOpen}
        recipients={selectedApplicants.map((r) => ({
          ...r,
          Department: deptName(r),
        }))}
      />
    </div>
  );
}
