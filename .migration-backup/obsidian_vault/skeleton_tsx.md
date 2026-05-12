---
source: /workspaces/Aura-sphere-/src/components/ui/skeleton.tsx
filename: skeleton.tsx
---

# skeleton.tsx

import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} {...props} />;
}

export { Skeleton };

