"use client";

import React from "react";
import Link from "next/link";
import { LayoutGrid, Home, LogIn } from "lucide-react";
import { motion } from "framer-motion";
import GDGLogo from "./GDGLogo";
import { LINKS } from "@/constants";

export default function Footer() {
  const nav = [
    { href: "/", label: "Home", icon: Home },
    { href: "/departments", label: "Departments", icon: LayoutGrid },
    { href: "/auth/signin", label: "Sign in", icon: LogIn },
  ];

  const socials = [
    { label: "Instagram", href: LINKS.instagram },
    { label: "Discord", href: LINKS.discord },
    { label: "LinkedIn", href: LINKS.linkedin },
    { label: "Email", href: LINKS.gmail },
  ];

  return (
    <footer className="px-4 sm:px-6 pb-8 pt-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="glass mx-auto max-w-6xl rounded-[28px] px-6 sm:px-10 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8"
      >
        <div>
          <div className="flex items-center gap-3">
            <GDGLogo size={32} />
            <div>
              <p className="font-bold leading-tight">Google Developer Groups</p>
              <p className="text-sm text-[#8b92a5]">Recruitment Portal</p>
            </div>
          </div>
          <p className="text-sm text-[#4a5163] mt-4 leading-relaxed max-w-xs">
            A community of students building, learning and growing together with
            Google&apos;s developer technologies.
          </p>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#8b92a5] mb-4">
            Explore
          </p>
          <nav className="flex flex-col gap-3 text-sm font-medium text-[#4a5163]">
            {nav.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="flex items-center gap-2 hover:text-[#4285F4] transition-colors w-fit"
              >
                <l.icon size={15} /> {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-[#8b92a5] mb-4">
            Connect
          </p>
          <div className="flex flex-wrap gap-2">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="neu-sm neu-press px-4 py-2 rounded-full text-sm font-semibold text-[#4a5163]"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </motion.div>

      <p className="text-center text-xs text-[#a4aabf] mt-6">
        © {new Date().getFullYear()} Google Developer Groups · Built with the
        Google colors
      </p>
    </footer>
  );
}
