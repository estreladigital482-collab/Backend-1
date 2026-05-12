import { useEffect, useState } from "react";
import { useLocalAuth } from "@/hooks/useLocalAuth";
import { useSyncService } from "@/hooks/useSyncService";
import { useAuth } from "@/hooks/useAuth";
import { AuthGateway } from "@/components/AuthGateway";
import { SyncStatus } from "@/components/SyncStatus";
import { supabase } from "@/integrations/supabase/client";
import Onboarding from "./Onboarding";
import AIOnShell from "@/components/AIOnShell";

type Profile = {
  ai_name: string | null;
  voice_id: string | null;
  onboarded: boolean;
};

const Index = () => {
  const { user: googleUser, loading: googleLoading } = useAuth();
  const { user: localUser, isOnline } = useLocalAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string; name?: string; isLocal?: boolean } | null>(null);
  // Serviço de sincronização
  const { performFullSync, migrateLocalData } = useSyncService({
    userId: currentUser?.id || '',
    isOnline,
    onSyncComplete: (success, syncedCount) => {
      if (success && syncedCount > 0) {
        console.log(`${syncedCount} mensagens sincronizadas com sucesso`);
      }
    },
  });
  const [hasMigratedLocalData, setHasMigratedLocalData] = useState(false);

  useEffect(() => {
    if (googleUser) {
      setCurrentUser(googleUser);
    } else if (localUser?.isLocal) {
      setCurrentUser(localUser);
    }
  }, [googleUser, localUser]);

  useEffect(() => {
    if (isOnline && currentUser?.id && localUser?.isLocal) {
      performFullSync();
    }
  }, [isOnline, currentUser?.id, localUser?.isLocal, performFullSync]);

  useEffect(() => {
    if (googleUser && localUser?.isLocal && !hasMigratedLocalData) {
      migrateLocalData(googleUser.id).then((success) => {
        if (success) {
          setHasMigratedLocalData(true);
        }
      });
    }
  }, [googleUser, localUser, hasMigratedLocalData, migrateLocalData]);

  // Modo demonstração - bypass autenticação
  const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true' || window.location.search.includes('demo=true');

  useEffect(() => {
    if (!currentUser && !isDemoMode) {
      setProfile(null);
      return;
    }
    setProfileLoading(true);

    if (isDemoMode) {
      // Modo demo: perfil fixo
      setProfile({
        ai_name: "Caos",
        voice_id: "pt-female",
        onboarded: true
      });
      setProfileLoading(false);
      return;
    }

    // Para usuários locais, usar perfil padrão
    if (localUser?.isLocal) {
      setProfile({
        ai_name: localUser.name || "Caos",
        voice_id: "pt-female",
        onboarded: true
      });
      setProfileLoading(false);
      return;
    }

    // Para usuários Google, buscar do Supabase
    supabase
      .from("profiles")
      .select("ai_name, voice_id, onboarded")
      .eq("id", currentUser.id)
      .maybeSingle()
      .then(async ({ data }) => {
        if (!data) {
          // Criar perfil padrão automaticamente
          const defaultProfile = {
            id: currentUser.id,
            ai_name: "Caos",
            voice_id: "pt-female",
            onboarded: true
          };
          await supabase.from("profiles").insert(defaultProfile);
          setProfile(defaultProfile);
        } else {
          setProfile(data);
        }
        setProfileLoading(false);
      });
  }, [currentUser, isDemoMode, localUser]);

  // Se não há usuário autenticado, mostrar gateway de autenticação
  if (!currentUser && !isDemoMode) {
    return <AuthGateway onAuthenticated={setCurrentUser} />;
  }

  if (googleLoading || (currentUser && profileLoading)) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center text-muted-foreground text-sm">
        Carregando…
      </div>
    );
  }

  // Modo demo: vai direto para AIOnShell
  if (isDemoMode) {
    return (
      <div className="min-h-[100dvh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b bg-white/80 backdrop-blur-sm">
          <h1 className="text-lg font-semibold">Aura Sphere - Modo Demo</h1>
          <SyncStatus />
        </div>
        <div className="flex-1">
          <AIOnShell
            userId="demo-user"
            aiName="Caos"
            voiceId="pt-female"
            onEditProfile={() => {}}
            onSignOut={() => window.location.href = '/'}
          />
        </div>
      </div>
    );
  }

  // Para usuários locais, ir direto para AIOnShell
  if (currentUser?.isLocal && localUser?.isLocal) {
    return (
      <div className="min-h-[100dvh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b bg-white/80 backdrop-blur-sm">
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
            voiceId="pt-female"
            onEditProfile={() => {}}
            onSignOut={() => {
              setCurrentUser(null);
              window.location.reload();
            }}
          />
        </div>
      </div>
    );
  }

  // Para usuários Google, verificar onboarding
  if (!profile?.onboarded || editing) {
    return (
      <Onboarding
        userId={currentUser.id}
        onDone={async () => {
          const { data } = await supabase
            .from("profiles")
            .select("ai_name, voice_id, onboarded")
            .eq("id", currentUser.id)
            .maybeSingle();
          setProfile(data ?? null);
          setEditing(false);
        }}
      />
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <div className="flex justify-between items-center p-4 border-b bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold">Aura Sphere</h1>
          <span className="text-sm text-muted-foreground">- {profile?.ai_name || 'Caos'}</span>
        </div>
        <SyncStatus />
      </div>
      <div className="flex-1">
        <AIOnShell
          userId={currentUser.id}
          aiName={profile?.ai_name || "Caos"}
          voiceId={profile?.voice_id || "pt-female"}
          onEditProfile={() => setEditing(true)}
          onSignOut={async () => {
            await supabase.auth.signOut();
            setCurrentUser(null);
          }}
        />
      </div>
    </div>
  );
};

export default Index;
