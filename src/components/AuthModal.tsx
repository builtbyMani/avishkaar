"use client";

import { useEffect, useState } from "react";
import { Award, Check, LogIn, Shield, X } from "lucide-react";
import { TRAILBLAZER_TIER_STYLES } from "@/lib/domain";
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
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
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

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    const sb = getSupabaseBrowserClient();
    if (!sb) return;
    setBusy(true);
    setMessage(null);
    try {
      const res = isSignUp
        ? await sb.auth.signUp({ email, password })
        : await sb.auth.signInWithPassword({ email, password });
      if (res.error) throw res.error;
      await refreshProfiles();
      setMessage(isSignUp ? "Account created! Check email if verification is enabled." : "Signed in!");
      onClose();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogleAuth() {
    const sb = getSupabaseBrowserClient();
    if (!sb) return;
    await sb.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="relative w-full max-w-lg rounded-2xl border border-[#E8E0D4] bg-[#FAF7F2] p-6 shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-[#52635F] hover:bg-[#E8E0D4]"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 id="auth-modal-title" className="font-display text-2xl font-bold text-[#1B3B36]">
          Account &amp; Profiles
        </h2>
        <p className="mt-1 text-sm text-[#52635F]">
          {mode === "supabase"
            ? "Sign in with Email or Google."
            : "Choose a traveler profile to browse, vouch, or guide."}
        </p>

        {supabaseEnabled && (
          <div className="mt-4 rounded-xl border border-[#E8E0D4] bg-white p-4">
            <form onSubmit={handleEmailAuth} className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1B3B36]">
                  {isSignUp ? "Create Supabase Account" : "Supabase Email Login"}
                </span>
                <button
                  type="button"
                  onClick={() => setIsSignUp((v) => !v)}
                  className="text-xs font-semibold text-[#C85A32] hover:underline"
                >
                  {isSignUp ? "Have an account? Sign in" : "Need an account? Sign up"}
                </button>
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="traveler@example.com"
                className="w-full rounded-lg border border-[#E8E0D4] px-3 py-2 text-sm outline-none focus:border-[#C85A32]"
              />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password (min 6 chars)"
                className="w-full rounded-lg border border-[#E8E0D4] px-3 py-2 text-sm outline-none focus:border-[#C85A32]"
              />
              <div className="flex flex-wrap gap-2">
                <button
                  type="submit"
                  disabled={busy}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#1B3B36] px-4 py-2 text-sm font-semibold text-white hover:bg-[#142c28] disabled:opacity-60"
                >
                  <LogIn className="h-4 w-4" />
                  {isSignUp ? "Sign Up" : "Sign In"}
                </button>
                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#E8E0D4] bg-white px-4 py-2 text-sm font-semibold text-[#1B3B36] hover:bg-stone-50"
                >
                  Continue with Google
                </button>
              </div>
              {message && <p className="text-xs font-medium text-[#C85A32]">{message}</p>}
            </form>
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
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                            TRAILBLAZER_TIER_STYLES[p.tier].badge
                          }`}
                        >
                          {p.tier}
                        </span>
                        {p.isGuide && (
                          <span className="rounded-full border border-teal-300 bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-900">
                            Guide
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-[#52635F]">
                        {p.tier} · {p.trailblazerScore} Trailblazer pts
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
