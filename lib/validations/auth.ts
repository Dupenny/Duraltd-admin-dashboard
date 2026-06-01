// Validation schemas for auth forms
export interface LoginFields   { email: string; password: string; }
export interface OtpFields     { code: string; }
export type ValidationErrors   = Record<string, string>;

export function validateLogin(f: LoginFields): ValidationErrors {
  const e: ValidationErrors = {};
  if (!f.email)                                   e.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = "Enter a valid email address";
  if (!f.password)                                e.password = "Password is required";
  else if (f.password.length < 6)                 e.password = "Password must be at least 6 characters";
  return e;
}

export function validateOtp(f: OtpFields): ValidationErrors {
  const e: ValidationErrors = {};
  if (!f.code)                      e.code = "OTP code is required";
  else if (!/^\d{6}$/.test(f.code)) e.code = "OTP must be exactly 6 digits";
  return e;
}
