import { summarizeElevateOrders } from "@/lib/orders/adminOrderStats";
import type { OrderSource } from "@/lib/orders/trackerOrderSource";
import { SITE_KEY, withElevateSiteKey } from "@/lib/siteScope";
import { supabase } from "@/lib/supabaseClient";

export type PaymentStatus = "unpaid" | "pending" | "paid" | "failed" | "refunded";

export interface Order {
  id: string;
  order_id: string;
  user_id: string;
  site_key: string;
  order_date: string;
  listing_id: string;
  variation_id: string | null;
  sku: string;
  product_description: string;
  product_image: string | null;
  product_url: string | null;
  receiver_contact_name: string;
  receiver_phone: string;
  receiver_address1: string;
  receiver_address2: string | null;
  receiver_address3: string | null;
  receiver_city: string;
  receiver_county: string | null;
  receiver_country_code: string;
  receiver_postal_code: string;
  piece_quantity: number;
  item_cost: number;
  shipping_cost: number;
  total: number;
  status: "processing" | "shipped" | "delivered" | "cancelled";
  tracking_number: string | null;
  tracking_url: string | null;
  admin_notes: string | null;
  payment_proof_url: string | null;
  order_source: OrderSource;
  created_at: string;
  updated_at: string;
  payment_status: PaymentStatus;
  payment_provider: string | null;
  paypal_order_id: string | null;
  paypal_capture_id: string | null;
  paid_at: string | null;
  payment_amount: number | null;
}

export interface CreateOrderInput {
  order_date?: string;
  listing_id: string;
  variation_id?: string;
  sku: string;
  product_description: string;
  product_image?: string;
  product_url?: string;
  receiver_contact_name: string;
  receiver_phone: string;
  receiver_address1: string;
  receiver_address2?: string;
  receiver_address3?: string;
  receiver_city: string;
  receiver_county?: string;
  receiver_country_code?: string;
  receiver_postal_code: string;
  piece_quantity?: number;
  item_cost: number;
  shipping_cost?: number;
  order_source: OrderSource;
}

interface OrderFilters {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

interface PayPalBranding {
  brandName?: string;
  returnOrigin?: string;
  cancelOrigin?: string;
}

function getDefaultPayPalBranding(): PayPalBranding {
  if (typeof window === "undefined") {
    return { brandName: "Elevate Supply" };
  }

  return {
    brandName: "Elevate Supply",
    returnOrigin: window.location.origin,
    cancelOrigin: window.location.origin,
  };
}

function applyOrderFilters(query: any, filters?: OrderFilters) {
  let next = query;

  if (filters?.status && filters.status !== "all") {
    next = next.eq("status", filters.status);
  }
  if (filters?.dateFrom) {
    next = next.gte("order_date", filters.dateFrom);
  }
  if (filters?.dateTo) {
    next = next.lte("order_date", filters.dateTo);
  }
  if (filters?.search) {
    next = next.or(
      `sku.ilike.%${filters.search}%,product_description.ilike.%${filters.search}%,receiver_contact_name.ilike.%${filters.search}%,receiver_postal_code.ilike.%${filters.search}%`,
    );
  }

  return next;
}

export async function createOrder(input: CreateOrderInput): Promise<{ order: Order | null; error: string | null }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { order: null, error: "Not authenticated" };
  }

  const total = Number(((input.item_cost * (input.piece_quantity || 1)) + (input.shipping_cost || 0)).toFixed(2));
  const payload = withElevateSiteKey({
    user_id: user.id,
    order_date: input.order_date || new Date().toISOString().split("T")[0],
    listing_id: input.listing_id,
    variation_id: input.variation_id || null,
    sku: input.sku,
    product_description: input.product_description,
    product_image: input.product_image || null,
    product_url: input.product_url || null,
    receiver_contact_name: input.receiver_contact_name,
    receiver_phone: input.receiver_phone,
    receiver_address1: input.receiver_address1,
    receiver_address2: input.receiver_address2 || null,
    receiver_address3: input.receiver_address3 || null,
    receiver_city: input.receiver_city,
    receiver_county: input.receiver_county || null,
    receiver_country_code: input.receiver_country_code || "GB",
    receiver_postal_code: input.receiver_postal_code,
    piece_quantity: input.piece_quantity || 1,
    item_cost: input.item_cost,
    shipping_cost: input.shipping_cost || 0,
    total,
    order_source: input.order_source,
  });

  const { data, error } = await supabase.from("user_orders").insert(payload).select().single();

  if (error) {
    return { order: null, error: error.message };
  }

  return { order: data as Order, error: null };
}

async function submitToGoogleForm(order: Order, productUrl?: string): Promise<void> {
  const { error } = await supabase.functions.invoke("submit-google-form", {
    body: { ...order, product_url: productUrl || order.product_url },
  });

  if (error) {
    throw error;
  }
}

async function submitToTikTokStockForm(order: Order, productUrl?: string): Promise<void> {
  const { error } = await supabase.functions.invoke("submit-tiktok-stock-form", {
    body: { ...order, product_url: productUrl || order.product_url },
  });

  if (error) {
    throw error;
  }
}

export async function submitOrderToSheet(order: Order, productUrl?: string): Promise<void> {
  if (
    order.order_source === "tiktok_stock" ||
    order.order_source === "wholesale_stock" ||
    order.order_source === "account_building_stock" ||
    order.order_source === "jackets_stock"
  ) {
    await submitToTikTokStockForm(order, productUrl);
    return;
  }

  await submitToGoogleForm(order, productUrl);
}

export async function getMyOrders(filters?: OrderFilters): Promise<{ orders: Order[]; error: string | null }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { orders: [], error: "Not authenticated" };

  let query = supabase
    .from("user_orders")
    .select("*")
    .eq("user_id", user.id)
    .eq("site_key", SITE_KEY)
    .order("created_at", { ascending: false });

  query = applyOrderFilters(query, filters);

  const { data, error } = await query;
  if (error) return { orders: [], error: error.message };
  return { orders: data as Order[], error: null };
}

export async function getAllOrders(filters?: OrderFilters): Promise<{ orders: Order[]; error: string | null }> {
  let query = supabase
    .from("user_orders")
    .select("*")
    .eq("site_key", SITE_KEY)
    .order("created_at", { ascending: false });

  query = applyOrderFilters(query, filters);

  const { data, error } = await query;
  if (error) return { orders: [], error: error.message };
  return { orders: data as Order[], error: null };
}

export async function getMyOrderStats(): Promise<{
  thisMonth: { count: number; total: number };
  allTime: { count: number; total: number };
  error: string | null;
}> {
  const { orders, error } = await getMyOrders();
  if (error) {
    return {
      thisMonth: { count: 0, total: 0 },
      allTime: { count: 0, total: 0 },
      error,
    };
  }

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const startOfMonthIso = startOfMonth.toISOString().split("T")[0];

  const activeOrders = orders.filter((order) => order.status !== "cancelled");
  const thisMonthOrders = activeOrders.filter((order) => order.order_date >= startOfMonthIso);

  return {
    thisMonth: {
      count: thisMonthOrders.length,
      total: thisMonthOrders.reduce((sum, order) => sum + Number(order.total), 0),
    },
    allTime: {
      count: activeOrders.length,
      total: activeOrders.reduce((sum, order) => sum + Number(order.total), 0),
    },
    error: null,
  };
}

export async function getAdminOrderStats() {
  const { orders, error } = await getAllOrders();
  if (error) {
    return {
      totalOrders: 0,
      totalValue: 0,
      byStatus: {},
      error,
    };
  }

  return {
    ...summarizeElevateOrders(orders),
    error: null,
  };
}

export async function createPayPalOrder(
  orderId: string | null,
  amount: number,
  currency = "GBP",
  description?: string,
): Promise<{ paypalOrderId: string | null; approveUrl: string | null; error: string | null }> {
  try {
    const { data, error } = await supabase.functions.invoke("paypal-create-order", {
      body: {
        orderId,
        amount,
        currency,
        description,
        ...getDefaultPayPalBranding(),
      },
    });

    if (error) {
      let detailed = error.message;
      try {
        const anyErr = error as unknown as { context?: { response?: Response } };
        const response = anyErr.context?.response;
        if (response) {
          const text = await response.text();
          if (text) detailed = `${detailed} | ${text}`;
        }
      } catch {
        // ignore detail extraction failures
      }
      return { paypalOrderId: null, approveUrl: null, error: detailed };
    }

    if (!data?.success) {
      return { paypalOrderId: null, approveUrl: null, error: data?.error || "Failed to create PayPal order" };
    }

    return {
      paypalOrderId: data.paypalOrderId || null,
      approveUrl: data.approveUrl || null,
      error: null,
    };
  } catch (error) {
    return {
      paypalOrderId: null,
      approveUrl: null,
      error: error instanceof Error ? error.message : "PayPal order creation failed",
    };
  }
}

export async function capturePayPalOrder(
  paypalOrderId: string,
  orderId?: string,
): Promise<{ success: boolean; captureId: string | null; amount: string | null; error: string | null }> {
  try {
    const { data, error } = await supabase.functions.invoke("paypal-capture-order", {
      body: { paypalOrderId, orderId },
    });

    if (error) {
      let detailed = error.message;
      try {
        const anyErr = error as unknown as { context?: { response?: Response } };
        const response = anyErr.context?.response;
        if (response) {
          const text = await response.text();
          if (text) detailed = `${detailed} | ${text}`;
        }
      } catch {
        // ignore detail extraction failures
      }
      return { success: false, captureId: null, amount: null, error: detailed };
    }

    if (!data?.success) {
      return { success: false, captureId: null, amount: null, error: data?.error || "Payment capture failed" };
    }

    return {
      success: true,
      captureId: data.captureId || null,
      amount: data.amount || null,
      error: null,
    };
  } catch (error) {
    return {
      success: false,
      captureId: null,
      amount: null,
      error: error instanceof Error ? error.message : "Payment capture failed",
    };
  }
}

export async function updateOrderPaymentStatus(
  orderId: string,
  paymentStatus: PaymentStatus,
  paypalOrderId?: string,
  paypalCaptureId?: string,
  paymentAmount?: number,
): Promise<{ success: boolean; error: string | null }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Not authenticated" };

  const updates: Record<string, unknown> = {
    payment_status: paymentStatus,
  };

  if (paypalOrderId) {
    updates.paypal_order_id = paypalOrderId;
    updates.payment_provider = "paypal";
  }
  if (paypalCaptureId) {
    updates.paypal_capture_id = paypalCaptureId;
    updates.payment_provider = "paypal";
  }
  if (typeof paymentAmount === "number") {
    updates.payment_amount = paymentAmount;
  }
  if (paymentStatus === "paid") {
    updates.paid_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from("user_orders")
    .update(updates)
    .eq("id", orderId)
    .eq("user_id", user.id)
    .eq("site_key", SITE_KEY);

  if (error) return { success: false, error: error.message };
  return { success: true, error: null };
}

export function exportOrdersToCSV(orders: Order[]): string {
  const headers = [
    "Order ID",
    "Order Date",
    "SKU",
    "Product",
    "Quantity",
    "Item Cost",
    "Shipping",
    "Total",
    "Receiver Name",
    "Phone",
    "Address 1",
    "Address 2",
    "Address 3",
    "City",
    "County",
    "Country",
    "Postcode",
    "Status",
    "Payment Status",
    "Created At",
  ];

  const rows = orders.map((order) => [
    order.order_id,
    order.order_date,
    order.sku,
    order.product_description,
    order.piece_quantity,
    order.item_cost,
    order.shipping_cost,
    order.total,
    order.receiver_contact_name,
    order.receiver_phone,
    order.receiver_address1,
    order.receiver_address2 || "",
    order.receiver_address3 || "",
    order.receiver_city,
    order.receiver_county || "",
    order.receiver_country_code,
    order.receiver_postal_code,
    order.status,
    order.payment_status,
    order.created_at,
  ]);

  return [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
  ].join("\n");
}

export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
