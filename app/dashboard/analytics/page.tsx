"use client";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { getPerms } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { fmtCurrency } from "@/lib/utils";
import { useAnalytics } from "@/lib/use-product-api";
import { ErrorBanner, ProductBanner } from "@/components/ui/data-state";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";

const PRODUCT_ACCENT: Record<string,string> = { durapayment:"#2563EB", durapay:"#10B981", durabiz:"#7C3AED" };
const RANGES = ["7D","1M","3M","6M","YTD","1Y"];

function ChartTip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:10, padding:"10px 14px", fontSize:12, boxShadow:"0 4px 20px rgba(0,0,0,0.08)" }}>
      <p style={{ fontWeight:600, color:"var(--text)", marginBottom:5 }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color:p.color, marginBottom:2 }}>
          {p.name}: <strong>{p.dataKey==="revenue"?fmtCurrency(p.value):p.value?.toLocaleString()}</strong>
        </p>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const { user, product } = useApp();
  const router  = useRouter();
  const perms   = user ? getPerms(user.role) : null;
  const [range, setRange] = useState("1M");

  useEffect(() => {
    if (user && !perms?.canViewAnalytics) router.replace("/dashboard");
  }, [user, perms, router]);

  const { data: raw, loading, error, refetch } = useAnalytics(range);

  if (!user || !perms?.canViewAnalytics) return (
    <div style={{ textAlign:"center", padding:"80px 20px" }}>
      <div style={{ fontSize:52, marginBottom:14 }}>🔒</div>
      <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:21, fontWeight:700, color:"var(--text)", marginBottom:8 }}>Access Restricted</h2>
      <p style={{ color:"var(--text-3)", fontSize:14 }}>Analytics are not available for your role.</p>
    </div>
  );

  const accent   = PRODUCT_ACCENT[product] ?? "#2563EB";
  const apiData  = raw as any;
  const kpiData  = apiData?.kpis ?? {};
  const chartRows = apiData?.chart ?? [];
  const issueBreakdown = apiData?.issueBreakdown ?? [];

  const KPIS = [
    { label:"Total Revenue",   value:fmtCurrency(kpiData.totalRevenue   ?? 121800000, true), delta:"+14.2%", pos:true  },
    { label:"Avg Daily TX",    value:String(kpiData.avgDailyTx          ?? 59),               delta:"+8.3%",  pos:true  },
    { label:"Conversion Rate", value:`${kpiData.conversionRate          ?? 3.8}%`,             delta:"+0.4%",  pos:true  },
    { label:"Churn Rate",      value:`${kpiData.churnRate               ?? 1.2}%`,             delta:"-0.3%",  pos:true  },
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
      {/* Header */}
      <div className="animate-fade-up" style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4, flexWrap:"wrap" }}>
            <h1 style={{ fontFamily:"'Sora',sans-serif", fontSize:"clamp(18px,4vw,24px)", fontWeight:700, color:"var(--text)", margin:0 }}>Analytics</h1>
            <ProductBanner product={product} loading={loading} />
          </div>
          <p style={{ color:"var(--text-3)", fontSize:13.5 }}>Performance insights for {product === "durapayment" ? "DuraPayment" : product === "durapay" ? "DuraPay" : "DuraBiz"}</p>
        </div>
        <div style={{ display:"flex", gap:3, background:"var(--surface)", border:"1px solid var(--border)", borderRadius:10, padding:3 }}>
          {RANGES.map(r => (
            <button key={r} onClick={() => setRange(r)} className="btn btn-sm"
              style={{ fontSize:11.5, background:range===r?accent:"transparent", color:range===r?"#fff":"var(--text-2)", border:"none", padding:"5px 10px" }}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {error && <ErrorBanner message={error} onRetry={refetch} />}

      {/* KPI row */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))", gap:11 }} className="animate-fade-up stagger-1">
        {KPIS.map(k => (
          <div key={k.label} className="card" style={{ padding:"15px 17px" }}>
            <div style={{ fontSize:11.5, color:"var(--text-3)", marginBottom:7 }}>{k.label}</div>
            <div style={{ fontFamily:"'Sora',sans-serif", fontSize:22, fontWeight:700, color:"var(--text)", marginBottom:5 }}>{k.value}</div>
            <div style={{ fontSize:12, fontWeight:600, color:k.pos?"var(--green)":"var(--red)" }}>{k.pos?"↑":"↓"} {k.delta}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:14 }}>
        {/* Revenue — spans 2 cols on wide screens */}
        <div className="card animate-fade-up stagger-2" style={{ padding:18, gridColumn:"span 2" }}>
          <h3 style={{ fontSize:15, fontWeight:700, color:"var(--text)", marginBottom:3 }}>Revenue Trend</h3>
          <p style={{ fontSize:12, color:"var(--text-3)", marginBottom:14 }}>Monthly revenue — {product === "durapayment" ? "DuraPayment" : product === "durapay" ? "DuraPay" : "DuraBiz"}</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartRows}>
              <defs>
                <linearGradient id="aR" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={accent} stopOpacity={0.2}/>
                  <stop offset="95%" stopColor={accent} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize:10, fill:"var(--text-3)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:9, fill:"var(--text-3)" }} axisLine={false} tickLine={false} width={44} tickFormatter={v=>`₦${(v/1000000).toFixed(0)}M`} />
              <Tooltip content={<ChartTip />} />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke={accent} fill="url(#aR)" strokeWidth={2.5} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Transactions */}
        <div className="card animate-fade-up stagger-3" style={{ padding:18 }}>
          <h3 style={{ fontSize:15, fontWeight:700, color:"var(--text)", marginBottom:3 }}>Transaction Count</h3>
          <p style={{ fontSize:12, color:"var(--text-3)", marginBottom:14 }}>Monthly transactions</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartRows}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize:10, fill:"var(--text-3)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:9, fill:"var(--text-3)" }} axisLine={false} tickLine={false} width={32} />
              <Tooltip content={<ChartTip />} />
              <Bar dataKey="transactions" name="Transactions" fill={accent} radius={[4,4,0,0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* User growth */}
        <div className="card animate-fade-up stagger-4" style={{ padding:18 }}>
          <h3 style={{ fontSize:15, fontWeight:700, color:"var(--text)", marginBottom:3 }}>User Growth</h3>
          <p style={{ fontSize:12, color:"var(--text-3)", marginBottom:14 }}>Platform users over time</p>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartRows}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize:10, fill:"var(--text-3)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:9, fill:"var(--text-3)" }} axisLine={false} tickLine={false} width={40} tickFormatter={v=>`${(v/1000).toFixed(1)}K`} />
              <Tooltip content={<ChartTip />} />
              <Line type="monotone" dataKey="users" name="Users" stroke="#10B981" strokeWidth={2.5} dot={{ r:3, fill:"#10B981" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Issue breakdown */}
        {issueBreakdown.length > 0 && (
          <div className="card animate-fade-up stagger-5" style={{ padding:18 }}>
            <h3 style={{ fontSize:15, fontWeight:700, color:"var(--text)", marginBottom:3 }}>Issue Breakdown</h3>
            <p style={{ fontSize:12, color:"var(--text-3)", marginBottom:14 }}>Support ticket status</p>
            <div style={{ display:"flex", alignItems:"center", gap:16 }}>
              <ResponsiveContainer width={130} height={130}>
                <PieChart>
                  <Pie data={issueBreakdown} cx="50%" cy="50%" innerRadius={38} outerRadius={62} dataKey="value" paddingAngle={3}>
                    {issueBreakdown.map((entry: any, i: number) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(v) => `${v} issues`} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex:1, display:"flex", flexDirection:"column", gap:7 }}>
                {issueBreakdown.map((d: any) => (
                  <div key={d.name} style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                      <span style={{ width:7,height:7,borderRadius:"50%",background:d.color,display:"inline-block",flexShrink:0 }} />
                      <span style={{ fontSize:12, color:"var(--text-2)" }}>{d.name}</span>
                    </div>
                    <span style={{ fontSize:12, fontWeight:700, color:"var(--text)" }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
