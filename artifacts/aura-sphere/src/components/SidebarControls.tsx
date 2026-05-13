import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useLocalAuth } from '@/hooks/useLocalAuth';
import { useToast } from '@/hooks/use-toast';
import {
  MessageCircle,
  Code,
  Calendar,
  FolderOpen,
  Brain,
  Image,
  Mic,
  Zap,
  Palette,
  Settings,
  Minimize2,
  X,
  Sparkles
} from 'lucide-react';

interface SidebarControlsProps {
  activeMode: string;
  onModeChange: (mode: string) => void;
  onMinimize: () => void;
  onClose: () => void;
  aiName: string;
  voiceId: string;
  onEditProfile: () => void;
  onSignOut: () => void;
}

const MODES = [
  { id: "Chat", label: "Chat", icon: MessageCircle, color: "text-blue-500" },
  { id: "Habilidades", label: "Habilidades", icon: Sparkles, color: "text-violet-400" },
  { id: "Código", label: "Código", icon: Code, color: "text-green-500" },
  { id: "Planejamento", label: "Planejamento", icon: Calendar, color: "text-purple-500" },
  { id: "Projetos", label: "Projetos", icon: FolderOpen, color: "text-orange-500" },
  { id: "Memória", label: "Memória", icon: Brain, color: "text-pink-500" },
  { id: "Imagem", label: "Imagem", icon: Image, color: "text-cyan-500" },
  { id: "Voz", label: "Voz", icon: Mic, color: "text-red-500" },
  { id: "Automação", label: "Automação", icon: Zap, color: "text-yellow-500" },
  { id: "Visual", label: "Visual", icon: Palette, color: "text-indigo-500" },
  { id: "Dev Mode", label: "Dev Mode", icon: Settings, color: "text-gray-500" },
];

export function SidebarControls({
  activeMode,
  onModeChange,
  onMinimize,
  onClose,
  aiName,
  voiceId,
  onEditProfile,
  onSignOut
}: SidebarControlsProps) {
  const { user } = useLocalAuth();
  const { toast } = useToast();
  const [projectName, setProjectName] = useState("");
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [memoryQuery, setMemoryQuery] = useState("");
  const [imagePrompt, setImagePrompt] = useState("");
  const [voiceText, setVoiceText] = useState("Olá, estou testando a voz da assistente.");

  const addProject = async () => {
    if (!projectName.trim()) return;
    if (!user?.id) {
      toast({
        title: "Erro",
        description: "Você precisa estar autenticado para criar um projeto",
        variant: "destructive"
      });
      return;
    }
    
    setIsCreatingProject(true);
    try {
      const response = await fetch('/api/v1/planning/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          title: projectName,
          description: "",
          status: "planning"
        })
      });

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Projeto criado com sucesso!",
        });
        setProjectName("");
      } else {
        throw new Error('Erro ao criar projeto');
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar o projeto",
        variant: "destructive"
      });
      console.error('Erro ao criar projeto:', error);
    } finally {
      setIsCreatingProject(false);
    }
  };

  return (
    <div className="w-80 h-full bg-slate-950/95 backdrop-blur-2xl border-r border-white/10 shadow-2xl shadow-black/30 flex flex-col animate-fade-in">
      {/* Header */}
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-white">{aiName}</h2>
            <p className="text-sm text-slate-400">Assistente IA</p>
          </div>
          <div className="rounded-3xl bg-slate-800/80 px-3 py-1 text-xs uppercase tracking-[0.25em] text-violet-300 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]">
            Caos
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between gap-3 rounded-3xl bg-slate-900/70 px-3 py-2 text-xs text-slate-300">
          <span className="inline-flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-glow-primary" /> Online
          </span>
          <span>{voiceId}</span>
        </div>
      </div>

      {/* Modos */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-3">MODOS</h3>
          <div className="grid grid-cols-2 gap-2">
            {MODES.map((mode) => {
              const Icon = mode.icon;
              return (
                <Button
                  key={mode.id}
                  variant={activeMode === mode.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onModeChange(mode.id)}
                  className={`justify-start gap-2 h-auto py-3 px-3 ${
                    activeMode === mode.id
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon size={16} className={mode.color} />
                  <span className="text-xs">{mode.label}</span>
                </Button>
              );
            })}
          </div>
        </div>

        <Separator className="bg-white/10" />

        {/* Controles específicos por modo */}
        {activeMode === "Projetos" && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-300">NOVO PROJETO</h3>
            <div className="space-y-2">
              <Input
                placeholder="Nome do projeto"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="bg-white/5 border-white/20 text-white placeholder:text-gray-500"
              />
              <Button 
                onClick={addProject} 
                className="w-full" 
                size="sm"
                disabled={isCreatingProject || !projectName.trim()}
              >
                {isCreatingProject ? "Criando..." : "Criar Projeto"}
              </Button>
            </div>
          </div>
        )}

        {activeMode === "Memória" && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-300">PESQUISAR MEMÓRIA</h3>
            <div className="space-y-2">
              <Input
                placeholder="Digite para buscar..."
                value={memoryQuery}
                onChange={(e) => setMemoryQuery(e.target.value)}
                className="bg-white/5 border-white/20 text-white placeholder:text-gray-500"
              />
              <Button className="w-full" size="sm">
                Buscar
              </Button>
            </div>
          </div>
        )}

        {activeMode === "Imagem" && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-300">GERAR IMAGEM</h3>
            <div className="space-y-2">
              <Textarea
                placeholder="Descreva a imagem..."
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 min-h-[80px]"
              />
              <Button className="w-full" size="sm">
                Gerar
              </Button>
            </div>
          </div>
        )}

        {activeMode === "Voz" && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-300">TESTAR VOZ</h3>
            <div className="space-y-2">
              <Textarea
                placeholder="Texto para falar..."
                value={voiceText}
                onChange={(e) => setVoiceText(e.target.value)}
                className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 min-h-[80px]"
              />
              <Button className="w-full" size="sm">
                Falar
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-5 border-t border-white/10 space-y-3">
        <Button
          variant="ghost"
          onClick={onEditProfile}
          className="w-full justify-start rounded-3xl text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200"
        >
          <Settings size={16} className="mr-2" />
          Configurações
        </Button>
        <Button
          variant="ghost"
          onClick={onSignOut}
          className="w-full justify-start rounded-3xl text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200"
        >
          Sair
        </Button>
      </div>
    </div>
  );
}