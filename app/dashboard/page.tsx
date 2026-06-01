"use client";
import { useState, useMemo, useRef } from "react";
import { useApp } from "@/lib/store";
import { getPerms } from "@/lib/auth";
import { fmtCurrency, fmtNum, fmtDate } from "@/lib/utils";
import { useDashboard, useTransactions } from "@/lib/use-product-api";
import { ErrorBanner, ProductBanner } from "@/components/ui/data-state";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const PRODUCT_LABEL:  Record<string, string> = { durapayment: "DuraPayment", durapay: "DuraPay", durabiz: "DuraBiz" };
const PRODUCT_ACCENT: Record<string, string> = { durapayment: "#2563EB",     durapay: "#10B981",  durabiz: "#7C3AED" };

// TOP_PRODUCTS now comes from useDashboard() API hook

const TX_STYLE: Record<string, { cls: string; dot: string }> = {
  Completed: { cls: "badge-green", dot: "#10B981" },
  Pending:   { cls: "badge-amber", dot: "#F59E0B" },
  Failed:    { cls: "badge-red",   dot: "#EF4444" },
};

const ALL_COLS = [
  { id: "id",      label: "Order ID" },
  { id: "product", label: "Product"  },
  { id: "date",    label: "Date"     },
  { id: "amount",  label: "Amount"   },
  { id: "method",  label: "Method"   },
  { id: "status",  label: "Status"   },
];
const STATUS_OPTS  = ["All", "Completed", "Pending", "Failed"] as const;
const PRODUCT_OPTS = ["All", "DuraPay", "DuraBiz", "DuraPayment"];

function Dropdown({ open, setOpen, trigger, children }: {
  open: boolean; setOpen: (v: boolean) => void; trigger: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div style={{ position: "relative" }}>
      <div onClick={() => setOpen(!open)}>{trigger}</div>
      {open && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setOpen(false)} />
          <div style={{ position: "absolute", right: 0, top: "calc(100% + 6px)", zIndex: 50, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, boxShadow: "0 12px 40px rgba(13,27,62,0.12)", minWidth: 200, overflow: "hidden", animation: "fadeUp 0.15s ease" }}>
            {children}
          </div>
        </>
      )}
    </div>
  );
}

function ChartTip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 14px", fontSize: 12, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
      <p style={{ fontWeight: 600, color: "var(--text)", marginBottom: 5 }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color, marginBottom: 2 }}>
          {p.name}: <strong>{p.dataKey === "revenue" ? fmtCurrency(p.value) : p.value.toLocaleString()}</strong>
        </p>
      ))}
    </div>
  );
}

export default function OverviewPage() {
  const { user, product } = useApp();
  if (!user) return null;
  const perms  = getPerms(user.role);
  const accent = PRODUCT_ACCENT[product] ?? "#2563EB";

  // ── Real API data (falls back to mock while loading / offline) ──
  const dash = useDashboard();
  const txHook = useTransactions();
  const allTransactions = (txHook.data as any)?.data ?? txHook.data ?? [];

  const [chartType,      setChartType]      = useState<"area"|"bar">("area");
  const [search,         setSearch]         = useState("");
  const [statusFilter,   setStatusFilter]   = useState<typeof STATUS_OPTS[number]>("All");
  const [productFilter,  setProductFilter]  = useState("All");
  const [visibleCols,    setVisibleCols]    = useState(ALL_COLS.map(c => c.id));
  const [page,           setPage]           = useState(1);
  const [customizeOpen,  setCustomizeOpen]  = useState(false);
  const [filterOpen,     setFilterOpen]     = useState(false);
  const [exportOpen,     setExportOpen]     = useState(false);
  const PER_PAGE = 5;

  // Derive chart data and top products from API response
  const dashData  = dash.data as any;
  const chartRows = dashData?.chart     ?? dashData ?? [];
  const topProds  = dashData?.topProducts ?? [];

  // KPI values from API
  const kpiData   = dashData?.kpis ?? {};
  const balData   = dashData?.balance ?? {};

  const filtered = useMemo(() => {
    const txList = Array.isArray(allTransactions) ? allTransactions : [];
    return txList.filter((tx: any) => {
      const q = search.toLowerCase();
      return (!q || tx.id?.toLowerCase().includes(q) || tx.customer?.toLowerCase().includes(q))
        && (statusFilter  === "All" || tx.status  === statusFilter)
        && (productFilter === "All" || tx.product === productFilter);
    });
  }, [allTransactions, search, statusFilter, productFilter]);

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function toggleCol(id: string) {
    setVisibleCols(p => p.includes(id) ? (p.length > 1 ? p.filter(c => c !== id) : p) : [...p, id]);
  }

  function exportCSV() {
    const cols = ALL_COLS.filter(c => visibleCols.includes(c.id));
    const rows = filtered.map(tx => cols.map(c => {
      if (c.id === "amount") return perms.canViewRevenue ? fmtCurrency(tx.amount) : "—";
      if (c.id === "date")   return fmtDate(tx.date);
      return (tx as any)[c.id] ?? "";
    }).join(","));
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([[cols.map(c => c.label).join(","), ...rows].join("\n")], { type: "text/csv" }));
    a.download = "orders.csv"; a.click(); setExportOpen(false);
  }
  function exportJSON() {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(filtered, null, 2)], { type: "application/json" }));
    a.download = "orders.json"; a.click(); setExportOpen(false);
  }

  const KPIS = [
    { label: "Avg. Order Value",  value: fmtCurrency(kpiData.avgOrderValue     ?? 72980,  true), delta: "+3.16%", pos: true, icon: "💰", dark: true  },
    { label: "Total Orders",      value: fmtNum(kpiData.totalOrders            ?? 2219),         delta: "+1.18%", pos: true, icon: "🛍️", dark: false },
    { label: "Active Customers",  value: fmtNum(kpiData.activeCustomers        ?? 1847),         delta: "+6.4%",  pos: true, icon: "👥", dark: false },
    { label: "Revenue",           value: perms.canViewRevenue ? fmtCurrency(kpiData.platformRevenue ?? 560000, true) : "—", delta: "+2.42%", pos: true, icon: "📈", dark: false },
  ];

  return (
    <>
      <style>{`
        /* KPI grid: 4 cols → 2 cols → 2 cols (mobile) */
        .kpi-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; }
        @media(max-width:1100px){ .kpi-grid { grid-template-columns:repeat(2,1fr); } }
        @media(max-width:480px) { .kpi-grid { grid-template-columns:1fr 1fr; gap:10px; } }

        /* Mid: chart + products side-by-side → stacked */
        .mid-grid { display:grid; grid-template-columns:1fr 300px; gap:14px; }
        @media(max-width:960px) { .mid-grid { grid-template-columns:1fr; } }

        /* Orders toolbar wraps nicely */
        .orders-bar { display:flex; align-items:center; justify-content:space-between; padding:14px 16px; border-bottom:1px solid var(--border); flex-wrap:wrap; gap:10px; }
        .orders-actions { display:flex; gap:7px; flex-wrap:wrap; align-items:center; }

        /* On mobile, table becomes cards */
        .orders-table-wrap { overflow-x:auto; -webkit-overflow-scrolling:touch; }
        .mobile-order-cards { display:none; }

        @media(max-width:640px) {
          .orders-table-wrap  { display:none !important; }
          .mobile-order-cards { display:flex !important; flex-direction:column; }
        }

        /* Pagination on mobile */
        .pagination { display:flex; align-items:center; justify-content:space-between; padding:12px 16px; border-top:1px solid var(--border); flex-wrap:wrap; gap:8px; }
        @media(max-width:480px) { .pagination { justify-content:center; } }

        @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

        {/* ── Greeting ── */}
        <div className="animate-fade-up">
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6, flexWrap:"wrap" }}>
            <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:"clamp(18px,5vw,26px)", fontWeight:800, color:"var(--text)", letterSpacing:-0.5, margin:0 }}>
              Good day, {user.name.split(" ")[0]}! 👋
            </h2>
            <ProductBanner product={product} loading={dash.loading || txHook.loading} />
          </div>
          <p style={{ color:"var(--text-3)", fontSize:"clamp(12px,3.5vw,14px)" }}>
            {PRODUCT_LABEL[product] ?? "Platform"} live data
          </p>
        </div>

        {/* API error banners */}
        {dash.error   && <ErrorBanner message={dash.error}   onRetry={dash.refetch} />}
        {txHook.error && <ErrorBanner message={txHook.error} onRetry={txHook.refetch} />}

        {/* ── KPI Cards ── */}
        <div className="kpi-grid animate-fade-up stagger-1">
          {KPIS.map(({ label, value, delta, pos, icon, dark }) => (
            <div key={label} className="card" style={{
              padding: "clamp(14px,3vw,20px)",
              background: dark ? "linear-gradient(145deg,#111827,#1e293b)" : "var(--surface)",
              border: dark ? "1px solid rgba(255,255,255,0.07)" : "1px solid var(--border)",
              overflow: "hidden", position: "relative",
            }}>
              {dark && <div style={{ position:"absolute", top:-16, right:-16, width:72, height:72, borderRadius:"50%", background:`${accent}25`, pointerEvents:"none" }} />}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                <span style={{ fontSize:11, fontWeight:500, color: dark?"rgba(255,255,255,0.45)":"var(--text-3)", lineHeight:1.4, maxWidth:"75%" }}>{label}</span>
                <span style={{ fontSize:"clamp(16px,4vw,20px)", lineHeight:1 }}>{icon}</span>
              </div>
              <div style={{ fontFamily:"'Sora',sans-serif", fontSize:"clamp(18px,4.5vw,26px)", fontWeight:800, color: dark?"#fff":"var(--text)", marginBottom:6, letterSpacing:-0.5, lineHeight:1.1 }}>{value}</div>
              <div style={{ display:"flex", alignItems:"center", gap:3, fontSize:11.5 }}>
                <span style={{ fontWeight:700, color: pos?"var(--green)":"var(--red)" }}>{pos?"↑":"↓"} {delta}</span>
                <span style={{ color: dark?"rgba(255,255,255,0.3)":"var(--text-3)" }}>vs last month</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── Chart + Top Products ── */}
        <div className="mid-grid animate-fade-up stagger-2">
          {/* Chart */}
          <div className="card" style={{ padding:"clamp(14px,3vw,20px)" }}>
            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:14, gap:8, flexWrap:"wrap" }}>
              <div>
                <h3 style={{ fontSize:15, fontWeight:700, color:"var(--text)", marginBottom:3 }}>Sales Overview</h3>
                <div style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
                  {perms.canViewRevenue && <span style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, color:"var(--text-3)" }}><span style={{ width:7,height:7,borderRadius:"50%",background:accent,display:"inline-block" }}/>Revenue</span>}
                  <span style={{ display:"flex", alignItems:"center", gap:5, fontSize:11, color:"var(--text-3)" }}><span style={{ width:7,height:7,borderRadius:"50%",background:"#94A3B8",display:"inline-block" }}/>Transactions</span>
                </div>
              </div>
              <div style={{ display:"flex", gap:3, background:"var(--surface-2)", borderRadius:9, padding:3, flexShrink:0 }}>
                {(["area","bar"] as const).map(t => (
                  <button key={t} onClick={() => setChartType(t)} style={{ padding:"5px 11px", borderRadius:7, border:"none", cursor:"pointer", fontSize:11.5, fontWeight:500, textTransform:"capitalize", background:chartType===t?"var(--surface)":"transparent", color:chartType===t?"var(--text)":"var(--text-3)", boxShadow:chartType===t?"0 1px 4px rgba(0,0,0,0.08)":"none", transition:"all 0.15s" }}>{t}</button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              {chartType === "area" ? (
                <AreaChart data={Array.isArray(chartRows)?chartRows:[]}>
                  <defs>
                    <linearGradient id="gR" x1="0" y1="0" x2="0" y2="1"><stop offset="5%"  stopColor={accent}    stopOpacity={0.2}/><stop offset="95%" stopColor={accent}    stopOpacity={0}/></linearGradient>
                    <linearGradient id="gT" x1="0" y1="0" x2="0" y2="1"><stop offset="5%"  stopColor="#94A3B8" stopOpacity={0.15}/><stop offset="95%" stopColor="#94A3B8" stopOpacity={0}/></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" tick={{ fontSize:10, fill:"var(--text-3)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize:9, fill:"var(--text-3)" }} axisLine={false} tickLine={false} width={38} tickFormatter={v=>`${(v/1000).toFixed(0)}k`} />
                  <Tooltip content={<ChartTip />} />
                  {perms.canViewRevenue && <Area type="monotone" dataKey="revenue"      name="Revenue"      stroke={accent}    fill="url(#gR)" strokeWidth={2.5} dot={false} />}
                  <Area type="monotone" dataKey="transactions" name="Transactions" stroke="#94A3B8" fill="url(#gT)" strokeWidth={2}   dot={false} />
                </AreaChart>
              ) : (
                <BarChart data={Array.isArray(chartRows)?chartRows:[]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize:10, fill:"var(--text-3)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize:9, fill:"var(--text-3)" }} axisLine={false} tickLine={false} width={38} tickFormatter={v=>`${(v/1000).toFixed(0)}k`} />
                  <Tooltip content={<ChartTip />} />
                  {perms.canViewRevenue && <Bar dataKey="revenue"      name="Revenue"      fill={accent}    radius={[4,4,0,0]} maxBarSize={28} />}
                  <Bar dataKey="transactions" name="Transactions" fill="#94A3B8" radius={[4,4,0,0]} maxBarSize={28} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          {/* Top Products */}
          <div className="card" style={{ padding:"clamp(14px,3vw,20px)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
              <h3 style={{ fontSize:15, fontWeight:700, color:"var(--text)" }}>Top Products</h3>
              <button className="btn btn-secondary btn-sm" style={{ fontSize:11 }}>See All</button>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
              {(topProds.length ? topProds : [{name:"DuraPayment Gateway",sales:12429,initials:"DP",bg:"#EFF6FF",fg:"#1D4ED8"},{name:"DuraPay Personal",sales:11021,initials:"PB",bg:"#F0FDF4",fg:"#15803D"},{name:"DuraBiz Suite",sales:10321,initials:"BS",bg:"#F5F3FF",fg:"#6D28D9"}]).map((p: any, i: number) => (
                <div key={p.name} style={{ display:"flex", alignItems:"center", gap:11, padding:"10px 12px", borderRadius:12, background:"var(--surface-2)", border:"1px solid var(--border)", transition:"all 0.15s", cursor:"pointer" }}
                  onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor=accent+"44";(e.currentTarget as HTMLElement).style.transform="translateX(2px)";}}
                  onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor="var(--border)";(e.currentTarget as HTMLElement).style.transform="translateX(0)";}}>
                  <div style={{ width:38,height:38,borderRadius:10,background:p.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10.5,fontWeight:800,color:p.fg,flexShrink:0 }}>{p.initials}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:12.5,fontWeight:600,color:"var(--text)",marginBottom:2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{p.name}</div>
                    <div style={{ fontSize:11,color:"var(--text-3)" }}>{p.sales.toLocaleString()} sales</div>
                  </div>
                  <div style={{ fontSize:10.5,fontWeight:700,color:"var(--green)",flexShrink:0 }}>#{i+1}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Latest Orders ── */}
        <div className="card animate-fade-up stagger-3" style={{ padding:0, overflow:"hidden" }}>
          {/* Toolbar */}
          <div className="orders-bar">
            <div>
              <h3 style={{ fontSize:15, fontWeight:700, color:"var(--text)" }}>Latest Orders</h3>
              <p style={{ fontSize:11.5, color:"var(--text-3)", marginTop:1 }}>{filtered.length} order{filtered.length!==1?"s":""}</p>
            </div>
            <div className="orders-actions">
              {/* Search */}
              <div style={{ position:"relative" }}>
                <span style={{ position:"absolute", left:9, top:"50%", transform:"translateY(-50%)", color:"var(--text-3)", display:"flex" }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                </span>
                <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} placeholder="Search…" className="inp"
                  style={{ paddingLeft:27, paddingTop:6, paddingBottom:6, fontSize:12, width:"clamp(120px,30vw,160px)" }} />
              </div>

              {/* Customize */}
              <Dropdown open={customizeOpen} setOpen={setCustomizeOpen} trigger={
                <button className="btn btn-secondary btn-sm" style={{ fontSize:12, background:customizeOpen?"var(--accent)":undefined, color:customizeOpen?"#fff":undefined }}>
                  <EditSvg /> <span className="btn-label">Columns</span>
                </button>
              }>
                <div style={{ padding:"12px 14px" }}>
                  <p style={{ fontSize:10, fontWeight:700, color:"var(--text-3)", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:8 }}>Show Columns</p>
                  {ALL_COLS.map(col => (
                    <button key={col.id} onClick={()=>toggleCol(col.id)} style={{ display:"flex", alignItems:"center", gap:9, width:"100%", padding:"7px 6px", borderRadius:8, border:"none", background:"transparent", cursor:"pointer", textAlign:"left" }}
                      onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background="var(--surface-2)";}}
                      onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background="transparent";}}>
                      <div style={{ width:15,height:15,borderRadius:4,flexShrink:0,border:`2px solid ${visibleCols.includes(col.id)?"var(--accent)":"var(--border-strong)"}`,background:visibleCols.includes(col.id)?"var(--accent)":"var(--surface)",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.12s" }}>
                        {visibleCols.includes(col.id)&&<svg width="8" height="8" viewBox="0 0 12 12" fill="none"><polyline points="1.5,6 4.5,9 10.5,3" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </div>
                      <span style={{ fontSize:13, color:"var(--text)" }}>{col.label}</span>
                    </button>
                  ))}
                </div>
              </Dropdown>

              {/* Filter */}
              <Dropdown open={filterOpen} setOpen={setFilterOpen} trigger={
                <button className="btn btn-secondary btn-sm" style={{ fontSize:12, background:(statusFilter!=="All"||productFilter!=="All")?"var(--accent)":undefined, color:(statusFilter!=="All"||productFilter!=="All")?"#fff":undefined }}>
                  <FilterSvg /> <span className="btn-label">Filter {(statusFilter!=="All"||productFilter!=="All")?"•":""}</span>
                </button>
              }>
                <div style={{ padding:"12px 14px", minWidth:200 }}>
                  <p style={{ fontSize:10, fontWeight:700, color:"var(--text-3)", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:7 }}>Status</p>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:12 }}>
                    {STATUS_OPTS.map(s=>(
                      <button key={s} onClick={()=>{setStatusFilter(s);setPage(1);}} className="btn btn-secondary btn-sm"
                        style={{ fontSize:11, background:statusFilter===s?"var(--accent)":undefined, color:statusFilter===s?"#fff":undefined }}>
                        {s}
                      </button>
                    ))}
                  </div>
                  <p style={{ fontSize:10, fontWeight:700, color:"var(--text-3)", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:7 }}>Product</p>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                    {PRODUCT_OPTS.map(p=>(
                      <button key={p} onClick={()=>{setProductFilter(p);setPage(1);}} className="btn btn-secondary btn-sm"
                        style={{ fontSize:11, background:productFilter===p?"var(--accent)":undefined, color:productFilter===p?"#fff":undefined }}>
                        {p}
                      </button>
                    ))}
                  </div>
                  {(statusFilter!=="All"||productFilter!=="All")&&(
                    <button onClick={()=>{setStatusFilter("All");setProductFilter("All");setPage(1);}} className="btn btn-danger btn-sm" style={{ marginTop:10, width:"100%", justifyContent:"center", fontSize:11 }}>Clear</button>
                  )}
                </div>
              </Dropdown>

              {/* Export */}
              <Dropdown open={exportOpen} setOpen={setExportOpen} trigger={
                <button className="btn btn-secondary btn-sm" style={{ fontSize:12 }}>
                  <DownloadSvg /> <span className="btn-label">Export</span>
                </button>
              }>
                <div>
                  {[{l:"Export as CSV",fn:exportCSV,c:"#10B981"},{l:"Export as JSON",fn:exportJSON,c:"#2563EB"}].map((e,i)=>(
                    <button key={e.l} onClick={e.fn} style={{ display:"flex",alignItems:"center",gap:8,width:"100%",padding:"11px 14px",border:"none",borderTop:i?"1px solid var(--border)":"none",background:"transparent",fontSize:13,color:"var(--text)",cursor:"pointer",textAlign:"left",transition:"background 0.12s" }}
                      onMouseEnter={el=>{(el.currentTarget as HTMLElement).style.background="var(--surface-2)";}}
                      onMouseLeave={el=>{(el.currentTarget as HTMLElement).style.background="transparent";}}>
                      <span style={{ color:e.c, fontWeight:700 }}>↓</span> {e.l}
                    </button>
                  ))}
                </div>
              </Dropdown>
            </div>
          </div>

          {/* Desktop table */}
          <div className="orders-table-wrap">
            <table className="data-tbl" style={{ minWidth:480 }}>
              <thead>
                <tr>
                  {ALL_COLS.filter(c=>visibleCols.includes(c.id)).map(col=><th key={col.id}>{col.label}</th>)}
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {paged.length === 0 ? (
                  <tr><td colSpan={visibleCols.length+1} style={{ textAlign:"center",padding:40,color:"var(--text-3)" }}>No orders found</td></tr>
                ) : paged.map(tx=>{
                  const sc = TX_STYLE[tx.status] ?? TX_STYLE.Completed;
                  return (
                    <tr key={tx.id}>
                      {visibleCols.includes("id")     &&<td style={{ fontFamily:"monospace",fontWeight:600,color:"var(--accent)",fontSize:12 }}>{tx.id}</td>}
                      {visibleCols.includes("product") &&<td>{tx.product}</td>}
                      {visibleCols.includes("date")    &&<td style={{ color:"var(--text-3)",fontSize:12 }}>{fmtDate(tx.date)}</td>}
                      {visibleCols.includes("amount")  &&<td style={{ fontWeight:700 }}>{perms.canViewRevenue?fmtCurrency(tx.amount,true):<span style={{color:"var(--text-3)"}}>—</span>}</td>}
                      {visibleCols.includes("method")  &&<td style={{ fontSize:12.5 }}>{tx.method}</td>}
                      {visibleCols.includes("status")  &&<td><span className={`badge ${sc.cls}`}><span style={{width:5,height:5,borderRadius:"50%",background:sc.dot,display:"inline-block"}}/>  {tx.status}</span></td>}
                      <td><button className="btn btn-secondary btn-sm" style={{ fontSize:11.5 }}>View</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards — replaces table on small screens */}
          <div className="mobile-order-cards" style={{ padding:"8px 12px 4px" }}>
            {paged.length === 0 ? (
              <div style={{ textAlign:"center", padding:"32px 0", color:"var(--text-3)", fontSize:13 }}>No orders found</div>
            ) : paged.map(tx => {
              const sc = TX_STYLE[tx.status] ?? TX_STYLE.Completed;
              return (
                <div key={tx.id} style={{ padding:"14px 0", borderBottom:"1px solid var(--border)", display:"flex", flexDirection:"column", gap:8 }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                    <span style={{ fontFamily:"monospace", fontSize:12, fontWeight:700, color:"var(--accent)" }}>{tx.id}</span>
                    <span className={`badge ${sc.cls}`}><span style={{width:5,height:5,borderRadius:"50%",background:sc.dot,display:"inline-block"}}/> {tx.status}</span>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:6 }}>
                    <div>
                      <div style={{ fontSize:13, fontWeight:600, color:"var(--text)", marginBottom:2 }}>{tx.customer}</div>
                      <div style={{ fontSize:11.5, color:"var(--text-3)" }}>{tx.product} · {tx.method}</div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      {perms.canViewRevenue
                        ? <div style={{ fontSize:15, fontWeight:800, color:"var(--text)" }}>{fmtCurrency(tx.amount, true)}</div>
                        : <div style={{ fontSize:13, color:"var(--text-3)" }}>—</div>}
                      <div style={{ fontSize:11, color:"var(--text-3)", marginTop:2 }}>{fmtDate(tx.date, "short")}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="pagination">
            <span style={{ fontSize:12, color:"var(--text-3)" }}>
              {Math.min((page-1)*PER_PAGE+1,filtered.length)}–{Math.min(page*PER_PAGE,filtered.length)} of {filtered.length}
            </span>
            <div style={{ display:"flex", gap:4 }}>
              <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className="btn btn-secondary btn-sm" style={{ fontSize:12 }}>←</button>
              {Array.from({length:pages},(_,i)=>i+1).map(p=>(
                <button key={p} onClick={()=>setPage(p)} className="btn btn-secondary btn-sm"
                  style={{ fontSize:12,background:page===p?"var(--text)":undefined,color:page===p?"#fff":undefined,minWidth:32 }}>{p}</button>
              ))}
              <button onClick={()=>setPage(p=>Math.min(pages,p+1))} disabled={page===pages} className="btn btn-secondary btn-sm" style={{ fontSize:12 }}>→</button>
            </div>
          </div>
        </div>

        {/* ── CEO Balance banner ── */}
        {perms.canViewBalance && (
          <div className="animate-fade-up stagger-4" style={{ background:"linear-gradient(135deg,#111827,#1e293b)", borderRadius:18, padding:"clamp(16px,4vw,26px)", border:"1px solid rgba(255,255,255,0.06)" }}>
            <p style={{ fontSize:10.5, fontWeight:600, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:7 }}>Total Platform Balance</p>
            <p style={{ fontFamily:"'Sora',sans-serif", fontSize:"clamp(24px,6vw,38px)", fontWeight:800, color:"#fff", letterSpacing:-1, marginBottom:6, lineHeight:1 }}>{balData.total ? new Intl.NumberFormat('en-NG').format(balData.total) : '847,200,000'}</p>
            <p style={{ fontSize:13, color:"rgba(255,255,255,0.45)", marginBottom:18 }}>
              <span style={{ color:"var(--green)", fontWeight:700 }}>↑ 18.4%</span> this quarter
            </p>
            <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
              {[{l:"DuraPayment",v:"₦312M",c:"#60A5FA"},{l:"DuraPay",v:"₦284M",c:"#34D399"},{l:"DuraBiz",v:"₦251M",c:"#A78BFA"}].map(b=>(
                <div key={b.l} style={{ background:"rgba(255,255,255,0.07)", borderRadius:11, padding:"10px 14px", border:"1px solid rgba(255,255,255,0.08)", flex:"1 1 80px" }}>
                  <p style={{ fontSize:10.5, color:"rgba(255,255,255,0.4)", marginBottom:4 }}>{b.l}</p>
                  <p style={{ fontWeight:800, fontSize:"clamp(14px,3.5vw,17px)", color:b.c }}>{b.v}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`.btn-label { display:inline; } @media(max-width:360px){ .btn-label { display:none; } }`}</style>
    </>
  );
}

function EditSvg()     { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>; }
function FilterSvg()   { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>; }
function DownloadSvg() { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>; }
