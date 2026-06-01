/**
 * ═══════════════════════════════════════════════════════════
 *  DURA LTD — Proxy API Client
 *  All calls route through /api/proxy/* which attaches the
 *  session cookie and forwards to the real backend.
 *
 *  Set NEXT_PUBLIC_BACKEND_URL in .env.local to point to
 *  your actual backend base URL.
 * ═══════════════════════════════════════════════════════════
 */

const PROXY = "/api/proxy";

type Method = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

export interface ApiResult<T = unknown> {
  data: T | null;
  error: string | null;
  status: number;
}

async function req<T>(method: Method, path: string, body?: unknown): Promise<ApiResult<T>> {
  try {
    const res = await fetch(`${PROXY}${path}`, {
      method,
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      cache: "no-store",
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) return { data: null, error: json?.message ?? `Error ${res.status}`, status: res.status };
    return { data: json as T, error: null, status: res.status };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Network error", status: 0 };
  }
}

// ────────────────────────────────────────────────────────────
// Auth API
// POST /api/proxy/auth/login        → { sessionToken, otpRequired }
// POST /api/proxy/auth/otp/verify   → { user, sessionCookie set }
// POST /api/proxy/auth/otp/resend   → { sent: true }
// POST /api/proxy/auth/logout       → { ok: true }
// ────────────────────────────────────────────────────────────
export const authApi = {
  login:     (email: string, password: string) => req("POST", "/auth/login",       { email, password }),
  verifyOtp: (email: string, code: string)     => req("POST", "/auth/otp/verify",  { email, code }),
  resendOtp: (email: string)                   => req("POST", "/auth/otp/resend",  { email }),
  logout:    ()                                => req("POST", "/auth/logout"),
  me:        ()                                => req("GET",  "/auth/me"),
};

// ────────────────────────────────────────────────────────────
// Dashboard / KPIs
// GET /api/proxy/{product}/dashboard
//   → { kpis: { totalRevenue, totalTransactions, activeUsers, openIssues }, chart }
// ────────────────────────────────────────────────────────────
export const dashboardApi = {
  get:      (product: string)               => req("GET", `/${product}/dashboard`),
  analytics:(product: string, range: string)=> req("GET", `/${product}/analytics?range=${range}`),
};

// ────────────────────────────────────────────────────────────
// Transactions
// GET  /api/proxy/{product}/transactions?page=1&limit=20&status=&search=
// GET  /api/proxy/{product}/transactions/{id}
// ────────────────────────────────────────────────────────────
export const txApi = {
  list: (product: string, p?: Record<string, string>) => {
    const q = p ? "?" + new URLSearchParams(p) : "";
    return req("GET", `/${product}/transactions${q}`);
  },
  get: (product: string, id: string) => req("GET", `/${product}/transactions/${id}`),
};

// ────────────────────────────────────────────────────────────
// Customers
// GET  /api/proxy/{product}/customers?page=1&limit=20&search=
// GET  /api/proxy/{product}/customers/{id}
// ────────────────────────────────────────────────────────────
export const customersApi = {
  list: (product: string, p?: Record<string, string>) => {
    const q = p ? "?" + new URLSearchParams(p) : "";
    return req("GET", `/${product}/customers${q}`);
  },
  get: (product: string, id: string) => req("GET", `/${product}/customers/${id}`),
};

// ────────────────────────────────────────────────────────────
// Issues
// GET   /api/proxy/{product}/issues?status=&priority=&search=
// GET   /api/proxy/{product}/issues/{id}
// POST  /api/proxy/{product}/issues
// PATCH /api/proxy/{product}/issues/{id}  body: { status }
// ────────────────────────────────────────────────────────────
export type IssueStatus = "TODO" | "IN_PROGRESS" | "DONE" | "CANCELED";
export const issuesApi = {
  list:         (product: string, p?: Record<string, string>) => {
    const q = p ? "?" + new URLSearchParams(p) : "";
    return req("GET", `/${product}/issues${q}`);
  },
  get:          (product: string, id: string)                              => req("GET",   `/${product}/issues/${id}`),
  create:       (product: string, body: Record<string, unknown>)           => req("POST",  `/${product}/issues`, body),
  updateStatus: (product: string, id: string, status: IssueStatus)        => req("PATCH", `/${product}/issues/${id}`, { status }),
};

// ────────────────────────────────────────────────────────────
// Balance — CEO only
// GET  /api/proxy/{product}/balance
// POST /api/proxy/{product}/transfer  body: { amount, recipient, note }
// ────────────────────────────────────────────────────────────
export const balanceApi = {
  get:      (product: string)                                        => req("GET",  `/${product}/balance`),
  transfer: (product: string, body: { amount: number; recipient: string; note?: string }) =>
                                                                        req("POST", `/${product}/transfer`, body),
};

// ────────────────────────────────────────────────────────────
// Users (admin / ceo)
// GET   /api/proxy/users
// PATCH /api/proxy/users/{id}
// ────────────────────────────────────────────────────────────
export const usersApi = {
  list:   (p?: Record<string, string>) => {
    const q = p ? "?" + new URLSearchParams(p) : "";
    return req("GET", `/users${q}`);
  },
  update: (id: string, body: Record<string, unknown>) => req("PATCH", `/users/${id}`, body),
};

const api = { authApi, dashboardApi, txApi, customersApi, issuesApi, balanceApi, usersApi };
export default api;
