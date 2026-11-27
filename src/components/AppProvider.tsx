"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase";
import type { OfflinePocketCard, Profile } from "@/types/domain";
import { AuthModal } from "./AuthModal";

const ACTIVE_USER_KEY = "avishkaar_active_user_id";
const OFFLINE_CARDS_KEY = "avishkaar_offline_cards_v1";

interface AppContextValue {
  activeUser: Profile | null;
  profiles: Profile[];
  mode: "supabase" | "demo";
  geminiConfigured: boolean;
  offlineCards: OfflinePocketCard[];
  loadingAuth: boolean;
  switchDemoUser: (userId: string) => void;
  refreshProfiles: () => Promise<void>;
  openAuthModal: () => void;
  saveOfflineCard: (card: OfflinePocketCard) => void;
  removeOfflineCard: (placeId: string) => void;
  isSavedOffline: (placeId: string) => boolean;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeUserId, setActiveUserId] = useState<string>("11111111-1111-4111-8111-111111111106");
  const [mode, setMode] = useState<"supabase" | "demo">("demo");
  const [geminiConfigured, setGeminiConfigured] = useState(false);
  const [offlineCards, setOfflineCards] = useState<OfflinePocketCard[]>([]);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);

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
        const h = (await healthRes.json()) as {
          mode: "supabase" | "demo";
          geminiConfigured: boolean;
        };
        setMode(h.mode);
        setGeminiConfigured(h.geminiConfigured);
      }
    } catch {
      // Offline mode: retain cached state
    }
  }, []);

  useEffect(() => {
    const savedId = window.localStorage.getItem(ACTIVE_USER_KEY);
    if (savedId) setActiveUserId(savedId);

    try {
      const rawCards = window.localStorage.getItem(OFFLINE_CARDS_KEY);
      if (rawCards) setOfflineCards(JSON.parse(rawCards) as OfflinePocketCard[]);
    } catch {
      // Ignore corrupt localStorage
    }

    const init = async () => {
      await refreshProfiles();
      if (isSupabaseConfigured()) {
        const sb = getSupabaseBrowserClient();
        if (sb) {
          const { data } = await sb.auth.getUser();
          if (data.user) {
            setActiveUserId(data.user.id);
          }
        }
      }
      setLoadingAuth(false);
    };

    void init();
  }, [refreshProfiles]);

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
    profiles.find((p) => p.id === activeUserId) ?? profiles[profiles.length - 1] ?? null;

  return (
    <AppContext.Provider
      value={{
        activeUser,
        profiles,
        mode,
        geminiConfigured,
        offlineCards,
        loadingAuth,
        switchDemoUser,
        refreshProfiles,
        openAuthModal: () => setAuthModalOpen(true),
        saveOfflineCard,
        removeOfflineCard,
        isSavedOffline,
      }}
    >
      {children}
      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
