# Customer Storefront — High-Performance E-Commerce

A modern, clean, mobile-first, and ultra-fast customer-facing e-commerce storefront built with Next.js App Router, TypeScript, Tailwind CSS, TanStack Query, and React Hook Form + Zod.

---

## 🛠 Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Server Components + ISR, Streaming)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with CSS Variables for instant brand theming
- **Client-Side Data & Cache**: [TanStack Query v5](https://tanstack.com/query) with optimistic updates
- **Forms & Validation**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **API Client**: Typed fetch wrapper with silent JWT refresh interceptor
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

---

## 🚀 Key Features

### 1. Dynamic Home Page (`GET /home`) with Section Registry
- Fetches ordered published sections from the backend CMS.
- Supported section types:
  - `hero_banner`: Full-width responsive carousel with slide transitions, auto-play, pause on hover, and CTA links.
  - `category_grid`: Responsive grid linking to category feeds.
  - `product_carousel`: Horizontal swipeable slider with left/right scroll controls.
  - `promo_banner`: Marketing feature banner with callouts.
  - `rich_text`: Styled editorial / brand storytelling section.
  - `featured_products`: Product grid with quick add-to-cart and wishlist toggles.
- Unknown section types are safely skipped without breaking the page.
- Hidden sections (`is_visible: false`) are never rendered.
- Incremental Static Regeneration (`revalidate = 60`) for instant page loads.

### 2. Product Listing (`/products`)
- Shows **ONLY active products** (`is_active: true`).
- Real-time search query support (`?search=...`).
- Category filtering (`?category=...`).
- Sorting by price (Low to High, High to Low) and newest arrivals.
- Responsive product cards with image optimization (`next/image`), price, compare-at price / discount percentage badge, and instant wishlist heart.

### 3. Product Detail Page (`/products/[slug]`)
- Slug-based SEO-friendly routing with dynamic OpenGraph metadata tags.
- Image gallery with thumbnails and zoom layout.
- Inactive or non-existent products trigger a clean Next.js 404 (`notFound()`).
- Live stock status badges ("In Stock" vs "Out of Stock").
- Accessible quantity selector with bounds checks.
- Add to Cart & Wishlist toggle with guest action retention.
- Related products recommendations.

### 4. Authentication & Guest Action Resumption
- Full JWT authentication (Access token + Refresh token rotation).
- Registration (`/auth/register`) with Bangladesh phone format validation (`01XXXXXXXXX`).
- Login (`/auth/login`) with `returnUrl` support.
- If a guest clicks "Add to Cart" or "Wishlist", they are smoothly redirected to log in and their pending action is preserved and executed automatically upon sign-in.

### 5. Wishlist (`/wishlist`)
- TanStack Query cache with optimistic toggling.
- Remove from wishlist or "Move to Cart" in one click.

### 6. Cart & Mini-Cart Drawer (`/cart`)
- Slide-out mini-cart drawer in the header with item count badge.
- Quantity adjustment, item removal, and live subtotal calculations.
- Automatic warnings for unavailable or out-of-stock items, which **block checkout** until resolved.

### 7. Checkout (`/checkout`)
- Login required.
- Choose saved address or enter a new delivery address with required fields:
  - Full Name, Street Address, City, District, and Phone Number.
  - Strict Bangladesh mobile number validation (`01XXXXXXXXX`).
- Order summary with breakdown (subtotal, delivery charge, total).
- Payment method: **Cash on Delivery (COD)**.
- Handles backend stock conflict errors gracefully with clear inline alert banners.
- Success confirmation page (`/checkout/success/[orderNumber]`).

### 8. Account & Order Tracking (`/account`)
- Profile information and membership details.
- Address Book: Full CRUD (Add, Edit, Delete, Set Default).
- My Orders (`/account/orders`): Status badges, order items, and pricing summaries.
- Order Details (`/account/orders/[id]`):
  - Visual 5-step status timeline: `Pending` $\rightarrow$ `Confirmed` $\rightarrow$ `Processing` $\rightarrow$ `Shipped` $\rightarrow$ `Delivered`.
  - Order cancellation button (active only while status is `Pending`, restores stock).
  - Status history activity logs.

---

## 🎨 Theme & Customization (CSS Variables)

The theme is controlled by CSS custom properties in `app/globals.css`. To rebrand for any client, simply update the HSL values:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  --radius: 0.5rem;
}
```

---

## 🏃 Local Development

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Configure environment variables**:
   Create `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

3. **Start development server**:
   ```bash
   pnpm --filter @ecommerce/frontend dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

4. **Production Build & Type Check**:
   ```bash
   pnpm --filter @ecommerce/frontend build
   ```

---

## 📋 Backend API Evaluation & Missing Endpoints

The storefront consumes the existing REST API without inventing unofficial endpoints. Below is the assessment of existing vs suggested future endpoints:

### Supported & Consumed Endpoints:
- `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `GET /auth/me`
- `GET /home` (Published sections for dynamic CMS)
- `GET /products` (Search, category filter, price sort, pagination; active-only)
- `GET /products/{slug}` (Product details; 404 for inactive)
- `GET /categories` (Active category hierarchy)
- `GET /cart`, `POST /cart/items`, `PATCH /cart/items/{id}`, `DELETE /cart/items/{id}`, `DELETE /cart`
- `GET /wishlist`, `POST /wishlist/{product_id}`, `DELETE /wishlist/{product_id}`
- `GET /addresses`, `POST /addresses`, `GET /addresses/{id}`, `PATCH /addresses/{id}`, `DELETE /addresses/{id}`
- `POST /checkout` (Single transaction with address, phone validation, stock validation, COD)
- `GET /orders/me`, `GET /orders/me/{id}`, `POST /orders/me/{id}/cancel` (Pending-only cancellation)

### Missing / Recommended Future Endpoints:
1. **Search Autocomplete / Suggestions**: `GET /products/autocomplete?q=...` for fast typeahead in header search without full page reload.
2. **Product Reviews & Ratings**: `GET /products/{id}/reviews` and `POST /products/{id}/reviews` for customer social proof and star ratings.
3. **Discount / Coupon Codes**: `POST /cart/apply-coupon` for promo code discounts during checkout.
4. **Online Payment Gateways**: e.g., SSLCommerz / bKash / Nagad / Stripe endpoints (`POST /checkout/payment-intent`) for non-COD digital transactions.
5. **Newsletter Subscription**: `POST /newsletter/subscribe` for saving footer newsletter email subscriptions.
