"use client";

import React from "react";
import { Users, Layers, FolderGit2, Award } from "lucide-react";
import CountUp from "../premium/CountUp";
import { motion } from "framer-motion";

const STATS = [
  { icon: Layers, value: 12, suffix: "", label: "Departments", color: "#4285F4" },
  { icon: Users, value: 500, suffix: "+", label: "Members", color: "#EA4335" },
  { icon: FolderGit2, value: 60, suffix: "+", label: "Projects built", color: "#FBBC04" },
  { icon: Award, value: 25, suffix: "+", label: "Events hosted", color: "#34A853" },
];

export default function StatsBand() {
  return (
    <section className="container-x py-14">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="glass-strong rounded-[28px] px-6 sm:px-10 py-10 grid grid-cols-2 lg:grid-cols-4 gap-8"
      >
        {STATS.map((s) => (
          <div key={s.label} className="flex flex-col items-center text-center gap-2">
            <span
              className="flex items-center justify-center w-12 h-12 rounded-2xl text-white mb-1"
              style={{ background: s.color, boxShadow: `0 12px 24px ${s.color}44` }}
            >
              <s.icon size={22} />
            </span>
            <span className="text-4xl font-extrabold tracking-tight">
              <CountUp to={s.value} suffix={s.suffix} />
            </span>
            <span className="text-sm text-[#4a5163] font-medium">{s.label}</span>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
