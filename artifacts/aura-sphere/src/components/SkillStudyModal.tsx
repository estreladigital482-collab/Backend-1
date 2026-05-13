import { useState, useRef, useEffect } from "react";
import { X, BookOpen, Loader, CheckCircle, AlertCircle, Sparkles, GitBranch, Zap } from "lucide-react";

interface StudiedSkill {
  name: string;
  description: string;
  category: string;
  icon: string;
  level: number;
  xp: number;
  knowledge: string;
  fusionParents?: string[];
}

interface SkillStudyModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onSkillAcquired: () => void;
}

type StudyState = "idle" | "studying" | "done" | "error";

export function SkillStudyModal({ isOpen, onClose, userId, onSkillAcquired }: SkillStudyModalProps) {
  const [topic, setTopic] = useState("");
  const [studyType, setStudyType] = useState<"topic" | "repo">("topic");
  const [state, setState] = useState<StudyState>("idle");
  const [progress, setProgress] = useState("");
  const [studiedSkill, setStudiedSkill] = useState<StudiedSkill | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (progressRef.current) {
      progressRef.current.scrollTop = progressRef.current.scrollHeight;
    }
  }, [progress]);

  const handleStudy = async () => {
    if (!topic.trim()) return;
    setState("studying");
    setProgress("");
    setStudiedSkill(null);
    setErrorMsg("");

    try {
      const res = await fetch("/api/skills/study", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, topic: topic.trim(), type: studyType }),
      });

      if (!res.ok || !res.body) throw new Error("Falha na conexão com o servidor.");

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
              type: string; content?: string; skill?: StudiedSkill; message?: string;
            };
            if (evt.type === "thinking" || evt.type === "progress") {
              setProgress((p) => p + (evt.content ?? ""));
            } else if (evt.type === "skill") {
              setStudiedSkill(evt.skill ?? null);
            } else if (evt.type === "done") {
              setState("done");
            } else if (evt.type === "error") {
              setErrorMsg(evt.message ?? "Erro desconhecido.");
              setState("error");
            }
          } catch {}
        }
      }
    } catch (err) {
      setErrorMsg("Não foi possível conectar ao servidor. Tente novamente.");
      setState("error");
    }
  };

  const handleConfirm = async () => {
    if (!studiedSkill) return;
    setSaving(true);
    try {
      const res = await fetch("/api/skills/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...studiedSkill }),
      });
      if (!res.ok) throw new Error("Falha ao salvar habilidade.");
      onSkillAcquired();
      handleClose();
    } catch {
      setErrorMsg("Erro ao salvar habilidade. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setTopic("");
    setState("idle");
    setProgress("");
    setStudiedSkill(null);
    setErrorMsg("");
    onClose();
  };

  if (!isOpen) return null;

  const categoryColors: Record<string, string> = {
    programação: "bg-blue-600/20 text-blue-300",
    segurança: "bg-red-600/20 text-red-300",
    dados: "bg-yellow-600/20 text-yellow-300",
    automação: "bg-orange-600/20 text-orange-300",
    web: "bg-cyan-600/20 text-cyan-300",
    mobile: "bg-purple-600/20 text-purple-300",
    ai: "bg-violet-600/20 text-violet-300",
    geral: "bg-slate-600/20 text-slate-300",
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 px-4 py-6">
      <div className="w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/98 shadow-2xl shadow-violet-500/10">
        <div className="flex items-center justify-between gap-4 border-b border-white/10 bg-slate-900/90 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-violet-600/20 p-2">
              <BookOpen size={22} className="text-violet-300" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Estudar Habilidade</h2>
              <p className="text-xs text-slate-400">A IA aprende e guarda o conhecimento para você</p>
            </div>
          </div>
          <button onClick={handleClose} className="rounded-full bg-slate-800 p-2 text-slate-300 hover:bg-slate-700 transition">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {state === "idle" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setStudyType("topic")}
                  className={`rounded-2xl p-4 text-left transition border ${studyType === "topic" ? "border-violet-500 bg-violet-500/10" : "border-white/10 bg-slate-900/80 hover:border-violet-400"}`}
                >
                  <BookOpen size={20} className="text-violet-400 mb-2" />
                  <p className="font-semibold text-white text-sm">Estudar tópico</p>
                  <p className="text-xs text-slate-400 mt-1">ex: Hacking, Criptografia, Machine Learning</p>
                </button>
                <button
                  onClick={() => setStudyType("repo")}
                  className={`rounded-2xl p-4 text-left transition border ${studyType === "repo" ? "border-violet-500 bg-violet-500/10" : "border-white/10 bg-slate-900/80 hover:border-violet-400"}`}
                >
                  <GitBranch size={20} className="text-emerald-400 mb-2" />
                  <p className="font-semibold text-white text-sm">Analisar repositório</p>
                  <p className="text-xs text-slate-400 mt-1">ex: github.com/user/repo ou nome do projeto</p>
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {studyType === "topic" ? "Qual habilidade você quer que eu estude?" : "URL ou nome do repositório"}
                </label>
                <input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleStudy()}
                  placeholder={studyType === "topic" ? "ex: Hacking ético, Criptografia, SQL avançado..." : "ex: github.com/openai/whisper"}
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
                />
              </div>

              <button
                onClick={handleStudy}
                disabled={!topic.trim()}
                className="w-full rounded-2xl bg-violet-600 py-3 text-sm font-semibold text-white hover:bg-violet-500 transition disabled:opacity-40"
              >
                Começar Estudo
              </button>
            </>
          )}

          {state === "studying" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-violet-300">
                <Loader size={20} className="animate-spin" />
                <span className="font-medium">Estudando {topic}...</span>
              </div>
              <div
                ref={progressRef}
                className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 h-48 overflow-y-auto font-mono text-xs text-slate-300 whitespace-pre-wrap"
              >
                {progress || "Iniciando..."}
              </div>
            </div>
          )}

          {state === "done" && studiedSkill && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle size={20} />
                <span className="font-medium">Estudo concluído! Deseja adquirir esta habilidade?</span>
              </div>

              <div className="rounded-2xl border border-violet-500/30 bg-violet-500/5 p-5 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{studiedSkill.icon}</span>
                    <div>
                      <h3 className="text-xl font-bold text-white">{studiedSkill.name}</h3>
                      <p className="text-sm text-slate-300 mt-1">{studiedSkill.description}</p>
                    </div>
                  </div>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${categoryColors[studiedSkill.category] ?? categoryColors.geral}`}>
                    {studiedSkill.category}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-slate-900/80 p-3 text-center border border-white/10">
                    <p className="text-xs text-slate-400 mb-1">Nível</p>
                    <p className="text-2xl font-bold text-violet-300">{studiedSkill.level}</p>
                  </div>
                  <div className="rounded-xl bg-slate-900/80 p-3 text-center border border-white/10">
                    <p className="text-xs text-slate-400 mb-1">XP Ganho</p>
                    <p className="text-2xl font-bold text-amber-300">+{studiedSkill.xp}</p>
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-slate-900/80 p-3">
                  <p className="text-xs text-slate-400 mb-2 uppercase tracking-wider">Prévia do conhecimento</p>
                  <p className="text-sm text-slate-300 line-clamp-3">{studiedSkill.knowledge.replace(/[#*`]/g, "").substring(0, 200)}...</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  className="flex-1 rounded-2xl border border-white/10 bg-slate-800 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-700 transition"
                >
                  Não agora
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={saving}
                  className="flex-1 rounded-2xl bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-500 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? <Loader size={16} className="animate-spin" /> : <Zap size={16} />}
                  {saving ? "Adquirindo..." : "Adquirir Habilidade"}
                </button>
              </div>
            </div>
          )}

          {state === "error" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-red-400">
                <AlertCircle size={20} />
                <span>{errorMsg}</span>
              </div>
              <button
                onClick={() => { setState("idle"); setErrorMsg(""); }}
                className="w-full rounded-2xl bg-slate-800 py-3 text-sm font-semibold text-white hover:bg-slate-700 transition"
              >
                Tentar novamente
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
