import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Home, MessageSquare, Cpu, Package, Settings, Menu, X,
  BookOpen, Layers, Zap, User, Shield, Map, ChevronDown, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

const mainNav = [
  { href: "/", label: "Início", icon: Home },
  { href: "/shell", label: "CAOS Shell", icon: MessageSquare },
  { href: "/nexus", label: "NEXUS AI", icon: Cpu },
  { href: "/studio", label: "Studio", icon: Package },
  { href: "/settings", label: "Configurações", icon: Settings },
];

const nexusSubNav = [
  { href: "/nexus", label: "Dashboard", icon: Cpu },
  { href: "/nexus/skills", label: "Habilidades", icon: Layers },
  { href: "/nexus/study", label: "Estudar", icon: BookOpen },
  { href: "/nexus/fuse", label: "Fusão", icon: Zap },
  { href: "/nexus/chat", label: "Terminal", icon: MessageSquare },
  { href: "/nexus/profile", label: "Perfil IA", icon: User },
];

const studioSubNav = [
  { href: "/studio", label: "Central", icon: Home },
  { href: "/studio/arsenal", label: "Arsenal", icon: Shield },
  { href: "/studio/agents", label: "Entidades", icon: Cpu },
  { href: "/studio/themes", label: "Fragmentos", icon: Layers },
  { href: "/studio/missions", label: "Missões", icon: Map },
];

function SidebarNavItem({
  item,
  onClick,
  sub = false,
}: {
  item: { href: string; label: string; icon: React.ElementType };
  onClick?: () => void;
  sub?: boolean;
}) {
  const [location] = useLocation();
  const isActive =
    item.href === "/"
      ? location === "/"
      : location === item.href || location.startsWith(item.href + "/");
  return (
    <Link href={item.href} onClick={onClick}>
      <div
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer transition-all duration-200 border group",
          sub && "ml-3 text-sm",
          isActive
            ? "bg-primary/10 border-primary/30 text-primary shadow-[0_0_12px_hsl(var(--primary)/0.1)]"
            : "border-transparent text-muted-foreground hover:bg-white/5 hover:text-foreground"
        )}
      >
        {isActive && !sub && (
          <div className="absolute left-0 w-0.5 h-6 bg-primary rounded-r-full shadow-[0_0_8px_hsl(var(--primary))]" />
        )}
        <item.icon className={cn("flex-shrink-0", sub ? "w-4 h-4" : "w-5 h-5")} />
        <span className={cn("font-medium", sub ? "text-xs tracking-wide" : "text-sm tracking-wide")}>{item.label}</span>
      </div>
    </Link>
  );
}

function SidebarSection({
  label,
  items,
  parentHref,
  onClose,
}: {
  label: string;
  items: typeof nexusSubNav;
  parentHref: string;
  onClose?: () => void;
}) {
  const [location] = useLocation();
  const isExpanded = location.startsWith(parentHref);
  const [open, setOpen] = useState(isExpanded);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] uppercase tracking-widest text-muted-foreground/60 hover:text-muted-foreground transition-colors"
      >
        {label}
        {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
      </button>
      {open && (
        <div className="space-y-0.5 mt-0.5">
          {items.map((item) => (
            <SidebarNavItem key={item.href} item={item} onClick={onClose} sub />
          ))}
        </div>
      )}
    </div>
  );
}

function BottomNav() {
  const [location] = useLocation();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border flex items-center safe-area-bottom md:hidden">
      {mainNav.map((item) => {
        const isActive =
          item.href === "/"
            ? location === "/"
            : location.startsWith(item.href);
        return (
          <Link key={item.href} href={item.href} className="flex-1">
            <div
              className={cn(
                "flex flex-col items-center justify-center py-2.5 gap-1 transition-all",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "w-5 h-5 transition-all",
                  isActive && "drop-shadow-[0_0_6px_hsl(var(--primary))]"
                )}
              />
              <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
              {isActive && (
                <div className="absolute bottom-0 w-8 h-0.5 bg-primary rounded-full" />
              )}
            </div>
          </Link>
        );
      })}
    </nav>
  );
}

export function AppLayout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location] = useLocation();

  const isShell = location === "/shell";

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-shrink-0 border-r border-border bg-card/40 backdrop-blur-xl flex-col z-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

        <div className="relative p-5 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-md bg-primary/20 border border-primary/40 flex items-center justify-center shadow-[0_0_15px_hsl(var(--primary)/0.3)]">
              <span className="text-primary font-black text-sm">C</span>
            </div>
            <div>
              <h1 className="font-black text-base tracking-widest text-primary uppercase">CAOS</h1>
              <p className="text-[9px] text-muted-foreground uppercase tracking-widest">Sistema Unificado</p>
            </div>
          </div>
        </div>

        <nav className="relative flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <div className="mb-1 px-3 text-[9px] uppercase tracking-widest text-muted-foreground/50">Principal</div>
          {mainNav.map((item) => (
            <SidebarNavItem key={item.href} item={item} />
          ))}

          <div className="pt-3">
            <SidebarSection label="NEXUS AI" items={nexusSubNav} parentHref="/nexus" />
          </div>
          <div className="pt-2">
            <SidebarSection label="Studio" items={studioSubNav} parentHref="/studio" />
          </div>
        </nav>

        <div className="relative p-4 border-t border-border/50">
          <div className="flex items-center gap-2.5 px-3 py-2 bg-black/40 rounded-md border border-border/30">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </div>
            <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Sistema Ativo</span>
          </div>
        </div>
      </aside>

      {/* Mobile: top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 bg-background/95 backdrop-blur-xl border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-md bg-primary/20 border border-primary/40 flex items-center justify-center">
            <span className="text-primary font-black text-xs">C</span>
          </div>
          <h1 className="font-black text-base tracking-widest text-primary uppercase">CAOS</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_6px_#22c55e]" />
            <span className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">Ativo</span>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md border border-border text-muted-foreground hover:text-foreground transition-colors"
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative w-72 bg-background border-r border-border flex flex-col h-full overflow-y-auto shadow-2xl">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-md bg-primary/20 border border-primary/40 flex items-center justify-center">
                  <span className="text-primary font-black text-sm">C</span>
                </div>
                <h1 className="font-black text-base tracking-widest text-primary uppercase">CAOS</h1>
              </div>
              <button onClick={() => setSidebarOpen(false)}>
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <nav className="flex-1 py-4 px-3 space-y-1">
              <div className="mb-1 px-3 text-[9px] uppercase tracking-widest text-muted-foreground/50">Principal</div>
              {mainNav.map((item) => (
                <SidebarNavItem key={item.href} item={item} onClick={() => setSidebarOpen(false)} />
              ))}
              <div className="pt-3">
                <SidebarSection label="NEXUS AI" items={nexusSubNav} parentHref="/nexus" onClose={() => setSidebarOpen(false)} />
              </div>
              <div className="pt-2">
                <SidebarSection label="Studio" items={studioSubNav} parentHref="/studio" onClose={() => setSidebarOpen(false)} />
              </div>
            </nav>
            <div className="p-4 border-t border-border">
              <div className="flex items-center gap-2 px-3 py-2 bg-black/40 rounded-md border border-border/30">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Sistema Ativo</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className={cn(
        "flex-1 overflow-hidden relative z-0 flex flex-col",
        isShell ? "" : "md:pt-0 pt-14"
      )}>
        <div className={cn(
          "flex-1 overflow-y-auto relative",
          !isShell && "pb-16 md:pb-0"
        )}>
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <BottomNav />
    </div>
  );
}
