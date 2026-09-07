"use client";

import React from "react";
import { ArrowRight, LayoutGrid, LogIn, Send, Users } from "lucide-react";
import { motion } from "framer-motion";
import SectionHeading from "../premium/SectionHeading";

const STEPS = [
  { icon: LogIn, title: "Use your VIT email", text: "Create an account with your official student address. It keeps every application tied to the right person." },
  { icon: LayoutGrid, title: "Choose your teams", text: "Read through all twelve departments and select up to two places where you want to contribute." },
  { icon: Send, title: "Write your application", text: "Tell us what draws you in, how you think, and what you want to learn. Drafts stay on your device." },
  { icon: Users, title: "Hear from the team", text: "Department leads review every submitted application and contact shortlisted students for the next round." },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="container-x py-24 sm:py-32">
      <SectionHeading
        title="A clear path from"
        highlight="curiosity to contribution."
        subtitle="Recruitment is designed to feel like a short introduction—not paperwork."
      />
      <div className="border-t border-[#202124]">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          return (
            <motion.article
              key={step.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.46, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
              className="grid gap-4 border-b border-[#dadce0] py-7 sm:grid-cols-[4.25rem_minmax(0,1fr)_minmax(16rem,0.72fr)] sm:items-start sm:gap-8"
            >
              <div className="flex items-center gap-3 sm:block">
                <span className="text-sm font-bold tabular-nums text-[#5f6368]">0{index + 1}</span>
                <Icon size={20} className="mt-0 text-[#202124] sm:mt-6" aria-hidden="true" />
              </div>
              <h3 className="text-2xl font-bold tracking-[-0.035em] sm:text-3xl">{step.title}</h3>
              <p className="max-w-md text-sm leading-relaxed text-[#5f6368] sm:text-base">{step.text}</p>
              {index < STEPS.length - 1 && <ArrowRight className="hidden" aria-hidden="true" />}
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
