import { ClipboardList } from "lucide-react";
import Link from "next/link";

<Link
  href="/my-orders"
  className="flex flex-col items-center text-xs opacity-80 hover:opacity-100 transition"
>
  <ClipboardList className="w-5 h-5 mb-1" />
  Orders
</Link>;
