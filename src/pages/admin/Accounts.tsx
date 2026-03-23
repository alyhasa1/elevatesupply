import { Info, ShieldEllipsis } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

export default function Accounts() {
  const { user, isAdmin } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Accounts</h1>
        <p className="text-slate-500">Shared Supabase auth is now active for this separated tracker site.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldEllipsis className="w-5 h-5 text-indigo-600" />
            Shared account state
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-600">
          <p>
            Signed in as <span className="font-medium text-slate-900">{user?.email || "unknown user"}</span>.
          </p>
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 flex items-start gap-3">
            <Info className="w-4 h-4 text-slate-500 mt-0.5" />
            <span>
              {isAdmin
                ? "This account currently has admin access for pricing and order management."
                : "This account can use storefront checkout and order history, but not admin tools."}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
