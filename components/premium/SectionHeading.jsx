"use client";

import React from "react";
import Reveal from "./Reveal";

export default function SectionHeading({ title, highlight, subtitle, align = "left" }) {
  const centered = align === "center";
  return (
    <Reveal className={`mb-10 flex max-w-3xl flex-col ${centered ? "items-center text-center" : "items-start text-left"}`} y={18}>
      <div className="signal-rule" aria-hidden="true"><span /><span /><span /><span /></div>
      <h2 className="mt-6 text-[clamp(2.35rem,5vw,4.8rem)] font-bold leading-[0.96] tracking-[-0.055em] text-[#202124]">
        {title} {highlight && <span className="text-[#1a73e8]">{highlight}</span>}
      </h2>
      {subtitle && <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#5f6368] sm:text-lg">{subtitle}</p>}
    </Reveal>
  );
}
