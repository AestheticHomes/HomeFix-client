"use client";
/**
 * File: /components/ui/button.tsx
 * Purpose: Final type-safe motion-enabled button for HomeFix India.
 * Fixes prop conflicts between React + Framer Motion.
 */

import * as React from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { Loader2 } from "lucide-react";
import clsx from "clsx";

/**
 * Combined type — safely merges React + Framer props
 */
type MergedButtonProps = HTMLMotionProps<"button"> &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    icon?: React.ElementType;
    isLoading?: boolean;
    variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
    size?: "sm" | "md" | "lg";
    children?: React.ReactNode; // 🔧 override to resolve MotionValue conflicts
  };

/**
 * Motion + Tailwind + Accessible Button Component
 */
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
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98] select-none";

    const variants: Record<string, string> = {
      primary:
        "bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-500 shadow-sm hover:shadow-md",
      secondary:
        "bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600 focus-visible:ring-slate-400",
      outline:
        "border border-gray-300 dark:border-slate-600 text-gray-800 dark:text-slate-100 hover:bg-gray-100 dark:hover:bg-slate-800 focus-visible:ring-slate-400",
      ghost:
        "bg-transparent text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 focus-visible:ring-slate-400",
      danger:
        "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
    };

    const sizes: Record<string, string> = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-base",
      lg: "px-6 py-3 text-lg",
    };

    const showIcon = isLoading || Icon;

    return (
      <motion.button
        ref={ref}
        type={type}
        whileTap={{ scale: disabled ? 1 : 0.96 }}
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        disabled={disabled || isLoading}
        onClick={onClick}
        className={clsx(
          baseStyles,
          variants[variant],
          sizes[size],
          disabled && "opacity-60 cursor-not-allowed",
          className
        )}
        {...props}
      >
        {showIcon && (
          <span className="mr-2 inline-flex items-center justify-center">
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              Icon && <Icon className="w-4 h-4" />
            )}
          </span>
        )}
        <span>{children}</span>
      </motion.button>
    );
  }
);

Button.displayName = "Button";

export default Button;
