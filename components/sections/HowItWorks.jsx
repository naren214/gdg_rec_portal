"use client";

import React from "react";
import { LogIn, LayoutGrid, Send, PartyPopper } from "lucide-react";
import SectionHeading from "../premium/SectionHeading";
import { staggerContainer, staggerItem } from "../premium/Reveal";
import SpotlightCard from "../premium/SpotlightCard";
import { motion } from "framer-motion";

const STEPS = [
  {
    icon: LogIn,
    color: "#4285F4",
    title: "Sign in",
    text: "Create an account with your official VIT student email to get started.",
  },
  {
    icon: LayoutGrid,
    color: "#EA4335",
    title: "Pick departments",
    text: "Explore all twelve teams and choose up to two that match your interests.",
  },
  {
    icon: Send,
    color: "#FBBC04",
    title: "Answer & submit",
    text: "Share a few thoughtful answers in one simple, shared application form.",
  },
  {
    icon: PartyPopper,
    color: "#34A853",
    title: "Get shortlisted",
    text: "Our teams review every application and reach out for the next round.",
  },
];

export default function HowItWorks() {
  return (
    <section className="container-x py-20">
      <SectionHeading
        kicker="Simple process"
        title="From apply to"
        highlight="accepted in four steps"
        subtitle="No paperwork, no friction — just a clear path from sign-up to shortlist."
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
      >
        {STEPS.map((step, i) => (
          <motion.div key={step.title} variants={staggerItem}>
            <SpotlightCard
              color={`${step.color}26`}
              className="h-full p-6 flex flex-col items-start"
            >
              <div className="flex items-center justify-between w-full mb-5">
                <span
                  className="flex items-center justify-center w-12 h-12 rounded-2xl text-white"
                  style={{ background: step.color, boxShadow: `0 12px 26px ${step.color}55` }}
                >
                  <step.icon size={22} />
                </span>
                <span className="text-4xl font-extrabold text-black/8 leading-none">
                  0{i + 1}
                </span>
              </div>
              <h3 className="text-lg font-bold">{step.title}</h3>
              <p className="text-sm text-[#4a5163] mt-2 leading-relaxed">{step.text}</p>
            </SpotlightCard>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
