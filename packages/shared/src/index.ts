export interface User {
  id: number;
  email: string;
  full_name: string;
  avatar_url: string | null;
  role: "admin" | "customer";
  is_active: boolean;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: string;
  compare_at_price: string | null;
  category_id: number;
  category?: Category;
  images: string[];
  inventory: number;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
}

export interface Order {
  id: number;
  user_id: number;
  status: "pending" | "paid" | "shipped" | "delivered" | "cancelled";
  total: string;
  stripe_payment_intent_id: string | null;
  shipping_address: Record<string, unknown>;
  created_at: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product?: Product;
  quantity: number;
  unit_price: string;
  total_price: string;
}

export interface CMSConfig {
  id: number;
  key: string;
  value: string;
}

export type OrderStatus = "pending" | "paid" | "shipped" | "delivered" | "cancelled";
export type UserRole = "admin" | "customer";
