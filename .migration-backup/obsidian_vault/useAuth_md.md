---
source: /workspaces/Aura-sphere-/knowledge_vault/Frontend/useAuth.md
filename: useAuth.md
---

# useAuth.md

---
category: Frontend
source: src/hooks/useAuth.ts
created: 2026-05-05T19:45:45.745168
size: 775 bytes
hash: 8f5eb649ce9bc3ada891846e7946c2d7
headers:
---

# useAuth.ts

## Metadados
- **Categoria**: Frontend
- **Caminho Original**: `src/hooks/useAuth.ts`
- **Tamanho**: 775 bytes

## Conteúdo

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return { session, user, loading };
}

## Tags
#categoria/frontend

