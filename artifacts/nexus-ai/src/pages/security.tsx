import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, AlertTriangle, CheckCircle, XCircle, Activity,
  Eye, Lock, Unlock, RefreshCw, Bug, Zap, Clock,
  ChevronRight, Info, AlertOctagon, TrendingUp, Users
} from "lucide-react";
import { cn } from "@/lib/utils";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

interface LobosStatus {
  blockedIps: { ip: string; blockUntil: number; offenses: number; retryInSec: number }[];
  trackedIps: number;
  trackedUsers: number;
}

interface SecurityIssue {
  id: string;
  type: "suspicious" | "blocked" | "warning" | "info";
  title: string;
  description: string;
  timestamp: number;
  resolved: boolean;
}

interface AuditEntry {
  id: string;
  action: string;
  ip: string;
  timestamp: number;
  severity: "low" | "medium" | "high";
}

const SEVERITY_COLOR = {
  low: "text-green-400 bg-green-400/10 border-green-400/20",
  medium: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  high: "text-red-400 bg-red-400/10 border-red-400/20",
};

const ISSUE_TYPE_ICON = {
  suspicious: AlertTriangle,
  blocked: XCircle,
  warning: AlertOctagon,
  info: Info,
};

const ISSUE_TYPE_COLOR = {
  suspicious: "text-yellow-400 border-yellow-400/20 bg-yellow-400/5",
  blocked: "text-red-400 border-red-400/20 bg-red-400/5",
  warning: "text-orange-400 border-orange-400/20 bg-orange-400/5",
  info: "text-blue-400 border-blue-400/20 bg-blue-400/5",
};

function generateMockAuditLog(): AuditEntry[] {
  const actions = [
    { action: "Rate limit excedido — Chat", severity: "high" as const },
    { action: "Requisição bloqueada por Lobos", severity: "high" as const },
    { action: "Padrão suspeito detectado (Formiga)", severity: "medium" as const },
    { action: "Tentativa de acesso não autorizado", severity: "high" as const },
    { action: "Requisição normal processada", severity: "low" as const },
    { action: "Fusão de habilidade executada", severity: "low" as const },
    { action: "Estudo de tópico iniciado", severity: "low" as const },
    { action: "Chat com IA — consulta normal", severity: "low" as const },
    { action: "Padrão de flood detectado (Formiga)", severity: "medium" as const },
    { action: "IP adicionado à lista de observação", severity: "medium" as const },
  ];

  return actions.map((a, i) => ({
    id: `audit_${i}`,
    action: a.action,
    ip: `192.168.${Math.floor(Math.random() * 255)}.***`,
    timestamp: Date.now() - i * 1000 * 60 * (i + 1),
    severity: a.severity,
  }));
}

function generateMockIssues(): SecurityIssue[] {
  return [
    {
      id: "issue_1",
      type: "suspicious",
      title: "Padrão de requisições anômalas detectado",
      description: "As Formigas identificaram um padrão de 47 requisições em 30 segundos do mesmo IP. Possível bot ou scraper.",
      timestamp: Date.now() - 5 * 60 * 1000,
      resolved: false,
    },
    {
      id: "issue_2",
      type: "blocked",
      title: "IP bloqueado por violação repetida",
      description: "O sistema Lobos bloqueou automaticamente o IP 203.0.1.*** após 3 violações de limite de taxa consecutivas.",
      timestamp: Date.now() - 12 * 60 * 1000,
      resolved: false,
    },
    {
      id: "issue_3",
      type: "warning",
      title: "Tentativa de injeção de prompt detectada",
      description: "Formiga de padrão identificou uma mensagem tentando sobrescrever as instruções do sistema da IA.",
      timestamp: Date.now() - 28 * 60 * 1000,
      resolved: true,
    },
    {
      id: "issue_4",
      type: "info",
      title: "Taxa de uso de API acima da média",
      description: "O uso da API nas últimas 2 horas está 2.3x acima da média histórica. Monitoramento ativo.",
      timestamp: Date.now() - 45 * 60 * 1000,
      resolved: true,
    },
  ];
}

export default function Security() {
  const [lobosStatus, setLobosStatus] = useState<LobosStatus | null>(null);
  const [issues, setIssues] = useState<SecurityIssue[]>(generateMockIssues());
  const [auditLog] = useState<AuditEntry[]>(generateMockAuditLog());
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "formigas" | "audit" | "lobos">("overview");
  const [refreshing, setRefreshing] = useState(false);
  const [score] = useState(87);

  const fetchStatus = async () => {
    try {
      const res = await fetch(`${BASE}/api/security/lobos/status`);
      if (res.ok) {
        const data = await res.json();
        setLobosStatus(data);
      }
    } catch {
      setLobosStatus({ blockedIps: [], trackedIps: 0, trackedUsers: 0 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const refresh = async () => {
    setRefreshing(true);
    await fetchStatus();
    setTimeout(() => setRefreshing(false), 800);
  };

  const resolveIssue = (id: string) => {
    setIssues(prev => prev.map(i => i.id === id ? { ...i, resolved: true } : i));
  };

  const openIssues = issues.filter(i => !i.resolved);
  const resolvedIssues = issues.filter(i => i.resolved);

  const tabs = [
    { id: "overview" as const, label: "Visão Geral", icon: Shield },
    { id: "formigas" as const, label: "Formigas", icon: Bug },
    { id: "audit" as const, label: "Audit Log", icon: Activity },
    { id: "lobos" as const, label: "Lobos", icon: Lock },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-primary/60 mb-1">// Módulo de Segurança</p>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-widest">Segurança</h1>
            <p className="text-sm text-muted-foreground mt-1">Monitoramento em tempo real — Lobos · Formigas · Audit</p>
          </div>
          <button
            onClick={refresh}
            className={cn(
              "p-2.5 rounded-lg border border-border/40 text-muted-foreground hover:text-foreground transition-all",
              refreshing && "animate-spin"
            )}
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {/* Score card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="relative rounded-xl border border-primary/20 bg-card/60 p-6 overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="relative">
            <svg className="w-24 h-24 -rotate-90">
              <circle cx="48" cy="48" r="38" className="fill-none stroke-border/30" strokeWidth="6" />
              <motion.circle
                cx="48" cy="48" r="38"
                className="fill-none stroke-primary"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 38}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 38 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 38 * (1 - score / 100) }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                style={{ filter: "drop-shadow(0 0 6px hsl(var(--primary)))" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <span className="text-2xl font-black text-primary">{score}</span>
                <span className="text-xs text-muted-foreground block">/100</span>
              </div>
            </div>
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-foreground">Score de Segurança</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Sistema em boas condições — monitoramento ativo</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {[
                { label: `${openIssues.length} abertos`, color: openIssues.length > 0 ? "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" : "text-green-400 bg-green-400/10 border-green-400/20" },
                { label: `${lobosStatus?.trackedIps ?? 0} IPs rastreados`, color: "text-blue-400 bg-blue-400/10 border-blue-400/20" },
                { label: `${lobosStatus?.blockedIps?.length ?? 0} bloqueados`, color: "text-red-400 bg-red-400/10 border-red-400/20" },
              ].map(b => (
                <span key={b.label} className={cn("px-2 py-1 rounded-full text-xs border font-medium", b.color)}>
                  {b.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-card/40 rounded-xl border border-border/30">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-medium transition-all",
              activeTab === tab.id
                ? "bg-primary/10 text-primary border border-primary/20"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        {activeTab === "overview" && (
          <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            {/* Stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Problemas Abertos", value: openIssues.length, icon: AlertTriangle, color: "text-yellow-400" },
                { label: "Resolvidos", value: resolvedIssues.length, icon: CheckCircle, color: "text-green-400" },
                { label: "IPs Bloqueados", value: lobosStatus?.blockedIps?.length ?? 0, icon: XCircle, color: "text-red-400" },
                { label: "Usuários Rastreados", value: lobosStatus?.trackedUsers ?? 0, icon: Users, color: "text-blue-400" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.08 }}
                  className="p-4 rounded-xl border border-border/30 bg-card/40"
                >
                  <stat.icon className={cn("w-5 h-5 mb-2", stat.color)} />
                  <div className={cn("text-2xl font-bold", stat.color)}>{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Active issues */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" /> Problemas Ativos ({openIssues.length})
              </h3>
              {openIssues.length === 0 ? (
                <div className="text-center py-8 rounded-xl border border-green-500/20 bg-green-500/5">
                  <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                  <p className="text-sm text-green-400 font-medium">Nenhum problema ativo</p>
                  <p className="text-xs text-muted-foreground mt-1">Todos os sistemas operando normalmente</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {openIssues.map(issue => {
                    const IssueIcon = ISSUE_TYPE_ICON[issue.type];
                    return (
                      <motion.div
                        key={issue.id}
                        layout
                        className={cn("p-4 rounded-xl border flex items-start gap-3", ISSUE_TYPE_COLOR[issue.type])}
                      >
                        <IssueIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{issue.title}</p>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{issue.description}</p>
                          <p className="text-[10px] text-muted-foreground/60 mt-1 font-mono">
                            <Clock className="inline w-3 h-3 mr-1" />
                            {new Date(issue.timestamp).toLocaleTimeString("pt-BR")}
                          </p>
                        </div>
                        <button
                          onClick={() => resolveIssue(issue.id)}
                          className="flex-shrink-0 px-2.5 py-1 rounded-lg bg-black/20 border border-white/10 text-xs font-medium hover:bg-black/40 transition-colors"
                        >
                          Resolver
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === "formigas" && (
          <motion.div key="formigas" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="p-5 rounded-xl border border-primary/20 bg-card/60">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Bug className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Sistema Formigas</h3>
                  <p className="text-xs text-muted-foreground">Detecção de padrões suspeitos e anomalias</p>
                </div>
                <div className="ml-auto flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs text-green-400 font-mono">Ativo</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { label: "Padrões Monitorados", value: "12", icon: Eye, color: "text-blue-400" },
                  { label: "Alertas nas últimas 24h", value: "3", icon: AlertTriangle, color: "text-yellow-400" },
                  { label: "Bloqueios automáticos", value: "1", icon: Lock, color: "text-red-400" },
                ].map(stat => (
                  <div key={stat.label} className="p-3 rounded-lg bg-black/20 border border-border/20">
                    <stat.icon className={cn("w-4 h-4 mb-2", stat.color)} />
                    <div className={cn("text-xl font-bold", stat.color)}>{stat.value}</div>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Padrões Detectados</h3>
              <div className="space-y-2">
                {[
                  { pattern: "Flood de Requisições", desc: "Mais de 30 req/min do mesmo IP", status: "ativo", count: 2 },
                  { pattern: "Injeção de Prompt", desc: "Tentativas de sobrescrever sistema da IA", status: "ativo", count: 1 },
                  { pattern: "Scraping Automatizado", desc: "Padrão de user-agent suspeito", status: "observando", count: 0 },
                  { pattern: "Acesso a Endpoints Sensíveis", desc: "Tentativas repetidas em rotas protegidas", status: "normal", count: 0 },
                  { pattern: "Anomalia de Horário", desc: "Uso fora do padrão de horário do usuário", status: "normal", count: 0 },
                ].map((p, i) => (
                  <motion.div
                    key={p.pattern}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-center gap-3 p-3.5 rounded-xl border border-border/30 bg-card/40"
                  >
                    <div className={cn(
                      "w-2 h-2 rounded-full flex-shrink-0",
                      p.status === "ativo" ? "bg-red-400 animate-pulse" :
                      p.status === "observando" ? "bg-yellow-400" : "bg-green-400"
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{p.pattern}</p>
                      <p className="text-xs text-muted-foreground">{p.desc}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {p.count > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-red-400/10 border border-red-400/20 text-red-400 text-xs font-bold">
                          {p.count}
                        </span>
                      )}
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full border font-medium",
                        p.status === "ativo" ? "text-red-400 border-red-400/30 bg-red-400/10" :
                        p.status === "observando" ? "text-yellow-400 border-yellow-400/30 bg-yellow-400/10" :
                        "text-green-400 border-green-400/30 bg-green-400/10"
                      )}>
                        {p.status}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "audit" && (
          <motion.div key="audit" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Activity className="w-3.5 h-3.5" /> Registro de Auditoria (últimas ações)
            </h3>
            <div className="space-y-1.5">
              {auditLog.map((entry, i) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border/20 bg-card/30 hover:bg-card/50 transition-colors"
                >
                  <span className={cn(
                    "flex-shrink-0 px-2 py-0.5 rounded text-[10px] font-bold border uppercase",
                    SEVERITY_COLOR[entry.severity]
                  )}>
                    {entry.severity}
                  </span>
                  <span className="flex-1 text-sm text-foreground/80 font-mono text-xs truncate">{entry.action}</span>
                  <span className="text-[10px] text-muted-foreground/50 font-mono flex-shrink-0">{entry.ip}</span>
                  <span className="text-[10px] text-muted-foreground/40 font-mono flex-shrink-0 hidden sm:block">
                    {new Date(entry.timestamp).toLocaleTimeString("pt-BR")}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === "lobos" && (
          <motion.div key="lobos" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="p-5 rounded-xl border border-primary/20 bg-card/60">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold">Sistema Lobos</h3>
                  <p className="text-xs text-muted-foreground">Rate limiting inteligente com bloqueio progressivo</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                {[
                  { label: "IPs Rastreados", value: lobosStatus?.trackedIps ?? 0, icon: Eye },
                  { label: "Usuários Rastreados", value: lobosStatus?.trackedUsers ?? 0, icon: Users },
                  { label: "IPs Bloqueados", value: lobosStatus?.blockedIps?.length ?? 0, icon: XCircle },
                ].map(stat => (
                  <div key={stat.label} className="p-3 rounded-lg bg-black/20 border border-border/20 text-center">
                    <stat.icon className="w-4 h-4 mx-auto mb-1 text-primary" />
                    <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Limites Configurados</h4>
                {[
                  { name: "lobosChat (Chat/IA)", ipLimit: "30/min", userLimit: "100/min", color: "text-red-400" },
                  { name: "lobosApi (API Geral)", ipLimit: "60/min", userLimit: "200/min", color: "text-yellow-400" },
                  { name: "lobosStrict (Ações Sensíveis)", ipLimit: "10/min", userLimit: "30/min", color: "text-orange-400" },
                ].map(l => (
                  <div key={l.name} className="flex items-center justify-between p-3 rounded-lg border border-border/20 bg-black/10">
                    <span className={cn("text-sm font-mono font-medium", l.color)}>{l.name}</span>
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      <span>IP: {l.ipLimit}</span>
                      <span>Auth: {l.userLimit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {lobosStatus?.blockedIps && lobosStatus.blockedIps.length > 0 ? (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-widest text-red-400 mb-3 flex items-center gap-2">
                  <XCircle className="w-3.5 h-3.5" /> IPs Bloqueados
                </h3>
                <div className="space-y-2">
                  {lobosStatus.blockedIps.map((ip, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-red-500/20 bg-red-500/5">
                      <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                      <span className="font-mono text-sm text-foreground flex-1">{ip.ip}</span>
                      <span className="text-xs text-muted-foreground">{ip.offenses} violações</span>
                      <span className="text-xs text-red-400 font-mono">{ip.retryInSec}s</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-6 rounded-xl border border-green-500/20 bg-green-500/5">
                <Unlock className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-sm text-green-400">Nenhum IP bloqueado no momento</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
