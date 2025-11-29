"use client";

import MyBookingsPage from "../my-bookings/page";

// Legacy route now renders the bookings experience directly (no redirect)
export default function MyOrdersPage() {
  return <MyBookingsPage />;
}
