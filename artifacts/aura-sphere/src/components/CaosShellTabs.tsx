import React, { useEffect, useState } from 'react';
import { BarChart3, CheckCircle2, Zap, Settings, Package, Layers, Smartphone, Shield, DollarSign, Palette, Sparkles, GitBranch } from 'lucide-react';
import { Dashboard } from './Dashboard';
import { PlanningTab } from './PlanningTab';
import { ActionQueue } from './ActionQueue';
import { MemoryVisualizer } from './MemoryVisualizer';
import { AbilitiesGallery } from './AbilitiesGallery';
import { SecurityDashboard } from './SecurityDashboard';
import { CostTracker } from './CostTracker';
import { ThemeBuilder } from './ThemeBuilder';
import { ThemeGallery } from './ThemeGallery';
import { RepositoryStudy } from './RepositoryStudy';
import { getApiBase, getAuthHeaders } from '@/lib/api';

function getLocalUserId(): string {
  try {
    const stored = localStorage.getItem('caos_user');
    if (stored) { const u = JSON.parse(stored) as { id?: string }; if (u?.id) return u.id; }
  } catch {}
  return 'local_anonymous';
}

function AbilitiesTab() {
  return <AbilitiesGallery userId={getLocalUserId()} />;
}

export function CaosShellTabs() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, component: Dashboard },
    { id: 'planning', label: 'Planning', icon: CheckCircle2, component: PlanningTab },
    { id: 'actions', label: 'Ações', icon: Zap, component: ActionQueueTab },
    { id: 'forge', label: 'Forge', icon: Sparkles, component: ForgeTab },
    { id: 'abilities', label: 'Abilities', icon: Package, component: AbilitiesTab },
    { id: 'memory', label: 'Memória', icon: Layers, component: MemoryVisualizer },
    { id: 'security', label: 'Segurança', icon: Shield, component: SecurityDashboard },
    { id: 'costs', label: 'Custos', icon: DollarSign, component: CostTracker },
    { id: 'themes', label: 'Temas', icon: Palette, component: ThemesTab },
    { id: 'device', label: 'Device', icon: Smartphone, component: DeviceTab }
  ];

  const activeTabConfig = tabs.find((t) => t.id === activeTab);
  const ActiveComponent = activeTabConfig?.component;

  return (
    <div className="h-screen relative flex flex-col overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(124,58,237,0.18),transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(56,189,248,0.14),transparent_22%),linear-gradient(180deg,#020617_0%,#111827_100%)] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(96,165,250,0.14),transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(168,85,247,0.12),transparent_22%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-slate-950/90 to-transparent" />

      <div className="relative z-10 bg-slate-950/90 border-b border-white/10 px-6 py-5 glass-panel shadow-[0_25px_80px_-50px_rgba(0,0,0,0.75)]">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-glow-primary text-white">
              <Sparkles size={20} />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Sala de Comando</p>
              <h1 className="text-2xl font-bold">Caos — Painel de Controle</h1>
            </div>
          </div>
          <p className="max-w-2xl text-sm text-slate-300">Gerencie missões, habilidades e recursos do mundo real em uma interface de aventura estilo RPG.</p>
        </div>
      </div>

      <div className="relative z-10 flex gap-2 px-4 py-3 bg-slate-900/80 border-b border-white/10 overflow-x-auto glass-panel">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-3xl whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30 scale-[1.02]'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Icon size={18} />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-auto bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="max-w-7xl mx-auto p-6">
          {ActiveComponent ? <ActiveComponent /> : <div className="p-6 text-white">Componente não encontrado</div>}
        </div>
      </div>
    </div>
  );
}

function ActionQueueTab() {
  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold text-white">Fila de Ações</h2>
      <ActionQueue />
    </div>
  );
}

function ForgeTab() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-[1.8fr_1fr]">
        <div className="glass-panel border border-white/10 p-6 shadow-[0_32px_90px_-40px_rgba(0,0,0,0.85)]">
          <div className="mb-6">
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Forja</p>
            <h2 className="text-3xl font-bold text-white">Alquimia de Habilidades</h2>
            <p className="mt-3 text-slate-300">Clonar repositórios, estudar código e transformar conhecimento em funcionalidades reais para o seu projeto.</p>
          </div>
          <AbilitiesTab />
        </div>
        <div className="space-y-4">
          <RepositoryStudy />
          <div className="glass-panel border border-white/10 p-6 shadow-[0_32px_90px_-40px_rgba(0,0,0,0.85)]">
            <div className="flex items-center gap-3 mb-4 text-slate-200">
              <GitBranch size={20} />
              <div>
                <h3 className="text-lg font-semibold text-white">Painel de Missões</h3>
                <p className="text-sm text-slate-400">Veja o que você pode clonar e estudar hoje.</p>
              </div>
            </div>
            <div className="space-y-3 text-sm text-slate-300">
              <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-4">
                <p className="font-semibold text-white">Missão Atual</p>
                <p className="mt-2 text-slate-400">Clonar um repositório de ferramentas de automação e extrair 3 funções para adicionar ao seu código.</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-4">
                <p className="font-semibold text-white">Meta de Estudo</p>
                <p className="mt-2 text-slate-400">Ler README, mapear a estrutura do projeto e encontrar pontos para implementação em 20 minutos.</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-4">
                <p className="font-semibold text-white">Recompensa</p>
                <p className="mt-2 text-slate-400">Novo módulo de habilidade ativado + documentação prática adicionada ao seu projeto.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ThemesTab() {
  const [activeTab, setActiveTab] = useState<'builder' | 'gallery'>('builder');

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex gap-2 px-6 py-4 bg-slate-900/80 border-b border-white/10">
        <button
          onClick={() => setActiveTab('builder')}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            activeTab === 'builder'
              ? 'bg-purple-600 text-white'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          Construtor de Temas
        </button>
        <button
          onClick={() => setActiveTab('gallery')}
          className={`px-4 py-2 rounded-lg font-semibold transition ${
            activeTab === 'gallery'
              ? 'bg-purple-600 text-white'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          Galeria de Referências
        </button>
      </div>
      <div className="flex-1 overflow-auto">
        {activeTab === 'builder' ? <ThemeBuilder /> : <ThemeGallery />}
      </div>
    </div>
  );
}

function DeviceTab() {
  const [deviceProfile, setDeviceProfile] = useState<null | {
    device_type: string;
    os: string;
    os_version: string;
    architecture: string;
    storage_total_mb: number;
    storage_free_mb: number;
    ram_total_mb: number;
    ram_available_mb: number;
    cpu_cores: number;
    cpu_freq_mhz: number;
    capabilities: string[];
    health_score: number;
  }>(null);
  const [syncStatus, setSyncStatus] = useState<null | {
    status: string;
    last_sync: string;
    pending_changes: number;
  }>(null);
  const [optimization, setOptimization] = useState<null | {
    recommendations: string[];
    estimated_freed_mb: number;
  }>(null);
  const [loading, setLoading] = useState(true);
  const [optimizeLoading, setOptimizeLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = getApiBase();
  const AUTH_HEADERS = getAuthHeaders();

  useEffect(() => {
    const fetchDeviceProfile = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/v1/device/profile`, {
          headers: AUTH_HEADERS,
        });
        if (!response.ok) {
          throw new Error(`Erro ao buscar perfil do dispositivo: ${response.statusText}`);
        }
        setDeviceProfile(await response.json());
      } catch (err) {
        setError((err as Error).message);
      }
    };

    const fetchSyncStatus = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/v1/device/sync/status`, {
          headers: AUTH_HEADERS,
        });
        if (!response.ok) {
          throw new Error(`Erro ao buscar status de sync: ${response.statusText}`);
        }
        setSyncStatus(await response.json());
      } catch (err) {
        setError((err as Error).message);
      }
    };

    Promise.all([fetchDeviceProfile(), fetchSyncStatus()]).finally(() => setLoading(false));
  }, [API_BASE, AUTH_HEADERS]);

  const optimizeDevice = async () => {
    setOptimizeLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/v1/device/optimize`, {
        method: 'POST',
        headers: AUTH_HEADERS,
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error(`Erro ao otimizar dispositivo: ${response.statusText}`);
      }

      setOptimization(await response.json());
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setOptimizeLoading(false);
    }
  };

  const getStorageText = () => {
    if (!deviceProfile) return '-';
    return `${Math.round(deviceProfile.storage_free_mb / 1024)} GB / ${Math.round(deviceProfile.storage_total_mb / 1024)} GB`;
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-white">Informações do Dispositivo</h2>
      {loading ? (
        <div className="rounded-3xl bg-slate-700/50 border border-slate-600 p-6 text-slate-200">Carregando dados do dispositivo…</div>
      ) : error ? (
        <div className="rounded-3xl bg-rose-700/20 border border-rose-500 p-6 text-rose-100">{error}</div>
      ) : (
        <>
          <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoItem label="Tipo de Dispositivo" value={deviceProfile?.device_type ?? 'Desktop'} />
              <InfoItem label="Sistema Operacional" value={`${deviceProfile?.os ?? 'Linux'} ${deviceProfile?.os_version ?? ''}`} />
              <InfoItem label="Arquitetura" value={deviceProfile?.architecture ?? 'x86_64'} />
              <InfoItem label="Armazenamento" value={getStorageText()} />
              <InfoItem label="Memória RAM" value={`${Math.round((deviceProfile?.ram_available_mb ?? 0) / 1024)} GB / ${Math.round((deviceProfile?.ram_total_mb ?? 0) / 1024)} GB`} />
              <InfoItem label="Cores de CPU" value={deviceProfile?.cpu_cores?.toString() ?? 'N/A'} />
              <InfoItem label="Frequência CPU" value={`${deviceProfile?.cpu_freq_mhz?.toFixed(0) ?? 0} MHz`} />
              <InfoItem label="Status de Saúde" value={`${deviceProfile?.health_score ?? 0}/100`} />
            </div>
          </div>

          {syncStatus && (
            <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Sincronização Offline</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InfoItem label="Status" value={syncStatus.status} />
                <InfoItem label="Última sincronização" value={new Date(syncStatus.last_sync).toLocaleString()} />
                <InfoItem label="Alterações pendentes" value={syncStatus.pending_changes.toString()} />
              </div>
            </div>
          )}

          <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
            <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Otimização de Armazenamento</h3>
              <p className="text-slate-300 mb-4">
                Analise automaticamente o uso de arquivos temporários, caches e dados antigos para liberar espaço.
              </p>
              {optimization ? (
                <div className="space-y-3">
                  <p className="text-slate-200">Economia estimada: <strong>{Math.round(optimization.estimated_freed_mb / 1024)} GB</strong></p>
                  <ul className="list-disc list-inside text-slate-300 space-y-2">
                    {optimization.recommendations.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-slate-300">Clique em otimizar para receber recomendações de limpeza e liberar espaço.</p>
              )}
            </div>
            <div className="flex flex-col justify-between bg-slate-800/60 border border-slate-600 rounded-lg p-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Ações Rápidas</h3>
                <p className="text-slate-300 mb-6">Execute a análise de otimização e receba um plano prático sem sair da interface.</p>
              </div>
              <button
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                onClick={optimizeDevice}
                disabled={optimizeLoading}
              >
                {optimizeLoading ? 'Otimização em progresso…' : 'Otimizar Dispositivo'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-slate-600 pb-3">
      <label className="text-sm text-slate-400">{label}</label>
      <p className="text-lg font-semibold text-white">{value}</p>
    </div>
  );
}
