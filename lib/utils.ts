import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function fmt(n: number, decimals = 0): string {
  return new Intl.NumberFormat("en-NG", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(n);
}

export function fmtCurrency(n: number, short = false): string {
  if (short) {
    if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000)     return `₦${(n / 1_000).toFixed(0)}K`;
    return `₦${n}`;
  }
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(n);
}

export function fmtDate(d: string | Date, mode: "short" | "long" | "time" = "short"): string {
  const date = typeof d === "string" ? new Date(d) : d;
  if (mode === "time") return new Intl.DateTimeFormat("en-NG", { hour: "2-digit", minute: "2-digit" }).format(date);
  if (mode === "long")  return new Intl.DateTimeFormat("en-NG", { month: "short", day: "numeric", year: "numeric" }).format(date);
  return new Intl.DateTimeFormat("en-NG", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(date);
}

export function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return fmt(n);
}

export function deltaClass(v: number) { return v >= 0 ? "delta-up" : "delta-down"; }
export function deltaSign(v: number)  { return v >= 0 ? "↑" : "↓"; }
