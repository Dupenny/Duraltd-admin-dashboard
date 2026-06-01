"use client";

/** Spinner shown during first load */
export function LoadingRows({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div style={{ padding: "8px 0" }}>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} style={{ display: "flex", gap: 12, padding: "13px 16px", borderBottom: "1px solid var(--border)" }}>
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} className="skeleton" style={{ height: 14, flex: c === 0 ? "0 0 100px" : 1, borderRadius: 6 }} />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Inline error banner with retry */
export function ErrorBanner({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "10px 14px", background: "var(--red-bg)", border: "1px solid #fca5a5",
      borderRadius: 10, gap: 10, flexWrap: "wrap",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 14 }}>⚠️</span>
        <span style={{ fontSize: 12.5, color: "var(--red)", fontWeight: 500 }}>
          Could not load data from server — showing cached data. {message}
        </span>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="btn btn-sm"
          style={{ background: "var(--red)", color: "#fff", border: "none", fontSize: 12, borderRadius: 8, flexShrink: 0 }}>
          Retry
        </button>
      )}
    </div>
  );
}

/** Product-context banner shown at the top of each page */
export function ProductBanner({ product, loading }: { product: string; loading: boolean }) {
  const LABELS: Record<string, { name: string; color: string; bg: string }> = {
    durapayment: { name: "DuraPayment", color: "#1D4ED8", bg: "#EFF6FF" },
    durapay:     { name: "DuraPay",     color: "#15803D", bg: "#F0FDF4" },
    durabiz:     { name: "DuraBiz",     color: "#6D28D9", bg: "#F5F3FF" },
  };
  const meta = LABELS[product] ?? LABELS.durapay;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ padding: "3px 10px", borderRadius: 20, background: meta.bg, color: meta.color, fontSize: 11.5, fontWeight: 700 }}>
        {meta.name}
      </span>
      {loading && (
        <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11.5, color: "var(--text-3)" }}>
          <span style={{ width: 12, height: 12, borderRadius: "50%", border: "2px solid var(--border)", borderTopColor: meta.color, display: "inline-block", animation: "spin 0.7s linear infinite" }} />
          Syncing…
        </span>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
