/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { RequireAdmin } from "./components/auth/RequireAdmin";
import { RequireAuth } from "./components/auth/RequireAuth";
import StorefrontLayout from "./layouts/StorefrontLayout";
import AdminLayout from "./layouts/AdminLayout";
import { CatalogProvider } from "./lib/catalog/context";
import Home from "./pages/storefront/Home";
import Catalog from "./pages/storefront/Catalog";
import OrderHistory from "./pages/storefront/OrderHistory";
import ProductDetail from "./pages/storefront/ProductDetail";
import Terms from "./pages/storefront/policies/Terms";
import Privacy from "./pages/storefront/policies/Privacy";
import Returns from "./pages/storefront/policies/Returns";
import PayPalReturn from "./pages/PayPalReturn";
import Dashboard from "./pages/admin/Dashboard";
import Products from "./pages/admin/Products";
import Orders from "./pages/admin/Orders";
import Accounts from "./pages/admin/Accounts";
import { CreateAccountPage, ForgotPasswordPage, ResetPasswordPage, SignInPage } from "./pages/auth/Auth";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/auth/sign-in" element={<SignInPage />} />
          <Route path="/auth/create-account" element={<CreateAccountPage />} />
          <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/auth/reset-password" element={<ResetPasswordPage />} />

          <Route path="/" element={<StorefrontLayout />}>
            <Route index element={<Home />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/product/:trackerId/:listingId" element={<ProductDetail />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/returns" element={<Returns />} />
            <Route
              path="/orders"
              element={
                <RequireAuth>
                  <OrderHistory />
                </RequireAuth>
              }
            />
            <Route path="category/:slug" element={<Navigate to="/catalog" replace />} />
          </Route>

          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <CatalogProvider>
                  <AdminLayout />
                </CatalogProvider>
              </RequireAdmin>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="orders" element={<Orders />} />
            <Route path="accounts" element={<Accounts />} />
          </Route>

          <Route path="/paypal/return" element={<PayPalReturn />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
