export interface Product {
  id: number;
  slug: string;
  name: string;
  description: string;
  category: "bouquet" | "stems" | "arrangement";
  collection: "spring" | "summer" | "signature";
  price_cents: number;
  hue: number;
  image_url: string;
  in_stock: boolean;
  discount_percent: number;
  created_at: string;
}

export interface BuilderOption {
  id: number;
  step: "size" | "focal" | "foliage" | "packaging";
  name: string;
  detail: string;
  price_cents: number;
}

export type BuilderOptions = Record<string, BuilderOption[]>;

export interface CartItem {
  line_id: string;
  product_id: number | null;
  name: string;
  unit_price_cents: number;
  quantity: number;
  custom_config?: Record<string, string> | null;
}

export interface Order {
  id: number;
  reference: string;
  customer_name: string;
  email: string;
  address: string;
  delivery_date: string;
  delivery_window: string;
  order_type: "on_demand" | "scheduled";
  total_cents: number;
  status: string;
  created_at: string;
}

export interface PipelineStage {
  status: string;
  label: string;
  note: string;
}

export interface OrderEvent {
  status: string;
  note: string;
  created_at: string;
}

export interface TrackData {
  reference: string;
  status: string;
  delivery_date: string;
  delivery_window: string;
  pipeline: PipelineStage[];
  events: OrderEvent[];
}

