"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import PremiumButton from "../premium/Button";

export default function CallToAction() {
  return (
    <section className="container-x py-24 sm:py-32">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.58, ease: [0.16, 1, 0.3, 1] }}
        className="overflow-hidden rounded-[1.75rem] bg-[#202124] px-6 py-10 text-white sm:px-12 sm:py-14"
      >
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-end">
          <div>
            <div className="signal-rule" aria-hidden="true"><span /><span /><span /><span /></div>
            <h2 className="mt-7 max-w-3xl text-[clamp(2.6rem,5vw,5rem)] font-bold leading-[0.94] tracking-[-0.055em]">
              Bring your point of view. We will make room for it.
            </h2>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#bdc1c6]">
              Choose the department where you can learn in public, contribute with intent, and build alongside the GDG VIT Chennai community.
            </p>
          </div>
          <div className="border-t border-[#5f6368] pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            <p className="text-sm leading-relaxed text-[#bdc1c6]">Applications are limited to two departments per student.</p>
            <Link href="/departments" className="mt-6 inline-flex"><PremiumButton size="lg" className="!border-white !bg-white !text-[#202124] hover:!bg-[#f1f3f4]">Start your application <ArrowRight size={18} aria-hidden="true" /></PremiumButton></Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
