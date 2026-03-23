import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { useAuth } from "@/contexts/AuthContext";
import { getAuthRedirectPath } from "@/lib/authRedirects";
import { supabase } from "@/lib/supabaseClient";

function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(190,24,93,0.12),_transparent_45%),linear-gradient(135deg,#0c0a09,#1c1917)] text-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden">
        <div className="p-8 sm:p-10 border-b border-white/10">
          <Link to="/" className="text-xs uppercase tracking-[0.35em] text-rose-300 font-semibold">
            Elevate Supply
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight mt-4">{title}</h1>
          <p className="text-sm text-white/60 mt-3 max-w-md">{subtitle}</p>
        </div>
        <div className="p-8 sm:p-10">{children}</div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-[11px] uppercase tracking-[0.25em] text-white/45 font-semibold">{label}</span>
      {children}
    </label>
  );
}

function AuthMessage({ value }: { value: string | null }) {
  if (!value) return null;
  return <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/75">{value}</div>;
}

const inputClassName =
  "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-400/50";

export function SignInPage() {
  const { signIn, session, initializing, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!initializing && session && isAdmin !== null) {
      navigate(getAuthRedirectPath({ isAdmin }), { replace: true });
    }
  }, [initializing, isAdmin, navigate, session]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setMessage(null);

    try {
      await signIn(form.email.trim(), form.password);
      setMessage("Signed in successfully. Redirecting…");
    } catch (error) {
      const nextMessage =
        error instanceof Error && error.message.toLowerCase().includes("invalid login credentials")
          ? "Email or password is incorrect."
          : error instanceof Error
            ? error.message
            : "Unable to sign in right now.";
      setMessage(nextMessage);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Sign in"
      subtitle="Use the same shared account that already works on Ecom With Yasir. Admin access carries over automatically."
    >
      <form className="space-y-5" onSubmit={onSubmit}>
        <Field label="Email">
          <input
            required
            type="email"
            className={inputClassName}
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            placeholder="you@example.com"
          />
        </Field>
        <Field label="Password">
          <input
            required
            type="password"
            className={inputClassName}
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            placeholder="Your password"
          />
        </Field>
        <AuthMessage value={message} />
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-2xl bg-rose-600 hover:bg-rose-500 disabled:opacity-60 disabled:cursor-not-allowed px-4 py-3 text-sm font-semibold text-white transition-colors"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
        <div className="flex items-center justify-between text-sm text-white/55">
          <Link to="/auth/create-account" className="hover:text-white transition-colors">
            Create account
          </Link>
          <Link to="/auth/forgot-password" className="hover:text-white transition-colors">
            Forgot password
          </Link>
        </div>
      </form>
    </AuthShell>
  );
}

export function CreateAccountPage() {
  const { signUp, session, initializing, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!initializing && session && isAdmin !== null) {
      navigate(getAuthRedirectPath({ isAdmin }), { replace: true });
    }
  }, [initializing, isAdmin, navigate, session]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setMessage(null);

    try {
      const didSignIn = await signUp(form.name.trim(), form.email.trim(), form.password);
      setMessage(
        didSignIn
          ? "Account created and signed in. Redirecting…"
          : "Account created. Check your email to confirm before signing in.",
      );
      if (!didSignIn) {
        window.setTimeout(() => navigate("/auth/sign-in", { replace: true }), 1200);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to create an account right now.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Create account"
      subtitle="New customers on Elevate Supply share the same secure authentication backend as the parent platform."
    >
      <form className="space-y-5" onSubmit={onSubmit}>
        <Field label="Name">
          <input
            required
            className={inputClassName}
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            placeholder="Your full name"
          />
        </Field>
        <Field label="Email">
          <input
            required
            type="email"
            className={inputClassName}
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            placeholder="you@example.com"
          />
        </Field>
        <Field label="Password">
          <input
            required
            minLength={8}
            type="password"
            className={inputClassName}
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            placeholder="At least 8 characters"
          />
        </Field>
        <AuthMessage value={message} />
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-2xl bg-rose-600 hover:bg-rose-500 disabled:opacity-60 disabled:cursor-not-allowed px-4 py-3 text-sm font-semibold text-white transition-colors"
        >
          {busy ? "Creating account…" : "Create account"}
        </button>
        <div className="text-sm text-white/55">
          Already have an account?{" "}
          <Link to="/auth/sign-in" className="hover:text-white transition-colors">
            Sign in
          </Link>
        </div>
      </form>
    </AuthShell>
  );
}

export function ForgotPasswordPage() {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy || submitted) return;
    setBusy(true);
    setMessage(null);

    try {
      await requestPasswordReset(email.trim());
      setSubmitted(true);
      setMessage("Reset link sent. Check your email to continue.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to send reset link right now.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title="Forgot password" subtitle="We’ll send a secure reset link to the email tied to your account.">
      <form className="space-y-5" onSubmit={onSubmit}>
        <Field label="Email">
          <input
            required
            type="email"
            className={inputClassName}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            disabled={submitted}
          />
        </Field>
        <AuthMessage value={message} />
        <button
          type="submit"
          disabled={busy || submitted}
          className="w-full rounded-2xl bg-rose-600 hover:bg-rose-500 disabled:opacity-60 disabled:cursor-not-allowed px-4 py-3 text-sm font-semibold text-white transition-colors"
        >
          {submitted ? "Link sent" : busy ? "Sending…" : "Send reset link"}
        </button>
        <div className="text-sm text-white/55">
          <Link to="/auth/sign-in" className="hover:text-white transition-colors">
            Back to sign in
          </Link>
        </div>
      </form>
    </AuthShell>
  );
}

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { updatePassword } = useAuth();
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<"verifying" | "ready" | "error">("verifying");

  const tokens = useMemo(() => {
    let accessToken = searchParams.get("access_token");
    let refreshToken = searchParams.get("refresh_token");

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (!accessToken || !refreshToken) {
        const hash = url.hash.startsWith("#") ? url.hash.slice(1) : url.hash;
        const hashParams = new URLSearchParams(hash);
        accessToken = accessToken ?? hashParams.get("access_token");
        refreshToken = refreshToken ?? hashParams.get("refresh_token");
      }
    }

    return { accessToken, refreshToken };
  }, [searchParams]);

  useEffect(() => {
    if (!tokens.accessToken || !tokens.refreshToken) {
      setStatus("error");
      setMessage("This reset link is no longer valid. Request a fresh one and try again.");
      return;
    }

    void (async () => {
      const { error } = await supabase.auth.setSession({
        access_token: tokens.accessToken as string,
        refresh_token: tokens.refreshToken as string,
      });

      if (error) {
        setStatus("error");
        setMessage("This reset link could not be verified. Request a new link and try again.");
        return;
      }

      setStatus("ready");
    })();
  }, [tokens]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy || status !== "ready") return;

    const password = form.password.trim();
    const confirmPassword = form.confirmPassword.trim();
    if (password.length < 8) {
      setMessage("Use at least 8 characters for your new password.");
      return;
    }
    if (password !== confirmPassword) {
      setMessage("The two password fields need to match.");
      return;
    }

    setBusy(true);
    setMessage(null);
    try {
      await updatePassword(password);
      await supabase.auth.signOut();
      setMessage("Password updated. Redirecting you to sign in…");
      window.setTimeout(() => navigate("/auth/sign-in", { replace: true }), 1200);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update your password.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell
      title="Set a new password"
      subtitle={status === "ready" ? "Choose a new password for your shared account." : "Validating your reset link."}
    >
      {status === "verifying" ? (
        <div className="text-sm text-white/60">Checking your reset link…</div>
      ) : status === "error" ? (
        <div className="space-y-4">
          <AuthMessage value={message} />
          <Link to="/auth/forgot-password" className="text-sm text-white/70 hover:text-white transition-colors">
            Request a new reset link
          </Link>
        </div>
      ) : (
        <form className="space-y-5" onSubmit={onSubmit}>
          <Field label="New password">
            <input
              required
              minLength={8}
              type="password"
              className={inputClassName}
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              placeholder="At least 8 characters"
            />
          </Field>
          <Field label="Confirm password">
            <input
              required
              minLength={8}
              type="password"
              className={inputClassName}
              value={form.confirmPassword}
              onChange={(event) => setForm((current) => ({ ...current, confirmPassword: event.target.value }))}
              placeholder="Repeat your new password"
            />
          </Field>
          <AuthMessage value={message} />
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-2xl bg-rose-600 hover:bg-rose-500 disabled:opacity-60 disabled:cursor-not-allowed px-4 py-3 text-sm font-semibold text-white transition-colors"
          >
            {busy ? "Saving…" : "Save new password"}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
