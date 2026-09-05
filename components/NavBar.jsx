"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, ShieldCheck, LogOut, Menu, X } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import GDGLogo from "./GDGLogo";

const NavBar = () => {
  const { data: session, isPending } = authClient.useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const user = session?.user;
  const isAdmin = user?.role === "admin";

  const links = [{ href: "/departments", label: "Departments", icon: LayoutGrid }];
  if (user && isAdmin) {
    links.push({ href: "/admin", label: "Admin", icon: ShieldCheck });
  }

  const NavLink = ({ href, label, icon: Icon }) => (
    <Link
      href={href}
      onClick={() => setOpen(false)}
      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
        pathname === href
          ? "bg-white/80 text-[#1a1c22] shadow-sm"
          : "text-[#54596b] hover:text-[#1a1c22] hover:bg-white/60"
      }`}
    >
      <Icon size={16} />
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 w-full px-3 sm:px-6 pt-3">
      <nav className="glass mx-auto max-w-6xl rounded-2xl px-4 sm:px-6 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <GDGLogo size={32} />
          <span className="font-bold text-lg leading-none tracking-tight">
            GDG <span className="text-gradient">Recruitment</span>
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-2">
          {links.map((l) => (
            <NavLink key={l.href} {...l} />
          ))}
          <div className="mx-1 h-6 w-px bg-black/10" />
          {isPending ? (
            <span className="text-sm text-[#8a90a2] px-2">Loading…</span>
          ) : user ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#54596b] hidden lg:inline">
                {user.name || user.email}
              </span>
              <Link
                href="/auth/signout"
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium text-white transition-transform hover:scale-[1.03]"
                style={{ background: "linear-gradient(135deg,#EA4335,#FBBC04)" }}
              >
                <LogOut size={15} /> Sign out
              </Link>
            </div>
          ) : (
            <Link
              href="/auth/signin"
              className="px-5 py-2 rounded-full text-sm font-semibold text-white transition-transform hover:scale-[1.03]"
              style={{ background: "linear-gradient(135deg,#4285F4,#34A853)" }}
            >
              Sign in
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 rounded-xl neu-sm"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden glass mx-auto max-w-6xl rounded-2xl mt-2 p-3 flex flex-col gap-1 rise-in">
          {links.map((l) => (
            <NavLink key={l.href} {...l} />
          ))}
          {user ? (
            <Link
              href="/auth/signout"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white justify-center mt-1"
              style={{ background: "linear-gradient(135deg,#EA4335,#FBBC04)" }}
            >
              <LogOut size={16} /> Sign out
            </Link>
          ) : (
            <Link
              href="/auth/signin"
              onClick={() => setOpen(false)}
              className="px-4 py-2 rounded-full text-sm font-semibold text-white text-center mt-1"
              style={{ background: "linear-gradient(135deg,#4285F4,#34A853)" }}
            >
              Sign in
            </Link>
          )}
        </div>
      )}
    </header>
  );
};

export default NavBar;
