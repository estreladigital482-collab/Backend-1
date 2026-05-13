import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap, Send, BookOpen, ChevronRight, Star,
  User, Cpu, X, RefreshCw, Trophy, Target, Lightbulb,
  CheckCircle, ArrowRight, Zap, Brain
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

const SUBJECTS = [
  { id: "programacao", label: "Programação", emoji: "💻", desc: "JavaScript, Python, TypeScript, etc." },
  { id: "matematica", label: "Matemática", emoji: "📐", desc: "Álgebra, cálculo, estatística..." },
  { id: "ciencias", label: "Ciências", emoji: "🔬", desc: "Física, química, biologia..." },
  { id: "historia", label: "História", emoji: "📜", desc: "Civilizações, eventos, períodos..." },
  { id: "idiomas", label: "Idiomas", emoji: "🌍", desc: "Inglês, espanhol, japonês..." },
  { id: "negocios", label: "Negócios", emoji: "💼", desc: "Marketing, finanças, empreendedorismo..." },
  { id: "filosofia", label: "Filosofia", emoji: "🧠", desc: "Pensamento crítico, ética, lógica..." },
  { id: "design", label: "Design", emoji: "🎨", desc: "UI/UX, tipografia, teoria das cores..." },
  { id: "personalizado", label: "Personalizado", emoji: "⚡", desc: "Qualquer assunto que você queira" },
];

const LEVELS = [
  { id: "iniciante", label: "Iniciante", desc: "Nunca vi este assunto antes", color: "text-green-400 border-green-400/30 bg-green-400/10" },
  { id: "basico", label: "Básico", desc: "Conheço o básico", color: "text-blue-400 border-blue-400/30 bg-blue-400/10" },
  { id: "intermediario", label: "Intermediário", desc: "Tenho alguma experiência", color: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10" },
  { id: "avancado", label: "Avançado", desc: "Busco aprofundamento", color: "text-orange-400 border-orange-400/30 bg-orange-400/10" },
];

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  streaming?: boolean;
};

type Step = "subject" | "level" | "topic" | "chat";

export default function Professor() {
  const [step, setStep] = useState<Step>("subject");
  const [selectedSubject, setSelectedSubject] = useState<typeof SUBJECTS[0] | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<typeof LEVELS[0] | null>(null);
  const [customSubject, setCustomSubject] = useState("");
  const [customTopic, setCustomTopic] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [lessonProgress, setLessonProgress] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startLesson = useCallback(async () => {
    if (!selectedSubject || !selectedLevel) return;

    const subject = selectedSubject.id === "personalizado" ? customSubject : selectedSubject.label;
    const topic = customTopic || `Introdução a ${subject}`;

    const welcomeMsg: Message = {
      id: `a_init`,
      role: "assistant",
      content: "",
      timestamp: Date.now(),
      streaming: true,
    };
    setMessages([welcomeMsg]);
    setStep("chat");
    setIsStreaming(true);
    abortRef.current = new AbortController();

    let content = "";

    try {
      const systemPrompt = `Você é o PROFESSOR CAOS, um professor especialista em ${subject} com abordagem pedagógica adaptativa.

MISSÃO: Ensinar "${topic}" para um aluno nível "${selectedLevel.label}".

REGRAS DO PROFESSOR:
1. Comece com uma saudação entusiasmada e apresente o plano de aula
2. Explique conceitos do mais simples para o mais complexo
3. Use exemplos do mundo real SEMPRE
4. Faça perguntas ao aluno para verificar a compreensão
5. Use emojis educativos para tornar o aprendizado visual
6. Divida o conteúdo em módulos claros com títulos
7. Celebre o progresso do aluno
8. Termine cada resposta com uma pergunta ou exercício prático
9. Adapte a linguagem ao nível ${selectedLevel.label}
10. Use analogias criativas para explicar conceitos difíceis

FORMATO:
- Use **negrito** para termos importantes
- Use 📚 para teoria, 💡 para dicas, 🎯 para objetivos, ✅ para conquistas
- Divida em seções claras

Comece a primeira aula agora!`;

      const response = await fetch(`${BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Olá Professor! Quero aprender ${topic}. Sou nível ${selectedLevel.label}.` },
          ],
        }),
        signal: abortRef.current.signal,
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        for (const line of chunk.split("\n")) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.content) {
              content += data.content;
              setMessages(prev => prev.map(m =>
                m.id === "a_init" ? { ...m, content } : m
              ));
            }
          } catch {}
        }
      }
    } catch (err: any) {
      if (err.name === "AbortError") return;
      content = "Desculpe, tive um problema técnico. Mas estou aqui para te ensinar! Tente novamente.";
    } finally {
      setIsStreaming(false);
      setMessages(prev => prev.map(m =>
        m.id === "a_init" ? { ...m, content, streaming: false } : m
      ));
      setLessonProgress(10);
    }
  }, [selectedSubject, selectedLevel, customSubject, customTopic]);

  const send = useCallback(async (userContent: string) => {
    if (!userContent.trim() || isStreaming) return;

    const userMsg: Message = {
      id: `u_${Date.now()}`,
      role: "user",
      content: userContent.trim(),
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsStreaming(true);
    abortRef.current = new AbortController();

    const assistantId = `a_${Date.now()}`;
    let assistantContent = "";

    setMessages(prev => [...prev, {
      id: assistantId,
      role: "assistant",
      content: "",
      timestamp: Date.now(),
      streaming: true,
    }]);

    try {
      const subject = selectedSubject?.id === "personalizado" ? customSubject : selectedSubject?.label;
      const systemPrompt = `Você é o PROFESSOR CAOS, especialista em ${subject}. 
Nível do aluno: ${selectedLevel?.label}. 
Continue a aula de forma pedagógica, adaptando ao que o aluno disse.
Sempre termine com uma pergunta, exercício ou próximo passo.`;

      const history = messages.slice(-16).map(m => ({ role: m.role as "user" | "assistant", content: m.content }));

      const response = await fetch(`${BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "system", content: systemPrompt },
            ...history,
            { role: "user", content: userContent.trim() },
          ],
        }),
        signal: abortRef.current.signal,
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        for (const line of chunk.split("\n")) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.content) {
              assistantContent += data.content;
              setMessages(prev => prev.map(m =>
                m.id === assistantId ? { ...m, content: assistantContent } : m
              ));
            }
          } catch {}
        }
      }
    } catch (err: any) {
      if (err.name === "AbortError") return;
      assistantContent = "Tive um problema. Mas continue — a persistência é parte do aprendizado! 🎓";
    } finally {
      setIsStreaming(false);
      setMessages(prev => prev.map(m =>
        m.id === assistantId ? { ...m, content: assistantContent, streaming: false } : m
      ));
      setLessonProgress(prev => Math.min(prev + 8, 95));
    }
  }, [isStreaming, messages, selectedSubject, selectedLevel, customSubject]);

  const reset = () => {
    setStep("subject");
    setSelectedSubject(null);
    setSelectedLevel(null);
    setMessages([]);
    setLessonProgress(0);
    setCustomSubject("");
    setCustomTopic("");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-primary/60 mb-1">// Modo Educação</p>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-widest">Modo Professor</h1>
            <p className="text-sm text-muted-foreground mt-1">A IA vira seu professor particular — aprenda qualquer coisa</p>
          </div>
          {step === "chat" && (
            <button onClick={reset} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border/30 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <RefreshCw className="w-4 h-4" /> Nova Aula
            </button>
          )}
        </div>
      </motion.div>

      {/* Progress */}
      {step === "chat" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 rounded-xl border border-primary/20 bg-card/40"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">
                {selectedSubject?.emoji} {selectedSubject?.id === "personalizado" ? customSubject : selectedSubject?.label}
                {" · "}
                <span className="text-muted-foreground">{selectedLevel?.label}</span>
              </span>
            </div>
            <span className="text-xs text-primary font-mono">{lessonProgress}%</span>
          </div>
          <div className="h-2 bg-black/40 rounded-full border border-border/30 overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${lessonProgress}%` }}
              transition={{ duration: 0.5 }}
              style={{ boxShadow: "0 0 8px hsl(var(--primary))" }}
            />
          </div>
        </motion.div>
      )}

      {/* Step: Subject Selection */}
      <AnimatePresence mode="wait">
        {step === "subject" && (
          <motion.div
            key="subject"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">1</div>
              <h2 className="text-base font-bold">Escolha o assunto</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {SUBJECTS.map(subject => (
                <motion.button
                  key={subject.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedSubject(subject);
                    if (subject.id !== "personalizado") setStep("level");
                  }}
                  className={cn(
                    "p-4 rounded-xl border text-left transition-all",
                    selectedSubject?.id === subject.id
                      ? "bg-primary/10 border-primary/40 text-primary"
                      : "bg-card/40 border-border/30 hover:border-primary/20 hover:bg-card/70"
                  )}
                >
                  <span className="text-2xl mb-2 block">{subject.emoji}</span>
                  <p className="text-sm font-semibold">{subject.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{subject.desc}</p>
                </motion.button>
              ))}
            </div>

            {selectedSubject?.id === "personalizado" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <input
                  type="text"
                  value={customSubject}
                  onChange={e => setCustomSubject(e.target.value)}
                  placeholder="Qual assunto você quer aprender?"
                  className="w-full bg-black/40 border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                  autoFocus
                />
                <button
                  onClick={() => customSubject.trim() && setStep("level")}
                  disabled={!customSubject.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50 hover:opacity-90"
                >
                  Continuar <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        {step === "level" && (
          <motion.div
            key="level"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <button onClick={() => setStep("subject")} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
              ← Voltar
            </button>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">2</div>
              <h2 className="text-base font-bold">Qual é seu nível?</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {LEVELS.map(level => (
                <motion.button
                  key={level.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => {
                    setSelectedLevel(level);
                    setStep("topic");
                  }}
                  className={cn(
                    "p-4 rounded-xl border text-left transition-all",
                    selectedLevel?.id === level.id
                      ? `${level.color} border-2`
                      : "bg-card/40 border-border/30 hover:bg-card/70"
                  )}
                >
                  <p className="text-sm font-semibold">{level.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{level.desc}</p>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {step === "topic" && (
          <motion.div
            key="topic"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <button onClick={() => setStep("level")} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
              ← Voltar
            </button>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">3</div>
              <h2 className="text-base font-bold">Qual tópico específico? <span className="text-muted-foreground text-sm font-normal">(opcional)</span></h2>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                value={customTopic}
                onChange={e => setCustomTopic(e.target.value)}
                onKeyDown={e => e.key === "Enter" && startLesson()}
                placeholder={`Ex: Funções em ${selectedSubject?.id === "personalizado" ? customSubject : selectedSubject?.label}...`}
                className="w-full bg-black/40 border border-border/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                autoFocus
              />
              <div className="flex gap-3">
                <button
                  onClick={startLesson}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-all shadow-[0_0_20px_hsl(var(--primary)/0.3)]"
                >
                  <GraduationCap className="w-5 h-5" />
                  Começar Aula!
                </button>
                <button
                  onClick={startLesson}
                  className="px-4 py-3 rounded-xl border border-border/30 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Pular — começar do básico
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === "chat" && (
          <motion.div
            key="chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Messages */}
            <div className="space-y-4 min-h-[300px]">
              <AnimatePresence initial={false}>
                {messages.map(msg => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn("flex gap-3 items-start", msg.role === "user" && "flex-row-reverse")}
                  >
                    <div className={cn(
                      "flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center border mt-0.5",
                      msg.role === "user"
                        ? "bg-primary/20 border-primary/30"
                        : "bg-amber-500/20 border-amber-500/30"
                    )}>
                      {msg.role === "user"
                        ? <User className="w-4 h-4 text-primary" />
                        : <GraduationCap className="w-4 h-4 text-amber-400" />
                      }
                    </div>
                    <div className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-3 border text-sm leading-relaxed",
                      msg.role === "user"
                        ? "bg-primary/10 border-primary/20 rounded-tr-sm"
                        : "bg-card/70 border-border/30 rounded-tl-sm backdrop-blur-sm"
                    )}>
                      {msg.streaming && !msg.content ? (
                        <div className="flex gap-1 items-center h-5">
                          {[0, 1, 2].map(i => (
                            <span key={i} className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: `${i * 0.12}s` }} />
                          ))}
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="sticky bottom-0 bg-background/80 backdrop-blur-xl pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] -mx-4 px-4">
              <div className="flex items-end gap-2 max-w-3xl mx-auto">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
                  }}
                  placeholder="Responda, faça perguntas ou peça para explicar de outro jeito..."
                  rows={1}
                  disabled={isStreaming}
                  className="flex-1 rounded-2xl bg-card/50 border border-border/40 px-4 py-3 text-sm focus:outline-none focus:border-primary/40 transition-colors resize-none max-h-32 disabled:opacity-50"
                  style={{ height: "auto" }}
                  onInput={e => {
                    const el = e.currentTarget;
                    el.style.height = "auto";
                    el.style.height = Math.min(el.scrollHeight, 128) + "px";
                  }}
                />
                <button
                  onClick={() => send(input)}
                  disabled={!input.trim() || isStreaming}
                  className={cn(
                    "flex-shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center transition-all",
                    input.trim() && !isStreaming
                      ? "bg-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.4)] hover:bg-amber-400"
                      : "bg-card/50 border border-border/30 text-muted-foreground cursor-not-allowed"
                  )}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2 max-w-3xl mx-auto">
                {["Explica de novo", "Dá um exemplo", "Próximo tópico", "Faz um exercício"].map(s => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    disabled={isStreaming}
                    className="px-3 py-1 rounded-full bg-card/40 border border-border/20 text-xs text-muted-foreground hover:text-foreground hover:border-border/50 transition-all disabled:opacity-50"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
