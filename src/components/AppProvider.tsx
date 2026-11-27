"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { LayoutGroup } from "motion/react";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase";
import type { OfflinePocketCard, Profile } from "@/types/domain";
import { AuthModal } from "./AuthModal";

const ACTIVE_USER_KEY = "avishkaar_active_user_id";
const OFFLINE_CARDS_KEY = "avishkaar_offline_cards_v1";
const DEFAULT_DEMO_USER_ID = "11111111-1111-4111-8111-111111111106";

interface AppContextValue {
  activeUser: Profile | null;
  profiles: Profile[];
  mode: "supabase" | "demo";
  offlineCards: OfflinePocketCard[];
  preloaderDone: boolean;
  markPreloaderDone: () => void;
  enteredHome: boolean;
  enterHome: () => void;
  switchDemoUser: (userId: string) => void;
  refreshProfiles: () => Promise<void>;
  openAuthModal: () => void;
  saveOfflineCard: (card: OfflinePocketCard) => void;
  removeOfflineCard: (placeId: string) => void;
  isSavedOffline: (placeId: string) => boolean;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const supabaseMode = isSupabaseConfigured();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeUserId, setActiveUserId] = useState<string>(
    supabaseMode ? "" : DEFAULT_DEMO_USER_ID,
  );
  const [mode, setMode] = useState<"supabase" | "demo">(supabaseMode ? "supabase" : "demo");
  const [offlineCards, setOfflineCards] = useState<OfflinePocketCard[]>([]);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [preloaderDone, setPreloaderDone] = useState(false);
  const [enteredHome, setEnteredHome] = useState(false);
  const markPreloaderDone = useCallback(() => setPreloaderDone(true), []);
  const enterHome = useCallback(() => setEnteredHome(true), []);

  const refreshProfiles = useCallback(async () => {
    try {
      const [profRes, healthRes] = await Promise.all([
        fetch("/api/profile", { cache: "no-store" }),
        fetch("/api/health", { cache: "no-store" }),
      ]);
      if (profRes.ok) {
        const data = (await profRes.json()) as { profiles: Profile[] };
        setProfiles(data.profiles ?? []);
      }
      if (healthRes.ok) {
        const h = (await healthRes.json()) as { mode: "supabase" | "demo" };
        setMode(h.mode);
      }
    } catch {
      // Offline mode: retain cached state
    }
  }, []);

  useEffect(() => {
    if (!supabaseMode) {
      const savedId = window.localStorage.getItem(ACTIVE_USER_KEY);
      if (savedId) setActiveUserId(savedId);
    }

    try {
      const rawCards = window.localStorage.getItem(OFFLINE_CARDS_KEY);
      if (rawCards) setOfflineCards(JSON.parse(rawCards) as OfflinePocketCard[]);
    } catch {
      // Ignore corrupt localStorage
    }

    let unsubscribe: (() => void) | undefined;
    const init = async () => {
      await refreshProfiles();
      if (supabaseMode) {
        const sb = getSupabaseBrowserClient();
        if (sb) {
          const { data } = await sb.auth.getUser();
          setActiveUserId(data.user?.id ?? "");
          const { data: sub } = sb.auth.onAuthStateChange((_event, session) => {
            setActiveUserId(session?.user?.id ?? "");
          });
          unsubscribe = () => sub.subscription.unsubscribe();
        }
      }
    };

    void init();
    return () => unsubscribe?.();
  }, [refreshProfiles, supabaseMode]);

  const switchDemoUser = useCallback((userId: string) => {
    setActiveUserId(userId);
    window.localStorage.setItem(ACTIVE_USER_KEY, userId);
  }, []);

  const saveOfflineCard = useCallback((card: OfflinePocketCard) => {
    setOfflineCards((prev) => {
      const next = [card, ...prev.filter((c) => c.placeId !== card.placeId)];
      window.localStorage.setItem(OFFLINE_CARDS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const removeOfflineCard = useCallback((placeId: string) => {
    setOfflineCards((prev) => {
      const next = prev.filter((c) => c.placeId !== placeId);
      window.localStorage.setItem(OFFLINE_CARDS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const isSavedOffline = useCallback(
    (placeId: string) => offlineCards.some((c) => c.placeId === placeId),
    [offlineCards],
  );

  const activeUser =
    (activeUserId ? profiles.find((p) => p.id === activeUserId) : undefined) ??
    (mode === "demo" ? profiles[profiles.length - 1] : null) ??
    null;

  return (
    <AppContext.Provider
      value={{
        activeUser,
        profiles,
        mode,
        offlineCards,
        preloaderDone,
        markPreloaderDone,
        enteredHome,
        enterHome,
        switchDemoUser,
        refreshProfiles,
        openAuthModal: () => setAuthModalOpen(true),
        saveOfflineCard,
        removeOfflineCard,
        isSavedOffline,
      }}
    >
      <LayoutGroup>
        <div className="min-h-dvh w-full bg-[#EAECE0]">
          {children}
        </div>
      </LayoutGroup>
      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}

export function MainShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { enteredHome } = useApp();
  const isLanding = pathname === "/" && !enteredHome;
  return (
    <main
      className={
        isLanding
          ? "min-h-dvh w-full"
          : "mx-auto max-w-[1440px] px-4 pb-16 pt-6 sm:px-6 md:pl-24 lg:px-8 lg:pl-28"
      }
    >
      {children}
    </main>
  );
}
