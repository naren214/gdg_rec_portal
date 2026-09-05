"use client";

import React from "react";
import Link from "next/link";
import GDGLogo from "./GDGLogo";

const Footer = () => {
  return (
    <footer className="px-4 sm:px-6 pb-8 pt-10">
      <div className="glass mx-auto max-w-6xl rounded-3xl px-6 sm:px-10 py-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <GDGLogo size={30} />
          <div>
            <p className="font-bold leading-tight">Google Developer Groups</p>
            <p className="text-sm text-[#8a90a2]">Recruitment Portal</p>
          </div>
        </div>

        <nav className="flex items-center gap-6 text-sm font-medium text-[#54596b]">
          <Link href="/" className="hover:text-[#1a1c22] transition-colors">
            Home
          </Link>
          <Link
            href="/departments"
            className="hover:text-[#1a1c22] transition-colors"
          >
            Departments
          </Link>
          <Link
            href="/auth/signin"
            className="hover:text-[#1a1c22] transition-colors"
          >
            Sign in
          </Link>
        </nav>
      </div>
      <p className="text-center text-xs text-[#a4aabf] mt-5">
        © {new Date().getFullYear()} Google Developer Groups · Built with the
        Google colors
      </p>
    </footer>
  );
};

export default Footer;
