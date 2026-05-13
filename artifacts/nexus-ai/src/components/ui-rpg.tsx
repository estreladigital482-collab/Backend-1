import { cn } from "@/lib/utils";
import type { Item } from "@workspace/api-client-react";
import { Link } from "wouter";

const rarityLabels: Record<string, string> = {
  Common: "Comum",
  Rare: "Raro",
  Epic: "Épico",
  Legendary: "Lendário",
};

const typeLabels: Record<string, string> = {
  design: "Design",
  theme: "Fragmento",
  agent: "Entidade",
  skill: "Protocolo",
  project: "Missão",
  component: "Componente",
};

export function RarityBadge({ rarity, className }: { rarity: string; className?: string }) {
  return (
    <span
      className={cn(
        "px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded-sm border",
        rarity === "Common" && "bg-gray-500/20 text-gray-400 border-gray-500/30",
        rarity === "Rare" && "bg-blue-500/20 text-blue-400 border-blue-500/30",
        rarity === "Epic" && "bg-purple-500/20 text-purple-400 border-purple-500/30",
        rarity === "Legendary" && "bg-amber-500/20 text-amber-400 border-amber-500/30",
        className
      )}
    >
      {rarityLabels[rarity] ?? rarity}
    </span>
  );
}

export function TypeBadge({ type, className }: { type: string; className?: string }) {
  return (
    <span
      className={cn(
        "px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold rounded-sm border bg-card border-border text-muted-foreground",
        className
      )}
    >
      {typeLabels[type] ?? type}
    </span>
  );
}

export function ItemCard({ item, onClick, studioBase = "/studio" }: { item: Item; onClick?: () => void; studioBase?: string }) {
  const content = (
    <div
      className={cn(
        "relative p-4 rounded-xl bg-card border transition-all duration-300 group cursor-pointer flex flex-col h-44",
        "hover:scale-[1.02] active:scale-[0.98]",
        item.rarity === "Common" && "border-gray-500/30 hover:border-gray-500/50",
        item.rarity === "Rare" && "border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.08)] hover:shadow-[0_0_25px_rgba(59,130,246,0.25)]",
        item.rarity === "Epic" && "border-purple-500/40 shadow-[0_0_20px_rgba(168,85,247,0.1)] hover:shadow-[0_0_30px_rgba(168,85,247,0.3)]",
        item.rarity === "Legendary" && "border-amber-500/50 shadow-[0_0_25px_rgba(245,158,11,0.15)] hover:shadow-[0_0_40px_rgba(245,158,11,0.4)]"
      )}
      onClick={onClick}
    >
      <div className="relative z-10 flex justify-between items-start mb-3">
        <TypeBadge type={item.type} />
        <RarityBadge rarity={item.rarity} />
      </div>
      <div className="relative z-10 flex-1">
        <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors truncate">
          {item.name}
        </h3>
        {item.description && (
          <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        )}
      </div>
      <div className="relative z-10 flex items-center justify-between mt-3 pt-2 border-t border-border/50">
        <span className="text-[10px] text-muted-foreground font-mono">
          #{item.id.toString().padStart(4, "0")}
        </span>
        <span className="text-[10px] text-muted-foreground font-mono">
          {new Date(item.createdAt).toLocaleDateString("pt-BR")}
        </span>
      </div>
    </div>
  );

  if (onClick) return content;
  return <Link href={`${studioBase}/itens/${item.id}`}>{content}</Link>;
}
