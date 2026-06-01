export type Role = "ceo" | "admin" | "support";
export type Product = "durapayment" | "durapay" | "durabiz";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  initials: string;
  title: string;
  avatarColor: string;
}

export const DEMO_USERS: Record<string, User & { password: string }> = {
  "ceo@duraltd.com": {
    id: "u1", name: "Emeka Nwosu", email: "ceo@duraltd.com",
    password: "Ceo@2024", role: "ceo", initials: "EN",
    title: "Chief Executive Officer", avatarColor: "#7C3AED",
  },
  "admin@duraltd.com": {
    id: "u2", name: "Adaeze Okonkwo", email: "admin@duraltd.com",
    password: "Admin@2024", role: "admin", initials: "AO",
    title: "System Administrator", avatarColor: "#2563EB",
  },
  "support@duraltd.com": {
    id: "u3", name: "Fatima Bello", email: "support@duraltd.com",
    password: "Support@2024", role: "support", initials: "FB",
    title: "Customer Support", avatarColor: "#10B981",
  },
};

export const MOCK_OTP = "123456";

export interface Permissions {
  canViewBalance: boolean;
  canTransfer: boolean;
  canViewAnalytics: boolean;
  canManageSettings: boolean;
  canManageUsers: boolean;
  canViewRevenue: boolean;
  canViewKPIs: boolean;
  canManageIssues: boolean;
}

export const PERMISSIONS: Record<Role, Permissions> = {
  ceo: {
    canViewBalance: true,
    canTransfer: true,
    canViewAnalytics: true,
    canManageSettings: true,
    canManageUsers: true,
    canViewRevenue: true,
    canViewKPIs: true,
    canManageIssues: true,
  },
  admin: {
    canViewBalance: false,
    canTransfer: false,
    canViewAnalytics: true,
    canManageSettings: true,
    canManageUsers: true,
    canViewRevenue: false,
    canViewKPIs: true,
    canManageIssues: true,
  },
  support: {
    canViewBalance: false,
    canTransfer: false,
    canViewAnalytics: false,
    canManageSettings: false,
    canManageUsers: false,
    canViewRevenue: false,
    canViewKPIs: false,
    canManageIssues: true,
  },
};

export function getPerms(role: Role): Permissions {
  return PERMISSIONS[role];
}

export const ROLE_LABELS: Record<Role, { label: string; color: string; bg: string }> = {
  ceo:     { label: "CEO",            color: "#7C3AED", bg: "#F5F3FF" },
  admin:   { label: "Administrator",  color: "#2563EB", bg: "#EFF6FF" },
  support: { label: "Support",        color: "#10B981", bg: "#ECFDF5" },
};
