"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/lib/store";
import { getPerms } from "@/lib/auth";

const NAV = [
  { href: "/dashboard",              label: "Home",      icon: HomeIcon },
  { href: "/dashboard/transactions", label: "Orders",    icon: ShoppingIcon },
  { href: "/dashboard/customers",    label: "Customers", icon: UsersIcon },
  { href: "/dashboard/issues",       label: "Issues",    icon: AlertIcon, badge: true },
  { href: "/dashboard/settings",     label: "Settings",  icon: GearIcon },
];

export function MobileNav() {
  const pathname = usePathname();
  const { user } = useApp();
  const perms = user ? getPerms(user.role) : null;

  const visible = NAV.filter(item => {
    if (item.href === "/dashboard/settings" && !perms?.canManageSettings) return false;
    return true;
  });

  return (
    <nav className="mobile-nav" style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100,
      background: "rgba(255,255,255,0.95)",
      backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
      borderTop: "1px solid var(--border)",
      padding: "8px 4px calc(8px + env(safe-area-inset-bottom))",
      justifyContent: "space-around",
      alignItems: "stretch",
      boxShadow: "0 -4px 24px rgba(13,27,62,0.08)",
    }}>
      {visible.map(item => {
        const active = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link key={item.href} href={item.href} style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            gap: 4, padding: "4px 8px", borderRadius: 12,
            textDecoration: "none", flex: 1, maxWidth: 72,
            transition: "all 0.15s",
          }}>
            <div style={{ position: "relative" }}>
              <div style={{
                width: 42, height: 32, borderRadius: 10, display: "flex",
                alignItems: "center", justifyContent: "center",
                background: active ? "var(--accent)" : "transparent",
                transition: "all 0.2s cubic-bezier(0.34,1.56,0.64,1)",
                transform: active ? "scale(1.05)" : "scale(1)",
              }}>
                <Icon color={active ? "#fff" : "var(--text-3)"} />
              </div>
              {item.badge && (
                <span style={{
                  position: "absolute", top: 0, right: -2,
                  width: 8, height: 8, borderRadius: "50%",
                  background: "var(--red)", border: "1.5px solid #fff",
                }} />
              )}
            </div>
            <span style={{
              fontSize: 10, fontWeight: active ? 700 : 500,
              color: active ? "var(--accent)" : "var(--text-3)",
              letterSpacing: active ? 0 : 0.1, transition: "all 0.15s",
            }}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function HomeIcon({ color }: { color: string })     { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>; }
function ShoppingIcon({ color }: { color: string }) { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>; }
function UsersIcon({ color }: { color: string })    { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>; }
function AlertIcon({ color }: { color: string })    { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>; }
function GearIcon({ color }: { color: string })     { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>; }
