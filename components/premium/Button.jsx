"use client";

import React, { forwardRef } from "react";
import { motion } from "framer-motion";

// Deliberately restrained control: hierarchy comes from contrast and type,
// not gradients, glow, or novelty effects.
const PremiumButton = forwardRef(function PremiumButton(
  {
    children,
    variant = "solid", // solid | outline | glass | neu
    href,
    className = "",
    size = "md",
    ...props
  },
  ref
) {
  const sizes = {
    sm: "min-h-10 px-4 text-sm",
    md: "min-h-12 px-5 text-[15px]",
    lg: "min-h-14 px-6 text-base",
  };

  const variants = {
    solid:
      "border border-[#202124] bg-[#202124] text-white hover:bg-[#3c4043] focus-visible:ring-[#1a73e8]/30",
    outline:
      "border border-[#202124] bg-transparent text-[#202124] hover:bg-[#202124] hover:text-white focus-visible:ring-[#1a73e8]/30",
    glass:
      "border border-[#dadce0] bg-white text-[#202124] hover:border-[#202124] hover:bg-[#f8f9fa] focus-visible:ring-[#1a73e8]/30",
    neu:
      "neu-button text-[#202124] focus-visible:ring-[#1a73e8]/30",
  };

  const MotionTag = href ? motion.a : motion.button;
  return (
    <MotionTag
      ref={ref}
      href={href}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors focus-visible:outline-none focus-visible:ring-4 disabled:pointer-events-none disabled:opacity-45 ${sizes[size]} ${variants[variant] || variants.solid} ${className}`}
      whileTap={props.disabled ? undefined : { scale: 0.98 }}
      transition={{ duration: 0.14 }}
      {...props}
    >
      {children}
    </MotionTag>
  );
});

export default PremiumButton;
