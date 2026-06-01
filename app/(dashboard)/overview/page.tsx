"use client";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { getPerms } from "@/lib/auth";
import { fmtCurrency, fmtNum } from "@/lib/utils";
import { chartData, TRANSACTIONS } from "@/lib/mock-data";
import {
  TrendingUp, ShoppingBag, CircleDollarSign,
  Settings, Filter, Upload, ChevronRight, Ellipsis,
} from "lucide-react";

const PRODUCT_LABEL: Record<string, string> = {
  durapayment: "DuraPayment", durapay: "DuraPay", durabiz: "DuraBiz",
};
const PRODUCT_ACCENT: Record<string, string> = {
  durapayment: "#2563EB", durapay: "#10B981", durabiz: "#7C3AED",
};

const TOP_PRODUCTS = [
  { name: "DuraPayment Gateway",      sales: 12429, stock: 132, initials: "DP", color: "#E8F4FD", textColor: "#1565C0" },
  { name: "DuraPay Personal Banking", sales: 11021, stock: 92,  initials: "PB", color: "#EDE7F6", textColor: "#4527A0" },
  { name: "DuraBiz Business Suite",   sales: 10321, stock: 72,  initials: "BS", color: "#F3E5F5", textColor: "#6A1B9A" },
];

const TX_STATUS: Record<string, { bg: string; text: string; dot: string }> = {
  Completed: { bg: "#EEF9F3", text: "#1B7A45", dot: "#22C55E" },
  Pending:   { bg: "#FFF8EC", text: "#92400E", dot: "#F59E0B" },
  Failed:    { bg: "#FEF2F2", text: "#991B1B", dot: "#EF4444" },
};

// SVG chart — same aesthetic as reference
function SalesChart({ accent }: { accent: string }) {
  const months = ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {/* Y-axis labels */}
      <div style={{
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        fontSize: 11, color: "#9CA3AF", paddingBottom: 20, flexShrink: 0,
        userSelect: "none", height: 220,
      }}>
        {["$25K", "$20K", "$15K", "$10K", "$0"].map(l => <span key={l}>{l}</span>)}
      </div>

      <div style={{ flex: 1, position: "relative", minWidth: 0 }}>
        <svg viewBox="0 0 800 200" style={{ width: "100%", height: 200, display: "block" }}
          fill="none" preserveAspectRatio="none">
          <defs>
            <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={accent} stopOpacity="0.18" />
              <stop offset="100%" stopColor={accent} stopOpacity="0" />
            </linearGradient>
            <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#94A3B8" stopOpacity="0.13" />
              <stop offset="100%" stopColor="#94A3B8" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0, 50, 100, 150, 200].map(y => (
            <line key={y} x1="0" y1={y} x2="800" y2={y} stroke="#F0F0F0" strokeWidth="1" />
          ))}
          {/* Revenue area */}
          <path d="M0 160 C80 155,130 120,200 100 S310 145,380 120 S480 70,540 55 S660 110,740 85 S780 60,800 40 L800 200 L0 200 Z"
            fill="url(#g1)" />
          {/* Orders area */}
          <path d="M0 175 C90 185,140 140,210 155 S320 140,390 125 S480 115,560 90 S670 130,750 95 S785 75,800 55 L800 200 L0 200 Z"
            fill="url(#g2)" />
          {/* Revenue line */}
          <path d="M0 160 C80 155,130 120,200 100 S310 145,380 120 S480 70,540 55 S660 110,740 85 S780 60,800 40"
            stroke={accent} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          {/* Orders line */}
          <path d="M0 175 C90 185,140 140,210 155 S320 140,390 125 S480 115,560 90 S670 130,750 95 S785 75,800 55"
            stroke="#94A3B8" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          {/* Hover dot on Revenue at Sep (~380) */}
          <circle cx="380" cy="120" r="5" fill="white" stroke={accent} strokeWidth="2.5" />
          <circle cx="380" cy="120" r="10" fill={accent} fillOpacity="0.12" />
          {/* Tooltip */}
          <g>
            <rect x="395" y="55" width="148" height="75" rx="10" fill="white" stroke="#E5E7EB" strokeWidth="1"
              style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.08))" }} />
            <text x="410" y="74" fontSize="10" fill="#9CA3AF" fontFamily="system-ui">Sep 2024</text>
            <circle cx="410" cy="89" r="3.5" fill={accent} />
            <text x="420" y="93" fontSize="11" fill="#6B7280" fontFamily="system-ui">Revenue</text>
            <text x="497" y="93" fontSize="11" fill="#111827" fontWeight="600" fontFamily="system-ui">₦18.9K</text>
            <circle cx="410" cy="107" r="3.5" fill="#94A3B8" />
            <text x="420" y="111" fontSize="11" fill="#6B7280" fontFamily="system-ui">Orders</text>
            <text x="497" y="111" fontSize="11" fill="#111827" fontWeight="600" fontFamily="system-ui">1,340</text>
          </g>
        </svg>
        {/* X-axis */}
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#9CA3AF", marginTop: 4 }}>
          {months.map(m => <span key={m}>{m}</span>)}
        </div>
      </div>
    </div>
  );
}

// Mobile order card
function OrderCard({ tx, showPrice }: { tx: typeof TRANSACTIONS[0]; showPrice: boolean }) {
  const sc = TX_STATUS[tx.status] ?? TX_STATUS.Completed;
  const d = new Date(tx.date);
  const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    + ", " + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }).toLowerCase();
  return (
    <div style={{ padding: "14px 16px", borderBottom: "1px solid #F5F5F5", display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 12, color: "#111", fontFamily: "monospace" }}>{tx.id}</div>
          <div style={{ fontSize: 13, color: "#333", marginTop: 2 }}>{tx.product}</div>
        </div>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 7,
          background: sc.bg, color: sc.text, fontSize: 11, fontWeight: 600, flexShrink: 0 }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: sc.dot, display: "inline-block" }} />
          {tx.status}
        </span>
      </div>
      <div style={{ display: "flex", gap: 12, fontSize: 12, color: "#9CA3AF", alignItems: "center" }}>
        <span>{dateStr}</span>
        <span>·</span>
        <span>{tx.method}</span>
        {showPrice && (
          <span style={{ marginLeft: "auto", fontWeight: 700, fontSize: 13, color: "#111" }}>
            {fmtCurrency(tx.amount, true)}
          </span>
        )}
      </div>
    </div>
  );
}

export default function OverviewPage() {
  const { user, product } = useApp();
  if (!user) return null;
  const perms  = getPerms(user.role);
  const accent = PRODUCT_ACCENT[product] ?? "#2563EB";

  const kpis = [
    { title: "Avg. Order Value", value: fmtCurrency(72980, true), change: "+3.16%", dark: true,  Icon: TrendingUp },
    { title: "Total Orders",     value: fmtNum(2219),              change: "+1.18%", dark: false, Icon: ShoppingBag },
    { title: "Lifetime Value",   value: perms.canViewRevenue ? fmtCurrency(560000, true) : "—",
      change: "+2.42%", dark: false, Icon: CircleDollarSign },
  ];

  const css = `
    .ov-grid { display: grid; grid-template-columns: repeat(auto-fit,minmax(160px,1fr)); gap: 12px; }
    .ov-mid   { display: grid; grid-template-columns: 1fr 320px; gap: 14px; }
    .ov-chart-span { grid-column: 1; }
    .ov-table-wrap  { display: block; }
    .ov-card-wrap   { display: none; }
    @media (max-width: 900px) {
      .ov-mid { grid-template-columns: 1fr; }
    }
    @media (max-width: 640px) {
      .ov-table-wrap { display: none; }
      .ov-card-wrap  { display: block; }
    }
  `;

  return (
    <>
      <style>{css}</style>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif' }}>

        {/* Header */}
        <div style={{ marginBottom: 8 }}>
          <h1 style={{ fontSize: "clamp(22px,4vw,32px)", fontWeight: 700, letterSpacing: -0.8, margin: "0 0 5px", color: "#0A0A0A" }}>
            Welcome back, {user.name.split(" ")[0]}! 👋
          </h1>
          <p style={{ fontSize: 14, color: "#9CA3AF", margin: 0 }}>
            Here's your current {PRODUCT_LABEL[product] ?? "sales"} overview
          </p>
        </div>

        {/* KPI Cards */}
        <div className="ov-grid">
          {kpis.map(({ title, value, change, dark, Icon }, i) => (
            <div key={title} style={{
              borderRadius: 18, padding: "18px 20px",
              background: dark ? "#0A0A0A" : "white",
              border: `1px solid ${dark ? "#1A1A1A" : "#F0F0F0"}`,
              animation: `fadeUp 0.4s ease ${i * 0.07}s both`,
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
                <span style={{ fontSize: 12, color: dark ? "rgba(255,255,255,0.5)" : "#9CA3AF", fontWeight: 500 }}>{title}</span>
                <div style={{ width: 34, height: 34, borderRadius: 9,
                  background: dark ? "#1E1E1E" : "#F5F5F5",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={15} color={dark ? "rgba(255,255,255,0.65)" : "#666"} />
                </div>
              </div>
              <div style={{ fontSize: "clamp(22px,3.5vw,30px)", fontWeight: 700, letterSpacing: -1,
                color: dark ? "#fff" : "#0A0A0A", marginBottom: 7 }}>{value}</div>
              <div style={{ fontSize: 12 }}>
                <span style={{ color: "#22C55E", fontWeight: 600 }}>{change}</span>{" "}
                <span style={{ color: dark ? "rgba(255,255,255,0.4)" : "#9CA3AF" }}>from last month</span>
              </div>
            </div>
          ))}
        </div>

        {/* Chart + Top Products */}
        <div className="ov-mid">
          {/* Chart */}
          <div style={{ background: "white", border: "1px solid #F0F0F0", borderRadius: 18, padding: 20, minWidth: 0, animation: "fadeUp 0.4s ease 0.15s both" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 8px", color: "#0A0A0A" }}>Sales Overtime</h2>
                <div style={{ display: "flex", gap: 14 }}>
                  {[{ color: accent, label: "Revenue" }, { color: "#94A3B8", label: "Orders" }].map(({ color, label }) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#9CA3AF" }}>
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: color, display: "inline-block" }} />
                      {label}
                    </div>
                  ))}
                </div>
              </div>
              <button style={{ width: 34, height: 34, borderRadius: 8, border: "1px solid #F0F0F0", background: "white",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Ellipsis size={15} color="#999" />
              </button>
            </div>
            <SalesChart accent={accent} />
          </div>

          {/* Top Selling Products */}
          <div style={{ background: "white", border: "1px solid #F0F0F0", borderRadius: 18, padding: 20, minWidth: 0, animation: "fadeUp 0.4s ease 0.2s both" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <h2 style={{ fontSize: 15, fontWeight: 600, margin: 0, color: "#0A0A0A" }}>Top Selling Products</h2>
              <button style={{ fontSize: 12, color: "#6B7280", background: "none", border: "none", cursor: "pointer",
                fontWeight: 500, display: "flex", alignItems: "center", gap: 2 }}>
                See All <ChevronRight size={12} />
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {TOP_PRODUCTS.map(p => (
                <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px",
                  borderRadius: 12, background: "#FAFAFA", border: "1px solid #F5F5F5" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: p.color,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 700, color: p.textColor, flexShrink: 0 }}>
                    {p.initials}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 500, fontSize: 13, color: "#111", marginBottom: 2,
                      whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: "#9CA3AF" }}>{p.sales.toLocaleString()} Sales</div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 10, color: "#16A34A", fontWeight: 600, marginBottom: 3,
                      display: "flex", alignItems: "center", gap: 3 }}>
                      <span style={{ width: 5, height: 5, background: "#22C55E", borderRadius: "50%", display: "inline-block" }} />
                      Available
                    </div>
                    <div style={{ fontSize: 10, color: "#B0B0B0" }}>{p.stock} remaining</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Latest Orders — Desktop table */}
        <div className="ov-table-wrap" style={{ background: "white", border: "1px solid #F0F0F0", borderRadius: 18, padding: 20, overflowX: "auto", animation: "fadeUp 0.4s ease 0.25s both" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, margin: 0, color: "#0A0A0A" }}>Latest Orders</h2>
            <div style={{ display: "flex", gap: 8 }}>
              {[{ Icon: Settings, label: "Customize" }, { Icon: Filter, label: "Filter" }, { Icon: Upload, label: "Export" }].map(({ Icon, label }) => (
                <button key={label} style={{ display: "flex", alignItems: "center", gap: 5, padding: "0 12px", height: 36,
                  borderRadius: 9, border: "1px solid #EFEFEF", background: "white", fontSize: 12, color: "#555",
                  cursor: "pointer", fontWeight: 500 }}>
                  <Icon size={13} /> {label}
                </button>
              ))}
            </div>
          </div>
          <table style={{ width: "100%", minWidth: 580, borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #F3F3F3" }}>
                {["Order ID", "Product", "Order Date", ...(perms.canViewRevenue ? ["Price"] : []), "Payment", "Status", "Action"].map(col => (
                  <th key={col} style={{ textAlign: "left", padding: "0 10px 12px", fontSize: 11, fontWeight: 500,
                    color: "#B0B0B0", letterSpacing: 0.3, textTransform: "uppercase", whiteSpace: "nowrap" }}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TRANSACTIONS.slice(0, 6).map((tx, idx) => {
                const sc = TX_STATUS[tx.status] ?? TX_STATUS.Completed;
                const d = new Date(tx.date);
                const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
                  + ", " + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }).toLowerCase();
                return (
                  <tr key={tx.id} style={{ borderBottom: idx < 5 ? "1px solid #F9F9F9" : "none" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#FAFAFA"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                    <td style={{ padding: "13px 10px", fontSize: 12, fontWeight: 600, color: "#111", fontFamily: "monospace", whiteSpace: "nowrap" }}>{tx.id}</td>
                    <td style={{ padding: "13px 10px", fontSize: 13, color: "#333" }}>{tx.product}</td>
                    <td style={{ padding: "13px 10px", fontSize: 12, color: "#9CA3AF", whiteSpace: "nowrap" }}>{dateStr}</td>
                    {perms.canViewRevenue && (
                      <td style={{ padding: "13px 10px", fontSize: 13, fontWeight: 600, color: "#111" }}>{fmtCurrency(tx.amount, true)}</td>
                    )}
                    <td style={{ padding: "13px 10px", fontSize: 12, color: "#555" }}>{tx.method}</td>
                    <td style={{ padding: "13px 10px" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 9px", borderRadius: 7,
                        background: sc.bg, color: sc.text, fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: sc.dot, display: "inline-block" }} />
                        {tx.status}
                      </span>
                    </td>
                    <td style={{ padding: "13px 10px" }}>
                      <button style={{ background: "none", border: "none", cursor: "pointer", width: 30, height: 30,
                        borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Ellipsis size={14} color="#C0C0C0" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Latest Orders — Mobile cards */}
        <div className="ov-card-wrap" style={{ background: "white", border: "1px solid #F0F0F0", borderRadius: 18, overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "16px 16px 12px", borderBottom: "1px solid #F5F5F5", flexWrap: "wrap", gap: 8 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, margin: 0, color: "#0A0A0A" }}>Latest Orders</h2>
            <div style={{ display: "flex", gap: 7 }}>
              {[{ Icon: Filter, label: "Filter" }, { Icon: Upload, label: "Export" }].map(({ Icon, label }) => (
                <button key={label} style={{ display: "flex", alignItems: "center", gap: 4, padding: "0 10px", height: 34,
                  borderRadius: 8, border: "1px solid #EFEFEF", background: "white", fontSize: 12, color: "#555", cursor: "pointer" }}>
                  <Icon size={12} /> {label}
                </button>
              ))}
            </div>
          </div>
          {TRANSACTIONS.slice(0, 6).map(tx => (
            <OrderCard key={tx.id} tx={tx} showPrice={perms.canViewRevenue} />
          ))}
        </div>

        {/* CEO-only Balance Banner */}
        {perms.canViewBalance && (
          <div style={{ background: "linear-gradient(135deg,#0A0A0A,#1a1a2e)", borderRadius: 18, padding: "24px 28px", animation: "fadeUp 0.4s ease 0.3s both" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Total Platform Balance</p>
                <p style={{ fontFamily: "'Sora',sans-serif", fontSize: 34, fontWeight: 800, color: "#fff", marginBottom: 6, letterSpacing: -1 }}>₦ 847,200,000</p>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
                  <span style={{ color: "#22C55E", fontWeight: 700 }}>↑ 18.4%</span> growth this quarter
                </p>
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                {[
                  { label: "DuraPayment", amt: "₦ 312M", color: "#60A5FA" },
                  { label: "DuraPay",     amt: "₦ 284M", color: "#34D399" },
                  { label: "DuraBiz",     amt: "₦ 251M", color: "#A78BFA" },
                ].map(b => (
                  <div key={b.label} style={{ background: "rgba(255,255,255,0.06)", borderRadius: 12, padding: "12px 16px" }}>
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 5 }}>{b.label}</p>
                    <p style={{ fontWeight: 700, fontSize: 17, color: b.color }}>{b.amt}</p>
                  </div>
                ))}
                <button style={{ background: accent, color: "#fff", border: "none", borderRadius: 11, padding: "11px 20px",
                  fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                  Initiate Transfer <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
