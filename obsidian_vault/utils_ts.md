---
source: /workspaces/Aura-sphere-/src/lib/utils.ts
filename: utils.ts
---

# utils.ts

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

