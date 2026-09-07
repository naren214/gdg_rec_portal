"use client";

import React, { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import GDGLoader from "@/components/GDGLoader";

export default function SignOutPage() {
  const router = useRouter();
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    (async () => {
      try {
        const result = await authClient.signOut();

        if (result?.error) {
          throw new Error(result.error.message || "Sign out failed");
        }

        toast.success("Signed out successfully");
        router.replace("/");
        router.refresh();
      } catch (error) {
        console.error("Sign out error:", error);
        toast.error("Could not sign out. Please try again.");
      }
    })();
  }, [router]);

  return (
    <main className="min-h-screen">
      <GDGLoader label="Signing you out…" />
    </main>
  );
}
