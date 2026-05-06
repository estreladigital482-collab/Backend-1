import React, { useState } from 'react';
import { Star, Download, Info, ChevronRight, Play, Trash2 } from 'lucide-react';

interface Ability {
  id: string;
  name: string;
  description: string;
  source: string;
  rating: number;
  functions?: number;
  version?: string;
  lastUpdated?: string;
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
    <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 hover:border-blue-500 transition">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-white">{ability.name}</h3>
          <p className="text-xs text-slate-400">{ability.source}</p>
        </div>
        <div className="flex items-center gap-1 text-yellow-400">
          <Star size={16} fill="currentColor" />
          <span className="text-xs">{ability.rating}</span>
        </div>
      </div>

      <p className="text-sm text-slate-300 mb-4">{ability.description}</p>

      <div className="flex gap-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex-1 flex items-center justify-center gap-2 bg-slate-600 text-white px-3 py-2 rounded text-sm hover:bg-slate-500"
        >
          <Info size={16} /> Detalhes
        </button>
        {onExecute ? (
          <button
            onClick={() => onExecute('default')}
            className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white px-3 py-2 rounded text-sm hover:bg-green-700"
          >
            <Play size={16} /> Executar
          </button>
        ) : (
          <button
            onClick={onAdd}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700"
          >
            <Download size={16} /> Adicionar
          </button>
        )}
        {onRemove && (
          <button
            onClick={onRemove}
            className="p-2 text-red-400 hover:text-red-300"
            title="Remover habilidade"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-slate-600">
          <div className="space-y-2 text-sm">
            <p><span className="text-slate-400">Funções:</span> {ability.functions || 5} disponíveis</p>
            <p><span className="text-slate-400">Versão:</span> {ability.version || '1.0.0'}</p>
            <p><span className="text-slate-400">Última atualização:</span> {ability.lastUpdated || '2 dias atrás'}</p>
          </div>

          {onExecute && (
            <div className="mt-4">
              <h4 className="text-sm font-semibold text-white mb-2">Funções Disponíveis:</h4>
              <div className="space-y-1">
                <button
                  onClick={() => onExecute('analyze_data')}
                  className="w-full text-left p-2 bg-slate-600 rounded text-sm hover:bg-slate-500 text-white"
                >
                  analyze_data(data, columns) → dict
                </button>
                <button
                  onClick={() => onExecute('clean_data')}
                  className="w-full text-left p-2 bg-slate-600 rounded text-sm hover:bg-slate-500 text-white"
                >
                  clean_data(data) → DataFrame
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}