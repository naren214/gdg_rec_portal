"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, Loader2, LogIn, UserPlus, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import GDGLogo from "@/components/GDGLogo";
import GDGLoader from "@/components/GDGLoader";
import { VIT_DOMAINS_PUBLIC } from "@/components/recruitmentConfig";

const inputClass =
  "w-full rounded-xl border border-black/10 bg-white/70 px-4 py-3 pl-11 text-[#1a1c22] placeholder:text-[#a4aabf] outline-none transition-all focus:border-[#4285F4] focus:ring-4 focus:ring-[#4285F4]/15";

export default function SignInPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [mode, setMode] = useState("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (session?.user && !isPending) router.push("/departments");
  }, [session, isPending, router]);

  if (isPending) return <main className="min-h-screen"><GDGLoader /></main>;
  if (session?.user) return <main className="min-h-screen"><GDGLoader label="Redirecting…" /></main>;

  const emailDomainOk =
    !email ||
    VIT_DOMAINS_PUBLIC.some((d) => email.toLowerCase().endsWith(`@${d}`));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (mode === "signup" && !name.trim()) {
      toast.error("Please enter your full name.");
      return;
    }
    if (mode === "signup" && !emailDomainOk) {
      toast.error(
        `Please use your official VIT email (${VIT_DOMAINS_PUBLIC.join(", ")}).`
      );
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "signup") {
        const res = await authClient.signUp.email({
          email,
          password,
          name,
          callbackURL: "/departments",
        });
        if (res?.error) toast.error(res.error.message || "Could not create account.");
        else {
          toast.success("Account created — welcome to GDG!");
          router.push("/departments");
        }
      } else {
        const res = await authClient.signIn.email({
          email,
          password,
          callbackURL: "/departments",
        });
        if (res?.error) toast.error(res.error.message || "Invalid credentials.");
        else {
          toast.success("Signed in successfully!");
          router.push("/departments");
        }
      }
    } catch (err) {
      console.error("Auth error:", err);
      toast.error(err?.message || "Authentication failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-7 rise-in">
          <div className="flex justify-center mb-4">
            <GDGLogo size={54} />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            GDG <span className="text-gradient">Recruitment</span>
          </h1>
          <p className="text-[#54596b] mt-2 text-sm">
            Sign in or create an account with your VIT email.
          </p>
        </div>

        <div
          className="glass-strong rounded-3xl p-7 sm:p-8 rise-in"
          style={{ animationDelay: "0.1s" }}
        >
          {/* Tabs */}
          <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl neu-inset mb-7">
            {[
              { id: "signin", label: "Sign in", icon: LogIn },
              { id: "signup", label: "Create account", icon: UserPlus },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setMode(tab.id)}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  mode === tab.id
                    ? "bg-white shadow-sm text-[#1a1c22]"
                    : "text-[#8a90a2] hover:text-[#1a1c22]"
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div className="relative">
                <User size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#4285F4]" />
                <Input
                  className={inputClass}
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}

            <div className="relative">
              <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#EA4335]" />
              <Input
                type="email"
                className={inputClass}
                placeholder="name@vitstudent.ac.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            {mode === "signup" && email && !emailDomainOk && (
              <p className="flex items-center gap-1.5 text-xs text-[#EA4335] -mt-2">
                <AlertCircle size={13} /> Only official VIT emails are accepted.
              </p>
            )}

            <div className="relative">
              <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#FBBC04]" />
              <Input
                type="password"
                className={inputClass}
                placeholder="Password (min. 8 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-white transition-all disabled:opacity-60 enabled:hover:scale-[1.02] mt-2"
              style={{ background: "linear-gradient(135deg,#4285F4,#34A853)" }}
            >
              {submitting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : mode === "signin" ? (
                <><LogIn size={18} /> Sign in</>
              ) : (
                <><UserPlus size={18} /> Create account</>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-[#a4aabf] mt-6">
            By continuing you agree to use your official student email.
          </p>
        </div>
      </div>
    </main>
  );
}
