"use client";
import { useState, useMemo } from "react";
import { useApp } from "@/lib/store";
import { getPerms } from "@/lib/auth";
import { fmtDate } from "@/lib/utils";
import { useIssues } from "@/lib/use-product-api";
import { issuesApi, IssueStatus } from "@/lib/api/client";
import { LoadingRows, ErrorBanner, ProductBanner } from "@/components/ui/data-state";

const PRIORITY_CLS: Record<string,string> = { High:"badge-red", Medium:"badge-amber", Low:"badge-green" };
const STATUS_META: Record<string,{cls:string;label:string;dot:string}> = {
  TODO:        { cls:"badge-amber", label:"To Do",       dot:"#F59E0B" },
  IN_PROGRESS: { cls:"badge-blue",  label:"In Progress", dot:"#2563EB" },
  DONE:        { cls:"badge-green", label:"Done",        dot:"#10B981" },
  CANCELED:    { cls:"badge-gray",  label:"Canceled",    dot:"#94A3B8" },
};
const TABS = ["All","TODO","IN_PROGRESS","DONE","CANCELED"];
const TAB_LABELS: Record<string,string> = { All:"All", TODO:"To Do", IN_PROGRESS:"In Progress", DONE:"Done", CANCELED:"Canceled" };

export default function IssuesPage() {
  const { user, product } = useApp();
  if (!user) return null;
  const perms = getPerms(user.role);
  const [tab,      setTab]      = useState("All");
  const [updating, setUpdating] = useState<string | null>(null);

  const params = useMemo(() => tab !== "All" ? { status: tab } : {}, [tab]);
  const { data: raw, loading, error, refetch } = useIssues(params);

  const allIssues = Array.isArray(raw) ? raw : ((raw as any)?.data ?? []);
  const filtered  = tab === "All" ? allIssues : allIssues.filter((i: any) => i.status === tab);

  const counts = TABS.reduce((acc, t) => {
    acc[t] = t === "All" ? allIssues.length : allIssues.filter((i: any) => i.status === t).length;
    return acc;
  }, {} as Record<string, number>);

  async function updateStatus(id: string, status: IssueStatus) {
    setUpdating(id);
    // Call real API — refetch on success
    const result = await issuesApi.updateStatus(product, id, status);
    if (!result.error) {
      await refetch();
    }
    setUpdating(null);
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
      <div className="animate-fade-up" style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4, flexWrap:"wrap" }}>
            <h1 style={{ fontFamily:"'Sora',sans-serif", fontSize:"clamp(18px,4vw,24px)", fontWeight:700, color:"var(--text)", margin:0 }}>Support Issues</h1>
            <ProductBanner product={product} loading={loading} />
          </div>
          <p style={{ color:"var(--text-3)", fontSize:13.5 }}>
            {allIssues.filter((i: any) => i.status === "TODO" || i.status === "IN_PROGRESS").length} open issues — {product === "durapayment" ? "DuraPayment" : product === "durapay" ? "DuraPay" : "DuraBiz"}
          </p>
        </div>
        {perms.canManageIssues && (
          <button className="btn btn-primary btn-sm">+ New Issue</button>
        )}
      </div>

      {error && <ErrorBanner message={error} onRetry={refetch} />}

      {/* Tabs */}
      <div className="animate-fade-up stagger-1" style={{ display:"flex", gap:4, flexWrap:"wrap", background:"var(--surface)", borderRadius:12, padding:4, border:"1px solid var(--border)", width:"fit-content" }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding:"7px 13px", borderRadius:9, border:"none", cursor:"pointer", fontSize:12, fontWeight:tab===t?600:400, transition:"all 0.15s", background:tab===t?"var(--text)":"transparent", color:tab===t?"#fff":"var(--text-2)", display:"flex", alignItems:"center", gap:5 }}>
            {TAB_LABELS[t]}
            <span style={{ background:tab===t?"rgba(255,255,255,0.2)":"var(--surface-2)", color:tab===t?"#fff":"var(--text-3)", borderRadius:20, padding:"0 6px", fontSize:10, fontWeight:700 }}>{counts[t]??0}</span>
          </button>
        ))}
      </div>

      {/* Issue cards */}
      <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
        {loading && allIssues.length === 0 ? (
          <div className="card" style={{ padding:0, overflow:"hidden" }}><LoadingRows rows={4} cols={3} /></div>
        ) : filtered.length === 0 ? (
          <div className="card" style={{ textAlign:"center", padding:48 }}>
            <div style={{ fontSize:36, marginBottom:10 }}>✅</div>
            <p style={{ color:"var(--text-3)", fontSize:14 }}>No issues in this category</p>
          </div>
        ) : filtered.map((issue: any, i: number) => {
          const sm = STATUS_META[issue.status] ?? STATUS_META.TODO;
          return (
            <div key={issue.id} className={`card animate-fade-up stagger-${Math.min(i+2,6)}`} style={{ padding:"15px 18px" }}>
              <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12, flexWrap:"wrap" }}>
                <div style={{ flex:1, minWidth:220 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:7, flexWrap:"wrap" }}>
                    <span style={{ fontFamily:"monospace", fontSize:11.5, color:"var(--text-3)", fontWeight:600 }}>{issue.id}</span>
                    <span className={`badge ${PRIORITY_CLS[issue.priority]??"badge-gray"}`}>{issue.priority}</span>
                    <span className={`badge ${sm.cls}`}><span style={{ width:5,height:5,borderRadius:"50%",background:sm.dot,display:"inline-block" }}/> {sm.label}</span>
                    <span className="badge badge-blue">{issue.product}</span>
                  </div>
                  <p style={{ fontWeight:600, color:"var(--text)", fontSize:13.5, marginBottom:7 }}>{issue.subject}</p>
                  <div style={{ display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }}>
                    <span style={{ fontSize:12, color:"var(--text-3)" }}>👤 {issue.customer}</span>
                    {issue.assignee && <span style={{ fontSize:12, color:"var(--text-3)" }}>🛡️ {issue.assignee}</span>}
                    <span style={{ fontSize:11.5, color:"var(--text-3)" }}>{fmtDate(issue.date, "long")}</span>
                  </div>
                </div>
                {perms.canManageIssues && issue.status !== "DONE" && issue.status !== "CANCELED" && (
                  <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                    {issue.status === "TODO" && (
                      <button disabled={updating === issue.id} onClick={() => updateStatus(issue.id, "IN_PROGRESS")}
                        className="btn btn-secondary btn-sm" style={{ fontSize:11.5 }}>
                        → In Progress
                      </button>
                    )}
                    <button disabled={updating === issue.id} onClick={() => updateStatus(issue.id, "DONE")}
                      className="btn btn-sm" style={{ background:"var(--green-bg)", color:"var(--green)", border:"1px solid var(--green)", fontSize:11.5, borderRadius:8 }}>
                      {updating === issue.id ? "…" : "✓ Resolve"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
