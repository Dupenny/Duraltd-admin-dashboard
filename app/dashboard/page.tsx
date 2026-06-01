"use client";
import { useState, useMemo, useRef } from "react";
import { useApp } from "@/lib/store";
import { getPerms } from "@/lib/auth";
import { fmtCurrency, fmtNum, fmtDate } from "@/lib/utils";
import { chartData, TRANSACTIONS } from "@/lib/mock-data";
import { TrendingUp, ShoppingBag, CircleDollarSign, ChevronRight } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from "recharts";

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

const ALL_COLUMNS = [
  { id: "id",       label: "Order ID" },
  { id: "product",  label: "Product" },
  { id: "date",     label: "Date" },
  { id: "amount",   label: "Price" },
  { id: "method",   label: "Payment" },
  { id: "status",   label: "Status" },
];

const STATUS_OPTS = ["All", "Completed", "Pending", "Failed"] as const;
const PRODUCT_OPTS = ["All", "DuraPay", "DuraBiz", "DuraPayment"];

// Dropdown wrapper that closes on outside click
function Dropdown({ trigger, children, open, setOpen }: {
  trigger: React.ReactNode;
  children: React.ReactNode;
  open: boolean;
  setOpen: (v: boolean) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div onClick={() => setOpen(!open)}>{trigger}</div>
      {open && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setOpen(false)} />
          <div style={{ position: "absolute", right: 0, top: "calc(100% + 6px)", zIndex: 50, background: "#fff", border: "1px solid #E5E7EB", borderRadius: 14, boxShadow: "0 8px 32px rgba(0,0,0,0.1)", minWidth: 200, overflow: "hidden" }}>
            {children}
          </div>
        </>
      )}
    </div>
  );
}

export default function OverviewPage() {
  const { user, product } = useApp();
  if (!user) return null;
  const perms  = getPerms(user.role);
  const accent = PRODUCT_ACCENT[product] ?? "#2563EB";

  // Chart type toggle
  const [chartType, setChartType] = useState<"area" | "bar">("area");

  // Latest Orders state
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState<typeof STATUS_OPTS[number]>("All");
  const [productFilter, setProductFilter] = useState("All");
  const [visibleCols, setVisibleCols]   = useState(ALL_COLUMNS.map(c => c.id));
  const [orderPage, setOrderPage]       = useState(1);
  const ORDER_PER_PAGE = 5;

  // Dropdown open states
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [filterOpen, setFilterOpen]       = useState(false);
  const [exportOpen, setExportOpen]       = useState(false);

  const kpis = [
    { title: "Avg. Order Value", value: fmtCurrency(72980, true), change: "+3.16%", dark: true,  Icon: TrendingUp },
    { title: "Total Orders",     value: fmtNum(2219),              change: "+1.18%", dark: false, Icon: ShoppingBag },
    { title: "Lifetime Value",   value: perms.canViewRevenue ? fmtCurrency(560000, true) : "—",
      change: "+2.42%", dark: false, Icon: CircleDollarSign },
  ];

  // Filter transactions
  const filteredOrders = useMemo(() => {
    return TRANSACTIONS.filter(tx => {
      const q = search.toLowerCase();
      const matchSearch = !q || tx.id.toLowerCase().includes(q) || tx.customer.toLowerCase().includes(q);
      const matchStatus = statusFilter === "All" || tx.status === statusFilter;
      const matchProduct = productFilter === "All" || tx.product === productFilter;
      return matchSearch && matchStatus && matchProduct;
    });
  }, [search, statusFilter, productFilter]);

  const totalOrderPages = Math.max(1, Math.ceil(filteredOrders.length / ORDER_PER_PAGE));
  const pagedOrders = filteredOrders.slice((orderPage - 1) * ORDER_PER_PAGE, orderPage * ORDER_PER_PAGE);

  function toggleCol(id: string) {
    setVisibleCols(prev =>
      prev.includes(id) ? (prev.length > 1 ? prev.filter(c => c !== id) : prev) : [...prev, id]
    );
  }

  function exportCSV() {
    const cols = ALL_COLUMNS.filter(c => visibleCols.includes(c.id));
    const header = cols.map(c => c.label).join(",");
    const rows = filteredOrders.map(tx =>
      cols.map(c => {
        if (c.id === "amount") return perms.canViewRevenue ? fmtCurrency(tx.amount, false) : "Restricted";
        if (c.id === "date") return fmtDate(tx.date);
        return (tx as Record<string, unknown>)[c.id] ?? "";
      }).join(",")
    );
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "dura-orders.csv"; a.click();
    URL.revokeObjectURL(url);
    setExportOpen(false);
  }

  function exportJSON() {
    const blob = new Blob([JSON.stringify(filteredOrders, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "dura-orders.json"; a.click();
    URL.revokeObjectURL(url);
    setExportOpen(false);
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background:"#fff", border:"1px solid #E2E8F4", borderRadius:10, padding:"10px 14px", fontSize:12, boxShadow:"0 4px 20px rgba(0,0,0,0.08)" }}>
        <p style={{ fontWeight:600, color:"#0D1B3E", marginBottom:6 }}>{label}</p>
        {payload.map((p: any) => (
          <p key={p.dataKey} style={{ color: p.color, marginBottom:2 }}>
            {p.name}: <strong>{p.dataKey === "revenue" ? fmtCurrency(p.value) : p.value.toLocaleString()}</strong>
          </p>
        ))}
      </div>
    );
  };

  const css = `
    .ov-grid { display: grid; grid-template-columns: repeat(auto-fit,minmax(160px,1fr)); gap: 12px; }
    .ov-mid  { display: grid; grid-template-columns: 1fr 320px; gap: 14px; }
    @media (max-width: 900px) { .ov-mid { grid-template-columns: 1fr; } }
    @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
  `;

  return (
    <>
      <style>{css}</style>
      <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

        {/* Header */}
        <div style={{ marginBottom:8 }}>
          <h1 style={{ fontSize:"clamp(22px,4vw,32px)", fontWeight:700, letterSpacing:-0.8, margin:"0 0 5px", color:"#0A0A0A" }}>
            Welcome back, {user.name.split(" ")[0]}! 👋
          </h1>
          <p style={{ fontSize:14, color:"#9CA3AF", margin:0 }}>
            Here's your current {PRODUCT_LABEL[product] ?? "sales"} overview
          </p>
        </div>

        {/* KPI Cards */}
        <div className="ov-grid">
          {kpis.map(({ title, value, change, dark, Icon }, i) => (
            <div key={title} style={{ borderRadius:18, padding:"18px 20px", background: dark ? "#0A0A0A" : "white", border:`1px solid ${dark ? "#1A1A1A" : "#F0F0F0"}`, animation:`fadeUp 0.4s ease ${i * 0.07}s both` }}>
              <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:16 }}>
                <span style={{ fontSize:12, color: dark ? "rgba(255,255,255,0.5)" : "#9CA3AF", fontWeight:500 }}>{title}</span>
                <div style={{ width:34, height:34, borderRadius:9, background: dark ? "#1E1E1E" : "#F5F5F5", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <Icon size={15} color={dark ? "rgba(255,255,255,0.65)" : "#666"} />
                </div>
              </div>
              <div style={{ fontSize:"clamp(22px,3.5vw,30px)", fontWeight:700, letterSpacing:-1, color: dark ? "#fff" : "#0A0A0A", marginBottom:7 }}>{value}</div>
              <div style={{ fontSize:12 }}>
                <span style={{ color:"#22C55E", fontWeight:600 }}>{change}</span>{" "}
                <span style={{ color: dark ? "rgba(255,255,255,0.4)" : "#9CA3AF" }}>from last month</span>
              </div>
            </div>
          ))}
        </div>

        {/* Chart + Top Products */}
        <div className="ov-mid">
          {/* Real Recharts chart with toggle */}
          <div style={{ background:"white", border:"1px solid #F0F0F0", borderRadius:18, padding:20, minWidth:0, animation:"fadeUp 0.4s ease 0.15s both" }}>
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:16 }}>
              <div>
                <h2 style={{ fontSize:15, fontWeight:600, margin:"0 0 8px", color:"#0A0A0A" }}>Sales Overview</h2>
                <div style={{ display:"flex", gap:14 }}>
                  {perms.canViewRevenue && (
                    <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:12, color:"#9CA3AF" }}>
                      <span style={{ width:7, height:7, borderRadius:"50%", background:accent, display:"inline-block" }} />Revenue
                    </div>
                  )}
                  <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:12, color:"#9CA3AF" }}>
                    <span style={{ width:7, height:7, borderRadius:"50%", background:"#94A3B8", display:"inline-block" }} />Transactions
                  </div>
                </div>
              </div>
              {/* Chart type toggle */}
              <div style={{ display:"flex", gap:4, background:"#F5F5F5", borderRadius:9, padding:3 }}>
                {(["area","bar"] as const).map(t => (
                  <button key={t} onClick={() => setChartType(t)} style={{ padding:"5px 12px", borderRadius:7, border:"none", cursor:"pointer", fontSize:12, fontWeight:500, background: chartType === t ? "#fff" : "transparent", color: chartType === t ? "#111" : "#9CA3AF", boxShadow: chartType === t ? "0 1px 4px rgba(0,0,0,0.1)" : "none", transition:"all 0.15s", textTransform:"capitalize" }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              {chartType === "area" ? (
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="g_rev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={accent} stopOpacity={0.18} />
                      <stop offset="95%" stopColor={accent} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="g_tx" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#94A3B8" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#94A3B8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                  <XAxis dataKey="month" tick={{ fontSize:11, fill:"#B0BAD0" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize:10, fill:"#B0BAD0" }} axisLine={false} tickLine={false} width={44}
                    tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  {perms.canViewRevenue && (
                    <Area type="monotone" dataKey="revenue" name="Revenue" stroke={accent} fill="url(#g_rev)" strokeWidth={2.5} dot={false} />
                  )}
                  <Area type="monotone" dataKey="transactions" name="Transactions" stroke="#94A3B8" fill="url(#g_tx)" strokeWidth={2} dot={false} />
                </AreaChart>
              ) : (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize:11, fill:"#B0BAD0" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize:10, fill:"#B0BAD0" }} axisLine={false} tickLine={false} width={44}
                    tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  {perms.canViewRevenue && (
                    <Bar dataKey="revenue" name="Revenue" fill={accent} radius={[4,4,0,0]} maxBarSize={28} />
                  )}
                  <Bar dataKey="transactions" name="Transactions" fill="#94A3B8" radius={[4,4,0,0]} maxBarSize={28} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Top Selling Products */}
          <div style={{ background:"white", border:"1px solid #F0F0F0", borderRadius:18, padding:20, minWidth:0, animation:"fadeUp 0.4s ease 0.2s both" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
              <h2 style={{ fontSize:15, fontWeight:600, margin:0, color:"#0A0A0A" }}>Top Selling Products</h2>
              <button style={{ fontSize:12, color:"#6B7280", background:"none", border:"none", cursor:"pointer", fontWeight:500, display:"flex", alignItems:"center", gap:2 }}>
                See All <ChevronRight size={12} />
              </button>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {TOP_PRODUCTS.map(p => (
                <div key={p.name} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 12px", borderRadius:12, background:"#FAFAFA", border:"1px solid #F5F5F5" }}>
                  <div style={{ width:44, height:44, borderRadius:10, background:p.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:p.textColor, flexShrink:0 }}>{p.initials}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:500, fontSize:13, color:"#111", marginBottom:2, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{p.name}</div>
                    <div style={{ fontSize:11, color:"#9CA3AF" }}>{p.sales.toLocaleString()} Sales</div>
                  </div>
                  <div style={{ textAlign:"right", flexShrink:0 }}>
                    <div style={{ fontSize:10, color:"#16A34A", fontWeight:600, marginBottom:3, display:"flex", alignItems:"center", gap:3 }}>
                      <span style={{ width:5, height:5, background:"#22C55E", borderRadius:"50%", display:"inline-block" }} />Available
                    </div>
                    <div style={{ fontSize:10, color:"#B0B0B0" }}>{p.stock} remaining</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Latest Orders (fully functional) ── */}
        <div style={{ background:"white", border:"1px solid #F0F0F0", borderRadius:18, overflow:"hidden", animation:"fadeUp 0.4s ease 0.25s both" }}>
          {/* Header toolbar */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"18px 20px 14px", flexWrap:"wrap", gap:10 }}>
            <div>
              <h2 style={{ fontSize:15, fontWeight:600, margin:"0 0 2px", color:"#0A0A0A" }}>Latest Orders</h2>
              <p style={{ fontSize:11, color:"#9CA3AF", margin:0 }}>{filteredOrders.length} order{filteredOrders.length !== 1 ? "s" : ""}</p>
            </div>
            <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
              {/* Search */}
              <div style={{ position:"relative" }}>
                <span style={{ position:"absolute", left:9, top:"50%", transform:"translateY(-50%)", color:"#B0BAD0" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                </span>
                <input value={search} onChange={e => { setSearch(e.target.value); setOrderPage(1); }}
                  placeholder="Search…"
                  style={{ paddingLeft:28, paddingRight:10, height:34, borderRadius:9, border:"1px solid #EFEFEF", background:"#FAFAFA", fontSize:12, color:"#333", outline:"none", width:140 }} />
              </div>

              {/* Customize columns */}
              <Dropdown
                open={customizeOpen} setOpen={setCustomizeOpen}
                trigger={
                  <button style={{ display:"flex", alignItems:"center", gap:5, padding:"0 12px", height:34, borderRadius:9, border:`1px solid ${customizeOpen ? "#2563EB" : "#EFEFEF"}`, background: customizeOpen ? "#EFF6FF" : "white", fontSize:12, color: customizeOpen ? "#2563EB" : "#555", cursor:"pointer", fontWeight:500, transition:"all 0.15s" }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                    Customize
                  </button>
                }>
                <div style={{ padding:"14px 16px" }}>
                  <p style={{ fontSize:11, fontWeight:700, color:"#B0B0B0", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:10 }}>Visible Columns</p>
                  {ALL_COLUMNS.map(col => (
                    <button key={col.id} onClick={() => toggleCol(col.id)}
                      style={{ display:"flex", alignItems:"center", gap:10, width:"100%", padding:"7px 8px", borderRadius:8, border:"none", background:"transparent", cursor:"pointer", transition:"all 0.12s", textAlign:"left" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background="#F5F5F5"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background="transparent"; }}>
                      <div style={{ width:16, height:16, borderRadius:4, border:`2px solid ${visibleCols.includes(col.id) ? "#2563EB" : "#D1D5DB"}`, background: visibleCols.includes(col.id) ? "#2563EB" : "#fff", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all 0.12s" }}>
                        {visibleCols.includes(col.id) && <svg width="9" height="9" viewBox="0 0 12 12" fill="none"><polyline points="1.5,6 4.5,9 10.5,3" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </div>
                      <span style={{ fontSize:13, color:"#333" }}>{col.label}</span>
                    </button>
                  ))}
                </div>
              </Dropdown>

              {/* Filter */}
              <Dropdown
                open={filterOpen} setOpen={setFilterOpen}
                trigger={
                  <button style={{ display:"flex", alignItems:"center", gap:5, padding:"0 12px", height:34, borderRadius:9, border:`1px solid ${filterOpen ? "#2563EB" : "#EFEFEF"}`, background: filterOpen ? "#EFF6FF" : "white", fontSize:12, color: filterOpen ? "#2563EB" : "#555", cursor:"pointer", fontWeight:500, transition:"all 0.15s" }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                    Filter {(statusFilter !== "All" || productFilter !== "All") ? "●" : ""}
                  </button>
                }>
                <div style={{ padding:"14px 16px", minWidth:220 }}>
                  <p style={{ fontSize:11, fontWeight:700, color:"#B0B0B0", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:8 }}>Status</p>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:14 }}>
                    {STATUS_OPTS.map(s => (
                      <button key={s} onClick={() => { setStatusFilter(s); setOrderPage(1); }}
                        style={{ padding:"4px 12px", borderRadius:20, border:`1px solid ${statusFilter === s ? "#2563EB" : "#E5E7EB"}`, background: statusFilter === s ? "#2563EB" : "#fff", color: statusFilter === s ? "#fff" : "#555", fontSize:12, fontWeight:500, cursor:"pointer", transition:"all 0.12s" }}>
                        {s}
                      </button>
                    ))}
                  </div>
                  <p style={{ fontSize:11, fontWeight:700, color:"#B0B0B0", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:8 }}>Product</p>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                    {PRODUCT_OPTS.map(p => (
                      <button key={p} onClick={() => { setProductFilter(p); setOrderPage(1); }}
                        style={{ padding:"4px 12px", borderRadius:20, border:`1px solid ${productFilter === p ? "#2563EB" : "#E5E7EB"}`, background: productFilter === p ? "#2563EB" : "#fff", color: productFilter === p ? "#fff" : "#555", fontSize:12, fontWeight:500, cursor:"pointer", transition:"all 0.12s" }}>
                        {p}
                      </button>
                    ))}
                  </div>
                  {(statusFilter !== "All" || productFilter !== "All") && (
                    <button onClick={() => { setStatusFilter("All"); setProductFilter("All"); setOrderPage(1); }}
                      style={{ marginTop:12, width:"100%", padding:"7px", borderRadius:8, border:"1px solid #FED7D7", background:"#FEF2F2", color:"#DC2626", fontSize:12, fontWeight:600, cursor:"pointer" }}>
                      Clear Filters
                    </button>
                  )}
                </div>
              </Dropdown>

              {/* Export */}
              <Dropdown
                open={exportOpen} setOpen={setExportOpen}
                trigger={
                  <button style={{ display:"flex", alignItems:"center", gap:5, padding:"0 12px", height:34, borderRadius:9, border:`1px solid ${exportOpen ? "#2563EB" : "#EFEFEF"}`, background: exportOpen ? "#EFF6FF" : "white", fontSize:12, color: exportOpen ? "#2563EB" : "#555", cursor:"pointer", fontWeight:500, transition:"all 0.15s" }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Export
                  </button>
                }>
                <div>
                  <button onClick={exportCSV}
                    style={{ display:"flex", alignItems:"center", gap:10, width:"100%", padding:"12px 16px", border:"none", background:"transparent", fontSize:13, color:"#333", cursor:"pointer", transition:"all 0.12s", textAlign:"left" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background="#F5F5F5"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background="transparent"; }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    Export as CSV
                  </button>
                  <button onClick={exportJSON}
                    style={{ display:"flex", alignItems:"center", gap:10, width:"100%", padding:"12px 16px", border:"none", borderTop:"1px solid #F3F4F6", background:"transparent", fontSize:13, color:"#333", cursor:"pointer", transition:"all 0.12s", textAlign:"left" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background="#F5F5F5"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background="transparent"; }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    Export as JSON
                  </button>
                </div>
              </Dropdown>
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", minWidth:520, borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ borderBottom:"1px solid #F3F3F3", background:"#FAFAFA" }}>
                  {ALL_COLUMNS.filter(c => visibleCols.includes(c.id)).map(col => (
                    <th key={col.id} style={{ textAlign:"left", padding:"8px 14px 10px", fontSize:11, fontWeight:600, color:"#B0B0B0", letterSpacing:0.4, textTransform:"uppercase", whiteSpace:"nowrap" }}>
                      {col.label}
                    </th>
                  ))}
                  <th style={{ textAlign:"left", padding:"8px 14px 10px", fontSize:11, fontWeight:600, color:"#B0B0B0", letterSpacing:0.4, textTransform:"uppercase" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {pagedOrders.length === 0 ? (
                  <tr><td colSpan={visibleCols.length + 1} style={{ textAlign:"center", padding:"36px", color:"#C0C0C0", fontSize:13 }}>No orders found</td></tr>
                ) : pagedOrders.map((tx, idx) => {
                  const sc = TX_STATUS[tx.status] ?? TX_STATUS.Completed;
                  return (
                    <tr key={tx.id} style={{ borderBottom: idx < pagedOrders.length - 1 ? "1px solid #F9F9F9" : "none" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background="#FAFAFA"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background="transparent"; }}>
                      {visibleCols.includes("id") && (
                        <td style={{ padding:"13px 14px", fontSize:12, fontWeight:600, color:"#2563EB", fontFamily:"monospace", whiteSpace:"nowrap" }}>{tx.id}</td>
                      )}
                      {visibleCols.includes("product") && (
                        <td style={{ padding:"13px 14px", fontSize:13, color:"#333" }}>{tx.product}</td>
                      )}
                      {visibleCols.includes("date") && (
                        <td style={{ padding:"13px 14px", fontSize:12, color:"#9CA3AF", whiteSpace:"nowrap" }}>{fmtDate(tx.date)}</td>
                      )}
                      {visibleCols.includes("amount") && (
                        <td style={{ padding:"13px 14px", fontSize:13, fontWeight:600, color:"#111" }}>
                          {perms.canViewRevenue ? fmtCurrency(tx.amount, true) : <span style={{ color:"#C0C0C0" }}>—</span>}
                        </td>
                      )}
                      {visibleCols.includes("method") && (
                        <td style={{ padding:"13px 14px", fontSize:12, color:"#555" }}>{tx.method}</td>
                      )}
                      {visibleCols.includes("status") && (
                        <td style={{ padding:"13px 14px" }}>
                          <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"3px 9px", borderRadius:7, background:sc.bg, color:sc.text, fontSize:11, fontWeight:600, whiteSpace:"nowrap" }}>
                            <span style={{ width:5, height:5, borderRadius:"50%", background:sc.dot, display:"inline-block" }} />
                            {tx.status}
                          </span>
                        </td>
                      )}
                      <td style={{ padding:"13px 14px" }}>
                        <button style={{ background:"none", border:"1px solid #EFEFEF", cursor:"pointer", borderRadius:7, padding:"4px 10px", fontSize:11, color:"#555", fontWeight:500 }}>View</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 20px", borderTop:"1px solid #F5F5F5", flexWrap:"wrap", gap:8 }}>
            <span style={{ fontSize:12, color:"#B0B0B0" }}>
              Showing {Math.min((orderPage-1)*ORDER_PER_PAGE+1, filteredOrders.length)}–{Math.min(orderPage*ORDER_PER_PAGE, filteredOrders.length)} of {filteredOrders.length}
            </span>
            <div style={{ display:"flex", gap:4 }}>
              <button onClick={() => setOrderPage(p => Math.max(1, p-1))} disabled={orderPage === 1}
                style={{ padding:"5px 12px", borderRadius:8, border:"1px solid #EFEFEF", background:"white", fontSize:12, color:"#555", cursor: orderPage===1 ? "not-allowed" : "pointer", opacity: orderPage===1 ? 0.4 : 1 }}>
                ← Prev
              </button>
              {Array.from({ length: totalOrderPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setOrderPage(p)}
                  style={{ padding:"5px 11px", borderRadius:8, border:"1px solid #EFEFEF", background: orderPage===p ? "#111" : "white", color: orderPage===p ? "#fff" : "#555", fontSize:12, cursor:"pointer", fontWeight: orderPage===p ? 600 : 400 }}>
                  {p}
                </button>
              ))}
              <button onClick={() => setOrderPage(p => Math.min(totalOrderPages, p+1))} disabled={orderPage === totalOrderPages}
                style={{ padding:"5px 12px", borderRadius:8, border:"1px solid #EFEFEF", background:"white", fontSize:12, color:"#555", cursor: orderPage===totalOrderPages ? "not-allowed" : "pointer", opacity: orderPage===totalOrderPages ? 0.4 : 1 }}>
                Next →
              </button>
            </div>
          </div>
        </div>

        {/* CEO-only Balance Banner */}
        {perms.canViewBalance && (
          <div style={{ background:"linear-gradient(135deg,#0A0A0A,#1a1a2e)", borderRadius:18, padding:"24px 28px", animation:"fadeUp 0.4s ease 0.3s both" }}>
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:20 }}>
              <div>
                <p style={{ fontSize:11, fontWeight:600, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:8 }}>Total Platform Balance</p>
                <p style={{ fontFamily:"'Sora',sans-serif", fontSize:34, fontWeight:800, color:"#fff", marginBottom:6, letterSpacing:-1 }}>₦ 847,200,000</p>
                <p style={{ fontSize:13, color:"rgba(255,255,255,0.5)" }}>
                  <span style={{ color:"#22C55E", fontWeight:700 }}>↑ 18.4%</span> growth this quarter
                </p>
              </div>
              <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
                {[
                  { label:"DuraPayment", amt:"₦ 312M", color:"#60A5FA" },
                  { label:"DuraPay",     amt:"₦ 284M", color:"#34D399" },
                  { label:"DuraBiz",     amt:"₦ 251M", color:"#A78BFA" },
                ].map(b => (
                  <div key={b.label} style={{ background:"rgba(255,255,255,0.06)", borderRadius:12, padding:"12px 16px" }}>
                    <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", marginBottom:5 }}>{b.label}</p>
                    <p style={{ fontWeight:700, fontSize:17, color:b.color }}>{b.amt}</p>
                  </div>
                ))}
                <button style={{ background:accent, color:"#fff", border:"none", borderRadius:11, padding:"11px 20px", fontSize:13, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
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
