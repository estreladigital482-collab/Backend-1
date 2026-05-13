import { useState } from "react";
import { Zap, Trash2, BookOpen, Shield, Flame, ChevronDown, ChevronUp } from "lucide-react";

interface Skill {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  level: number;
  xp: number;
  knowledge: string;
  status: string;
  isEquipped: boolean;
  fusionParents: string[];
}

interface AbilityCardProps {
  skill: Skill;
  categoryColor: string;
  onEquip: () => void;
  onDelete: () => void;
  onViewKnowledge: () => void;
}

export function AbilityCard({ skill, categoryColor, onEquip, onDelete, onViewKnowledge }: AbilityCardProps) {
  const [expanded, setExpanded] = useState(false);
  const isFused = skill.fusionParents && skill.fusionParents.length > 0;
  const xpPercent = Math.min(100, ((skill.xp % 300) / 300) * 100);

  return (
    <div className={`rounded-[1.75rem] border transition-all duration-200 hover:-translate-y-0.5 ${
      skill.isEquipped
        ? "border-emerald-500/40 bg-gradient-to-br from-emerald-950/30 to-slate-950/80 shadow-[0_0_24px_rgba(16,185,129,0.08)]"
        : isFused
        ? "border-orange-500/30 bg-gradient-to-br from-orange-950/20 to-slate-950/80 shadow-[0_16px_40px_-24px_rgba(0,0,0,0.7)]"
        : "border-white/10 bg-slate-950/80 shadow-[0_16px_40px_-24px_rgba(0,0,0,0.7)]"
    }`}>
      <div className="p-5 space-y-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <span className="text-3xl shrink-0">{skill.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="font-bold text-white">{skill.name}</h3>
              {isFused && (
                <span className="rounded-full bg-orange-600/20 px-2 py-0.5 text-xs text-orange-300 flex items-center gap-1">
                  <Flame size={10} /> Fusão
                </span>
              )}
              {skill.isEquipped && (
                <span className="rounded-full bg-emerald-600/20 px-2 py-0.5 text-xs text-emerald-300 flex items-center gap-1">
                  <Shield size={10} /> Equipada
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 line-clamp-2">{skill.description}</p>
          </div>
          <span className={`shrink-0 rounded-full border px-2 py-0.5 text-xs ${categoryColor}`}>
            {skill.category}
          </span>
        </div>

        {/* Level & XP */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Nível {skill.level}</span>
            <span className="text-amber-300 font-medium">{skill.xp} XP</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all duration-700 ${isFused ? "bg-gradient-to-r from-orange-500 to-violet-500" : "bg-gradient-to-r from-violet-500 to-blue-500"}`}
              style={{ width: `${xpPercent}%` }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onEquip}
            className={`flex-1 rounded-xl py-2 text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
              skill.isEquipped
                ? "bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 border border-emerald-500/30"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            <Zap size={12} />
            {skill.isEquipped ? "Desequipar" : "Equipar"}
          </button>
          <button
            onClick={onViewKnowledge}
            className="flex-1 rounded-xl py-2 text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 transition flex items-center justify-center gap-1.5"
          >
            <BookOpen size={12} />
            Ver Conhecimento
          </button>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="rounded-xl px-3 py-2 text-xs bg-slate-800 text-slate-400 hover:bg-slate-700 transition"
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {/* Expanded */}
        {expanded && (
          <div className="rounded-xl border border-white/10 bg-slate-900/80 p-4 space-y-3">
            <div className="text-xs text-slate-400 uppercase tracking-wider mb-2">Detalhes</div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Status</span>
              <span className="text-white capitalize">{skill.status}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Nível de poder</span>
              <span className="text-violet-300">{"★".repeat(Math.min(5, skill.level))}{"☆".repeat(Math.max(0, 5 - skill.level))}</span>
            </div>
            {isFused && (
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Tipo</span>
                <span className="text-orange-300">Habilidade Fundida</span>
              </div>
            )}
            <div className="text-xs text-slate-400 mt-2">Prévia do conhecimento:</div>
            <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
              {skill.knowledge.replace(/[#*`]/g, "").substring(0, 200)}...
            </p>
            <button
              onClick={onDelete}
              className="w-full mt-2 rounded-xl py-2 text-xs font-semibold bg-red-900/30 text-red-400 hover:bg-red-900/50 transition flex items-center justify-center gap-1.5 border border-red-500/20"
            >
              <Trash2 size={12} />
              Remover Habilidade
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
