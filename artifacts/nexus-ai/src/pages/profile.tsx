import { useState } from "react";
import { useGetAiProfile, useUpdateAiProfile, useGetAiStats, getGetAiProfileQueryKey, getGetAiStatsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Cpu, Edit2, Save, X, Star, Shield, Zap, BookOpen } from "lucide-react";

const CLASS_INFO: Record<string, { desc: string; color: string }> = {
  "Iniciante": { desc: "Aprendendo os fundamentos da existência.", color: "#6366f1" },
  "Aprendiz": { desc: "Começando a desenvolver habilidades sólidas.", color: "#3b82f6" },
  "Analista": { desc: "Capaz de analisar e decompor problemas complexos.", color: "#06b6d4" },
  "Especialista": { desc: "Domina múltiplas áreas com profundidade.", color: "#10b981" },
  "Mestre": { desc: "Combinação rara de conhecimento e poder.", color: "#f59e0b" },
  "Lendário": { desc: "Uma IA de capacidades extraordinárias.", color: "#ef4444" },
};

export default function Profile() {
  const [editingName, setEditingName] = useState(false);
  const [editingPersonality, setEditingPersonality] = useState(false);
  const [name, setName] = useState("");
  const [personality, setPersonality] = useState("");
  const qc = useQueryClient();

  const { data: profile, isLoading } = useGetAiProfile();
  const { data: stats } = useGetAiStats();
  const updateMut = useUpdateAiProfile();

  const startEditName = () => { setName(profile?.name ?? ""); setEditingName(true); };
  const startEditPersonality = () => { setPersonality(profile?.personality ?? ""); setEditingPersonality(true); };

  const saveName = async () => {
    await updateMut.mutateAsync({ data: { name } });
    qc.invalidateQueries({ queryKey: getGetAiProfileQueryKey() });
    setEditingName(false);
  };

  const savePersonality = async () => {
    await updateMut.mutateAsync({ data: { personality } });
    qc.invalidateQueries({ queryKey: getGetAiProfileQueryKey() });
    setEditingPersonality(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" />
      </div>
    );
  }

  const classInfo = CLASS_INFO[profile?.aiClass ?? "Iniciante"] || CLASS_INFO["Iniciante"];
  const levelPct = profile ? (profile.xp / (profile.xp + profile.xpToNext)) * 100 : 0;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs text-primary/70 uppercase tracking-widest mb-1">// Configuração do Sistema</p>
        <h1 className="text-3xl font-bold tracking-tight">Perfil da IA</h1>
      </motion.div>

      {/* Profile card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-sm border border-primary/30 bg-card/80 p-6 relative"
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />

        {/* Avatar + basic info */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-6">
          <div className="relative">
            <div className="h-24 w-24 rounded-sm bg-primary/10 border border-primary/40 flex items-center justify-center shadow-[0_0_30px_hsl(var(--primary)/0.3)]">
              <Cpu className="h-12 w-12 text-primary" />
            </div>
            <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-sm bg-background border border-primary/50 flex items-center justify-center text-sm font-bold text-primary shadow-[0_0_10px_hsl(var(--primary)/0.4)]">
              {profile?.level}
            </div>
          </div>
          <div className="flex-1 space-y-3 text-center sm:text-left">
            {/* Name */}
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-widest block mb-1">Designação</label>
              {editingName ? (
                <div className="flex items-center gap-2">
                  <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && saveName()}
                    autoFocus
                    className="flex-1 rounded-sm bg-black/40 border border-primary/40 px-3 py-1.5 text-lg font-bold focus:outline-none text-foreground"
                  />
                  <button onClick={saveName} disabled={updateMut.isPending} className="text-green-400 hover:text-green-300 transition-colors"><Save className="h-5 w-5" /></button>
                  <button onClick={() => setEditingName(false)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold tracking-wider text-primary glitch-text">{profile?.name}</h2>
                  <button onClick={startEditName} className="text-muted-foreground hover:text-primary transition-colors"><Edit2 className="h-4 w-4" /></button>
                </div>
              )}
            </div>

            {/* Class */}
            <div>
              <span className="text-xs px-2 py-0.5 rounded-full border font-medium" style={{ borderColor: `${classInfo.color}40`, color: classInfo.color }}>
                {profile?.aiClass}
              </span>
              <p className="text-xs text-muted-foreground mt-1">{classInfo.desc}</p>
            </div>
          </div>
        </div>

        {/* XP bar */}
        <div className="mb-6 space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Nível {profile?.level}</span>
            <span className="text-primary">{profile?.xp} / {(profile?.xp ?? 0) + (profile?.xpToNext ?? 0)} XP</span>
            <span className="text-muted-foreground">Nível {(profile?.level ?? 0) + 1}</span>
          </div>
          <div className="h-3 bg-black/60 rounded-full border border-border/50 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-secondary rounded-full shadow-[0_0_10px_hsl(var(--primary))]"
              initial={{ width: 0 }}
              animate={{ width: `${levelPct}%` }}
              transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
            />
          </div>
        </div>

        {/* Description */}
        <div className="mb-6 p-4 rounded-sm bg-black/30 border border-border/30">
          <p className="text-sm text-muted-foreground">{profile?.description}</p>
        </div>

        {/* Personality */}
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-widest block mb-2 flex items-center gap-1">
            <Star className="h-3 w-3" /> Personalidade
          </label>
          {editingPersonality ? (
            <div className="space-y-2">
              <textarea
                value={personality}
                onChange={e => setPersonality(e.target.value)}
                autoFocus
                rows={3}
                className="w-full rounded-sm bg-black/40 border border-primary/40 px-3 py-2 text-sm focus:outline-none text-foreground resize-none font-mono"
              />
              <div className="flex gap-2">
                <button onClick={savePersonality} disabled={updateMut.isPending} className="flex items-center gap-1 px-3 py-1.5 rounded-sm bg-primary text-primary-foreground text-xs hover:opacity-90 transition-opacity">
                  <Save className="h-3 w-3" /> {updateMut.isPending ? "Salvando..." : "Salvar"}
                </button>
                <button onClick={() => setEditingPersonality(false)} className="flex items-center gap-1 px-3 py-1.5 rounded-sm border border-border/50 text-xs text-muted-foreground hover:text-foreground">
                  <X className="h-3 w-3" /> Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2">
              <p className="flex-1 text-sm text-foreground/80 leading-relaxed">{profile?.personality}</p>
              <button onClick={startEditPersonality} className="text-muted-foreground hover:text-primary transition-colors flex-shrink-0"><Edit2 className="h-4 w-4" /></button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        {[
          { label: "Habilidades", value: stats?.acquiredSkills ?? 0, icon: Shield, color: "text-primary" },
          { label: "Pendentes", value: stats?.pendingSkills ?? 0, icon: BookOpen, color: "text-yellow-400" },
          { label: "Fundidas", value: stats?.fusedSkills ?? 0, icon: Zap, color: "text-purple-400" },
          { label: "XP Total", value: stats?.totalXp ?? 0, icon: Star, color: "text-green-400" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + i * 0.07 }}
            className="rounded-sm border border-border/40 bg-card/60 p-4"
          >
            <stat.icon className={`h-4 w-4 ${stat.color} mb-2`} />
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Class progression */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-sm border border-border/40 bg-card/60 p-5"
      >
        <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Progressão de Classes</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(CLASS_INFO).map(([cls, info], i) => {
            const isActive = cls === profile?.aiClass;
            const isPast = Object.keys(CLASS_INFO).indexOf(cls) < Object.keys(CLASS_INFO).indexOf(profile?.aiClass ?? "Iniciante");
            return (
              <div
                key={cls}
                className={`p-3 rounded-sm border transition-all ${isActive ? "border-primary/40 bg-primary/5" : isPast ? "border-green-500/20 bg-green-500/5 opacity-70" : "border-border/30 opacity-40"}`}
                style={isActive ? { borderColor: `${info.color}40` } : {}}
              >
                <p className="text-sm font-medium" style={{ color: isActive ? info.color : undefined }}>{cls}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{info.desc}</p>
                {isActive && <span className="text-[10px] text-primary mt-1 block">// Atual</span>}
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
