/**
 * ═══════════════════════════════════════════════════════════
 *  PROXY MIDDLEWARE ROUTE
 *  All /api/proxy/* requests are forwarded to the real backend.
 *  Session cookie is attached automatically via credentials:include.
 *
 *  Set BACKEND_URL in .env.local, e.g.:
 *    BACKEND_URL=https://api.duraltd.com
 * ═══════════════════════════════════════════════════════════
 */

import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL ?? "https://api.duraltd.com";

async function handler(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const targetPath = "/" + path.join("/");
  const search    = req.nextUrl.search;
  const targetUrl = `${BACKEND_URL}${targetPath}${search}`;

  try {
    const backendRes = await fetch(targetUrl, {
      method:  req.method,
      headers: {
        "Content-Type": "application/json",
        // Forward session cookie
        ...(req.headers.get("cookie") ? { cookie: req.headers.get("cookie")! } : {}),
        // Forward auth header if present
        ...(req.headers.get("authorization") ? { authorization: req.headers.get("authorization")! } : {}),
      },
      ...(["POST", "PUT", "PATCH"].includes(req.method) ? { body: await req.text() } : {}),
      cache: "no-store",
    });

    const data = await backendRes.json().catch(() => null);
    const res  = NextResponse.json(data ?? {}, { status: backendRes.status });

    // Forward Set-Cookie header from backend (session cookie)
    const setCookie = backendRes.headers.get("set-cookie");
    if (setCookie) res.headers.set("set-cookie", setCookie);

    return res;
  } catch (err) {
    console.error("[PROXY ERROR]", targetUrl, err);
    return NextResponse.json({ message: "Proxy error — backend unreachable" }, { status: 502 });
  }
}

export const GET    = handler;
export const POST   = handler;
export const PUT    = handler;
export const PATCH  = handler;
export const DELETE = handler;
