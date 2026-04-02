import { Outlet, Link } from "react-router-dom";
import { Search, User, Package, Youtube, Instagram } from "lucide-react";
import { Input } from "@/components/ui/input";
import { TRACKERS } from "@/lib/catalog/trackers";
import { useAuth } from "@/contexts/AuthContext";

export default function StorefrontLayout() {
  const { session, isAdmin, signOut } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f8] text-stone-900 font-sans overflow-x-hidden">
      <div className="bg-orange-950 text-orange-100/80 text-xs py-2.5 font-medium tracking-wide">
        <div className="container max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div className="flex space-x-6">
            <span className="hidden sm:inline">
              Elevate Supply
            </span>
            <span className="font-semibold text-orange-300"> Dropshipping is easier than you think</span>
          </div>
          <div className="flex space-x-5">
            <Link to="/catalog" className="hover:text-orange-400 transition-colors">
              Catalog
            </Link>
            {session ? (
              <Link to="/orders" className="hover:text-orange-400 transition-colors">
                Orders
              </Link>
            ) : (
              <Link to="/auth/sign-in" className="hover:text-orange-400 transition-colors">
                Sign in
              </Link>
            )}
            {isAdmin ? (
              <Link to="/admin" className="hover:text-orange-400 transition-colors">
                Admin
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      <header className="bg-white border-b border-stone-200 sticky top-0 z-40">
        <div className="container max-w-7xl mx-auto px-4 py-5 flex items-center justify-between gap-8">
          <Link to="/" className="flex items-center gap-2 shrink-0 group">
            <img
              src="/logo.png"
              alt="Elevate Supply"
              className="h-10 w-auto object-contain"
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
            <span className="inline text-[22px] leading-none group-hover:text-orange-600 transition-colors" style={{ fontFamily: "'Outfit', sans-serif" }}>
              <span className="font-[700] text-stone-800 tracking-[-0.05em]">Elevate</span><span className="font-[300] text-orange-600 ml-[3px] tracking-[0.06em]">Supply</span>
            </span>
          </Link>

          <div className="flex-1 max-w-2xl relative hidden md:block">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 group-focus-within:text-orange-600 transition-colors" />
              <Input
                type="text"
                placeholder="Search from the catalog page by listing ID or product title..."
                className="w-full pl-11 pr-4 h-12 bg-stone-100/50 border-stone-200 focus-visible:ring-orange-600 focus-visible:border-orange-600 rounded-full shadow-inner transition-all"
              />
            </div>
          </div>

          <div className="flex items-center space-x-7 shrink-0">
            {session ? (
              <>
                <Link
                  to="/orders"
                  className="text-sm font-medium text-stone-600 hover:text-orange-600 flex items-center gap-2 transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden lg:inline">Orders</span>
                </Link>
                {isAdmin ? (
                  <Link
                    to="/admin"
                    className="text-sm font-medium text-stone-600 hover:text-orange-600 flex items-center gap-2 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden lg:inline">Admin</span>
                  </Link>
                ) : null}
                <button
                  type="button"
                  className="text-sm font-medium text-stone-600 hover:text-orange-600 transition-colors"
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
                className="text-sm font-medium text-stone-600 hover:text-orange-600 flex items-center gap-2 transition-colors"
              >
                <User className="w-4 h-4" />
                <span className="hidden lg:inline">Sign in</span>
              </Link>
            )}
          </div>
        </div>

        <div className="container max-w-7xl mx-auto px-4">
          <nav className="flex items-center space-x-8 py-3 overflow-x-auto no-scrollbar border-t border-stone-100">
            <Link to="/catalog" className="text-sm font-semibold text-stone-900 hover:text-orange-600 whitespace-nowrap transition-colors">
              All Products
            </Link>
            {TRACKERS.map((tracker) => (
              <Link
                key={tracker.id}
                to={`/catalog?tracker=${tracker.id}`}
                className="text-sm font-medium text-stone-600 hover:text-orange-600 whitespace-nowrap transition-colors"
              >
                {tracker.name}
              </Link>
            ))}
            <div className="flex-1"></div>
           
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-stone-950 text-stone-400 py-12 mt-auto border-t border-stone-900">
        <div className="container max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4 group">
              <img
                src="/logo.png"
                alt="Elevate Supply"
                className="h-10 w-auto object-contain"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
              <span className="hidden sm:inline text-[22px] leading-none group-hover:text-orange-400 transition-colors" style={{ fontFamily: "'Outfit', sans-serif" }}>
                <span className="font-[700] text-white">Elevate</span><span className="font-[300] text-orange-500 ml-[3px]">Supply</span>
              </span>
            </Link>
            <p className="text-sm mb-6 max-w-sm leading-relaxed text-stone-400">
              Operated by Elevate Commerce Pvt Ltd. We provide online ecommerce and fulfilment using a dropshipping and distributed sourcing model.
            </p>
            <div className="flex gap-4">
              <a href="https://www.youtube.com/@ElevateComerce" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-400 hover:bg-orange-900 hover:text-orange-400 hover:border-orange-800 transition-all">
                <Youtube className="w-5 h-5" />
              </a>
              <a href="https://www.instagram.com/ecommerceyasir/" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-400 hover:bg-orange-900 hover:text-orange-400 hover:border-orange-800 transition-all">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 tracking-wide uppercase text-xs">Categories</h4>
            <ul className="space-y-3 text-sm">
              {TRACKERS.slice(0, 5).map(tracker => (
                <li key={tracker.id}>
                  <Link to={`/catalog?tracker=${tracker.id}`} className="hover:text-orange-400 transition-colors">
                    {tracker.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 tracking-wide uppercase text-xs">Company</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/catalog" className="hover:text-orange-400 transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-orange-400 transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-orange-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/returns" className="hover:text-orange-400 transition-colors">
                  Returns & Refunds
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="container max-w-7xl mx-auto px-4 mt-12 pt-6 border-t border-stone-900 text-xs flex flex-col md:flex-row justify-between items-center text-stone-500">
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
