import { Outlet, Link } from "react-router-dom";
import { Search, User, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { TRACKERS } from "@/lib/catalog/trackers";
import { useAuth } from "@/contexts/AuthContext";

export default function StorefrontLayout() {
  const { session, isAdmin, signOut } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f8] text-stone-900 font-sans">
      <div className="bg-rose-950 text-rose-100/80 text-xs py-2.5 font-medium tracking-wide">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex space-x-6">
            <span className="hidden sm:inline">
              Elevate Supply
            </span>
            <span className="font-semibold text-rose-300"> Dropshipping is easier than you think</span>
          </div>
          <div className="flex space-x-5">
            <Link to="/catalog" className="hover:text-white transition-colors">
              Catalog
            </Link>
            {session ? (
              <Link to="/orders" className="hover:text-white transition-colors">
                Orders
              </Link>
            ) : (
              <Link to="/auth/sign-in" className="hover:text-white transition-colors">
                Sign in
              </Link>
            )}
            {isAdmin ? (
              <Link to="/admin" className="hover:text-white transition-colors">
                Admin
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      <header className="bg-white border-b border-stone-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-5 flex items-center justify-between gap-8">
          <Link to="/" className="flex items-center space-x-3 shrink-0 group">
            <div className="w-9 h-9 bg-rose-900 rounded-lg flex items-center justify-center shadow-lg shadow-rose-900/20 group-hover:bg-rose-800 transition-colors">
              <Package className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-stone-900">
              Elevate<span className="text-rose-800">.</span>
            </span>
          </Link>

          <div className="flex-1 max-w-2xl relative hidden md:block">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 group-focus-within:text-rose-800 transition-colors" />
              <Input
                type="text"
                placeholder="Search from the catalog page by listing ID or product title..."
                className="w-full pl-11 pr-4 h-12 bg-stone-100/50 border-stone-200 focus-visible:ring-rose-800 focus-visible:border-rose-800 rounded-full shadow-inner transition-all"
              />
            </div>
          </div>

          <div className="flex items-center space-x-7 shrink-0">
            {session ? (
              <>
                <Link
                  to="/orders"
                  className="text-sm font-medium text-stone-600 hover:text-rose-800 flex items-center gap-2 transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden lg:inline">Orders</span>
                </Link>
                {isAdmin ? (
                  <Link
                    to="/admin"
                    className="text-sm font-medium text-stone-600 hover:text-rose-800 flex items-center gap-2 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden lg:inline">Admin</span>
                  </Link>
                ) : null}
                <button
                  type="button"
                  className="text-sm font-medium text-stone-600 hover:text-rose-800 transition-colors"
                  onClick={() => {
                    void signOut();
                  }}
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link
                to="/auth/sign-in"
                className="text-sm font-medium text-stone-600 hover:text-rose-800 flex items-center gap-2 transition-colors"
              >
                <User className="w-4 h-4" />
                <span className="hidden lg:inline">Sign in</span>
              </Link>
            )}
          </div>
        </div>

        <div className="container mx-auto px-4">
          <nav className="flex items-center space-x-8 py-3 overflow-x-auto no-scrollbar border-t border-stone-100">
            <Link to="/catalog" className="text-sm font-semibold text-stone-900 hover:text-rose-800 whitespace-nowrap transition-colors">
              All Products
            </Link>
            {TRACKERS.map((tracker) => (
              <Link
                key={tracker.id}
                to={`/catalog?tracker=${tracker.id}`}
                className="text-sm font-medium text-stone-600 hover:text-rose-800 whitespace-nowrap transition-colors"
              >
                {tracker.name}
              </Link>
            ))}
            <div className="flex-1"></div>
            <Link
              to="/admin/products"
              className="text-sm font-semibold text-rose-800 hover:text-rose-900 whitespace-nowrap transition-colors"
            >
              Manage Pricing
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-stone-950 text-stone-400 py-20 mt-20 border-t border-stone-900">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center space-x-3 mb-6 group">
              <div className="w-9 h-9 bg-rose-900 rounded-lg flex items-center justify-center shadow-lg shadow-rose-900/20 group-hover:bg-rose-800 transition-colors">
                <Package className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">
                Elevate<span className="text-rose-600">.</span>
              </span>
            </Link>
            <p className="text-sm mb-8 max-w-sm leading-relaxed text-stone-400">
              Your premium dropshipping and fulfilment network. Start selling and let us handle the logistics.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-6 tracking-wide uppercase text-xs">Categories</h4>
            <ul className="space-y-4 text-sm">
              {TRACKERS.slice(0, 5).map(tracker => (
                <li key={tracker.id}>
                  <Link to={`/catalog?tracker=${tracker.id}`} className="hover:text-rose-400 transition-colors">
                    {tracker.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-6 tracking-wide uppercase text-xs">Company</h4>
            <ul className="space-y-4 text-sm">
              <li>
                <Link to="/catalog" className="hover:text-rose-400 transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-rose-400 transition-colors">
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-rose-400 transition-colors">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-20 pt-8 border-t border-stone-900 text-xs flex flex-col md:flex-row justify-between items-center text-stone-500">
          <p>&copy; {new Date().getFullYear()} Elevate Supply Ltd. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0 font-medium tracking-wide">
            <span>UK Dropshipping</span>
            <span className="text-stone-700">&bull;</span>
            <span>Fast Fulfilment</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
