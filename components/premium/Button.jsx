"use client";

import React, { forwardRef } from "react";
import { motion } from "framer-motion";

const GRADIENTS = {
  blueGreen: "linear-gradient(135deg,#4285F4 0%,#34A853 100%)",
  redYellow: "linear-gradient(135deg,#EA4335 0%,#FBBC04 100%)",
  blue: "linear-gradient(135deg,#4285F4 0%,#5a9bff 100%)",
  google: "linear-gradient(120deg,#4285F4,#EA4335,#FBBC04,#34A853)",
};

// Premium button: framer-motion spring scale + optional shine sweep /
// animated Google ring. Renders <a> when href is provided, else <button>.
const PremiumButton = forwardRef(function PremiumButton(
  {
    children,
    variant = "solid", // solid | outline | glass | neu
    gradient = "blueGreen",
    shine = true,
    ring = false,
    href,
    className = "",
    size = "md",
    ...props
  },
  ref
) {
  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-[15px]",
    lg: "px-8 py-4 text-lg",
  };

  const base =
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold select-none disabled:opacity-45 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#4285F4]/25";

  let style = {};
  let extra = "";

  if (variant === "solid") {
    style = { background: GRADIENTS[gradient] || GRADIENTS.blueGreen, color: "#fff" };
    extra = "shadow-lg shadow-[#4285F4]/25 btn-shine";
  } else if (variant === "glass") {
    extra = "glass text-[#14181f] hover:bg-white/90";
  } else if (variant === "neu") {
    extra = "neu neu-press text-[#14181f]";
  } else {
    extra =
      "border-2 border-[#4285F4]/30 text-[#4285F4] hover:bg-[#4285F4]/8 bg-white/60";
  }

  const cls = `${base} ${sizes[size]} ${extra} ${ring ? "google-ring" : ""} ${className}`;

  const MotionTag = href ? motion.a : motion.button;

  return (
    <MotionTag
      ref={ref}
      href={href}
      className={cls}
      style={style}
      whileHover={{ scale: props.disabled ? 1 : 1.04 }}
      whileTap={{ scale: props.disabled ? 1 : 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
      {...props}
    >
      {children}
    </MotionTag>
  );
});

export default PremiumButton;
