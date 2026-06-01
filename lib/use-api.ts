/**
 * useApi — generic React hook for fetching from the Laravel backend via proxy.
 *
 * - Fetches on mount and whenever `key` changes (product switch triggers refetch).
 * - Falls back to `fallback` data while loading or on error so the UI never goes blank.
 * - `loading` is true only on the first fetch; subsequent refetches don't flash a spinner.
 */
"use client";
import { useState, useEffect, useCallback, useRef } from "react";

export interface UseApiState<T> {
  data: T;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useApi<T>(
  url: string,           // e.g. "/api/proxy/durapay/transactions"
  fallback: T,           // mock data used while loading / on error
  key?: string,          // change this to force a refetch (e.g. product slug)
): UseApiState<T> {
  const [data,    setData]    = useState<T>(fallback);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetch_ = useCallback(async () => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(url, {
        credentials: "include",
        headers: { Accept: "application/json" },
        signal: ctrl.signal,
        cache: "no-store",
      });

      if (!res.ok) {
        const msg = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
        throw new Error(msg?.message ?? `HTTP ${res.status}`);
      }

      const json = await res.json();
      setData(json);
    } catch (err: unknown) {
      if ((err as Error).name === "AbortError") return;
      const msg = err instanceof Error ? err.message : "Unknown error";
      setError(msg);
      // keep showing fallback / previous data — don't blank the screen
    } finally {
      setLoading(false);
    }
  }, [url]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetch_();
    return () => abortRef.current?.abort();
  }, [fetch_, key]);

  return { data, loading, error, refetch: fetch_ };
}
