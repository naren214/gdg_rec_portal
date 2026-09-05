"use client";

import React from "react";
import Link from "next/link";
import {
  Globe, Smartphone, Palette, Cloud, BrainCircuit, Code2, Gamepad2,
  Blocks, PenTool, Handshake, Megaphone, Users, ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import Marquee from "../premium/Marquee";
import SectionHeading from "../premium/SectionHeading";
import SpotlightCard from "../premium/SpotlightCard";
import PremiumButton from "../premium/Button";
import { staggerContainer, staggerItem } from "../premium/Reveal";
import { DEPARTMENTS } from "@/constants";

const ICONS = {
  Globe, Smartphone, Palette, Cloud, BrainCircuit, Code2, Gamepad2,
  Blocks, PenTool, Handshake, Megaphone, Users,
};

export default function DepartmentsShowcase() {
  const featured = DEPARTMENTS.slice(0, 6);

  return (
    <section className="container-x py-20">
      <SectionHeading
        kicker="Find your team"
        title="Twelve departments,"
        highlight="one community"
        subtitle="From shipping apps and games to design, media and management — there's a place for every kind of builder."
      />

      {/* Marquee of all departments */}
      <div className="mb-14">
        <Marquee speed={36}>
          {DEPARTMENTS.map((d) => {
            const Icon = ICONS[d.icon] || Globe;
            return (
              <span
                key={d.slug}
                className="mx-2 inline-flex items-center gap-2 glass rounded-full px-5 py-2.5 text-sm font-semibold whitespace-nowrap"
              >
                <Icon size={16} style={{ color: d.color }} />
                {d.name}
              </span>
            );
          })}
        </Marquee>
      </div>

      {/* Featured cards */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        {featured.map((dept) => {
          const Icon = ICONS[dept.icon] || Globe;
          return (
            <motion.div key={dept.slug} variants={staggerItem}>
              <SpotlightCard
                color={`${dept.color}26`}
                className="h-full p-6 flex flex-col items-start group"
              >
                <div className="flex items-start justify-between w-full mb-4">
                  <span
                    className="flex items-center justify-center w-13 h-13 p-3 rounded-2xl text-white transition-transform group-hover:scale-110 group-hover:-rotate-6"
                    style={{ background: dept.color, boxShadow: `0 12px 26px ${dept.color}55`, width: 52, height: 52 }}
                  >
                    <Icon size={24} />
                  </span>
                  <span
                    className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full"
                    style={{ background: `${dept.color}18`, color: dept.color }}
                  >
                    {dept.category}
                  </span>
                </div>
                <h3 className="text-lg font-bold">{dept.name}</h3>
                <p className="text-sm text-[#4a5163] mt-2 leading-relaxed flex-1">
                  {dept.description}
                </p>
              </SpotlightCard>
            </motion.div>
          );
        })}
      </motion.div>

      <div className="flex justify-center mt-12">
        <Link href="/departments">
          <PremiumButton size="lg" variant="neu">
            Explore all departments <ArrowRight size={19} />
          </PremiumButton>
        </Link>
      </div>
    </section>
  );
}
