import { useEffect, useRef, useState } from "react";
import { Send, Mic, MicOff, LogOut, Settings, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ParticleSphere } from "@/components/ParticleSphere";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChatMessage as ChatMessageCard } from "@/components/ChatMessage";
import { ConflictResolutionModal } from "@/components/ConflictResolutionModal";
import { getApiBase, getAuthHeaders } from "@/lib/api";
import type { AiMode, AiProvider, ChatMessage, ParticleShape, SphereState, VoiceId } from "@/lib/types";
import { createRecognition, getVoiceConfig, speak, stopSpeaking } from "@/lib/speech";
import { inferShape } from "@/lib/shapes";
import { useOfflineChat } from '@/hooks/useOfflineChat';
import { useLocalAuth } from '@/hooks/useLocalAuth';
import { useSyncService } from '@/hooks/useSyncService';
import { useVoiceActivity } from '@/hooks/useVoiceActivity';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { ReviewResponseModal } from '@/components/ReviewResponseModal';
import { sanitizeMemoryContent } from '@/lib/utils';
import { toast } from "sonner";

const detectModeCommand = (text: string): AiMode | undefined => {
  const normalized = text.toLowerCase().trim();
  const commands: Array<{ triggers: string[]; mode: AiMode }> = [
    { triggers: ["@chat", "/chat", "modo chat"], mode: "Chat" },
    { triggers: ["@código", "/codigo", "@codigo", "modo código", "modo code"], mode: "Código" },
    { triggers: ["@projetos", "/projetos", "modo projetos"], mode: "Projetos" },
    { triggers: ["@memória", "@memoria", "/memória", "/memoria", "modo memória"], mode: "Memória" },
    { triggers: ["@imagem", "/imagem", "modo imagem"], mode: "Imagem" },
    { triggers: ["@voz", "/voz", "modo voz"], mode: "Voz" },
    { triggers: ["@automação", "@automacao", "/automação", "/automacao", "modo automação"], mode: "Automação" },
    { triggers: ["@dev", "/dev", "modo dev", "dev mode"], mode: "Dev Mode" },
  ];

  return commands.find((command) => command.triggers.some((trigger) => normalized.startsWith(trigger)))?.mode;
};

const STATE_LABELS: Record<SphereState, string> = {
  idle: "Pronta",
  listening: "Ouvindo…",
  thinking: "Pensando…",
  responding: "Respondendo…",
};

type PromptPreset = {
  id: string;
  label: string;
  description: string;
  systemPrompt: string;
};

type MemorySearchResult = ChatMessage & { category?: string };

const AI_PROVIDER_OPTIONS: { id: AiProvider; label: string }[] = [
  { id: "lovable", label: "Lovable" },
  { id: "anthropic", label: "Anthropic / Claude" },
  { id: "openai", label: "OpenAI" },
];

const PROMPT_PRESETS: PromptPreset[] = [
  {
    id: "assistant",
    label: "Assistente",
    description: "Responda de forma clara, curta e útil em português.",
    systemPrompt: "Você é um assistente útil e educado. Responda de forma clara e objetiva em português.",
  },
  {
    id: "developer",
    label: "Desenvolvedor",
    description: "Foque em código, explicações técnicas e exemplos.",
    systemPrompt: "Você é um experiente desenvolvedor que ajuda com código, debugging e explicações técnicas.",
  },
  {
    id: "brainstorm",
    label: "Criativo",
    description: "Faça brainstorming e gere ideias para projetos.",
    systemPrompt: "Você é um assistente criativo que propõe ideias de projetos, sugestões e soluções inovadoras.",
  },
  {
    id: "summary",
    label: "Resumido",
    description: "Responda de forma concisa e focada nos pontos principais.",
    systemPrompt: "Você responde de forma sucinta e direta, resumindo as informações mais importantes sem detalhes extras.",
  },
  {
    id: "formal",
    label: "Formal",
    description: "Use tom formal e profissional nas respostas.",
    systemPrompt: "Você é um assistente profissional que responde de forma formal, clara e respeitosa.",
  },
  {
    id: "technical",
    label: "Técnico",
    description: "Use linguagem técnica apropriada e explique conceitos complexos.",
    systemPrompt: "Você é um assistente técnico que explica conceitos complexos com precisão, usando termos apropriados e exemplos claros.",
  },
  {
    id: "memory",
    label: "Memória",
    description: "Mantenha contexto e lembre-se de preferências do usuário.",
    systemPrompt: "Você mantém o contexto e lembra preferências do usuário ao responder, usando o histórico para personalizar a resposta.",
  },
];

const PROMPT_PRESET_STORAGE_KEY = "aura_sphere_prompt_presets";
const SELECTED_PROMPT_PRESET_KEY = "aura_sphere_selected_prompt_preset";

const API_BASE = getApiBase();
const AUTH_HEADERS = getAuthHeaders();

export default function Chat({
  userId,
  aiName,
  voiceId,
  onSignOut,
  onEditProfile,
  onRequestMode,
  selectedMemory,
  onMemoryUse,
}: {
  userId: string;
  aiName: string;
  voiceId: VoiceId | string;
  onSignOut: () => void;
  onEditProfile: () => void;
  onRequestMode?: (mode: AiMode) => void;
  selectedMemory?: MemorySearchResult | null;
  onMemoryUse?: () => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [provider, setProvider] = useState<AiProvider>("lovable");
  const [presetId, setPresetId] = useState<string>(PROMPT_PRESETS[0].id);
  const [state, setState] = useState<SphereState>("idle");
  const [shape, setShape] = useState<ParticleShape>("sphere");
  const [recording, setRecording] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [historyPage, setHistoryPage] = useState(0);
  const historyLimit = 20;
  const [hasMoreHistory, setHasMoreHistory] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<MemorySearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [memoryEnabled, setMemoryEnabled] = useState(true);
  const [selectedMemoryLocal, setSelectedMemoryLocal] = useState<MemorySearchResult | null>(null);
  const [showPresetEditor, setShowPresetEditor] = useState(false);
  const [customPresets, setCustomPresets] = useState<PromptPreset[]>([]);
  const [newPresetLabel, setNewPresetLabel] = useState("");
  const [newPresetDescription, setNewPresetDescription] = useState("");
  const [newPresetPrompt, setNewPresetPrompt] = useState("");
  const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [syncConflicts, setSyncConflicts] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const recognitionRef = useRef<ReturnType<typeof createRecognition> | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lang = getVoiceConfig(voiceId).lang;

  const { isOnline: networkOnline } = useLocalAuth();
  const { messages: queuedMessages, addMessage, markAsSent, markAsFailed } = useOfflineChat();
  const { performFullSync, resolveConflict } = useSyncService({ userId, isOnline: networkOnline });
  const isLocalMode = userId.startsWith('local_');

  const allPresets = [...PROMPT_PRESETS, ...customPresets];

  const activeMemory = selectedMemory ?? selectedMemoryLocal;

  const normalizeText = (text: string) =>
    text
      .toLowerCase()
      .replace(/[\W_]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const hasRepeatedAssistantContent = () => {
    const assistantMessages = messages
      .filter((message) => message.role === "assistant")
      .map((message) => normalizeText(message.content).slice(0, 240));

    const counts = new Map<string, number>();
    for (const snippet of assistantMessages) {
      counts.set(snippet, (counts.get(snippet) ?? 0) + 1);
      if (counts.get(snippet)! > 1) {
        return true;
      }
    }

    return false;
  };

  const detectQueryCategory = (text: string) => {
    const normalized = normalizeText(text);
    if (/(plano|tarefa|projeto|cronograma|agenda)/.test(normalized)) {
      return "planejamento";
    }
    if (/(código|debug|bug|implementação|script)/.test(normalized)) {
      return "técnico";
    }
    if (/(ideia|brainstorm|criati|inovação)/.test(normalized)) {
      return "criativo";
    }
    return null;
  };

  const buildDynamicSystemPrompt = (userText: string) => {
    const selectedPreset = allPresets.find((preset) => preset.id === presetId) ?? PROMPT_PRESETS[0];
    const extras: string[] = [];

    if (activeMemory) {
      extras.push(
        "Considere a memória selecionada como contexto importante e use-a para tornar a resposta mais personalizada e coerente.",
      );
    }

    const category = detectQueryCategory(userText);
    if (category === "planejamento") {
      extras.push(
        "Resposta com foco prático e organizado para tarefas e planejamento, incluindo etapas ou sugestões de execução claras.",
      );
    } else if (category === "técnico") {
      extras.push(
        "Use terminologia técnica adequada e explique conceitos com precisão, exemplos e boas práticas.",
      );
    } else if (category === "criativo") {
      extras.push(
        "Seja mais inventivo, proponha variações e soluções originais quando for relevante.",
      );
    }

    if (hasRepeatedAssistantContent()) {
      extras.push(
        "Evite repetir frases, parágrafos ou ideias já fornecidas em respostas anteriores. Reescreva o conteúdo de forma nova sempre que possível.",
      );
    }

    if (userText.length > 180) {
      extras.push(
        "Responda de forma clara e concisa, evitando explicações excessivamente longas. Use parágrafos curtos e diretos.",
      );
    }

    return [selectedPreset.systemPrompt, ...extras].filter(Boolean).join(" ");
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    let storedPresets: PromptPreset[] = [];
    try {
      storedPresets = JSON.parse(localStorage.getItem(PROMPT_PRESET_STORAGE_KEY) || "[]") as PromptPreset[];
      if (!Array.isArray(storedPresets)) storedPresets = [];
    } catch {
      storedPresets = [];
    }

    if (storedPresets.length > 0) {
      setCustomPresets(storedPresets);
    }

    const storedPresetId = localStorage.getItem(SELECTED_PROMPT_PRESET_KEY);
    const availablePresetIds = new Set([...PROMPT_PRESETS, ...storedPresets].map((preset) => preset.id));
    if (storedPresetId && availablePresetIds.has(storedPresetId)) {
      setPresetId(storedPresetId);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(SELECTED_PROMPT_PRESET_KEY, presetId);
  }, [presetId]);

  const persistCustomPresets = (presets: PromptPreset[]) => {
    setCustomPresets(presets);
    if (typeof window === "undefined") return;
    localStorage.setItem(PROMPT_PRESET_STORAGE_KEY, JSON.stringify(presets));
  };

  const addCustomPreset = () => {
    const trimmedLabel = newPresetLabel.trim();
    const trimmedDescription = newPresetDescription.trim();
    const trimmedPrompt = newPresetPrompt.trim();

    if (!trimmedLabel || !trimmedPrompt) {
      toast.error("Preencha o nome e o prompt para criar um preset.");
      return;
    }

    const slug = trimmedLabel
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "_");

    const nextId = `custom_${slug}_${Date.now()}`;
    const nextPreset: PromptPreset = {
      id: nextId,
      label: trimmedLabel,
      description: trimmedDescription || "Preset personalizado",
      systemPrompt: trimmedPrompt,
    };

    const nextPresets = [...customPresets, nextPreset];
    persistCustomPresets(nextPresets);
    setPresetId(nextId);
    setShowPresetEditor(false);
    setNewPresetLabel("");
    setNewPresetDescription("");
    setNewPresetPrompt("");
    toast.success("Preset salvo com sucesso.");
  };

  useEffect(() => {
    if (isLocalMode) {
      setMessages(queuedMessages as ChatMessage[]);
    }
  }, [isLocalMode, queuedMessages]);

  // Live mic volume — drives particle vibration. Active only while recording.
  const { volume: micVolume, active: micActive } = useVoiceActivity(recording);

  // While the AI speaks (state === "responding"), simulate a soft volume so
  // the particles also "speak". Otherwise use the live mic volume.
  const [ttsPulse, setTtsPulse] = useState(0);
  useEffect(() => {
    if (state !== "responding") {
      setTtsPulse(0);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const loop = () => {
      const t = (performance.now() - start) / 1000;
      // pseudo-speech envelope
      const v =
        0.18 +
        Math.abs(Math.sin(t * 6.2)) * 0.18 +
        Math.abs(Math.sin(t * 2.7 + 1.3)) * 0.12;
      setTtsPulse(Math.min(0.6, v));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [state]);

  const liveVolume = recording ? micVolume : ttsPulse;

  // Auto-switch to "listening" while the user actually speaks into the mic.
  useEffect(() => {
    if (recording && micActive && state !== "listening") {
      setState("listening");
    }
  }, [recording, micActive, state]);

  // Load history
  const loadHistory = async (page = 0) => {
    setHistoryLoading(true);
    const from = page * historyLimit;
    const to = from + historyLimit - 1;

    const { data, error } = await supabase
      .from("chat_messages")
      .select("id, role, content")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(from, to);

    setHistoryLoading(false);
    if (error) {
      console.error("Erro ao carregar histórico de chat:", error);
      return;
    }

    const pageMessages = (data ?? [])
      .map((m) => ({ id: m.id, role: (m.role as 'user' | 'assistant'), content: m.content }))
      .reverse();

    if (page === 0) {
      setMessages(pageMessages);
    } else {
      setMessages((prev) => [...pageMessages, ...prev]);
    }

    setHasMoreHistory((data?.length ?? 0) === historyLimit);
    setHistoryPage(page);
  };

  useEffect(() => {
    if (!userId) return;
    loadHistory(0);
  }, [userId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, state]);

  // Update particle shape based on conversation context
  useEffect(() => {
    if (messages.length === 0) {
      setShape("sphere");
      return;
    }
    const last = messages[messages.length - 1];
    // Prefer assistant content if available, otherwise the user's latest message
    const text =
      last.role === "assistant"
        ? last.content
        : messages.slice().reverse().find((m) => m.role === "assistant")?.content || last.content;
    setShape(inferShape(text));
  }, [messages]);

  const persist = async (msg: ChatMessage) => {
    if (isLocalMode || !networkOnline) {
      addMessage({ role: msg.role, content: msg.content });
      return;
    }

    const { error } = await supabase
      .from("chat_messages")
      .insert({ user_id: userId, role: msg.role, content: msg.content });
    if (error) {
      console.error("Persist error", error);
      toast.error("Não foi possível salvar a mensagem.");
    }
  };

  const saveLocalMemory = async (msg: ChatMessage, category: string = "chat") => {
    const stored = JSON.parse(localStorage.getItem('aura_sphere_memories') || '[]');
    const newMemory = {
      id: `memory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      role: msg.role,
      content: msg.content,
      category,
      tags: [category, 'offline'],
      timestamp: new Date().toISOString(),
      relevance: 0.75,
    };
    localStorage.setItem('aura_sphere_memories', JSON.stringify([newMemory, ...stored]));
  };

  const saveMemory = async (msg: ChatMessage, category: string = "chat") => {
    if (isLocalMode || !networkOnline) {
      await saveLocalMemory(msg, category);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/v1/memory`, {
        method: "POST",
        headers: AUTH_HEADERS,
        body: JSON.stringify({
          user_id: userId,
          role: msg.role,
          content: msg.content,
          category,
        }),
      });

      if (!response.ok) {
        await saveLocalMemory(msg, category);
      }
    } catch (e) {
      console.warn("Memory save failed", e);
      await saveLocalMemory(msg, category);
    }
  };

  const startReview = (message: ChatMessage) => {
    setEditingMessage(message);
    setIsReviewModalOpen(true);
  };

  const handleReviewSubmit = async (revisionText: string, comment: string) => {
    setIsReviewModalOpen(false);
    if (!editingMessage) return;

    const reviewPrompt = `Por favor, revise a resposta anterior usando este comentário: ${comment || "sem comentário adicional"}.\n\nResposta original:\n${editingMessage.content}\n\nNova versão desejada:\n${revisionText}`;
    await sendText(reviewPrompt);
    setEditingMessage(null);
  };

  const searchMemoryEntries = async (query: string): Promise<MemorySearchResult[]> => {
    const trimmed = query.trim();
    if (!trimmed) return [];

    if (!networkOnline || isLocalMode) {
      const localItems = JSON.parse(localStorage.getItem('aura_sphere_memories') || '[]') as Array<Record<string, unknown>>;
      return localItems
        .filter((item) =>
          (item.content as string).toLowerCase().includes(trimmed.toLowerCase()) ||
          ((item.tags as string[]) || []).some((tag) => tag.toLowerCase().includes(trimmed.toLowerCase())),
        )
        .map((item) => ({
          id: String(item.id),
          role: (item.role as 'user' | 'assistant' | 'system') ?? 'assistant',
          content: String(item.content),
          category: String(item.category ?? 'memória'),
        }));
    }

    const response = await fetch(
      `${API_BASE}/api/v1/search?user_id=${encodeURIComponent(userId)}&q=${encodeURIComponent(trimmed)}`,
      {
        headers: AUTH_HEADERS,
      },
    );

    if (!response.ok) {
      throw new Error(`Search request failed: ${response.status}`);
    }

    const result = (await response.json()) as {
      results?: Array<{ id: string; role: string; content: string; category: string }>;
    };

    return (result.results ?? []).map((item) => ({
      id: item.id,
      role: (item.role as 'user' | 'assistant' | 'system') ?? 'assistant',
      content: item.content,
      category: item.category,
    }));
  };

  const searchMessages = async (query = searchQuery) => {
    const trimmed = query.trim();
    if (!trimmed) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const results = await searchMemoryEntries(trimmed);
      setSearchResults(results);
    } catch (error) {
      console.error("Search error", error);
      const localResults = messages
        .filter((m) => m.content.toLowerCase().includes(trimmed.toLowerCase()))
        .slice(-20)
        .reverse();
      setSearchResults(localResults);
    } finally {
      setSearching(false);
    }
  };

  const clearChat = async () => {
    try {
      const response = await fetch(`${getApiBase()}/chat-messages?user_id=${encodeURIComponent(userId)}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        toast.error("Não foi possível limpar a conversa.");
        return;
      }
    } catch (error) {
      console.error("Clear chat error", error);
      toast.error("Não foi possível limpar a conversa.");
      return;
    }

    setMessages([]);
    setSearchResults([]);
    setSearchQuery("");
    toast.success("Conversa limpa com sucesso.");
  };

  const copyToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      toast.success("Mensagem copiada para a área de transferência.");
    } catch (error) {
      console.error("Copy error", error);
      toast.error("Não foi possível copiar a mensagem.");
    }
  };

  const sendText = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    stopSpeaking();

    const requestedMode = detectModeCommand(trimmed);
    if (requestedMode) {
      onRequestMode?.(requestedMode);
      setInput("");
      setState("idle");
      return;
    }

    const userMsg: ChatMessage = { role: "user", content: trimmed };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    persist(userMsg);
    saveMemory(userMsg, "user");

    if (isLocalMode || !networkOnline) {
      setState("idle");
      onMemoryUse?.();
      return;
    }

    setState("thinking");

    try {
      const selectedPreset = allPresets.find((preset) => preset.id === presetId) ?? PROMPT_PRESETS[0];
      const systemMessage = {
        role: "system" as const,
        content: buildDynamicSystemPrompt(trimmed),
      };

      const selectedMemoryMessage = activeMemory
        ? {
            role: "system" as const,
            content: `Use a memória selecionada para contextualizar a resposta:\n${activeMemory.content}`,
          }
        : null;

      const memoryEntries = memoryEnabled ? await searchMemoryEntries(trimmed) : [];
      const memoryMessage = memoryEntries.length
        ? {
            role: "system" as const,
            content:
              "Use as memórias relevantes abaixo para responder de forma mais contextualizada:\n" +
              memoryEntries
                .slice(0, 3)
                .map((item, index) =>
                  `${index + 1}. [${item.role}] ${item.category ?? "chat"}: ${sanitizeMemoryContent(item.content)}`,
                )
                .join("\n"),
          }
        : null;

      const messagesForApi = [systemMessage, selectedMemoryMessage, memoryMessage].filter(Boolean) as ChatMessage[];
      const payloadMessages = messagesForApi.length > 0 ? [...messagesForApi, ...next] : next;

      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          aiName,
          provider,
          messages: payloadMessages.map(({ role, content }) => ({ role, content })),
        }),
      });

      if (!resp.ok || !resp.body) {
        if (resp.status === 429) toast.error("Limite de uso atingido. Tente novamente em instantes.");
        else if (resp.status === 402) toast.error("Créditos de IA esgotados.");
        else toast.error("Erro ao falar com a IA");
        setState("idle");
        return;
      }

      setState("responding");
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let assistantText = "";
      let added = false;
      let done = false;

      const upsert = (chunk: string) => {
        assistantText += chunk;
        setMessages((prev) => {
          if (!added) {
            added = true;
            return [...prev, { role: "assistant", content: assistantText }];
          }
          const copy = prev.slice();
          copy[copy.length - 1] = { ...copy[copy.length - 1], content: assistantText };
          return copy;
        });
      };

      while (!done) {
        const { done: d, value } = await reader.read();
        if (d) break;
        buf += decoder.decode(value, { stream: true });
        let nl: number;
        while ((nl = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, nl);
          buf = buf.slice(nl + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line || line.startsWith(":") || !line.startsWith("data: ")) continue;
          const json = line.slice(6).trim();
          if (json === "[DONE]") {
            done = true;
            break;
          }
          try {
            const parsed = JSON.parse(json);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) upsert(content);
          } catch {
            buf = line + "\n" + buf;
            break;
          }
        }
      }

      if (assistantText) {
        const assistantMsg = { role: "assistant", content: assistantText };
        await persist(assistantMsg);
        await saveMemory(assistantMsg, "assistant");
        onMemoryUse?.();
        setSelectedMemoryLocal(null);
        speak(assistantText, voiceId, () => setState("idle"));
      } else {
        setState("idle");
      }
    } catch (e) {
      console.error(e);
      toast.error("Erro de conexão");
      setState("idle");
    }
  };

  const startRecording = () => {
    const rec = createRecognition(lang);
    if (!rec) {
      toast.error("Reconhecimento de voz não suportado neste navegador. Use Chrome/Edge.");
      return;
    }
    let finalText = "";
    rec.onresult = (e: SpeechRecognitionEvent) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) finalText += r[0].transcript;
        else interim += r[0].transcript;
      }
      setInput((finalText + interim).trim());
    };
    rec.onerror = (e: SpeechRecognitionErrorEvent) => {
      console.error("STT error", e);
      if (e.error === "not-allowed") toast.error("Permissão de microfone negada");
      setRecording(false);
      setState("idle");
    };
    rec.onend = () => {
      setRecording(false);
      const text = finalText.trim() || (input || "").trim();
      if (text) {
        setState("thinking");
        sendText(text);
      } else {
        setState("idle");
      }
    };
    recognitionRef.current = rec;
    setRecording(true);
    setState("listening");
    try {
      rec.start();
    } catch (e) {
      console.error(e);
      setRecording(false);
      setState("idle");
    }
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
  };

  const onMicClick = () => {
    if (recording) stopRecording();
    else startRecording();
  };

  return (
    <main className="relative min-h-[100dvh] flex flex-col overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-violet-800/20 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.12),transparent_25%)]" />
      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-4 py-3 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl shadow-[0_20px_80px_-40px_rgba(0,0,0,0.8)]">
        <div>
          <h1 className="text-base font-semibold tracking-tight">{aiName}</h1>
          <p className="text-xs text-muted-foreground">{STATE_LABELS[state]}</p>
        </div>
        <div className="flex gap-2 items-center">
          <OfflineIndicator />
          <Button variant="ghost" size="icon" onClick={onEditProfile} aria-label="Configurações">
            <Settings className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onSignOut} aria-label="Sair">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {activeMemory ? (
        <section className="px-4 py-3 bg-violet-950/90 border-b border-violet-700 text-sm text-white">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="font-medium">Memória selecionada</div>
              <p className="text-muted-foreground text-[0.85rem] line-clamp-2">{activeMemory.content}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => {
              onMemoryUse?.();
              setSelectedMemoryLocal(null);
            }}>
              Limpar contexto
            </Button>
          </div>
        </section>
      ) : null}

      <section className="relative z-10 px-4 py-3 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl glass-panel">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Provedor</span>
            <div className="w-full max-w-xs">
              <Select value={provider} onValueChange={(value) => setProvider(value as AiProvider)}>
                <SelectTrigger className="w-full h-10">
                  <SelectValue placeholder="Selecionar" />
                </SelectTrigger>
                <SelectContent>
                  {AI_PROVIDER_OPTIONS.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Usando: {AI_PROVIDER_OPTIONS.find((option) => option.id === provider)?.label}</p>
        </div>
      </section>

      <section className="relative z-10 border-b border-white/10 px-4 py-3 bg-slate-950/80 backdrop-blur-xl glass-panel">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            searchMessages(searchQuery);
          }}
          className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex flex-1 gap-2">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar na conversa"
              className="h-12 text-base"
              disabled={searching}
            />
            <Button
              type="submit"
              variant="secondary"
              size="icon"
              disabled={!searchQuery.trim() || searching}
              aria-label="Buscar"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-12"
              onClick={() => searchMessages(searchQuery)}
              disabled={!searchQuery.trim() || searching}
            >
              {searching ? "Buscando…" : "Buscar"}
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="h-12"
              onClick={clearChat}
            >
              <Trash2 className="mr-2 h-4 w-4" />Limpar conversa
            </Button>
          </div>
        </form>

        {searchResults.length > 0 ? (
          <div className="mt-4 space-y-3">
            <p className="text-sm font-medium">Resultados da busca</p>
            <div className="grid gap-2">
              {searchResults.map((result) => (
                <div key={result.id} className="rounded-2xl border border-white/10 bg-slate-900/80 p-3 text-sm shadow-[0_20px_60px_-30px_rgba(0,0,0,0.7)]">
                  <p className="text-xs text-slate-400 uppercase tracking-[0.2em] mb-1">
                    {result.role === "assistant" ? "Assistente" : "Você"}
                  </p>
                  <p className="whitespace-pre-wrap">{result.content}</p>
                </div>
              ))}
            </div>
          </div>
        ) : searchQuery.trim() && !searching ? (
          <div className="mt-4 rounded-2xl border border-white/10 bg-slate-900/80 p-3 text-sm text-slate-300">
            Nenhum resultado encontrado para <strong>{searchQuery}</strong>.
          </div>
        ) : null}
      </section>

      <section className="relative z-10 border-b border-white/10 px-4 py-3 bg-slate-950/80 backdrop-blur-xl glass-panel">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Preset de prompt</p>
              <p className="text-sm text-muted-foreground">Escolha um estilo de resposta rápido.</p>
            </div>
            <div className="w-full max-w-xs">
              <Select value={presetId} onValueChange={(value) => setPresetId(value)}>
                <SelectTrigger className="w-full h-10">
                  <SelectValue placeholder="Selecionar preset" />
                </SelectTrigger>
                <SelectContent>
                  {allPresets.map((preset) => (
                    <SelectItem key={preset.id} value={preset.id}>
                      <div className="flex flex-col text-left">
                        <span>{preset.label}</span>
                        <span className="text-xs text-muted-foreground">{preset.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant={showPresetEditor ? "secondary" : "outline"}
                size="sm"
                className="h-10"
                onClick={() => setShowPresetEditor((prev) => !prev)}
              >
                {showPresetEditor ? "Fechar editor" : "Novo preset"}
              </Button>
            </div>
          </div>

          {showPresetEditor ? (
            <div className="mt-4 rounded-3xl border border-white/10 bg-slate-900/80 p-4 space-y-3 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.7)]">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="sm:col-span-1">
                  <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Nome</p>
                  <Input
                    value={newPresetLabel}
                    onChange={(e) => setNewPresetLabel(e.target.value)}
                    placeholder="Ex: Formal"
                    className="h-10"
                  />
                </div>
                <div className="sm:col-span-1">
                  <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Descrição</p>
                  <Input
                    value={newPresetDescription}
                    onChange={(e) => setNewPresetDescription(e.target.value)}
                    placeholder="Ex: Respostas profissionais"
                    className="h-10"
                  />
                </div>
                <div className="sm:col-span-1 flex items-end">
                  <Button type="button" size="sm" className="h-10 w-full" onClick={addCustomPreset}>
                    Salvar preset
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Prompt do sistema</p>
                <Textarea
                  value={newPresetPrompt}
                  onChange={(e) => setNewPresetPrompt(e.target.value)}
                  placeholder="Digite o prompt do sistema aqui..."
                  className="min-h-[120px]"
                />
              </div>
            </div>
          ) : null}

          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-muted-foreground">Preset ativo: {allPresets.find((preset) => preset.id === presetId)?.label}</div>
            <Button
              type="button"
              variant={memoryEnabled ? "secondary" : "outline"}
              size="sm"
              className="h-10"
              onClick={() => setMemoryEnabled((prev) => !prev)}
            >
              Memória {memoryEnabled ? "ativa" : "inativa"}
            </Button>
          </div>
        </div>
      </section>

      {/* Sphere */}
      <section className="relative z-10 flex flex-col items-center justify-center px-4 pt-2 pb-1">
        <div className="w-full max-w-sm aspect-square max-h-[42vh]">
          <ParticleSphere state={state} shape={shape} volume={liveVolume} />
        </div>
        <div
          className={`mt-1 text-xs uppercase tracking-[0.25em] font-medium animate-fade-in ${
            state === "idle" ? "text-muted-foreground" : "text-primary animate-pulse-ring"
          }`}
        >
          {STATE_LABELS[state]}
        </div>
      </section>

      {/* Messages */}
      <section className="px-4 py-3">
        {hasMoreHistory && (
          <div className="mb-3 flex justify-center">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => loadHistory(historyPage + 1)}
              disabled={historyLoading}
            >
              {historyLoading ? "Carregando mensagens..." : "Carregar mais mensagens"}
            </Button>
          </div>
        )}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto space-y-3 rounded-[2rem] bg-slate-950/80 border border-white/10 p-4 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.85)]"
          aria-live="polite"
          style={{ maxHeight: "60vh" }}
        >
          {messages.length === 0 && (
            <p className="text-center text-sm text-muted-foreground mt-6">
              Comece uma conversa — digite ou toque no microfone.
            </p>
          )}
          {messages.map((m, i) => (
            <ChatMessageCard
              key={m.id ?? i}
              message={m}
              onCopy={() => copyToClipboard(m.content)}
              onEdit={m.role === "assistant" ? () => startReview(m) : undefined}
            />
          ))}
        </div>
      </section>

      {/* Input */}
      <footer className="relative z-10 px-3 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] border-t border-white/10 bg-slate-950/90 backdrop-blur-xl glass-panel">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendText(input);
          }}
          className="flex items-center gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={recording ? "Ouvindo…" : "Digite uma mensagem"}
            disabled={state === "thinking"}
            className="h-12 text-base flex-1"
            inputMode="text"
          />
          <Button
            type="button"
            onClick={onMicClick}
            variant={recording ? "destructive" : "secondary"}
            size="icon"
            className="h-12 w-12 shrink-0"
            aria-label={recording ? "Parar gravação" : "Gravar voz"}
          >
            {recording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || state === "thinking"}
            className="h-12 w-12 shrink-0"
            aria-label="Enviar"
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </footer>

      <ReviewResponseModal
        isOpen={isReviewModalOpen}
        originalText={editingMessage?.content ?? ""}
        onSubmit={handleReviewSubmit}
        onCancel={() => setIsReviewModalOpen(false)}
      />

      {/* Conflict Resolution Modal */}
      <ConflictResolutionModal
        isOpen={showConflictModal}
        conflicts={syncConflicts}
        onResolve={async (resolutions) => {
          setIsSyncing(true);
          for (const [conflictId, resolution] of Object.entries(resolutions)) {
            const conflict = syncConflicts.find(c => c.id === conflictId);
            if (conflict) {
              await resolveConflict(conflict, resolution as any);
            }
          }
          setSyncConflicts([]);
          setShowConflictModal(false);
          setIsSyncing(false);
          toast.success("Conflitos resolvidos com sucesso!");
        }}
        onCancel={() => setShowConflictModal(false)}
        isSyncing={isSyncing}
      />
    </main>
  );
}