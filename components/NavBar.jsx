"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutGrid, ShieldCheck, LogOut, Menu, X, Home } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import GDGLogo from "./GDGLogo";
import PremiumButton from "./premium/Button";

const NavBar = () => {
  const { data: session, isPending } = authClient.useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const user = session?.user;
  const isAdmin = user?.role === "admin";

  const links = [
    { href: "/", label: "Home", icon: Home },
    { href: "/departments", label: "Departments", icon: LayoutGrid },
  ];
  if (user && isAdmin) {
    links.push({ href: "/admin", label: "Admin", icon: ShieldCheck });
  }

  const NavLink = ({ href, label, icon: Icon }) => {
    const active = pathname === href;
    return (
      <Link
        href={href}
        onClick={() => setOpen(false)}
        className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
          active ? "text-[#14181f]" : "text-[#4a5163] hover:text-[#14181f]"
        }`}
      >
        {active && (
          <motion.span
            layoutId="nav-pill"
            className="absolute inset-0 rounded-full bg-white shadow-sm"
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
          />
        )}
        <span className="relative flex items-center gap-2">
          <Icon size={15} />
          {label}
        </span>
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full px-3 sm:px-6 pt-3">
      <motion.nav
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={`glass mx-auto max-w-6xl rounded-2xl px-4 sm:px-6 py-3 flex items-center justify-between transition-shadow ${
          scrolled ? "shadow-[0_16px_40px_rgba(31,45,102,0.16)]" : ""
        }`}
      >
        <Link href="/" className="flex items-center gap-2.5 group">
          <motion.div whileHover={{ rotate: -8, scale: 1.08 }} transition={{ type: "spring", stiffness: 300, damping: 15 }}>
            <GDGLogo size={32} />
          </motion.div>
          <span className="font-bold text-lg leading-none tracking-tight">
            GDG <span className="text-gradient">Recruitment</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <NavLink key={l.href} {...l} />
          ))}
          <div className="mx-1 h-6 w-px bg-black/10" />
          {isPending ? (
            <span className="text-sm text-[#8b92a5] px-3">…</span>
          ) : user ? (
            <div className="flex items-center gap-2.5">
              <span className="text-sm text-[#4a5163] max-w-[140px] truncate">
                {user.name || user.email}
              </span>
              <Link href="/auth/signout">
                <PremiumButton size="sm" gradient="redYellow" className="!px-4 !py-2">
                  <LogOut size={14} /> Sign out
                </PremiumButton>
              </Link>
            </div>
          ) : (
            <Link href="/auth/signin">
              <PremiumButton size="sm">Sign in</PremiumButton>
            </Link>
          )}
        </div>

        <button
          className="md:hidden p-2 rounded-xl neu-sm neu-press"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </motion.nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden glass mx-auto max-w-6xl rounded-2xl mt-2 p-3 flex flex-col gap-1"
          >
            {links.map((l) => (
              <NavLink key={l.href} {...l} />
            ))}
            {user ? (
              <Link href="/auth/signout" onClick={() => setOpen(false)}>
                <PremiumButton gradient="redYellow" className="w-full mt-1">
                  <LogOut size={16} /> Sign out
                </PremiumButton>
              </Link>
            ) : (
              <Link href="/auth/signin" onClick={() => setOpen(false)}>
                <PremiumButton className="w-full mt-1">Sign in</PremiumButton>
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default NavBar;
