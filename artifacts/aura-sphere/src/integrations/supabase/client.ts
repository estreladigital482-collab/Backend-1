// Supabase replaced with Replit API backend.
// This stub keeps imports working.

type Session = {
  user: {
    id: string;
    email?: string;
  };
  access_token: string;
} | null;

type AuthChangeEvent = string;
type Subscription = { unsubscribe: () => void };

const noopSub = { subscription: { unsubscribe: () => {} } };

export const supabase = {
  auth: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    signInWithOAuth: async (_opts: unknown) => ({ error: new Error("Google OAuth not configured. Use local mode.") }),
    signOut: async () => ({ error: null }),
    getSession: async () => ({ data: { session: null as Session } }),
    onAuthStateChange: (_cb: (event: AuthChangeEvent, session: Session) => void) => noopSub,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setSession: async (_tokens: unknown) => ({ error: null }),
  },
  from: (table: string) => {
    const q = {
      _table: table,
      select: (_cols?: string) => q,
      eq: (_col: string, _val: unknown) => q,
      order: (_col: string, _opts?: unknown) => q,
      limit: (_n: number) => q,
      maybeSingle: async () => ({ data: null, error: null }),
      single: async () => ({ data: null, error: null }),
      insert: async (_data: unknown) => ({ error: null }),
      upsert: async (_data: unknown) => ({ error: null }),
      update: (_data: unknown) => q,
      delete: () => q,
    };
    return q;
  },
};
