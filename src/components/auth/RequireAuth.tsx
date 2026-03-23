import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "@/contexts/AuthContext";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { session, initializing } = useAuth();
  const location = useLocation();

  if (initializing) {
    return <div className="min-h-screen bg-[#faf9f8] flex items-center justify-center text-stone-500">Loading account…</div>;
  }

  if (!session) {
    return <Navigate to="/auth/sign-in" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
