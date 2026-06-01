"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useApp } from "@/lib/store";
import { ROLE_LABELS } from "@/lib/auth";

// For overview: show "Dashboard" only (it IS the homepage/dashboard)
// For all others: show "Dashboard / PageName" to indicate path through the dashboard
const PAGE_META: Record<string, { title: string; crumbs: string[] }> = {
  "/dashboard": { title: "Dashboard", crumbs: ["Dashboard"] },
  "/dashboard/transactions": { title: "Transactions",  crumbs: ["Dashboard", "Transactions"] },
  "/dashboard/customers":    { title: "Customers",     crumbs: ["Dashboard", "Customers"] },
  "/dashboard/issues":       { title: "Support Issues",crumbs: ["Dashboard", "Support Issues"] },
  "/dashboard/analytics":    { title: "Analytics",     crumbs: ["Dashboard", "Analytics"] },
  "/dashboard/users":        { title: "Users",         crumbs: ["Dashboard", "Users"] },
  "/dashboard/products":     { title: "Products",      crumbs: ["Dashboard", "Products"] },
  "/dashboard/settings":     { title: "Settings",      crumbs: ["Dashboard", "Settings"] },
};

const PRODUCT_COLORS: Record<string, string> = {
  durapayment: "#2563EB", durapay: "#10B981", durabiz: "#7C3AED",
};
const PRODUCT_LABELS: Record<string, string> = {
  durapayment: "DuraPayment", durapay: "DuraPay", durabiz: "DuraBiz",
};

export function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const pathname = usePathname();
  const { user, product } = useApp();
  const [search, setSearch] = useState("");
  const [notifs, setNotifs] = useState(3);
  const [notifOpen, setNotifOpen] = useState(false);
  const [now, setNow] = useState(new Date());

  useEffect(() => { const t = setInterval(() => setNow(new Date()), 60000); return () => clearInterval(t); }, []);

  const meta = PAGE_META[pathname] ?? { title: "Dashboard", crumbs: ["Dashboard"] };
  const accentColor = PRODUCT_COLORS[product] ?? "#2563EB";
  const productLabel = PRODUCT_LABELS[product] ?? "DuraPay";

  const NOTIFICATIONS = [
    { id: 1, title: "New support issue opened", body: "#ISS-442 — Duplicate charge reported", time: "2m ago", icon: "🔴", read: false },
    { id: 2, title: "Transaction completed",     body: "#TXN-8822 — ₦1,200,000 cleared",       time: "18m ago",icon: "✅", read: false },
    { id: 3, title: "New customer registered",   body: "Emeka Dike joined DuraBiz",             time: "1h ago", icon: "👤", read: false },
  ];

  return (
    <header style={{
      height: "var(--topbar-height)",
      background: "#fff",
      borderBottom: "1px solid #E2E8F4",
      display: "flex",
      alignItems: "center",
      gap: 16,
      padding: "0 24px",
      position: "sticky",
      top: 0,
      zIndex: 30,
      flexShrink: 0,
    }}>
      {/* Mobile menu button */}
      <button onClick={onMenuClick} style={{ display:"none", background:"none", border:"none", cursor:"pointer", color:"#4A5568", padding:4 }}
        className="mobile-menu-btn">
        <MenuIcon />
      </button>

      {/* Search */}
      <div style={{ flex:1, maxWidth:380, position:"relative" }}>
        <span style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:"#B0BAD0", display:"flex" }}><SearchIcon /></span>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder={`Search ${productLabel}…`}
          style={{ width:"100%", padding:"9px 14px 9px 36px", borderRadius:10, border:"1.5px solid #E2E8F4", fontSize:13.5, fontFamily:"'DM Sans',sans-serif", color:"#0D1B3E", background:"#F4F7FE", outline:"none", transition:"all 0.15s" }}
          onFocus={e => { e.target.style.background="#fff"; e.target.style.borderColor=accentColor; e.target.style.boxShadow=`0 0 0 3px ${accentColor}14`; }}
          onBlur={e => { e.target.style.background="#F4F7FE"; e.target.style.borderColor="#E2E8F4"; e.target.style.boxShadow="none"; }} />
        <kbd style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"#E2E8F4", borderRadius:5, padding:"1px 6px", fontSize:10.5, color:"#8A97B0" }}>⌘K</kbd>
      </div>

      {/* Breadcrumb */}
      <div style={{ flex:1, display:"flex", alignItems:"center", gap:6 }}>
        {meta.crumbs.map((crumb, i) => (
          <span key={crumb} style={{ display:"flex", alignItems:"center", gap:6 }}>
            {i > 0 && <span style={{ color:"#D1D5DB", fontSize:14 }}>/</span>}
            <span style={{
              fontSize: 13,
              fontWeight: i === meta.crumbs.length - 1 ? 600 : 400,
              color: i === meta.crumbs.length - 1 ? "#0D1B3E" : "#B0BAD0",
            }}>
              {crumb}
            </span>
          </span>
        ))}
      </div>

      {/* Right side */}
      <div style={{ display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
        <span style={{ fontSize:12, color:"#8A97B0", display:"flex", alignItems:"center", gap:5 }}>
          <ClockIcon />
          {now.toLocaleDateString("en-NG", { weekday:"short", month:"short", day:"numeric" })}
        </span>

        <div style={{ background:accentColor+"12", color:accentColor, borderRadius:8, padding:"5px 10px", fontSize:12, fontWeight:700, border:`1px solid ${accentColor}20` }}>
          {productLabel}
        </div>

        {/* Notifications */}
        <div style={{ position:"relative" }}>
          <button onClick={() => setNotifOpen(!notifOpen)} style={{ position:"relative", background:notifOpen?"#F4F7FE":"none", border:"1.5px solid", borderColor:notifOpen?"#E2E8F4":"transparent", borderRadius:10, width:38, height:38, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"#4A5568", transition:"all 0.15s" }}>
            <BellIcon />
            {notifs > 0 && <span style={{ position:"absolute", top:6, right:6, width:8, height:8, borderRadius:"50%", background:"#EF4444", border:"2px solid #fff" }} />}
          </button>
          {notifOpen && (
            <div style={{ position:"absolute", right:0, top:"calc(100% + 8px)", width:320, background:"#fff", border:"1px solid #E2E8F4", borderRadius:16, boxShadow:"0 12px 40px rgba(13,27,62,0.12)", zIndex:100, overflow:"hidden" }}>
              <div style={{ padding:"14px 16px 10px", borderBottom:"1px solid #E2E8F4", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <span style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:14, color:"#0D1B3E" }}>Notifications</span>
                <button onClick={() => setNotifs(0)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:12, color:"#2563EB", fontWeight:600 }}>Mark all read</button>
              </div>
              {NOTIFICATIONS.map(n => (
                <div key={n.id} style={{ padding:"13px 16px", borderBottom:"1px solid #F4F7FE", display:"flex", gap:12, background:n.read?"#fff":"#F8FAFF" }}>
                  <span style={{ fontSize:18, flexShrink:0 }}>{n.icon}</span>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:13, fontWeight:600, color:"#0D1B3E", marginBottom:2 }}>{n.title}</p>
                    <p style={{ fontSize:12, color:"#8A97B0", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{n.body}</p>
                  </div>
                  <span style={{ fontSize:11, color:"#B0BAD0", flexShrink:0 }}>{n.time}</span>
                </div>
              ))}
              <div style={{ padding:"10px 16px", textAlign:"center" }}>
                <button style={{ background:"none", border:"none", cursor:"pointer", fontSize:13, color:"#2563EB", fontWeight:600 }}>View all notifications</button>
              </div>
            </div>
          )}
        </div>

        {/* User avatar */}
        {user && (
          <div style={{ display:"flex", alignItems:"center", gap:9, padding:"5px 10px 5px 5px", borderRadius:10, border:"1.5px solid #E2E8F4", cursor:"pointer", transition:"all 0.15s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background="#F4F7FE"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background="transparent"; }}>
            <div style={{ width:30, height:30, borderRadius:8, background:user.avatarColor, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:11, fontWeight:700 }}>{user.initials}</div>
            <div style={{ display:"flex", flexDirection:"column" }}>
              <span style={{ fontSize:13, fontWeight:600, color:"#0D1B3E", lineHeight:1.3 }}>{user.name.split(" ")[0]}</span>
              <span style={{ fontSize:10.5, color:ROLE_LABELS[user.role].color, fontWeight:600 }}>{ROLE_LABELS[user.role].label}</span>
            </div>
            <ChevronIcon />
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </header>
  );
}

function SearchIcon()  { return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>; }
function BellIcon()    { return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>; }
function MenuIcon()    { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>; }
function ClockIcon()   { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>; }
function ChevronIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color:"#B0BAD0" }}><polyline points="6 9 12 15 18 9"/></svg>; }
