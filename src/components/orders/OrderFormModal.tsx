import { useEffect, useMemo, useRef, useState } from "react";
import { CreditCard, Loader2, Package, ShoppingCart, X } from "lucide-react";

import {
  capturePayPalOrder,
  createOrder,
  createPayPalOrder,
  submitOrderToSheet,
  updateOrderPaymentStatus,
  type CreateOrderInput,
} from "@/lib/ordersApi";
import { formatCurrency } from "@/lib/catalog/format";
import type { OrderSource } from "@/lib/orders/trackerOrderSource";
import { getCheckoutModalLayoutClasses } from "./checkoutModalLayout";

interface OrderFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
  product: {
    listing_id: string;
    title: string;
    image?: string | null;
    url?: string | null;
    currency: string;
  };
  variation: {
    id: string;
    var_id: string;
    name: string;
    displayPrice: number;
    selects?: Record<string, string>;
  };
  orderSource: OrderSource;
}

const initialFormState = {
  receiver_contact_name: "",
  receiver_phone: "",
  receiver_address1: "",
  receiver_address2: "",
  receiver_address3: "",
  receiver_city: "",
  receiver_county: "",
  receiver_country_code: "GB",
  receiver_postal_code: "",
  piece_quantity: 1,
};

function buildSku(variation: OrderFormModalProps["variation"]): string {
  const entries = Object.entries(variation.selects || {});
  if (entries.length === 0) return variation.name || "Standard";
  return entries.map(([, value]) => value).join(" / ");
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[11px] font-semibold uppercase tracking-[0.25em] text-white/40">{label}</span>
      {children}
    </label>
  );
}

export function OrderFormModal({
  isOpen,
  onClose,
  onComplete,
  product,
  variation,
  orderSource,
}: OrderFormModalProps) {
  const layout = getCheckoutModalLayoutClasses();
  const [formData, setFormData] = useState(initialFormState);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [paymentStep, setPaymentStep] = useState<"form" | "paying" | "capturing">("form");
  const popupRef = useRef<Window | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setFormData(initialFormState);
      setBusy(false);
      setMessage(null);
      setPaymentStep("form");
      popupRef.current = null;
    }
  }, [isOpen]);

  const sku = useMemo(() => buildSku(variation), [variation]);
  const unitPrice = variation.displayPrice;
  const total = Number((unitPrice * formData.piece_quantity).toFixed(2));

  const formComplete =
    Boolean(formData.receiver_contact_name.trim()) &&
    Boolean(formData.receiver_address1.trim()) &&
    Boolean(formData.receiver_city.trim()) &&
    Boolean(formData.receiver_postal_code.trim());

  if (!isOpen) return null;

  const handleChange = (name: keyof typeof initialFormState, value: string) => {
    setFormData((current) => ({
      ...current,
      [name]: name === "piece_quantity" ? Math.max(1, Number(value) || 1) : value,
    }));
  };

  const buildOrderInput = (): CreateOrderInput => ({
    listing_id: product.listing_id,
    variation_id: variation.var_id,
    sku,
    product_description: product.title,
    product_image: product.image || undefined,
    product_url: product.url || undefined,
    receiver_contact_name: formData.receiver_contact_name,
    receiver_phone: formData.receiver_phone,
    receiver_address1: formData.receiver_address1,
    receiver_address2: formData.receiver_address2 || undefined,
    receiver_address3: formData.receiver_address3 || undefined,
    receiver_city: formData.receiver_city,
    receiver_county: formData.receiver_county || undefined,
    receiver_country_code: formData.receiver_country_code,
    receiver_postal_code: formData.receiver_postal_code,
    piece_quantity: formData.piece_quantity,
    item_cost: unitPrice,
    shipping_cost: 0,
    order_source: orderSource,
  });

  const finishSuccess = (nextMessage: string) => {
    setMessage(nextMessage);
    window.setTimeout(() => {
      onComplete?.();
      onClose();
    }, 1200);
  };

  const waitForPayPalReturn = (paypalOrderId: string) =>
    new Promise<"success" | "cancelled">((resolve, reject) => {
      const popup = popupRef.current;
      if (!popup) {
        reject(new Error("PayPal window could not be opened."));
        return;
      }

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

  const handlePayLater = async () => {
    setBusy(true);
    setMessage(null);

    const { order, error } = await createOrder(buildOrderInput());
    if (error || !order) {
      setBusy(false);
      setMessage(error || "Order could not be created.");
      return;
    }

    try {
      await submitOrderToSheet(order, product.url || undefined);
      finishSuccess(`Order ${order.order_id} created. You can pay it later from Orders.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Order created, but form submission failed.");
    } finally {
      setBusy(false);
    }
  };

  const handlePayNow = async () => {
    setBusy(true);
    setPaymentStep("paying");
    setMessage(null);

    const { paypalOrderId, approveUrl, error: paypalError } = await createPayPalOrder(
      null,
      total,
      product.currency || "GBP",
      `Elevate Supply order - ${product.title}`,
    );

    if (paypalError || !paypalOrderId || !approveUrl) {
      setBusy(false);
      setPaymentStep("form");
      setMessage(paypalError || "PayPal could not be started.");
      return;
    }

    popupRef.current = window.open(approveUrl, "PayPal", "width=500,height=700,scrollbars=yes");
    if (!popupRef.current) {
      setBusy(false);
      setPaymentStep("form");
      setMessage("Pop-up blocked. Please allow pop-ups and try again.");
      return;
    }

    setPaymentStep("capturing");

    try {
      const result = await waitForPayPalReturn(paypalOrderId);
      if (result === "cancelled") {
        setBusy(false);
        setPaymentStep("form");
        setMessage("Payment cancelled. No order was created.");
        return;
      }

      const { success, error: captureError, captureId, amount } = await capturePayPalOrder(paypalOrderId);
      if (!success) {
        setBusy(false);
        setPaymentStep("form");
        setMessage(captureError || "Payment capture failed.");
        return;
      }

      const { order, error } = await createOrder(buildOrderInput());
      if (error || !order) {
        setBusy(false);
        setPaymentStep("form");
        setMessage(error || "Payment succeeded, but the order row could not be created.");
        return;
      }

      const { error: paymentError } = await updateOrderPaymentStatus(
        order.id,
        "paid",
        paypalOrderId,
        captureId || undefined,
        amount ? Number(amount) : total,
      );

      try {
        await submitOrderToSheet(order, product.url || undefined);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Payment succeeded, but form submission failed.");
        setBusy(false);
        return;
      }

      if (paymentError) {
        setMessage(`Order created, but payment state update failed: ${paymentError}`);
        setBusy(false);
        return;
      }

      finishSuccess(`Payment successful. Order ${order.order_id} is confirmed.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Payment not completed.");
    } finally {
      setBusy(false);
      setPaymentStep("form");
      popupRef.current = null;
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[99] bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className={layout.viewport}>
        <div className={layout.viewportInner}>
          <div className={layout.shell}>
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-300">
                  <ShoppingCart className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-lg font-semibold">Create order</div>
                  <div className="text-sm text-white/45">Delivery details and payment for this tracker item</div>
                </div>
              </div>
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 transition-colors hover:bg-white/10"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="border-b border-white/10 bg-white/[0.03] px-6 py-4">
              <div className="flex items-center gap-4">
                {product.image ? (
                  <img src={product.image} alt="" className="h-16 w-16 rounded-2xl border border-white/10 object-cover" />
                ) : (
                  <div className="h-16 w-16 rounded-2xl border border-white/10 bg-white/5" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="line-clamp-2 font-medium">{product.title}</div>
                  <div className="mt-1 text-sm text-white/45">{sku}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-white/45">Unit price</div>
                  <div className="text-xl font-semibold">{formatCurrency(unitPrice, product.currency)}</div>
                </div>
              </div>
            </div>

            <div className={layout.body}>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Quantity">
                  <input
                    type="number"
                    min={1}
                    value={formData.piece_quantity}
                    onChange={(event) => handleChange("piece_quantity", event.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
                  />
                </Field>
                <Field label="Country">
                  <select
                    value={formData.receiver_country_code}
                    onChange={(event) => handleChange("receiver_country_code", event.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
                  >
                    <option value="GB">United Kingdom</option>
                    <option value="US">United States</option>
                    <option value="DE">Germany</option>
                    <option value="FR">France</option>
                    <option value="ES">Spain</option>
                    <option value="IT">Italy</option>
                    <option value="NL">Netherlands</option>
                    <option value="IE">Ireland</option>
                  </select>
                </Field>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-white/55">
                  <Package className="h-4 w-4" />
                  Delivery details
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Contact name">
                    <input
                      value={formData.receiver_contact_name}
                      onChange={(event) => handleChange("receiver_contact_name", event.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
                      placeholder="John Smith"
                    />
                  </Field>
                  <Field label="Phone">
                    <input
                      value={formData.receiver_phone}
                      onChange={(event) => handleChange("receiver_phone", event.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
                      placeholder="+44 7123 456789"
                    />
                  </Field>
                </div>
                <Field label="Address line 1">
                  <input
                    value={formData.receiver_address1}
                    onChange={(event) => handleChange("receiver_address1", event.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
                    placeholder="123 Main Street"
                  />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Address line 2">
                    <input
                      value={formData.receiver_address2}
                      onChange={(event) => handleChange("receiver_address2", event.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
                      placeholder="Apartment, suite, etc."
                    />
                  </Field>
                  <Field label="Address line 3">
                    <input
                      value={formData.receiver_address3}
                      onChange={(event) => handleChange("receiver_address3", event.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
                      placeholder="Optional"
                    />
                  </Field>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="City">
                    <input
                      value={formData.receiver_city}
                      onChange={(event) => handleChange("receiver_city", event.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
                      placeholder="London"
                    />
                  </Field>
                  <Field label="County">
                    <input
                      value={formData.receiver_county}
                      onChange={(event) => handleChange("receiver_county", event.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
                      placeholder="Greater London"
                    />
                  </Field>
                  <Field label="Postal code">
                    <input
                      value={formData.receiver_postal_code}
                      onChange={(event) => handleChange("receiver_postal_code", event.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
                      placeholder="SW1A 1AA"
                    />
                  </Field>
                </div>
              </div>

              {message ? <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/75">{message}</div> : null}
            </div>

            <div className={layout.footer}>
              <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.25em] text-white/35">Order total</div>
                  <div className="mt-1 text-2xl font-semibold">{formatCurrency(total, product.currency)}</div>
                </div>
                <div className="text-sm text-white/45">
                  {paymentStep === "paying"
                    ? "Creating your PayPal order..."
                    : paymentStep === "capturing"
                      ? "Complete payment in the PayPal popup."
                      : `${formData.piece_quantity} x ${formatCurrency(unitPrice, product.currency)}`}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  disabled={!formComplete || busy}
                  onClick={() => {
                    void handlePayNow();
                  }}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busy && paymentStep !== "form" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                  Pay with PayPal
                </button>
                <button
                  type="button"
                  disabled={!formComplete || busy}
                  onClick={() => {
                    void handlePayLater();
                  }}
                  className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Pay later
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
