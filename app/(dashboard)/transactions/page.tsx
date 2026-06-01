"use client";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { getPerms } from "@/lib/auth";
import { TRANSACTIONS } from "@/lib/mock-data";
import { fmtCurrency, fmtDate } from "@/lib/utils";

const STATUS_OPTS = ["All", "Completed", "Pending", "Failed"];
const txStatusColor: Record<string, string> = { Completed: "badge-green", Pending: "badge-amber", Failed: "badge-red" };

export default function TransactionsPage() {
  const { user, product } = useApp();
  if (!user) return null;
  const perms = getPerms(user.role);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [page, setPage]     = useState(1);
  const PER_PAGE = 6;

  const filtered = TRANSACTIONS.filter(tx => {
    const q = search.toLowerCase();
    const matchSearch = !q || tx.id.toLowerCase().includes(q) || tx.customer.toLowerCase().includes(q) || tx.email.toLowerCase().includes(q);
    const matchStatus = status === "All" || tx.status === status;
    return matchSearch && matchStatus;
  });
  const total = filtered.length;
  const pages = Math.ceil(total / PER_PAGE);
  const shown = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 22, fontWeight: 700, color: "#0D1B3E", marginBottom: 4 }}>Transactions</h1>
          <p style={{ color: "#8A97B0", fontSize: 14 }}>{total} total transactions found</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-secondary btn-sm">Export CSV</button>
          <button className="btn btn-secondary btn-sm">Filter</button>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {/* Toolbar */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #E2E8F4", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: "1 1 220px" }}>
            <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#B0BAD0" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </span>
            <input className="inp" placeholder="Search ID, customer, email…" value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              style={{ paddingLeft: 32, paddingTop: 8, paddingBottom: 8, fontSize: 13 }} />
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {STATUS_OPTS.map(s => (
              <button key={s} onClick={() => { setStatus(s); setPage(1); }}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: 12, background: status === s ? "#0D1B3E" : undefined, color: status === s ? "#fff" : undefined, borderColor: status === s ? "#0D1B3E" : undefined }}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="table-wrap">
          <table className="data-tbl">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Date</th>
                <th>Method</th>
                <th style={{ textAlign: "right" }}>{perms.canViewRevenue ? "Amount" : "Amount"}</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {shown.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: "40px", color: "#B0BAD0" }}>No transactions found</td></tr>
              ) : shown.map(tx => (
                <tr key={tx.id} className="animate-fade-in">
                  <td><span style={{ fontFamily: "monospace", fontSize: 12, color: "#2563EB", fontWeight: 600 }}>{tx.id}</span></td>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: 13, color: "#0D1B3E" }}>{tx.customer}</div>
                    <div style={{ fontSize: 11, color: "#B0BAD0" }}>{tx.email}</div>
                  </td>
                  <td><span className="badge badge-blue" style={{ fontSize: 11 }}>{tx.product}</span></td>
                  <td style={{ fontSize: 12, color: "#4A5568" }}>{fmtDate(tx.date)}</td>
                  <td style={{ fontSize: 12 }}>{tx.method}</td>
                  <td style={{ textAlign: "right", fontFamily: "monospace", fontWeight: 700, color: "#0D1B3E", fontSize: 13 }}>
                    {perms.canViewRevenue ? fmtCurrency(tx.amount, true) : <span style={{ color: "#B0BAD0" }}>Restricted</span>}
                  </td>
                  <td><span className={`badge ${txStatusColor[tx.status] ?? "badge-gray"}`}>{tx.status}</span></td>
                  <td>
                    <button className="btn btn-secondary btn-sm" style={{ fontSize: 11 }}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ padding: "14px 20px", borderTop: "1px solid #E2E8F4", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
          <span style={{ fontSize: 12, color: "#8A97B0" }}>Showing {Math.min((page - 1) * PER_PAGE + 1, total)}–{Math.min(page * PER_PAGE, total)} of {total}</span>
          <div style={{ display: "flex", gap: 6 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Prev</button>
            {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} className="btn btn-secondary btn-sm"
                style={{ minWidth: 32, background: page === p ? "#2563EB" : undefined, color: page === p ? "#fff" : undefined }}>
                {p}
              </button>
            ))}
            <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}>Next →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
