import React, { useState } from 'react';
import { Star, Download, Info, Shield, Sparkles, BookOpen, Play, Trash2 } from 'lucide-react';

interface Ability {
  id: string;
  name: string;
  description: string;
  source: string;
  rating: number;
  functions?: number;
  version?: string;
  lastUpdated?: string;
  category?: string;
}

interface AbilityCardProps {
  ability: Ability;
  onAdd: () => void;
  onExecute?: (functionName: string) => void;
  onRemove?: () => void;
}

export function AbilityCard({ ability, onAdd, onExecute, onRemove }: AbilityCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-5 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.85)] transition hover:-translate-y-0.5 hover:border-violet-500/40">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-4">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-violet-600/15 px-3 py-1 text-xs uppercase tracking-[0.25em] text-violet-200">
            <Sparkles size={14} /> {ability.category || 'Skill'}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white">{ability.name}</h3>
            <p className="text-sm text-slate-400 mt-1">{ability.description}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-3">
          <div className="rounded-full bg-slate-900 px-3 py-1 text-xs uppercase tracking-[0.25em] text-slate-300">
            v{ability.version || '1.0.0'}
          </div>
          <div className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-200">
            <Star size={14} /> {ability.rating.toFixed(1)}
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-4">
          <div className="flex items-center gap-2 text-slate-300 mb-2">
            <Shield size={16} /> <span className="text-xs uppercase tracking-[0.2em]">Resistência</span>
          </div>
          <p className="text-sm text-slate-400">{ability.functions || 6} rotas de poder disponíveis para uso imediato.</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-4">
          <div className="flex items-center gap-2 text-slate-300 mb-2">
            <BookOpen size={16} /> <span className="text-xs uppercase tracking-[0.2em]">Experiência</span>
          </div>
          <p className="text-sm text-slate-400">Último aprimoramento: {ability.lastUpdated || 'Há alguns dias'}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="rounded-3xl bg-slate-800 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          <Info size={16} /> Detalhes
        </button>
        <button
          onClick={onAdd}
          className="rounded-3xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
        >
          <Download size={16} /> Equipar
        </button>
        {onExecute ? (
          <button
            onClick={() => onExecute('default')}
            className="rounded-3xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500"
          >
            <Play size={16} /> Usar
          </button>
        ) : null}
      </div>

      {isExpanded && (
        <div className="mt-6 rounded-3xl border border-white/10 bg-slate-900/80 p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-semibold text-white">Detalhes da Habilidade</h4>
              <p className="text-xs text-slate-400">Uma visão rápida dos poderes disponíveis.</p>
            </div>
            <span className="inline-flex items-center rounded-full bg-violet-500/15 px-3 py-1 text-xs text-violet-200">Nível {Math.min(5, Math.max(1, Math.round(ability.rating)))} / 5</span>
          </div>
          <div className="space-y-3 text-sm text-slate-300">
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-400">Funções</span>
              <strong>{ability.functions || 5}</strong>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-400">Último aprimoramento</span>
              <strong>{ability.lastUpdated || 'Desconhecido'}</strong>
            </div>
            <div className="rounded-2xl bg-slate-950/80 p-3 border border-white/10">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-2">Ações sugeridas</p>
              <div className="grid gap-2">
                <button className="w-full text-left rounded-2xl bg-slate-800 px-3 py-2 text-sm text-slate-100 hover:bg-slate-700 transition">Estudar implementação</button>
                <button className="w-full text-left rounded-2xl bg-slate-800 px-3 py-2 text-sm text-slate-100 hover:bg-slate-700 transition">Adaptar para seu projeto</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
