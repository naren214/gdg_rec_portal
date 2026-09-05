"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import PremiumButton from "../premium/Button";
import CountdownTimer from "../common/CountdownTimer";
import { RECRUITMENT_END_AT_PUBLIC } from "../recruitmentConfig";

export default function CallToAction() {
  return (
    <section className="container-x py-20">
      <motion.div
        initial={{ opacity: 0, y: 36, scale: 0.98 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-[32px] p-10 sm:p-16 text-center text-white"
        style={{
          background:
            "linear-gradient(120deg,#4285F4 0%,#5b7ff0 30%,#8a6fe0 55%,#EA4335 100%)",
          boxShadow: "0 30px 80px rgba(66,133,244,0.35)",
        }}
      >
        {/* decorative blobs */}
        <div className="absolute -top-16 -left-16 w-56 h-56 rounded-full bg-white/15 blur-2xl" />
        <div className="absolute -bottom-20 -right-10 w-64 h-64 rounded-full bg-[#FBBC04]/30 blur-3xl" />

        <div className="relative z-10 flex flex-col items-center">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight max-w-2xl">
            Ready to make your mark at GDG?
          </h2>
          <p className="mt-4 text-white/85 text-lg max-w-xl">
            Applications close soon. Choose your departments and take the first
            step today.
          </p>

          <div className="mt-7 mb-8 scale-110 [&_*]:!text-white [&_span]:!shadow-none">
            <div className="neu-sm !bg-white/15 !shadow-none backdrop-blur-md rounded-2xl px-5 py-4 [&_span]:!text-white">
              <CountdownTimer targetDate={RECRUITMENT_END_AT_PUBLIC} />
            </div>
          </div>

          <Link href="/departments">
            <PremiumButton
              size="lg"
              className="!bg-white !text-[#4285F4] !shadow-xl hover:!text-[#34A853]"
            >
              Start your application <ArrowRight size={20} />
            </PremiumButton>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
