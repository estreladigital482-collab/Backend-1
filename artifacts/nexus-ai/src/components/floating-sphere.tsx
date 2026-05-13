import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { Cpu, Mic, MicOff, X, MessageSquare, Send, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";
const SPHERE_KEY = "caos_sphere_enabled";
const SPHERE_POS_KEY = "caos_sphere_pos";

type SphereState = "idle" | "listening" | "thinking" | "expanded";

export function FloatingSphere() {
  const [enabled, setEnabled] = useState(() => localStorage.getItem(SPHERE_KEY) !== "false");
  const [state, setState] = useState<SphereState>("idle");
  const [input, setInput] = useState("");
  const [reply, setReply] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [pos, setPos] = useState(() => {
    try {
      const saved = localStorage.getItem(SPHERE_POS_KEY);
      return saved ? JSON.parse(saved) : { x: window.innerWidth - 80, y: window.innerHeight - 160 };
    } catch {
      return { x: window.innerWidth - 80, y: window.innerHeight - 160 };
    }
  });

  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  useEffect(() => {
    const handler = () => setEnabled(localStorage.getItem(SPHERE_KEY) !== "false");
    window.addEventListener("caos_sphere_toggle", handler);
    return () => window.removeEventListener("caos_sphere_toggle", handler);
  }, []);

  useEffect(() => {
    if (state === "expanded") {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [state]);

  const sendQuick = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return;
    setState("thinking");
    setReply("");
    setIsStreaming(true);
    abortRef.current = new AbortController();

    try {
      const response = await fetch(`${BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "system", content: "Você é o CAOS, assistente de IA rápido e direto. Responda de forma breve e útil (máximo 3 linhas). Use emojis quando apropriado." },
            { role: "user", content: text.trim() },
          ],
        }),
        signal: abortRef.current.signal,
      });

      if (!response.ok) throw new Error("Erro");
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let content = "";

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
              setReply(content);
            }
          } catch {}
        }
      }
    } catch (err: any) {
      if (err.name !== "AbortError") setReply("Erro ao responder. Tente novamente.");
    } finally {
      setIsStreaming(false);
      setState("expanded");
    }
  }, [isStreaming]);

  const handleSend = () => {
    if (input.trim()) {
      sendQuick(input);
      setInput("");
    }
  };

  const toggle = () => {
    if (state === "expanded" || state === "thinking") {
      setState("idle");
      setReply("");
      setInput("");
      abortRef.current?.abort();
    } else {
      setState("expanded");
    }
  };

  const close = () => {
    setState("idle");
    setReply("");
    setInput("");
    abortRef.current?.abort();
  };

  if (!enabled) return null;

  return (
    <motion.div
      ref={dragRef}
      drag
      dragMomentum={false}
      dragConstraints={{
        left: 10,
        right: window.innerWidth - 70,
        top: 10,
        bottom: window.innerHeight - 70,
      }}
      initial={{ x: pos.x, y: pos.y }}
      onDragStart={() => { isDragging.current = true; }}
      onDragEnd={(_, info) => {
        const newPos = { x: pos.x + info.offset.x, y: pos.y + info.offset.y };
        setPos(newPos);
        localStorage.setItem(SPHERE_POS_KEY, JSON.stringify(newPos));
        setTimeout(() => { isDragging.current = false; }, 100);
      }}
      style={{ position: "fixed", zIndex: 9999, cursor: "grab" }}
      className="select-none"
    >
      {/* Expanded panel */}
      <AnimatePresence>
        {(state === "expanded" || state === "thinking") && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="absolute bottom-16 right-0 w-72 bg-card/95 backdrop-blur-xl border border-primary/20 rounded-2xl shadow-2xl overflow-hidden"
            style={{ boxShadow: "0 0 30px hsl(var(--primary)/0.2)" }}
          >
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-border/30">
              <div className="flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-bold text-primary uppercase tracking-wider">CAOS</span>
              </div>
              <button onClick={close} className="text-muted-foreground hover:text-foreground">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {state === "thinking" && !reply ? (
              <div className="p-4 flex items-center gap-2">
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <span key={i} className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: `${i * 0.12}s` }} />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">Pensando...</span>
              </div>
            ) : reply ? (
              <div className="px-3 py-2.5">
                <p className="text-xs text-foreground leading-relaxed">{reply}</p>
              </div>
            ) : null}

            <div className="px-3 pb-3">
              <div className="flex gap-1.5">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSend()}
                  placeholder="Pergunte algo rápido..."
                  className="flex-1 bg-black/30 border border-border/30 rounded-lg px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 transition-colors"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isStreaming}
                  className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-primary disabled:opacity-40 hover:bg-primary/30 transition-colors"
                >
                  <Send className="w-3 h-3" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sphere button */}
      <motion.button
        onClick={() => !isDragging.current && toggle()}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={state === "idle" ? {
          boxShadow: ["0 0 10px hsl(var(--primary)/0.3)", "0 0 20px hsl(var(--primary)/0.6)", "0 0 10px hsl(var(--primary)/0.3)"],
        } : state === "thinking" ? {
          boxShadow: ["0 0 15px hsl(var(--primary)/0.5)", "0 0 30px hsl(var(--primary)/0.9)", "0 0 15px hsl(var(--primary)/0.5)"],
          scale: [1, 1.05, 1],
        } : {}}
        transition={{ duration: 2, repeat: Infinity }}
        className={cn(
          "w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all relative overflow-hidden",
          state === "idle" ? "bg-primary/20 border-primary/60" :
          state === "thinking" ? "bg-primary/40 border-primary" :
          "bg-primary/30 border-primary/80"
        )}
      >
        {/* Inner glow */}
        <motion.div
          className="absolute inset-0 rounded-full bg-primary/20"
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.2, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <Cpu className={cn(
          "w-5 h-5 relative z-10",
          state === "thinking" ? "text-primary animate-spin" : "text-primary"
        )} />
      </motion.button>
    </motion.div>
  );
}

export function SphereToggleButton() {
  const [enabled, setEnabled] = useState(() => localStorage.getItem(SPHERE_KEY) !== "false");

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    localStorage.setItem(SPHERE_KEY, String(next));
    window.dispatchEvent(new Event("caos_sphere_toggle"));
  };

  return (
    <button
      onClick={toggle}
      className={cn(
        "relative w-12 h-6 rounded-full transition-colors border",
        enabled ? "bg-primary border-primary/50" : "bg-card border-border"
      )}
    >
      <div className={cn(
        "absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all",
        enabled ? "left-[calc(100%-1.375rem)]" : "left-0.5"
      )} />
    </button>
  );
}
