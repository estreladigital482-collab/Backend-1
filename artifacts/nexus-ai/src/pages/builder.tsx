import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Code2, Folder, Github, Globe, Upload,
  Bot, User, X, RefreshCw, Download, Copy, Check,
  Loader2, Terminal, Sparkles, ChevronDown, ChevronRight,
  FileCode, Layers, Play
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

type Message = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  streaming?: boolean;
  files?: string[];
};

type ProjectMode = "blank" | "github" | "upload" | "url";

const SUGGESTIONS = [
  "Crie um site landing page com animações",
  "Faça um app de lista de tarefas em React",
  "Crie uma API REST em Node.js com Express",
  "Desenvolva um jogo de snake em JavaScript",
  "Construa um dashboard de analytics com gráficos",
  "Crie um sistema de login com JWT",
];

const PROJECT_MODES: { id: ProjectMode; label: string; icon: typeof Code2; desc: string }[] = [
  { id: "blank", label: "Do Zero", icon: Sparkles, desc: "Criar projeto do zero com IA" },
  { id: "github", label: "GitHub", icon: Github, desc: "Importar e analisar repositório" },
  { id: "upload", label: "Upload", icon: Upload, desc: "Carregar arquivos do computador" },
  { id: "url", label: "URL/Site", icon: Globe, desc: "Importar de outro serviço" },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="p-1.5 rounded bg-white/5 hover:bg-white/10 transition-colors"
    >
      {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-muted-foreground" />}
    </button>
  );
}

function CodeBlock({ content }: { content: string }) {
  const codeMatch = content.match(/```(\w+)?\n([\s\S]*?)```/g);
  if (!codeMatch) {
    return (
      <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
    );
  }

  const parts: React.ReactNode[] = [];
  let last = 0;
  const regex = /```(\w+)?\n([\s\S]*?)```/g;
  let match;
  let i = 0;
  while ((match = regex.exec(content)) !== null) {
    if (match.index > last) {
      parts.push(<p key={`text-${i}`} className="text-sm leading-relaxed whitespace-pre-wrap mb-2">{content.slice(last, match.index)}</p>);
    }
    const lang = match[1] || "code";
    const code = match[2];
    parts.push(
      <div key={`code-${i}`} className="my-2 rounded-lg overflow-hidden border border-border/40">
        <div className="flex items-center justify-between px-3 py-1.5 bg-black/40 border-b border-border/30">
          <span className="text-[10px] font-mono text-primary/70 uppercase">{lang}</span>
          <CopyButton text={code} />
        </div>
        <pre className="p-3 overflow-x-auto text-xs font-mono text-green-300 bg-black/20">
          <code>{code}</code>
        </pre>
      </div>
    );
    last = match.index + match[0].length;
    i++;
  }
  if (last < content.length) {
    parts.push(<p key={`text-end`} className="text-sm leading-relaxed whitespace-pre-wrap">{content.slice(last)}</p>);
  }
  return <div>{parts}</div>;
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  const isSystem = msg.role === "system";

  if (isSystem) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex justify-center my-2"
      >
        <span className="text-[10px] font-mono text-muted-foreground/50 px-3 py-1 rounded-full bg-black/20 border border-border/20">
          {msg.content}
        </span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn("flex gap-3 items-start", isUser && "flex-row-reverse")}
    >
      <div className={cn(
        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border mt-0.5",
        isUser
          ? "bg-primary/20 border-primary/30"
          : "bg-violet-500/20 border-violet-500/30"
      )}>
        {isUser ? <User className="w-4 h-4 text-primary" /> : <Bot className="w-4 h-4 text-violet-400" />}
      </div>
      <div className={cn(
        "max-w-[80%] rounded-2xl px-4 py-3 border",
        isUser
          ? "bg-primary/15 border-primary/20 rounded-tr-sm"
          : "bg-card/70 border-border/30 rounded-tl-sm backdrop-blur-sm"
      )}>
        {msg.streaming && !msg.content ? (
          <div className="flex gap-1 items-center h-5">
            {[0, 1, 2].map((i) => (
              <span key={i} className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: `${i * 0.12}s` }} />
            ))}
          </div>
        ) : (
          <CodeBlock content={msg.content} />
        )}
        <p className="text-[9px] text-muted-foreground/40 mt-1.5 font-mono">
          {new Date(msg.timestamp).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </motion.div>
  );
}

export default function Builder() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [projectMode, setProjectMode] = useState<ProjectMode>("blank");
  const [githubUrl, setGithubUrl] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [showImport, setShowImport] = useState(false);
  const [taskContext, setTaskContext] = useState<string>("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addSystemMessage = (content: string) => {
    setMessages(prev => [...prev, {
      id: `sys_${Date.now()}`,
      role: "system",
      content,
      timestamp: Date.now(),
    }]);
  };

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
      const systemPrompt = `Você é o CAOS Builder, um assistente de programação extremamente capaz que cria projetos completos e funcionais. 
Você é especialista em: React, TypeScript, Node.js, Python, SQL, HTML/CSS, APIs REST, bancos de dados, e todas as tecnologias modernas.
Você SEMPRE:
- Escreve código COMPLETO e FUNCIONAL (nunca deixa partes por fazer)
- Explica o que cada parte do código faz
- Sugere melhorias e próximos passos
- Usa as melhores práticas da indústria
- Adapta o código ao contexto do projeto
${taskContext ? `\nContexto atual do projeto:\n${taskContext}` : ""}
Quando gerar código, use blocos de código com a linguagem especificada (ex: \`\`\`typescript ... \`\`\`).`;

      const historyMessages = messages
        .filter(m => m.role !== "system")
        .slice(-20)
        .map(m => ({ role: m.role as "user" | "assistant", content: m.content }));

      const response = await fetch(`${BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            { role: "system", content: systemPrompt },
            ...historyMessages,
            { role: "user", content: userContent.trim() },
          ],
        }),
        signal: abortRef.current.signal,
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
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
      assistantContent = assistantContent || "Erro ao processar. Verifique a conexão com a API.";
    } finally {
      setIsStreaming(false);
      setMessages(prev => prev.map(m =>
        m.id === assistantId ? { ...m, content: assistantContent, streaming: false } : m
      ));
    }
  }, [isStreaming, messages, taskContext]);

  const handleImportGitHub = () => {
    if (!githubUrl.trim()) return;
    const repoName = githubUrl.replace("https://github.com/", "").replace("http://github.com/", "");
    setTaskContext(`Repositório GitHub: ${githubUrl}`);
    addSystemMessage(`📦 Repositório importado: ${repoName}`);
    setShowImport(false);
    setGithubUrl("");
    send(`Analise o repositório GitHub: ${githubUrl}. Explique a estrutura, tecnologias usadas, e sugira melhorias ou como posso contribuir.`);
  };

  const handleImportUrl = () => {
    if (!externalUrl.trim()) return;
    setTaskContext(`Referência externa: ${externalUrl}`);
    addSystemMessage(`🌐 URL importada: ${externalUrl}`);
    setShowImport(false);
    setExternalUrl("");
    send(`Analise este projeto/serviço: ${externalUrl}. Entenda o que ele faz e me ajude a criar algo similar ou importá-lo para o CAOS.`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const fileNames = Array.from(files).map(f => f.name).join(", ");
    addSystemMessage(`📁 Arquivos carregados: ${fileNames}`);

    const readers = Array.from(files).map(file => {
      return new Promise<string>((resolve) => {
        if (file.size > 100 * 1024) {
          resolve(`[${file.name}] — arquivo grande (${(file.size / 1024).toFixed(0)}KB), análise estrutural apenas`);
          return;
        }
        const reader = new FileReader();
        reader.onload = (ev) => resolve(`=== ${file.name} ===\n${ev.target?.result}`);
        reader.readAsText(file);
      });
    });

    Promise.all(readers).then(contents => {
      const combined = contents.join("\n\n");
      send(`Analise os seguintes arquivos do meu projeto:\n\n${combined}\n\nExplique o código, encontre problemas e sugira melhorias.`);
    });

    e.target.value = "";
  };

  const stop = () => {
    abortRef.current?.abort();
    setIsStreaming(false);
  };

  const clear = () => {
    setMessages([]);
    setTaskContext("");
    toast({ title: "Sessão limpa.", description: "Contexto do projeto resetado." });
  };

  const exportChat = () => {
    const text = messages
      .filter(m => m.role !== "system")
      .map(m => `[${m.role.toUpperCase()}]\n${m.content}`)
      .join("\n\n---\n\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `caos-builder-${Date.now()}.txt`;
    a.click();
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-background pt-14 md:pt-0 md:static md:h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border/40 bg-background/80 backdrop-blur-xl flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-violet-500/20 border border-violet-500/30 flex items-center justify-center flex-shrink-0">
          <Code2 className="w-4 h-4 text-violet-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-bold text-foreground">CAOS Builder</h1>
          <p className="text-[10px] text-muted-foreground font-mono hidden sm:block">
            {taskContext ? `📦 ${taskContext.slice(0, 40)}...` : "IA constrói projetos completos por você"}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {isStreaming && (
            <button onClick={stop} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
              <X className="w-3 h-3" /> Parar
            </button>
          )}
          <button onClick={exportChat} title="Exportar" className="p-1.5 rounded-lg border border-border/30 text-muted-foreground hover:text-foreground transition-colors">
            <Download className="w-4 h-4" />
          </button>
          <button onClick={clear} title="Limpar" className="p-1.5 rounded-lg border border-border/30 text-muted-foreground hover:text-foreground transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Import modal */}
      <AnimatePresence>
        {showImport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowImport(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md bg-card border border-border rounded-2xl p-6 space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg">Importar Projeto</h3>
                <button onClick={() => setShowImport(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                    <Github className="inline w-3 h-3 mr-1" /> GitHub
                  </label>
                  <div className="flex gap-2">
                    <input
                      value={githubUrl}
                      onChange={e => setGithubUrl(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleImportGitHub()}
                      placeholder="https://github.com/user/repo"
                      className="flex-1 bg-black/40 border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50 transition-colors font-mono"
                    />
                    <button
                      onClick={handleImportGitHub}
                      disabled={!githubUrl.trim()}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium disabled:opacity-50 hover:opacity-90"
                    >
                      Importar
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                    <Globe className="inline w-3 h-3 mr-1" /> URL / Serviço Externo
                  </label>
                  <div className="flex gap-2">
                    <input
                      value={externalUrl}
                      onChange={e => setExternalUrl(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleImportUrl()}
                      placeholder="https://lovable.dev/projects/... ou qualquer URL"
                      className="flex-1 bg-black/40 border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary/50 transition-colors font-mono"
                    />
                    <button
                      onClick={handleImportUrl}
                      disabled={!externalUrl.trim()}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium disabled:opacity-50 hover:opacity-90"
                    >
                      Importar
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                    <Upload className="inline w-3 h-3 mr-1" /> Arquivos do Computador
                  </label>
                  <button
                    onClick={() => { setShowImport(false); fileRef.current?.click(); }}
                    className="w-full py-3 border-2 border-dashed border-border/50 rounded-lg text-sm text-muted-foreground hover:border-primary/50 hover:text-primary transition-all"
                  >
                    Clique para selecionar arquivos
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <input ref={fileRef} type="file" multiple className="hidden" onChange={handleFileUpload} accept=".js,.ts,.tsx,.jsx,.py,.html,.css,.json,.md,.txt,.yaml,.yml,.sql" />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center"
          >
            <div className="relative">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-20 h-20 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center"
              >
                <Code2 className="w-10 h-10 text-violet-400" />
              </motion.div>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
              >
                <Sparkles className="w-3 h-3 text-primary-foreground" />
              </motion.div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground">CAOS Builder</h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                Descreva o que quer criar. A IA constrói projetos completos sem parar até terminar.
              </p>
            </div>

            {/* Mode selector */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full max-w-lg">
              {PROJECT_MODES.map(mode => (
                <button
                  key={mode.id}
                  onClick={() => {
                    setProjectMode(mode.id);
                    if (mode.id !== "blank") setShowImport(true);
                  }}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all",
                    projectMode === mode.id
                      ? "bg-primary/10 border-primary/40 text-primary"
                      : "bg-card/40 border-border/30 text-muted-foreground hover:border-primary/20 hover:text-foreground"
                  )}
                >
                  <mode.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{mode.label}</span>
                </button>
              ))}
            </div>

            {/* Suggestions */}
            <div className="w-full max-w-lg">
              <p className="text-xs text-muted-foreground/60 mb-2 uppercase tracking-widest">Sugestões</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {SUGGESTIONS.map(s => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="text-left px-3 py-2 rounded-lg bg-card/30 border border-border/20 text-xs text-muted-foreground hover:text-foreground hover:border-border/50 hover:bg-card/60 transition-all flex items-center gap-2"
                  >
                    <Play className="w-3 h-3 text-primary/50 flex-shrink-0" />
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {messages.map(msg => (
            <MessageBubble key={msg.id} msg={msg} />
          ))}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 border-t border-border/30 bg-background/80 backdrop-blur-xl px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        {/* Toolbar */}
        <div className="flex items-center gap-2 mb-2">
          <button
            onClick={() => setShowImport(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-card/40 border border-border/30 text-xs text-muted-foreground hover:text-foreground hover:border-border/60 transition-all"
          >
            <Folder className="w-3 h-3" /> Importar
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-card/40 border border-border/30 text-xs text-muted-foreground hover:text-foreground hover:border-border/60 transition-all"
          >
            <Upload className="w-3 h-3" /> Arquivo
          </button>
          {taskContext && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/10 border border-primary/20 text-xs text-primary">
              <FileCode className="w-3 h-3" />
              <span className="max-w-[120px] truncate">{taskContext}</span>
              <button onClick={() => setTaskContext("")} className="ml-1 hover:text-primary/70">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        <div className="flex items-end gap-2 max-w-5xl mx-auto">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder="Descreva o que quer criar... (Shift+Enter para nova linha)"
              rows={1}
              disabled={isStreaming}
              className={cn(
                "w-full rounded-2xl bg-card/50 border border-border/40 px-4 py-3 text-sm text-foreground",
                "placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 transition-colors resize-none max-h-40",
                "disabled:opacity-50"
              )}
              style={{ height: "auto" }}
              onInput={e => {
                const el = e.currentTarget;
                el.style.height = "auto";
                el.style.height = Math.min(el.scrollHeight, 160) + "px";
              }}
            />
          </div>
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || isStreaming}
            className={cn(
              "flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center transition-all",
              input.trim() && !isStreaming
                ? "bg-violet-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.4)] hover:bg-violet-400"
                : "bg-card/50 border border-border/30 text-muted-foreground cursor-not-allowed"
            )}
          >
            {isStreaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
