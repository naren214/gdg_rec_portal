"use client";

import React from "react";
import GDGLogo from "./GDGLogo";

const COLORS = ["#4285F4", "#EA4335", "#FBBC04", "#34A853"];

const GDGLoader = ({ label = "Loading…" }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-5 min-h-[50vh]">
      <div className="neu-loader-mark relative">
        <div className="animate-pulse">
          <GDGLogo size={56} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        {COLORS.map((color, i) => (
          <span
            key={color}
            className="gdg-dot"
            style={{ background: color, animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
      <p className="text-sm text-[#8a90a2] font-medium">{label}</p>
    </div>
  );
};

export default GDGLoader;
