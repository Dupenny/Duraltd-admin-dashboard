"use client";
import { useState, useEffect } from "react";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { Topbar } from "@/components/topbar";
import { useApp } from "@/lib/store";
import { useRouter } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, hydrated } = useApp();
  const router = useRouter();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    // Only redirect after localStorage has been read (hydrated).
    // Without this guard, the dashboard sees user=null for a split second on every
    // refresh (before useEffect in AppProvider runs) and incorrectly redirects to login.
    if (hydrated && !user) {
      router.replace("/");
    }
  }, [user, hydrated, router]);

  // Show a loading screen while rehydrating — prevents the flash-to-login
  if (!hydrated) {
    return (
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#F4F7FE" }}>
        <div style={{ textAlign:"center" }}>
          <div style={{ width:40, height:40, borderRadius:"50%", border:"3px solid #E2E8F4", borderTopColor:"#2563EB", animation:"spin 0.8s linear infinite", margin:"0 auto 12px" }} />
          <p style={{ color:"#8A97B0", fontSize:14 }}>Loading…</p>
        </div>
        <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div style={{ display:"flex", height:"100vh", overflow:"hidden", background:"#F4F7FE" }}>
      {/* Desktop sidebar */}
      <div style={{ display:"flex", flexShrink:0 }} className="desktop-sidebar">
        <DashboardSidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div style={{ position:"fixed", inset:0, zIndex:50, display:"flex" }}>
          <div style={{ position:"absolute", inset:0, background:"rgba(13,27,62,0.3)", backdropFilter:"blur(2px)" }}
            onClick={() => setMobileSidebarOpen(false)} />
          <div style={{ position:"relative", zIndex:51, maxWidth:280, width:"80%" }}>
            <DashboardSidebar mobile onClose={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main area */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0, height:"100vh", overflow:"hidden" }}>
        <div style={{ flexShrink:0, position:"sticky", top:0, zIndex:30 }}>
          <Topbar onMenuClick={() => setMobileSidebarOpen(true)} />
        </div>
        <main style={{ flex:1, overflowY:"auto", overflowX:"hidden" }}>
          <div style={{ maxWidth:1300, margin:"0 auto", padding:"24px 24px 40px" }}>
            {children}
          </div>
        </main>
      </div>

      <style>{`
        @keyframes spin { to { transform:rotate(360deg); } }
        @media (max-width: 768px) {
          .desktop-sidebar { display: none !important; }
        }
      `}</style>
    </div>
  );
}
