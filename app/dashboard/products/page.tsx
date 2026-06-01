"use client";
import { useApp } from "@/lib/store";

const PRODUCT_DATA = [
  { id: "durapayment", name: "DuraPayment", type: "Payment Gateway", status: "Active", merchants: 1204, txToday: 284, revenue: 312000000, uptime: "99.98%", icon: "💳", color: "#2563EB", bg: "#EFF6FF" },
  { id: "durapay",     name: "DuraPay",     type: "Personal Banking", status: "Active", merchants: 4320, txToday: 891, revenue: 284000000, uptime: "99.95%", icon: "🏦", color: "#10B981", bg: "#ECFDF5" },
  { id: "durabiz",     name: "DuraBiz",     type: "Business Banking", status: "Active", merchants: 892,  txToday: 645, revenue: 251000000, uptime: "99.99%", icon: "🏢", color: "#7C3AED", bg: "#F5F3FF" },
];

export default function ProductsPage() {
  const { setProduct } = useApp();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 22, fontWeight: 700, color: "#0D1B3E", marginBottom: 4 }}>Products</h1>
        <p style={{ color: "#8A97B0", fontSize: 14 }}>Overview of all Dura LTD products</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 20 }}>
        {PRODUCT_DATA.map(p => (
          <div key={p.id} className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "22px 22px 18px", borderBottom: "1px solid #E2E8F4" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: p.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>{p.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 17, fontWeight: 700, color: "#0D1B3E" }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: "#8A97B0" }}>{p.type}</div>
                </div>
                <span className="badge badge-green">{p.status}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {[
                  { label: "Users/Merchants", value: p.merchants.toLocaleString() },
                  { label: "TX Today",        value: p.txToday.toLocaleString() },
                  { label: "Revenue",         value: `₦${(p.revenue/1e6).toFixed(0)}M` },
                  { label: "Uptime",          value: p.uptime },
                ].map(m => (
                  <div key={m.label} style={{ background: "#F4F7FE", borderRadius: 10, padding: "10px 12px" }}>
                    <p style={{ fontSize: 11, color: "#8A97B0", marginBottom: 4 }}>{m.label}</p>
                    <p style={{ fontFamily: "'Sora',sans-serif", fontSize: 16, fontWeight: 700, color: "#0D1B3E" }}>{m.value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ padding: "14px 22px", display: "flex", gap: 10 }}>
              <button className="btn btn-primary btn-sm" style={{ background: p.color, flex: 1, justifyContent: "center" }}
                onClick={() => setProduct(p.id as "durapayment" | "durapay" | "durabiz")}>
                Open Dashboard
              </button>
              <button className="btn btn-secondary btn-sm" style={{ fontSize: 12 }}>Configure</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
