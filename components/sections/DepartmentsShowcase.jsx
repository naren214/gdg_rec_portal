"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import SectionHeading from "../premium/SectionHeading";
import PremiumButton from "../premium/Button";
import { DEPARTMENTS } from "@/constants";

export default function DepartmentsShowcase() {
  const featured = DEPARTMENTS.slice(0, 6);
  return (
    <section className="border-y border-[#dadce0] bg-white py-24 sm:py-32">
      <div className="container-x">
        <SectionHeading
          title="There is more than one way"
          highlight="to build."
          subtitle="Technical and non-technical departments share the same goal: make ambitious work with people who care."
        />
        <div className="border-t border-[#202124]">
          {featured.map((department, index) => (
            <motion.article
              key={department.slug}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.42, delay: index * 0.045, ease: [0.16, 1, 0.3, 1] }}
              className="group grid gap-3 border-b border-[#dadce0] py-5 sm:grid-cols-[4rem_minmax(0,1fr)_minmax(16rem,0.75fr)_2rem] sm:items-center sm:gap-6"
            >
              <span className="text-sm font-bold tabular-nums text-[#80868b]">{String(index + 1).padStart(2, "0")}</span>
              <h3 className="text-2xl font-bold tracking-[-0.04em] transition-colors group-hover:text-[#1a73e8] sm:text-3xl">{department.name}</h3>
              <p className="text-sm leading-relaxed text-[#5f6368]">{department.description}</p>
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#dadce0] text-[#202124] transition-all group-hover:border-[#202124] group-hover:bg-[#202124] group-hover:text-white"><ArrowUpRight size={16} aria-hidden="true" /></span>
            </motion.article>
          ))}
        </div>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[#5f6368]">And six more teams across code, design, outreach, media, and management.</p>
          <Link href="/departments"><PremiumButton variant="outline">View all departments <ArrowUpRight size={17} aria-hidden="true" /></PremiumButton></Link>
        </div>
      </div>
    </section>
  );
}
