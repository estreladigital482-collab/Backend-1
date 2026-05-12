import React, { useState, useEffect } from 'react';
import { Activity, Clock, AlertCircle, TrendingUp } from 'lucide-react';

export function Dashboard() {
  const [stats, setStats] = useState({
    totalPlans: 0,
    activeTasks: 0,
    pendingActions: 0,
    completionRate: 0
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const [plansRes, tasksRes, actionsRes] = await Promise.all([
        fetch('/api/v1/planning/plans/dev-user'),
        fetch('/api/v1/planning/plans/dev-user'),
        fetch('/api/v1/actions/pending')
      ]);

      const plansData = await plansRes.json();
      const actionsData = await actionsRes.json();

      setStats({
        totalPlans: plansData.plans?.length || 0,
        activeTasks: plansData.plans?.reduce((sum, p) => sum + (p.task_count || 0), 0) || 0,
        pendingActions: actionsData.pending_actions?.length || 0,
        completionRate: calculateCompletionRate(plansData.plans || [])
      });
    } catch (error) {
      console.error('Erro ao buscar stats:', error);
    }
  };

  const calculateCompletionRate = (plans) => {
    const total = plans.reduce((sum, p) => sum + (p.task_count || 0), 0);
    const completed = plans.reduce((sum, p) => sum + (p.completed_tasks || 0), 0);
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  return (
    <div className="p-6 space-y-8">
      <div className="rounded-[2rem] border border-white/10 bg-slate-950/85 p-6 shadow-[0_32px_120px_-50px_rgba(0,0,0,0.8)] glass-panel">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-violet-400">Centro de Comando</p>
            <h1 className="text-3xl font-bold text-white">Dashboard de Aventura</h1>
          </div>
          <p className="max-w-2xl text-sm text-slate-300">Monitore seu progresso, conquistas e as próximas missões em um painel estilizado como um grimório moderno.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard icon={<Activity />} label="Planos Ativos" value={stats.totalPlans} />
        <StatCard icon={<Clock />} label="Tarefas Ativas" value={stats.activeTasks} />
        <StatCard icon={<AlertCircle />} label="Ações Pendentes" value={stats.pendingActions} />
        <StatCard icon={<TrendingUp />} label="Taxa de Conclusão" value={stats.completionRate + '%'} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <RecentActivity />
        <UrgentTasks />
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/80 p-5 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.75)]">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600/15 text-violet-300 shadow-[0_8px_30px_-24px_rgba(124,58,237,0.65)]">
          {icon}
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-slate-400">{label}</p>
          <p className="text-3xl font-semibold text-white mt-2">{value}</p>
        </div>
      </div>
    </div>
  );
}

function RecentActivity() {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.8)]">
      <div className="flex items-center justify-between gap-4 mb-5">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Registro de Jornadas</p>
          <h3 className="text-xl font-semibold text-white">Atividades Recentes</h3>
        </div>
        <div className="rounded-full bg-violet-600/15 px-3 py-1 text-xs uppercase tracking-[0.25em] text-violet-200">Histórico</div>
      </div>
      <div className="space-y-4">
        <ActivityItem timestamp="Há 2 horas" text="Tarefa 'Estudar React' marcada como 50% concluída" />
        <ActivityItem timestamp="Há 5 horas" text="Novo plano 'Projeto de IA' criado" />
        <ActivityItem timestamp="Há 1 dia" text="Ação 'Deploy' aprovada e executada" />
      </div>
    </div>
  );
}

function ActivityItem({ timestamp, text }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-4 shadow-[0_16px_40px_-20px_rgba(0,0,0,0.7)]">
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm text-slate-300">{text}</p>
        <span className="text-xs uppercase tracking-[0.25em] text-slate-500">{timestamp}</span>
      </div>
    </div>
  );
}

function UrgentTasks() {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.8)]">
      <div className="flex items-center gap-3 mb-5 text-slate-200">
        <AlertCircle size={22} className="text-orange-400" />
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Quest Board</p>
          <h3 className="text-xl font-semibold text-white">Tarefas Urgentes</h3>
        </div>
      </div>
      <div className="space-y-3">
        <TaskUrgent priority="Alta" task="Revisar proposta de ação #3" />
        <TaskUrgent priority="Média" task="Atualizar documentação de API" />
      </div>
    </div>
  );
}

function TaskUrgent({ priority, task }) {
  const colors = {
    'Alta': 'bg-red-50 border-red-200',
    'Média': 'bg-yellow-50 border-yellow-200'
  };
  return (
    <div className={`border rounded p-2 ${colors[priority]}`}>
      <p className="text-sm"><span className="font-semibold">[{priority}]</span> {task}</p>
    </div>
  );
}
