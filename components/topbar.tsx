"use client";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useApp } from "@/lib/store";
import { ROLE_LABELS } from "@/lib/auth";

const PAGE_META: Record<string, { title: string; crumbs: string[] }> = {
  "/dashboard": { title: "Dashboard", crumbs: ["Dashboard"] },
  "/dashboard/transactions": {
    title: "Transactions",
    crumbs: ["Dashboard", "Transactions"],
  },
  "/dashboard/customers": {
    title: "Customers",
    crumbs: ["Dashboard", "Customers"],
  },
  "/dashboard/issues": {
    title: "Support Issues",
    crumbs: ["Dashboard", "Support Issues"],
  },
  "/dashboard/analytics": {
    title: "Analytics",
    crumbs: ["Dashboard", "Analytics"],
  },
  "/dashboard/users": { title: "Users", crumbs: ["Dashboard", "Users"] },
  "/dashboard/products": {
    title: "Products",
    crumbs: ["Dashboard", "Products"],
  },
  "/dashboard/settings": {
    title: "Settings",
    crumbs: ["Dashboard", "Settings"],
  },
};

const PRODUCT_COLORS: Record<string, string> = {
  durapayment: "#2563EB",
  durapay: "#10B981",
  durabiz: "#7C3AED",
};
const PRODUCT_LABELS: Record<string, string> = {
  durapayment: "DuraPayment",
  durapay: "DuraPay",
  durabiz: "DuraBiz",
};

const NOTIFS = [
  {
    id: 1,
    title: "New issue opened",
    body: "#ISS-442 — Duplicate charge",
    time: "2m ago",
    icon: "🔴",
    read: false,
  },
  {
    id: 2,
    title: "Transaction completed",
    body: "#TXN-8822 — ₦1.2M cleared",
    time: "18m ago",
    icon: "✅",
    read: false,
  },
  {
    id: 3,
    title: "New customer joined",
    body: "Emeka Dike joined DuraBiz",
    time: "1h ago",
    icon: "👤",
    read: true,
  },
];

export function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const pathname = usePathname();
  const { user, product } = useApp();
  const [notifOpen, setNotifOpen] = useState(false);
  const [unread, setUnread] = useState(2);
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Close notifs on outside click
  useEffect(() => {
    function h(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node))
        setNotifOpen(false);
    }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // Auto-focus search when opened
  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.focus(), 50);
  }, [searchOpen]);

  const meta = PAGE_META[pathname] ?? {
    title: "Dashboard",
    crumbs: ["Dashboard"],
  };
  const accent = PRODUCT_COLORS[product] ?? "#2563EB";
  const prodLabel = PRODUCT_LABELS[product] ?? "DuraPay";

  return (
    <>
      <header
        style={{
          height: "var(--topbar-height)",
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          padding: "0 20px",
          gap: 12,
          position: "sticky",
          top: 0,
          zIndex: 30,
          flexShrink: 0,
        }}>
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="mob-menu-btn"
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            display: "none",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            cursor: "pointer",
            color: "var(--text-2)",
            flexShrink: 0,
          }}>
          <MenuIcon />
        </button>

        {/* Page info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              marginBottom: 1,
              flexWrap: "wrap",
            }}>
            {meta.crumbs.map((c, i) => (
              <span
                key={c}
                style={{ display: "flex", alignItems: "center", gap: 4 }}>
                {i > 0 && (
                  <span style={{ color: "var(--border-strong)", fontSize: 12 }}>
                    /
                  </span>
                )}
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: i === meta.crumbs.length - 1 ? 600 : 400,
                    color:
                      i === meta.crumbs.length - 1
                        ? "var(--text-2)"
                        : "var(--text-3)",
                  }}>
                  {c}
                </span>
              </span>
            ))}
          </div>
        </div>

        {/* Desktop search */}
        <div
          className="desk-search"
          style={{ position: "relative", flex: "0 1 300px" }}>
          <span
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-3)",
              display: "flex",
              pointerEvents: "none",
            }}>
            <SearchSvg />
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${prodLabel}…`}
            style={{
              width: "100%",
              padding: "8px 32px 8px 32px",
              borderRadius: 10,
              border: "1.5px solid var(--border)",
              fontSize: 13,
              fontFamily: "'DM Sans',sans-serif",
              color: "var(--text)",
              background: "var(--surface-2)",
              outline: "none",
              transition: "all 0.15s",
            }}
            onFocus={(e) => {
              e.target.style.background = "#fff";
              e.target.style.borderColor = accent;
              e.target.style.boxShadow = `0 0 0 3px ${accent}18`;
            }}
            onBlur={(e) => {
              e.target.style.background = "var(--surface-2)";
              e.target.style.borderColor = "var(--border)";
              e.target.style.boxShadow = "none";
            }}
          />
          <kbd
            style={{
              position: "absolute",
              right: 9,
              top: "50%",
              transform: "translateY(-50%)",
              background: "var(--border)",
              borderRadius: 5,
              padding: "1px 6px",
              fontSize: 10,
              color: "var(--text-3)",
            }}>
            ⌘K
          </kbd>
        </div>

        {/* Mobile search icon */}
        <button
          onClick={() => setSearchOpen(true)}
          className="mob-search-btn"
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            display: "none",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            cursor: "pointer",
            color: "var(--text-2)",
            flexShrink: 0,
          }}>
          <SearchSvg />
        </button>

        {/* Right: product pill + notifications + avatar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexShrink: 0,
          }}>
          {/* Product badge — desktop only */}
          <div
            className="desk-prod"
            style={{
              background: accent + "14",
              color: accent,
              border: `1px solid ${accent}22`,
              borderRadius: 8,
              padding: "4px 10px",
              fontSize: 11.5,
              fontWeight: 700,
              whiteSpace: "nowrap",
            }}>
            {prodLabel}
          </div>

          {/* Notifications */}
          <div ref={notifRef} style={{ position: "relative" }}>
            <button
              onClick={() => setNotifOpen((v) => !v)}
              style={{
                position: "relative",
                width: 38,
                height: 38,
                borderRadius: 10,
                background: notifOpen ? "var(--surface-2)" : "none",
                border: `1.5px solid ${notifOpen ? "var(--border)" : "transparent"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "var(--text-2)",
                transition: "all 0.15s",
              }}>
              <BellSvg />
              {unread > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: 6,
                    right: 6,
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "var(--red)",
                    border: "2px solid #fff",
                  }}
                />
              )}
            </button>

            {notifOpen && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: "calc(100% + 8px)",
                  width: "min(320px, 92vw)",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 16,
                  boxShadow: "0 16px 48px rgba(13,27,62,0.14)",
                  zIndex: 100,
                  overflow: "hidden",
                  animation: "fadeUp 0.15s ease",
                }}>
                <div
                  style={{
                    padding: "14px 16px 10px",
                    borderBottom: "1px solid var(--border)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}>
                  <span
                    style={{
                      fontFamily: "'Sora',sans-serif",
                      fontWeight: 700,
                      fontSize: 14,
                      color: "var(--text)",
                    }}>
                    Notifications
                  </span>
                  <button
                    onClick={() => setUnread(0)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 12,
                      color: "var(--accent)",
                      fontWeight: 600,
                    }}>
                    Mark all read
                  </button>
                </div>
                {NOTIFS.map((n) => (
                  <div
                    key={n.id}
                    style={{
                      padding: "12px 16px",
                      borderBottom: "1px solid var(--border)",
                      display: "flex",
                      gap: 10,
                      background: n.read
                        ? "var(--surface)"
                        : "var(--indigo-bg)",
                    }}>
                    <span
                      style={{ fontSize: 18, flexShrink: 0, lineHeight: 1.4 }}>
                      {n.icon}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontSize: 12.5,
                          fontWeight: 600,
                          color: "var(--text)",
                          marginBottom: 2,
                        }}>
                        {n.title}
                      </p>
                      <p
                        style={{
                          fontSize: 11.5,
                          color: "var(--text-3)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}>
                        {n.body}
                      </p>
                    </div>
                    <span
                      style={{
                        fontSize: 10.5,
                        color: "var(--text-3)",
                        flexShrink: 0,
                        marginTop: 1,
                      }}>
                      {n.time}
                    </span>
                  </div>
                ))}
                <div style={{ padding: "10px 16px", textAlign: "center" }}>
                  <button
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 12.5,
                      color: "var(--accent)",
                      fontWeight: 600,
                    }}>
                    View all
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Avatar */}
          {user && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "4px 10px 4px 4px",
                borderRadius: 10,
                border: "1.5px solid var(--border)",
                cursor: "pointer",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  "var(--surface-2)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  "transparent";
              }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 7,
                  background: user.avatarColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: 10.5,
                  fontWeight: 700,
                  boxShadow: `0 2px 6px ${user.avatarColor}55`,
                }}>
                {user.initials}
              </div>
              <div className="desk-username">
                <div
                  style={{
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: "var(--text)",
                    lineHeight: 1.2,
                  }}>
                  {user.name.split(" ")[0]}
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: ROLE_LABELS[user.role].color,
                    fontWeight: 600,
                  }}>
                  {ROLE_LABELS[user.role].label}
                </div>
              </div>
              <span
                className="desk-username"
                style={{ color: "var(--text-3)" }}>
                <ChevronSvg />
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Mobile full-screen search overlay */}
      {searchOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 300,
            background: "rgba(10,20,50,0.5)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            display: "flex",
            flexDirection: "column",
            padding: "60px 16px 16px",
          }}>
          <div
            style={{
              background: "var(--surface)",
              borderRadius: 16,
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              gap: 10,
              boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
            }}>
            <SearchSvg />
            <input
              ref={searchRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search anything…"
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                fontSize: 16,
                fontFamily: "'DM Sans',sans-serif",
                color: "var(--text)",
                background: "transparent",
              }}
            />
            <button
              onClick={() => {
                setSearchOpen(false);
                setSearch("");
              }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--text-3)",
                fontSize: 16,
                padding: 4,
              }}>
              ✕
            </button>
          </div>
          <p
            style={{
              textAlign: "center",
              color: "rgba(255,255,255,0.45)",
              fontSize: 13,
              marginTop: 16,
            }}>
            Tap anywhere to close
          </p>
          <div
            style={{ position: "absolute", inset: 0, zIndex: -1 }}
            onClick={() => setSearchOpen(false)}
          />
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .mob-menu-btn   { display: flex !important; }
          .mob-search-btn { display: flex !important; }
          .desk-search    { display: none !important; }
          .desk-prod      { display: none !important; }
          .desk-username  { display: none !important; }
        }
        @media (max-width: 480px) {
          header { padding: 0 12px !important; gap: 8px !important; }
        }
      `}</style>
    </>
  );
}

function SearchSvg() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
function BellSvg() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}
function MenuIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}
function ChevronSvg() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
