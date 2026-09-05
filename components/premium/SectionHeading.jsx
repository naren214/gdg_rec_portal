"use client";

import React from "react";
import Reveal from "./Reveal";

// Consistent section header: small gradient kicker, big title, subtitle.
export default function SectionHeading({
  kicker,
  title,
  highlight,
  subtitle,
  align = "center",
}) {
  const alignCls = align === "center" ? "items-center text-center" : "items-start text-left";
  return (
    <Reveal className={`flex flex-col gap-3 ${alignCls} mb-12`}>
      {kicker && (
        <span className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#4285F4]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#34A853]" />
          {kicker}
        </span>
      )}
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
        {title}{" "}
        {highlight && <span className="text-gradient">{highlight}</span>}
      </h2>
      {subtitle && (
        <p className="text-[#4a5163] text-base sm:text-lg max-w-2xl leading-relaxed">
          {subtitle}
        </p>
      )}
    </Reveal>
  );
}
