"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ConsultationRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/services/start-turnkey");
  }, [router]);

  return null;
}
