"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useDesignStore } from "@/lib/useDesignStore";

export function useInitialCategory() {
  const searchParams = useSearchParams();
  const setInitialCategory = useDesignStore((s) => s.setInitialCategory);

  useEffect(() => {
    const category = searchParams?.get("category");
    if (category) {
      setInitialCategory(category);
    }
  }, [searchParams, setInitialCategory]);
}
