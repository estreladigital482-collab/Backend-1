import { useState, useRef, useEffect } from "react";
import { useListConversations, useCreateConversation, useGetConversationMessages, getListConversationsQueryKey, getGetConversationMessagesQueryKey } from "@/lib/nexus-api";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Plus, Send, Cpu, User, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";

function useStreamingChat(conversationId: number | null) {
  const [messages, setMessages] = useState<{ role: string; content: string; streaming?: boolean }[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const qc = useQueryClient();

  const { data: serverMessages } = useGetConversationMessages(conversationId ?? 0, {
    query: {
      queryKey: getGetConversationMessagesQueryKey(conversationId ?? 0),
      enabled: !!conversationId,
    }
  });

  useEffect(() => {
    if (serverMessages) {
      setMessages(serverMessages.map(m => ({ role: m.role, content: m.content })));
    }
  }, [serverMessages]);

  const send = async (content: string) => {
    if (!conversationId || !content.trim() || isStreaming) return;
    const userMsg = { role: "user", content };
    setMessages(prev => [...prev, userMsg]);
    setIsStreaming(true);

    let assistantContent = "";
    setMessages(prev => [...prev, { role: "assistant", content: "", streaming: true }]);

    try {
      const resp = await fetch(`${BASE_URL}/api/ai/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!resp.body) throw new Error("No body");
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.content) {
              assistantContent += data.content;
              setMessages(prev => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last?.streaming) updated[updated.length - 1] = { ...last, content: assistantContent };
                return updated;
              });
            }
            if (data.done) {
              setMessages(prev => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last?.streaming) updated[updated.length - 1] = { role: "assistant", content: assistantContent };
                return updated;
              });
            }
          } catch {}
        }
      }
    } catch (e) {
      setMessages(prev => {
        const updated = [...prev];
        if (updated[updated.length - 1]?.streaming) {
          updated[updated.length - 1] = { role: "assistant", content: "Erro ao processar resposta." };
        }
        return updated;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  return { messages, isStreaming, send };
}

export default function Chat() {
  const [activeConvoId, setActiveConvoId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const qc = useQueryClient();

  const { data: conversations } = useListConversations();
  const createConvo = useCreateConversation();
  const { messages, isStreaming, send } = useStreamingChat(activeConvoId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (conversations?.length && !activeConvoId) {
      setActiveConvoId(conversations[0].id);
    }
  }, [conversations]);

  const handleNewConvo = async () => {
    const res = await createConvo.mutateAsync({ data: { title: `Sessão ${(conversations?.length ?? 0) + 1}` } });
    qc.invalidateQueries({ queryKey: getListConversationsQueryKey() });
    setActiveConvoId(res.id);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    let convoId = activeConvoId;
    if (!convoId) {
      const res = await createConvo.mutateAsync({ data: { title: "Nova Conversa" } });
      qc.invalidateQueries({ queryKey: getListConversationsQueryKey() });
      convoId = res.id;
      setActiveConvoId(convoId);
    }
    const msg = input;
    setInput("");
    await send(msg);
  };

  return (
    <div className="h-[calc(100vh-120px)] flex gap-4 max-w-6xl mx-auto">
      {/* Conversation list */}
      <div className="w-56 flex-shrink-0 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Sessões</h2>
          <button
            onClick={handleNewConvo}
            className="h-6 w-6 rounded-sm border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-1">
          {(conversations?.length ?? 0) === 0 ? (
            <p className="text-xs text-muted-foreground/50 text-center py-4">Nenhuma sessão.</p>
          ) : (
            conversations?.map(c => (
              <button
                key={c.id}
                onClick={() => setActiveConvoId(c.id)}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-sm text-xs transition-colors border",
                  activeConvoId === c.id
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-white/5"
                )}
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{c.title}</span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col rounded-sm border border-border/40 bg-card/40 overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-border/40 flex items-center gap-3">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </div>
          <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Terminal Neural — {activeConvoId ? `Sessão #${activeConvoId}` : "Nenhuma sessão ativa"}</span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-sm">
          {!activeConvoId ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground gap-3">
              <Cpu className="h-12 w-12 opacity-20" />
              <p>Inicie uma nova sessão para conversar.</p>
              <button onClick={handleNewConvo} className="text-primary text-xs hover:underline">
                Criar sessão
              </button>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground gap-2">
              <ChevronRight className="h-8 w-8 opacity-20" />
              <p className="text-xs">Digite uma mensagem para iniciar.</p>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "justify-start")}
                >
                  {msg.role === "assistant" && (
                    <div className="h-7 w-7 rounded-sm bg-primary/10 border border-primary/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Cpu className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div className={cn("max-w-[75%] rounded-sm px-4 py-3 text-sm leading-relaxed", msg.role === "user" ? "bg-primary/10 border border-primary/20 text-foreground" : "bg-card/60 border border-border/40 text-foreground")}>
                    {msg.content}
                    {msg.streaming && (
                      <motion.span
                        className="inline-block ml-1 h-3 w-0.5 bg-primary"
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                      />
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="h-7 w-7 rounded-sm bg-secondary/10 border border-secondary/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <User className="h-4 w-4 text-secondary" />
                    </div>
                  )}
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-border/40 flex gap-2">
          <div className="flex-1 flex items-center gap-2 bg-black/40 border border-border/40 rounded-sm px-3 focus-within:border-primary/50 transition-colors">
            <span className="text-primary/50 text-xs font-mono flex-shrink-0">{">"}</span>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder="Digite uma mensagem..."
              disabled={isStreaming}
              className="flex-1 bg-transparent text-sm py-2.5 text-foreground placeholder:text-muted-foreground/40 focus:outline-none font-mono"
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            className="px-4 py-2.5 rounded-sm bg-primary text-primary-foreground flex items-center gap-2 text-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
