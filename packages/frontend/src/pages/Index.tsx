import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocalAuth } from "@/hooks/useLocalAuth";
import { supabase } from "@/integrations/supabase/client";
import { AuthGateway } from "@/components/AuthGateway";
import Login from "./Login";
import Onboarding from "./Onboarding";
import Chat from "./Chat";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";

type Profile = {
  ai_name: string | null;
  voice_id: string | null;
  onboarded: boolean;
};

const Index = () => {
  const { user, loading: cloudLoading } = useAuth();
  const { user: localUser, loading: localLoading, isOffline, updateOfflineMode, createLocalSession, clearLocalSession } = useLocalAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [useCloud, setUseCloud] = useState(!!user);

  // Sincronizar entre cloud e local
  useEffect(() => {
    if (user && localUser && !useCloud) {
      setUseCloud(true);
    }
  }, [user, localUser, useCloud]);

  useEffect(() => {
    const currentUser = useCloud ? user : localUser;
    if (!currentUser) {
      setProfile(null);
      return;
    }

    if (currentUser.isLocal) {
      // Usuário local - usar localStorage para profile
      setProfile({
        ai_name: localStorage.getItem(`ai_name_${currentUser.id}`) || "Caos",
        voice_id: localStorage.getItem(`voice_id_${currentUser.id}`) || "pt-female",
        onboarded: localStorage.getItem(`onboarded_${currentUser.id}`) === "true",
      });
      setProfileLoading(false);
    } else {
      // Usuário cloud - buscar do Supabase
      setProfileLoading(true);
      supabase
        .from("profiles")
        .select("ai_name, voice_id, onboarded")
        .eq("id", currentUser.id)
        .maybeSingle()
        .then(({ data }) => {
          setProfile(data ?? { ai_name: null, voice_id: null, onboarded: false });
          setProfileLoading(false);
        });
    }
  }, [useCloud, user, localUser]);

  const handleGoogleSignIn = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Não foi possível entrar com Google");
    }
  };

  const handleSignOut = async () => {
    if (useCloud) {
      await supabase.auth.signOut();
      setUseCloud(false);
    } else {
      clearLocalSession();
    }
  };

  const currentUser = useCloud ? user : localUser;
  const loading = useCloud ? cloudLoading : localLoading;

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center text-muted-foreground text-sm">
        Carregando…
      </div>
    );
  }

  if (!currentUser) {
    return (
      <AuthGateway
        onLocalStart={() => {
          setUseCloud(false);
        }}
        onGoogleAuth={handleGoogleSignIn}
      />
    );
  }

  if (!profile?.onboarded || editing) {
    return (
      <Onboarding
        userId={currentUser.id}
        isLocal={currentUser.isLocal}
        onDone={async () => {
          if (currentUser.isLocal) {
            setProfile({
              ai_name: localStorage.getItem(`ai_name_${currentUser.id}`) || "Caos",
              voice_id: localStorage.getItem(`voice_id_${currentUser.id}`) || "pt-female",
              onboarded: localStorage.getItem(`onboarded_${currentUser.id}`) === "true",
            });
          } else {
            const { data } = await supabase
              .from("profiles")
              .select("ai_name, voice_id, onboarded")
              .eq("id", currentUser.id)
              .maybeSingle();
            setProfile(data ?? null);
          }
          setEditing(false);
        }}
      />
    );
  }

  return (
    <Chat
      userId={currentUser.id}
      isLocal={currentUser.isLocal}
      isOffline={isOffline}
      aiName={profile.ai_name || "Caos"}
      voiceId={profile.voice_id || "pt-female"}
      onEditProfile={() => setEditing(true)}
      onSignOut={handleSignOut}
      onToggleOffline={updateOfflineMode}
    />
  );
};

export default Index;
