"use client";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { Topbar } from "@/components/topbar";
import { MobileNav } from "@/components/mobile-nav";
import { useApp } from "@/lib/store";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, hydrated } = useApp();
  const router  = useRouter();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Auth guard — only fires after localStorage rehydrated
  useEffect(() => {
    if (hydrated && !user) router.replace("/");
  }, [user, hydrated, router]);

  // Close drawer on navigation
  useEffect(() => { setDrawerOpen(false); }, [pathname]);

  if (!hydrated) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"var(--bg)", flexDirection:"column", gap:14 }}>
      <div style={{ width:42, height:42, borderRadius:"50%", border:"3px solid var(--border)", borderTopColor:"var(--accent)", animation:"spin 0.75s linear infinite" }} />
      <p style={{ color:"var(--text-3)", fontSize:13, fontWeight:500 }}>Loading dashboard…</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!user) return null;

  return (
    <div style={{ display:"flex", height:"100vh", overflow:"hidden", background:"var(--bg)" }}>

      {/* ─── Desktop sidebar (hidden on mobile) ─── */}
      <div className="d-sidebar">
        <DashboardSidebar />
      </div>

      {/* ─── Mobile full-screen drawer ─── */}
      {drawerOpen && (
        <div style={{ position:"fixed", inset:0, zIndex:200 }}>
          {/* Backdrop */}
          <div
            onClick={() => setDrawerOpen(false)}
            style={{ position:"absolute", inset:0, background:"rgba(10,20,50,0.55)", backdropFilter:"blur(4px)", WebkitBackdropFilter:"blur(4px)" }}
          />
          {/* Drawer panel */}
          <div style={{ position:"absolute", left:0, top:0, bottom:0, width:"min(300px,82vw)", zIndex:201, animation:"drawerIn 0.26s cubic-bezier(0.32,0.72,0,1) both" }}>
            <DashboardSidebar mobile onClose={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}

      {/* ─── Main content area ─── */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0, height:"100vh", overflow:"hidden" }}>
        {/* Sticky topbar */}
        <Topbar onMenuClick={() => setDrawerOpen(true)} />

        {/* Scrollable page content */}
        <main className="main-scroll" style={{ flex:1, overflowY:"auto", overflowX:"hidden" }}>
          <div className="page-wrap">
            {children}
          </div>
          {/* Bottom spacing for mobile nav bar */}
          <div className="mobile-bottom-pad" />
        </main>

        {/* ─── Mobile bottom navigation bar ─── */}
        <MobileNav />
      </div>

      <style>{`
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes drawerIn { from { transform:translateX(-100%); } to { transform:translateX(0); } }

        /* Desktop sidebar visible, mobile nav hidden */
        .d-sidebar   { flex-shrink:0; }
        .mobile-nav  { display:none; }
        .mobile-bottom-pad { display:none; }

        .page-wrap {
          max-width: 1400px;
          margin: 0 auto;
          padding: 24px 24px 40px;
        }

        /* ── Tablet ── */
        @media (max-width: 1024px) {
          .page-wrap { padding: 20px 16px 36px; }
        }

        /* ── Mobile ── */
        @media (max-width: 768px) {
          .d-sidebar          { display: none !important; }
          .mobile-nav         { display: flex !important; }
          .mobile-bottom-pad  { display: block !important; height: 80px; }
          .page-wrap          { padding: 14px 12px 16px; }
        }

        @media (max-width: 480px) {
          .page-wrap { padding: 12px 10px 14px; }
        }
      `}</style>
    </div>
  );
}
