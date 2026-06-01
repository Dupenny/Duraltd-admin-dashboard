/**
 * Next.js SSR Proxy → Laravel Backend
 *
 * Every request to /api/proxy/* is forwarded to BACKEND_URL (your Laravel API).
 * This runs server-side (Next.js SSR), so the Laravel URL is never exposed to the browser.
 *
 * Setup:
 *   BACKEND_URL=https://api.duraltd.com   in .env.local
 *
 * Laravel Sanctum:
 *   Cookies (including session cookies) and Authorization headers are forwarded
 *   automatically so Laravel Sanctum cookie-based auth works transparently.
 *
 * Usage from the frontend:
 *   fetch("/api/proxy/auth/login", { method: "POST", body: JSON.stringify({...}) })
 *   → forwarded to → https://api.duraltd.com/api/auth/login
 */

import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL ?? "https://api.duraltd.com";

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(req, await params);
}
export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(req, await params);
}
export async function PUT(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(req, await params);
}
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(req, await params);
}
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(req, await params);
}

async function proxy(req: NextRequest, params: { path: string[] }) {
  const segments = params.path ?? [];
  const targetPath = segments.join("/");
  const qs = req.nextUrl.searchParams.toString();
  const url = `${BACKEND_URL}/api/${targetPath}${qs ? `?${qs}` : ""}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "X-Requested-With": "XMLHttpRequest", // Laravel expects this for AJAX
  };

  // Forward Authorization header (Laravel Sanctum token auth)
  const auth = req.headers.get("authorization");
  if (auth) headers["Authorization"] = auth;

  // Forward cookies (Laravel Sanctum session-based auth / CSRF)
  const cookie = req.headers.get("cookie");
  if (cookie) headers["Cookie"] = cookie;

  const init: RequestInit = { method: req.method, headers };

  if (!["GET", "HEAD"].includes(req.method)) {
    try { init.body = await req.text(); } catch { /* no body */ }
  }

  try {
    const upstream = await fetch(url, init);
    const body = await upstream.text();
    return new NextResponse(body, {
      status: upstream.status,
      headers: { "Content-Type": upstream.headers.get("Content-Type") ?? "application/json" },
    });
  } catch (err) {
    console.error("[proxy] Backend unreachable:", err);
    return NextResponse.json(
      { message: "Backend unreachable. Check BACKEND_URL in .env.local" },
      { status: 502 }
    );
  }
}
