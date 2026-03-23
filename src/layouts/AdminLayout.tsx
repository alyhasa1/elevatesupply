import { Outlet, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Bell,
  Search,
  LogOut,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminLayout() {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const initials = (user?.email || "AD").slice(0, 2).toUpperCase();

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
    { icon: Package, label: "Products", href: "/admin/products" },
    { icon: ShoppingCart, label: "Orders", href: "/admin/orders" },
    { icon: Users, label: "Accounts", href: "/admin/accounts" },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 font-sans">
      <aside className="w-64 bg-slate-950 text-slate-300 flex flex-col fixed inset-y-0 left-0 z-50">
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-md flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">Elevate Admin</span>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
          <div className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Catalog Operations
          </div>
          {navItems.map((item) => {
            const isActive = location.pathname === item.href || (item.href !== "/admin" && location.pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive ? "bg-indigo-600 text-white" : "hover:bg-slate-800 hover:text-white",
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-400")} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-sm font-medium text-white">
              {initials}
            </div>
            <div>
              <div className="text-sm font-medium text-white">{user?.email || "Admin user"}</div>
              <div className="text-xs text-slate-500">Shared Supabase admin</div>
            </div>
          </div>
          <button
            className="flex items-center space-x-2 text-sm text-slate-400 hover:text-white transition-colors w-full px-2 py-1.5 rounded-md hover:bg-slate-800"
            onClick={() => {
              void signOut();
            }}
          >
            <LogOut className="w-4 h-4" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Use the products page filters for live catalog search..."
              className="w-full pl-10 h-9 bg-slate-50 border-slate-200 focus-visible:ring-indigo-500"
            />
          </div>
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <Link to="/" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
              View Storefront
            </Link>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
