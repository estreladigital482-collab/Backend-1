---
source: /workspaces/Aura-sphere-/packages/frontend/src/components/AuthGateway.tsx
filename: AuthGateway.tsx
---

# AuthGateway.tsx

import { Button } from "@/components/ui/button";
import { useLocalAuth } from "@/hooks/useLocalAuth";
import { ParticleSphere } from "@/components/ParticleSphere";
import { useState } from "react";
import { toast } from "sonner";

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.2 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c2.9 0 5.5 1.1 7.5 2.8l5.7-5.7C33.6 6.5 29 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.4-.3-3.5z"/>
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 12.5 24 12.5c2.9 0 5.5 1.1 7.5 2.8l5.7-5.7C33.6 6.5 29 4.5 24 4.5 16.3 4.5 9.7 8.9 6.3 14.7z"/>
    <path fill="#4CAF50" d="M24 43.5c5 0 9.5-1.9 12.9-5.1l-6-5c-1.9 1.4-4.3 2.1-6.9 2.1-5.2 0-9.7-3.1-11.3-7.5l-6.6 5C9.6 39 16.3 43.5 24 43.5z"/>
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.4 5.4l6 5C40 35.4 43.5 30 43.5 24c0-1.2-.1-2.4-.3-3.5z"/>
  </svg>
);

interface AuthGatewayProps {
  onLocalStart: () => void;
  onGoogleAuth?: () => void;
}

export function AuthGateway({ onLocalStart, onGoogleAuth }: AuthGatewayProps) {
  const { createLocalSession } = useLocalAuth();
  const [isStarting, setIsStarting] = useState(false);

  const handleQuickStart = async () => {
    setIsStarting(true);
    try {
      createLocalSession("Visitante");
      toast.success("Bem-vindo à Aura Sphere!");
      onLocalStart();
    } catch (error) {
      toast.error("Erro ao iniciar");
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <main className="min-h-[100dvh] flex flex-col items-center justify-center px-6 py-10 text-center">
      <div className="w-full max-w-sm flex flex-col items-center gap-8">
        <div className="w-48 h-48 sm:w-56 sm:h-56">
          <ParticleSphere state="idle" />
        </div>
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-balance">
            Sua IA com voz e presença
          </h1>
          <p className="text-muted-foreground text-balance">
            Converse com Caos agora ou sincronize sua experiência com sua conta Google.
          </p>
        </div>

        <div className="w-full space-y-3">
          <Button
            onClick={handleQuickStart}
            disabled={isStarting}
            size="lg"
            variant="default"
            className="w-full gap-3 h-12"
          >
            {isStarting ? "Iniciando..." : "Começar Agora"}
          </Button>
          
          {onGoogleAuth && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-background text-muted-foreground">ou</span>
                </div>
              </div>

              <Button
                onClick={onGoogleAuth}
                size="lg"
                variant="secondary"
                className="w-full gap-3 h-12"
              >
                <GoogleIcon />
                Entrar com Google
              </Button>
            </>
          )}
        </div>

        <p className="text-xs text-muted-foreground max-w-xs">
          Modo local: acesse sem cadastro. Dados sincronizam quando você fizer login.
        </p>
      </div>
    </main>
  );
}

