import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

let browserClient: SupabaseClient | null = null;
let browserClientKey = "";

export function getSupabaseBrowserClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  const cacheKey = `${url}|${key}`;
  if (!browserClient || browserClientKey !== cacheKey) {
    browserClient = createClient(url, key);
    browserClientKey = cacheKey;
  }
  return browserClient;
}

export function getSupabaseServerClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

/**
 * In Supabase mode, derives actor identity from the verified Bearer session token
 * rather than trusting a spoofable client-provided userId. In local Demo Mode, accepts fallbackBodyUserId.
 */
export async function resolveActorId(
  request: Request,
  fallbackBodyUserId?: string,
): Promise<string | null> {
  if (!isSupabaseConfigured()) {
    // Demo Mode trusts the client-provided id — but only outside production,
    // or when DEMO_MODE=true is set explicitly. A production deploy that
    // forgot its Supabase env vars must fail closed, not accept any userId.
    if (process.env.NODE_ENV === "production" && process.env.DEMO_MODE !== "true") {
      return null;
    }
    return fallbackBodyUserId?.trim() || null;
  }
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;
  if (!token) return null;
  const sb = getSupabaseServerClient();
  if (!sb) return null;
  const { data, error } = await sb.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user.id;
}

export async function getAuthHeaders(): Promise<Record<string, string>> {
  const sb = getSupabaseBrowserClient();
  if (!sb) return {};
  const { data } = await sb.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}
