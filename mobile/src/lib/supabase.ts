import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const isBrowserWeb = typeof window !== "undefined" && typeof document !== "undefined";

export function getSupabaseConfig(): { url: string; anonKey: string } | null {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anonKey) return null;
  return { url, anonKey };
}

export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseConfig());
}

export function getApiBaseUrl(): string | undefined {
  const raw = process.env.EXPO_PUBLIC_API_URL?.trim();
  return raw ? raw.replace(/\/$/, "") : undefined;
}

let client: SupabaseClient | null = null;
let clientKey = "";

export function getSupabaseClient(): SupabaseClient | null {
  const cfg = getSupabaseConfig();
  if (!cfg) return null;
  const cacheKey = `${cfg.url}|${cfg.anonKey}`;
  if (!client || clientKey !== cacheKey) {
    client = createClient(cfg.url, cfg.anonKey, {
      auth: {
        storage: isBrowserWeb ? undefined : AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: isBrowserWeb,
      },
    });
    clientKey = cacheKey;
  }
  return client;
}

export async function getAuthHeaders(): Promise<Record<string, string>> {
  const sb = getSupabaseClient();
  if (!sb) return {};
  const { data } = await sb.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}
