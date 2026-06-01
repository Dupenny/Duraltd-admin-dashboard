"use client";
import { useState, useCallback, useMemo, memo } from "react";
import { useApp } from "@/lib/store";
import { getPerms } from "@/lib/auth";
import { fmtCurrency } from "@/lib/utils";
import { useCustomers } from "@/lib/use-product-api";
import { LoadingRows, ErrorBanner, ProductBanner } from "@/components/ui/data-state";
import { issuesApi } from "@/lib/api/client";

type CustomerStatus  = "Active" | "Inactive";
type Plan            = "Free" | "Standard" | "Premium" | "Business" | "Enterprise";
type CustomerProduct = "DuraPay" | "DuraBiz" | "DuraPayment";
interface NewCustomer { name: string; email: string; phone: string; product: CustomerProduct; plan: Plan; status: CustomerStatus; }
const EMPTY: NewCustomer = { name:"", email:"", phone:"", product:"DuraPay", plan:"Free", status:"Active" };

const InputField = memo(function InputField({ label, id, type="text", value, error, onChange, placeholder }: {
  label:string; id:string; type?:string; value:string; error?:string; onChange:(v:string)=>void; placeholder?:string;
}) {
  return (
    <div>
      <label htmlFor={id} style={{ display:"block", fontSize:12, fontWeight:600, color:"var(--text-2)", marginBottom:5 }}>
        {label} <span style={{ color:"var(--red)" }}>*</span>
      </label>
      <input id={id} type={type} value={value} placeholder={placeholder} onChange={e=>onChange(e.target.value)}
        className="inp" style={{ fontSize:13, padding:"9px 12px", borderColor:error?"var(--red)":undefined }} />
      {error && <p style={{ color:"var(--red)", fontSize:11.5, marginTop:4 }}>{error}</p>}
    </div>
  );
});

const PLAN_CLS:   Record<string,string> = { Free:"badge-gray", Standard:"badge-blue", Premium:"badge-purple", Business:"badge-indigo", Enterprise:"badge-amber" };
const STATUS_CLS: Record<string,string> = { Active:"badge-green", Inactive:"badge-red" };

export default function CustomersPage() {
  const { user, product } = useApp();
  if (!user) return null;
  const perms = getPerms(user.role);

  const [search,    setSearch]    = useState("");
  const [statusF,   setStatusF]   = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [form,      setForm]      = useState<NewCustomer>(EMPTY);
  const [errors,    setErrors]    = useState<Partial<NewCustomer>>({});
  const [saving,    setSaving]    = useState(false);

  const params = useMemo(() => {
    const p: Record<string,string> = {};
    if (search)             p.search = search;
    if (statusF !== "All")  p.status = statusF;
    return p;
  }, [search, statusF]);

  const { data: raw, loading, error, refetch } = useCustomers(params);
  const rows  = Array.isArray(raw) ? raw : ((raw as any)?.data ?? []);
  const total = (raw as any)?.total ?? rows.length;

  // Client-side filter fallback
  const filtered = useMemo(() => rows.filter((c: any) => {
    const q = search.toLowerCase();
    return (!q || c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q))
      && (statusF === "All" || c.status === statusF);
  }), [rows, search, statusF]);

  const setField = useCallback((k: keyof NewCustomer) => (v: string) => setForm(p => ({...p,[k]:v})), []);

  function validate() {
    const e: Partial<NewCustomer> = {};
    if (!form.name.trim())  e.name  = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    if (!form.phone.trim()) e.phone = "Phone is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function addCustomer() {
    if (!validate()) return;
    setSaving(true);
    // POST to real backend — falls back gracefully on error
    const result = await fetch(`/api/proxy/${product}/customers`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    }).catch(() => null);
    setSaving(false);
    setShowModal(false);
    setForm(EMPTY);
    setErrors({});
    refetch(); // re-fetch list from server
  }

  const statsCards = [
    { label: "Total",      value: total },
    { label: "Active",     value: filtered.filter((c: any) => c.status === "Active").length },
    { label: "Inactive",   value: filtered.filter((c: any) => c.status === "Inactive").length },
    { label: "Enterprise", value: filtered.filter((c: any) => c.plan === "Enterprise").length },
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
      <div className="animate-fade-up" style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4, flexWrap:"wrap" }}>
            <h1 style={{ fontFamily:"'Sora',sans-serif", fontSize:"clamp(18px,4vw,24px)", fontWeight:700, color:"var(--text)", margin:0 }}>Customers</h1>
            <ProductBanner product={product} loading={loading} />
          </div>
          <p style={{ color:"var(--text-3)", fontSize:13.5 }}>{total} customers in your {product} directory</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>+ Add Customer</button>
      </div>

      {error && <ErrorBanner message={error} onRetry={refetch} />}

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))", gap:10 }} className="animate-fade-up stagger-1">
        {statsCards.map(s => (
          <div key={s.label} className="card" style={{ padding:"13px 15px" }}>
            <div style={{ fontFamily:"'Sora',sans-serif", fontSize:22, fontWeight:700, color:"var(--text)", marginBottom:2 }}>{s.value}</div>
            <div style={{ fontSize:11.5, color:"var(--text-3)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card animate-fade-up stagger-2" style={{ padding:0, overflow:"hidden" }}>
        <div style={{ padding:"13px 16px", borderBottom:"1px solid var(--border)", display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
          <div style={{ position:"relative", flex:"1 1 180px" }}>
            <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"var(--text-3)", display:"flex" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </span>
            <input className="inp" placeholder="Search name or email…" value={search} onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft:30, paddingTop:7, paddingBottom:7, fontSize:13 }} />
          </div>
          {["All","Active","Inactive"].map(s => (
            <button key={s} onClick={() => setStatusF(s)} className="btn btn-secondary btn-sm"
              style={{ fontSize:11.5, background:statusF===s?"var(--text)":undefined, color:statusF===s?"#fff":undefined }}>
              {s}
            </button>
          ))}
        </div>

        {loading && rows.length === 0 ? <LoadingRows rows={5} cols={5} /> : (
          <div style={{ overflowX:"auto" }}>
            <table className="data-tbl" style={{ minWidth:580 }}>
              <thead>
                <tr>
                  <th>Customer</th><th>Product</th><th>Plan</th>
                  {perms.canViewRevenue && <th>Total Spent</th>}
                  <th>Transactions</th><th>Status</th><th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign:"center", padding:40, color:"var(--text-3)" }}>No customers found</td></tr>
                ) : filtered.map((c: any) => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                        <div style={{ width:30, height:30, borderRadius:8, background:"var(--accent)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:10.5, fontWeight:700, flexShrink:0 }}>
                          {c.name?.split(" ").map((n: string) => n[0]).join("").slice(0,2)}
                        </div>
                        <div>
                          <div style={{ fontWeight:500, fontSize:13, color:"var(--text)" }}>{c.name}</div>
                          <div style={{ fontSize:11.5, color:"var(--text-3)" }}>{c.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="badge badge-blue">{c.product}</span></td>
                    <td><span className={`badge ${PLAN_CLS[c.plan]??"badge-gray"}`}>{c.plan}</span></td>
                    {perms.canViewRevenue && <td style={{ fontWeight:700, color:"var(--text)" }}>{fmtCurrency(c.spent??0, true)}</td>}
                    <td style={{ fontWeight:500 }}>{c.transactions ?? 0}</td>
                    <td><span className={`badge ${STATUS_CLS[c.status]??"badge-gray"}`}>{c.status}</span></td>
                    <td style={{ fontSize:12, color:"var(--text-3)" }}>{c.joined}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Customer Modal */}
      {showModal && (
        <div style={{ position:"fixed", inset:0, zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
          <div style={{ position:"absolute", inset:0, background:"rgba(13,27,62,0.45)", backdropFilter:"blur(4px)" }} onClick={() => setShowModal(false)} />
          <div style={{ position:"relative", zIndex:201, background:"var(--surface)", borderRadius:20, padding:"26px 26px 22px", width:"100%", maxWidth:460, boxShadow:"0 20px 60px rgba(13,27,62,0.18)", border:"1px solid var(--border)", animation:"fadeUp 0.2s ease", maxHeight:"90vh", overflowY:"auto" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
              <div>
                <h2 style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:17, color:"var(--text)", marginBottom:2 }}>Add New Customer</h2>
                <p style={{ fontSize:12, color:"var(--text-3)" }}>Will be saved to {product === "durapayment" ? "DuraPayment" : product === "durapay" ? "DuraPay" : "DuraBiz"}</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--text-3)", fontSize:20 }}>×</button>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:13 }}>
              <InputField label="Full Name" id="name" value={form.name} error={errors.name} onChange={setField("name")} placeholder="e.g. Chioma Eze" />
              <InputField label="Email Address" id="email" type="email" value={form.email} error={errors.email} onChange={setField("email")} placeholder="email@example.com" />
              <InputField label="Phone Number" id="phone" value={form.phone} error={errors.phone} onChange={setField("phone")} placeholder="+234 800 000 0000" />
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:11 }}>
                <div>
                  <label style={{ display:"block", fontSize:12, fontWeight:600, color:"var(--text-2)", marginBottom:5 }}>Plan</label>
                  <select value={form.plan} onChange={e => setField("plan")(e.target.value)} className="inp" style={{ fontSize:13, padding:"9px 12px" }}>
                    {["Free","Standard","Premium","Business","Enterprise"].map(p=><option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display:"block", fontSize:12, fontWeight:600, color:"var(--text-2)", marginBottom:5 }}>Status</label>
                  <select value={form.status} onChange={e => setField("status")(e.target.value)} className="inp" style={{ fontSize:13, padding:"9px 12px" }}>
                    <option>Active</option><option>Inactive</option>
                  </select>
                </div>
              </div>
              <div style={{ display:"flex", gap:10, marginTop:2 }}>
                <button onClick={() => setShowModal(false)} className="btn btn-secondary" style={{ flex:1, justifyContent:"center" }}>Cancel</button>
                <button onClick={addCustomer} disabled={saving} className="btn btn-primary" style={{ flex:1, justifyContent:"center" }}>
                  {saving ? "Saving…" : "Add Customer"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
