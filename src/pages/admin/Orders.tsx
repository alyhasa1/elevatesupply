import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { formatCurrency } from "@/lib/catalog/format";
import { getAdminOrderStats, getAllOrders, type Order } from "@/lib/ordersApi";

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({ totalOrders: 0, totalValue: 0, byStatus: {} as Record<string, number> });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      const [{ orders: nextOrders, error: ordersError }, nextStats] = await Promise.all([getAllOrders(), getAdminOrderStats()]);
      setLoading(false);

      if (ordersError || nextStats.error) {
        setMessage(ordersError || nextStats.error || "Failed to load orders.");
        return;
      }

      setOrders(nextOrders);
      setStats({
        totalOrders: nextStats.totalOrders,
        totalValue: nextStats.totalValue,
        byStatus: nextStats.byStatus,
      });
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Orders</h1>
        <p className="text-slate-500">Shared Supabase orders filtered to `site_key = elevate_supply`.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold">Total orders</div>
          <div className="text-3xl font-semibold text-slate-900 mt-3">{stats.totalOrders}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold">Total value</div>
          <div className="text-3xl font-semibold text-slate-900 mt-3">{formatCurrency(stats.totalValue)}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold">Statuses</div>
          <div className="mt-3 text-sm text-slate-700 space-y-1">
            {Object.entries(stats.byStatus).length === 0
              ? "No orders yet."
              : Object.entries(stats.byStatus).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <span>{status}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
          </div>
        </div>
      </div>

      {message ? <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">{message}</div> : null}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-500">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="grid grid-cols-[1.4fr_140px_140px_140px] gap-4 px-6 py-4 border-b border-slate-200 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            <div>Order</div>
            <div>Total</div>
            <div>Payment</div>
            <div>Status</div>
          </div>
          {orders.length === 0 ? (
            <div className="px-6 py-12 text-center text-slate-500">No Elevate Supply orders found yet.</div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="grid grid-cols-[1.4fr_140px_140px_140px] gap-4 px-6 py-4 border-b border-slate-100 last:border-0 text-sm"
              >
                <div>
                  <div className="font-semibold text-slate-900">{order.order_id}</div>
                  <div className="text-slate-600">{order.product_description}</div>
                  <div className="text-xs text-slate-500 mt-1">
                    {order.receiver_contact_name} | {order.order_source}
                  </div>
                </div>
                <div className="font-medium text-slate-900">{formatCurrency(Number(order.total))}</div>
                <div className="text-slate-700">{order.payment_status}</div>
                <div className="text-slate-700">{order.status}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
