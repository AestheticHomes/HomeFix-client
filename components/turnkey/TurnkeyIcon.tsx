// components/turnkey/TurnkeyIcon.tsx
"use client";

import type { TurnkeyIconName } from "./turnkeyStepsConfig";
import {
  Ruler,
  PanelsTopLeft,
  Shapes,
  Factory,
  HardHat,
  KeyRound,
} from "lucide-react";

interface Props {
  name: TurnkeyIconName;
  className?: string;
}

export function TurnkeyIcon({ name, className }: Props) {
  const shared = className ?? "h-4 w-4";

  switch (name) {
    case "tape":
      return <Ruler className={shared} />;
    case "blueprint":
      return <PanelsTopLeft className={shared} />;
    case "render":
      return <Shapes className={shared} />;
    case "factory":
      return <Factory className={shared} />;
    case "site":
      return <HardHat className={shared} />;
    case "key":
    default:
      return <KeyRound className={shared} />;
  }
}
