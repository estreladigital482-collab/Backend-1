import { motion } from "framer-motion";
import { Link } from "wouter";
import { MessageSquare, Cpu, Package, Shield, BookOpen, Zap, Map, Layers, Settings, User, ChevronRight, Activity } from "lucide-react";
import { useGetAiStats, useGetAiProfile } from "@/lib/nexus-api";
import { cn } from "@/lib/utils";

const modules = [
  {
    href: "/shell",
    title: "CAOS Shell",
    description: "Interface de IA conversacional com modos avançados",
    icon: MessageSquare,
    color: "from-violet-500/20 to-violet-500/5",
    border: "border-violet-500/30",
    glow: "shadow-[0_0_30px_rgba(139,92,246,0.15)]",
    iconColor: "text-violet-400",
    tag: "IA Chat",
  },
  {
    href: "/nexus",
    title: "NEXUS AI",
    description: "Gerencie habilidades, estude e evolua sua IA como RPG",
    icon: Cpu,
    color: "from-primary/20 to-primary/5",
    border: "border-primary/30",
    glow: "shadow-[0_0_30px_hsl(var(--primary)/0.15)]",
    iconColor: "text-primary",
    tag: "Habilidades",
  },
  {
    href: "/studio",
    title: "Studio CAOS",
    description: "Arsenal criativo com artefatos, entidades e missões",
    icon: Package,
    color: "from-amber-500/20 to-amber-500/5",
    border: "border-amber-500/30",
    glow: "shadow-[0_0_30px_rgba(245,158,11,0.15)]",
    iconColor: "text-amber-400",
    tag: "Criação",
  },
];

const quickLinks = [
  { href: "/nexus/study", label: "Estudar", icon: BookOpen },
  { href: "/nexus/fuse", label: "Fusão", icon: Zap },
  { href: "/studio/arsenal", label: "Arsenal", icon: Shield },
  { href: "/studio/missions", label: "Missões", icon: Map },
  { href: "/nexus/skills", label: "Habilidades", icon: Layers },
  { href: "/settings", label: "Config.", icon: Settings },
];

function ProfileWidget() {
  const { data: profile, isLoading } = useGetAiProfile();
  const { data: stats } = useGetAiStats();

  const avatarSrc = typeof window !== "undefined" ? localStorage.getItem("caos_avatar") : null;

  if (isLoading) {
    return <div className="h-16 rounded-xl bg-card/40 animate-pulse border border-border/30" />;
  }

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-card/40 border border-border/40 backdrop-blur-sm">
      <div className="relative flex-shrink-0">
        {avatarSrc ? (
          <img
            src={avatarSrc}
            alt="Avatar"
            className="w-12 h-12 rounded-full object-cover border-2 border-primary/40"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center shadow-[0_0_15px_hsl(var(--primary)/0.3)]">
            <User className="w-6 h-6 text-primary" />
          </div>
        )}
        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-background border-2 border-primary/40 flex items-center justify-center">
          <span className="text-[8px] font-bold text-primary">{profile?.level ?? 1}</span>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-foreground truncate">{profile?.name ?? "CAOS"}</h2>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 font-mono flex-shrink-0">
            {profile?.aiClass ?? "Iniciante"}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-xs text-muted-foreground">{stats?.totalXp ?? 0} XP</span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground">{stats?.acquiredSkills ?? 0} Habilidades</span>
        </div>
      </div>
      <Link href="/settings">
        <Settings className="w-4 h-4 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0" />
      </Link>
    </div>
  );
}

export default function Home() {
  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-full px-4 py-6 md:px-8 md:py-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-primary/60 mb-1">// Sistema Neural Ativo</p>
        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-widest text-foreground">
          CAOS Hub
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Plataforma unificada — Web · Mobile · Desktop</p>
      </motion.div>

      {/* Profile */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <ProfileWidget />
      </motion.div>

      {/* Main Modules */}
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
        <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">Módulos</p>
        {modules.map((mod) => (
          <motion.div key={mod.href} variants={item}>
            <Link href={mod.href}>
              <div
                className={cn(
                  "relative overflow-hidden rounded-xl border p-4 cursor-pointer transition-all duration-300 active:scale-[0.98]",
                  "bg-gradient-to-br backdrop-blur-sm",
                  mod.color, mod.border, mod.glow,
                  "hover:scale-[1.01]"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl bg-black/30 border border-white/10 flex items-center justify-center flex-shrink-0"
                  )}>
                    <mod.icon className={cn("w-6 h-6", mod.iconColor)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-bold text-foreground text-sm">{mod.title}</h3>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-muted-foreground font-mono border border-white/10">
                        {mod.tag}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{mod.description}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Links */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60 mb-3">Acesso Rápido</p>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-card/40 border border-border/40 cursor-pointer hover:bg-card/70 hover:border-border transition-all active:scale-95">
                <link.icon className="w-5 h-5 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground font-medium">{link.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Status bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex items-center gap-3 p-3 rounded-xl bg-black/30 border border-border/30"
      >
        <Activity className="w-4 h-4 text-green-400 flex-shrink-0" />
        <span className="text-xs text-muted-foreground font-mono">Todos os sistemas operacionais · API conectada</span>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] text-green-400 font-mono">Online</span>
        </div>
      </motion.div>
    </div>
  );
}
