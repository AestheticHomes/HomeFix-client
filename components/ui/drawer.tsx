"use client";

import * as React from "react";
import * as DrawerPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

export const Drawer = DrawerPrimitive.Root;
export const DrawerTrigger = DrawerPrimitive.Trigger;
export const DrawerClose = DrawerPrimitive.Close;

export function DrawerContent({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof DrawerPrimitive.Content>) {
  return (
    <DrawerPrimitive.Portal>
      <DrawerPrimitive.Overlay className="fixed inset-0 bg-[var(--overlay-cta)] backdrop-blur-sm z-[55]" />
      <DrawerPrimitive.Content
        {...props}
        className={cn(
          // Above nav (z50) with its own scroll area so long drawers never hide behind nav
          "fixed bottom-0 left-0 right-0 z-[60] max-h-[80vh] overflow-y-auto rounded-t-3xl bg-card text-foreground shadow-lg border-t border-border",
          className
        )}
      >
        {children}
      </DrawerPrimitive.Content>
    </DrawerPrimitive.Portal>
  );
}

export const DrawerHeader = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "px-4 py-3 border-b border-slate-200 dark:border-slate-800",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const DrawerFooter = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "px-4 py-3 border-t border-slate-200 dark:border-slate-800",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const DrawerTitle = DrawerPrimitive.Title;
export const DrawerDescription = DrawerPrimitive.Description;
