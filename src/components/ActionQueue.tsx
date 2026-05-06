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
    return <div className="text-center text-gray-500 py-8">Nenhuma ação pendente</div>;
  }

  return (
    <div className="space-y-4">
      {actions.map((action) => (
        <ActionItem key={action.id} action={action} onApprove={handleApprove} onReject={handleReject} />
      ))}
    </div>
  );
}

function ActionItem({ action, onApprove, onReject }) {
  const getTypeIcon = (type) => {
    const icons = {
      'publish': '📤',
      'deploy': '🚀',
      'delete': '🗑️',
      'modify': '✏️',
      'execute': '⚙️'
    };
    return icons[type] || '📋';
  };

  return (
    <div className="border rounded-lg p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{getTypeIcon(action.action_type)}</span>
            <h4 className="font-semibold">{action.action_type.toUpperCase()}</h4>
            <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">{action.id.slice(0, 8)}</span>
          </div>
          <p className="text-sm text-gray-700">{action.description}</p>
          {action.parameters && (
            <pre className="text-xs bg-white p-2 rounded mt-2 overflow-x-auto border">
              {JSON.stringify(action.parameters, null, 2)}
            </pre>
          )}
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <button onClick={() => onReject(action.id)} className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200">
          <X size={18} /> Rejeitar
        </button>
        <button onClick={() => onApprove(action.id)} className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200">
          <Check size={18} /> Aprovar
        </button>
      </div>
    </div>
  );
}
