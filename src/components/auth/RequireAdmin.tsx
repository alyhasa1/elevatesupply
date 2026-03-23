import { Navigate } from "react-router-dom";

import { useAuth } from "@/contexts/AuthContext";

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { session, initializing, isAdmin } = useAuth();

  if (initializing || isAdmin === null) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">Loading admin…</div>;
  }

  if (!session) {
    return <Navigate to="/auth/sign-in" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/orders" replace />;
  }

  return <>{children}</>;
}
