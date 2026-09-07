"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import CountdownTimer from "../common/CountdownTimer";
import PremiumButton from "../premium/Button";
import { RECRUITMENT_END_AT_PUBLIC } from "../recruitmentConfig";

const ease = [0.16, 1, 0.3, 1];

function SignalRule() {
  return <div className="signal-rule" aria-hidden="true"><span /><span /><span /><span /></div>;
}

export default function LandingHero() {
  return (
    <section className="border-b border-[#dadce0]">
      <div className="container-x grid min-h-[calc(100vh-4rem)] items-end gap-10 py-14 lg:grid-cols-[minmax(0,1fr)_19rem] lg:py-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease }}
          className="max-w-5xl pb-4"
        >
          <SignalRule />
          <h1 className="mt-7 max-w-5xl text-[clamp(3.6rem,8.6vw,8.5rem)] font-bold leading-[0.89] tracking-[-0.07em] text-[#202124]">
            Find your people.<br />
            <span className="text-[#1a73e8]">Build what matters.</span>
          </h1>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-[#5f6368] sm:text-xl">
            GDG on Campus is where VIT Chennai students turn curiosity into
            projects, teams, and work they are proud to share.
          </p>
          <div className="mt-9 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <Link href="/departments"><PremiumButton size="lg">Explore departments <ArrowRight size={18} aria-hidden="true" /></PremiumButton></Link>
            <Link href="#how-it-works" className="inline-flex min-h-12 items-center gap-2 px-2 text-sm font-semibold text-[#202124] underline decoration-[#9aa0a6] underline-offset-4 hover:decoration-[#202124]">
              How recruitment works <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </motion.div>

        <motion.aside
          initial={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
          animate={{ opacity: 1, clipPath: "inset(0 0 0% 0)" }}
          transition={{ duration: 0.8, delay: 0.18, ease }}
          className="border-y border-[#202124] py-5 lg:mb-4"
          aria-label="Recruitment details"
        >
          <p className="editorial-label">Recruitment 2026</p>
          <dl className="mt-5 space-y-5">
            <div className="border-b border-[#dadce0] pb-5">
              <dt className="text-sm text-[#5f6368]">Teams to explore</dt>
              <dd className="mt-1 text-3xl font-bold tracking-[-0.05em]">12 departments</dd>
            </div>
            <div className="border-b border-[#dadce0] pb-5">
              <dt className="text-sm text-[#5f6368]">Your application</dt>
              <dd className="mt-1 text-xl font-bold tracking-[-0.03em]">Up to two teams</dd>
            </div>
            <div>
              <dt className="text-sm text-[#5f6368]">Time remaining</dt>
              <dd className="mt-3"><CountdownTimer targetDate={RECRUITMENT_END_AT_PUBLIC} /></dd>
            </div>
          </dl>
        </motion.aside>
      </div>
    </section>
  );
}
