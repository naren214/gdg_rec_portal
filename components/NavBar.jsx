"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { LayoutGrid, ShieldCheck, LogOut, Menu, X, Home } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import GDGLogo from "./GDGLogo";
import PremiumButton from "./premium/Button";

const navItemClass = "inline-flex min-h-11 items-center gap-2 border-b-2 px-1 text-sm font-semibold transition-colors";

export default function NavBar() {
  const { data: session, isPending } = authClient.useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const user = session?.user;

  const handleSignOut = async () => {
    if (isSigningOut) return;

    setIsSigningOut(true);
    try {
      const result = await authClient.signOut();

      if (result?.error) {
        throw new Error(result.error.message || "Sign out failed");
      }

      setOpen(false);
      toast.success("Signed out successfully");
      router.replace("/");
      router.refresh();
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Could not sign out. Please try again.");
      setIsSigningOut(false);
    }
  };

  const links = [
    { href: "/", label: "Home", icon: Home },
    { href: "/departments", label: "Departments", icon: LayoutGrid },
    ...(user?.role === "admin" ? [{ href: "/admin", label: "Admin", icon: ShieldCheck }] : []),
  ];

  const NavLink = ({ href, label, icon: Icon }) => {
    const active = pathname === href;
    return (
      <Link
        href={href}
        onClick={() => setOpen(false)}
        className={`${navItemClass} ${
          active
            ? "border-[#202124] text-[#202124]"
            : "border-transparent text-[#5f6368] hover:border-[#9aa0a6] hover:text-[#202124]"
        }`}
      >
        <Icon size={16} aria-hidden="true" />
        {label}
      </Link>
    );
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/80 bg-[#f8f9fa]/72 shadow-[0_1px_0_rgba(60,64,67,0.10)] backdrop-blur-xl">
      <nav className="container-x flex min-h-16 items-center justify-between gap-6" aria-label="Main navigation">
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="GDG on Campus recruitment home">
          <GDGLogo size={31} />
          <span className="leading-tight">
            <span className="block text-[15px] font-bold tracking-[-0.02em]">GDG on Campus</span>
            <span className="block text-xs text-[#5f6368]">VIT Chennai · Recruitment</span>
          </span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <div className="flex h-16 items-center gap-5">
            {links.map((link) => <NavLink key={link.href} {...link} />)}
          </div>
          {isPending ? (
            <span className="text-sm text-[#80868b]">Loading</span>
          ) : user ? (
            <div className="flex items-center gap-3 border-l border-[#dadce0] pl-5">
              <span className="max-w-32 truncate text-sm text-[#5f6368]">{user.name || user.email}</span>
              <PremiumButton
                type="button"
                size="sm"
                variant="outline"
                onClick={handleSignOut}
                disabled={isSigningOut}
                aria-busy={isSigningOut}
              >
                <LogOut size={15} aria-hidden="true" /> {isSigningOut ? "Signing out…" : "Sign out"}
              </PremiumButton>
            </div>
          ) : (
            <Link href="/auth/signin"><PremiumButton size="sm">Sign in</PremiumButton></Link>
          )}
        </div>

        <button
          type="button"
          className="glass-control inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-[#202124] md:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-label="Toggle navigation menu"
        >
          {open ? <X size={19} /> : <Menu size={19} />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-white/70 bg-white/78 backdrop-blur-xl md:hidden"
          >
            <div className="container-x flex flex-col py-3">
              {links.map((link) => <NavLink key={link.href} {...link} />)}
              <div className="mt-4 border-t border-[#dadce0] pt-4">
                {user ? (
                  <PremiumButton
                    type="button"
                    className="w-full"
                    variant="outline"
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    aria-busy={isSigningOut}
                  >
                    <LogOut size={16} aria-hidden="true" /> {isSigningOut ? "Signing out…" : "Sign out"}
                  </PremiumButton>
                ) : (
                  <Link href="/auth/signin" onClick={() => setOpen(false)}><PremiumButton className="w-full">Sign in</PremiumButton></Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
