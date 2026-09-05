"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Users, Layers } from "lucide-react";
import CountdownTimer from "../common/CountdownTimer";
import PremiumButton from "../premium/Button";
import { RECRUITMENT_END_AT_PUBLIC } from "../recruitmentConfig";
import GDGLogo from "../GDGLogo";

const GOOGLE = ["#4285F4", "#EA4335", "#FBBC04", "#34A853"];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 30, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

// Floating decorative Google-color shapes.
const floaters = [
  { color: "#4285F4", size: 70, x: "6%", y: "22%", delay: 0, shape: "circle" },
  { color: "#EA4335", size: 46, x: "86%", y: "18%", delay: 0.6, shape: "square" },
  { color: "#FBBC04", size: 54, x: "12%", y: "70%", delay: 1.1, shape: "triangle" },
  { color: "#34A853", size: 40, x: "90%", y: "68%", delay: 0.9, shape: "circle" },
  { color: "#4285F4", size: 30, x: "74%", y: "82%", delay: 1.5, shape: "square" },
  { color: "#EA4335", size: 26, x: "22%", y: "38%", delay: 1.8, shape: "circle" },
];

function Shape({ shape, color, size }) {
  if (shape === "circle")
    return <div style={{ width: size, height: size, background: color, borderRadius: "50%" }} />;
  if (shape === "square")
    return <div style={{ width: size, height: size, background: color, borderRadius: size * 0.28 }} />;
  return (
    <div
      style={{
        width: 0,
        height: 0,
        borderLeft: `${size / 2}px solid transparent`,
        borderRight: `${size / 2}px solid transparent`,
        borderBottom: `${size}px solid ${color}`,
      }}
    />
  );
}

const highlights = [
  { icon: Users, color: "#4285F4", label: "12 Departments" },
  { icon: Layers, color: "#EA4335", label: "Apply to up to 2" },
  { icon: Sparkles, color: "#34A853", label: "Real projects" },
];

export default function LandingHero() {
  return (
    <section className="relative flex flex-col items-center justify-center text-center px-5 pt-16 pb-20 overflow-hidden">
      {/* floating shapes */}
      <div className="absolute inset-0 pointer-events-none hidden md:block" aria-hidden>
        {floaters.map((f, i) => (
          <motion.div
            key={i}
            className="absolute opacity-20"
            style={{ left: f.x, top: f.y }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.2, scale: [1, 1.15, 1], y: [0, -18, 0] }}
            transition={{
              opacity: { delay: f.delay, duration: 0.6 },
              scale: { duration: 0.6, delay: f.delay },
              y: { duration: 5 + f.delay, repeat: Infinity, ease: "easeInOut", delay: f.delay },
            }}
          >
            <Shape shape={f.shape} color={f.color} size={f.size} />
          </motion.div>
        ))}
      </div>

      <motion.div variants={container} initial="hidden" animate="show" className="relative z-10 flex flex-col items-center">
        <motion.div variants={item}>
          <span className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 text-sm font-semibold text-[#4a5163]">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60 bg-[#34A853]" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#34A853]" />
            </span>
            Recruitment drive 2026 is live
          </span>
        </motion.div>

        <motion.h1
          variants={item}
          className="mt-7 text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.04] max-w-4xl"
        >
          Build something{" "}
          <span className="text-gradient">extraordinary</span>
          <br className="hidden sm:block" /> with Google Developer Groups
        </motion.h1>

        <motion.p variants={item} className="mt-6 text-lg sm:text-xl text-[#4a5163] max-w-2xl leading-relaxed">
          Join a community of builders, designers and creators. Pick up to two
          departments, answer a few questions, and kickstart your journey.
        </motion.p>

        <motion.div variants={item} className="mt-9 flex flex-col sm:flex-row items-center gap-4">
          <Link href="/departments">
            <PremiumButton size="lg" ring shine>
              Apply now <ArrowRight size={20} />
            </PremiumButton>
          </Link>
          <Link href="/auth/signin">
            <PremiumButton size="lg" variant="neu">
              <GDGLogo size={20} /> Sign in
            </PremiumButton>
          </Link>
        </motion.div>

        <motion.div variants={item} className="mt-12 flex flex-wrap items-center justify-center gap-3">
          {highlights.map((h, i) => (
            <div
              key={h.label}
              className="glass rounded-2xl px-5 py-3 flex items-center gap-2.5 text-sm font-semibold"
            >
              <span
                className="flex items-center justify-center w-8 h-8 rounded-xl text-white"
                style={{ background: GOOGLE[i] }}
              >
                <h.icon size={16} />
              </span>
              {h.label}
            </div>
          ))}
        </motion.div>

        <motion.div
          variants={item}
          className="mt-14 glass-strong rounded-3xl px-6 sm:px-10 py-7"
        >
          <p className="text-xs uppercase tracking-[0.25em] text-[#8b92a5] mb-4 font-bold">
            Applications close in
          </p>
          <CountdownTimer targetDate={RECRUITMENT_END_AT_PUBLIC} />
        </motion.div>
      </motion.div>
    </section>
  );
}
