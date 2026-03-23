import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error("Supabase URL and anon key must be provided via environment variables.");
}

const supabaseDebugEnabled = import.meta.env.DEV;
const supabaseDebugLog = (...args: unknown[]) => {
  if (supabaseDebugEnabled) console.log(...args);
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: false,
    detectSessionInUrl: true,
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
    storageKey: "elevate-auth-token",
  },
});

let lastRefreshTime = 0;
let refreshPromise: Promise<void> | null = null;
const MIN_REFRESH_INTERVAL = 60_000;

export async function refreshSessionManually(): Promise<boolean> {
  const now = Date.now();

  if (now - lastRefreshTime < MIN_REFRESH_INTERVAL) {
    supabaseDebugLog("[Supabase] Skipping refresh, too recent.");
    return true;
  }

  if (refreshPromise) {
    supabaseDebugLog("[Supabase] Refresh already running, awaiting existing promise.");
    await refreshPromise;
    return true;
  }

  lastRefreshTime = now;
  refreshPromise = (async () => {
    try {
      const { error } = await supabase.auth.refreshSession();
      if (error) {
        console.error("[Supabase] Manual refresh failed:", error.message);
      } else {
        supabaseDebugLog("[Supabase] Manual refresh successful.");
      }
    } finally {
      refreshPromise = null;
    }
  })();

  await refreshPromise;
  return true;
}
