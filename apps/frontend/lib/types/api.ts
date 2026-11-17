// API Response generic wrapper
export interface StandardResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error?: string;
  detail?: string;
  code?: string;
}

// User / Auth
export interface User {
  public_id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: "customer" | "admin";
  avatar_url?: string | null;
  is_active: boolean;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string | null;
}

// Category
export interface Category {
  public_id: string;
  name: string;
  slug: string;
  description?: string | null;
  image_url?: string | null;
  parent_public_id?: string | null;
  is_active: boolean;
  created_at: string;
}

// Product
export interface Product {
  public_id: string;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  compare_at_price?: number | null;
  sku?: string | null;
  stock_qty: number;
  images: string[];
  is_featured: boolean;
  category_public_id: string;
  category_name?: string | null;
  is_active: boolean;
  created_at: string;
}

export interface ProductListParams {
  search?: string;
  category?: string;
  min_price?: number;
  max_price?: number;
  price_sort?: "asc" | "desc";
  page?: number;
  page_size?: number;
}

// Cart
export interface CartItem {
  public_id: string;
  product_public_id: string;
  product_name: string;
  product_slug: string;
  product_price: number;
  product_image?: string | null;
  quantity: number;
  line_total: number;
  is_available: boolean;
  stock_qty: number;
}

export interface Cart {
  public_id: string;
  items: CartItem[];
  subtotal: number;
  total_items: number;
}

// Wishlist
export interface WishlistItem {
  public_id: string;
  product_public_id: string;
  product_name: string;
  product_slug: string;
  product_price: number;
  product_image?: string | null;
  is_active: boolean;
  created_at: string;
}

// Address
export interface Address {
  public_id: string;
  full_name: string;
  phone: string;
  address_line: string;
  city: string;
  district: string;
  postal_code?: string | null;
  is_default: boolean;
  created_at: string;
}

export interface AddressCreatePayload {
  full_name: string;
  phone: string;
  address_line: string;
  city: string;
  district: string;
  postal_code?: string | null;
  is_default?: boolean;
}

export interface AddressUpdatePayload {
  full_name?: string;
  phone?: string;
  address_line?: string;
  city?: string;
  district?: string;
  postal_code?: string | null;
  is_default?: boolean;
}

// Order
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface OrderItem {
  public_id: string;
  product_public_id?: string | null;
  product_name: string;
  unit_price: number;
  quantity: number;
  line_total: number;
}

export interface OrderStatusHistory {
  public_id: string;
  from_status?: string | null;
  to_status: string;
  changed_by?: string | null;
  note?: string | null;
  created_at: string;
}

export interface ShippingAddressSnapshot {
  full_name: string;
  phone: string;
  address_line: string;
  city: string;
  district: string;
  postal_code?: string | null;
}

export interface Order {
  public_id: string;
  order_number: string;
  user_public_id?: string | null;
  customer_name?: string | null;
  customer_email?: string | null;
  status: OrderStatus;
  payment_method: string;
  payment_status: string;
  subtotal: number;
  delivery_charge: number;
  discount: number;
  total: number;
  shipping_snapshot: ShippingAddressSnapshot;
  note?: string | null;
  coupon_code?: string | null;
  items: OrderItem[];
  status_history: OrderStatusHistory[];
  created_at: string;
}

export interface CheckoutPayload {
  address_id?: string;
  address?: ShippingAddressSnapshot;
  phone?: string;
  note?: string;
  payment_method?: "cod";
  coupon_code?: string;
}

// Home Page CMS Section Definitions
export interface HeroSlide {
  image_url: string;
  title: string;
  subtitle?: string | null;
  cta_text?: string | null;
  cta_link?: string | null;
}

export interface HeroBannerSectionConfig {
  slides: HeroSlide[];
  autoplay?: boolean;
  interval_seconds?: number;
}

export interface CategoryGridSectionConfig {
  category_slugs: string[];
  columns?: number;
  title?: string;
}

export interface ProductCarouselSectionConfig {
  title: string;
  source: "manual" | "category" | "latest";
  product_ids?: string[];
  category_slug?: string;
  limit?: number;
}

export interface PromoBannerSectionConfig {
  image_url: string;
  title?: string | null;
  subtitle?: string | null;
  link?: string | null;
}

export interface RichTextSectionConfig {
  heading?: string | null;
  body_html_or_markdown: string;
}

export interface FeaturedProductsSectionConfig {
  title?: string;
  limit?: number;
}

export type HomeSectionType =
  | "hero_banner"
  | "category_grid"
  | "product_carousel"
  | "promo_banner"
  | "rich_text"
  | "featured_products";

export interface HomeSectionBase {
  id: string;
  type: HomeSectionType | string;
  is_visible: boolean;
  config: any;
}

export interface HeroBannerSection extends HomeSectionBase {
  type: "hero_banner";
  config: HeroBannerSectionConfig;
}

export interface CategoryGridSection extends HomeSectionBase {
  type: "category_grid";
  config: CategoryGridConfigSectionConfig;
}

export type CategoryGridConfigSectionConfig = CategoryGridSectionConfig;

export interface ProductCarouselSection extends HomeSectionBase {
  type: "product_carousel";
  config: ProductCarouselSectionConfig;
}

export interface PromoBannerSection extends HomeSectionBase {
  type: "promo_banner";
  config: PromoBannerSectionConfig;
}

export interface RichTextSection extends HomeSectionBase {
  type: "rich_text";
  config: RichTextSectionConfig;
}

export interface FeaturedProductsSection extends HomeSectionBase {
  type: "featured_products";
  config: FeaturedProductsSectionConfig;
}

export type HomeSection =
  | HeroBannerSection
  | CategoryGridSection
  | ProductCarouselSection
  | PromoBannerSection
  | RichTextSection
  | FeaturedProductsSection
  | HomeSectionBase;

export interface HomePageData {
  public_id: string;
  status: string;
  sections: HomeSection[];
  updated_at: string;
  published_at?: string | null;
}

// Coupons
export interface CouponValidatePayload {
  code: string;
  subtotal: number;
}

export interface CouponValidateResponse {
  valid: boolean;
  code: string;
  discount_type: string;
  discount_value: number;
  discount_amount: number;
  new_subtotal: number;
  message: string;
}

// Reviews
export interface Review {
  public_id: string;
  user_name: string;
  rating: number;
  title?: string | null;
  comment: string;
  is_verified_purchase: boolean;
  created_at: string;
}

export interface ReviewCreatePayload {
  rating: number;
  title?: string;
  comment: string;
}

export interface ProductReviewsSummary {
  avg_rating: number;
  total_reviews: number;
  rating_distribution: Record<string, number>;
  reviews: Review[];
}
