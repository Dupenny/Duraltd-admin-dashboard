"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/lib/store";
import { getPerms, ROLE_LABELS } from "@/lib/auth";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  requirePerm?: keyof ReturnType<typeof getPerms>;
  badge?: string;
}

const MAIN_NAV: NavItem[] = [
  { href: "/overview",     label: "Overview",       icon: <GridIcon /> },
  { href: "/products",     label: "Products",        icon: <BoxIcon /> },
  { href: "/customers",    label: "Customers",       icon: <UsersIcon /> },
  { href: "/transactions", label: "Orders",          icon: <ShoppingIcon /> },
  { href: "/issues",       label: "Shipment",        icon: <TruckIcon />, badge: "6" },
];

const SETTINGS_NAV: NavItem[] = [
  { href: "/settings",     label: "Store Setting",   icon: <GearIcon />,  requirePerm: "canManageSettings" },
  { href: "/analytics",    label: "Platform Partner",icon: <GridSmIcon />, requirePerm: "canViewAnalytics" },
  { href: "/users",        label: "Feedback",        icon: <ChatIcon />,  requirePerm: "canManageUsers" },
];

// White sidebar with black active state
const GOLD = "#C9A84C";
const ACTIVE_BG = "#111111";
const ACTIVE_COLOR = "#ffffff";
const ACTIVE_LIGHT = "#111111";
const SIDEBAR_BG = "#ffffff";
const SIDEBAR_BORDER = "#F0F0F0";

export function DashboardSidebar({ mobile, onClose }: { mobile?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useApp();
  const perms = user ? getPerms(user.role) : null;

  const visibleMain     = MAIN_NAV.filter(i => !i.requirePerm || perms?.[i.requirePerm]);
  const visibleSettings = SETTINGS_NAV.filter(i => !i.requirePerm || perms?.[i.requirePerm]);

  function NavLink({ item }: { item: NavItem }) {
    const active = pathname === item.href || pathname.startsWith(item.href + "/");
    return (
      <Link href={item.href} onClick={mobile ? onClose : undefined}
        style={{
          display: "flex", alignItems: "center", gap: 11,
          padding: "10px 13px", borderRadius: 11,
          textDecoration: "none", fontSize: 14,
          fontWeight: active ? 600 : 400,
          background: active ? ACTIVE_BG : "transparent",
          color: active ? ACTIVE_COLOR : "#666666",
          transition: "all 0.15s",
          position: "relative",
        }}
        onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = "#F5F5F5"; (e.currentTarget as HTMLElement).style.color = "#111"; } }}
        onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#666666"; } }}
      >
        <span style={{ opacity: active ? 1 : 0.6, color: "inherit", display: "flex" }}>{item.icon}</span>
        <span style={{ flex: 1 }}>{item.label}</span>
        {item.badge && !active && (
          <span style={{ background: "#EF4444", color: "#fff", borderRadius: 10, padding: "1px 7px", fontSize: 10.5, fontWeight: 700 }}>{item.badge}</span>
        )}
      </Link>
    );
  }

  return (
    <aside style={{
      width: "var(--sidebar-width)",
      minWidth: "var(--sidebar-width)",
      height: "100vh",
      background: SIDEBAR_BG,
      display: "flex",
      flexDirection: "column",
      position: "sticky",
      top: 0,
      zIndex: 40,
      flexShrink: 0,
      overflowY: "auto",
      overflowX: "hidden",
    }}>

      {/* Logo */}
      <div style={{ padding: "22px 18px 18px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          {/* Logo mark — two-bar style like reference */}
          <div style={{
            width: 36, height: 36, borderRadius: 9,
            background: "#111",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <div style={{ display: "flex", gap: 3 }}>
              <div style={{ width: 4, height: 18, background: "#fff", borderRadius: 3 }} />
              <div style={{ width: 4, height: 18, background: "#fff", borderRadius: 3 }} />
            </div>
          </div>
          <span style={{ fontWeight: 700, fontSize: 15, color: "#111", letterSpacing: -0.3 }}>
            Dura<span style={{ color: "#2563EB" }}>LTD</span>
          </span>
          {mobile && (
            <button onClick={onClose} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", fontSize: 18, display: "flex" }}>✕</button>
          )}
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: SIDEBAR_BORDER, margin: "0 18px", flexShrink: 0 }} />

      {/* Nav */}
      <nav style={{ flex: 1, padding: "18px 14px 12px", overflowY: "auto", overflowX: "hidden" }}>
        {/* Main Menu */}
        <p style={{ fontSize: 10, fontWeight: 700, color: "#B0B0B0", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10, padding: "0 4px" }}>Main Menu</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 28 }}>
          {visibleMain.map(item => <NavLink key={item.href} item={item} />)}
        </div>

        {/* Settings */}
        {visibleSettings.length > 0 && (
          <>
            <p style={{ fontSize: 10, fontWeight: 700, color: "#B0B0B0", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10, padding: "0 4px" }}>Settings</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {visibleSettings.map(item => <NavLink key={item.href} item={item} />)}
            </div>
          </>
        )}
      </nav>

      {/* Upgrade to Pro card */}
      <div style={{ padding: "0 14px 16px", flexShrink: 0 }}>
        <div style={{ background: "#111", border: "none", borderRadius: 16, padding: "18px 16px" }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, marginBottom: 14 }}>✨</div>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: GOLD, margin: "0 0 7px", letterSpacing: -0.4 }}>Upgrade Pro</h3>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.6, margin: "0 0 14px" }}>
            Unlock detailed analytics, reports & premium integrations.
          </p>
          <button style={{
            width: "100%", height: 42, borderRadius: 11,
            background: GOLD, color: "#111",
            border: "none", fontWeight: 700, fontSize: 13,
            cursor: "pointer", display: "flex", alignItems: "center",
            justifyContent: "center", gap: 6,
            letterSpacing: -0.2,
          }}>
            Upgrade Now →
          </button>
        </div>
      </div>

      {/* User info */}
      {user && (
        <div style={{ padding: "12px 14px 16px", borderTop: `1px solid ${SIDEBAR_BORDER}`, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 11, background: "#F5F5F5" }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: user.avatarColor, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{user.initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.name}</div>
              <div style={{ fontSize: 10.5, color: "#9CA3AF", fontWeight: 500 }}>{ROLE_LABELS[user.role].label}</div>
            </div>
            <button onClick={logout} title="Logout"
              style={{ background: "none", border: "none", cursor: "pointer", color: "#C0C0C0", display: "flex", padding: 4, borderRadius: 6, flexShrink: 0 }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#EF4444"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#C0C0C0"; }}>
              <LogoutIcon />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}

// Icons
function GridIcon()    { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>; }
function BoxIcon()     { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>; }
function UsersIcon()   { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>; }
function ShoppingIcon(){ return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>; }
function TruckIcon()   { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>; }
function GearIcon()    { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>; }
function GridSmIcon()  { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>; }
function ChatIcon()    { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>; }
function LogoutIcon()  { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>; }
