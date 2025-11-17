"use client";

import { create } from "zustand";

type DesignState = {
  initialCategory?: string | null;
  setInitialCategory: (category: string | null) => void;
};

export const useDesignStore = create<DesignState>((set) => ({
  initialCategory: null,
  setInitialCategory: (category) => set({ initialCategory: category }),
}));
