"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";
import { getPerms } from "@/lib/auth";
import { fmtCurrency } from "@/lib/utils";
import { AreaChart, Area, Tooltip } from "recharts";

// ─── Product definitions ──────────────────────────────────────────────────────
const PRODUCTS = [
  {
    id:          "durapayment" as const,
    name:        "DuraPayment",
    tagline:     "Payment Gateway",
    description: "Enterprise-grade payment infrastructure for merchants. Accept cards, bank transfers, USSD, QR and POS payments at scale.",
    color:       "#2563EB",
    colorDark:   "#1D4ED8",
    colorGlow:   "rgba(37,99,235,0.18)",
    colorLight:  "#EFF6FF",
    gradient:    "linear-gradient(135deg,#1e40af 0%,#3b82f6 60%,#60a5fa 100%)",
    icon:        "💳",
    status:      "live",
    metrics: {
      revenue:    312_000_000,
      merchants:  1_204,
      txToday:    284,
      uptime:     99.98,
      growth:     14.2,
      successRate:98.6,
    },
    features: ["Card Processing","Bank Transfer","USSD Payments","QR Codes","POS Terminal","Payment Links","Recurring Billing","Fraud Detection"],
    chart: [
      { m:"Jun", v:52 },{ m:"Jul", v:71 },{ m:"Aug", v:63 },
      { m:"Sep", v:89 },{ m:"Oct", v:78 },{ m:"Nov", v:102 },{ m:"Dec", v:124 },
    ],
  },
  {
    id:          "durapay" as const,
    name:        "DuraPay",
    tagline:     "Personal Banking",
    description: "Consumer-first digital wallet and banking. Instant transfers, bill payments, savings goals and investment access for individuals.",
    color:       "#10B981",
    colorDark:   "#059669",
    colorGlow:   "rgba(16,185,129,0.18)",
    colorLight:  "#ECFDF5",
    gradient:    "linear-gradient(135deg,#065f46 0%,#10b981 60%,#34d399 100%)",
    icon:        "🏦",
    status:      "live",
    metrics: {
      revenue:    284_000_000,
      merchants:  4_320,
      txToday:    891,
      uptime:     99.95,
      growth:     22.8,
      successRate:99.1,
    },
    features: ["Instant Transfers","Bill Payments","Savings Goals","Investment Access","Virtual Cards","Airtime & Data","Split Bills","Spending Insights"],
    chart: [
      { m:"Jun", v:38 },{ m:"Jul", v:55 },{ m:"Aug", v:49 },
      { m:"Sep", v:74 },{ m:"Oct", v:82 },{ m:"Nov", v:95 },{ m:"Dec", v:118 },
    ],
  },
  {
    id:          "durabiz" as const,
    name:        "DuraBiz",
    tagline:     "Business Banking",
    description: "End-to-end financial operations for businesses. Payroll, invoicing, expense management, corporate cards and treasury tools.",
    color:       "#7C3AED",
    colorDark:   "#6D28D9",
    colorGlow:   "rgba(124,58,237,0.18)",
    colorLight:  "#F5F3FF",
    gradient:    "linear-gradient(135deg,#4c1d95 0%,#7c3aed 60%,#a78bfa 100%)",
    icon:        "🏢",
    status:      "live",
    metrics: {
      revenue:    251_000_000,
      merchants:  892,
      txToday:    645,
      uptime:     99.99,
      growth:     31.4,
      successRate:97.9,
    },
    features: ["Payroll Processing","Invoicing","Expense Management","Corporate Cards","Multi-user Access","API Integration","Tax Reports","Treasury Tools"],
    chart: [
      { m:"Jun", v:28 },{ m:"Jul", v:41 },{ m:"Aug", v:36 },
      { m:"Sep", v:58 },{ m:"Oct", v:67 },{ m:"Nov", v:79 },{ m:"Dec", v:98 },
    ],
  },
];

// ─── Mini sparkline tooltip ────────────────────────────────────────────────────
function SparkTip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"rgba(0,0,0,0.75)", backdropFilter:"blur(6px)", color:"#fff", borderRadius:8, padding:"5px 10px", fontSize:11, fontWeight:600 }}>
      {payload[0].value}K txns
    </div>
  );
}

// ─── Animated progress bar ────────────────────────────────────────────────────
function ProgressBar({ value, color, max = 100 }: { value: number; color: string; max?: number }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div style={{ height:5, borderRadius:99, background:"rgba(255,255,255,0.12)", overflow:"hidden" }}>
      <div style={{ height:"100%", width:`${pct}%`, borderRadius:99, background:color, transition:"width 1s cubic-bezier(0.4,0,0.2,1)" }} />
    </div>
  );
}

// ─── Feature pill ─────────────────────────────────────────────────────────────
function FeaturePill({ label, color }: { label: string; color: string }) {
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:500, background:"rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.75)", border:"1px solid rgba(255,255,255,0.12)", whiteSpace:"nowrap" }}>
      <span style={{ width:5, height:5, borderRadius:"50%", background:color, display:"inline-block", flexShrink:0 }} />
      {label}
    </span>
  );
}

// ─── Stat chip on hero card ───────────────────────────────────────────────────
function StatChip({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div style={{ background:"rgba(255,255,255,0.1)", backdropFilter:"blur(8px)", borderRadius:12, padding:"10px 14px", flex:"1 1 100px", border:"1px solid rgba(255,255,255,0.12)" }}>
      <div style={{ fontSize:10, color:"rgba(255,255,255,0.5)", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:4 }}>{label}</div>
      <div style={{ fontFamily:"'Sora',sans-serif", fontSize:18, fontWeight:800, color:"#fff", lineHeight:1, marginBottom:2 }}>{value}</div>
      {sub && <div style={{ fontSize:10, color:"rgba(255,255,255,0.45)" }}>{sub}</div>}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ProductsPage() {
  const router = useRouter();
  const { setProduct, product: activeProduct } = useApp();
  const { user } = useApp();
  const perms = user ? getPerms(user.role) : null;

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const [selected,    setSelected]    = useState<string | null>(null);
  const [hovered,     setHovered]     = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compared,    setCompared]    = useState<string[]>([]);

  function openProduct(id: typeof PRODUCTS[0]["id"]) {
    setProduct(id);
    router.push("/dashboard");
  }

  function toggleCompare(id: string) {
    setCompared(prev =>
      prev.includes(id) ? prev.filter(x => x !== id)
      : prev.length < 2 ? [...prev, id]
      : prev
    );
  }

  const totalRevenue = PRODUCTS.reduce((s, p) => s + p.metrics.revenue, 0);

  return (
    <>
      <style>{`
        @keyframes float   { 0%,100%{transform:translateY(0)}  50%{transform:translateY(-6px)} }
        @keyframes glow    { 0%,100%{opacity:0.4} 50%{opacity:0.8} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        @keyframes countUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .prod-card { transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease; }
        .prod-card:hover  { transform: translateY(-4px); }
        .feat-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(140px,1fr)); gap:6px; }
        @media(max-width:640px) { .feat-grid { grid-template-columns:repeat(2,1fr); } }
        .compare-bar { display:flex; align-items:center; justify-content:center; gap:10px; padding:14px 20px; background:var(--surface); border-top:1px solid var(--border); border-radius:0 0 16px 16px; flex-wrap:wrap; }
        @media(max-width:480px) { .compare-bar { gap:6px; padding:12px; } }
      `}</style>

      <div style={{ display:"flex", flexDirection:"column", gap:28 }}>

        {/* ── Page header ── */}
        <div className="animate-fade-up" style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
          <div>
            <p style={{ fontSize:11.5, fontWeight:600, color:"var(--accent)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:6 }}>Platform Suite</p>
            <h1 style={{ fontFamily:"'Sora',sans-serif", fontSize:"clamp(22px,5vw,32px)", fontWeight:800, color:"var(--text)", margin:0, letterSpacing:-0.8, lineHeight:1.1 }}>
              Dura LTD Products
            </h1>
            <p style={{ color:"var(--text-3)", fontSize:14, marginTop:6 }}>
              Three powerful platforms. One unified admin console.
            </p>
          </div>
          <button
            onClick={() => { setCompareMode(v => !v); setCompared([]); }}
            className="btn btn-secondary btn-sm"
            style={{ fontSize:12.5, borderColor: compareMode ? "var(--accent)" : undefined, color: compareMode ? "var(--accent)" : undefined, background: compareMode ? "var(--indigo-bg)" : undefined }}>
            {compareMode ? "✕ Exit Compare" : "⇄ Compare Products"}
          </button>
        </div>

        {/* ── Platform revenue banner ── */}
        <div className="animate-fade-up stagger-1" style={{ background:"linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#0f172a 100%)", borderRadius:20, padding:"clamp(18px,4vw,28px)", border:"1px solid rgba(255,255,255,0.07)", position:"relative", overflow:"hidden" }}>
          {/* Decorative blobs */}
          <div style={{ position:"absolute", top:-40, right:-40, width:200, height:200, borderRadius:"50%", background:"radial-gradient(circle,rgba(37,99,235,0.15),transparent 70%)", pointerEvents:"none", animation:"glow 4s ease infinite" }} />
          <div style={{ position:"absolute", bottom:-30, left:-30, width:160, height:160, borderRadius:"50%", background:"radial-gradient(circle,rgba(124,58,237,0.12),transparent 70%)", pointerEvents:"none", animation:"glow 4s ease 2s infinite" }} />

          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:20, position:"relative" }}>
            <div>
              <p style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:8 }}>Total Platform Revenue</p>
              <p style={{ fontFamily:"'Sora',sans-serif", fontSize:"clamp(28px,6vw,44px)", fontWeight:800, color:"#fff", letterSpacing:-1.5, lineHeight:1, marginBottom:8, animation:"countUp 0.6s ease" }}>
                {fmtCurrency(totalRevenue)}
              </p>
              <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
                <span style={{ background:"rgba(16,185,129,0.15)", color:"#34d399", borderRadius:20, padding:"3px 10px", fontSize:12, fontWeight:700, border:"1px solid rgba(16,185,129,0.2)" }}>
                  ↑ 22.6% YoY
                </span>
                <span style={{ fontSize:12, color:"rgba(255,255,255,0.35)" }}>across all 3 products</span>
              </div>
            </div>

            {/* Per-product revenue pills */}
            <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
              {PRODUCTS.map(p => (
                <button key={p.id} onClick={() => openProduct(p.id)}
                  style={{ background:"rgba(255,255,255,0.06)", border:`1px solid ${p.colorGlow}`, borderRadius:14, padding:"10px 14px", cursor:"pointer", transition:"all 0.2s", textAlign:"left" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = p.colorGlow; (e.currentTarget as HTMLElement).style.transform = "scale(1.03)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"; (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}>
                  <div style={{ fontSize:10, color:"rgba(255,255,255,0.4)", fontWeight:600, marginBottom:4 }}>{p.name}</div>
                  <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:800, fontSize:16, color:p.color }}>{fmtCurrency(p.metrics.revenue, true)}</div>
                  <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)", marginTop:2 }}>+{p.metrics.growth}% growth</div>
                </button>
              ))}
            </div>
          </div>

          {/* Revenue share bars */}
          <div style={{ marginTop:20, display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
            {PRODUCTS.map(p => (
              <div key={p.id}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                  <span style={{ fontSize:10.5, color:"rgba(255,255,255,0.45)", fontWeight:500 }}>{p.name}</span>
                  <span style={{ fontSize:10.5, color:p.color, fontWeight:700 }}>{((p.metrics.revenue / totalRevenue) * 100).toFixed(1)}%</span>
                </div>
                <ProgressBar value={p.metrics.revenue} max={totalRevenue} color={p.color} />
              </div>
            ))}
          </div>
        </div>

        {/* ── Compare mode prompt ── */}
        {compareMode && (
          <div style={{ background:"var(--indigo-bg)", border:"1px solid var(--indigo)", borderRadius:12, padding:"12px 16px", display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }} className="animate-fade-in">
            <span style={{ fontSize:13, fontWeight:600, color:"var(--indigo)" }}>
              {compared.length === 0 ? "Select two products to compare side-by-side →"
               : compared.length === 1 ? `${PRODUCTS.find(p => p.id === compared[0])?.name} selected — pick one more`
               : "Ready to compare!"}
            </span>
            {compared.length === 2 && (
              <button className="btn btn-sm" style={{ background:"var(--indigo)", color:"#fff", border:"none", fontSize:12, marginLeft:"auto" }}
                onClick={() => setSelected("compare")}>
                View Comparison →
              </button>
            )}
          </div>
        )}

        {/* ── Product cards grid ── */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(clamp(280px,30vw,340px),1fr))", gap:20 }}>
          {PRODUCTS.map((p, idx) => {
            const isActive   = activeProduct === p.id;
            const isSelected = selected === p.id;
            const isCompared = compared.includes(p.id);

            return (
              <div key={p.id}
                className={`prod-card animate-fade-up stagger-${idx + 2}`}
                style={{
                  borderRadius:20, overflow:"hidden",
                  boxShadow: isActive
                    ? `0 0 0 2px ${p.color}, 0 20px 60px ${p.colorGlow}`
                    : "0 4px 24px rgba(13,27,62,0.07)",
                  position:"relative",
                }}>

                {/* Active badge */}
                {isActive && (
                  <div style={{ position:"absolute", top:14, right:14, zIndex:10, background:p.color, color:"#fff", borderRadius:20, padding:"3px 10px", fontSize:10.5, fontWeight:700, display:"flex", alignItems:"center", gap:5 }}>
                    <span style={{ width:5, height:5, borderRadius:"50%", background:"rgba(255,255,255,0.7)", display:"inline-block", animation:"pulse 1.5s ease infinite" }} />
                    ACTIVE
                  </div>
                )}

                {/* Compare checkbox */}
                {compareMode && (
                  <button onClick={() => toggleCompare(p.id)}
                    style={{ position:"absolute", top:14, left:14, zIndex:10, width:24, height:24, borderRadius:7, border:`2px solid ${isCompared ? p.color : "rgba(255,255,255,0.4)"}`, background: isCompared ? p.color : "rgba(255,255,255,0.15)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", backdropFilter:"blur(4px)" }}>
                    {isCompared && <span style={{ color:"#fff", fontSize:12, fontWeight:800 }}>✓</span>}
                  </button>
                )}

                {/* ── Hero gradient section ── */}
                <div style={{ background:p.gradient, padding:"clamp(18px,4vw,26px)", position:"relative", overflow:"hidden" }}>
                  {/* Sparkline behind content — fixed dimensions to avoid -1 width error */}
                  {mounted && (
                    <div style={{ position:"absolute", bottom:0, left:0, right:0, opacity:0.25, overflow:"hidden" }}>
                      <AreaChart width={280} height={60} data={p.chart} margin={{ top:0, right:0, bottom:0, left:0 }}
                        style={{ width:"100%" }}>
                        <defs>
                          <linearGradient id={`sg-${p.id}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%"   stopColor="#fff" stopOpacity={0.5} />
                            <stop offset="100%" stopColor="#fff" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="v" stroke="#fff" strokeWidth={1.5} fill={`url(#sg-${p.id})`} dot={false} />
                        <Tooltip content={<SparkTip />} />
                      </AreaChart>
                    </div>
                  )}

                  {/* Floating glow orb */}
                  <div style={{ position:"absolute", top:-20, right:-20, width:120, height:120, borderRadius:"50%", background:"rgba(255,255,255,0.08)", animation:"float 6s ease infinite", animationDelay:`${idx * 0.7}s` }} />

                  {/* Icon + name */}
                  <div style={{ display:"flex", alignItems:"flex-start", gap:14, marginBottom:16, position:"relative" }}>
                    <div style={{ width:52, height:52, borderRadius:14, background:"rgba(255,255,255,0.18)", backdropFilter:"blur(8px)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, flexShrink:0, border:"1px solid rgba(255,255,255,0.2)", boxShadow:"0 4px 16px rgba(0,0,0,0.15)" }}>
                      {p.icon}
                    </div>
                    <div>
                      <div style={{ fontFamily:"'Sora',sans-serif", fontSize:20, fontWeight:800, color:"#fff", lineHeight:1.1, marginBottom:3 }}>{p.name}</div>
                      <div style={{ fontSize:12, color:"rgba(255,255,255,0.6)", fontWeight:500 }}>{p.tagline}</div>
                      <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:5 }}>
                        <span style={{ width:6, height:6, borderRadius:"50%", background:"#4ade80", display:"inline-block" }} />
                        <span style={{ fontSize:10.5, color:"rgba(255,255,255,0.55)", fontWeight:600 }}>Live · {p.metrics.uptime}% uptime</span>
                      </div>
                    </div>
                  </div>

                  {/* Stat chips */}
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap", position:"relative" }}>
                    {perms?.canViewRevenue && (
                      <StatChip label="Revenue" value={fmtCurrency(p.metrics.revenue, true)} sub="all time" />
                    )}
                    <StatChip label="TX Today" value={p.metrics.txToday.toLocaleString()} sub="transactions" />
                    <StatChip label="Users" value={p.metrics.merchants >= 1000 ? `${(p.metrics.merchants/1000).toFixed(1)}K` : String(p.metrics.merchants)} sub="active" />
                  </div>
                </div>

                {/* ── Card body ── */}
                <div style={{ background:"var(--surface)", padding:"clamp(14px,3vw,20px)" }}>

                  {/* Description */}
                  <p style={{ fontSize:13, color:"var(--text-2)", lineHeight:1.65, marginBottom:16 }}>{p.description}</p>

                  {/* Growth bar */}
                  <div style={{ marginBottom:16 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                      <span style={{ fontSize:11.5, fontWeight:600, color:"var(--text-3)" }}>Revenue Growth</span>
                      <span style={{ fontSize:11.5, fontWeight:700, color:p.color }}>+{p.metrics.growth}%</span>
                    </div>
                    <div style={{ height:6, borderRadius:99, background:"var(--surface-2)", overflow:"hidden" }}>
                      <div style={{ height:"100%", width:`${Math.min(p.metrics.growth * 2.5, 100)}%`, borderRadius:99, background:p.gradient, transition:"width 1.2s cubic-bezier(0.4,0,0.2,1)" }} />
                    </div>
                  </div>

                  {/* Success rate */}
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:18, padding:"9px 12px", borderRadius:10, background:"var(--surface-2)", border:"1px solid var(--border)" }}>
                    <div style={{ width:32, height:32, borderRadius:9, background:p.colorLight, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      <span style={{ fontSize:16 }}>✓</span>
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:11, color:"var(--text-3)", marginBottom:1 }}>Transaction Success Rate</div>
                      <div style={{ fontFamily:"'Sora',sans-serif", fontSize:15, fontWeight:700, color:p.color }}>{p.metrics.successRate}%</div>
                    </div>
                    {mounted && (
                      <div style={{ height:30, width:70, overflow:"hidden" }}>
                        <AreaChart width={70} height={30} data={p.chart.slice(-4)} margin={{ top:2, right:0, bottom:0, left:0 }}>
                          <defs>
                            <linearGradient id={`mg-${p.id}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={p.color} stopOpacity={0.3} />
                              <stop offset="100%" stopColor={p.color} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <Area type="monotone" dataKey="v" stroke={p.color} strokeWidth={1.5} fill={`url(#mg-${p.id})`} dot={false} />
                        </AreaChart>
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <div style={{ marginBottom:18 }}>
                    <div style={{ fontSize:11, fontWeight:700, color:"var(--text-3)", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:8 }}>Key Features</div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                      {p.features.slice(0,6).map(f => (
                        <span key={f} style={{ display:"inline-flex", alignItems:"center", padding:"3px 9px", borderRadius:20, fontSize:11, fontWeight:500, background:p.colorLight, color:p.colorDark, border:`1px solid ${p.color}22` }}>
                          {f}
                        </span>
                      ))}
                      {p.features.length > 6 && (
                        <span style={{ display:"inline-flex", alignItems:"center", padding:"3px 9px", borderRadius:20, fontSize:11, fontWeight:500, background:"var(--surface-2)", color:"var(--text-3)" }}>
                          +{p.features.length - 6} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div style={{ display:"flex", gap:8 }}>
                    <button
                      className="btn btn-sm"
                      onClick={() => openProduct(p.id)}
                      style={{ flex:1, justifyContent:"center", background:p.gradient, color:"#fff", border:"none", fontWeight:700, fontSize:13, borderRadius:10, height:40, boxShadow:`0 4px 14px ${p.colorGlow}` }}>
                      {isActive ? "View Dashboard ↗" : "Open Dashboard →"}
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setSelected(isSelected ? null : p.id)}
                      style={{ fontSize:12, borderRadius:10, height:40, borderColor: isSelected ? p.color : undefined, color: isSelected ? p.color : undefined, background: isSelected ? p.colorLight : undefined }}>
                      {isSelected ? "Close" : "Details"}
                    </button>
                  </div>
                </div>

                {/* ── Expanded detail panel ── */}
                {selected === p.id && (
                  <div style={{ borderTop:`2px solid ${p.colorLight}`, background:"var(--bg)", padding:"clamp(14px,3vw,20px)", animation:"fadeUp 0.2s ease" }}>
                    <div style={{ fontSize:12, fontWeight:700, color:"var(--text-3)", textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:12 }}>All Features</div>
                    <div className="feat-grid" style={{ marginBottom:16 }}>
                      {p.features.map(f => (
                        <div key={f} style={{ display:"flex", alignItems:"center", gap:7, padding:"8px 10px", borderRadius:9, background:"var(--surface)", border:"1px solid var(--border)", fontSize:12, color:"var(--text-2)", fontWeight:500 }}>
                          <span style={{ width:7, height:7, borderRadius:"50%", background:p.color, flexShrink:0 }} />
                          {f}
                        </div>
                      ))}
                    </div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                      {[
                        { label:"Total Revenue",   value: perms?.canViewRevenue ? fmtCurrency(p.metrics.revenue) : "—" },
                        { label:"Success Rate",     value:`${p.metrics.successRate}%` },
                        { label:"Active Users",     value:p.metrics.merchants.toLocaleString() },
                        { label:"Uptime SLA",       value:`${p.metrics.uptime}%` },
                      ].map(s => (
                        <div key={s.label} style={{ padding:"10px 12px", borderRadius:10, background:"var(--surface)", border:"1px solid var(--border)" }}>
                          <div style={{ fontSize:10.5, color:"var(--text-3)", marginBottom:3 }}>{s.label}</div>
                          <div style={{ fontFamily:"'Sora',sans-serif", fontSize:16, fontWeight:700, color:p.color }}>{s.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Side-by-side Compare view ── */}
        {selected === "compare" && compared.length === 2 && (() => {
          const [a, b] = compared.map(id => PRODUCTS.find(p => p.id === id)!);
          const metrics: Array<{ label:string; keyA: keyof typeof a.metrics; fmt:(v:number)=>string; highlight?:boolean }> = [
            { label:"Revenue",       keyA:"revenue",    fmt:v=>fmtCurrency(v,true), highlight:true  },
            { label:"Growth",        keyA:"growth",     fmt:v=>`+${v}%`,            highlight:true  },
            { label:"Success Rate",  keyA:"successRate",fmt:v=>`${v}%`                              },
            { label:"Uptime",        keyA:"uptime",     fmt:v=>`${v}%`                              },
            { label:"Users",         keyA:"merchants",  fmt:v=>v.toLocaleString()                   },
            { label:"TX Today",      keyA:"txToday",    fmt:v=>v.toLocaleString()                   },
          ];
          return (
            <div className="card animate-fade-up" style={{ padding:0, overflow:"hidden" }}>
              {/* Header */}
              <div style={{ padding:"18px 22px", borderBottom:"1px solid var(--border)", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10 }}>
                <h3 style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:16, color:"var(--text)", margin:0 }}>
                  {a.name} vs {b.name}
                </h3>
                <button onClick={() => { setSelected(null); setCompared([]); setCompareMode(false); }}
                  className="btn btn-secondary btn-sm" style={{ fontSize:12 }}>✕ Close</button>
              </div>

              {/* Product headers */}
              <div style={{ display:"grid", gridTemplateColumns:"200px 1fr 1fr", borderBottom:"1px solid var(--border)" }}>
                <div style={{ padding:"16px 18px", background:"var(--surface-2)" }} />
                {[a,b].map(prod => (
                  <div key={prod.id} style={{ padding:"16px 18px", background:prod.colorLight, borderLeft:"1px solid var(--border)", display:"flex", alignItems:"center", gap:10 }}>
                    <span style={{ fontSize:22 }}>{prod.icon}</span>
                    <div>
                      <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:15, color:prod.colorDark }}>{prod.name}</div>
                      <div style={{ fontSize:11, color:prod.colorDark, opacity:0.6 }}>{prod.tagline}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Metric rows */}
              {metrics.map((m, i) => {
                const va = a.metrics[m.keyA] as number;
                const vb = b.metrics[m.keyA] as number;
                const winner = va > vb ? "a" : vb > va ? "b" : "tie";
                return (
                  <div key={m.label} style={{ display:"grid", gridTemplateColumns:"200px 1fr 1fr", borderBottom: i < metrics.length-1 ? "1px solid var(--border)" : "none" }}>
                    <div style={{ padding:"13px 18px", background:"var(--surface-2)", display:"flex", alignItems:"center" }}>
                      <span style={{ fontSize:12.5, fontWeight:600, color:"var(--text-2)" }}>{m.label}</span>
                    </div>
                    {[{prod:a,val:va,win:winner==="a"},{prod:b,val:vb,win:winner==="b"}].map(({prod,val,win}) => (
                      <div key={prod.id} style={{ padding:"13px 18px", borderLeft:"1px solid var(--border)", display:"flex", alignItems:"center", gap:8, background:win&&m.highlight?`${prod.colorLight}`:"var(--surface)" }}>
                        <span style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:16, color: win&&m.highlight ? prod.colorDark : "var(--text)" }}>
                          {(m.label==="Revenue"&&!perms?.canViewRevenue)?"—":m.fmt(val)}
                        </span>
                        {win && m.highlight && <span style={{ fontSize:10, fontWeight:700, color:prod.color, background:prod.colorLight, padding:"1px 6px", borderRadius:20, border:`1px solid ${prod.color}33` }}>WINNER</span>}
                      </div>
                    ))}
                  </div>
                );
              })}

              {/* Compare CTA */}
              <div className="compare-bar">
                {[a,b].map(prod => (
                  <button key={prod.id} onClick={() => openProduct(prod.id)}
                    className="btn btn-sm"
                    style={{ background:prod.gradient, color:"#fff", border:"none", fontWeight:700, fontSize:13, borderRadius:10, boxShadow:`0 3px 12px ${prod.colorGlow}` }}>
                    Open {prod.name} →
                  </button>
                ))}
              </div>
            </div>
          );
        })()}

        {/* ── Bottom quick-nav strip ── */}
        <div className="animate-fade-up stagger-6" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:12 }}>
          {[
            { label:"Total Transactions Today", value:(PRODUCTS.reduce((s,p)=>s+p.metrics.txToday,0)).toLocaleString(), icon:"⚡", color:"var(--amber)" },
            { label:"Combined Active Users",     value:(PRODUCTS.reduce((s,p)=>s+p.metrics.merchants,0)).toLocaleString(), icon:"👥", color:"var(--accent)" },
            { label:"Avg Platform Uptime",       value:`${(PRODUCTS.reduce((s,p)=>s+p.metrics.uptime,0)/3).toFixed(2)}%`, icon:"🛡️", color:"var(--green)" },
            { label:"Products Live",             value:"3 / 3",                                                            icon:"🚀", color:"var(--purple)" },
          ].map(s => (
            <div key={s.label} className="card" style={{ padding:"14px 16px", display:"flex", alignItems:"center", gap:12 }}>
              <span style={{ fontSize:22, lineHeight:1 }}>{s.icon}</span>
              <div>
                <div style={{ fontFamily:"'Sora',sans-serif", fontSize:20, fontWeight:800, color:s.color, lineHeight:1, marginBottom:2 }}>{s.value}</div>
                <div style={{ fontSize:11, color:"var(--text-3)", fontWeight:500 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
