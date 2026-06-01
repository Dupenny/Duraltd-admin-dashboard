"use client";
import { createContext, useContext } from "react";
import type { User, Product } from "./auth";

export interface AppCtx {
  user: User | null;
  product: Product;
  sidebarOpen: boolean;
  hydrated: boolean;  // true once localStorage has been read — prevents flash-redirect to login
  setUser: (u: User | null) => void;
  setProduct: (p: Product) => void;
  setSidebarOpen: (v: boolean) => void;
  logout: () => void;
}

export const AppContext = createContext<AppCtx>({
  user: null, product: "durapay", sidebarOpen: true, hydrated: false,
  setUser: () => {}, setProduct: () => {}, setSidebarOpen: () => {}, logout: () => {},
});

export const useApp = () => useContext(AppContext);
