import { useEffect, useState } from "react";
import { ParticleSphere } from "@/components/ParticleSphere";
import { LoadingScreen } from "@/components/LoadingScreen";
import { PlanningTab } from "@/components/PlanningTab";
import { MiniOverlay } from "@/components/MiniOverlay";
import { SidebarControls } from "@/components/SidebarControls";
import { ModeSelector } from "@/components/ModeSelector";
import { TVMode } from "@/components/TVMode";
import { VoiceMode } from "@/components/VoiceMode";
import { VersionDashboard } from "@/components/VersionDashboard";
import { MemoryViewer } from "@/components/MemoryViewer";
import { SyncPanel } from "@/components/SyncPanel";
import Chat from "@/pages/Chat";
import { speak } from "@/lib/speech";
import { useLocalAuth } from "@/hooks/useLocalAuth";
import type { AiMode, SphereState, VoiceId } from "@/lib/types";

const AI_MODES: { id: AiMode; label: string; description: string }[] = [
  { id: "Chat", label: "Chat", description: "Converse naturalmente com a IA para ideias, respostas e ações rápidas." },
  { id: "Código", label: "Código", description: "Gere, revise e aprimore código com assistência contextual." },
  { id: "Planejamento", label: "Planejamento", description: "Crie planos de estudo, gerencie tarefas e acompanhe progresso com barras visuais." },
  { id: "Projetos", label: "Projetos", description: "Organize tarefas, cronogramas e objetivos de desenvolvimento." },
  { id: "Memória", label: "Memória", description: "Armazene e recupere informações importantes em contexto." },
  { id: "Imagem", label: "Imagem", description: "Crie imagens rápidas com prompts inteligentes." },
  { id: "Voz", label: "Voz", description: "Fale com a IA e ajuste a assistente de voz." },
  { id: "Automação", label: "Automação", description: "Defina fluxos e rotinas para automatizar tarefas." },
  { id: "Visual", label: "Visual", description: "Personalize a aparência e interface gráfica do sistema." },
  { id: "Dev Mode", label: "Dev Mode", description: "Acesse ferramentas de desenvolvedor e informações do ambiente." },
];

type UiMode = "standard" | "tv" | "voice" | "developer";

export default function AIOnShell({
  userId,
  aiName,
  voiceId,
  onSignOut,
  onEditProfile,
}: {
  userId: string;
  aiName: string;
  voiceId: VoiceId | string;
  onSignOut: () => void;
  onEditProfile: () => void;
}) {
  const { isOnline } = useLocalAuth();
  const [activeMode, setActiveMode] = useState<AiMode>("Chat");
  const [uiMode, setUiMode] = useState<UiMode>("standard");
  const [isMinimized, setIsMinimized] = useState(false);
  const [hasWelcomed, setHasWelcomed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showInitialPresentation, setShowInitialPresentation] = useState(true);
  const [selectedMemory, setSelectedMemory] = useState<{
    id: string;
    content: string;
    category: string;
    tags: string[];
    relevance: number;
  } | null>(null);

  // Tela de carregamento finalizada
  const handleLoadingComplete = () => {
    setIsLoading(false);
    // Mostrar apresentação da esfera por 3 segundos
    setTimeout(() => {
      setShowInitialPresentation(false);
      setHasWelcomed(true);
    }, 3000);
  };

  // Se está carregando, mostrar tela de carregamento
  if (isLoading) {
    return (
      <LoadingScreen
        aiName={aiName}
        voiceId={voiceId}
        onLoadingComplete={handleLoadingComplete}
      />
    );
  }

  // Tela de apresentação inicial
  if (showInitialPresentation) {
    return (
      <div className="h-screen w-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-6">
          <ParticleSphere
            state="responding"
            shape="sphere"
            className="w-40 h-40 mx-auto"
          />
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-white">{aiName}</h1>
            <p className="text-xl text-gray-400">
              Sua assistente de IA está pronta
            </p>
          </div>
        </div>
      </div>
    );
  }

  const sphereState: SphereState = activeMode === "Voz" ? "listening" : activeMode === "Chat" ? "responding" : "idle";
  const sphereShape =
    activeMode === "Imagem"
      ? "galaxy"
      : activeMode === "Código"
      ? "cube"
      : activeMode === "Projetos"
      ? "torus"
      : activeMode === "Memória"
      ? "wave"
      : activeMode === "Visual"
      ? "heart"
      : activeMode === "Automação"
      ? "question"
      : "sphere";

  const renderModeContent = () => {
    if (uiMode !== "standard") {
      return (
        <div className="h-full w-full">
          {uiMode === "tv" && <TVMode />}
          {uiMode === "voice" && <VoiceMode />}
          {uiMode === "developer" && <DeveloperMode />}
        </div>
      );
    }

    switch (activeMode) {
      case "Chat":
        return (
          <Chat
            userId={userId}
            aiName={aiName}
            voiceId={voiceId}
            onEditProfile={onEditProfile}
            onSignOut={onSignOut}
            onRequestMode={(mode) => setActiveMode(mode)}
            selectedMemory={selectedMemory}
            onMemoryUse={() => setSelectedMemory(null)}
          />
        );
      case "Memória":
        return (
          <div className="h-full p-6 overflow-auto">
            <MemoryViewer
              userId={userId}
              onMemorySelect={(memory) => {
                setSelectedMemory(memory);
                setActiveMode('Chat');
              }}
            />
          </div>
        );
      case "Planejamento":
        return <VisualMode />;
      case "Dev Mode":
        return (
          <div className="h-full p-6 overflow-auto">
            <VersionDashboard
              currentVersion="1.2.3"
              onVersionChange={(versionId) => {
                console.log('Mudando para versão:', versionId);
                // Integração futura: implementar mudança de versão
              }}
            />
          </div>
        );
      default:
        return (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <ParticleSphere
                state={sphereState}
                shape={sphereShape}
                className="w-32 h-32 mx-auto"
              />
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Modo {AI_MODES.find(m => m.id === activeMode)?.label}
                </h2>
                <p className="text-gray-400 max-w-md">
                  {AI_MODES.find(m => m.id === activeMode)?.description}
                </p>
              </div>
            </div>
          </div>
        );
    }
  };

  if (isMinimized) {
    return (
      <MiniOverlay
        onClick={() => setIsMinimized(false)}
        isMinimized={isMinimized}
      />
    );
  }

  return (
    <div className="h-screen w-screen bg-black flex flex-col md:flex-row">
      {/* Sidebar lateral - oculto em mobile, mostrado como overlay */}
      <div className="hidden md:block">
        <SidebarControls
          activeMode={activeMode}
          onModeChange={setActiveMode}
          onMinimize={() => setIsMinimized(true)}
          onClose={onSignOut}
          aiName={aiName}
          voiceId={voiceId}
          onEditProfile={onEditProfile}
          onSignOut={onSignOut}
        />
      </div>

      {/* Menu mobile - bottom navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-white/10 z-50">
        <div className="flex justify-around items-center py-2 px-4">
          {AI_MODES.slice(0, 5).map((mode) => (
            <button
              key={mode.id}
              onClick={() => setActiveMode(mode.id)}
              className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                activeMode === mode.id
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className="text-xs font-medium">{mode.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="flex-1 bg-gradient-to-br from-gray-900 via-black to-gray-900 overflow-hidden pb-16 md:pb-0">
        {/* Header mobile */}
        <div className="md:hidden p-4 bg-slate-950/20 border-b border-white/5 space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-white">{aiName}</h1>
              <span className="text-sm text-gray-400">
                {AI_MODES.find(m => m.id === activeMode)?.label}
              </span>
            </div>
            <ModeSelector value={uiMode} onChange={setUiMode} />
          </div>
          <SyncPanel userId={userId} isOnline={isOnline} />
        </div>

        {/* Header desktop */}
        <div className="hidden md:block p-4 bg-slate-950/20 border-b border-white/5 space-y-3">
          <div className="flex justify-between items-center mb-3">
            <ModeSelector value={uiMode} onChange={setUiMode} />
          </div>
          <SyncPanel userId={userId} isOnline={isOnline} />
        </div>

        {renderModeContent()}
      </div>
    </div>
  );
}
