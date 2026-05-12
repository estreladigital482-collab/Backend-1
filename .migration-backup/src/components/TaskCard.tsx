import React, { useState } from 'react';
import { ChevronDown, Edit2, Trash2 } from 'lucide-react';

export function TaskCard({ task, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [progress, setProgress] = useState(task.progress || 0);
  const [status, setStatus] = useState(task.status || 'pending');

  const handleSave = async () => {
    await onUpdate({ ...task, progress, status });
    setIsEditing(false);
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'high': 'bg-red-100 text-red-800',
      'medium': 'bg-yellow-100 text-yellow-800',
      'low': 'bg-green-100 text-green-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (s) => {
    const colors = {
      'completed': 'text-green-600',
      'in_progress': 'text-blue-600',
      'pending': 'text-gray-600'
    };
    return colors[s] || 'text-gray-600';
  };

  return (
    <div className="border rounded-lg p-4 bg-white hover:shadow-md transition">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h4 className="font-semibold text-lg">{task.title}</h4>
          <p className="text-sm text-gray-600">{task.description}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsEditing(!isEditing)} className="p-1 hover:bg-gray-100 rounded">
            <Edit2 size={18} />
          </button>
          <button onClick={() => onDelete(task.id)} className="p-1 hover:bg-red-100 rounded text-red-600">
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="flex gap-3 mb-3">
        <span className={`px-2 py-1 rounded text-xs font-semibold ${getPriorityColor(task.priority)}`}>
          {task.priority}
        </span>
        <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(status)}`}>
          {status}
        </span>
      </div>

      {isEditing ? (
        <div className="space-y-2 mt-3 bg-gray-50 p-3 rounded">
          <div>
            <label className="text-xs font-semibold">Progresso: {progress}%</label>
            <input type="range" min="0" max="100" value={progress} onChange={(e) => setProgress(parseInt(e.target.value))} className="w-full" />
          </div>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full px-2 py-1 border rounded text-sm">
            <option value="pending">Pendente</option>
            <option value="in_progress">Em Progresso</option>
            <option value="completed">Concluído</option>
          </select>
          <button onClick={handleSave} className="w-full bg-blue-600 text-white py-1 rounded text-sm hover:bg-blue-700">
            Salvar
          </button>
        </div>
      ) : (
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span>Progresso</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      )}
    </div>
  );
}
