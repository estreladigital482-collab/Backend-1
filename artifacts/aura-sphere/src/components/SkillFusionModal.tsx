import { useState, useRef, useEffect } from "react";
import { X, Flame, Loader, CheckCircle, AlertCircle, Zap } from "lucide-react";

interface Skill {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  level: number;
  xp: number;
  knowledge: string;
  isEquipped: boolean;
  fusionParents?: string[];
}

interface FusedSkill {
  name: string;
  description: string;
  category: string;
  icon: string;
  level: number;
  xp: number;
  knowledge: string;
  fusionParents: string[];
}

interface SkillFusionModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  skills: Skill[];
  onSkillAcquired: () => void;
}

type FuseState = "select" | "fusing" | "done" | "error";

export function SkillFusionModal({ isOpen, onClose, userId, skills, onSkillAcquired }: SkillFusionModalProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const [fuseState, setFuseState] = useState<FuseState>("select");
  const [progress, setProgress] = useState("");
  const [fusedSkill, setFusedSkill] = useState<FusedSkill | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (progressRef.current) progressRef.current.scrollTop = progressRef.current.scrollHeight;
  }, [progress]);

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };

  const handleFuse = async () => {
    if (selected.length < 2) return;
    setFuseState("fusing");
    setProgress("");
    setFusedSkill(null);

    try {
      const res = await fetch("/api/skills/fuse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, skillIds: selected }),
      });
      if (!res.ok || !res.body) throw new Error("Falha na conexão.");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const evt = JSON.parse(line.slice(6)) as {
              type: string; content?: string; skill?: FusedSkill; message?: string;
            };
            if (evt.type === "thinking" || evt.type === "progress") {
              setProgress((p) => p + (evt.content ?? ""));
            } else if (evt.type === "skill") {
              setFusedSkill(evt.skill ? { ...evt.skill, fusionParents: selected } : null);
            } else if (evt.type === "done") {
              setFuseState("done");
            } else if (evt.type === "error") {
              setErrorMsg(evt.message ?? "Erro desconhecido.");
              setFuseState("error");
            }
          } catch {}
        }
      }
    } catch {
      setErrorMsg("Não foi possível conectar ao servidor.");
      setFuseState("error");
    }
  };

  const handleConfirm = async () => {
    if (!fusedSkill) return;
    setSaving(true);
    try {
      const res = await fetch("/api/skills/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...fusedSkill }),
      });
      if (!res.ok) throw new Error("Falha ao salvar.");
      onSkillAcquired();
      handleClose();
    } catch {
      setErrorMsg("Erro ao salvar habilidade fundida.");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setSelected([]);
    setFuseState("select");
    setProgress("");
    setFusedSkill(null);
    setErrorMsg("");
    onClose();
  };

  if (!isOpen) return null;

  const selectedSkills = skills.filter((s) => selected.includes(s.id));

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 px-4 py-6">
      <div className="w-full max-w-2xl overflow-hidden rounded-[2rem] border border-orange-500/20 bg-slate-950/98 shadow-2xl shadow-orange-500/10">
        <div className="flex items-center justify-between gap-4 border-b border-white/10 bg-slate-900/90 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-orange-600/20 p-2">
              <Flame size={22} className="text-orange-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Fusão de Habilidades</h2>
              <p className="text-xs text-slate-400">Combine 2 ou 3 habilidades para criar algo mais poderoso</p>
            </div>
          </div>
          <button onClick={handleClose} className="rounded-full bg-slate-800 p-2 text-slate-300 hover:bg-slate-700 transition">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {fuseState === "select" && (
            <>
              <div>
                <p className="text-sm text-slate-400 mb-3">Selecione 2 ou 3 habilidades para fundir ({selected.length}/3 selecionadas):</p>
                <div className="grid gap-2 max-h-64 overflow-y-auto pr-1">
                  {skills.length === 0 && (
                    <p className="text-sm text-slate-500 text-center py-8">Você ainda não tem habilidades. Estude um tópico primeiro!</p>
                  )}
                  {skills.map((skill) => (
                    <button
                      key={skill.id}
                      onClick={() => toggleSelect(skill.id)}
                      className={`w-full rounded-2xl border p-3 text-left transition ${
                        selected.includes(skill.id)
                          ? "border-orange-500 bg-orange-500/10"
                          : "border-white/10 bg-slate-900/80 hover:border-orange-400/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{skill.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white text-sm">{skill.name}</p>
                          <p className="text-xs text-slate-400 truncate">{skill.description}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs text-violet-300">Nv {skill.level}</p>
                          <p className="text-xs text-amber-300">{skill.xp} XP</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {selected.length >= 2 && (
                <div className="rounded-2xl border border-orange-500/30 bg-orange-500/5 p-4">
                  <p className="text-xs text-slate-400 mb-2">Será fundido:</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {selectedSkills.map((s, i) => (
                      <span key={s.id} className="flex items-center gap-1 text-sm text-white">
                        <span>{s.icon}</span> {s.name}
                        {i < selectedSkills.length - 1 && <span className="text-orange-400 mx-1">+</span>}
                      </span>
                    ))}
                    <span className="text-orange-400 mx-1">=</span>
                    <span className="text-orange-300 font-semibold">???</span>
                  </div>
                </div>
              )}

              <button
                onClick={handleFuse}
                disabled={selected.length < 2}
                className="w-full rounded-2xl bg-orange-600 py-3 text-sm font-semibold text-white hover:bg-orange-500 transition disabled:opacity-40 flex items-center justify-center gap-2"
              >
                <Flame size={16} />
                Fundir Habilidades
              </button>
            </>
          )}

          {fuseState === "fusing" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-orange-300">
                <Flame size={20} className="animate-pulse" />
                <span className="font-medium">Fundindo habilidades...</span>
              </div>
              <div
                ref={progressRef}
                className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 h-48 overflow-y-auto font-mono text-xs text-slate-300 whitespace-pre-wrap"
              >
                {progress || "Iniciando fusão..."}
              </div>
            </div>
          )}

          {fuseState === "done" && fusedSkill && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 text-orange-400">
                <CheckCircle size={20} />
                <span className="font-medium">Fusão completa! Uma nova habilidade emergiu!</span>
              </div>

              <div className="rounded-2xl border border-orange-500/40 bg-gradient-to-br from-orange-500/5 to-violet-500/5 p-5 space-y-4">
                <div className="flex items-start gap-4">
                  <span className="text-5xl">{fusedSkill.icon}</span>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white">{fusedSkill.name}</h3>
                    <p className="text-sm text-slate-300 mt-1">{fusedSkill.description}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <span className="rounded-full bg-orange-600/20 px-3 py-1 text-xs text-orange-300">{fusedSkill.category}</span>
                      <span className="text-xs text-violet-300">Nível {fusedSkill.level}</span>
                      <span className="text-xs text-amber-300">+{fusedSkill.xp} XP</span>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl bg-slate-900/80 border border-white/10 p-3">
                  <p className="text-xs text-slate-400 mb-1 uppercase tracking-wider">Fusão de</p>
                  <p className="text-sm text-slate-300">{selectedSkills.map((s) => `${s.icon} ${s.name}`).join(" + ")}</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={handleClose} className="flex-1 rounded-2xl border border-white/10 bg-slate-800 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-700 transition">
                  Cancelar
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={saving}
                  className="flex-1 rounded-2xl bg-orange-600 py-3 text-sm font-semibold text-white hover:bg-orange-500 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? <Loader size={16} className="animate-spin" /> : <Zap size={16} />}
                  {saving ? "Adquirindo..." : "Adquirir Fusão"}
                </button>
              </div>
            </div>
          )}

          {fuseState === "error" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-red-400">
                <AlertCircle size={20} />
                <span>{errorMsg}</span>
              </div>
              <button onClick={() => { setFuseState("select"); setErrorMsg(""); }} className="w-full rounded-2xl bg-slate-800 py-3 text-sm font-semibold text-white hover:bg-slate-700 transition">
                Tentar novamente
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
