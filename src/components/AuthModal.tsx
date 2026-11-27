"use client";

import { useEffect, useState } from "react";
import { Award, Check, LogOut, Mail, Shield, X } from "lucide-react";
import { TRAILBLAZER_TIER_STYLES, getTierDisplayLabel } from "@/lib/domain";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase";
import { useApp } from "./AppProvider";
import { MemojiAvatar } from "./MemojiAvatar";

export function AuthModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { activeUser, profiles, switchDemoUser, refreshProfiles, mode } = useApp();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const supabaseEnabled = isSupabaseConfigured();

  async function handleGoogleAuth() {
    const sb = getSupabaseBrowserClient();
    if (!sb) return;
    setBusy(true);
    setMessage(null);
    try {
      const { error } = await sb.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/` },
      });
      if (error) throw error;
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Google sign-in failed");
      setBusy(false);
    }
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    const sb = getSupabaseBrowserClient();
    if (!sb) return;
    setBusy(true);
    setMessage(null);
    try {
      const { error } = await sb.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/` },
      });
      if (error) throw error;
      setMessage("Check your inbox for the login link.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not send login link");
    } finally {
      setBusy(false);
    }
  }

  async function handleSignOut() {
    const sb = getSupabaseBrowserClient();
    if (!sb) return;
    setBusy(true);
    try {
      await sb.auth.signOut();
      await refreshProfiles();
      onClose();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="animate-panel-in relative w-full max-w-lg rounded-2xl border border-black/15 bg-[#EAECE0] p-6 shadow-none"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-[#566151] hover:bg-black/5"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 id="auth-modal-title" className="font-display text-2xl font-bold text-[#1F271C]">
          Account &amp; Profiles
        </h2>
        <p className="mt-1 text-sm text-[#566151]">
          {mode === "supabase"
            ? "Sign in with Google or an email magic link."
            : "Choose a traveler profile to browse, vouch, or guide."}
        </p>

        {supabaseEnabled && (
          <div className="mt-4 space-y-3 rounded-xl border border-black/12 bg-[#F4F5ED] p-4">
            <button
              type="button"
              disabled={busy}
              onClick={handleGoogleAuth}
              className="inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-[#3D5236] px-4 py-2.5 text-sm font-semibold text-[#F4F5ED] transition hover:bg-[#2f4029] disabled:opacity-60"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81Z"
                />
              </svg>
              Continue with Google
            </button>

            <div className="flex items-center gap-3 text-[11px] font-medium uppercase tracking-wider text-[#566151]">
              <span className="h-px flex-1 bg-black/12" />
              or email link
              <span className="h-px flex-1 bg-black/12" />
            </div>

            <form onSubmit={handleMagicLink} className="flex gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="traveler@example.com"
                className="flex-1 rounded-full border border-black/12 bg-white px-4 py-2 text-sm text-[#1F271C] outline-none focus:border-[#3D5236]"
              />
              <button
                type="submit"
                disabled={busy}
                className="inline-flex items-center gap-1.5 rounded-full border border-black/12 bg-white px-4 py-2 text-xs font-semibold text-[#1F271C] transition hover:border-[#3D5236] disabled:opacity-60"
              >
                <Mail className="h-3.5 w-3.5" />
                Send Link
              </button>
            </form>

            {mode === "supabase" && activeUser && (
              <button
                type="button"
                disabled={busy}
                onClick={handleSignOut}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#566151] hover:text-[#1F271C]"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign out ({activeUser.displayName})
              </button>
            )}

            {message && <p className="text-xs font-medium text-[#3D5236]">{message}</p>}
          </div>
        )}

        <div className="mt-5">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#52635F]">
            <Shield className="h-3.5 w-3.5 text-[#C85A32]" />
            Traveler Profiles
          </div>
          <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
            {profiles.map((p) => {
              const selected = activeUser?.id === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    switchDemoUser(p.id);
                    onClose();
                  }}
                  className={`flex min-h-12 w-full items-center justify-between rounded-xl border p-3 text-left transition ${
                    selected
                      ? `${TRAILBLAZER_TIER_STYLES[p.tier].cardRing} bg-white`
                      : "border-black/12 bg-white hover:border-[#1B3B36]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <MemojiAvatar id={p.id} name={p.displayName} size={34} />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-[#1B3B36]">{p.displayName}</span>
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                            TRAILBLAZER_TIER_STYLES[p.tier].badge
                          }`}
                        >
                          {getTierDisplayLabel(p.tier)}
                        </span>
                        {p.isGuide && (
                          <span className="rounded-full border border-black/12 bg-[#EAECE0] px-2 py-0.5 text-[11px] font-medium text-[#3D5236]">
                            Local Guide
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-[#566151]">
                        {getTierDisplayLabel(p.tier)} · {p.trailblazerScore} pts
                        {p.guideRegion ? ` · ${p.guideRegion}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-[#D97706]" />
                    {selected && <Check className="h-4 w-4 text-[#C85A32]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
