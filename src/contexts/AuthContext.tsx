import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import type { Session, User } from "@supabase/supabase-js";

import { refreshSessionManually, supabase } from "@/lib/supabaseClient";

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  initializing: boolean;
  isAdmin: boolean | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function loadAdminState(user: User | null): Promise<boolean> {
  if (!user) return false;

  const metadataAdmin = Boolean(user.user_metadata?.is_admin);
  try {
    const { data, error } = await supabase
      .from("admin_users")
      .select("is_admin")
      .eq("id", user.id)
      .maybeSingle();

    if (error) throw error;
    return Boolean(data?.is_admin || metadataAdmin);
  } catch (error) {
    console.warn("[AuthContext] Falling back to auth metadata for admin state.", error);
    return metadataAdmin;
  }
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [initializing, setInitializing] = useState(true);

  const resolveAdminState = useCallback(async (nextSession: Session | null) => {
    setSession(nextSession);

    if (!nextSession?.user) {
      setIsAdmin(false);
      setInitializing(false);
      return;
    }

    const nextIsAdmin = await loadAdminState(nextSession.user);
    setIsAdmin(nextIsAdmin);
    setInitializing(false);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const boot = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error("[AuthContext] Failed to load session.", error);
        }
        if (!cancelled) {
          await resolveAdminState(data.session ?? null);
        }
      } catch (error) {
        console.error("[AuthContext] Unexpected session boot error.", error);
        if (!cancelled) {
          setSession(null);
          setIsAdmin(false);
          setInitializing(false);
        }
      }
    };

    void boot();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (cancelled) return;
      void resolveAdminState(nextSession);
    });

    const handleVisible = () => {
      if (document.visibilityState === "visible") {
        void refreshSessionManually();
      }
    };

    window.addEventListener("focus", handleVisible);
    document.addEventListener("visibilitychange", handleVisible);

    return () => {
      cancelled = true;
      authListener.subscription.unsubscribe();
      window.removeEventListener("focus", handleVisible);
      document.removeEventListener("visibilitychange", handleVisible);
    };
  }, [resolveAdminState]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      initializing,
      isAdmin,
      signIn: async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      },
      signUp: async (name: string, email: string, password: string) => {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              display_name: name,
            },
          },
        });

        if (error) throw error;
        return Boolean(data.session);
      },
      signOut: async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      },
      requestPasswordReset: async (email: string) => {
        const redirectTo =
          typeof window === "undefined" ? undefined : `${window.location.origin}/auth/reset-password`;
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
        if (error) throw error;
      },
      updatePassword: async (password: string) => {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
      },
    }),
    [initializing, isAdmin, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }
  return context;
}
