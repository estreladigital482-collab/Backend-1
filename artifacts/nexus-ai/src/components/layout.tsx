import React from "react";
import { Link, useLocation } from "wouter";
import { Cpu, BookOpen, Layers, MessageSquare, User, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();

  const navItems = [
    { href: "/", label: "Dashboard", icon: Cpu },
    { href: "/skills", label: "Inventory", icon: Layers },
    { href: "/study", label: "Study", icon: BookOpen },
    { href: "/fuse", label: "Fusion", icon: Zap },
    { href: "/chat", label: "Terminal", icon: MessageSquare },
    { href: "/profile", label: "System", icon: User },
  ];

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden scanline">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-border/50 bg-card/50 backdrop-blur-xl flex flex-col z-10 relative">
        <div className="p-6 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-sm bg-primary/20 flex items-center justify-center border border-primary/50 shadow-[0_0_15px_rgba(var(--primary),0.5)]">
              <Cpu className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-wider text-primary glitch-text">NEXUS_AI</h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">v1.0.0 Online</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-sm transition-all duration-200 group relative overflow-hidden",
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/30 shadow-[inset_0_0_20px_rgba(var(--primary),0.1)]"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5 border border-transparent"
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary shadow-[0_0_10px_var(--primary)]" />
                )}
                <item.icon className={cn("h-5 w-5", isActive ? "text-primary" : "opacity-70 group-hover:opacity-100 group-hover:text-primary transition-colors")} />
                <span className="font-medium tracking-wide">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border/50">
          <div className="bg-black/40 rounded border border-border/50 p-3 flex items-center gap-3">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
            </div>
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Neural Link Active</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative z-0 flex flex-col">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none"></div>
        <div className="flex-1 overflow-y-auto p-6 md:p-8 relative">
          {children}
        </div>
      </main>
    </div>
  );
}
