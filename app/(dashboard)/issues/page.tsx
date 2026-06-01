"use client";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { ISSUES } from "@/lib/mock-data";
import { fmtDate } from "@/lib/utils";

type IssueStatus = "TODO" | "IN_PROGRESS" | "DONE" | "CANCELED";
const STATUS_OPTS = ["All", "TODO", "IN_PROGRESS", "DONE", "CANCELED"];
const PRIO_OPTS   = ["All", "High", "Medium", "Low"];

const statusColor: Record<string, string>  = { TODO: "badge-amber", IN_PROGRESS: "badge-blue", DONE: "badge-green", CANCELED: "badge-gray" };
const statusLabel: Record<string, string>  = { TODO: "TODO", IN_PROGRESS: "In Progress", DONE: "Done", CANCELED: "Canceled" };
const prioColor: Record<string, string>    = { High: "badge-red", Medium: "badge-amber", Low: "badge-indigo" };
const NEXT_STATUS: Record<IssueStatus, IssueStatus[]> = {
  TODO: ["IN_PROGRESS", "CANCELED"],
  IN_PROGRESS: ["DONE", "CANCELED"],
  DONE: [],
  CANCELED: [],
};

export default function IssuesPage() {
  const { user } = useApp();
  if (!user) return null;
  const [issues, setIssues]   = useState(ISSUES);
  const [search, setSearch]   = useState("");
  const [status, setStatus]   = useState("All");
  const [prio, setPrio]       = useState("All");
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = issues.filter(i => {
    const q = search.toLowerCase();
    const ms = !q || i.subject.toLowerCase().includes(q) || i.customer.toLowerCase().includes(q) || i.id.toLowerCase().includes(q);
    const mst = status === "All" || i.status === status;
    const mp  = prio === "All" || i.priority === prio;
    return ms && mst && mp;
  });

  function updateStatus(id: string, newStatus: IssueStatus) {
    setIssues(prev => prev.map(i => i.id === id ? { ...i, status: newStatus } : i));
  }

  const selectedIssue = selected ? issues.find(i => i.id === selected) : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 22, fontWeight: 700, color: "#0D1B3E", marginBottom: 4 }}>Support Issues</h1>
          <p style={{ color: "#8A97B0", fontSize: 14 }}>{filtered.length} issues · manage & update ticket status</p>
        </div>
        <button className="btn btn-primary btn-sm">+ New Issue</button>
      </div>

      {/* Status summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12 }}>
        {[
          { label: "TODO",        count: issues.filter(i=>i.status==="TODO").length,        color: "#F59E0B", bg: "#FFFBEB" },
          { label: "In Progress", count: issues.filter(i=>i.status==="IN_PROGRESS").length, color: "#2563EB", bg: "#EFF6FF" },
          { label: "Done",        count: issues.filter(i=>i.status==="DONE").length,        color: "#10B981", bg: "#ECFDF5" },
          { label: "Canceled",    count: issues.filter(i=>i.status==="CANCELED").length,    color: "#EF4444", bg: "#FEF2F2" },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: "16px 18px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}
            onClick={() => setStatus(s.label === "In Progress" ? "IN_PROGRESS" : s.label.toUpperCase() === s.label ? s.label : s.label.toUpperCase())}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 16, color: s.color, flexShrink: 0 }}>{s.count}</div>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#4A5568" }}>{s.label}</span>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: selectedIssue ? "1fr 380px" : "1fr", gap: 20, alignItems: "start" }}>
        {/* Table */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #E2E8F4", display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ position: "relative", flex: "1 1 200px" }}>
              <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#B0BAD0" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </span>
              <input className="inp" placeholder="Search issues…" value={search} onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: 32, paddingTop: 8, paddingBottom: 8, fontSize: 13 }} />
            </div>
            <select className="inp" value={status} onChange={e => setStatus(e.target.value)} style={{ maxWidth: 140, paddingTop: 8, paddingBottom: 8, fontSize: 13, cursor: "pointer" }}>
              {STATUS_OPTS.map(s => <option key={s} value={s}>{s === "IN_PROGRESS" ? "In Progress" : s}</option>)}
            </select>
            <select className="inp" value={prio} onChange={e => setPrio(e.target.value)} style={{ maxWidth: 120, paddingTop: 8, paddingBottom: 8, fontSize: 13, cursor: "pointer" }}>
              {PRIO_OPTS.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div className="table-wrap">
            <table className="data-tbl">
              <thead>
                <tr>
                  <th>Issue</th>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: "center", padding: "40px", color: "#B0BAD0" }}>No issues found</td></tr>
                ) : filtered.map(iss => (
                  <tr key={iss.id} style={{ cursor: "pointer" }} onClick={() => setSelected(iss.id === selected ? null : iss.id)}>
                    <td>
                      <div style={{ fontFamily: "monospace", fontSize: 11, color: "#2563EB", marginBottom: 2 }}>{iss.id}</div>
                      <div style={{ fontSize: 12.5, fontWeight: 500, color: "#0D1B3E", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{iss.subject}</div>
                    </td>
                    <td style={{ fontSize: 12.5, color: "#4A5568" }}>{iss.customer}</td>
                    <td><span className="badge badge-blue" style={{ fontSize: 11 }}>{iss.product}</span></td>
                    <td><span className={`badge ${prioColor[iss.priority] ?? "badge-gray"}`}>{iss.priority}</span></td>
                    <td><span className={`badge ${statusColor[iss.status] ?? "badge-gray"}`}>{statusLabel[iss.status]}</span></td>
                    <td style={{ fontSize: 11, color: "#B0BAD0" }}>{fmtDate(iss.date)}</td>
                    <td onClick={e => e.stopPropagation()}>
                      <div style={{ display: "flex", gap: 5 }}>
                        {NEXT_STATUS[iss.status as IssueStatus]?.map(ns => (
                          <button key={ns} className="btn btn-secondary btn-sm"
                            onClick={() => updateStatus(iss.id, ns)}
                            style={{ fontSize: 10.5, padding: "4px 8px", background: ns === "DONE" ? "#ECFDF5" : ns === "CANCELED" ? "#FEF2F2" : undefined, color: ns === "DONE" ? "#10B981" : ns === "CANCELED" ? "#EF4444" : undefined }}>
                            {statusLabel[ns]}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail panel */}
        {selectedIssue && (
          <div className="card animate-slide-in" style={{ position: "sticky", top: 80 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <span style={{ fontFamily: "'Sora',sans-serif", fontSize: 15, fontWeight: 700, color: "#0D1B3E" }}>Issue Detail</span>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#8A97B0", fontSize: 18 }}>✕</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#B0BAD0", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Issue ID</p>
                <p style={{ fontFamily: "monospace", fontSize: 14, color: "#2563EB", fontWeight: 700 }}>{selectedIssue.id}</p>
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#B0BAD0", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Subject</p>
                <p style={{ fontSize: 14, color: "#0D1B3E", fontWeight: 500, lineHeight: 1.5 }}>{selectedIssue.subject}</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#B0BAD0", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Customer</p>
                  <p style={{ fontSize: 13, color: "#0D1B3E", fontWeight: 500 }}>{selectedIssue.customer}</p>
                  <p style={{ fontSize: 11, color: "#B0BAD0" }}>{selectedIssue.email}</p>
                </div>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#B0BAD0", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Product</p>
                  <span className="badge badge-blue">{selectedIssue.product}</span>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#B0BAD0", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Priority</p>
                  <span className={`badge ${prioColor[selectedIssue.priority]}`}>{selectedIssue.priority}</span>
                </div>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#B0BAD0", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Status</p>
                  <span className={`badge ${statusColor[selectedIssue.status]}`}>{statusLabel[selectedIssue.status]}</span>
                </div>
              </div>
              {selectedIssue.assignee && (
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#B0BAD0", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Assignee</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 26, height: 26, borderRadius: 7, background: "#ECFDF5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#10B981" }}>
                      {selectedIssue.assignee.split(" ").map(n=>n[0]).join("")}
                    </div>
                    <span style={{ fontSize: 13, color: "#4A5568" }}>{selectedIssue.assignee}</span>
                  </div>
                </div>
              )}
              <div style={{ borderTop: "1px solid #E2E8F4", paddingTop: 14 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#B0BAD0", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Update Status</p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {(["TODO","IN_PROGRESS","DONE","CANCELED"] as IssueStatus[]).map(s => (
                    <button key={s} onClick={() => updateStatus(selectedIssue.id, s)}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: 11, background: selectedIssue.status === s ? "#0D1B3E" : undefined, color: selectedIssue.status === s ? "#fff" : undefined }}>
                      {statusLabel[s]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
