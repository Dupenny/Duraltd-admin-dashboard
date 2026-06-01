/**
 * Product-scoped API hooks.
 *
 * Each hook automatically prefixes the URL with the current product slug,
 * so switching product in the UI re-fetches all data from the correct
 * Laravel endpoint:
 *
 *   /api/proxy/durapay/dashboard
 *   /api/proxy/durabiz/transactions?page=1&search=...
 *   /api/proxy/durapayment/customers
 *   etc.
 *
 * Falls back to mock data when the backend is unreachable (dev mode / no backend yet).
 */
"use client";
import { useMemo } from "react";
import { useApp } from "./store";
import { useApi } from "./use-api";
import {
  chartData,
  issueStatusData,
  TRANSACTIONS,
  CUSTOMERS,
  ISSUES,
} from "./mock-data";

const PROXY = "/api/proxy";

// ─── Dashboard / KPIs ────────────────────────────────────────────────────────
export function useDashboard() {
  const { product } = useApp();
  const url = `${PROXY}/${product}/dashboard`;

  const fallback = useMemo(() => ({
    kpis: {
      avgOrderValue:     72980,
      totalOrders:       2219,
      activeCustomers:   1847,
      platformRevenue:   560000,
    },
    chart: chartData,
    topProducts: [
      { name: "DuraPayment Gateway",      sales: 12429, initials: "DP", bg: "#EFF6FF", fg: "#1D4ED8" },
      { name: "DuraPay Personal Banking", sales: 11021, initials: "PB", bg: "#F0FDF4", fg: "#15803D" },
      { name: "DuraBiz Business Suite",   sales: 10321, initials: "BS", bg: "#F5F3FF", fg: "#6D28D9" },
    ],
    balance: { total: 847200000, byProduct: { durapayment: 312000000, durapay: 284000000, durabiz: 251000000 } },
  }), []);

  return useApi(url, fallback, product);
}

// ─── Transactions ─────────────────────────────────────────────────────────────
export function useTransactions(params?: Record<string, string>) {
  const { product } = useApp();
  const qs  = params ? "?" + new URLSearchParams(params).toString() : "";
  const url = `${PROXY}/${product}/transactions${qs}`;

  // Each product gets a filtered view of the mock data as fallback
  const fallback = useMemo(() => {
    const slug = product === "durapayment" ? "DuraPayment"
               : product === "durapay"     ? "DuraPay"
               : "DuraBiz";
    return {
      data:  TRANSACTIONS.filter(t => t.product === slug),
      total: TRANSACTIONS.filter(t => t.product === slug).length,
      page:  1,
      pages: 1,
    };
  }, [product]);

  return useApi(url, fallback, product + JSON.stringify(params));
}

// ─── Customers ────────────────────────────────────────────────────────────────
export function useCustomers(params?: Record<string, string>) {
  const { product } = useApp();
  const qs  = params ? "?" + new URLSearchParams(params).toString() : "";
  const url = `${PROXY}/${product}/customers${qs}`;

  const fallback = useMemo(() => {
    const slug = product === "durapayment" ? "DuraPayment"
               : product === "durapay"     ? "DuraPay"
               : "DuraBiz";
    return {
      data:  CUSTOMERS.filter(c => c.product === slug),
      total: CUSTOMERS.filter(c => c.product === slug).length,
    };
  }, [product]);

  return useApi(url, fallback, product + JSON.stringify(params));
}

// ─── Issues ───────────────────────────────────────────────────────────────────
export function useIssues(params?: Record<string, string>) {
  const { product } = useApp();
  const qs  = params ? "?" + new URLSearchParams(params).toString() : "";
  const url = `${PROXY}/${product}/issues${qs}`;

  const fallback = useMemo(() => {
    const slug = product === "durapayment" ? "DuraPayment"
               : product === "durapay"     ? "DuraPay"
               : "DuraBiz";
    return {
      data:  ISSUES.filter(i => i.product === slug),
      total: ISSUES.filter(i => i.product === slug).length,
    };
  }, [product]);

  return useApi(url, fallback, product + JSON.stringify(params));
}

// ─── Analytics ────────────────────────────────────────────────────────────────
export function useAnalytics(range: string) {
  const { product } = useApp();
  const url = `${PROXY}/${product}/analytics?range=${range}`;

  const fallback = useMemo(() => ({
    kpis: {
      totalRevenue:   121800000,
      avgDailyTx:     59,
      conversionRate: 3.8,
      churnRate:      1.2,
    },
    chart:      chartData,
    issueBreakdown: issueStatusData,
  }), []);

  return useApi(url, fallback, product + range);
}

// ─── Balance (CEO only) ───────────────────────────────────────────────────────
export function useBalance() {
  const { product } = useApp();
  const url = `${PROXY}/${product}/balance`;

  const fallback = useMemo(() => ({
    total:     847200000,
    currency:  "NGN",
    breakdown: { durapayment: 312000000, durapay: 284000000, durabiz: 251000000 },
    change:    18.4,
  }), []);

  return useApi(url, fallback, product);
}
