import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera, User, Save, Trash2, Sun, Moon, Bell, Shield, Info,
  ChevronRight, Check, Palette, Sparkles, Monitor, Cpu
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { THEMES, applyTheme, THEME_KEY } from "@/lib/themes";
import { SphereToggleButton } from "@/components/floating-sphere";

const AVATAR_KEY = "caos_avatar";
const USER_NAME_KEY = "caos_user_name";
const USER_HANDLE_KEY = "caos_user_handle";

function AvatarEditor() {
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem(AVATAR_KEY);
    if (saved) setAvatarSrc(saved);
  }, []);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Arquivo inválido", description: "Selecione uma imagem.", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Arquivo muito grande", description: "Máximo 5MB.", variant: "destructive" });
      return;
    }
    setUploading(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const size = Math.min(img.width, img.height);
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, (img.width - size) / 2, (img.height - size) / 2, size, size, 0, 0, 256, 256);
        const compressed = canvas.toDataURL("image/jpeg", 0.85);
        localStorage.setItem(AVATAR_KEY, compressed);
        setAvatarSrc(compressed);
        setUploading(false);
        toast({ title: "Avatar atualizado!" });
        window.dispatchEvent(new Event("caos_avatar_changed"));
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const removeAvatar = () => {
    localStorage.removeItem(AVATAR_KEY);
    setAvatarSrc(null);
    toast({ title: "Avatar removido." });
    window.dispatchEvent(new Event("caos_avatar_changed"));
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        {avatarSrc ? (
          <img src={avatarSrc} alt="Avatar" className="w-24 h-24 rounded-2xl object-cover border-2 border-primary/50 shadow-[0_0_20px_hsl(var(--primary)/0.3)]" />
        ) : (
          <div className="w-24 h-24 rounded-2xl bg-primary/10 border-2 border-primary/40 flex items-center justify-center shadow-[0_0_20px_hsl(var(--primary)/0.2)]">
            <User className="w-10 h-10 text-primary/60" />
          </div>
        )}
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary border-2 border-background flex items-center justify-center shadow-lg hover:bg-primary/80 transition-colors"
        >
          <Camera className="w-4 h-4 text-primary-foreground" />
        </button>
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      <div className="flex gap-2">
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="px-4 py-2 rounded-xl bg-primary/10 border border-primary/30 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
        >
          {uploading ? "Processando..." : "Alterar Foto"}
        </button>
        {avatarSrc && (
          <button
            onClick={removeAvatar}
            className="px-4 py-2 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm font-medium hover:bg-destructive/20 transition-colors"
          >
            Remover
          </button>
        )}
      </div>
      <p className="text-xs text-muted-foreground">JPG, PNG ou GIF · Máx. 5MB</p>
    </div>
  );
}

function ProfileSection() {
  const [name, setName] = useState(() => localStorage.getItem(USER_NAME_KEY) || "");
  const [handle, setHandle] = useState(() => localStorage.getItem(USER_HANDLE_KEY) || "");
  const [saved, setSaved] = useState(false);
  const { toast } = useToast();

  const handleSave = () => {
    localStorage.setItem(USER_NAME_KEY, name);
    localStorage.setItem(USER_HANDLE_KEY, handle);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    toast({ title: "Perfil salvo!", description: "Informações atualizadas." });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground block mb-2">Nome de Exibição</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Seu nome"
          className="w-full rounded-xl bg-black/40 border border-border/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors"
        />
      </div>
      <div>
        <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground block mb-2">Handle / Username</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
          <input
            type="text"
            value={handle}
            onChange={(e) => setHandle(e.target.value.replace(/\s/g, "").toLowerCase())}
            placeholder="caos_user"
            className="w-full rounded-xl bg-black/40 border border-border/50 pl-8 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
      </div>
      <button
        onClick={handleSave}
        className={cn(
          "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all",
          saved
            ? "bg-green-500/20 border border-green-500/30 text-green-400"
            : "bg-primary text-primary-foreground hover:bg-primary/90"
        )}
      >
        {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
        {saved ? "Salvo!" : "Salvar Perfil"}
      </button>
    </div>
  );
}

function ThemeSelector() {
  const [selectedTheme, setSelectedTheme] = useState(() => localStorage.getItem(THEME_KEY) ?? "hacker");

  const handleSelect = (themeId: string) => {
    setSelectedTheme(themeId);
    applyTheme(themeId);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {THEMES.map(theme => {
          const isSelected = selectedTheme === theme.id;
          const primaryHue = theme.vars["--primary"]?.split(" ")[0];
          return (
            <motion.button
              key={theme.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleSelect(theme.id)}
              className={cn(
                "relative p-3 rounded-xl border text-left transition-all overflow-hidden",
                isSelected
                  ? "border-primary/60 bg-primary/10 shadow-[0_0_15px_hsl(var(--primary)/0.2)]"
                  : "border-border/30 bg-card/30 hover:border-border/60 hover:bg-card/60"
              )}
            >
              {/* Color preview */}
              <div className="flex gap-1 mb-2">
                {[theme.vars["--primary"], theme.vars["--secondary"], theme.vars["--accent"]].map((color, i) => (
                  <div
                    key={i}
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{
                      background: `hsl(${color})`,
                      boxShadow: `0 0 6px hsl(${color} / 0.5)`,
                    }}
                  />
                ))}
              </div>
              <p className="text-xs font-bold">{theme.emoji} {theme.name}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{theme.description}</p>
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary flex items-center justify-center"
                >
                  <Check className="w-2.5 h-2.5 text-primary-foreground" />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function SettingToggle({
  label,
  description,
  storageKey,
  defaultVal = false,
  customComponent,
}: {
  label: string;
  description: string;
  storageKey?: string;
  defaultVal?: boolean;
  customComponent?: React.ReactNode;
}) {
  const [enabled, setEnabled] = useState(() => {
    if (!storageKey) return defaultVal;
    const v = localStorage.getItem(storageKey);
    return v !== null ? v === "true" : defaultVal;
  });

  const toggle = () => {
    if (!storageKey) return;
    const next = !enabled;
    setEnabled(next);
    localStorage.setItem(storageKey, String(next));
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-border/20 last:border-0">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      {customComponent ?? (
        <button
          onClick={toggle}
          className={cn(
            "relative w-12 h-6 rounded-full transition-colors border flex-shrink-0",
            enabled ? "bg-primary border-primary/50" : "bg-card border-border"
          )}
        >
          <div className={cn(
            "absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all",
            enabled ? "left-[calc(100%-1.375rem)]" : "left-0.5"
          )} />
        </button>
      )}
    </div>
  );
}

function DangerZone() {
  const [confirm, setConfirm] = useState(false);
  const { toast } = useToast();

  const clearData = () => {
    if (!confirm) {
      setConfirm(true);
      setTimeout(() => setConfirm(false), 4000);
      return;
    }
    const keys = Object.keys(localStorage).filter((k) => k.startsWith("caos_"));
    keys.forEach((k) => localStorage.removeItem(k));
    toast({ title: "Dados locais apagados.", variant: "destructive" });
    setConfirm(false);
  };

  return (
    <button
      onClick={clearData}
      className={cn(
        "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border",
        confirm
          ? "bg-destructive text-destructive-foreground border-destructive"
          : "bg-destructive/10 text-destructive border-destructive/30 hover:bg-destructive/20"
      )}
    >
      <Trash2 className="w-4 h-4" />
      {confirm ? "Confirmar — Apagar Tudo" : "Limpar Dados Locais"}
    </button>
  );
}

export default function Settings() {
  const sections = [
    {
      icon: User,
      title: "Foto de Perfil",
      content: <AvatarEditor />,
    },
    {
      icon: User,
      title: "Informações do Perfil",
      content: <ProfileSection />,
    },
    {
      icon: Palette,
      title: "Tema da Interface",
      description: "Escolha um tema clicável para personalizar o visual do CAOS",
      content: <ThemeSelector />,
    },
    {
      icon: Sun,
      title: "Preferências",
      content: (
        <div className="space-y-0">
          <SettingToggle label="Notificações" description="Alertas de sistema e atualizações" storageKey="caos_notifications" defaultVal={true} />
          <SettingToggle label="Modo Offline" description="Salvar mensagens localmente sem internet" storageKey="caos_offline_mode" defaultVal={true} />
          <SettingToggle label="Efeitos Visuais" description="Animações e efeitos de partícula" storageKey="caos_visual_effects" defaultVal={true} />
          <SettingToggle label="Sons do Sistema" description="Feedback sonoro para ações" storageKey="caos_sounds" defaultVal={false} />
          <SettingToggle
            label="Esfera Flutuante"
            description="Bolinha de acesso rápido à IA — arraste para mover"
            customComponent={<SphereToggleButton />}
          />
        </div>
      ),
    },
    {
      icon: Monitor,
      title: "Dispositivo & Plataforma",
      content: (
        <div className="space-y-0">
          <SettingToggle label="Modo TV" description="Interface otimizada para telas grandes" storageKey="caos_tv_mode" />
          <SettingToggle label="Modo Compacto (Mobile)" description="Layout reduzido para telas pequenas" storageKey="caos_compact_mode" />
        </div>
      ),
    },
    {
      icon: Shield,
      title: "Segurança",
      content: (
        <div className="space-y-0">
          <SettingToggle label="Autenticação Local" description="Sessão gerenciada localmente no dispositivo" storageKey="caos_local_auth" defaultVal={true} />
          <SettingToggle label="Modo Privado" description="Não salvar histórico de conversas" storageKey="caos_private_mode" />
        </div>
      ),
    },
    {
      icon: Info,
      title: "Sobre",
      content: (
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
            <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
              <span className="text-primary font-black text-lg">C</span>
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">CAOS Hub</p>
              <p className="text-xs text-muted-foreground">v2.0.0 — Sistema Unificado</p>
              <p className="text-[10px] text-muted-foreground/60 font-mono">Web · Mobile · Desktop · TV</p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-primary/60 mb-1">// Sistema</p>
        <h1 className="text-2xl font-black uppercase tracking-widest text-foreground">Configurações</h1>
      </motion.div>

      {sections.map((section, i) => (
        <motion.div
          key={section.title}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.07 }}
          className="rounded-2xl bg-card/40 border border-border/30 p-5 space-y-4"
        >
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <section.icon className="w-4 h-4" /> {section.title}
          </h2>
          {section.description && (
            <p className="text-xs text-muted-foreground -mt-2">{section.description}</p>
          )}
          {section.content}
        </motion.div>
      ))}

      {/* Danger zone */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: sections.length * 0.07 }}
        className="rounded-2xl bg-destructive/5 border border-destructive/20 p-5 space-y-3"
      >
        <h2 className="text-xs font-semibold uppercase tracking-widest text-destructive flex items-center gap-2">
          <Trash2 className="w-4 h-4" /> Zona de Perigo
        </h2>
        <p className="text-xs text-muted-foreground">Limpar todos os dados salvos localmente neste dispositivo.</p>
        <DangerZone />
      </motion.div>
    </div>
  );
}
