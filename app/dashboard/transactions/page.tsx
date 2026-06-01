"use client";
import { useState, useMemo } from "react";
import { useApp } from "@/lib/store";
import { getPerms } from "@/lib/auth";
import { fmtCurrency, fmtDate } from "@/lib/utils";
import { useTransactions } from "@/lib/use-product-api";
import { LoadingRows, ErrorBanner, ProductBanner } from "@/components/ui/data-state";

const STATUS_OPTS = ["All", "Completed", "Pending", "Failed"];
const STATUS_CLS: Record<string, string> = { Completed: "badge-green", Pending: "badge-amber", Failed: "badge-red" };
const STATUS_DOT: Record<string, string> = { Completed: "#10B981", Pending: "#F59E0B", Failed: "#EF4444" };

export default function TransactionsPage() {
  const { user, product } = useApp();
  if (!user) return null;
  const perms = getPerms(user.role);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [page,   setPage]   = useState(1);
  const PER_PAGE = 8;

  // Build query params — sent to Laravel so it can filter server-side
  const params = useMemo(() => {
    const p: Record<string, string> = { page: String(page), limit: String(PER_PAGE) };
    if (search) p.search = search;
    if (status !== "All") p.status = status;
    return p;
  }, [page, search, status]);

  const { data: raw, loading, error, refetch } = useTransactions(params);

  // Support both paginated { data: [], total } and plain array responses
  const rows  = Array.isArray(raw)       ? raw         : ((raw as any)?.data  ?? []);
  const total = (raw as any)?.total      ?? rows.length;

  // Client-side filter as fallback when backend doesn't filter
  const filtered = useMemo(() => rows.filter((tx: any) => {
    const q = search.toLowerCase();
    return (!q || tx.id?.toLowerCase().includes(q) || tx.customer?.toLowerCase().includes(q) || tx.email?.toLowerCase().includes(q))
      && (status === "All" || tx.status === status);
  }), [rows, search, status]);

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const shown = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function exportCSV() {
    const hdr = "ID,Customer,Email,Product,Date,Amount,Method,Status";
    const body = filtered.map((tx: any) =>
      [tx.id, tx.customer, tx.email, tx.product, fmtDate(tx.date), perms.canViewRevenue ? fmtCurrency(tx.amount) : "—", tx.method, tx.status].join(",")
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([[hdr, ...body].join("\n")], { type: "text/csv" }));
    a.download = `${product}-transactions.csv`; a.click();
  }

  const stats = [
    { label: "Total",     value: filtered.length,                                        color: "var(--accent)" },
    { label: "Completed", value: filtered.filter((t: any) => t.status === "Completed").length, color: "var(--green)"  },
    { label: "Pending",   value: filtered.filter((t: any) => t.status === "Pending").length,   color: "var(--amber)"  },
    { label: "Failed",    value: filtered.filter((t: any) => t.status === "Failed").length,     color: "var(--red)"    },
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>

      {/* Header */}
      <div className="animate-fade-up" style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4, flexWrap:"wrap" }}>
            <h1 style={{ fontFamily:"'Sora',sans-serif", fontSize:"clamp(18px,4vw,24px)", fontWeight:700, color:"var(--text)", margin:0 }}>Transactions</h1>
            <ProductBanner product={product} loading={loading} />
          </div>
          <p style={{ color:"var(--text-3)", fontSize:13.5 }}>{total} total records from {product === "durapayment" ? "DuraPayment" : product === "durapay" ? "DuraPay" : "DuraBiz"}</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={exportCSV}>↓ Export CSV</button>
      </div>

      {error && <ErrorBanner message={error} onRetry={refetch} />}

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))", gap:10 }} className="animate-fade-up stagger-1">
        {stats.map(s => (
          <div key={s.label} className="card" style={{ padding:"13px 15px", display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:s.color, flexShrink:0 }} />
            <div>
              <div style={{ fontFamily:"'Sora',sans-serif", fontSize:20, fontWeight:700, color:"var(--text)", lineHeight:1 }}>{s.value}</div>
              <div style={{ fontSize:11.5, color:"var(--text-3)", marginTop:3 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card animate-fade-up stagger-2" style={{ padding:0, overflow:"hidden" }}>
        {/* Toolbar */}
        <div style={{ padding:"13px 16px", borderBottom:"1px solid var(--border)", display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
          <div style={{ position:"relative", flex:"1 1 180px" }}>
            <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"var(--text-3)", display:"flex" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </span>
            <input className="inp" placeholder="Search ID, customer, email…" value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              style={{ paddingLeft:30, paddingTop:7, paddingBottom:7, fontSize:13 }} />
          </div>
          <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
            {STATUS_OPTS.map(s => (
              <button key={s} onClick={() => { setStatus(s); setPage(1); }}
                className="btn btn-secondary btn-sm"
                style={{ fontSize:11.5, background:status===s?"var(--text)":undefined, color:status===s?"#fff":undefined }}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {loading && rows.length === 0 ? (
          <LoadingRows rows={6} cols={6} />
        ) : (
          <div style={{ overflowX:"auto", WebkitOverflowScrolling:"touch" as any }}>
            <table className="data-tbl" style={{ minWidth:620 }}>
              <thead>
                <tr>
                  <th>Transaction ID</th><th>Customer</th><th>Product</th>
                  <th>Date</th>
                  {perms.canViewRevenue && <th>Amount</th>}
                  <th>Method</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {shown.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign:"center", padding:40, color:"var(--text-3)" }}>No transactions found</td></tr>
                ) : shown.map((tx: any) => (
                  <tr key={tx.id}>
                    <td style={{ fontFamily:"monospace", fontWeight:600, color:"var(--accent)", fontSize:12 }}>{tx.id}</td>
                    <td>
                      <div style={{ fontWeight:500, fontSize:13, color:"var(--text)" }}>{tx.customer}</div>
                      <div style={{ fontSize:11.5, color:"var(--text-3)" }}>{tx.email}</div>
                    </td>
                    <td><span className="badge badge-blue">{tx.product}</span></td>
                    <td style={{ fontSize:12, color:"var(--text-3)" }}>{fmtDate(tx.date)}</td>
                    {perms.canViewRevenue && <td style={{ fontWeight:700, color:"var(--text)" }}>{fmtCurrency(tx.amount, true)}</td>}
                    <td style={{ fontSize:12.5 }}>{tx.method}</td>
                    <td>
                      <span className={`badge ${STATUS_CLS[tx.status] ?? "badge-gray"}`}>
                        <span style={{ width:5, height:5, borderRadius:"50%", background:STATUS_DOT[tx.status], display:"inline-block" }} />
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"11px 16px", borderTop:"1px solid var(--border)", flexWrap:"wrap", gap:8 }}>
          <span style={{ fontSize:12, color:"var(--text-3)" }}>
            {Math.min((page-1)*PER_PAGE+1, filtered.length)}–{Math.min(page*PER_PAGE, filtered.length)} of {filtered.length}
          </span>
          <div style={{ display:"flex", gap:4 }}>
            <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1} className="btn btn-secondary btn-sm" style={{ fontSize:12 }}>← Prev</button>
            {Array.from({length:Math.min(pages,5)},(_,i)=>i+1).map(p=>(
              <button key={p} onClick={()=>setPage(p)} className="btn btn-secondary btn-sm"
                style={{ fontSize:12, background:page===p?"var(--text)":undefined, color:page===p?"#fff":undefined, minWidth:32 }}>{p}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(pages,p+1))} disabled={page===pages} className="btn btn-secondary btn-sm" style={{ fontSize:12 }}>Next →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
