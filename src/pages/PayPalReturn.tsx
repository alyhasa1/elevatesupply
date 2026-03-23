import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

import { buildPayPalReturnMessage } from "@/lib/orders/paypalReturnMessage";

export default function PayPalReturn() {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const payload = buildPayPalReturnMessage({
      token: searchParams.get("token"),
      payerId: searchParams.get("PayerID") || searchParams.get("payerId"),
      status: searchParams.get("status") || "success",
    });

    try {
      if (window.opener && !window.opener.closed) {
        window.opener.postMessage(payload, window.location.origin);
      }
    } catch {
      // ignore cross-window errors
    }

    const timer = window.setTimeout(() => {
      try {
        window.close();
      } catch {
        // ignore close errors
      }
    }, 250);

    return () => window.clearTimeout(timer);
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-2xl border border-white/10 bg-black/30 p-6 text-center">
        <p className="text-white/70 text-sm">Finalizing your payment…</p>
        <p className="text-white/40 text-xs mt-2">You can close this window if it stays open.</p>
      </div>
    </div>
  );
}
