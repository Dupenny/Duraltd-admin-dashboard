"use client";
import { useState, useEffect } from "react";
import { useApp } from "@/lib/store";
import { getPerms, ROLE_LABELS } from "@/lib/auth";
import type { Role } from "@/lib/auth";
import { USERS } from "@/lib/mock-data";
import { fmtDate } from "@/lib/utils";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────
interface AppUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLogin: string;
  initials: string;
  color: string;
}

type ModalType = "edit" | "remove" | "suspend" | "invite" | null;

interface EditForm {
  name: string;
  email: string;
  role: Role;
}

// ─── Helpers ─────────────────────────────────────────────────
function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
}
function roleBadge(role: string) {
  return role === "ceo" ? "badge-purple" : role === "admin" ? "badge-blue" : "badge-green";
}
const ROLE_COLOR: Record<string, string> = {
  ceo: "#7C3AED", admin: "#2563EB", support: "#10B981",
};

// ─── Sub-components ───────────────────────────────────────────
function Field({ label, id, type = "text", value, error, onChange, placeholder, required, readOnly }: {
  label: string; id: string; type?: string; value: string; error?: string;
  onChange?: (v: string) => void; placeholder?: string; required?: boolean; readOnly?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} style={{ display: "flex", gap: 4, fontSize: 12.5, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
        {label}{required && <span style={{ color: "#EF4444" }}>*</span>}
      </label>
      <input id={id} type={type} value={value} placeholder={placeholder} readOnly={readOnly}
        onChange={e => onChange?.(e.target.value)}
        className="inp"
        style={{ fontSize: 13.5, borderColor: error ? "#EF4444" : undefined, background: readOnly ? "#F8FAFF" : undefined, cursor: readOnly ? "default" : undefined }} />
      {error && <p style={{ color: "#EF4444", fontSize: 12, marginTop: 5, display: "flex", alignItems: "center", gap: 4 }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        {error}
      </p>}
    </div>
  );
}

function ModalShell({ title, subtitle, icon, iconBg, iconStroke, children, onClose, footer }: {
  title: string; subtitle: string; icon: React.ReactNode;
  iconBg: string; iconStroke: string;
  children: React.ReactNode; onClose: () => void; footer: React.ReactNode;
}) {
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(13,27,62,0.35)", backdropFilter: "blur(4px)", zIndex: 200, animation: "fadeIn 0.2s ease" }} />
      <div style={{ position: "fixed", inset: 0, zIndex: 201, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, pointerEvents: "none" }}>
        <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 480, boxShadow: "0 24px 64px rgba(13,27,62,0.18)", border: "1px solid #E2E8F4", pointerEvents: "all", animation: "fadeUp 0.28s cubic-bezier(0.34,1.56,0.64,1)", maxHeight: "calc(100vh - 32px)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Header */}
          <div style={{ padding: "22px 24px 18px", borderBottom: "1px solid #F0F4FA", display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 17, fontWeight: 700, color: "#0D1B3E", marginBottom: 2 }}>{title}</h2>
              <p style={{ fontSize: 12.5, color: "#8A97B0" }}>{subtitle}</p>
            </div>
            <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: "1.5px solid #E2E8F4", background: "#F4F7FE", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#8A97B0", flexShrink: 0 }}
              onMouseEnter={e => { const el = e.currentTarget; el.style.background = "#FEF2F2"; el.style.borderColor = "#EF4444"; el.style.color = "#EF4444"; }}
              onMouseLeave={e => { const el = e.currentTarget; el.style.background = "#F4F7FE"; el.style.borderColor = "#E2E8F4"; el.style.color = "#8A97B0"; }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          {/* Body */}
          <div style={{ overflowY: "auto", flex: 1, padding: "20px 24px" }}>{children}</div>
          {/* Footer */}
          <div style={{ padding: "16px 24px", borderTop: "1px solid #F0F4FA", display: "flex", gap: 10, justifyContent: "flex-end", flexShrink: 0, background: "#FAFBFF" }}>{footer}</div>
        </div>
      </div>
    </>
  );
}

function SpinnerIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: "spin 0.8s linear infinite" }}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>;
}

// ─── Main Page ────────────────────────────────────────────────
export default function UsersPage() {
  const { user } = useApp();
  const router   = useRouter();
  const perms    = user ? getPerms(user.role) : null;

  useEffect(() => {
    if (user && !perms?.canManageUsers) router.replace("/overview");
  }, [user, perms, router]);

  const [users, setUsers]         = useState<AppUser[]>(USERS);
  const [modal, setModal]         = useState<ModalType>(null);
  const [target, setTarget]       = useState<AppUser | null>(null);
  const [saving, setSaving]       = useState(false);
  const [toast, setToast]         = useState<{ msg: string; type: "success" | "danger" } | null>(null);
  const [search, setSearch]       = useState("");

  // Edit form state
  const [editForm, setEditForm]   = useState<EditForm>({ name: "", email: "", role: "support" });
  const [editErrors, setEditErrors] = useState<Partial<EditForm>>({});

  // Invite form state
  const [inviteForm, setInviteForm] = useState({ name: "", email: "", role: "support" as Role });
  const [inviteErrors, setInviteErrors] = useState<{ name?: string; email?: string }>({});

  function showToast(msg: string, type: "success" | "danger" = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  function openModal(type: ModalType, u?: AppUser) {
    setTarget(u ?? null);
    if (type === "edit" && u) {
      setEditForm({ name: u.name, email: u.email, role: u.role as Role });
      setEditErrors({});
    }
    if (type === "invite") {
      setInviteForm({ name: "", email: "", role: "support" });
      setInviteErrors({});
    }
    setModal(type);
  }

  function closeModal() {
    setModal(null);
    setTarget(null);
    setSaving(false);
  }

  async function fakeDelay(ms = 800) {
    setSaving(true);
    await new Promise(r => setTimeout(r, ms));
    setSaving(false);
  }

  // ── Edit ──────────────────────────────────────────────────
  function validateEdit() {
    const e: Partial<EditForm> = {};
    if (!editForm.name.trim())  e.name  = "Name is required";
    if (!editForm.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email)) e.email = "Enter a valid email";
    setEditErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateEdit() || !target) return;

    // ── API call point ─────────────────────────────────────
    // const { error } = await usersApi.update(target.id, editForm);
    // if (error) { setEditErrors({ email: error }); return; }
    // ──────────────────────────────────────────────────────
    await fakeDelay();

    const newColor = ROLE_COLOR[editForm.role] ?? target.color;
    setUsers(prev => prev.map(u => u.id === target.id
      ? { ...u, name: editForm.name, email: editForm.email, role: editForm.role,
          initials: getInitials(editForm.name), color: newColor }
      : u
    ));
    closeModal();
    showToast(`${editForm.name}'s profile was updated successfully`);
  }

  // ── Remove ────────────────────────────────────────────────
  async function handleRemove() {
    if (!target) return;

    // ── API call point ─────────────────────────────────────
    // const { error } = await usersApi.update(target.id, { deleted: true });
    // if (error) { showToast(error, "danger"); return; }
    // ──────────────────────────────────────────────────────
    await fakeDelay();

    setUsers(prev => prev.filter(u => u.id !== target.id));
    closeModal();
    showToast(`${target.name} has been removed`, "danger");
  }

  // ── Suspend / Reactivate ──────────────────────────────────
  async function handleSuspend() {
    if (!target) return;
    const next = target.status === "Active" ? "Suspended" : "Active";

    // ── API call point ─────────────────────────────────────
    // const { error } = await usersApi.update(target.id, { status: next });
    // if (error) { showToast(error, "danger"); return; }
    // ──────────────────────────────────────────────────────
    await fakeDelay();

    setUsers(prev => prev.map(u => u.id === target.id ? { ...u, status: next } : u));
    closeModal();
    showToast(
      next === "Suspended"
        ? `${target.name} has been suspended`
        : `${target.name} has been reactivated`,
      next === "Suspended" ? "danger" : "success"
    );
  }

  // ── Invite ────────────────────────────────────────────────
  function validateInvite() {
    const e: { name?: string; email?: string } = {};
    if (!inviteForm.name.trim())  e.name  = "Name is required";
    if (!inviteForm.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inviteForm.email)) e.email = "Enter a valid email";
    else if (users.find(u => u.email === inviteForm.email)) e.email = "This email is already registered";
    setInviteErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!validateInvite()) return;

    // ── API call point ─────────────────────────────────────
    // const { data, error } = await usersApi.invite(inviteForm);
    // if (error) { setInviteErrors({ email: error }); return; }
    // ──────────────────────────────────────────────────────
    await fakeDelay();

    const newUser: AppUser = {
      id:        `u${Date.now()}`,
      name:      inviteForm.name,
      email:     inviteForm.email,
      role:      inviteForm.role,
      status:    "Active",
      lastLogin: new Date().toISOString(),
      initials:  getInitials(inviteForm.name),
      color:     ROLE_COLOR[inviteForm.role] ?? "#2563EB",
    };
    setUsers(prev => [...prev, newUser]);
    closeModal();
    showToast(`Invite sent to ${inviteForm.name} (${inviteForm.email})`);
  }

  // ─── Filtered users ───────────────────────────────────────
  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    return !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.includes(q);
  });

  if (!user || !perms?.canManageUsers) return null;

  // ── Status helpers ────────────────────────────────────────
  const statusDot: Record<string, string> = { Active: "#10B981", Suspended: "#F59E0B", Removed: "#EF4444" };
  const statusBadge: Record<string, string> = { Active: "badge-green", Suspended: "badge-amber", Inactive: "badge-gray" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* ── Toast ───────────────────────────────────────────── */}
      {toast && (
        <div style={{ position: "fixed", top: 24, right: 24, zIndex: 300, maxWidth: 360, width: "calc(100% - 48px)", background: toast.type === "success" ? "#ECFDF5" : "#FEF2F2", border: `1px solid ${toast.type === "success" ? "#A7F3D0" : "#FECACA"}`, borderRadius: 12, padding: "13px 16px", display: "flex", alignItems: "center", gap: 10, boxShadow: "0 8px 30px rgba(13,27,62,0.12)", animation: "fadeUp 0.3s ease" }}>
          {toast.type === "success"
            ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>}
          <span style={{ fontSize: 13.5, fontWeight: 600, color: toast.type === "success" ? "#065F46" : "#991B1B", flex: 1 }}>{toast.msg}</span>
          <button onClick={() => setToast(null)} style={{ background: "none", border: "none", cursor: "pointer", color: toast.type === "success" ? "#10B981" : "#EF4444", fontSize: 16, flexShrink: 0 }}>✕</button>
        </div>
      )}

      {/* ── Header ──────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 22, fontWeight: 700, color: "#0D1B3E", marginBottom: 4 }}>Users</h1>
          <p style={{ color: "#8A97B0", fontSize: 14 }}>{users.length} internal users · {users.filter(u => u.status === "Active").length} active</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => openModal("invite")} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Invite User
        </button>
      </div>

      {/* ── User cards ──────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16 }}>
        {users.map(u => {
          const roleInfo = ROLE_LABELS[u.role as keyof typeof ROLE_LABELS];
          const isSelf   = u.id === user.id;
          const isSuspended = u.status === "Suspended";
          return (
            <div key={u.id} className="card" style={{ padding: "22px", display: "flex", flexDirection: "column", gap: 14, opacity: isSuspended ? 0.72 : 1, transition: "opacity 0.2s" }}>
              {/* Avatar + status dot */}
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 13, background: u.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 16, fontWeight: 700 }}>{u.initials}</div>
                  <span style={{ position: "absolute", bottom: -2, right: -2, width: 12, height: 12, borderRadius: "50%", background: statusDot[u.status] ?? "#8A97B0", border: "2px solid #fff" }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 15, fontWeight: 700, color: "#0D1B3E", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.name}</div>
                  <div style={{ fontSize: 12, color: "#8A97B0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email}</div>
                </div>
                {isSelf && <span style={{ fontSize: 10, fontWeight: 700, color: "#2563EB", background: "#EFF6FF", borderRadius: 6, padding: "2px 7px", flexShrink: 0 }}>You</span>}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className={`badge ${roleBadge(u.role)}`}>{roleInfo?.label ?? u.role}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span className={`badge ${statusBadge[u.status] ?? "badge-gray"}`} style={{ fontSize: 10 }}>{u.status}</span>
                </div>
              </div>

              <div style={{ fontSize: 11, color: "#B0BAD0", display: "flex", alignItems: "center", gap: 5 }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                Last login: {fmtDate(u.lastLogin, "short")}
              </div>

              {/* Card actions */}
              <div style={{ display: "flex", gap: 8, paddingTop: 8, borderTop: "1px solid #E2E8F4" }}>
                <button onClick={() => openModal("edit", u)} className="btn btn-secondary btn-sm"
                  style={{ flex: 1, justifyContent: "center", fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Edit
                </button>
                {!isSelf && (
                  <button onClick={() => openModal("suspend", u)} className="btn btn-secondary btn-sm"
                    style={{ flex: 1, justifyContent: "center", fontSize: 12, display: "flex", alignItems: "center", gap: 5, color: isSuspended ? "#10B981" : "#F59E0B", borderColor: isSuspended ? "#A7F3D0" : "#FDE68A", background: isSuspended ? "#ECFDF5" : "#FFFBEB" }}>
                    {isSuspended
                      ? <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>Reactivate</>
                      : <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="10" y1="15" x2="10" y2="9"/><line x1="14" y1="15" x2="14" y2="9"/></svg>Suspend</>}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Table ───────────────────────────────────────────── */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #E2E8F4", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 15, fontWeight: 700, color: "#0D1B3E" }}>All Users</h2>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#B0BAD0" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </span>
            <input className="inp" placeholder="Search users…" value={search} onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: 30, paddingTop: 7, paddingBottom: 7, fontSize: 13, width: 200 }} />
          </div>
        </div>
        <div className="table-wrap">
          <table className="data-tbl">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: "center", padding: "40px", color: "#B0BAD0" }}>No users found</td></tr>
              ) : filtered.map(u => {
                const isSelf = u.id === user.id;
                const isSuspended = u.status === "Suspended";
                return (
                  <tr key={u.id} style={{ opacity: isSuspended ? 0.65 : 1 }}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ position: "relative", flexShrink: 0 }}>
                          <div style={{ width: 32, height: 32, borderRadius: 8, background: u.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 700 }}>{u.initials}</div>
                          <span style={{ position: "absolute", bottom: -1, right: -1, width: 9, height: 9, borderRadius: "50%", background: statusDot[u.status] ?? "#8A97B0", border: "1.5px solid #fff" }} />
                        </div>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: "#0D1B3E" }}>{u.name}</span>
                            {isSelf && <span style={{ fontSize: 9, fontWeight: 700, color: "#2563EB", background: "#EFF6FF", borderRadius: 4, padding: "1px 5px" }}>You</span>}
                          </div>
                          <div style={{ fontSize: 11, color: "#B0BAD0" }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className={`badge ${roleBadge(u.role)}`}>{ROLE_LABELS[u.role as keyof typeof ROLE_LABELS]?.label ?? u.role}</span></td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: statusDot[u.status] ?? "#8A97B0", flexShrink: 0 }} />
                        <span className={`badge ${statusBadge[u.status] ?? "badge-gray"}`} style={{ fontSize: 11 }}>{u.status}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: 12, color: "#4A5568" }}>{fmtDate(u.lastLogin)}</td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        {/* Edit */}
                        <button onClick={() => openModal("edit", u)} className="btn btn-secondary btn-sm"
                          style={{ fontSize: 11, display: "flex", alignItems: "center", gap: 4 }}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          Edit
                        </button>
                        {/* Suspend / Reactivate */}
                        {!isSelf && (
                          <button onClick={() => openModal("suspend", u)} className="btn btn-secondary btn-sm"
                            style={{ fontSize: 11, display: "flex", alignItems: "center", gap: 4, color: isSuspended ? "#10B981" : "#F59E0B", background: isSuspended ? "#ECFDF5" : "#FFFBEB", borderColor: isSuspended ? "#A7F3D0" : "#FDE68A" }}>
                            {isSuspended
                              ? <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>Reactivate</>
                              : <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="10" y1="15" x2="10" y2="9"/><line x1="14" y1="15" x2="14" y2="9"/></svg>Suspend</>}
                          </button>
                        )}
                        {/* Remove */}
                        {!isSelf && (
                          <button onClick={() => openModal("remove", u)} className="btn btn-danger btn-sm"
                            style={{ fontSize: 11, display: "flex", alignItems: "center", gap: 4 }}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                            Remove
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          EDIT MODAL
      ══════════════════════════════════════════ */}
      {modal === "edit" && target && (
        <ModalShell
          title="Edit User"
          subtitle={`Updating profile for ${target.name}`}
          iconBg="linear-gradient(135deg,#EFF6FF,#DBEAFE)"
          iconStroke="#2563EB"
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>}
          onClose={closeModal}
          footer={
            <>
              <button type="button" onClick={closeModal} className="btn btn-secondary" style={{ fontSize: 13.5 }} disabled={saving}>Cancel</button>
              <button type="submit" form="edit-form" className="btn btn-primary" disabled={saving} style={{ fontSize: 13.5, minWidth: 120, justifyContent: "center", display: "flex", alignItems: "center", gap: 7 }}>
                {saving ? <><SpinnerIcon />Saving…</> : <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>Save Changes</>}
              </button>
            </>
          }
        >
          {/* Avatar preview */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", background: "#F8FAFF", borderRadius: 12, border: "1px solid #DBEAFE", marginBottom: 22 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: ROLE_COLOR[editForm.role] ?? target.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 15, transition: "background 0.2s", flexShrink: 0 }}>
              {getInitials(editForm.name || target.name)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 700, fontSize: 14, color: "#0D1B3E", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{editForm.name || target.name}</p>
              <p style={{ fontSize: 12, color: "#8A97B0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{editForm.email || target.email}</p>
            </div>
            <span className={`badge ${roleBadge(editForm.role)}`} style={{ fontSize: 11, flexShrink: 0 }}>
              {ROLE_LABELS[editForm.role]?.label ?? editForm.role}
            </span>
          </div>

          <form id="edit-form" onSubmit={handleEdit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Field label="Full Name" id="edit-name" value={editForm.name} required
              onChange={v => { setEditForm(p => ({ ...p, name: v })); setEditErrors(p => ({ ...p, name: "" })); }}
              error={editErrors.name} placeholder="Full name" />
            <Field label="Email Address" id="edit-email" type="email" value={editForm.email} required
              onChange={v => { setEditForm(p => ({ ...p, email: v })); setEditErrors(p => ({ ...p, email: "" })); }}
              error={editErrors.email} placeholder="email@duraltd.com" />
            <div>
              <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Role</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                {(["ceo", "admin", "support"] as Role[]).map(r => (
                  <button key={r} type="button" onClick={() => setEditForm(p => ({ ...p, role: r }))}
                    style={{ padding: "10px 8px", borderRadius: 10, border: `1.5px solid ${editForm.role === r ? ROLE_COLOR[r] : "#E2E8F4"}`, background: editForm.role === r ? ROLE_COLOR[r] + "14" : "#fff", cursor: "pointer", transition: "all 0.15s", display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: editForm.role === r ? ROLE_COLOR[r] : "#F4F7FE", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.15s" }}>
                      <span style={{ fontSize: 14 }}>{r === "ceo" ? "👑" : r === "admin" ? "🛡" : "🎧"}</span>
                    </div>
                    <span style={{ fontSize: 11.5, fontWeight: 600, color: editForm.role === r ? ROLE_COLOR[r] : "#4A5568" }}>{ROLE_LABELS[r].label}</span>
                  </button>
                ))}
              </div>
            </div>
          </form>
        </ModalShell>
      )}

      {/* ══════════════════════════════════════════
          REMOVE MODAL
      ══════════════════════════════════════════ */}
      {modal === "remove" && target && (
        <ModalShell
          title="Remove User"
          subtitle="This action cannot be undone"
          iconBg="#FEF2F2"
          iconStroke="#EF4444"
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>}
          onClose={closeModal}
          footer={
            <>
              <button type="button" onClick={closeModal} className="btn btn-secondary" style={{ fontSize: 13.5 }} disabled={saving}>Cancel</button>
              <button onClick={handleRemove} disabled={saving} style={{ background: "#EF4444", color: "#fff", border: "none", borderRadius: 10, padding: "9px 20px", fontSize: 13.5, fontWeight: 600, cursor: "pointer", minWidth: 130, display: "flex", alignItems: "center", gap: 7, justifyContent: "center" }}>
                {saving ? <><SpinnerIcon />Removing…</> : <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>Yes, Remove</>}
              </button>
            </>
          }
        >
          {/* User preview */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", background: "#FFF7F7", borderRadius: 12, border: "1px solid #FECACA", marginBottom: 20 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: target.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 15, fontWeight: 700, flexShrink: 0 }}>{target.initials}</div>
            <div>
              <p style={{ fontWeight: 700, fontSize: 14, color: "#0D1B3E" }}>{target.name}</p>
              <p style={{ fontSize: 12, color: "#8A97B0" }}>{target.email}</p>
            </div>
          </div>
          <p style={{ fontSize: 14, color: "#4A5568", lineHeight: 1.65, marginBottom: 14 }}>
            Are you sure you want to permanently remove <strong style={{ color: "#0D1B3E" }}>{target.name}</strong>? They will immediately lose access to all Dura LTD admin tools.
          </p>
          <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "11px 14px", display: "flex", gap: 10, alignItems: "flex-start" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <p style={{ fontSize: 12.5, color: "#991B1B", lineHeight: 1.5 }}>This will permanently delete the user account and all associated session data. This cannot be reversed.</p>
          </div>
        </ModalShell>
      )}

      {/* ══════════════════════════════════════════
          SUSPEND MODAL
      ══════════════════════════════════════════ */}
      {modal === "suspend" && target && (() => {
        const isSuspended = target.status === "Suspended";
        return (
          <ModalShell
            title={isSuspended ? "Reactivate User" : "Suspend User"}
            subtitle={isSuspended ? "Restore this user's access" : "Temporarily disable access"}
            iconBg={isSuspended ? "#ECFDF5" : "#FFFBEB"}
            iconStroke={isSuspended ? "#10B981" : "#F59E0B"}
            icon={isSuspended
              ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="10" y1="15" x2="10" y2="9"/><line x1="14" y1="15" x2="14" y2="9"/></svg>}
            onClose={closeModal}
            footer={
              <>
                <button type="button" onClick={closeModal} className="btn btn-secondary" style={{ fontSize: 13.5 }} disabled={saving}>Cancel</button>
                <button onClick={handleSuspend} disabled={saving}
                  style={{ background: isSuspended ? "#10B981" : "#F59E0B", color: "#fff", border: "none", borderRadius: 10, padding: "9px 20px", fontSize: 13.5, fontWeight: 600, cursor: "pointer", minWidth: 150, display: "flex", alignItems: "center", gap: 7, justifyContent: "center" }}>
                  {saving
                    ? <><SpinnerIcon />{isSuspended ? "Reactivating…" : "Suspending…"}</>
                    : isSuspended
                      ? <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>Yes, Reactivate</>
                      : <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="10" y1="15" x2="10" y2="9"/><line x1="14" y1="15" x2="14" y2="9"/></svg>Yes, Suspend</>}
                </button>
              </>
            }
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", background: isSuspended ? "#F0FDF4" : "#FFFBEB", borderRadius: 12, border: `1px solid ${isSuspended ? "#A7F3D0" : "#FDE68A"}`, marginBottom: 20 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: target.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 15, fontWeight: 700, flexShrink: 0 }}>{target.initials}</div>
              <div>
                <p style={{ fontWeight: 700, fontSize: 14, color: "#0D1B3E" }}>{target.name}</p>
                <p style={{ fontSize: 12, color: "#8A97B0" }}>{target.email}</p>
              </div>
              <span className={`badge ${isSuspended ? "badge-amber" : "badge-green"}`} style={{ marginLeft: "auto", flexShrink: 0 }}>{target.status}</span>
            </div>
            <p style={{ fontSize: 14, color: "#4A5568", lineHeight: 1.65, marginBottom: 14 }}>
              {isSuspended
                ? <>Reactivating <strong style={{ color: "#0D1B3E" }}>{target.name}</strong> will immediately restore their login access and all permissions associated with their role.</>
                : <>Suspending <strong style={{ color: "#0D1B3E" }}>{target.name}</strong> will immediately block their login. Their data and role will be preserved and can be restored at any time.</>}
            </p>
            <div style={{ background: isSuspended ? "#F0FDF4" : "#FFFBEB", border: `1px solid ${isSuspended ? "#A7F3D0" : "#FDE68A"}`, borderRadius: 10, padding: "11px 14px", display: "flex", gap: 10, alignItems: "flex-start" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={isSuspended ? "#10B981" : "#F59E0B"} strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <p style={{ fontSize: 12.5, color: isSuspended ? "#065F46" : "#92400E", lineHeight: 1.5 }}>
                {isSuspended ? "The user will receive an email notification that their account has been reactivated." : "The user will receive an email notification about their account suspension."}
              </p>
            </div>
          </ModalShell>
        );
      })()}

      {/* ══════════════════════════════════════════
          INVITE MODAL
      ══════════════════════════════════════════ */}
      {modal === "invite" && (
        <ModalShell
          title="Invite User"
          subtitle="Send an invitation to join the admin dashboard"
          iconBg="linear-gradient(135deg,#F5F3FF,#EDE9FE)"
          iconStroke="#7C3AED"
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>}
          onClose={closeModal}
          footer={
            <>
              <button type="button" onClick={closeModal} className="btn btn-secondary" style={{ fontSize: 13.5 }} disabled={saving}>Cancel</button>
              <button type="submit" form="invite-form" className="btn btn-primary" disabled={saving} style={{ fontSize: 13.5, minWidth: 130, justifyContent: "center", display: "flex", alignItems: "center", gap: 7 }}>
                {saving ? <><SpinnerIcon />Sending…</> : <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>Send Invite</>}
              </button>
            </>
          }
        >
          <form id="invite-form" onSubmit={handleInvite} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Field label="Full Name" id="invite-name" value={inviteForm.name} required
              onChange={v => { setInviteForm(p => ({ ...p, name: v })); setInviteErrors(p => ({ ...p, name: "" })); }}
              error={inviteErrors.name} placeholder="e.g. Chidi Okeke" />
            <Field label="Email Address" id="invite-email" type="email" value={inviteForm.email} required
              onChange={v => { setInviteForm(p => ({ ...p, email: v })); setInviteErrors(p => ({ ...p, email: "" })); }}
              error={inviteErrors.email} placeholder="user@duraltd.com" />
            <div>
              <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Assign Role <span style={{ color: "#EF4444" }}>*</span></label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                {(["ceo", "admin", "support"] as Role[]).map(r => (
                  <button key={r} type="button" onClick={() => setInviteForm(p => ({ ...p, role: r }))}
                    style={{ padding: "10px 8px", borderRadius: 10, border: `1.5px solid ${inviteForm.role === r ? ROLE_COLOR[r] : "#E2E8F4"}`, background: inviteForm.role === r ? ROLE_COLOR[r] + "14" : "#fff", cursor: "pointer", transition: "all 0.15s", display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: inviteForm.role === r ? ROLE_COLOR[r] + "25" : "#F4F7FE", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 14 }}>{r === "ceo" ? "👑" : r === "admin" ? "🛡" : "🎧"}</span>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, color: inviteForm.role === r ? ROLE_COLOR[r] : "#8A97B0" }}>{ROLE_LABELS[r].label}</span>
                  </button>
                ))}
              </div>
              <p style={{ fontSize: 12, color: "#8A97B0", marginTop: 8 }}>
                {inviteForm.role === "ceo" ? "👑 Full access including balance, revenue, transfers and all settings."
                 : inviteForm.role === "admin" ? "🛡 Analytics, settings, user management — no financial data."
                 : "🎧 Customer support and issue management only."}
              </p>
            </div>
            {/* Preview */}
            {inviteForm.name && (
              <div style={{ padding: "12px 14px", background: "#F8FAFF", border: "1px solid #DBEAFE", borderRadius: 12, display: "flex", alignItems: "center", gap: 12, animation: "fadeIn 0.2s ease" }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: ROLE_COLOR[inviteForm.role], display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                  {getInitials(inviteForm.name)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#0D1B3E", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{inviteForm.name}</p>
                  <p style={{ fontSize: 11, color: "#8A97B0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{inviteForm.email || "No email yet"}</p>
                </div>
                <span className={`badge ${roleBadge(inviteForm.role)}`} style={{ fontSize: 10, flexShrink: 0 }}>{ROLE_LABELS[inviteForm.role].label}</span>
              </div>
            )}
          </form>
        </ModalShell>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
