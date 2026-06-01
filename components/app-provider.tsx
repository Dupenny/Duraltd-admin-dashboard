"use client";
import { useState, useCallback } from "react";
import { AppContext } from "@/lib/store";
import type { User, Product } from "@/lib/auth";

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [product, setProductState] = useState<Product>("durapay");
  const [sidebarOpen, setSidebarOpenState] = useState(true);

  const setUser = useCallback((u: User | null) => setUserState(u), []);
  const setProduct = useCallback((p: Product) => setProductState(p), []);
  const setSidebarOpen = useCallback((v: boolean) => setSidebarOpenState(v), []);
  const logout = useCallback(() => {
    setUserState(null);
    window.location.href = "/login";
  }, []);

  return (
    <AppContext.Provider value={{ user, product, sidebarOpen, setUser, setProduct, setSidebarOpen, logout }}>
      {children}
    </AppContext.Provider>
  );
}
