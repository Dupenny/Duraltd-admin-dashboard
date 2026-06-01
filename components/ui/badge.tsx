"use client";
interface BadgeProps { variant?: "green"|"amber"|"red"|"blue"|"purple"|"indigo"|"gray"; children: React.ReactNode; }
export function Badge({ variant = "gray", children }: BadgeProps) {
  return <span className={`badge badge-${variant}`}>{children}</span>;
}
