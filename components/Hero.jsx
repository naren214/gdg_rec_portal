"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Users, Layers } from "lucide-react";
import CountdownTimer from "./common/CountdownTimer";
import { RECRUITMENT_END_AT_PUBLIC } from "./recruitmentConfig";

const highlights = [
  { icon: Users, color: "#4285F4", label: "12 Departments" },
  { icon: Layers, color: "#EA4335", label: "Apply to up to 2" },
  { icon: Sparkles, color: "#34A853", label: "Real projects" },
];

export default function Hero() {
  return (
    <section className="flex-1 flex flex-col items-center justify-center text-center px-5 pt-14 pb-16">
      <div className="rise-in inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-sm font-medium text-[#54596b] mb-6">
        <span className="relative flex h-2.5 w-2.5">
          <span
            className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
            style={{ background: "#34A853" }}
          />
          <span
            className="relative inline-flex rounded-full h-2.5 w-2.5"
            style={{ background: "#34A853" }}
          />
        </span>
        Recruitment drive is live
      </div>

      <h1
        className="rise-in text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.05] max-w-4xl"
        style={{ animationDelay: "0.08s" }}
      >
        Build something{" "}
        <span className="text-gradient">great</span> with{" "}
        <span className="relative whitespace-nowrap">
          Google Developer Groups
        </span>
      </h1>

      <p
        className="rise-in mt-6 text-lg sm:text-xl text-[#54596b] max-w-2xl"
        style={{ animationDelay: "0.16s" }}
      >
        Join a community of builders, designers and creators. Pick up to two
        departments, answer a few questions, and kickstart your journey.
      </p>

      <div
        className="rise-in mt-8 flex flex-col sm:flex-row items-center gap-4"
        style={{ animationDelay: "0.24s" }}
      >
        <Link
          href="/departments"
          className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold text-white text-lg transition-transform hover:scale-105 active:scale-95 google-ring"
          style={{ background: "linear-gradient(135deg,#4285F4 0%,#34A853 100%)" }}
        >
          Apply now
          <ArrowRight
            size={20}
            className="transition-transform group-hover:translate-x-1"
          />
        </Link>
        <Link
          href="/auth/signin"
          className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-semibold text-[#1a1c22] text-lg neu neu-press"
        >
          Sign in
        </Link>
      </div>

      <div
        className="rise-in mt-10 flex flex-wrap items-center justify-center gap-3"
        style={{ animationDelay: "0.32s" }}
      >
        {highlights.map((h) => (
          <div
            key={h.label}
            className="glass rounded-2xl px-5 py-3 flex items-center gap-2.5 text-sm font-medium"
          >
            <span
              className="flex items-center justify-center w-8 h-8 rounded-xl"
              style={{ background: `${h.color}1a`, color: h.color }}
            >
              <h.icon size={17} />
            </span>
            {h.label}
          </div>
        ))}
      </div>

      <div
        className="rise-in mt-14 glass-strong rounded-3xl px-6 sm:px-10 py-7"
        style={{ animationDelay: "0.4s" }}
      >
        <p className="text-xs uppercase tracking-[0.25em] text-[#8a90a2] mb-4">
          Applications close in
        </p>
        <CountdownTimer targetDate={RECRUITMENT_END_AT_PUBLIC} />
      </div>
    </section>
  );
}
