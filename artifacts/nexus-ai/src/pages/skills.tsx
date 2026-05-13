import { useState } from "react";
import { useListNexusSkills as useListSkills, useListSkillCategories, useAcquireSkill, useDeleteNexusSkill as useDeleteSkill, getListSkillsQueryKey, getListSkillCategoriesQueryKey, useGetAiProfile, getGetAiProfileQueryKey, useGetAiStats, getGetAiStatsQueryKey } from "@/lib/nexus-api";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Layers, Shield, Zap, CheckCircle, Trash2, X, Star, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  acquired: "#22c55e",
  pending: "#f59e0b",
  fused: "#ec4899",
};

const STATUS_LABELS: Record<string, string> = {
  acquired: "Adquirida",
  pending: "Pendente",
  fused: "Fundida",
};

interface SkillDetailProps {
  skill: any;
  onClose: () => void;
  onAcquire?: () => void;
  onDelete?: () => void;
  acquireLoading?: boolean;
  deleteLoading?: boolean;
}

function SkillDetail({ skill, onClose, onAcquire, onDelete, acquireLoading, deleteLoading }: SkillDetailProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="relative rounded-sm border bg-card max-w-lg w-full p-6 shadow-2xl"
        style={{ borderColor: `${skill.color}40` }}
        onClick={e => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(to right, transparent, ${skill.color}, transparent)` }} />
        <button onClick={onClose} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground">
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-4 mb-5">
          <div className="h-14 w-14 rounded-sm flex items-center justify-center text-2xl font-bold border" style={{ backgroundColor: `${skill.color}15`, borderColor: `${skill.color}40`, color: skill.color }}>
            {skill.name?.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-wide">{skill.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs px-2 py-0.5 rounded-full border text-xs" style={{ borderColor: `${skill.color}40`, color: skill.color }}>
                {skill.category}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full border" style={{ borderColor: `${STATUS_COLORS[skill.status]}40`, color: STATUS_COLORS[skill.status] }}>
                {STATUS_LABELS[skill.status] || skill.status}
              </span>
              <span className="text-xs text-muted-foreground">Nv.{skill.level}</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-5 leading-relaxed">{skill.description}</p>

        {skill.principles?.length > 0 && (
          <div className="mb-5">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Princípios</h3>
            <ul className="space-y-1">
              {skill.principles.map((p: string, i: number) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <ChevronRight className="h-3 w-3 text-primary flex-shrink-0" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {skill.studySource && (
          <div className="mb-5 p-3 rounded-sm bg-black/30 border border-border/50">
            <p className="text-xs text-muted-foreground">Fonte de estudo: <span className="text-foreground">{skill.studySource}</span></p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-sm text-green-400 font-mono">+{skill.xpValue} XP</span>
          <div className="flex gap-2">
            {skill.status === "pending" && onAcquire && (
              <button
                onClick={onAcquire}
                disabled={acquireLoading}
                className="flex items-center gap-2 px-4 py-2 rounded-sm bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <CheckCircle className="h-4 w-4" />
                {acquireLoading ? "Adquirindo..." : "Autorizar & Adquirir"}
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                disabled={deleteLoading}
                className="flex items-center gap-2 px-3 py-2 rounded-sm border border-destructive/30 text-destructive text-sm hover:bg-destructive/10 transition-colors disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                {deleteLoading ? "..." : "Remover"}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Skills() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeStatus, setActiveStatus] = useState<string | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<any | null>(null);
  const qc = useQueryClient();

  const { data: skills, isLoading } = useListSkills({ category: activeCategory ?? undefined, status: activeStatus ?? undefined });
  const { data: categories } = useListSkillCategories();
  const acquireMut = useAcquireSkill();
  const deleteMut = useDeleteSkill();

  const handleAcquire = async (id: number) => {
    await acquireMut.mutateAsync({ id });
    qc.invalidateQueries({ queryKey: getListSkillsQueryKey() });
    qc.invalidateQueries({ queryKey: getListSkillCategoriesQueryKey() });
    qc.invalidateQueries({ queryKey: getGetAiProfileQueryKey() });
    qc.invalidateQueries({ queryKey: getGetAiStatsQueryKey() });
    setSelectedSkill(null);
  };

  const handleDelete = async (id: number) => {
    await deleteMut.mutateAsync({ id });
    qc.invalidateQueries({ queryKey: getListSkillsQueryKey() });
    qc.invalidateQueries({ queryKey: getListSkillCategoriesQueryKey() });
    qc.invalidateQueries({ queryKey: getGetAiStatsQueryKey() });
    setSelectedSkill(null);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs text-primary/70 uppercase tracking-widest mb-1">// Inventário de Conhecimento</p>
        <h1 className="text-3xl font-bold tracking-tight">Habilidades</h1>
      </motion.div>

      {/* Category filters */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory(null)}
          className={cn("px-3 py-1.5 rounded-sm text-xs font-medium border transition-all", activeCategory === null ? "bg-primary/20 border-primary/50 text-primary" : "border-border/50 text-muted-foreground hover:text-foreground hover:border-border")}
        >
          Todas
        </button>
        {categories?.map(cat => (
          <button
            key={cat.name}
            onClick={() => setActiveCategory(cat.name === activeCategory ? null : cat.name)}
            className={cn("px-3 py-1.5 rounded-sm text-xs font-medium border transition-all", activeCategory === cat.name ? "text-foreground" : "border-border/50 text-muted-foreground hover:text-foreground")}
            style={activeCategory === cat.name ? { borderColor: `${cat.color}60`, backgroundColor: `${cat.color}20`, color: cat.color } : {}}
          >
            {cat.name} ({cat.count})
          </button>
        ))}
      </motion.div>

      {/* Status filters */}
      <div className="flex gap-2">
        {[null, "acquired", "pending", "fused"].map(s => (
          <button
            key={s ?? "all"}
            onClick={() => setActiveStatus(s)}
            className={cn("px-3 py-1 rounded-sm text-xs border transition-all", activeStatus === s ? "bg-primary/20 border-primary/50 text-primary" : "border-border/30 text-muted-foreground hover:border-border")}
          >
            {s === null ? "Todas" : STATUS_LABELS[s] || s}
          </button>
        ))}
      </div>

      {/* Skills grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="h-36 rounded-sm bg-card/40 animate-pulse border border-border/30" />)}
        </div>
      ) : (skills?.length ?? 0) === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 text-muted-foreground">
          <Layers className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">Nenhuma habilidade encontrada</p>
          <p className="text-sm mt-1">Estude um tópico para propor novas habilidades.</p>
        </motion.div>
      ) : (
        <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence>
            {skills?.map((skill, i) => (
              <motion.div
                key={skill.id}
                layout
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                onClick={() => setSelectedSkill(skill)}
                className="relative rounded-sm border bg-card/60 backdrop-blur-sm p-4 cursor-pointer group hover:bg-card/90 transition-all duration-200"
                style={{ borderColor: `${skill.color}30` }}
                whileHover={{ scale: 1.02, boxShadow: `0 0 20px ${skill.color}20` }}
              >
                <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(to right, transparent, ${skill.color}60, transparent)` }} />
                <div className="h-10 w-10 rounded-sm flex items-center justify-center text-lg font-bold mb-3 border" style={{ backgroundColor: `${skill.color}15`, borderColor: `${skill.color}40`, color: skill.color }}>
                  {skill.name?.charAt(0)}
                </div>
                <h3 className="font-semibold text-sm leading-tight mb-1 truncate">{skill.name}</h3>
                <p className="text-xs text-muted-foreground mb-2">{skill.category}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full border" style={{ borderColor: `${STATUS_COLORS[skill.status]}40`, color: STATUS_COLORS[skill.status] }}>
                    {STATUS_LABELS[skill.status]}
                  </span>
                  <span className="text-[10px] text-muted-foreground">+{skill.xpValue} XP</span>
                </div>
                {skill.status === "pending" && (
                  <div className="absolute top-2 right-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-400" />
                    </span>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <AnimatePresence>
        {selectedSkill && (
          <SkillDetail
            skill={selectedSkill}
            onClose={() => setSelectedSkill(null)}
            onAcquire={selectedSkill.status === "pending" ? () => handleAcquire(selectedSkill.id) : undefined}
            onDelete={() => handleDelete(selectedSkill.id)}
            acquireLoading={acquireMut.isPending}
            deleteLoading={deleteMut.isPending}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
