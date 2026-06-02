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
  { href: "/dashboard", label: "Overview", icon: <GridIcon /> },
  { href: "/dashboard/products", label: "Products", icon: <BoxIcon /> },
  { href: "/dashboard/customers", label: "Customers", icon: <UsersIcon /> },
  { href: "/dashboard/transactions", label: "Orders", icon: <ShoppingIcon /> },
  {
    href: "/dashboard/issues",
    label: "Shipment",
    icon: <TruckIcon />,
    badge: "6",
  },
];

const SETTINGS_NAV: NavItem[] = [
  {
    href: "/dashboard/settings",
    label: "Store Setting",
    icon: <GearIcon />,
    requirePerm: "canManageSettings",
  },
  {
    href: "/dashboard/analytics",
    label: "Platform Partner",
    icon: <GridSmIcon />,
    requirePerm: "canViewAnalytics",
  },
  {
    href: "/dashboard/users",
    label: "Feedback",
    icon: <ChatIcon />,
    requirePerm: "canManageUsers",
  },
];

// Defined OUTSIDE parent — fixes the double-active bug
function NavLink({
  item,
  pathname,
  mobile,
  onClose,
}: {
  item: NavItem;
  pathname: string;
  mobile?: boolean;
  onClose?: () => void;
}) {
  const active = pathname === item.href;
  return (
    <Link
      href={item.href}
      onClick={mobile ? onClose : undefined}
      className={`nav-item${active ? " active" : ""}`}>
      {item.icon}
      <span style={{ flex: 1 }}>{item.label}</span>
      {item.badge && !active && (
        <span
          style={{
            background: "var(--red)",
            color: "#fff",
            borderRadius: 20,
            padding: "1px 7px",
            fontSize: 10,
            fontWeight: 700,
          }}>
          {item.badge}
        </span>
      )}
    </Link>
  );
}

export function DashboardSidebar({
  mobile,
  onClose,
}: {
  mobile?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const { user, logout } = useApp();
  const perms = user ? getPerms(user.role) : null;
  const visibleMain = MAIN_NAV.filter(
    (i) => !i.requirePerm || perms?.[i.requirePerm],
  );
  const visibleSettings = SETTINGS_NAV.filter(
    (i) => !i.requirePerm || perms?.[i.requirePerm],
  );

  return (
    <aside
      style={{
        width: "var(--sidebar-width)",
        minWidth: "var(--sidebar-width)",
        height: "100vh",
        background: "var(--surface)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        position: "sticky",
        top: 0,
        zIndex: 40,
        flexShrink: 0,
        overflowY: "auto",
        overflowX: "hidden",
      }}>
      {/* Logo + close */}
      <div style={{ padding: "18px 16px 14px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              flexShrink: 0,
              background: "linear-gradient(135deg,#1e40af,#3b82f6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 10px rgba(37,99,235,0.35)",
            }}>
            <span
              style={{
                color: "#fff",
                fontWeight: 800,
                fontSize: 16,
                fontFamily: "'Sora',sans-serif",
              }}>
              D
            </span>
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontFamily: "'Sora',sans-serif",
                fontWeight: 700,
                fontSize: 15,
                color: "var(--text)",
                letterSpacing: -0.3,
                lineHeight: 1.2,
              }}>
              Dura<span style={{ color: "var(--accent)" }}>LTD</span>
            </div>
            <div
              style={{ fontSize: 10, color: "var(--text-3)", fontWeight: 500 }}>
              Admin Console
            </div>
          </div>
          {mobile && (
            <button
              onClick={onClose}
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "var(--text-3)",
                flexShrink: 0,
              }}>
              <XIcon />
            </button>
          )}
        </div>
      </div>

      <div className="divider" style={{ margin: "0 14px" }} />

      {/* User card */}
      {user && (
        <div style={{ padding: "12px 12px 6px", flexShrink: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              borderRadius: 12,
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
            }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 9,
                background: user.avatarColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: 12,
                fontWeight: 700,
                flexShrink: 0,
                boxShadow: `0 2px 8px ${user.avatarColor}55`,
              }}>
              {user.initials}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--text)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}>
                {user.name}
              </div>
              <div
                style={{
                  fontSize: 10.5,
                  color: ROLE_LABELS[user.role].color,
                  fontWeight: 600,
                  marginTop: 1,
                }}>
                {ROLE_LABELS[user.role].label}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav
        style={{
          flex: 1,
          padding: "10px 10px 8px",
          overflowY: "auto",
          overflowX: "hidden",
        }}>
        <p
          style={{
            fontSize: 9.5,
            fontWeight: 700,
            color: "var(--text-3)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: 5,
            padding: "0 4px",
          }}>
          Main Menu
        </p>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            marginBottom: 18,
          }}>
          {visibleMain.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              pathname={pathname}
              mobile={mobile}
              onClose={onClose}
            />
          ))}
        </div>

        {visibleSettings.length > 0 && (
          <>
            <p
              style={{
                fontSize: 9.5,
                fontWeight: 700,
                color: "var(--text-3)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 5,
                padding: "0 4px",
              }}>
              Settings
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {visibleSettings.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  pathname={pathname}
                  mobile={mobile}
                  onClose={onClose}
                />
              ))}
            </div>
          </>
        )}
      </nav>

      {/* Upgrade card */}
      <div style={{ padding: "0 10px 10px", flexShrink: 0 }}>
        <div
          style={{
            background: "linear-gradient(145deg,#111827,#1e293b)",
            borderRadius: 14,
            padding: "16px 14px",
            border: "1px solid rgba(255,255,255,0.06)",
          }}>
          <div style={{ fontSize: 20, marginBottom: 8 }}>✨</div>
          <div
            style={{
              fontFamily: "'Sora',sans-serif",
              fontSize: 13.5,
              fontWeight: 700,
              color: "#C9A84C",
              marginBottom: 4,
            }}>
            Upgrade to Pro
          </div>
          <p
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.4)",
              lineHeight: 1.6,
              marginBottom: 10,
            }}>
            Unlock analytics, exports & premium features.
          </p>
          <button
            style={{
              width: "100%",
              height: 34,
              borderRadius: 9,
              background: "linear-gradient(135deg,#C9A84C,#e6c96a)",
              color: "#111",
              border: "none",
              fontWeight: 700,
              fontSize: 12,
              cursor: "pointer",
            }}>
            Upgrade Now →
          </button>
        </div>
      </div>

      {/* Logout */}
      <div style={{ padding: "0 10px 14px", flexShrink: 0 }}>
        <button
          onClick={logout}
          className="btn btn-danger"
          style={{
            width: "100%",
            justifyContent: "center",
            height: 40,
            borderRadius: 10,
            fontSize: 13.5,
          }}>
          <LogoutIcon /> Log out
        </button>
      </div>
    </aside>
  );
}

function GridIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </svg>
  );
}
function BoxIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    </svg>
  );
}
function UsersIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function ShoppingIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}
function TruckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}
function GearIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
function GridSmIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </svg>
  );
}
function ChatIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
function LogoutIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}
function XIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
