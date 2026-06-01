"use client";
import { useState, useCallback, useEffect } from "react";
import { AppContext } from "@/lib/store";
import type { User, Product } from "@/lib/auth";

const SESSION_KEY = "dura_admin_session";

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [product, setProductState] = useState<Product>("durapay");
  const [sidebarOpen, setSidebarOpenState] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  // Rehydrate from localStorage on mount — this is the fix for the refresh-to-login bug.
  // State is lost on every page refresh because React context is in-memory only.
  // We persist to localStorage on login and restore here before the auth guard runs.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) {
        const { user: savedUser, product: savedProduct } = JSON.parse(raw);
        if (savedUser?.id && savedUser?.email) {
          setUserState(savedUser);
          setProductState(savedProduct ?? "durapay");
        }
      }
    } catch {
      localStorage.removeItem(SESSION_KEY);
    } finally {
      setHydrated(true);
    }
  }, []);

  const setUser = useCallback((u: User | null) => {
    setUserState(u);
    if (!u) {
      localStorage.removeItem(SESSION_KEY);
    }
    // setUser alone doesn't persist — setProduct call after login handles the save
  }, []);

  const setProduct = useCallback((p: Product) => {
    setProductState(p);
  }, []);

  const setSidebarOpen = useCallback((v: boolean) => setSidebarOpenState(v), []);

  const logout = useCallback(() => {
    setUserState(null);
    localStorage.removeItem(SESSION_KEY);
    window.location.href = "/";
  }, []);

  return (
    <AppContext.Provider value={{ user, product, sidebarOpen, setUser, setProduct, setSidebarOpen, logout, hydrated }}>
      {children}
    </AppContext.Provider>
  );
}
