import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Mic, MicOff, Volume2, VolumeX, RefreshCw, Trash2,
  Wifi, WifiOff, ChevronDown, Bot, User as UserIcon, Copy, Check,
  Zap, Code2, Brain, FolderOpen, ImageIcon, Cpu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useLocalAuth } from "@/hooks/useLocalAuth";
import { useVoiceActivity } from "@/hooks/useVoiceActivity";
import { speak, stopSpeaking, createRecognition } from "@/lib/speech";

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";
const MESSAGES_KEY = "caos_shell_v2_messages";
const VOICE_KEY = "caos_shell_voice_id";

type AiMode = "Chat" | "Código" | "Projetos" | "Memória" | "Imagem" | "Dev";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  streaming?: boolean;
  mode?: AiMode;
};

const MODES: { id: AiMode; label: string; icon: React.ElementType; color: string; desc: string }[] = [
  { id: "Chat",     label: "Chat",     icon: Bot,        color: "text-violet-400", desc: "Conversa geral com CAOS" },
  { id: "Código",   label: "Código",   icon: Code2,      color: "text-cyan-400",   desc: "Gerar e revisar código" },
  { id: "Projetos", label: "Projetos", icon: FolderOpen, color: "text-green-400",  desc: "Planejar e organizar" },
  { id: "Memória",  label: "Memória",  icon: Brain,      color: "text-purple-400", desc: "Armazenar e recuperar" },
  { id: "Imagem",   label: "Imagem",   icon: ImageIcon,  color: "text-orange-400", desc: "Criar com prompts visuais" },
  { id: "Dev",      label: "Dev",      icon: Cpu,        color: "text-red-400",    desc: "Ferramentas de desenvolvedor" },
];

const MODE_PROMPTS: Record<AiMode, string> = {
  Chat:     "Você é CAOS, uma IA em português brasileiro. Seja útil, direto e amigável.",
  Código:   "Você é CAOS no modo Código. Responda com foco técnico, use blocos de código markdown quando necessário e seja preciso.",
  Projetos: "Você é CAOS no modo Projetos. Ajude a planejar, organizar tarefas e estruturar projetos com clareza.",
  Memória:  "Você é CAOS no modo Memória. Ajude a armazenar, recuperar e organizar informações importantes.",
  Imagem:   "Você é CAOS no modo Imagem. Crie prompts visuais detalhados e criativos para geração de imagens com IA.",
  Dev:      "Você é CAOS no modo Dev. Forneça informações técnicas detalhadas sobre o ambiente, sistema e código.",
};

const SUGGESTIONS: Record<AiMode, string[]> = {
  Chat:     ["O que você pode fazer?", "Me ajude a criar um plano", "Explique o que é CAOS"],
  Código:   ["Crie uma função em TypeScript", "Revise este código", "Explique async/await"],
  Projetos: ["Crie um plano de projeto", "Liste as tarefas de hoje", "Organize meu backlog"],
  Memória:  ["O que você lembra?", "Guarde: minha meta é...", "Liste minhas informações"],
  Imagem:   ["Crie prompt para paisagem futurista", "Prompt de personagem anime", "Gere um logo minimalista"],
  Dev:      ["Status do sistema", "Liste as rotas da API", "Mostre variáveis de ambiente"],
};

function useChat(mode: AiMode) {
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const raw = localStorage.getItem(MESSAGES_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  const saveMessages = useCallback((msgs: Message[]) => {
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(msgs.slice(-200)));
  }, []);

  const send = useCallback(async (content: string): Promise<string | null> => {
    if (!content.trim() || isStreaming) return null;

    const userMsg: Message = {
      id: `u_${Date.now()}`,
      role: "user",
      content: content.trim(),
      timestamp: Date.now(),
      mode,
    };

    setMessages((prev) => {
      const next = [...prev, userMsg];
      saveMessages(next);
      return next;
    });

    setIsStreaming(true);
    abortRef.current = new AbortController();

    const assistantId = `a_${Date.now()}`;
    let assistantContent = "";

    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: "assistant" as const, content: "", timestamp: Date.now(), streaming: true, mode },
    ]);

    try {
      const history = messagesRef.current.slice(-12).map((m) => ({ role: m.role, content: m.content }));
      const response = await fetch(`${BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content.trim(),
          history: [{ role: "system", content: MODE_PROMPTS[mode] }, ...history],
        }),
        signal: abortRef.current.signal,
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      if (!response.body) throw new Error("Sem body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n")) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") break;
          try {
            const parsed = JSON.parse(data);
            const delta =
              parsed.choices?.[0]?.delta?.content ??
              parsed.content ??
              "";
            if (delta) {
              assistantContent += delta;
              setMessages((prev) =>
                prev.map((m) => m.id === assistantId ? { ...m, content: assistantContent } : m)
              );
            }
          } catch { /* ignore */ }
        }
      }

      setMessages((prev) => {
        const next = prev.map((m) =>
          m.id === assistantId ? { ...m, streaming: false } : m
        );
        saveMessages(next);
        return next;
      });
      return assistantContent;
    } catch (err: unknown) {
      if ((err as Error)?.name === "AbortError") return null;
      const errMsg = "⚠️ Erro ao conectar com CAOS. Verifique se o servidor está ativo.";
      setMessages((prev) => {
        const next = prev.map((m) =>
          m.id === assistantId ? { ...m, content: errMsg, streaming: false } : m
        );
        saveMessages(next);
        return next;
      });
      return null;
    } finally {
      setIsStreaming(false);
    }
  }, [isStreaming, mode, saveMessages]);

  const stop = useCallback(() => { abortRef.current?.abort(); }, []);
  const clear = useCallback(() => {
    setMessages([]);
    localStorage.removeItem(MESSAGES_KEY);
  }, []);

  return { messages, isStreaming, send, stop, clear };
}

function ModeSelector({ active, onSelect }: { active: AiMode; onSelect: (m: AiMode) => void }) {
  const [open, setOpen] = useState(false);
  const current = MODES.find((m) => m.id === active)!;
  const Icon = current.icon;

  useEffect(() => {
    const close = () => setOpen(false);
    if (open) document.addEventListener("click", close, { once: true });
    return () => document.removeEventListener("click", close);
  }, [open]);

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border/40 bg-card/60 text-xs transition-all hover:border-border",
          current.color
        )}
      >
        <Icon className="w-3.5 h-3.5" />
        <span className="font-medium hidden sm:inline">{current.label}</span>
        <ChevronDown className={cn("w-3 h-3 transition-transform", open && "rotate-180")} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full mb-2 left-0 z-50 w-60 rounded-xl border border-border/50 bg-background/95 backdrop-blur-xl shadow-2xl overflow-hidden"
          >
            {MODES.map((m) => {
              const MIcon = m.icon;
              return (
                <button
                  key={m.id}
                  onClick={() => { onSelect(m.id); setOpen(false); }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 hover:bg-card/60 transition-colors text-left",
                    m.id === active && "bg-card/40"
                  )}
                >
                  <MIcon className={cn("w-4 h-4 flex-shrink-0", m.color)} />
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-xs font-medium", m.color)}>{m.label}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{m.desc}</p>
                  </div>
                  {m.id === active && <Zap className="w-3 h-3 text-primary ml-auto flex-shrink-0" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MessageBubble({ msg }: { msg: Message }) {
  const [copied, setCopied] = useState(false);
  const isUser = msg.role === "user";
  const modeInfo = msg.mode ? MODES.find((m) => m.id === msg.mode) : null;

  const copyContent = () => {
    navigator.clipboard.writeText(msg.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className={cn("flex gap-2.5", isUser ? "flex-row-reverse" : "flex-row")}
    >
      <div className={cn(
        "flex-shrink-0 w-7 h-7 rounded-xl border flex items-center justify-center mt-0.5",
        isUser ? "bg-primary/20 border-primary/30" : "bg-card border-border/50"
      )}>
        {isUser
          ? <UserIcon className="w-3.5 h-3.5 text-primary" />
          : <Bot className="w-3.5 h-3.5 text-muted-foreground" />
        }
      </div>

      <div className={cn("group flex-1 max-w-[85%] md:max-w-[75%]", isUser && "flex flex-col items-end")}>
        <div className={cn(
          "relative rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isUser
            ? "bg-primary/15 border border-primary/20 text-foreground rounded-tr-sm"
            : "bg-card/60 border border-border/30 text-foreground rounded-tl-sm"
        )}>
          {msg.streaming && !msg.content && (
            <div className="flex gap-1.5 py-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-primary/60"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                />
              ))}
            </div>
          )}
          <p className="whitespace-pre-wrap break-words">{msg.content}</p>
          {msg.streaming && (
            <motion.span
              className="inline-block w-0.5 h-4 bg-primary/80 ml-0.5 align-middle"
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.7, repeat: Infinity }}
            />
          )}
        </div>

        <div className={cn(
          "flex items-center gap-2 mt-1",
          isUser ? "justify-end" : "justify-start"
        )}>
          {modeInfo && (
            <span className={cn("text-[9px] font-mono flex items-center gap-0.5", modeInfo.color)}>
              <modeInfo.icon className="w-2.5 h-2.5" />
              {modeInfo.label}
            </span>
          )}
          <span className="text-[10px] text-muted-foreground/60">
            {new Date(msg.timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
          </span>
          {!msg.streaming && (
            <button
              onClick={copyContent}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
            >
              {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function Shell() {
  const [mode, setMode] = useState<AiMode>("Chat");
  const [input, setInput] = useState("");
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const voiceId = localStorage.getItem(VOICE_KEY) || "pt-female";

  const { user, createLocalUser, isOnline } = useLocalAuth();
  const { active: voiceActive } = useVoiceActivity(voiceEnabled && isListening);
  const { messages, isStreaming, send, stop, clear } = useChat(mode);
  const { toast } = useToast();

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<ReturnType<typeof createRecognition> | null>(null);

  useEffect(() => {
    if (!user) createLocalUser("Caos");
  }, [user, createLocalUser]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;
    const text = input.trim();
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    const reply = await send(text);
    if (reply && ttsEnabled) speak(reply, voiceId);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
  };

  const toggleVoice = () => {
    if (isListening) {
      setIsListening(false);
      setVoiceEnabled(false);
      recognitionRef.current?.abort();
      return;
    }
    const lang = voiceId.startsWith("pt") ? "pt-BR" : "en-US";
    const rec = createRecognition(lang);
    if (!rec) {
      toast({ title: "Voz não disponível", description: "Seu navegador não suporta reconhecimento de voz.", variant: "destructive" });
      return;
    }
    recognitionRef.current = rec;
    setVoiceEnabled(true);
    setIsListening(true);

    let partial = "";
    rec.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) { partial += t; }
        else { interim = t; }
      }
      setInput(partial + interim);
    };
    rec.onerror = () => { setIsListening(false); setVoiceEnabled(false); };
    rec.onend = () => { setIsListening(false); setVoiceEnabled(false); };
    rec.start();
  };

  const currentMode = MODES.find((m) => m.id === mode)!;

  return (
    <div className="fixed inset-0 md:relative md:inset-auto md:h-full flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="flex items-center gap-2.5">
          <div className="relative w-8 h-8 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
            <Bot className="w-4 h-4 text-primary" />
            <div className={cn(
              "absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-background",
              isOnline ? "bg-green-500" : "bg-gray-500"
            )} />
          </div>
          <div>
            <h1 className="text-sm font-bold text-foreground">CAOS</h1>
            <div className="flex items-center gap-1.5">
              {isOnline
                ? <><Wifi className="w-2.5 h-2.5 text-green-400" /><span className="text-[9px] text-green-400 font-mono">Online</span></>
                : <><WifiOff className="w-2.5 h-2.5 text-gray-400" /><span className="text-[9px] text-gray-400 font-mono">Offline</span></>
              }
              <span className="text-[9px] text-muted-foreground">·</span>
              <currentMode.icon className={cn("w-2.5 h-2.5", currentMode.color)} />
              <span className={cn("text-[9px] font-mono", currentMode.color)}>{mode}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => { setTtsEnabled(!ttsEnabled); if (ttsEnabled) stopSpeaking(); }}
            className={cn(
              "p-2 rounded-lg border transition-colors",
              ttsEnabled
                ? "border-primary/40 text-primary bg-primary/10"
                : "border-border/40 text-muted-foreground hover:border-border"
            )}
            title={ttsEnabled ? "Desligar voz" : "Ligar voz da IA"}
          >
            {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <button
            onClick={() => { clear(); toast({ title: "Conversa limpa." }); }}
            className="p-2 rounded-lg border border-border/40 text-muted-foreground hover:border-border transition-colors"
            title="Limpar conversa"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full text-center gap-5 py-16"
          >
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Bot className="w-10 h-10 text-primary/60" />
              </div>
              <motion.div
                className="absolute inset-0 rounded-2xl border border-primary/30"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground mb-1">CAOS pronta</h2>
              <p className="text-sm text-muted-foreground max-w-xs">
                Use os modos para focar: código, projetos, memória, imagem ou apenas converse.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-2 w-full max-w-xs">
              {SUGGESTIONS[mode].map((s) => (
                <button
                  key={s}
                  onClick={() => setInput(s)}
                  className="px-4 py-2 text-xs rounded-xl border border-border/40 text-muted-foreground hover:border-primary/30 hover:text-foreground bg-card/40 transition-all text-left"
                >
                  {s}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} />
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 border-t border-border/40 bg-background/80 backdrop-blur-xl px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="flex items-end gap-2 max-w-4xl mx-auto">
          <ModeSelector active={mode} onSelect={setMode} />

          <div className="flex-1 flex items-end gap-2 rounded-2xl border border-border/50 bg-card/40 px-3 py-2 focus-within:border-primary/40 transition-colors">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder={`Mensagem para CAOS — modo ${mode}...`}
              rows={1}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 resize-none outline-none min-h-[24px] max-h-[160px]"
            />
            <button
              onClick={toggleVoice}
              className={cn(
                "flex-shrink-0 p-1.5 rounded-lg transition-all",
                isListening
                  ? "text-red-400 bg-red-400/10 animate-pulse"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title={isListening ? "Parar gravação" : "Falar"}
            >
              {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </button>
          </div>

          <button
            onClick={isStreaming ? stop : handleSend}
            disabled={!isStreaming && !input.trim()}
            className={cn(
              "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all",
              isStreaming
                ? "bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30"
                : input.trim()
                  ? "bg-primary/20 border border-primary/40 text-primary hover:bg-primary/30 shadow-[0_0_15px_hsl(var(--primary)/0.2)]"
                  : "bg-card/40 border border-border/30 text-muted-foreground/30 cursor-not-allowed"
            )}
          >
            {isStreaming
              ? <RefreshCw className="w-4 h-4 animate-spin" />
              : <Send className="w-4 h-4" />
            }
          </button>
        </div>

        {/* Listening indicator */}
        <AnimatePresence>
          {voiceActive && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 justify-center mt-2"
            >
              <div className="flex gap-0.5 items-end h-5">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1 bg-red-400 rounded-full"
                    animate={{ height: [4, 16, 4] }}
                    transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                  />
                ))}
              </div>
              <span className="text-xs text-red-400 font-mono">Ouvindo...</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
