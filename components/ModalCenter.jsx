"use client";
/**
 * File: /components/ModalCenter.jsx
 * Purpose: (auto-added during Portable Cleanup) — add a concise, human-readable purpose for this file.
 * Process: Part of HomeFix portable refactor; no functional changes made by header.
 * Dependencies: Review local imports; ensure single supabase client in /lib when applicable.
 * Note: This header is documentation-only and safe to remove or edit.
 */

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * ModalCenter — universal wrapper to center modals & popups
 * Keeps your current motion/animation code unchanged.
 */
export default function ModalCenter({
  children,
  onClose,
  z = 9999,
  closeOnBackdrop = true,
  backdropClassName = "bg-black/50 backdrop-blur-sm",
  containerClassName = "w-[90%] max-w-md mx-auto",
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-[${z}] flex items-center justify-center ${backdropClassName}`}
      onClick={closeOnBackdrop ? onClose : undefined}
    >
      <div
        className={`relative ${containerClassName}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}