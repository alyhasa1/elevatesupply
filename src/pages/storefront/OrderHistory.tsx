import { useEffect, useMemo, useState } from "react";
import { Download, Loader2, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  capturePayPalOrder,
  createPayPalOrder,
  downloadCSV,
  exportOrdersToCSV,
  getMyOrders,
  getMyOrderStats,
  type Order,
} from "@/lib/ordersApi";
import { formatCurrency } from "@/lib/catalog/format";

const PAYMENT_LABELS: Record<string, string> = {
  unpaid: "Unpaid",
  pending: "Payment pending",
  paid: "Paid",
  failed: "Payment failed",
  refunded: "Refunded",
};

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [payingOrderId, setPayingOrderId] = useState<string | null>(null);
  const [stats, setStats] = useState({
    thisMonth: { count: 0, total: 0 },
    allTime: { count: 0, total: 0 },
  });

  const loadOrders = async () => {
    setIsLoading(true);
    const { orders: nextOrders, error } = await getMyOrders({
      status: statusFilter,
    });
    setIsLoading(false);
    if (error) {
      setMessage(error);
      return;
    }
    setOrders(nextOrders);
  };

  const loadStats = async () => {
    const { thisMonth, allTime, error } = await getMyOrderStats();
    if (error) {
      setMessage(error);
      return;
    }
    setStats({ thisMonth, allTime });
  };

  useEffect(() => {
    void loadOrders();
    void loadStats();
  }, [statusFilter]);

  const filteredOrders = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return orders;
    return orders.filter((order) =>
      [order.order_id, order.sku, order.product_description, order.receiver_contact_name, order.receiver_postal_code]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [orders, searchQuery]);

  const handlePayNow = async (order: Order) => {
    setPayingOrderId(order.id);
    setMessage(null);

    const { paypalOrderId, approveUrl, error } = await createPayPalOrder(
      order.id,
      Number(order.total),
      "GBP",
      `Elevate Supply order ${order.order_id}`,
    );

    if (error || !paypalOrderId || !approveUrl) {
      setPayingOrderId(null);
      setMessage(error || "Could not start PayPal checkout.");
      return;
    }

    const popup = window.open(approveUrl, "PayPal", "width=500,height=700,scrollbars=yes");
    if (!popup) {
      setPayingOrderId(null);
      setMessage("Pop-up blocked. Please allow pop-ups and try again.");
      return;
    }

    const waitForPayPalReturn = () =>
      new Promise<"success" | "cancelled">((resolve, reject) => {
        const timeoutId = window.setTimeout(() => {
          cleanup();
          reject(new Error("PayPal timed out. Please try again."));
        }, 5 * 60 * 1000);

        const pollId = window.setInterval(() => {
          if (popup.closed) {
            cleanup();
            reject(new Error("PayPal window was closed."));
          }
        }, 500);

        const onMessage = (event: MessageEvent) => {
          if (event.origin !== window.location.origin) return;
          const data = event.data as { type?: string; token?: string; status?: string } | null;
          if (!data || data.type !== "paypal:return" || data.token !== paypalOrderId) return;
          cleanup();
          try {
            popup.close();
          } catch {
            // ignore
          }
          resolve(data.status === "cancelled" ? "cancelled" : "success");
        };

        const cleanup = () => {
          window.clearTimeout(timeoutId);
          window.clearInterval(pollId);
          window.removeEventListener("message", onMessage);
        };

        window.addEventListener("message", onMessage);
      });

    try {
      const result = await waitForPayPalReturn();
      if (result === "cancelled") {
        setMessage("Payment cancelled.");
        setPayingOrderId(null);
        return;
      }

      const { success, error: captureError } = await capturePayPalOrder(paypalOrderId, order.id);
      if (!success) {
        setMessage(captureError || "Payment capture failed.");
        setPayingOrderId(null);
        return;
      }

      setMessage(`Payment completed for order ${order.order_id}.`);
      await loadOrders();
      await loadStats();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Payment not completed.");
    } finally {
      setPayingOrderId(null);
    }
  };

  return (
    <div className="bg-[#faf9f8] pt-10 pb-8 sm:pt-14 sm:pb-12">
      <div className="container mx-auto px-4 space-y-8 max-w-6xl">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <h1 className="text-4xl font-semibold text-stone-900 mb-3">Orders</h1>
            <p className="text-stone-600 text-lg">Track your Elevate Supply orders and complete payment later when needed.</p>
          </div>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => {
              const csv = exportOrdersToCSV(filteredOrders);
              downloadCSV(csv, `elevate-orders-${new Date().toISOString().split("T")[0]}.csv`);
            }}
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
            <div className="text-xs uppercase tracking-[0.25em] text-stone-400 font-semibold">Orders this month</div>
            <div className="text-3xl font-semibold text-stone-900 mt-3">{stats.thisMonth.count}</div>
          </div>
          <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
            <div className="text-xs uppercase tracking-[0.25em] text-stone-400 font-semibold">Value this month</div>
            <div className="text-3xl font-semibold text-stone-900 mt-3">{formatCurrency(stats.thisMonth.total)}</div>
          </div>
          <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
            <div className="text-xs uppercase tracking-[0.25em] text-stone-400 font-semibold">All orders</div>
            <div className="text-3xl font-semibold text-stone-900 mt-3">{stats.allTime.count}</div>
          </div>
          <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
            <div className="text-xs uppercase tracking-[0.25em] text-stone-400 font-semibold">All-time value</div>
            <div className="text-3xl font-semibold text-stone-900 mt-3">{formatCurrency(stats.allTime.total)}</div>
          </div>
        </div>

        <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <Input
                className="pl-11"
                placeholder="Search by order ID, SKU, product, or customer name"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-10 rounded-md border border-stone-200 bg-white px-3 text-sm text-stone-700"
            >
              <option value="all">All statuses</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          {message ? <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700">{message}</div> : null}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-stone-500">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center text-stone-500">
            No orders match the current filters.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const isUnpaid = order.payment_status === "unpaid" || order.payment_status === "failed";
              const isPaying = payingOrderId === order.id;

              return (
                <div key={order.id} className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm space-y-5">
                  <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">
                    <div className="flex items-start gap-4">
                      {order.product_image ? (
                        <img src={order.product_image} alt="" className="w-16 h-16 rounded-2xl object-cover border border-stone-200" />
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-stone-100 border border-stone-200" />
                      )}
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="text-sm font-semibold text-stone-900">{order.order_id}</span>
                          <span className="rounded-full bg-stone-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">
                            {order.status}
                          </span>
                          <span className="rounded-full bg-rose-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-rose-700">
                            {PAYMENT_LABELS[order.payment_status] || order.payment_status}
                          </span>
                        </div>
                        <div className="text-lg font-semibold text-stone-900">{order.product_description}</div>
                        <div className="text-sm text-stone-500 mt-1">{order.sku}</div>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-stone-400 uppercase tracking-[0.2em] text-[10px] mb-1">Total</div>
                        <div className="font-semibold text-stone-900">{formatCurrency(Number(order.total))}</div>
                      </div>
                      <div>
                        <div className="text-stone-400 uppercase tracking-[0.2em] text-[10px] mb-1">Qty</div>
                        <div className="font-semibold text-stone-900">{order.piece_quantity}</div>
                      </div>
                      <div>
                        <div className="text-stone-400 uppercase tracking-[0.2em] text-[10px] mb-1">Order date</div>
                        <div className="font-semibold text-stone-900">{order.order_date}</div>
                      </div>
                    </div>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-6 text-sm">
                    <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                      <div className="text-[11px] uppercase tracking-[0.2em] text-stone-400 font-semibold mb-2">Delivery</div>
                      <div className="text-stone-800">{order.receiver_contact_name}</div>
                      <div className="text-stone-600 mt-1">{order.receiver_phone}</div>
                      <div className="text-stone-600 mt-2">
                        {order.receiver_address1}
                        {order.receiver_address2 ? `, ${order.receiver_address2}` : ""}
                        {order.receiver_address3 ? `, ${order.receiver_address3}` : ""}
                      </div>
                      <div className="text-stone-600">
                        {order.receiver_city}
                        {order.receiver_county ? `, ${order.receiver_county}` : ""} {order.receiver_postal_code}
                      </div>
                      <div className="text-stone-600">{order.receiver_country_code}</div>
                    </div>

                    <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                      <div className="text-[11px] uppercase tracking-[0.2em] text-stone-400 font-semibold mb-2">Order status</div>
                      <div className="space-y-1 text-stone-700">
                        <div>Processing state: {order.status}</div>
                        <div>Payment state: {PAYMENT_LABELS[order.payment_status] || order.payment_status}</div>
                        <div>Source: {order.order_source}</div>
                        {order.tracking_number ? <div>Tracking: {order.tracking_number}</div> : null}
                      </div>
                    </div>
                  </div>

                  {isUnpaid ? (
                    <div className="flex justify-end">
                      <Button
                        className="bg-rose-600 hover:bg-rose-500"
                        disabled={isPaying}
                        onClick={() => {
                          void handlePayNow(order);
                        }}
                      >
                        {isPaying ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        {isPaying ? "Processing..." : "Pay now"}
                      </Button>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
