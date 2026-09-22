"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { User, LoginPayload, RegisterPayload } from "./types/api";
import { api, tokenStorage } from "./api-client";
import toast from "react-hot-toast";

export interface PendingAction {
  type: "add_to_cart" | "add_to_wishlist";
  productId: string;
  quantity?: number;
  productName?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload, returnUrl?: string) => Promise<void>;
  register: (payload: RegisterPayload, returnUrl?: string) => Promise<void>;
  logout: () => Promise<void>;
  requireAuth: (action: () => void, pending?: PendingAction) => void;
  pendingAction: PendingAction | null;
  clearPendingAction: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PENDING_ACTION_KEY = "ec_pending_action";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingAction, setPendingActionState] = useState<PendingAction | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Load pending action from session storage if any
    try {
      const saved = sessionStorage.getItem(PENDING_ACTION_KEY);
      if (saved) {
        setPendingActionState(JSON.parse(saved));
      }
    } catch {}

    // Initialize current user
    async function loadUser() {
      const token = tokenStorage.getAccessToken();
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const me = await api.auth.getMe();
        setUser(me);
      } catch {
        tokenStorage.clearTokens();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, []);

  const setPendingAction = (action: PendingAction | null) => {
    setPendingActionState(action);
    if (action) {
      sessionStorage.setItem(PENDING_ACTION_KEY, JSON.stringify(action));
    } else {
      sessionStorage.removeItem(PENDING_ACTION_KEY);
    }
  };

  const clearPendingAction = () => {
    setPendingAction(null);
  };

  const login = async (payload: LoginPayload, returnUrl?: string) => {
    try {
      await api.auth.login(payload);
      const me = await api.auth.getMe();
      setUser(me);
      toast.success(`Welcome back, ${me.name}!`);

      if (returnUrl) {
        router.push(returnUrl);
      } else {
        router.push("/");
      }
    } catch (err: any) {
      toast.error(err.detail || err.message || "Failed to login");
      throw err;
    }
  };

  const register = async (payload: RegisterPayload, returnUrl?: string) => {
    try {
      await api.auth.register(payload);
      // Auto login after register
      await api.auth.login({ email: payload.email, password: payload.password });
      const me = await api.auth.getMe();
      setUser(me);
      toast.success("Account created successfully!");

      if (returnUrl) {
        router.push(returnUrl);
      } else {
        router.push("/");
      }
    } catch (err: any) {
      toast.error(err.detail || err.message || "Failed to register");
      throw err;
    }
  };

  const logout = async () => {
    try {
      await api.auth.logout();
      setUser(null);
      clearPendingAction();
      toast.success("Signed out");
      router.push("/");
    } catch (err: any) {
      setUser(null);
      toast.error("Signed out");
      router.push("/");
    }
  };

  const requireAuth = (action: () => void, pending?: PendingAction) => {
    if (user) {
      action();
      return;
    }

    if (pending) {
      setPendingAction(pending);
    }

    const current = pathname || "/";
    toast("Please log in to continue", { icon: "🔒" });
    router.push(`/auth/login?returnUrl=${encodeURIComponent(current)}`);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        requireAuth,
        pendingAction,
        clearPendingAction,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
