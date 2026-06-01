"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DEMO_USERS, MOCK_OTP } from "@/lib/auth";
import { useApp } from "@/lib/store";
import { validateLogin, validateOtp } from "@/lib/validations/auth";

const SESSION_KEY = "dura_admin_session";

type Step = "credentials" | "otp" | "product";
const PRODUCTS = [
  { id: "durapayment", name: "DuraPayment", desc: "Payment gateway & merchant tools", icon: "💳", accent: "#2563EB", light: "#EFF6FF" },
  { id: "durapay",     name: "DuraPay",     desc: "Personal banking & transfers",    icon: "🏦", accent: "#10B981", light: "#ECFDF5" },
  { id: "durabiz",     name: "DuraBiz",     desc: "Business banking & payroll",      icon: "🏢", accent: "#7C3AED", light: "#F5F3FF" },
];

export default function LoginPage() {
  const router = useRouter();
  const { setUser, setProduct } = useApp();
  const [step, setStep]         = useState<Step>("credentials");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp]           = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [errors, setErrors]     = useState<Record<string, string>>({});
  const [loading, setLoading]   = useState(false);
  const [timer, setTimer]       = useState(0);
  const [pendingUser, setPending] = useState<(typeof DEMO_USERS)[string] | null>(null);

  useEffect(() => {
    if (timer <= 0) return;
    const t = setTimeout(() => setTimer(v => v - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  async function submitLogin(e: React.FormEvent) {
    e.preventDefault();
    const errs = validateLogin({ email, password });
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    const found = DEMO_USERS[email.toLowerCase()];
    if (!found || found.password !== password) {
      setErrors({ password: "Invalid email or password." });
      setLoading(false); return;
    }
    setPending(found);
    setTimer(60);
    setStep("otp");
    setLoading(false);
  }

  async function submitOtp(e: React.FormEvent) {
    e.preventDefault();
    const errs = validateOtp({ code: otp });
    if (Object.keys(errs).length) { setErrors(errs); return; }
    if (otp !== MOCK_OTP) { setErrors({ code: "Incorrect verification code. Demo OTP: 123456" }); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    if (pendingUser) {
      const { password: _, ...userData } = pendingUser;
      setUser(userData);
    }
    setStep("product");
    setLoading(false);
  }

  async function resendOtp() {
    if (timer > 0) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    setTimer(60);
    setLoading(false);
  }

  function pickProduct(id: string) {
    const prod = id as "durapayment" | "durapay" | "durabiz";
    setProduct(prod);
    // Persist session to localStorage so refresh doesn't log out
    if (pendingUser) {
      const { password: _, ...userData } = pendingUser;
      localStorage.setItem(SESSION_KEY, JSON.stringify({ user: { ...userData }, product: prod }));
    }
    router.push("/dashboard");
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(145deg, #F4F7FE 0%, #EBF0FC 40%, #F0ECF8 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "20px", position: "relative", overflow: "hidden",
    }}>
      {/* Decorative blobs */}
      <div style={{ position:"fixed", top:"-15%", right:"-8%", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle, rgba(37,99,235,0.07), transparent 70%)", pointerEvents:"none" }} />
      <div style={{ position:"fixed", bottom:"-10%", left:"-5%", width:420, height:420, borderRadius:"50%", background:"radial-gradient(circle, rgba(124,58,237,0.06), transparent 70%)", pointerEvents:"none" }} />

      <div className="login-wrapper" style={{ width:"100%", maxWidth: step === "product" ? 760 : 500, position:"relative", zIndex:1 }}>
        <div style={{ background:"#fff", borderRadius:22, border:"1px solid #E2E8F4", boxShadow:"0 8px 40px rgba(13,27,62,0.09)", overflow:"hidden", animation:"fadeUp 0.4s ease" }}>

          {/* STEP 1: Credentials */}
          {step === "credentials" && (
            <div className="login-card-inner">
              <div style={{ height:4, background:"linear-gradient(90deg,#2563EB,#4F46E5,#7C3AED)", margin:"-40px -40px 36px" }} className="accent-bar" />
              <div style={{ marginBottom:28 }}>
                <h1 style={{ fontFamily:"'Sora',sans-serif", fontSize:26, fontWeight:700, color:"#0D1B3E", marginBottom:6 }}>Welcome back</h1>
                <p style={{ color:"#8A97B0", fontSize:14 }}>Sign in to your Dura LTD admin account</p>
              </div>
              <form onSubmit={submitLogin} style={{ display:"flex", flexDirection:"column", gap:20 }}>
                <div>
                  <label style={{ display:"block", fontSize:13, fontWeight:600, color:"#0D1B3E", marginBottom:7 }}>Company Email</label>
                  <div style={{ position:"relative" }}>
                    <span style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:"#B0BAD0", display:"flex" }}><MailIcon /></span>
                    <input className="inp" type="email" value={email} placeholder="you@duraltd.com"
                      onChange={e => { setEmail(e.target.value); setErrors({}); }}
                      style={{ borderColor: errors.email ? "#EF4444" : undefined, paddingLeft: 40 }} />
                  </div>
                  {errors.email && <p style={{ color:"#EF4444", fontSize:12, marginTop:4 }}>{errors.email}</p>}
                </div>
                <div>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:7 }}>
                    <label style={{ fontSize:13, fontWeight:600, color:"#0D1B3E" }}>Password</label>
                    <button type="button" style={{ background:"none", border:"none", cursor:"pointer", fontSize:12, color:"#2563EB", fontWeight:600 }}>Forgot password?</button>
                  </div>
                  <div style={{ position:"relative" }}>
                    <span style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:"#B0BAD0", display:"flex" }}><LockIcon /></span>
                    <input className="inp" type={showPw ? "text" : "password"} value={password} placeholder="Enter your password"
                      onChange={e => { setPassword(e.target.value); setErrors({}); }}
                      style={{ borderColor: errors.password ? "#EF4444" : undefined, paddingLeft:40, paddingRight:42 }} />
                    <button type="button" onClick={() => setShowPw(!showPw)} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"#8A97B0", fontSize:16, display:"flex" }}>
                      {showPw ? "🙈" : "👁"}
                    </button>
                  </div>
                  {errors.password && <p style={{ color:"#EF4444", fontSize:12, marginTop:4 }}>{errors.password}</p>}
                </div>
                <button type="submit" disabled={loading} style={{ width:"100%", justifyContent:"center", padding:"14px", fontSize:15, marginTop:4, borderRadius:12, background:"linear-gradient(135deg,#2563EB,#4F46E5)", border:"none", color:"#fff", fontWeight:700, cursor: loading ? "not-allowed" : "pointer", display:"flex", alignItems:"center", gap:8, transition:"all 0.2s", boxShadow:"0 4px 16px rgba(37,99,235,0.3)" }}>
                  {loading ? <><SpinIcon />Signing in…</> : "Sign in →"}
                </button>
              </form>
              <div style={{ marginTop:28, paddingTop:24, borderTop:"1px solid #F4F7FE", textAlign:"center" }}>
                <p style={{ fontSize:12, color:"#B0BAD0" }}>Protected by multi-factor authentication</p>
                <div style={{ marginTop:8, padding:"10px 14px", borderRadius:10, background:"#F4F7FE", fontSize:12, color:"#8A97B0" }}>
                  <strong style={{ color:"#2563EB" }}>Demo credentials:</strong> ceo@duraltd.com / Ceo@2024
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: OTP */}
          {step === "otp" && (
            <div className="login-card-inner">
              <button onClick={() => setStep("credentials")} style={{ background:"none", border:"none", cursor:"pointer", color:"#8A97B0", fontSize:13, marginBottom:24, display:"flex", alignItems:"center", gap:6 }}>
                ← Back to login
              </button>
              <div style={{ width:56, height:56, borderRadius:16, background:"linear-gradient(135deg,#EFF6FF,#DBEAFE)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, marginBottom:20 }}>📧</div>
              <h1 style={{ fontFamily:"'Sora',sans-serif", fontSize:24, fontWeight:700, color:"#0D1B3E", marginBottom:6 }}>Check your inbox</h1>
              <p style={{ color:"#8A97B0", fontSize:14, marginBottom:4 }}>We sent a 6-digit verification code to</p>
              <p style={{ color:"#2563EB", fontWeight:600, fontSize:14, marginBottom:28 }}>{email}</p>
              <form onSubmit={submitOtp} style={{ display:"flex", flexDirection:"column", gap:18 }}>
                <div>
                  <label style={{ display:"block", fontSize:13, fontWeight:600, color:"#0D1B3E", marginBottom:7 }}>Verification Code</label>
                  <input className="inp" type="text" value={otp} maxLength={6} placeholder="000000"
                    onChange={e => { setOtp(e.target.value.replace(/\D/g,"").slice(0,6)); setErrors({}); }}
                    style={{ textAlign:"center", letterSpacing:12, fontSize:24, fontFamily:"monospace", borderColor: errors.code ? "#EF4444" : undefined, height:58 }} />
                  {errors.code && <p style={{ color:"#EF4444", fontSize:12, marginTop:4 }}>{errors.code}</p>}
                </div>
                <button type="submit" disabled={loading || otp.length < 6} style={{ width:"100%", justifyContent:"center", padding:"14px", fontSize:15, borderRadius:12, background:"linear-gradient(135deg,#2563EB,#4F46E5)", border:"none", color:"#fff", fontWeight:700, cursor: (loading || otp.length < 6) ? "not-allowed" : "pointer", display:"flex", alignItems:"center", gap:8, opacity: otp.length < 6 ? 0.6 : 1, transition:"all 0.2s", boxShadow:"0 4px 16px rgba(37,99,235,0.3)" }}>
                  {loading ? <><SpinIcon />Verifying…</> : "Verify & Continue →"}
                </button>
              </form>
              <div style={{ marginTop:16, padding:"10px 14px", borderRadius:10, background:"#F4F7FE", fontSize:12, color:"#8A97B0", textAlign:"center" }}>
                <strong style={{ color:"#2563EB" }}>Demo OTP:</strong> 123456
              </div>
              <p style={{ textAlign:"center", marginTop:16, fontSize:13, color:"#8A97B0" }}>
                Didn't receive it?{" "}
                <button onClick={resendOtp} disabled={timer > 0} style={{ background:"none", border:"none", cursor: timer > 0 ? "default" : "pointer", color: timer > 0 ? "#8A97B0" : "#2563EB", fontWeight:600, fontSize:13 }}>
                  {timer > 0 ? `Resend in ${timer}s` : "Resend code"}
                </button>
              </p>
            </div>
          )}

          {/* STEP 3: Product selection */}
          {step === "product" && (
            <div style={{ padding:"40px" }}>
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:6 }}>
                <div style={{ width:40, height:40, borderRadius:11, background: pendingUser?.avatarColor ?? "#2563EB", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:15, flexShrink:0 }}>
                  {pendingUser?.initials}
                </div>
                <div>
                  <p style={{ fontWeight:700, fontSize:15, color:"#0D1B3E" }}>Welcome back, {pendingUser?.name?.split(" ")[0]}!</p>
                  <p style={{ fontSize:12, color:"#8A97B0" }}>{pendingUser?.title}</p>
                </div>
              </div>
              <hr style={{ border:"none", borderTop:"1px solid #E2E8F4", margin:"18px 0 24px" }} />
              <h2 style={{ fontFamily:"'Sora',sans-serif", fontSize:20, fontWeight:700, color:"#0D1B3E", marginBottom:6 }}>Select a product</h2>
              <p style={{ color:"#8A97B0", fontSize:13, marginBottom:24 }}>Choose which dashboard to open</p>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:14 }}>
                {PRODUCTS.map(p => (
                  <button key={p.id} onClick={() => pickProduct(p.id)} style={{ background:"#fff", border:"1.5px solid #E2E8F4", borderRadius:16, padding:"22px 18px", cursor:"pointer", textAlign:"left", transition:"all 0.18s", outline:"none" }}
                    onMouseEnter={e => { const el = e.currentTarget; el.style.borderColor=p.accent; el.style.boxShadow=`0 4px 18px ${p.accent}20`; el.style.transform="translateY(-2px)"; }}
                    onMouseLeave={e => { const el = e.currentTarget; el.style.borderColor="#E2E8F4"; el.style.boxShadow="none"; el.style.transform="translateY(0)"; }}>
                    <div style={{ width:44, height:44, borderRadius:12, background:p.light, fontSize:22, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:14 }}>{p.icon}</div>
                    <div style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:15, color:"#0D1B3E", marginBottom:5 }}>{p.name}</div>
                    <div style={{ fontSize:12, color:"#8A97B0", lineHeight:1.55 }}>{p.desc}</div>
                    <div style={{ marginTop:12, display:"inline-flex", alignItems:"center", gap:4, color:p.accent, fontSize:12, fontWeight:600 }}>Open →</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <p style={{ textAlign:"center", color:"#B0BAD0", fontSize:12, marginTop:22 }}>© 2025 Dura LTD · Internal use only · All rights reserved</p>
      </div>

      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .login-card-inner { padding: 40px 40px 36px; }
        .accent-bar { height: 4px !important; border-radius: 0 !important; margin: 0 0 32px 0 !important; }
        @media (max-width: 540px) {
          .login-wrapper { padding: 0 4px; }
          .login-card-inner { padding: 28px 20px 24px !important; }
        }
      `}</style>
    </div>
  );
}

function SpinIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation:"spin 0.8s linear infinite", display:"inline-block" }}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>;
}
function MailIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
}
function LockIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
}
