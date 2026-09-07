"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import GDGLogo from "./GDGLogo";
import { LINKS } from "@/constants";

export default function Footer() {
  const nav = [
    { href: "/", label: "Home" },
    { href: "/departments", label: "Departments" },
    { href: "/auth/signin", label: "Sign in" },
  ];
  const socials = [
    { label: "Instagram", href: LINKS.instagram },
    { label: "Discord", href: LINKS.discord },
    { label: "LinkedIn", href: LINKS.linkedin },
    { label: "Email", href: LINKS.gmail },
  ];

  return (
    <footer className="border-t border-[#dadce0] bg-white">
      <div className="container-x grid gap-10 py-12 sm:grid-cols-[1.25fr_0.65fr_0.9fr] sm:gap-8">
        <div>
          <div className="flex items-center gap-3"><GDGLogo size={34} /><span className="text-lg font-bold tracking-[-0.03em]">GDG on Campus<br /><span className="font-normal text-[#5f6368]">VIT Chennai</span></span></div>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-[#5f6368]">A student community for people who want to learn openly, build with care, and share what they discover.</p>
        </div>
        <div>
          <p className="editorial-label">Explore</p>
          <nav className="mt-4 flex flex-col items-start gap-3">
            {nav.map((item) => <Link key={item.href} href={item.href} className="text-sm font-semibold text-[#202124] underline decoration-[#dadce0] underline-offset-4 hover:decoration-[#202124]">{item.label}</Link>)}
          </nav>
        </div>
        <div>
          <p className="editorial-label">Stay connected</p>
          <div className="mt-4 flex flex-col items-start gap-3">
            {socials.map((item) => <a key={item.label} href={item.href} target={item.href.startsWith("mailto:") ? undefined : "_blank"} rel={item.href.startsWith("mailto:") ? undefined : "noopener noreferrer"} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#202124] underline decoration-[#dadce0] underline-offset-4 hover:decoration-[#202124]">{item.label} <ArrowUpRight size={14} aria-hidden="true" /></a>)}
          </div>
        </div>
      </div>
      <div className="border-t border-[#dadce0]"><div className="container-x flex flex-col gap-2 py-5 text-xs text-[#5f6368] sm:flex-row sm:items-center sm:justify-between"><span>© {new Date().getFullYear()} GDG on Campus · VIT Chennai</span><span>Built for the people who build.</span></div></div>
    </footer>
  );
}
