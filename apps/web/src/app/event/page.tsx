import { redirect } from "next/navigation";

export const revalidate = 86400; // static redirect, rarely changes

export default function EventPage() {
  // Event is temporarily disabled.
  redirect("/");
}
