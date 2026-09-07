"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, LogIn, Mail, User, UserPlus } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import GDGLogo from "@/components/GDGLogo";
import GDGLoader from "@/components/GDGLoader";
import PremiumButton from "@/components/premium/Button";
import { VIT_DOMAINS_PUBLIC } from "@/components/recruitmentConfig";

export default function SignInPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [mode, setMode] = useState("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { if (session?.user && !isPending) router.push("/departments"); }, [session, isPending, router]);
  if (isPending || session?.user) return <main className="min-h-screen"><GDGLoader label={session?.user ? "Redirecting…" : "Loading…"} /></main>;

  const emailDomainOk = !email || VIT_DOMAINS_PUBLIC.some((domain) => email.toLowerCase().endsWith(`@${domain}`));
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!email || !password) return toast.error("Please fill in all fields.");
    if (mode === "signup" && !name.trim()) return toast.error("Please enter your full name.");
    if (mode === "signup" && !emailDomainOk) return toast.error(`Please use your official VIT email (${VIT_DOMAINS_PUBLIC.join(", ")}).`);
    if (password.length < 8) return toast.error("Password must be at least 8 characters.");
    setSubmitting(true);
    try {
      const result = mode === "signup"
        ? await authClient.signUp.email({ email, password, name, callbackURL: "/departments" })
        : await authClient.signIn.email({ email, password, callbackURL: "/departments" });
      if (result?.error) toast.error(result.error.message || "Authentication failed.");
      else { toast.success(mode === "signup" ? "Account created — welcome to GDG!" : "Signed in successfully!"); router.push("/departments"); }
    } catch (error) { console.error("Auth error:", error); toast.error("Authentication failed. Please try again."); }
    finally { setSubmitting(false); }
  };

  return (
    <main className="min-h-screen px-5 py-8 sm:px-8 sm:py-12">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl overflow-hidden rounded-[1.75rem] border border-[#dadce0] bg-white lg:grid-cols-[0.9fr_1.1fr]">
        <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.55 }} className="hidden bg-[#202124] p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div><GDGLogo size={42} /><p className="mt-10 text-sm font-bold uppercase tracking-[0.11em] text-[#bdc1c6]">GDG on Campus · VIT Chennai</p><h1 className="mt-5 max-w-md text-6xl font-bold leading-[0.91] tracking-[-0.065em]">Start with your curiosity.</h1><p className="mt-7 max-w-sm text-base leading-relaxed text-[#bdc1c6]">Choose a team, share how you think, and make something useful with people who care.</p></div>
          <div><div className="signal-rule" aria-hidden="true"><span /><span /><span /><span /></div><p className="mt-5 text-sm text-[#bdc1c6]">Official VIT student email required.</p></div>
        </motion.section>
        <motion.section initial={{ opacity: 0, x: 22 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="flex items-center px-6 py-12 sm:px-12">
          <div className="mx-auto w-full max-w-md"><div className="lg:hidden"><GDGLogo size={38} /></div><p className="mt-7 text-sm font-bold uppercase tracking-[0.1em] text-[#5f6368]">Recruitment portal</p><h2 className="mt-3 text-4xl font-bold tracking-[-0.055em]">{mode === "signup" ? "Create your account." : "Welcome back."}</h2><p className="mt-3 text-sm leading-relaxed text-[#5f6368]">Use your official VIT email to continue.</p>
            <div className="mt-8 grid grid-cols-2 border-b border-[#dadce0]" role="tablist" aria-label="Authentication mode">{[{ id: "signin", label: "Sign in", icon: LogIn }, { id: "signup", label: "Create account", icon: UserPlus }].map((tab) => <button key={tab.id} type="button" role="tab" aria-selected={mode === tab.id} onClick={() => setMode(tab.id)} className={`flex min-h-12 items-center justify-center gap-2 border-b-2 text-sm font-bold transition-colors ${mode === tab.id ? "border-[#202124] text-[#202124]" : "border-transparent text-[#80868b] hover:text-[#202124]"}`}><tab.icon size={16} aria-hidden="true" />{tab.label}</button>)}</div>
            <form onSubmit={handleSubmit} className="mt-7 space-y-4">{mode === "signup" && <label className="block"><span className="mb-1.5 block text-sm font-semibold">Full name</span><div className="relative"><User size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#5f6368]" aria-hidden="true" /><input className="field-input pl-10" autoComplete="name" placeholder="Your full name" value={name} onChange={(event) => setName(event.target.value)} /></div></label>}
              <label className="block"><span className="mb-1.5 block text-sm font-semibold">VIT email</span><div className="relative"><Mail size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#5f6368]" aria-hidden="true" /><input type="email" className="field-input pl-10" autoComplete="email" placeholder="name@vitstudent.ac.in" value={email} onChange={(event) => setEmail(event.target.value)} /></div>{mode === "signup" && email && !emailDomainOk && <p className="mt-2 text-xs font-medium text-[#d93025]">Only official VIT emails are accepted.</p>}</label>
              <label className="block"><span className="mb-1.5 block text-sm font-semibold">Password</span><div className="relative"><Lock size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#5f6368]" aria-hidden="true" /><input type="password" className="field-input pl-10" autoComplete={mode === "signup" ? "new-password" : "current-password"} placeholder="At least 8 characters" value={password} onChange={(event) => setPassword(event.target.value)} /></div></label>
              <PremiumButton type="submit" size="lg" disabled={submitting} className="mt-3 w-full">{submitting ? "Working…" : mode === "signin" ? "Sign in" : "Create account"}<ArrowRight size={17} aria-hidden="true" /></PremiumButton>
            </form><p className="mt-6 text-xs leading-relaxed text-[#80868b]">By continuing, you confirm that you are applying with your official student email.</p>
          </div>
        </motion.section>
      </div>
    </main>
  );
}
