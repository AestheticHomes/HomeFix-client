"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ConsultationRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/full-home-packages");
  }, [router]);

  return null;
}
