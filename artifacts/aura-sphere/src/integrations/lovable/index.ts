// Lovable integration stub - not used in Replit environment
export const lovable = {
  auth: {
    signInWithOAuth: async (_provider: string, _opts?: unknown) => ({
      error: new Error("Lovable auth not available in Replit environment."),
    }),
  },
};
