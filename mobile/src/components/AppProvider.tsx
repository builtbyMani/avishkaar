import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Linking from "expo-linking";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useSharedValue, type SharedValue } from "react-native-reanimated";
import { SEED_PROFILES } from "../data/seed";
import { ensureSupabaseProfile, listProfiles } from "../lib/store";
import { getSupabaseClient, isSupabaseConfigured } from "../lib/supabase";
import type { OfflinePocketCard, Profile } from "../types/domain";
import { AuthSheet } from "./AuthSheet";
import { ImpactModal } from "./ImpactModal";

const ACTIVE_USER_KEY = "avishkaar_mobile_active_user_id";
const OFFLINE_CARDS_KEY = "avishkaar_mobile_offline_cards_v1";
const DEFAULT_DEMO_USER_ID = "11111111-1111-4111-8111-111111111106";

interface AppContextValue {
  activeUser: Profile | null;
  profiles: Profile[];
  mode: "supabase" | "demo";
  supabaseConfigured: boolean;
  demoSandbox: boolean;
  enableDemoSandbox: () => void;
  disableDemoSandbox: () => void;
  offlineCards: OfflinePocketCard[];
  preloaderDone: boolean;
  markPreloaderDone: () => void;
  replayPreloader: () => void;
  enteredHome: boolean;
  enterHome: () => void;
  exitToLanding: () => void;
  switchDemoUser: (userId: string) => void;
  refreshProfiles: () => Promise<void>;
  openAuthModal: () => void;
  openImpactModal: () => void;
  saveOfflineCard: (card: OfflinePocketCard) => void;
  removeOfflineCard: (placeId: string) => void;
  isSavedOffline: (placeId: string) => boolean;
  scrollProgress: SharedValue<number>;
  feedVersion: number;
  bumpFeedVersion: () => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

function parseAuthParamsFromUrl(url: string): {
  accessToken?: string;
  refreshToken?: string;
  code?: string;
} {
  try {
    const [, hash = ""] = url.split("#");
    const [, queryWithHash = ""] = url.split("?");
    const query = queryWithHash.split("#")[0] || "";
    const hashParams = new URLSearchParams(hash);
    const queryParams = new URLSearchParams(query);
    return {
      accessToken: hashParams.get("access_token") ?? queryParams.get("access_token") ?? undefined,
      refreshToken: hashParams.get("refresh_token") ?? queryParams.get("refresh_token") ?? undefined,
      code: queryParams.get("code") ?? hashParams.get("code") ?? undefined,
    };
  } catch {
    return {};
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const supabaseConfigured = isSupabaseConfigured();
  const [demoSandbox, setDemoSandbox] = useState(false);
  const demoSandboxRef = useRef(demoSandbox);
  demoSandboxRef.current = demoSandbox;

  const effectiveDemo = !supabaseConfigured || demoSandbox;
  const mode: "supabase" | "demo" = effectiveDemo ? "demo" : "supabase";

  const [profiles, setProfiles] = useState<Profile[]>(
    effectiveDemo ? SEED_PROFILES : [],
  );
  const [activeUserId, setActiveUserId] = useState<string>(
    effectiveDemo ? DEFAULT_DEMO_USER_ID : "",
  );
  const [authUserMeta, setAuthUserMeta] = useState<{
    id: string;
    name: string;
    avatarUrl?: string;
  } | null>(null);
  const [offlineCards, setOfflineCards] = useState<OfflinePocketCard[]>([]);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [impactModalOpen, setImpactModalOpen] = useState(false);
  const [preloaderDone, setPreloaderDone] = useState(false);
  const [enteredHome, setEnteredHome] = useState(false);
  const [feedVersion, setFeedVersion] = useState(0);

  const scrollProgress = useSharedValue(0);

  const markPreloaderDone = useCallback(() => setPreloaderDone(true), []);
  const replayPreloader = useCallback(() => setPreloaderDone(false), []);
  const enterHome = useCallback(() => setEnteredHome(true), []);
  const exitToLanding = useCallback(() => setEnteredHome(false), []);
  const bumpFeedVersion = useCallback(() => setFeedVersion((v) => v + 1), []);

  const refreshProfiles = useCallback(async () => {
    try {
      const list = await listProfiles({ demoMode: !supabaseConfigured || demoSandboxRef.current });
      setProfiles(list);
    } catch {
      // Retain existing profiles offline
    }
  }, [supabaseConfigured]);

  const enableDemoSandbox = useCallback(() => {
    demoSandboxRef.current = true;
    setDemoSandbox(true);
    setActiveUserId(DEFAULT_DEMO_USER_ID);
    void AsyncStorage.setItem(ACTIVE_USER_KEY, DEFAULT_DEMO_USER_ID).catch(() => {});
  }, []);

  const disableDemoSandbox = useCallback(() => {
    demoSandboxRef.current = false;
    setDemoSandbox(false);
    setActiveUserId(authUserMeta?.id ?? "");
  }, [authUserMeta]);

  useEffect(() => {
    let cancelled = false;

    const loadSaved = async () => {
      try {
        const [savedId, rawCards] = await Promise.all([
          AsyncStorage.getItem(ACTIVE_USER_KEY),
          AsyncStorage.getItem(OFFLINE_CARDS_KEY),
        ]);
        if (!cancelled && (!supabaseConfigured || demoSandboxRef.current) && savedId) {
          setActiveUserId(savedId);
        }
        if (!cancelled && rawCards) {
          setOfflineCards(JSON.parse(rawCards) as OfflinePocketCard[]);
        }
      } catch {
        // Ignore storage read errors
      }
    };

    void loadSaved();
    return () => {
      cancelled = true;
    };
  }, [supabaseConfigured]);

  useEffect(() => {
    void refreshProfiles();
  }, [refreshProfiles, demoSandbox]);

  useEffect(() => {
    if (!supabaseConfigured) return;
    const sb = getSupabaseClient();
    if (!sb) return;

    const syncAuth = (
      user: { id: string; email?: string | null; user_metadata?: Record<string, unknown> } | null,
    ) => {
      if (!user) {
        if (!demoSandboxRef.current) setActiveUserId("");
        setAuthUserMeta(null);
        return;
      }
      demoSandboxRef.current = false;
      setDemoSandbox(false);
      const meta = user.user_metadata ?? {};
      const name =
        (typeof meta.full_name === "string" && meta.full_name) ||
        (typeof meta.name === "string" && meta.name) ||
        user.email?.split("@")[0] ||
        "Traveler";
      const avatarUrl = typeof meta.avatar_url === "string" ? meta.avatar_url : undefined;
      setActiveUserId(user.id);
      setAuthUserMeta({ id: user.id, name, avatarUrl });
      void ensureSupabaseProfile(user).then(() => refreshProfiles());
    };

    void sb.auth.getUser().then(({ data }) => syncAuth(data.user));
    const { data: sub } = sb.auth.onAuthStateChange((_event, session) => {
      syncAuth(session?.user ?? null);
      if (session?.user) {
        void refreshProfiles();
      }
    });

    const handleDeepLink = async (url: string) => {
      const { accessToken, refreshToken, code } = parseAuthParamsFromUrl(url);
      if (accessToken && refreshToken) {
        await sb.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
        await refreshProfiles();
      } else if (code) {
        await sb.auth.exchangeCodeForSession(code);
        await refreshProfiles();
      }
    };

    void Linking.getInitialURL().then((url) => {
      if (url) void handleDeepLink(url);
    });
    const linkSub = Linking.addEventListener("url", ({ url }) => {
      void handleDeepLink(url);
    });

    return () => {
      sub.subscription.unsubscribe();
      linkSub.remove();
    };
  }, [refreshProfiles, supabaseConfigured]);

  const switchDemoUser = useCallback((userId: string) => {
    setActiveUserId(userId);
    void AsyncStorage.setItem(ACTIVE_USER_KEY, userId).catch(() => {});
  }, []);

  const saveOfflineCard = useCallback((card: OfflinePocketCard) => {
    setOfflineCards((prev) => {
      const next = [card, ...prev.filter((c) => c.placeId !== card.placeId)];
      void AsyncStorage.setItem(OFFLINE_CARDS_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const removeOfflineCard = useCallback((placeId: string) => {
    setOfflineCards((prev) => {
      const next = prev.filter((c) => c.placeId !== placeId);
      void AsyncStorage.setItem(OFFLINE_CARDS_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const isSavedOffline = useCallback(
    (placeId: string) => offlineCards.some((c) => c.placeId === placeId),
    [offlineCards],
  );

  const activeUser: Profile | null =
    (activeUserId ? profiles.find((p) => p.id === activeUserId) : undefined) ??
    (mode === "supabase" && authUserMeta
      ? {
          id: authUserMeta.id,
          username: authUserMeta.name.toLowerCase().replace(/[^a-z0-9]+/g, "_"),
          displayName: authUserMeta.name,
          avatarUrl: authUserMeta.avatarUrl,
          trailblazerScore: 0,
          tier: "Wanderer",
          isGuide: false,
          isVerifiedLocal: false,
          guideRegion: null,
          languages: ["English"],
        }
      : undefined) ??
    (mode === "demo" ? profiles[profiles.length - 1] ?? SEED_PROFILES[SEED_PROFILES.length - 1] : null) ??
    null;

  return (
    <AppContext.Provider
      value={{
        activeUser,
        profiles,
        mode,
        supabaseConfigured,
        demoSandbox,
        enableDemoSandbox,
        disableDemoSandbox,
        offlineCards,
        preloaderDone,
        markPreloaderDone,
        replayPreloader,
        enteredHome,
        enterHome,
        exitToLanding,
        switchDemoUser,
        refreshProfiles,
        openAuthModal: () => setAuthModalOpen(true),
        openImpactModal: () => setImpactModalOpen(true),
        saveOfflineCard,
        removeOfflineCard,
        isSavedOffline,
        scrollProgress,
        feedVersion,
        bumpFeedVersion,
      }}
    >
      {children}
      <AuthSheet open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      <ImpactModal open={impactModalOpen} onClose={() => setImpactModalOpen(false)} />
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
