import { redirect } from "next/navigation";
export default function SuperEventSpinPage() {
  // Event is temporarily disabled.
  redirect("/admin/dashboard/super/accounts");
}
