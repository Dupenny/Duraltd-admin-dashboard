"use client";
import { cn } from "@/lib/utils";
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary"|"secondary"|"danger"; size?: "sm"|"md";
}
export function Button({ variant="primary", size="md", className, ...props }: ButtonProps) {
  return <button className={cn(`btn btn-${variant}`, size === "sm" && "btn-sm", className)} {...props} />;
}
