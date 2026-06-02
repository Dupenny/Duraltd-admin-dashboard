"use client";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { getPerms } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const TABS = ["General", "Security", "Notifications"];

export default function SettingsPage() {
  const { user } = useApp();
  const router = useRouter();
  const perms = user ? getPerms(user.role) : null;
  const [tab, setTab] = useState("General");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user && !perms?.canManageSettings) router.replace("/overview");
  }, [user, perms, router]);

  function save() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  if (!user || !perms?.canManageSettings) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1
          style={{
            fontFamily: "'Sora',sans-serif",
            fontSize: 22,
            fontWeight: 700,
            color: "#0D1B3E",
            marginBottom: 4,
          }}>
          Settings
        </h1>
        <p style={{ color: "#8A97B0", fontSize: 14 }}>
          Manage dashboard & system configuration
        </p>
      </div>

      {saved && (
        <div
          style={{
            background: "#ECFDF5",
            border: "1px solid #A7F3D0",
            borderRadius: 10,
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            animation: "fadeUp 0.3s ease",
          }}>
          <span style={{ fontSize: 18 }}>✅</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#065F46" }}>
            Settings saved successfully
          </span>
        </div>
      )}

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 4,
          borderBottom: "1px solid #E2E8F4",
          paddingBottom: 1,
        }}>
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "9px 16px",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 13.5,
              fontWeight: 600,
              color: tab === t ? "#2563EB" : "#8A97B0",
              borderBottom: `2px solid ${tab === t ? "#2563EB" : "transparent"}`,
              transition: "all 0.15s",
              marginBottom: -1,
            }}>
            {t}
          </button>
        ))}
      </div>

      {tab === "General" && (
        <div className="card">
          <h2
            style={{
              fontFamily: "'Sora',sans-serif",
              fontSize: 16,
              fontWeight: 700,
              color: "#0D1B3E",
              marginBottom: 22,
            }}>
            General Settings
          </h2>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 20,
              maxWidth: 560,
            }}>
            {[
              { label: "Organization Name", val: "Dura LTD", type: "text" },
              {
                label: "Support Email",
                val: "support@duraltd.com",
                type: "email",
              },
              { label: "Timezone", val: "Africa/Lagos", type: "text" },
              { label: "Currency", val: "NGN — Nigerian Naira", type: "text" },
            ].map((f) => (
              <div key={f.label}>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#374151",
                    marginBottom: 6,
                  }}>
                  {f.label}
                </label>
                <input className="inp" type={f.type} defaultValue={f.val} />
              </div>
            ))}
            <button
              className="btn btn-primary"
              style={{ alignSelf: "flex-start" }}
              onClick={save}>
              Save Changes
            </button>
          </div>
        </div>
      )}

      {tab === "Security" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card">
            <h2
              style={{
                fontFamily: "'Sora',sans-serif",
                fontSize: 16,
                fontWeight: 700,
                color: "#0D1B3E",
                marginBottom: 18,
              }}>
              Security Settings
            </h2>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
                maxWidth: 560,
              }}>
              {[
                {
                  label: "Two-Factor Authentication",
                  desc: "Require OTP for all logins",
                  enabled: true,
                },
                {
                  label: "Session Timeout",
                  desc: "Auto-logout after 30 minutes of inactivity",
                  enabled: true,
                },
                {
                  label: "IP Allowlist",
                  desc: "Restrict access to specific IP ranges",
                  enabled: false,
                },
                {
                  label: "Audit Logging",
                  desc: "Log all admin actions for compliance",
                  enabled: true,
                },
              ].map((s) => (
                <div
                  key={s.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 0",
                    borderBottom: "1px solid #F4F7FE",
                  }}>
                  <div>
                    <p
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#0D1B3E",
                      }}>
                      {s.label}
                    </p>
                    <p style={{ fontSize: 12, color: "#8A97B0", marginTop: 2 }}>
                      {s.desc}
                    </p>
                  </div>
                  <div
                    style={{
                      width: 44,
                      height: 24,
                      borderRadius: 12,
                      background: s.enabled ? "#2563EB" : "#E2E8F4",
                      cursor: "pointer",
                      position: "relative",
                      transition: "background 0.2s",
                      flexShrink: 0,
                    }}>
                    <div
                      style={{
                        position: "absolute",
                        top: 2,
                        left: s.enabled ? 22 : 2,
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        background: "#fff",
                        transition: "left 0.2s",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <button
              className="btn btn-primary"
              style={{ marginTop: 16 }}
              onClick={save}>
              Save Security Settings
            </button>
          </div>
        </div>
      )}

      {tab === "API Keys" && (
        <div className="card">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 20,
            }}>
            <div>
              <h2
                style={{
                  fontFamily: "'Sora',sans-serif",
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#0D1B3E",
                }}>
                API Keys
              </h2>
              <p style={{ fontSize: 13, color: "#8A97B0", marginTop: 2 }}>
                Manage access tokens for backend integration
              </p>
            </div>
            <button className="btn btn-primary btn-sm">Generate New Key</button>
          </div>
          {[
            {
              name: "Production API Key",
              key: "sk_live_••••••••••••••••dk9x",
              created: "Jan 1, 2024",
              status: "Active",
            },
            {
              name: "Staging API Key",
              key: "sk_test_••••••••••••••••mn4z",
              created: "Dec 15, 2023",
              status: "Active",
            },
          ].map((k) => (
            <div
              key={k.name}
              style={{
                padding: "16px",
                borderRadius: 12,
                border: "1px solid #E2E8F4",
                marginBottom: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 12,
              }}>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: "#0D1B3E" }}>
                  {k.name}
                </p>
                <p
                  style={{
                    fontFamily: "monospace",
                    fontSize: 13,
                    color: "#8A97B0",
                    marginTop: 4,
                  }}>
                  {k.key}
                </p>
                <p style={{ fontSize: 11, color: "#B0BAD0", marginTop: 2 }}>
                  Created {k.created}
                </p>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span className="badge badge-green">{k.status}</span>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: 12 }}>
                  Reveal
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  style={{ fontSize: 12 }}>
                  Revoke
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "Notifications" && (
        <div className="card">
          <h2
            style={{
              fontFamily: "'Sora',sans-serif",
              fontSize: 16,
              fontWeight: 700,
              color: "#0D1B3E",
              marginBottom: 20,
            }}>
            Notification Preferences
          </h2>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              maxWidth: 560,
            }}>
            {[
              { label: "New support issues", email: true, inApp: true },
              { label: "Transaction failures", email: true, inApp: true },
              { label: "Large transfers (CEO)", email: true, inApp: false },
              { label: "New customer signups", email: false, inApp: true },
              { label: "Weekly summary report", email: true, inApp: false },
            ].map((n) => (
              <div
                key={n.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 0",
                  borderBottom: "1px solid #F4F7FE",
                }}>
                <p style={{ fontSize: 14, color: "#0D1B3E", fontWeight: 500 }}>
                  {n.label}
                </p>
                <div style={{ display: "flex", gap: 20 }}>
                  {[
                    { label: "Email", val: n.email },
                    { label: "In-App", val: n.inApp },
                  ].map((ch) => (
                    <label
                      key={ch.label}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        cursor: "pointer",
                        fontSize: 12,
                        color: "#8A97B0",
                      }}>
                      <input
                        type="checkbox"
                        defaultChecked={ch.val}
                        style={{ accentColor: "#2563EB" }}
                      />
                      {ch.label}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <button
            className="btn btn-primary"
            style={{ marginTop: 20 }}
            onClick={save}>
            Save Preferences
          </button>
        </div>
      )}

      {tab === "Appearance" && (
        <div className="card" style={{ maxWidth: 560 }}>
          <h2
            style={{
              fontFamily: "'Sora',sans-serif",
              fontSize: 16,
              fontWeight: 700,
              color: "#0D1B3E",
              marginBottom: 20,
            }}>
            Appearance
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#374151",
                  marginBottom: 10,
                }}>
                Theme
              </label>
              <div style={{ display: "flex", gap: 10 }}>
                {["Light", "Dark", "System"].map((t, i) => (
                  <button
                    key={t}
                    className="btn btn-secondary btn-sm"
                    style={{
                      fontSize: 13,
                      background: i === 0 ? "#0D1B3E" : undefined,
                      color: i === 0 ? "#fff" : undefined,
                    }}>
                    {t === "Light" ? "☀️" : t === "Dark" ? "🌙" : "💻"} {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#374151",
                  marginBottom: 10,
                }}>
                Sidebar Position
              </label>
              <div style={{ display: "flex", gap: 10 }}>
                {["Left", "Right"].map((p, i) => (
                  <button
                    key={p}
                    className="btn btn-secondary btn-sm"
                    style={{
                      fontSize: 13,
                      background: i === 0 ? "#0D1B3E" : undefined,
                      color: i === 0 ? "#fff" : undefined,
                    }}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <button
              className="btn btn-primary"
              style={{ alignSelf: "flex-start" }}
              onClick={save}>
              Save Appearance
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
