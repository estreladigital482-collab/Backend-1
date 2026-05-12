import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';

export function PlanningTab() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newPlanTitle, setNewPlanTitle] = useState('');

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/planning/plans/dev-user');
      const data = await response.json();
      setPlans(data.plans || []);
    } catch (error) {
      console.error('Erro ao buscar planos:', error);
    }
    setLoading(false);
  };

  const handleCreatePlan = async () => {
    if (!newPlanTitle.trim()) return;

    try {
      const response = await fetch('/api/v1/planning/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newPlanTitle, description: '' })
      });

      if (response.ok) {
        setNewPlanTitle('');
        fetchPlans();
      }
    } catch (error) {
      console.error('Erro ao criar plano:', error);
    }
  };

  return (
    <div className="p-6 space-y-8">
      <div className="glass-panel border border-white/10 p-6 shadow-[0_32px_90px_-40px_rgba(0,0,0,0.85)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Mapa de Missões</p>
            <h2 className="text-3xl font-bold text-white">Planejamento Estratégico</h2>
            <p className="mt-3 text-slate-300 max-w-2xl">Crie planos reais para sua jornada e acompanhe o progresso como um herói que evolui em cada missão.</p>
          </div>
          <div className="rounded-3xl bg-slate-900/80 border border-white/10 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Missões ativas</p>
            <p className="text-3xl font-semibold text-white mt-2">{plans.length}</p>
          </div>
        </div>
      </div>

      <div className="glass-panel border border-white/10 p-6 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.75)]">
        <div className="grid gap-4 lg:grid-cols-[1fr_0.6fr]">
          <div className="space-y-3">
            <label className="text-sm text-slate-300">Novo Plano</label>
            <input
              type="text"
              placeholder="Nome do plano (ex: Aprender React)"
              value={newPlanTitle}
              onChange={(e) => setNewPlanTitle(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreatePlan()}
              className="w-full rounded-3xl border border-white/10 bg-slate-950/80 px-4 py-3 text-white outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
            />
          </div>
          <button
            onClick={handleCreatePlan}
            className="inline-flex items-center justify-center gap-2 rounded-3xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-500"
          >
            <Plus size={20} /> Criar Plano
          </button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 text-center text-slate-300 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.8)]">Carregando planos...</div>
      ) : (
        <div className="space-y-4">
          {plans.map((plan) => (
            <div key={plan.id} className="glass-panel border border-white/10 rounded-[2rem] p-6 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.8)]">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="rounded-full bg-violet-600/15 px-3 py-1 text-xs uppercase tracking-[0.25em] text-violet-200">{plan.status}</span>
                    <span className="text-xs text-slate-400">Criado em {plan.created_at ? new Date(plan.created_at).toLocaleDateString() : '-'}</span>
                  </div>
                  <h3 className="text-2xl font-semibold text-white">{plan.title}</h3>
                  <p className="text-sm text-slate-400 mt-2">{plan.completed_tasks} de {plan.task_count} tarefas completas</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-400 uppercase tracking-[0.2em]">Progresso</p>
                  <p className="text-3xl font-semibold text-white mt-2">{plan.progress?.toFixed(0) || 0}%</p>
                </div>
              </div>

              <div className="mt-6 rounded-full bg-slate-900/90 h-4 overflow-hidden border border-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 via-blue-500 to-cyan-400 transition-all duration-500"
                  style={{ width: `${plan.progress || 0}%` }}
                />
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-400">
                <span>{plan.progress?.toFixed(0) || 0}% completo</span>
                <span>{plan.task_count || 0} tarefas no plano</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
