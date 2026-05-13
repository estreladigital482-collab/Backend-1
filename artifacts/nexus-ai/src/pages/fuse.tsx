import { useState } from "react";
import { useListNexusSkills as useListSkills, useFuseSkills, getListSkillsQueryKey, getGetAiStatsQueryKey, getGetAiProfileQueryKey } from "@/lib/nexus-api";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Plus, X, Sparkles, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Fuse() {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [fusionName, setFusionName] = useState("");
  const [result, setResult] = useState<any>(null);
  const qc = useQueryClient();

  const { data: skills, isLoading } = useListSkills({ status: "acquired" });
  const fusedSkills = useListSkills({ status: "fused" });
  const allSkills = [...(skills || []), ...(fusedSkills.data || [])];

  const fuseMut = useFuseSkills();

  const toggle = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
    setResult(null);
  };

  const handleFuse = async () => {
    if (selectedIds.length < 2) return;
    const res = await fuseMut.mutateAsync({ data: { skillIds: selectedIds, fusionName: fusionName || null } });
    setResult(res);
    setSelectedIds([]);
    setFusionName("");
    qc.invalidateQueries({ queryKey: getListSkillsQueryKey() });
    qc.invalidateQueries({ queryKey: getGetAiStatsQueryKey() });
    qc.invalidateQueries({ queryKey: getGetAiProfileQueryKey() });
  };

  const selectedSkills = allSkills.filter(s => selectedIds.includes(s.id));

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs text-primary/70 uppercase tracking-widest mb-1">// Câmara de Síntese</p>
        <h1 className="text-3xl font-bold tracking-tight">Fusão de Habilidades</h1>
        <p className="text-sm text-muted-foreground mt-1">Selecione 2 ou mais habilidades para combiná-las em uma nova.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Skill selection */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Selecionar Habilidades</h2>
          {isLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {[...Array(6)].map((_, i) => <div key={i} className="h-20 rounded-sm bg-card/40 animate-pulse border border-border/30" />)}
            </div>
          ) : allSkills.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border border-border/30 rounded-sm">
              <Zap className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Nenhuma habilidade disponível para fusão.</p>
              <p className="text-xs mt-1">Adquira habilidades primeiro na seção Estudar.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
              {allSkills.map((skill, i) => {
                const isSelected = selectedIds.includes(skill.id);
                return (
                  <motion.div
                    key={skill.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => toggle(skill.id)}
                    className={cn(
                      "relative rounded-sm border p-3 cursor-pointer transition-all duration-200 group",
                      isSelected
                        ? "border-primary/60 bg-primary/10 shadow-[0_0_15px_hsl(var(--primary)/0.2)]"
                        : "border-border/40 bg-card/40 hover:border-border hover:bg-card/60"
                    )}
                    style={!isSelected ? { borderColor: `${skill.color}20` } : {}}
                    whileHover={{ scale: 1.02 }}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                        <CheckCircle className="h-3 w-3 text-primary-foreground" />
                      </div>
                    )}
                    <div className="flex items-center gap-2 mb-1">
                      <div className="h-7 w-7 rounded-sm flex items-center justify-center text-xs font-bold border flex-shrink-0" style={{ backgroundColor: `${skill.color}15`, borderColor: `${skill.color}40`, color: skill.color }}>
                        {skill.name?.charAt(0)}
                      </div>
                      <p className="text-sm font-medium leading-tight truncate">{skill.name}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{skill.category}</p>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Fusion panel */}
        <div className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Ritual de Fusão</h2>
          <div className="rounded-sm border border-border/40 bg-card/60 p-4 min-h-[300px] flex flex-col">
            {/* Selected skills display */}
            <div className="flex-1 space-y-2 mb-4">
              {selectedSkills.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground gap-2 py-8">
                  <Plus className="h-8 w-8 opacity-30" />
                  <p className="text-xs">Selecione habilidades à esquerda</p>
                </div>
              ) : (
                <AnimatePresence>
                  {selectedSkills.map((skill, i) => (
                    <motion.div
                      key={skill.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex items-center gap-2 p-2 rounded-sm border"
                      style={{ borderColor: `${skill.color}30`, backgroundColor: `${skill.color}08` }}
                    >
                      <div className="h-6 w-6 rounded-sm flex items-center justify-center text-xs font-bold border flex-shrink-0" style={{ backgroundColor: `${skill.color}20`, borderColor: `${skill.color}50`, color: skill.color }}>
                        {skill.name?.charAt(0)}
                      </div>
                      <span className="text-xs flex-1 truncate">{skill.name}</span>
                      <button onClick={() => toggle(skill.id)} className="text-muted-foreground hover:text-foreground flex-shrink-0">
                        <X className="h-3 w-3" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Fusion name input */}
            <div className="space-y-3">
              <input
                type="text"
                value={fusionName}
                onChange={e => setFusionName(e.target.value)}
                placeholder="Nome da fusão (opcional)"
                className="w-full rounded-sm bg-black/40 border border-border/50 text-xs px-3 py-2 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 font-mono"
              />
              <button
                onClick={handleFuse}
                disabled={selectedIds.length < 2 || fuseMut.isPending}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-sm bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(139,92,246,0.3)]"
              >
                <Zap className="h-4 w-4" />
                {fuseMut.isPending ? "Fundindo..." : selectedIds.length < 2 ? `Selecione ${2 - selectedIds.length} mais` : "Realizar Fusão"}
              </button>
            </div>
          </div>

          {/* Fusion loading */}
          <AnimatePresence>
            {fuseMut.isPending && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="rounded-sm border border-purple-500/30 bg-purple-500/5 p-4 text-center"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="h-10 w-10 rounded-full border-2 border-purple-500/30 border-t-purple-500 mx-auto mb-3"
                />
                <p className="text-xs text-purple-400">Sintetizando conhecimentos...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Fusion result */}
      <AnimatePresence>
        {result && !fuseMut.isPending && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="rounded-sm border border-pink-500/40 bg-gradient-to-br from-purple-900/20 to-pink-900/20 p-6 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500" />
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-sm flex items-center justify-center text-2xl font-bold border border-pink-500/40 bg-pink-500/10 text-pink-400 flex-shrink-0">
                {result.fusedSkill?.name?.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="h-4 w-4 text-pink-400" />
                  <h3 className="text-lg font-bold text-pink-400">{result.fusedSkill?.name}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full border border-pink-500/30 text-pink-400">{result.fusedSkill?.category}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{result.fusedSkill?.description}</p>
                <p className="text-xs text-pink-300/70 italic">{result.description}</p>
                {result.fusedSkill?.principles?.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {result.fusedSkill.principles.map((p: string, i: number) => (
                      <li key={i} className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Zap className="h-3 w-3 text-pink-400" />
                        {p}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-green-400 font-mono text-sm">+{result.fusedSkill?.xpValue} XP</div>
                <div className="text-xs text-muted-foreground mt-1">Adquirida</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
