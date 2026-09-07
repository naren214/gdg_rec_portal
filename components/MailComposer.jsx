"use client";

import React, { useState } from "react";
import { Send, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function MailComposer({ open, onOpenChange, recipients = [] }) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState(
    "Hi #name,\n\nCongratulations! We're excited to invite you to the next round for the #dept team at GDG.\n\nSee you soon!"
  );
  const [sending, setSending] = useState(false);

  const send = async () => {
    if (!subject.trim() || !body.trim()) {
      toast.error("Please add a subject and message.");
      return;
    }
    setSending(true);
    try {
      // Convert plain-text newlines to <br> for HTML email.
      const html = body
        .split("\n")
        .map((line) => `<p style="margin:0 0 10px">${line}</p>`)
        .join("");
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipients,
          payloadData: { subject, body: html },
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        toast.success(data.message || "Emails sent!");
        onOpenChange(false);
      } else {
        toast.error(data.error || "Failed to send emails");
      }
    } catch {
      toast.error("Network error while sending");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Mail size={20} className="text-[#4285F4]" /> Email{" "}
            {recipients.length} recipient{recipients.length === 1 ? "" : "s"}
          </DialogTitle>
          <DialogDescription>
            Use <code className="rounded bg-black/5 px-1">#name</code> for the
            applicant&apos;s name and{" "}
            <code className="rounded bg-black/5 px-1">#dept</code> for their
            department.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject"
            className="field-input text-sm"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={9}
            placeholder="Write your message…"
            className="field-input resize-y text-sm"
          />

          <div className="flex flex-wrap gap-1.5">
            {recipients.slice(0, 8).map((r) => (
              <span
                key={r.Email}
                className="text-xs px-2.5 py-1 rounded-full bg-black/5 text-[#54596b]"
              >
                {r.Name}
              </span>
            ))}
            {recipients.length > 8 && (
              <span className="text-xs px-2.5 py-1 text-[#8a90a2]">
                +{recipients.length - 8} more
              </span>
            )}
          </div>

          <button
            onClick={send}
            disabled={sending}
            className="w-full inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#202124] py-3 font-semibold text-white hover:bg-[#3c4043] disabled:opacity-60"
          >
            {sending ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
            Send emails
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
