import { useState } from "react";
import { useStudyTopic, useAcquireSkill, getListSkillsQueryKey, getGetAiStatsQueryKey, getGetAiProfileQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Send, CheckCircle, ChevronRight, Zap, Brain } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Study() {
  const [topic, setTopic] = useState("");
  const [filter, setFilter] = useState("");
  const [result, setResult] = useState<any>(null);
  const [acquiredIds, setAcquiredIds] = useState<Set<number>>(new Set());
  const studyMut = useStudyTopic();
  const acquireMut = useAcquireSkill();
  const qc = useQueryClient();

  const handleStudy = async () => {
    if (!topic.trim()) return;
    setResult(null);
    setAcquiredIds(new Set());
    const res = await studyMut.mutateAsync({ data: { topic, filter: filter || null } });
    setResult(res);
  };

  const handleAcquire = async (id: number) => {
    await acquireMut.mutateAsync({ id });
    setAcquiredIds(prev => new Set([...prev, id]));
    qc.invalidateQueries({ queryKey: getListSkillsQueryKey() });
    qc.invalidateQueries({ queryKey: getGetAiStatsQueryKey() });
    qc.invalidateQueries({ queryKey: getGetAiProfileQueryKey() });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs text-primary/70 uppercase tracking-widest mb-1">// Módulo de Aprendizagem</p>
        <h1 className="text-3xl font-bold tracking-tight">Estudar</h1>
        <p className="text-sm text-muted-foreground mt-1">Insira um tópico ou URL para a IA analisar e propor habilidades.</p>
      </motion.div>

      {/* Study form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-sm border border-primary/20 bg-card/60 backdrop-blur-sm p-6 relative"
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground block mb-2">
              <Brain className="inline h-3 w-3 mr-1" /> Tópico ou URL para Estudar
            </label>
            <input
              type="text"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleStudy()}
              placeholder="Ex: Criptografia, https://github.com/..., Segurança de redes..."
              className="w-full rounded-sm bg-black/40 border border-border/50 text-sm px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors font-mono"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground block mb-2">
              Filtro (opcional)
            </label>
            <input
              type="text"
              value={filter}
              onChange={e => setFilter(e.target.value)}
              placeholder="Ex: apenas fundamentos, excluir design, somente algoritmos..."
              className="w-full rounded-sm bg-black/40 border border-border/50 text-sm px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors font-mono"
            />
          </div>
          <button
            onClick={handleStudy}
            disabled={!topic.trim() || studyMut.isPending}
            className="flex items-center gap-2 px-6 py-3 rounded-sm bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_hsl(var(--primary)/0.3)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.5)]"
          >
            <Send className="h-4 w-4" />
            {studyMut.isPending ? "Analisando..." : "Iniciar Estudo"}
          </button>
        </div>
      </motion.div>

      {/* Loading state */}
      <AnimatePresence>
        {studyMut.isPending && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-sm border border-border/30 bg-card/40 p-8 flex flex-col items-center gap-4"
          >
            <div className="relative">
              <div className="h-16 w-16 rounded-full border-2 border-primary/20 animate-spin border-t-primary" />
              <Brain className="absolute inset-0 m-auto h-6 w-6 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-primary">Processando conhecimento...</p>
              <p className="text-xs text-muted-foreground mt-1 font-mono">Analisando "{topic}"</p>
            </div>
            {[0.3, 0.5, 0.7].map((delay, i) => (
              <motion.p
                key={i}
                className="text-xs text-muted-foreground/50 font-mono"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, delay }}
              >
                {["Mapeando conceitos fundamentais...", "Extraindo princípios-chave...", "Estruturando habilidades..."][i]}
              </motion.p>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {result && !studyMut.isPending && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-5"
          >
            {/* Summary */}
            <div className="rounded-sm border border-border/50 bg-card/60 p-5">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-primary mb-3 flex items-center gap-2">
                <BookOpen className="h-3 w-3" /> Análise de Estudo
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{result.summary}</p>
            </div>

            {/* Proposed skills */}
            {result.proposedSkills?.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                  Habilidades Propostas — Autorize para Adquirir
                </h3>
                <div className="space-y-3">
                  {result.proposedSkills.map((skill: any, i: number) => {
                    const isAcquired = acquiredIds.has(skill.id);
                    return (
                      <motion.div
                        key={skill.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={cn(
                          "rounded-sm border p-5 flex items-start gap-4 transition-all",
                          isAcquired ? "border-green-500/40 bg-green-500/5" : "border-border/50 bg-card/60"
                        )}
                        style={!isAcquired ? { borderColor: `${skill.color}30` } : {}}
                      >
                        <div className="h-12 w-12 rounded-sm flex items-center justify-center text-xl font-bold flex-shrink-0 border" style={{ backgroundColor: `${skill.color}15`, borderColor: `${skill.color}40`, color: skill.color }}>
                          {skill.name?.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h4 className="font-semibold">{skill.name}</h4>
                            <span className="text-xs px-2 py-0.5 rounded-full border" style={{ borderColor: `${skill.color}40`, color: skill.color }}>{skill.category}</span>
                            <span className="text-xs text-green-400">+{skill.xpValue} XP</span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2 leading-relaxed">{skill.description}</p>
                          {skill.principles?.length > 0 && (
                            <ul className="space-y-0.5">
                              {skill.principles.map((p: string, j: number) => (
                                <li key={j} className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <ChevronRight className="h-3 w-3 text-primary/50" />
                                  {p}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                        <div className="flex-shrink-0">
                          {isAcquired ? (
                            <div className="flex items-center gap-1 text-green-400 text-sm">
                              <CheckCircle className="h-5 w-5" />
                              <span className="text-xs">Adquirida</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleAcquire(skill.id)}
                              disabled={acquireMut.isPending}
                              className="flex items-center gap-2 px-4 py-2 rounded-sm bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 shadow-[0_0_15px_hsl(var(--primary)/0.3)]"
                            >
                              <Zap className="h-4 w-4" />
                              Autorizar
                            </button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
