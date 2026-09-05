"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import GDGLoader from "@/components/GDGLoader";

export default function SignOutPage() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        await authClient.signOut();
        toast.success("Signed out successfully");
      } catch (error) {
        console.error("Sign out error:", error);
        toast.error("Failed to sign out");
      } finally {
        router.push("/");
        router.refresh();
      }
    })();
  }, [router]);

  return (
    <main className="min-h-screen">
      <GDGLoader label="Signing you out…" />
    </main>
  );
}
