"use client";

import React, { useRef } from "react";
import { motion } from "framer-motion";

// Glass card with a cursor-tracked colored spotlight and optional 3D tilt.
export default function SpotlightCard({
  children,
  color = "rgba(66,133,244,0.16)",
  tilt = true,
  className = "",
  style = {},
  ...props
}) {
  const ref = useRef(null);

  const handleMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    el.style.setProperty("--mx", `${px}px`);
    el.style.setProperty("--my", `${py}px`);

    if (tilt) {
      const rx = ((py / rect.height) - 0.5) * -8; // max ~4deg
      const ry = ((px / rect.width) - 0.5) * 8;
      el.style.setProperty("--rx", `${rx}deg`);
      el.style.setProperty("--ry", `${ry}deg`);
    }
  };

  const reset = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      className={`spotlight-card glass rounded-3xl ${className}`}
      style={{
        "--spot-color": color,
        transform: tilt ? "perspective(900px) rotateX(var(--rx,0)) rotateY(var(--ry,0))" : undefined,
        transition: "transform 0.25s cubic-bezier(0.22,1,0.36,1)",
        transformStyle: "preserve-3d",
        ...style,
      }}
      {...props}
    >
      <span className="spotlight" />
      {children}
    </motion.div>
  );
}
