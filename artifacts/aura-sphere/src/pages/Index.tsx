import { useEffect, useState } from "react";
import { useUser, useAuth } from "@clerk/react";
import { useLocalAuth } from "@/hooks/useLocalAuth";
import { AuthGateway } from "@/components/AuthGateway";
import { SyncStatus } from "@/components/SyncStatus";
import Onboarding from "./Onboarding";
import AIOnShell from "@/components/AIOnShell";

type Profile = {
  ai_name: string | null;
  voice_id: string | null;
  onboarded: boolean;
};

const Index = () => {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const { isSignedIn } = useAuth();
  const { user: localUser } = useLocalAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id: string; name?: string; isLocal?: boolean } | null>(null);

  const isDemoMode = import.meta.env.VITE_DEMO_MODE === "true" || window.location.search.includes("demo=true");

  useEffect(() => {
    if (!clerkLoaded) return;

    if (isDemoMode) {
      setCurrentUser({ id: "demo_user", name: "Caos" });
      setProfile({ ai_name: "Caos", voice_id: "pt-female", onboarded: true });
      return;
    }

    if (isSignedIn && clerkUser) {
      const name = clerkUser.firstName || clerkUser.username || "Caos";
      setCurrentUser({ id: clerkUser.id, name });
      setProfile({ ai_name: "Caos", voice_id: "pt-female", onboarded: true });
      return;
    }

    if (localUser?.isLocal) {
      setCurrentUser(localUser);
      setProfile({
        ai_name: localUser.name || "Caos",
        voice_id: "pt-female",
        onboarded: true,
      });
      return;
    }

    setCurrentUser(null);
    setProfile(null);
  }, [clerkLoaded, isSignedIn, clerkUser, localUser, isDemoMode]);

  if (!clerkLoaded) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!currentUser && !isDemoMode) {
    return <AuthGateway onAuthenticated={setCurrentUser} />;
  }

  if (!profile) {
    return (
      <Onboarding
        userId={currentUser!.id}
        onComplete={(p) => setProfile(p)}
      />
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col">
      {isDemoMode && (
        <div className="flex justify-between items-center p-4 border-b bg-black/80 backdrop-blur-sm">
          <h1 className="text-lg font-semibold">Caos - Modo Demo</h1>
          <SyncStatus />
        </div>
      )}
      <div className="flex-1">
        <AIOnShell
          userId={currentUser!.id}
          aiName={profile.ai_name ?? "Caos"}
          voiceId={(profile.voice_id as "pt-female" | "pt-male" | "en-female") ?? "pt-female"}
          onLogout={() => {
            setCurrentUser(null);
            setProfile(null);
          }}
        />
      </div>
    </div>
  );
};

export default Index;
