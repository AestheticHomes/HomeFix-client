"use client";
/**
 * ============================================================
 * 🎨 EdithButton — HomeFix UI Core v7.4
 * ------------------------------------------------------------
 * ✅ Type-safe (React + Framer Motion)
 * ✅ Light & Dark adaptive theme
 * ✅ Edith glow + depth transitions
 * ✅ Icon / loading support
 * ============================================================
 */

import clsx from "clsx";
import { motion, type HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";
import * as React from "react";

/* ------------------------------------------------------------
   🔧 Types
------------------------------------------------------------ */
type MergedButtonProps = HTMLMotionProps<"button"> &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    icon?: React.ElementType;
    isLoading?: boolean;
    variant?:
      | "primary"
      | "secondary"
      | "outline"
      | "ghost"
      | "danger"
      | "destructive";
    size?: "sm" | "md" | "lg" | "icon";
    children?: React.ReactNode;
  };

/* ------------------------------------------------------------
   🎨 Edith Button
------------------------------------------------------------ */
export const Button = React.forwardRef<HTMLButtonElement, MergedButtonProps>(
  (
    {
      children,
      onClick,
      variant = "primary",
      size = "md",
      disabled = false,
      isLoading = false,
      icon: Icon,
      className = "",
      type = "button",
      ...props
    },
    ref
  ) => {
    /* ------------------------------------------------------------
       🌗 Theme Styles (Edith-aware)
       Uses custom CSS variables:
       --edith-primary, --edith-surface, --edith-text
       These can be defined in globals.css or Tailwind config.
    ------------------------------------------------------------ */

    const baseStyles = clsx(
      "inline-flex items-center justify-center font-medium rounded-2xl select-none relative",
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--edith-accent)] focus-visible:ring-offset-2",
      "transition-all duration-200 active:scale-[0.98]",
      disabled && "opacity-60 cursor-not-allowed"
    );

    const variants: Record<string, string> = {
      primary:
        "bg-[var(--edith-primary)] text-[var(--edith-on-primary)] shadow-[0_2px_10px_rgba(90,93,240,0.35)] hover:shadow-[0_3px_14px_rgba(90,93,240,0.45)] dark:shadow-[0_2px_10px_rgba(236,110,207,0.3)] hover:dark:shadow-[0_3px_14px_rgba(236,110,207,0.45)]",
      secondary:
        "bg-[var(--edith-surface)] text-[var(--edith-text)] border border-[var(--edith-border)] hover:bg-[var(--edith-surface-hover)]",
      outline:
        "border border-[var(--edith-border)] text-[var(--edith-text)] hover:bg-[var(--edith-surface-hover)] dark:hover:bg-[var(--edith-surface-dark-hover)]",
      ghost:
        "bg-transparent text-[var(--edith-text)] hover:bg-[var(--edith-surface-hover)] dark:hover:bg-[var(--edith-surface-dark-hover)]",
      danger:
        "bg-red-600 text-white hover:bg-red-700 shadow-[0_2px_8px_rgba(220,38,38,0.35)]",
      destructive:
        "bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700 shadow-[0_2px_8px_rgba(220,38,38,0.35)]",
    };

    const sizes: Record<string, string> = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-base",
      lg: "px-6 py-3 text-lg",
      icon: "p-2 w-10 h-10 justify-center",
    };

    const showIcon = isLoading || Icon;

    return (
      <motion.button
        ref={ref}
        type={type}
        whileTap={{ scale: disabled ? 1 : 0.96 }}
        whileHover={{
          scale: disabled ? 1 : 1.02,
          y: disabled ? 0 : -1,
          boxShadow: disabled ? undefined : "0 6px 12px rgba(90,93,240,0.25)",
        }}
        disabled={disabled || isLoading}
        onClick={onClick}
        className={clsx(
          baseStyles,
          variants[variant],
          sizes[size],
          "transition-shadow ease-out",
          className
        )}
        {...props}
      >
        {/* Left Icon / Loader */}
        {showIcon && (
          <span
            className={clsx(
              "inline-flex items-center justify-center",
              children ? "mr-2" : ""
            )}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              Icon && <Icon className="w-4 h-4" />
            )}
          </span>
        )}

        {/* Label */}
        {children && <span className="whitespace-nowrap">{children}</span>}
      </motion.button>
    );
  }
);

Button.displayName = "Button";

export default Button;
