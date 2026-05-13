import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import {
  MessageSquare, Cpu, Package, Shield, BookOpen, Zap, Map,
  Layers, Settings, User, ChevronRight, Activity, Code2,
  GraduationCap, Star, Sparkles, TrendingUp, Brain, ArrowRight,
  Lock, Globe
} from "lucide-react";
import { useGetAiStats, useGetAiProfile } from "@/lib/nexus-api";
import { cn } from "@/lib/utils";

const modules = [
  {
    href: "/shell",
    title: "Chat IA",
    description: "Converse, tire dúvidas, gere conteúdo e obtenha respostas inteligentes",
    icon: MessageSquare,
    gradient: "from-violet-500/20 via-violet-500/5 to-transparent",
    border: "border-violet-500/30 hover:border-violet-500/60",
    glow: "hover:shadow-[0_0_40px_rgba(139,92,246,0.15)]",
    iconBg: "bg-violet-500/20 border-violet-500/30",
    iconColor: "text-violet-400",
    tag: "Conversação",
    tagColor: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    badge: "Online",
    badgeColor: "bg-green-500/10 text-green-400",
  },
  {
    href: "/builder",
    title: "CAOS Builder",
    description: "Crie apps, sites e sistemas completos — a IA programa sem parar até terminar",
    icon: Code2,
    gradient: "from-cyan-500/20 via-cyan-500/5 to-transparent",
    border: "border-cyan-500/30 hover:border-cyan-500/60",
    glow: "hover:shadow-[0_0_40px_rgba(6,182,212,0.15)]",
    iconBg: "bg-cyan-500/20 border-cyan-500/30",
    iconColor: "text-cyan-400",
    tag: "Construção",
    tagColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    badge: "Novo",
    badgeColor: "bg-cyan-500/10 text-cyan-400",
  },
  {
    href: "/professor",
    title: "Modo Professor",
    description: "A IA se torna seu professor particular — aprenda qualquer assunto com plano de ensino",
    icon: GraduationCap,
    gradient: "from-amber-500/20 via-amber-500/5 to-transparent",
    border: "border-amber-500/30 hover:border-amber-500/60",
    glow: "hover:shadow-[0_0_40px_rgba(245,158,11,0.15)]",
    iconBg: "bg-amber-500/20 border-amber-500/30",
    iconColor: "text-amber-400",
    tag: "Aprendizado",
    tagColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    badge: "Interativo",
    badgeColor: "bg-amber-500/10 text-amber-400",
  },
  {
    href: "/caos",
    title: "CAOS IA",
    description: "Gerencie habilidades, estude repositórios e evolua sua IA como RPG",
    icon: Cpu,
    gradient: "from-primary/20 via-primary/5 to-transparent",
    border: "border-primary/30 hover:border-primary/60",
    glow: "hover:shadow-[0_0_40px_hsl(var(--primary)/0.15)]",
    iconBg: "bg-primary/20 border-primary/30",
    iconColor: "text-primary",
    tag: "Habilidades",
    tagColor: "bg-primary/10 text-primary border-primary/20",
    badge: "RPG",
    badgeColor: "bg-primary/10 text-primary",
  },
  {
    href: "/studio",
    title: "Studio CAOS",
    description: "Arsenal criativo com artefatos, entidades e missões para sua IA",
    icon: Package,
    gradient: "from-orange-500/20 via-orange-500/5 to-transparent",
    border: "border-orange-500/30 hover:border-orange-500/60",
    glow: "hover:shadow-[0_0_40px_rgba(249,115,22,0.15)]",
    iconBg: "bg-orange-500/20 border-orange-500/30",
    iconColor: "text-orange-400",
    tag: "Criação",
    tagColor: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    badge: "Arsenal",
    badgeColor: "bg-orange-500/10 text-orange-400",
  },
  {
    href: "/seguranca",
    title: "Segurança",
    description: "Monitoramento em tempo real com Lobos, Formigas e audit log",
    icon: Lock,
    gradient: "from-red-500/20 via-red-500/5 to-transparent",
    border: "border-red-500/30 hover:border-red-500/60",
    glow: "hover:shadow-[0_0_40px_rgba(239,68,68,0.15)]",
    iconBg: "bg-red-500/20 border-red-500/30",
    iconColor: "text-red-400",
    tag: "Proteção",
    tagColor: "bg-red-500/10 text-red-400 border-red-500/20",
    badge: "Ativo",
    badgeColor: "bg-green-500/10 text-green-400",
  },
];

const quickLinks = [
  { href: "/caos/estudar", label: "Estudar", icon: BookOpen, color: "text-cyan-400" },
  { href: "/caos/fusao", label: "Fusão", icon: Zap, color: "text-purple-400" },
  { href: "/studio/arsenal", label: "Arsenal", icon: Shield, color: "text-orange-400" },
  { href: "/studio/missoes", label: "Missões", icon: Map, color: "text-green-400" },
  { href: "/caos/habilidades", label: "Habilidades", icon: Layers, color: "text-blue-400" },
  { href: "/configuracoes", label: "Config.", icon: Settings, color: "text-muted-foreground" },
];

const tips = [
  "💡 Use o Builder para criar apps completos sem saber programar",
  "🎓 O Modo Professor adapta as aulas ao seu nível de conhecimento",
  "🔒 As Formigas detectam padrões suspeitos automaticamente",
  "⚡ Faça fusão de habilidades para criar combinações únicas",
  "🌐 O CAOS funciona online e offline — salva tudo localmente",
  "🤖 Importe repositórios GitHub para a IA analisar e explicar",
];

function TipsCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent(prev => (prev + 1) % tips.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-xl border border-primary/10 bg-primary/5 px-4 py-3">
      <AnimatePresence mode="wait">
        <motion.p
          key={current}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="text-sm text-muted-foreground text-center"
        >
          {tips[current]}
        </motion.p>
      </AnimatePresence>
      <div className="flex justify-center gap-1 mt-2">
        {tips.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={cn(
              "h-1 rounded-full transition-all",
              i === current ? "w-4 bg-primary" : "w-1 bg-border"
            )}
          />
        ))}
      </div>
    </div>
  );
}

function ProfileWidget() {
  const { data: profile, isLoading } = useGetAiProfile();
  const { data: stats } = useGetAiStats();
  const avatarSrc = typeof window !== "undefined" ? localStorage.getItem("caos_avatar") : null;

  if (isLoading) {
    return <div className="h-20 rounded-2xl bg-card/40 animate-pulse border border-border/30" />;
  }

  const xp = profile?.xp ?? 0;
  const xpToNext = profile?.xpToNext ?? 100;
  const total = xp + xpToNext;
  const pct = total > 0 ? (xp / total) * 100 : 0;

  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-card/40 border border-border/30 backdrop-blur-sm">
      <div className="relative flex-shrink-0">
        {avatarSrc ? (
          <img src={avatarSrc} alt="Avatar" className="w-14 h-14 rounded-2xl object-cover border-2 border-primary/40" />
        ) : (
          <div className="w-14 h-14 rounded-2xl bg-primary/20 border-2 border-primary/40 flex items-center justify-center shadow-[0_0_15px_hsl(var(--primary)/0.3)]">
            <User className="w-7 h-7 text-primary" />
          </div>
        )}
        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-background border-2 border-primary/40 flex items-center justify-center">
          <span className="text-[8px] font-bold text-primary">{profile?.level ?? 1}</span>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <h2 className="text-sm font-bold text-foreground truncate">{profile?.name ?? "CAOS"}</h2>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 font-mono flex-shrink-0">
            {profile?.aiClass ?? "Iniciante"}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
          <span>{stats?.totalXp ?? 0} XP</span>
          <span>·</span>
          <span>{stats?.acquiredSkills ?? 0} Habilidades</span>
        </div>
        <div className="h-1.5 bg-black/40 rounded-full overflow-hidden border border-border/30">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
            style={{ boxShadow: "0 0 6px hsl(var(--primary))" }}
          />
        </div>
      </div>
      <Link href="/configuracoes">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-card/60 border border-border/30 flex items-center justify-center hover:border-primary/30 transition-colors">
          <Settings className="w-3.5 h-3.5 text-muted-foreground" />
        </div>
      </Link>
    </div>
  );
}

export default function Home() {
  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.07 } },
  };
  const item = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-primary/60 mb-1">// Sistema Neural Ativo</p>
        <div className="flex items-end gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-widest text-foreground glitch-text">
              CAOS Hub
            </h1>
            <p className="text-sm text-muted-foreground mt-1">IA que aprende · constrói · protege · ensina</p>
          </div>
          <motion.div
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="mb-1 flex items-center gap-1.5"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span className="text-[10px] font-mono text-green-400 uppercase">Online</span>
          </motion.div>
        </div>
      </motion.div>

      {/* Profile Widget */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <ProfileWidget />
      </motion.div>

      {/* Tips carousel */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <TipsCarousel />
      </motion.div>

      {/* Modules grid */}
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-2">
        <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">Módulos</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {modules.map((mod) => (
            <motion.div key={mod.href} variants={item}>
              <Link href={mod.href}>
                <div
                  className={cn(
                    "relative overflow-hidden rounded-2xl border p-4 cursor-pointer transition-all duration-300 active:scale-[0.98]",
                    "bg-gradient-to-br backdrop-blur-sm group",
                    mod.gradient, mod.border, mod.glow,
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0",
                      mod.iconBg
                    )}>
                      <mod.icon className={cn("w-5 h-5", mod.iconColor)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <h3 className="font-bold text-foreground text-sm">{mod.title}</h3>
                        <span className={cn("text-[9px] px-1.5 py-0.5 rounded border font-mono", mod.tagColor)}>
                          {mod.tag}
                        </span>
                        <span className={cn("text-[9px] px-1.5 py-0.5 rounded font-medium ml-auto", mod.badgeColor)}>
                          {mod.badge}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{mod.description}</p>
                    </div>
                  </div>
                  <motion.div
                    className="absolute inset-0 bg-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Quick links */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60 mb-2">Acesso Rápido</p>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex flex-col items-center gap-2 p-3 rounded-xl bg-card/40 border border-border/30 cursor-pointer hover:bg-card/70 hover:border-border/60 transition-all"
              >
                <link.icon className={cn("w-5 h-5", link.color)} />
                <span className="text-[10px] text-muted-foreground font-medium">{link.label}</span>
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* System status */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex items-center gap-3 p-3 rounded-xl bg-black/20 border border-border/20"
      >
        <Activity className="w-4 h-4 text-green-400 flex-shrink-0" />
        <span className="text-xs text-muted-foreground font-mono flex-1">
          CAOS Hub · Web · Mobile · Desktop · Todos os sistemas operacionais
        </span>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] text-green-400 font-mono">v2.0</span>
        </div>
      </motion.div>
    </div>
  );
}
