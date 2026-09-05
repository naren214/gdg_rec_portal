"use client";

import React from "react";

// Infinite horizontal marquee. Children are duplicated for a seamless loop;
// pauses on hover.
export default function Marquee({ children, speed = 32, reverse = false, className = "" }) {
  return (
    <div
      className={`marquee relative flex overflow-hidden ${className}`}
      style={{
        maskImage:
          "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)",
        WebkitMaskImage:
          "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)",
      }}
    >
      <div
        className="marquee-track"
        style={{
          ["--marquee-speed"]: `${speed}s`,
          animationDirection: reverse ? "reverse" : "normal",
        }}
      >
        {children}
        {children}
      </div>
    </div>
  );
}
