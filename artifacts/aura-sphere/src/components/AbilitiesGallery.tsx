import { useState, useEffect, useCallback } from "react";
import { Plus, Flame, Zap, Star, Shield, BookOpen, Sparkles, Trash2, Package } from "lucide-react";
import { SkillStudyModal } from "./SkillStudyModal";
import { SkillFusionModal } from "./SkillFusionModal";
import { AbilityCard } from "./AbilityCard";

interface Skill {
  id: string;
  userId: string;
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
  createdAt: string;
}

interface AbilitiesGalleryProps {
  userId: string;
}

const CATEGORIES = ["todos", "programação", "segurança", "dados", "automação", "web", "mobile", "ai", "geral"];

const categoryColors: Record<string, string> = {
  programação: "bg-blue-600/20 text-blue-300 border-blue-500/30",
  segurança: "bg-red-600/20 text-red-300 border-red-500/30",
  dados: "bg-yellow-600/20 text-yellow-300 border-yellow-500/30",
  automação: "bg-orange-600/20 text-orange-300 border-orange-500/30",
  web: "bg-cyan-600/20 text-cyan-300 border-cyan-500/30",
  mobile: "bg-purple-600/20 text-purple-300 border-purple-500/30",
  ai: "bg-violet-600/20 text-violet-300 border-violet-500/30",
  geral: "bg-slate-600/20 text-slate-300 border-slate-500/30",
};

function AILevel({ skills }: { skills: Skill[] }) {
  const totalXP = skills.reduce((sum, s) => sum + s.xp, 0);
  const level = Math.max(1, Math.floor(totalXP / 300) + 1);
  const xpIntoLevel = totalXP % 300;
  const xpToNext = 300;
  const equippedCount = skills.filter((s) => s.isEquipped).length;
  const fusedCount = skills.filter((s) => s.fusionParents && s.fusionParents.length > 0).length;

  return (
    <div className="glass-panel border border-white/10 p-5 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.85)]">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-violet-500/30">
              {level}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center">
              <Star size={10} className="text-amber-900" />
            </div>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider">Nível da IA</p>
            <h3 className="text-xl font-bold text-white">
              {level <= 3 ? "Aventureiro Iniciante" : level <= 6 ? "Explorador" : level <= 10 ? "Mestre das Habilidades" : "Lendário"}
            </h3>
            <p className="text-xs text-slate-400">{totalXP} XP total</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">Próximo nível</p>
          <p className="text-sm font-semibold text-violet-300">{xpIntoLevel}/{xpToNext} XP</p>
        </div>
      </div>

      <div className="w-full bg-slate-800 rounded-full h-2 mb-4">
        <div
          className="bg-gradient-to-r from-violet-500 to-blue-500 h-2 rounded-full transition-all duration-700"
          style={{ width: `${Math.min(100, (xpIntoLevel / xpToNext) * 100)}%` }}
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-slate-900/80 p-3 text-center border border-white/10">
          <p className="text-2xl font-bold text-white">{skills.length}</p>
          <p className="text-xs text-slate-400 mt-1">Habilidades</p>
        </div>
        <div className="rounded-xl bg-slate-900/80 p-3 text-center border border-white/10">
          <p className="text-2xl font-bold text-emerald-400">{equippedCount}</p>
          <p className="text-xs text-slate-400 mt-1">Equipadas</p>
        </div>
        <div className="rounded-xl bg-slate-900/80 p-3 text-center border border-white/10">
          <p className="text-2xl font-bold text-orange-400">{fusedCount}</p>
          <p className="text-xs text-slate-400 mt-1">Fusões</p>
        </div>
      </div>
    </div>
  );
}

export function AbilitiesGallery({ userId }: AbilitiesGalleryProps) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("todos");
  const [isStudyOpen, setIsStudyOpen] = useState(false);
  const [isFusionOpen, setIsFusionOpen] = useState(false);
  const [knowledgeViewing, setKnowledgeViewing] = useState<Skill | null>(null);

  const fetchSkills = useCallback(async () => {
    try {
      const res = await fetch(`/api/skills?user_id=${encodeURIComponent(userId)}`);
      const data = await res.json() as { skills?: Skill[] };
      setSkills(data.skills ?? []);
    } catch {
      setSkills([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetchSkills(); }, [fetchSkills]);

  const toggleEquip = async (skill: Skill) => {
    const newEquip = !skill.isEquipped;
    setSkills((prev) => prev.map((s) => s.id === skill.id ? { ...s, isEquipped: newEquip, status: newEquip ? "equipped" : "ready" } : s));
    try {
      await fetch(`/api/skills/${skill.id}/equip`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, equip: newEquip }),
      });
    } catch {
      setSkills((prev) => prev.map((s) => s.id === skill.id ? { ...s, isEquipped: skill.isEquipped, status: skill.status } : s));
    }
  };

  const deleteSkill = async (id: string) => {
    setSkills((prev) => prev.filter((s) => s.id !== id));
    try {
      await fetch(`/api/skills/${id}?user_id=${encodeURIComponent(userId)}`, { method: "DELETE" });
    } catch {
      fetchSkills();
    }
  };

  const filtered = activeCategory === "todos" ? skills : skills.filter((s) => s.category === activeCategory);

  return (
    <div className="h-full overflow-y-auto p-5 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400 mb-1">Sistema de Habilidades</p>
          <h2 className="text-2xl font-bold text-white">Forja de Habilidades</h2>
          <p className="text-sm text-slate-400 mt-1">Estude tópicos, equipe habilidades e funda-as para criar algo único</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsFusionOpen(true)}
            disabled={skills.length < 2}
            className="flex items-center gap-2 rounded-2xl bg-orange-600/80 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-500 transition disabled:opacity-40"
          >
            <Flame size={16} /> Fundir
          </button>
          <button
            onClick={() => setIsStudyOpen(true)}
            className="flex items-center gap-2 rounded-2xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-500 transition"
          >
            <Plus size={16} /> Estudar
          </button>
        </div>
      </div>

      {/* AI Level Bar */}
      <AILevel skills={skills} />

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => setIsStudyOpen(true)}
          className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 text-left hover:border-violet-400/50 transition group"
        >
          <BookOpen size={20} className="text-violet-400 mb-2 group-hover:scale-110 transition" />
          <p className="text-sm font-semibold text-white">Estudar Tópico</p>
          <p className="text-xs text-slate-400 mt-1">Hacking, Crypto, ML...</p>
        </button>
        <button
          onClick={() => setIsStudyOpen(true)}
          className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 text-left hover:border-emerald-400/50 transition group"
        >
          <Package size={20} className="text-emerald-400 mb-2 group-hover:scale-110 transition" />
          <p className="text-sm font-semibold text-white">Analisar Repo</p>
          <p className="text-xs text-slate-400 mt-1">Extrair habilidades de código</p>
        </button>
        <button
          onClick={() => setIsFusionOpen(true)}
          disabled={skills.length < 2}
          className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 text-left hover:border-orange-400/50 transition group disabled:opacity-40"
        >
          <Flame size={20} className="text-orange-400 mb-2 group-hover:scale-110 transition" />
          <p className="text-sm font-semibold text-white">Fusão</p>
          <p className="text-xs text-slate-400 mt-1">Combinar habilidades</p>
        </button>
      </div>

      {/* Category Filter */}
      {skills.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.filter((c) => c === "todos" || skills.some((s) => s.category === c)).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition capitalize border ${
                activeCategory === cat
                  ? "bg-violet-600 text-white border-violet-500"
                  : "border-white/10 bg-slate-900/80 text-slate-300 hover:border-violet-400/50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Skills Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <Sparkles size={32} className="animate-pulse text-violet-400" />
            <p>Carregando habilidades...</p>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/20 bg-slate-950/50 p-12 text-center">
          <Sparkles size={40} className="text-violet-400/50 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            {skills.length === 0 ? "Nenhuma habilidade ainda" : "Nenhuma habilidade nesta categoria"}
          </h3>
          <p className="text-sm text-slate-400 mb-5">
            {skills.length === 0
              ? "Comece sua jornada! Peça para a IA estudar um tópico como Hacking, Criptografia ou Automação."
              : "Tente outra categoria ou estude um novo tópico."}
          </p>
          <button
            onClick={() => setIsStudyOpen(true)}
            className="rounded-2xl bg-violet-600 px-6 py-3 text-sm font-semibold text-white hover:bg-violet-500 transition"
          >
            Estudar Primeiro Tópico
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filtered.map((skill) => (
            <AbilityCard
              key={skill.id}
              skill={skill}
              categoryColor={categoryColors[skill.category] ?? categoryColors.geral}
              onEquip={() => toggleEquip(skill)}
              onDelete={() => deleteSkill(skill.id)}
              onViewKnowledge={() => setKnowledgeViewing(skill)}
            />
          ))}
        </div>
      )}

      {/* Knowledge Viewer Modal */}
      {knowledgeViewing && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 px-4 py-6">
          <div className="w-full max-w-2xl max-h-[80vh] overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/98 flex flex-col">
            <div className="flex items-center justify-between gap-4 border-b border-white/10 bg-slate-900/90 px-6 py-4 shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{knowledgeViewing.icon}</span>
                <div>
                  <h3 className="font-bold text-white">{knowledgeViewing.name}</h3>
                  <p className="text-xs text-slate-400">Conhecimento completo</p>
                </div>
              </div>
              <button onClick={() => setKnowledgeViewing(null)} className="rounded-full bg-slate-800 p-2 text-slate-300 hover:bg-slate-700 transition">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="overflow-y-auto p-6 text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
              {knowledgeViewing.knowledge || "Nenhum conhecimento registrado."}
            </div>
          </div>
        </div>
      )}

      <SkillStudyModal
        isOpen={isStudyOpen}
        onClose={() => setIsStudyOpen(false)}
        userId={userId}
        onSkillAcquired={() => { fetchSkills(); setIsStudyOpen(false); }}
      />

      <SkillFusionModal
        isOpen={isFusionOpen}
        onClose={() => setIsFusionOpen(false)}
        userId={userId}
        skills={skills}
        onSkillAcquired={() => { fetchSkills(); setIsFusionOpen(false); }}
      />
    </div>
  );
}
