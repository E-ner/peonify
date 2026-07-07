import type { BuilderOptions, Order, OrderEvent, Product } from "./types";

// Sessions ride in an httpOnly cookie set by the API; same-origin fetches
// (via the Vite proxy) send it automatically.
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(path, {
    headers: options.body instanceof FormData
      ? {}
      : { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      (data as { error?: string }).error || `Request failed (${res.status})`
    );
  }
  return data as T;
}

export interface OrderPayload {
  customer_name: string;
  email: string;
  phone?: string;
  address: string;
  delivery_date: string;
  delivery_window: string;
  order_type: "on_demand" | "scheduled";
  gift_note?: string;
  items: Array<{
    product_id: number | null;
    name: string;
    custom_config?: Record<string, string> | null;
    quantity: number;
    unit_price_cents: number;
  }>;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: "customer" | "admin";
  avatar_url: string;
  phone: string;
  address: string;
  city: string;
}

export interface Category {
  id: number;
  slug: string;
  name: string;
}

export interface Collection {
  id: number;
  slug: string;
  name: string;
  description: string;
}

export interface Notification {
  id: number;
  title: string;
  body: string;
  link: string;
  read: boolean;
  created_at: string;
}

export interface Review {
  id: number;
  rating: number;
  comment: string;
  created_at: string;
  author: string;
  avatar_url: string;
}

export interface AdminStats {
  total_orders: number;
  revenue_cents: number;
  active_orders: number;
  products: number;
  customers: number;
}

export interface AdminMetrics {
  revenue_by_day: Array<{ day: string; revenue_cents: number; orders: number }>;
  orders_by_status: Array<{ status: string; count: number }>;
  top_products: Array<{ name: string; sold: number; revenue_cents: number }>;
}

export interface MyOrder extends Order {
  phone: string;
  gift_note: string;
  payment_ref: string;
  items: Array<{ name: string; quantity: number; unit_price_cents: number }>;
  events: OrderEvent[];
}

export interface AdminOrder extends Order {
  phone: string;
  gift_note: string;
  payment_ref: string;
  items: Array<{ name: string; quantity: number; unit_price_cents: number }>;
}

export interface AdminReview {
  id: number;
  rating: number;
  comment: string;
  created_at: string;
  author: string;
  email: string;
  product_name: string;
  slug: string;
}

export interface AdminActivity {
  id: number;
  status: string;
  note: string;
  created_at: string;
  reference: string;
  customer_name: string;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  body: string;
  created_at: string;
}

export interface ProductInput {
  slug?: string;
  name: string;
  description: string;
  category: string;
  collection: string;
  price_cents: number;
  hue: number;
  image_url: string;
  in_stock: boolean;
  discount_percent: number;
}

export const api = {
  getProducts: (params: Record<string, string> = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request<Product[]>(`/api/products${qs ? `?${qs}` : ""}`);
  },
  getProduct: (slug: string) => request<Product>(`/api/products/${slug}`),
  getBestSellers: () => request<Array<Product & { sold: number }>>("/api/products/best"),
  getRecentReviews: () =>
    request<Array<Review & { product_name: string; slug: string }>>(
      "/api/reviews/recent"
    ),
  getReviews: (slug: string) => request<Review[]>(`/api/products/${slug}/reviews`),
  postReview: (slug: string, rating: number, comment: string) =>
    request<Review>(`/api/products/${slug}/reviews`, {
      method: "POST",
      body: JSON.stringify({ rating, comment }),
    }),
  getBuilderOptions: () => request<BuilderOptions>("/api/builder/options"),
  getCategories: () => request<Category[]>("/api/categories"),
  getCollections: () => request<Collection[]>("/api/collections"),
  createOrder: (payload: OrderPayload) =>
    request<Order & { authorization_url?: string }>("/api/orders", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  verifyPayment: (reference: string) =>
    request<{ status: string; reference: string }>("/api/orders/verify-payment", {
      method: "POST",
      body: JSON.stringify({ reference }),
    }),
  getPaymentsConfig: () =>
    request<{ provider: "paystack" | "mock" }>("/api/payments/config"),
  confirmDelivered: (reference: string) =>
    request<{ status: string }>(`/api/orders/${encodeURIComponent(reference)}/deliver`, {
      method: "POST",
    }),
  sendContact: (payload: { name: string; email: string; subject?: string; body: string }) =>
    request<{ ok: boolean }>("/api/contact", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

export const authApi = {
  signup: (name: string, email: string, password: string) =>
    request<{ user: User }>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),
  login: (email: string, password: string) =>
    request<{ user: User }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  logout: () => request<{ ok: boolean }>("/api/auth/logout", { method: "POST" }),
  me: () => request<{ user: User }>("/api/auth/me"),
};

export const meApi = {
  getOrders: () => request<MyOrder[]>("/api/me/orders"),
  getNotifications: () => request<Notification[]>("/api/me/notifications"),
  markNotificationsRead: () =>
    request<{ ok: boolean }>("/api/me/notifications/read", { method: "POST" }),
  markNotificationRead: (id: number) =>
    request<{ ok: boolean }>(`/api/me/notifications/${id}/read`, { method: "POST" }),
  updateProfile: (profile: {
    name: string;
    phone: string;
    address: string;
    city: string;
  }) =>
    request<{ user: User }>("/api/me/profile", {
      method: "PUT",
      body: JSON.stringify(profile),
    }),
  uploadAvatar: (file: File) => {
    const form = new FormData();
    form.append("image", file);
    return request<{ url: string }>("/api/me/avatar", { method: "POST", body: form });
  },
  changePassword: (current_password: string, new_password: string) =>
    request<{ ok: boolean }>("/api/me/password", {
      method: "POST",
      body: JSON.stringify({ current_password, new_password }),
    }),
};

export const adminApi = {
  getStats: () => request<AdminStats>("/api/admin/stats"),
  getMetrics: () => request<AdminMetrics>("/api/admin/metrics"),
  getOrders: () => request<AdminOrder[]>("/api/admin/orders"),
  getActivity: () => request<AdminActivity[]>("/api/admin/activity"),
  getReviews: () => request<AdminReview[]>("/api/admin/reviews"),
  deleteReview: (id: number) =>
    request<{ ok: boolean }>(`/api/admin/reviews/${id}`, { method: "DELETE" }),
  getMessages: () => request<ContactMessage[]>("/api/admin/messages"),
  deleteMessage: (id: number) =>
    request<{ ok: boolean }>(`/api/admin/messages/${id}`, { method: "DELETE" }),
  createProduct: (p: ProductInput) =>
    request<Product>("/api/admin/products", { method: "POST", body: JSON.stringify(p) }),
  updateProduct: (id: number, p: ProductInput) =>
    request<Product>(`/api/admin/products/${id}`, { method: "PUT", body: JSON.stringify(p) }),
  deleteProduct: (id: number) =>
    request<{ ok: boolean }>(`/api/admin/products/${id}`, { method: "DELETE" }),
  uploadImage: (file: File) => {
    const form = new FormData();
    form.append("image", file);
    return request<{ url: string }>("/api/admin/upload", { method: "POST", body: form });
  },
  deliverOrder: (reference: string) =>
    request<{ status: string }>(`/api/orders/${encodeURIComponent(reference)}/deliver`, {
      method: "POST",
    }),
  createCategory: (name: string) =>
    request<Category>("/api/admin/categories", {
      method: "POST",
      body: JSON.stringify({ name }),
    }),
  deleteCategory: (id: number) =>
    request<{ ok: boolean }>(`/api/admin/categories/${id}`, { method: "DELETE" }),
  createCollection: (name: string, description: string) =>
    request<Collection>("/api/admin/collections", {
      method: "POST",
      body: JSON.stringify({ name, description }),
    }),
  deleteCollection: (id: number) =>
    request<{ ok: boolean }>(`/api/admin/collections/${id}`, { method: "DELETE" }),
};

// The order flow is deliberately simple: paid at checkout → delivered by the
// admin. Legacy statuses appear only in old activity rows.
export const SHIPMENT_PIPELINE = [
  { status: "paid", label: "Paid", note: "" },
  { status: "delivered", label: "Delivered", note: "" },
];

export const STATUS_LABELS: Record<string, string> = {
  pending_payment: "Awaiting payment",
  paid: "Paid",
  delivered: "Delivered",
  received: "Order received",
  curating: "Curating blooms",
  arranging: "Arranging",
  quality_check: "Quality check",
  out_for_delivery: "Out for delivery",
};

export const formatPrice = (cents: number): string =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    cents / 100
  );

// Compact money for dashboards: $950 → $950, $1,250 → $1.3k, $1,500,000 → $1.5M
export const formatMoneyCompact = (cents: number): string => {
  const dollars = cents / 100;
  if (dollars >= 1_000_000) {
    return `$${(dollars / 1_000_000).toFixed(dollars % 1_000_000 === 0 ? 0 : 1)}M`;
  }
  if (dollars >= 1_000) {
    return `$${(dollars / 1_000).toFixed(dollars % 1_000 === 0 ? 0 : 1)}k`;
  }
  return formatPrice(cents);
};

// Discounted unit price for a product with discount_percent set.
export const effectivePriceCents = (p: {
  price_cents: number;
  discount_percent?: number;
}): number =>
  p.discount_percent
    ? Math.round((p.price_cents * (100 - p.discount_percent)) / 100)
    : p.price_cents;
