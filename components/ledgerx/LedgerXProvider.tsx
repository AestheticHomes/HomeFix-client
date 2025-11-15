"use client";

import { useLedgerX } from "@/components/ledgerx/useLedgerX";
import { useUser } from "@/contexts/UserContext";
import { useEffect } from "react";

export default function LedgerXProvider({ children }: any) {
  const { user, isLoaded } = useUser();
  const { load } = useLedgerX();

  useEffect(() => {
    if (!isLoaded || !user?.id) return;

    // Load Dexie immediately after user loads
    load(user.id);
  }, [isLoaded, user?.id, load]);

  return <>{children}</>;
}
