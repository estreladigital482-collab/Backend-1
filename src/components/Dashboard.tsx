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
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard icon={<Activity />} label="Planos Ativos" value={stats.totalPlans} />
        <StatCard icon={<Clock />} label="Tarefas Ativas" value={stats.activeTasks} />
        <StatCard icon={<AlertCircle />} label="Ações Pendentes" value={stats.pendingActions} />
        <StatCard icon={<TrendingUp />} label="Taxa de Conclusão" value={stats.completionRate + '%'} />
      </div>

      <RecentActivity />
      <UrgentTasks />
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-2xl font-bold mt-2">{value}</p>
        </div>
        <div className="text-blue-600 opacity-50">{icon}</div>
      </div>
    </div>
  );
}

function RecentActivity() {
  return (
    <div className="bg-white rounded-lg border p-4">
      <h3 className="font-semibold mb-4">Atividades Recentes</h3>
      <div className="space-y-3">
        <ActivityItem timestamp="Há 2 horas" text="Tarefa 'Estudar React' marcada como 50% concluída" />
        <ActivityItem timestamp="Há 5 horas" text="Novo plano 'Projeto de IA' criado" />
        <ActivityItem timestamp="Há 1 dia" text="Ação 'Deploy' aprovada e executada" />
      </div>
    </div>
  );
}

function ActivityItem({ timestamp, text }) {
  return (
    <div className="flex gap-4 py-2 border-b last:border-b-0">
      <span className="text-xs text-gray-500 min-w-20">{timestamp}</span>
      <p className="text-sm">{text}</p>
    </div>
  );
}

function UrgentTasks() {
  return (
    <div className="bg-white rounded-lg border p-4">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <AlertCircle size={18} className="text-orange-600" /> Tarefas Urgentes
      </h3>
      <div className="space-y-2">
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
