"use client";
import { useState, useCallback, memo } from "react";
import { useApp } from "@/lib/store";
import { getPerms } from "@/lib/auth";
import { CUSTOMERS } from "@/lib/mock-data";
import { fmtCurrency } from "@/lib/utils";

type CustomerStatus = "Active" | "Inactive";
type Plan = "Free" | "Standard" | "Premium" | "Business" | "Enterprise";
type CustomerProduct = "DuraPay" | "DuraBiz" | "DuraPayment";

interface NewCustomer {
  name: string; email: string; phone: string;
  product: CustomerProduct; plan: Plan; status: CustomerStatus;
}
const EMPTY: NewCustomer = { name: "", email: "", phone: "", product: "DuraPay", plan: "Free", status: "Active" };

// ─── Field components defined OUTSIDE the page so they never remount ──────────
const InputField = memo(function InputField({ label, id, type = "text", value, error, onChange, placeholder }: {
  label: string; id: string; type?: string; value: string; error?: string;
  onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={id} style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 5 }}>
        {label} <span style={{ color: "#EF4444" }}>*</span>
      </label>
      <input
        id={id} type={type} value={value} placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        className="inp"
        style={{ fontSize: 13, padding: "8px 12px", borderColor: error ? "#EF4444" : undefined }}
      />
      {error && <p style={{ color: "#EF4444", fontSize: 11.5, marginTop: 4 }}>{error}</p>}
    </div>
  );
});

const SelectField = memo(function SelectField({ label, id, value, onChange, options }: {
  label: string; id: string; value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label htmlFor={id} style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 5 }}>{label}</label>
      <select id={id} value={value} onChange={e => onChange(e.target.value)}
        className="inp"
        style={{ fontSize: 13, padding: "8px 12px", cursor: "pointer",
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='%238A97B0' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center", paddingRight: 32, appearance: "none" as const }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
});

// ─── Main page ────────────────────────────────────────────────────────────────
export default function CustomersPage() {
  const { user } = useApp();
  if (!user) return null;
  const perms = getPerms(user.role);

  const [customers, setCustomers] = useState(CUSTOMERS);
  const [search, setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]           = useState<NewCustomer>(EMPTY);
  const [errors, setErrors]       = useState<Partial<NewCustomer>>({});
  const [saving, setSaving]       = useState(false);
  const [toast, setToast]         = useState("");

  const filtered = customers.filter(c => {
    const q = search.toLowerCase();
    const m = !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
    const s = statusFilter === "All" || c.status === statusFilter;
    return m && s;
  });

  const statusColor: Record<string, string> = { Active: "badge-green", Inactive: "badge-gray" };
  const planColor: Record<string, string>   = { Premium: "badge-purple", Business: "badge-indigo", Standard: "badge-blue", Free: "badge-gray", Enterprise: "badge-amber" };

  // Stable callbacks so InputField never re-renders from parent
  const setName    = useCallback((v: string) => { setForm(p => ({ ...p, name: v }));    setErrors(p => ({ ...p, name: "" }));  }, []);
  const setEmail   = useCallback((v: string) => { setForm(p => ({ ...p, email: v }));   setErrors(p => ({ ...p, email: "" })); }, []);
  const setPhone   = useCallback((v: string) => { setForm(p => ({ ...p, phone: v }));   setErrors(p => ({ ...p, phone: "" })); }, []);
  const setProduct = useCallback((v: string) => setForm(p => ({ ...p, product: v as CustomerProduct })), []);
  const setPlan    = useCallback((v: string) => setForm(p => ({ ...p, plan: v as Plan })), []);
  const setStatus  = useCallback((v: string) => setForm(p => ({ ...p, status: v as CustomerStatus })), []);

  function validate() {
    const e: Partial<NewCustomer> = {};
    if (!form.name.trim())  e.name  = "Required";
    if (!form.email.trim()) e.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email";
    if (!form.phone.trim()) e.phone = "Required";
    setErrors(e);
    return !Object.keys(e).length;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    // API: await customersApi.create(product, form)
    await new Promise(r => setTimeout(r, 800));
    setCustomers(prev => [{
      id: `C${String(prev.length + 1).padStart(3, "0")}`,
      ...form, joined: new Date().toISOString().split("T")[0],
      transactions: 0, spent: 0,
    }, ...prev]);
    setSaving(false);
    setShowModal(false);
    setForm(EMPTY);
    setErrors({});
    setToast(`${form.name} added successfully`);
    setTimeout(() => setToast(""), 3000);
  }

  function closeModal() { setShowModal(false); setForm(EMPTY); setErrors({}); }

  const initials = form.name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: 24, right: 24, zIndex: 300, background: "#ECFDF5", border: "1px solid #A7F3D0", borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, boxShadow: "0 8px 30px rgba(13,27,62,0.1)", animation: "fadeUp 0.3s ease" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          <span style={{ fontSize: 13.5, fontWeight: 600, color: "#065F46" }}>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 22, fontWeight: 700, color: "#0D1B3E", marginBottom: 4 }}>Customers</h1>
          <p style={{ color: "#8A97B0", fontSize: 14 }}>{filtered.length} customers in the directory</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-secondary btn-sm">Export</button>
          <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}
            style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Customer
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14 }}>
        {[
          { label: "Total", value: customers.length, icon: "👥", color: "#2563EB", bg: "#EFF6FF" },
          { label: "Active",   value: customers.filter(c => c.status === "Active").length,   icon: "✅", color: "#10B981", bg: "#ECFDF5" },
          { label: "Inactive", value: customers.filter(c => c.status === "Inactive").length, icon: "⏸", color: "#8A97B0", bg: "#F4F7FE" },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>{s.icon}</div>
            <div>
              <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "#8A97B0" }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid #E2E8F4", display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: "relative", flex: "1 1 200px" }}>
            <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#B0BAD0" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </span>
            <input className="inp" placeholder="Search name, email…" value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: 30, paddingTop: 7, paddingBottom: 7, fontSize: 13 }} />
          </div>
          {["All", "Active", "Inactive"].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} className="btn btn-secondary btn-sm"
              style={{ fontSize: 12, background: statusFilter === s ? "#0D1B3E" : undefined, color: statusFilter === s ? "#fff" : undefined }}>
              {s}
            </button>
          ))}
        </div>
        <div className="table-wrap">
          <table className="data-tbl">
            <thead>
              <tr>
                <th>Customer</th><th>Product</th><th>Plan</th><th>Transactions</th>
                {perms.canViewRevenue && <th style={{ textAlign: "right" }}>Spent</th>}
                <th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: "center", padding: "36px", color: "#B0BAD0" }}>No customers found</td></tr>
              ) : filtered.map(c => (
                <tr key={c.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#EFF6FF,#DBEAFE)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#2563EB", flexShrink: 0 }}>
                        {c.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("")}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#0D1B3E" }}>{c.name}</div>
                        <div style={{ fontSize: 11, color: "#B0BAD0" }}>{c.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="badge badge-blue" style={{ fontSize: 11 }}>{c.product}</span></td>
                  <td><span className={`badge ${planColor[c.plan] ?? "badge-gray"}`} style={{ fontSize: 11 }}>{c.plan}</span></td>
                  <td style={{ fontWeight: 600, color: "#0D1B3E" }}>{c.transactions}</td>
                  {perms.canViewRevenue && <td style={{ textAlign: "right", fontFamily: "monospace", fontWeight: 700, color: "#0D1B3E", fontSize: 13 }}>{fmtCurrency(c.spent, true)}</td>}
                  <td><span className={`badge ${statusColor[c.status] ?? "badge-gray"}`}>{c.status}</span></td>
                  <td><button className="btn btn-secondary btn-sm" style={{ fontSize: 11 }}>View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Add Customer Modal ───────────────────────────────────────── */}
      {showModal && (
        <>
          {/* Backdrop */}
          <div onClick={closeModal} style={{ position: "fixed", inset: 0, background: "rgba(13,27,62,0.3)", backdropFilter: "blur(4px)", zIndex: 200, animation: "fadeIn 0.2s ease" }} />

          {/* Card */}
          <div style={{ position: "fixed", inset: 0, zIndex: 201, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, pointerEvents: "none" }}>
            <div style={{ background: "#fff", borderRadius: 18, width: "100%", maxWidth: 460, boxShadow: "0 20px 60px rgba(13,27,62,0.16)", border: "1px solid #E2E8F4", pointerEvents: "all", animation: "fadeUp 0.25s cubic-bezier(0.34,1.56,0.64,1)", display: "flex", flexDirection: "column" }}>

              {/* Header */}
              <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid #F0F4FA", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    <line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 16, fontWeight: 700, color: "#0D1B3E" }}>Add New Customer</h2>
                  <p style={{ fontSize: 12, color: "#8A97B0", marginTop: 1 }}>Fill in the details below</p>
                </div>
                <button onClick={closeModal}
                  style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid #E2E8F4", background: "#F4F7FE", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#8A97B0" }}
                  onMouseEnter={e => { const el = e.currentTarget; el.style.background = "#FEF2F2"; el.style.borderColor = "#EF4444"; el.style.color = "#EF4444"; }}
                  onMouseLeave={e => { const el = e.currentTarget; el.style.background = "#F4F7FE"; el.style.borderColor = "#E2E8F4"; el.style.color = "#8A97B0"; }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>

              {/* Form body */}
              <form id="add-cust-form" onSubmit={handleSubmit}>
                <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>

                  {/* Row 1: Name */}
                  <InputField label="Full Name"  id="name"  value={form.name}  onChange={setName}  placeholder="e.g. Chioma Eze"        error={errors.name} />

                  {/* Row 2: Email + Phone side by side */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    <InputField label="Email" id="email" type="email" value={form.email} onChange={setEmail} placeholder="email@example.com" error={errors.email} />
                    <InputField label="Phone" id="phone" type="tel"   value={form.phone} onChange={setPhone} placeholder="+234 803…"          error={errors.phone} />
                  </div>

                  {/* Row 3: Product + Plan + Status in one row */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                    <SelectField label="Product" id="product" value={form.product} onChange={setProduct}
                      options={[{ value: "DuraPay", label: "DuraPay" }, { value: "DuraBiz", label: "DuraBiz" }, { value: "DuraPayment", label: "DuraPayment" }]} />
                    <SelectField label="Plan" id="plan" value={form.plan} onChange={setPlan}
                      options={[{ value: "Free", label: "Free" }, { value: "Standard", label: "Standard" }, { value: "Premium", label: "Premium" }, { value: "Business", label: "Business" }, { value: "Enterprise", label: "Enterprise" }]} />
                    <SelectField label="Status" id="status" value={form.status} onChange={setStatus}
                      options={[{ value: "Active", label: "Active" }, { value: "Inactive", label: "Inactive" }]} />
                  </div>

                  {/* Live preview — only shown when name typed */}
                  {form.name.trim() && (
                    <div style={{ padding: "10px 12px", background: "#F8FAFF", border: "1px solid #DBEAFE", borderRadius: 10, display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg,#2563EB,#4F46E5)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                        {initials || "?"}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 12.5, fontWeight: 600, color: "#0D1B3E", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{form.name}</p>
                        <p style={{ fontSize: 11, color: "#8A97B0" }}>{form.product} · {form.plan}</p>
                      </div>
                      <span className={`badge badge-${form.status === "Active" ? "green" : "gray"}`} style={{ fontSize: 10 }}>{form.status}</span>
                    </div>
                  )}
                </div>
              </form>

              {/* Footer */}
              <div style={{ padding: "12px 20px 16px", borderTop: "1px solid #F0F4FA", display: "flex", gap: 8, justifyContent: "flex-end", background: "#FAFBFF", borderRadius: "0 0 18px 18px" }}>
                <button type="button" onClick={closeModal} className="btn btn-secondary" style={{ fontSize: 13, padding: "8px 18px" }} disabled={saving}>Cancel</button>
                <button type="submit" form="add-cust-form" className="btn btn-primary" disabled={saving}
                  style={{ fontSize: 13, padding: "8px 20px", minWidth: 120, justifyContent: "center", display: "flex", alignItems: "center", gap: 7 }}>
                  {saving
                    ? <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: "spin 0.8s linear infinite" }}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>Saving…</>
                    : <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>Add Customer</>}
                </button>
              </div>

            </div>
          </div>
        </>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
