"use client";

import React from "react";
import { motion } from "framer-motion";

const FACTS = [
  { value: "12", label: "departments to explore", color: "#1a73e8" },
  { value: "02", label: "teams per application", color: "#d93025" },
  { value: "VIT", label: "email required to apply", color: "#f9ab00" },
  { value: "01", label: "shared application flow", color: "#188038" },
];

export default function StatsBand() {
  return (
    <section className="border-b border-[#dadce0] bg-white">
      <div className="container-x grid sm:grid-cols-2 lg:grid-cols-4">
        {FACTS.map((fact, index) => (
          <motion.div
            key={fact.label}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.45, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
            className="min-h-36 border-b border-[#dadce0] py-7 sm:border-r sm:px-7 lg:border-b-0 lg:first:pl-0 lg:last:border-r-0"
          >
            <span className="block text-[clamp(2.25rem,4vw,3.3rem)] font-bold leading-none tracking-[-0.065em]" style={{ color: fact.color }}>{fact.value}</span>
            <span className="mt-3 block max-w-[15ch] text-sm leading-snug text-[#5f6368]">{fact.label}</span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
