"use client";
import { useApp } from "@/lib/store";
import { getPerms } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { chartData } from "@/lib/mock-data";
import { fmtCurrency } from "@/lib/utils";
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const PRODUCT_ACCENT: Record<string, string> = { durapayment: "#2563EB", durapay: "#10B981", durabiz: "#7C3AED" };

export default function AnalyticsPage() {
  const { user, product } = useApp();
  const router = useRouter();
  const perms = user ? getPerms(user.role) : null;

  useEffect(() => {
    if (user && !perms?.canViewAnalytics) router.replace("/overview");
  }, [user, perms, router]);

  if (!user || !perms?.canViewAnalytics) return (
    <div style={{ textAlign: "center", padding: "60px 20px" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
      <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 20, fontWeight: 700, color: "#0D1B3E", marginBottom: 8 }}>Access Restricted</h2>
      <p style={{ color: "#8A97B0" }}>Analytics are not available for your role.</p>
    </div>
  );

  const accent = PRODUCT_ACCENT[product] ?? "#2563EB";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 22, fontWeight: 700, color: "#0D1B3E", marginBottom: 4 }}>Analytics</h1>
          <p style={{ color: "#8A97B0", fontSize: 14 }}>Deep insights & performance metrics</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {["7D","1M","3M","6M","YTD","1Y"].map((r, i) => (
            <button key={r} className="btn btn-secondary btn-sm" style={{ fontSize: 12, background: i === 1 ? accent : undefined, color: i === 1 ? "#fff" : undefined }}>{r}</button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14 }}>
        {[
          { label: "Total Revenue",   value: fmtCurrency(121800000, true), delta: "+14.2%", color: accent },
          { label: "Avg Daily TX",    value: "59",                          delta: "+8.3%",  color: "#10B981" },
          { label: "Conversion Rate", value: "3.8%",                        delta: "+0.4%",  color: "#F59E0B" },
          { label: "Churn Rate",      value: "1.2%",                        delta: "-0.3%",  color: "#7C3AED" },
        ].map(m => (
          <div key={m.label} className="card" style={{ padding: "18px 20px" }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: "#8A97B0", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>{m.label}</p>
            <p style={{ fontFamily: "'Sora',sans-serif", fontSize: 24, fontWeight: 700, color: "#0D1B3E", marginBottom: 6 }}>{m.value}</p>
            <span style={{ fontSize: 12, fontWeight: 600, color: m.delta.startsWith("+") ? "#10B981" : "#EF4444" }}>{m.delta}</span>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 16, fontWeight: 700, color: "#0D1B3E", marginBottom: 18 }}>Revenue Trend</h2>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="aGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={accent} stopOpacity={0.2} />
                <stop offset="95%" stopColor={accent} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F0F4FA" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#B0BAD0" }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={v => `₦${(v/1e6).toFixed(0)}M`} tick={{ fontSize: 11, fill: "#B0BAD0" }} axisLine={false} tickLine={false} width={52} />
            <Tooltip formatter={(v: unknown) => [fmtCurrency(v as number), "Revenue"]} contentStyle={{ background: "#fff", border: "1px solid #E2E8F4", borderRadius: 10, fontSize: 12 }} />
            <Area type="monotone" dataKey="revenue" stroke={accent} strokeWidth={2.5} fill="url(#aGrad)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div className="card">
          <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 16, fontWeight: 700, color: "#0D1B3E", marginBottom: 18 }}>Transaction Volume</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F4FA" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#B0BAD0" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#B0BAD0" }} axisLine={false} tickLine={false} width={36} />
              <Tooltip contentStyle={{ background: "#fff", border: "1px solid #E2E8F4", borderRadius: 10, fontSize: 12 }} />
              <Bar dataKey="transactions" fill={accent} radius={[4,4,0,0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 16, fontWeight: 700, color: "#0D1B3E", marginBottom: 18 }}>User Growth</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F4FA" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#B0BAD0" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#B0BAD0" }} axisLine={false} tickLine={false} width={40} />
              <Tooltip contentStyle={{ background: "#fff", border: "1px solid #E2E8F4", borderRadius: 10, fontSize: 12 }} />
              <Line type="monotone" dataKey="users" stroke="#10B981" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
