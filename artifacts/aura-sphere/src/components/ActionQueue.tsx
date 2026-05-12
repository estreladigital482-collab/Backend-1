import React, { useState, useEffect } from 'react';
import { Check, X, ExternalLink } from 'lucide-react';

export function ActionQueue() {
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPendingActions();
    const interval = setInterval(fetchPendingActions, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchPendingActions = async () => {
    try {
      const response = await fetch('/api/v1/actions/pending');
      const data = await response.json();
      setActions(data.pending_actions || []);
    } catch (error) {
      console.error('Erro ao buscar ações:', error);
    }
  };

  const handleApprove = async (actionId) => {
    try {
      await fetch(`/api/v1/actions/${actionId}/approve`, { method: 'POST' });
      fetchPendingActions();
    } catch (error) {
      console.error('Erro ao aprovar:', error);
    }
  };

  const handleReject = async (actionId) => {
    try {
      await fetch(`/api/v1/actions/${actionId}/reject`, { method: 'POST', body: JSON.stringify({ reason: 'Rejeitada pelo usuário' }) });
      fetchPendingActions();
    } catch (error) {
      console.error('Erro ao rejeitar:', error);
    }
  };

  if (actions.length === 0) {
    return (
      <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-10 text-center text-slate-300 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.8)]">
        <p className="text-lg font-semibold text-white mb-2">Quadro de Missões vazio</p>
        <p className="text-sm text-slate-400">Nenhuma ação pendente no momento. Volte mais tarde para novas missões.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.8)] glass-panel">
        <h3 className="text-xl font-semibold text-white mb-2">Quadro de Missões</h3>
        <p className="text-sm text-slate-400">Aprovar ou rejeitar ações para manter sua aventura alinhada com os objetivos reais.</p>
      </div>
      {actions.map((action) => (
        <ActionItem key={action.id} action={action} onApprove={handleApprove} onReject={handleReject} />
      ))}
    </div>
  );
}

function ActionItem({ action, onApprove, onReject }) {
  const getTypeIcon = (type) => {
    const icons = {
      publish: '📤',
      deploy: '🚀',
      delete: '🗑️',
      modify: '✏️',
      execute: '⚙️'
    };
    return icons[type] || '📋';
  };

  return (
    <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.8)] glass-panel">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span className="text-3xl">{getTypeIcon(action.action_type)}</span>
            <div>
              <h4 className="text-lg font-semibold text-white">{action.action_type.toUpperCase()}</h4>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Missão #{action.id.slice(0, 8)}</p>
            </div>
          </div>
          <p className="text-sm text-slate-300">{action.description}</p>
          {action.parameters && (
            <pre className="mt-4 overflow-x-auto rounded-3xl border border-white/10 bg-slate-900/80 p-4 text-xs text-slate-300">{JSON.stringify(action.parameters, null, 2)}</pre>
          )}
        </div>
        <div className="flex flex-col gap-3"> 
          <button onClick={() => onApprove(action.id)} className="inline-flex items-center justify-center gap-2 rounded-3xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-400 transition">
            <Check size={18} /> Aprovar
          </button>
          <button onClick={() => onReject(action.id)} className="inline-flex items-center justify-center gap-2 rounded-3xl bg-red-500 px-5 py-3 text-sm font-semibold text-white hover:bg-red-400 transition">
            <X size={18} /> Rejeitar
          </button>
        </div>
      </div>
    </div>
  );
}
