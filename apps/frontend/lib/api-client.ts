import {
  StandardResponse,
  User,
  TokenResponse,
  LoginPayload,
  RegisterPayload,
  Product,
  ProductListParams,
  Category,
  Cart,
  WishlistItem,
  Address,
  AddressCreatePayload,
  AddressUpdatePayload,
  Order,
  CheckoutPayload,
  HomePageData,
} from "./types/api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export class ApiError extends Error {
  status: number;
  code?: string;
  detail?: string;

  constructor(status: number, message: string, code?: string, detail?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.detail = detail || message;
  }
}

// Token storage helpers (safe for SSR and browser)
const ACCESS_TOKEN_KEY = "ec_access_token";
const REFRESH_TOKEN_KEY = "ec_refresh_token";

export const tokenStorage = {
  getAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },
  setAccessToken(token: string) {
    if (typeof window === "undefined") return;
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    document.cookie = `${ACCESS_TOKEN_KEY}=${token}; path=/; max-age=1800; SameSite=Lax`;
  },
  getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },
  setRefreshToken(token: string) {
    if (typeof window === "undefined") return;
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
    document.cookie = `${REFRESH_TOKEN_KEY}=${token}; path=/; max-age=604800; SameSite=Lax`;
  },
  clearTokens() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    document.cookie = `${ACCESS_TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    document.cookie = `${REFRESH_TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  },
};

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

async function fetchWithAuth<T>(
  endpoint: string,
  options: RequestInit = {},
  isRetry = false
): Promise<T> {
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;
  const headers = new Headers(options.headers || {});

  if (options.body && !headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const token = tokenStorage.getAccessToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(url, { ...options, headers });

  // If 401 and in browser, attempt refresh token rotation once
  if (res.status === 401 && !isRetry && typeof window !== "undefined") {
    const refreshToken = tokenStorage.getRefreshToken();
    if (refreshToken) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh_token: refreshToken }),
          });

          if (refreshRes.ok) {
            const data: StandardResponse<TokenResponse> = await refreshRes.json();
            tokenStorage.setAccessToken(data.data.access_token);
            tokenStorage.setRefreshToken(data.data.refresh_token);
            onRefreshed(data.data.access_token);
            isRefreshing = false;

            return fetchWithAuth<T>(endpoint, options, true);
          } else {
            tokenStorage.clearTokens();
            isRefreshing = false;
          }
        } catch {
          tokenStorage.clearTokens();
          isRefreshing = false;
        }
      } else {
        // Wait for active refresh
        return new Promise((resolve) => {
          subscribeTokenRefresh(() => {
            resolve(fetchWithAuth<T>(endpoint, options, true));
          });
        });
      }
    }
  }

  let json: any = null;
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    json = await res.json();
  }

  if (!res.ok) {
    const detail = json?.detail || json?.message || json?.error || "Request failed";
    const code = json?.code;
    throw new ApiError(res.status, detail, code, detail);
  }

  return (json?.data !== undefined ? json.data : json) as T;
}

// Storefront API client
export const api = {
  // Auth
  auth: {
    async register(payload: RegisterPayload): Promise<User> {
      return fetchWithAuth<User>("/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    async login(payload: LoginPayload): Promise<TokenResponse> {
      const data = await fetchWithAuth<TokenResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      tokenStorage.setAccessToken(data.access_token);
      tokenStorage.setRefreshToken(data.refresh_token);
      return data;
    },
    async logout(): Promise<void> {
      const refreshToken = tokenStorage.getRefreshToken();
      try {
        if (refreshToken) {
          await fetchWithAuth("/auth/logout", {
            method: "POST",
            body: JSON.stringify({ refresh_token: refreshToken }),
          });
        }
      } finally {
        tokenStorage.clearTokens();
      }
    },
    async getMe(): Promise<User> {
      return fetchWithAuth<User>("/auth/me");
    },
  },

  // Home CMS
  home: {
    async getPublished(): Promise<HomePageData> {
      return fetchWithAuth<HomePageData>("/home", {
        next: { revalidate: 60 },
      } as any);
    },
  },

  // Products
  products: {
    async list(params: ProductListParams = {}): Promise<Product[]> {
      const searchParams = new URLSearchParams();
      if (params.search) searchParams.set("search", params.search);
      if (params.category) searchParams.set("category", params.category);
      if (params.min_price !== undefined)
        searchParams.set("min_price", params.min_price.toString());
      if (params.max_price !== undefined)
        searchParams.set("max_price", params.max_price.toString());
      if (params.price_sort) searchParams.set("price_sort", params.price_sort);
      if (params.page) searchParams.set("page", params.page.toString());
      if (params.page_size)
        searchParams.set("page_size", params.page_size.toString());

      const query = searchParams.toString();
      const endpoint = query ? `/products?${query}` : "/products";
      return fetchWithAuth<Product[]>(endpoint, {
        next: { revalidate: 60 },
      } as any);
    },

    async getBySlug(slug: string): Promise<Product> {
      return fetchWithAuth<Product>(`/products/${slug}`, {
        next: { revalidate: 60 },
      } as any);
    },
  },

  // Categories
  categories: {
    async list(): Promise<Category[]> {
      return fetchWithAuth<Category[]>("/categories", {
        next: { revalidate: 300 },
      } as any);
    },
  },

  // Cart
  cart: {
    async get(): Promise<Cart> {
      return fetchWithAuth<Cart>("/cart");
    },
    async addItem(product_public_id: string, quantity = 1): Promise<Cart> {
      return fetchWithAuth<Cart>("/cart/items", {
        method: "POST",
        body: JSON.stringify({ product_public_id, quantity }),
      });
    },
    async updateItem(item_public_id: string, quantity: number): Promise<Cart> {
      return fetchWithAuth<Cart>(`/cart/items/${item_public_id}`, {
        method: "PATCH",
        body: JSON.stringify({ quantity }),
      });
    },
    async removeItem(item_public_id: string): Promise<Cart> {
      return fetchWithAuth<Cart>(`/cart/items/${item_public_id}`, {
        method: "DELETE",
      });
    },
    async clear(): Promise<Cart> {
      return fetchWithAuth<Cart>("/cart", {
        method: "DELETE",
      });
    },
  },

  // Wishlist
  wishlist: {
    async list(): Promise<WishlistItem[]> {
      return fetchWithAuth<WishlistItem[]>("/wishlist");
    },
    async add(productId: string): Promise<WishlistItem> {
      return fetchWithAuth<WishlistItem>(`/wishlist/${productId}`, {
        method: "POST",
      });
    },
    async remove(productId: string): Promise<void> {
      return fetchWithAuth<void>(`/wishlist/${productId}`, {
        method: "DELETE",
      });
    },
  },

  // Addresses
  addresses: {
    async list(): Promise<Address[]> {
      return fetchWithAuth<Address[]>("/addresses");
    },
    async get(id: string): Promise<Address> {
      return fetchWithAuth<Address>(`/addresses/${id}`);
    },
    async create(payload: AddressCreatePayload): Promise<Address> {
      return fetchWithAuth<Address>("/addresses", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    async update(id: string, payload: AddressUpdatePayload): Promise<Address> {
      return fetchWithAuth<Address>(`/addresses/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },
    async delete(id: string): Promise<void> {
      return fetchWithAuth<void>(`/addresses/${id}`, {
        method: "DELETE",
      });
    },
  },

  // Orders / Checkout
  orders: {
    async checkout(payload: CheckoutPayload): Promise<Order> {
      return fetchWithAuth<Order>("/checkout", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    async listMyOrders(page = 1, page_size = 20): Promise<Order[]> {
      return fetchWithAuth<Order[]>(
        `/orders/me?page=${page}&page_size=${page_size}`
      );
    },
    async getMyOrder(id: string): Promise<Order> {
      return fetchWithAuth<Order>(`/orders/me/${id}`);
    },
    async cancelMyOrder(id: string, note?: string): Promise<Order> {
      const url = note
        ? `/orders/me/${id}/cancel?note=${encodeURIComponent(note)}`
        : `/orders/me/${id}/cancel`;
      return fetchWithAuth<Order>(url, {
        method: "POST",
      });
    },
  },
};
