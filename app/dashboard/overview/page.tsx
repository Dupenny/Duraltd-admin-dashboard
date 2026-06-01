import { redirect } from "next/navigation";
// /overview now lives at /dashboard
export default function OverviewRedirect() { redirect("/dashboard"); }
