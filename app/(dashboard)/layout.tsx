"use client";
import { useState } from "react";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { Topbar } from "@/components/topbar";
import { useApp } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = useApp();
  const router = useRouter();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (!user) router.replace("/login");
  }, [user, router]);

  if (!user) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F4F7FE" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid #E2E8F4", borderTopColor: "#2563EB", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
        <p style={{ color: "#8A97B0", fontSize: 14 }}>Loading dashboard…</p>
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#F4F7FE" }}>
      {/* Desktop sidebar — sticky by its own position:sticky + height:100vh */}
      <div style={{ display: "flex", flexShrink: 0 }} className="desktop-sidebar">
        <DashboardSidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex" }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(13,27,62,0.3)", backdropFilter: "blur(2px)" }}
            onClick={() => setMobileSidebarOpen(false)} />
          <div style={{ position: "relative", zIndex: 51, maxWidth: 280, width: "80%" }}>
            <DashboardSidebar mobile onClose={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main area — fills remaining width, scrolls independently */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, height: "100vh", overflow: "hidden" }}>
        {/* Sticky topbar — stays at top while content scrolls below */}
        <div style={{ flexShrink: 0, position: "sticky", top: 0, zIndex: 30 }}>
          <Topbar onMenuClick={() => setMobileSidebarOpen(true)} />
        </div>

        {/* Scrollable page content */}
        <main style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
          <div style={{ maxWidth: 1300, margin: "0 auto", padding: "24px 24px 40px" }}>
            {children}
          </div>
        </main>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .desktop-sidebar { display: none !important; }
        }
      `}</style>
    </div>
  );
}
