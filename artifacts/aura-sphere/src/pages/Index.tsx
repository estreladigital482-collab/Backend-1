import { useEffect, useState } from "react";
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
  const { user: localUser } = useLocalAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string; name?: string; isLocal?: boolean } | null>(null);

  useEffect(() => {
    if (localUser?.isLocal) {
      setCurrentUser(localUser);
    }
  }, [localUser]);

  const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true' || window.location.search.includes('demo=true');

  useEffect(() => {
    if (!currentUser && !isDemoMode) {
      setProfile(null);
      return;
    }

    if (isDemoMode) {
      setProfile({ ai_name: "Caos", voice_id: "pt-female", onboarded: true });
      return;
    }

    if (localUser?.isLocal) {
      setProfile({
        ai_name: localUser.name || "Caos",
        voice_id: "pt-female",
        onboarded: true,
      });
    }
  }, [currentUser, isDemoMode, localUser]);

  if (!currentUser && !isDemoMode) {
    return <AuthGateway onAuthenticated={setCurrentUser} />;
  }

  if (isDemoMode) {
    return (
      <div className="min-h-[100dvh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b bg-black/80 backdrop-blur-sm">
          <h1 className="text-lg font-semibold">Aura Sphere - Modo Demo</h1>
          <SyncStatus />
        </div>
        <div className="flex-1">
          <AIOnShell
            userId="demo-user"
            aiName="Caos"
            voiceId="pt-female"
            onEditProfile={() => {}}
            onSignOut={() => (window.location.href = "/")}
          />
        </div>
      </div>
    );
  }

  if (currentUser?.isLocal && localUser?.isLocal) {
    if (!profile?.onboarded || editing) {
      return (
        <Onboarding
          userId={currentUser.id}
          onDone={() => {
            setProfile({ ai_name: localUser.name || "Caos", voice_id: "pt-female", onboarded: true });
            setEditing(false);
          }}
        />
      );
    }

    return (
      <div className="min-h-[100dvh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b bg-black/80 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold">Aura Sphere</h1>
            <span className="text-sm text-muted-foreground">- {localUser.name}</span>
          </div>
          <SyncStatus />
        </div>
        <div className="flex-1">
          <AIOnShell
            userId={localUser.id}
            aiName={localUser.name}
            voiceId={profile?.voice_id || "pt-female"}
            onEditProfile={() => setEditing(true)}
            onSignOut={() => {
              setCurrentUser(null);
              window.location.reload();
            }}
          />
        </div>
      </div>
    );
  }

  return null;
};

export default Index;
