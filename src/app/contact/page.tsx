"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, Info, Mail, ShieldCheck } from "@/components/Icons";
import { VOLUNTEER_GUIDE_DISCLAIMERS } from "@/lib/domain";

const TOPICS = [
  "General Feedback & Question",
  "Report Map Pin / Safety Update",
  "Volunteer Guide Inquiry",
  "Local Artisan or Homestay Listing",
] as const;

const SUPPORT_EMAIL = "community@avishkaar.travel";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState<string>(TOPICS[0]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [mailtoHref, setMailtoHref] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !email.trim() || message.trim().length < 10) {
      setError("Please enter your name, email address, and a message of at least 10 characters.");
      return;
    }

    const subject = `[Avishkaar] ${topic} — ${name.trim()}`;
    const body = `From: ${name.trim()} (${email.trim()})\nTopic: ${topic}\n\n${message.trim()}`;
    const href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setMailtoHref(href);
    window.location.href = href;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      <header className="rounded-3xl border border-[#2B141A]/12 bg-[#FAF7F0] p-6 sm:p-8">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#D9A12B]/40 bg-[#D9A12B]/15 px-3 py-1 text-xs font-semibold text-[#2B141A]">
          <Mail className="h-3.5 w-3.5 text-[#6B1D2F]" />
          Contact Avishkaar
        </span>
        <h1 className="mt-3 font-rozha text-3xl text-[#6B1D2F] sm:text-4xl">
          Reach our community stewards
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#61454D]">
          Spot an outdated trail pin, need to flag a safety issue, or want to suggest a local
          artisan family for verification? Send a note directly below.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-12">
        <aside className="space-y-4 lg:col-span-5">
          <div className="rounded-2xl border border-[#E8E0D4] bg-white p-5 space-y-3">
            <h2 className="font-display text-xl font-bold text-[#6B1D2F]">Direct Email</h2>
            <p className="text-xs leading-relaxed text-[#52635F]">
              For urgent map pin fixes, safety escalations, or local community onboarding:
            </p>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="inline-flex items-center gap-2 rounded-xl border border-[#6B1D2F]/25 bg-[#FAF7F2] px-4 py-2.5 text-xs font-bold text-[#6B1D2F] hover:border-[#6B1D2F]"
            >
              <Mail className="h-4 w-4" />
              {SUPPORT_EMAIL}
            </a>
            <div className="pt-2 border-t border-[#E8E0D4] flex flex-wrap gap-3 text-xs font-bold">
              <Link href="/about" className="inline-flex items-center gap-1 text-[#6B1D2F] underline">
                <Info className="h-3.5 w-3.5" /> Read About Us
              </Link>
              <Link href="/" className="text-[#C85A32] underline">
                Back to Explore
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50/75 p-5 space-y-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#6B1D2F]" />
              <h3 className="text-sm font-bold text-[#6B1D2F]">Volunteer Guide Note</h3>
            </div>
            <p className="text-xs leading-relaxed text-amber-950">
              {VOLUNTEER_GUIDE_DISCLAIMERS.points[0]} {VOLUNTEER_GUIDE_DISCLAIMERS.points[1]}
            </p>
          </div>
        </aside>

        <section className="rounded-2xl border border-[#E8E0D4] bg-white p-6 lg:col-span-7">
          <h2 className="font-display text-2xl font-bold text-[#6B1D2F]">Send a Message</h2>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs font-bold text-[#6B1D2F]">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Aarav Sharma"
                  className="mt-1 w-full rounded-xl border border-[#D8CDBE] bg-[#FAF7F0] px-3 py-2 text-sm text-[#2B141A]"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#6B1D2F]">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-1 w-full rounded-xl border border-[#D8CDBE] bg-[#FAF7F0] px-3 py-2 text-sm text-[#2B141A]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#6B1D2F]">Topic</label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#D8CDBE] bg-[#FAF7F0] px-3 py-2 text-sm font-semibold text-[#2B141A]"
              >
                {TOPICS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#6B1D2F]">Message</label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Share destination details, map coordinates, safety feedback, or questions..."
                className="mt-1 w-full rounded-xl border border-[#D8CDBE] bg-[#FAF7F0] px-3 py-2 text-sm text-[#2B141A]"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-900">
                {error}
              </div>
            )}

            {mailtoHref && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-950 flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 font-semibold">
                  <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                  Email draft prepared for {SUPPORT_EMAIL}.
                </span>
                <a href={mailtoHref} className="font-bold text-[#6B1D2F] underline">
                  Open Email Client
                </a>
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-[#6B1D2F] px-5 py-3 text-sm font-bold text-[#F5F0E6] transition hover:bg-[#82253A] sm:w-auto"
            >
              Compose Email to Stewards
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
