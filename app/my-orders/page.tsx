import { redirect } from "next/navigation";

// Legacy route: permanently redirected to /my-bookings
export default function MyOrdersRedirect() {
  redirect("/my-bookings");
}
