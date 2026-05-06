import React, { useEffect, useState } from 'react';
import { TrendingUp, DollarSign, AlertCircle, Zap } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getApiBase, getAuthHeaders } from '@/lib/api';

interface CostSummary {
  period_days: number;
  total_cost_usd: number;
  by_provider: Record<string, number>;
  by_endpoint: Record<string, number>;
  record_count: number;
  average_daily_cost: number;
  estimated_monthly_cost: number;
  exceeded_threshold: boolean;
}

interface CostAlert {
  user_id: string;
  timestamp: string;
  current_daily_cost: number;
  threshold: number;
  message: string;
  severity: string;
}

interface CostTrends {
  daily_breakdown: Record<string, number>;
  dates: string[];
  costs: number[];
  peak_day: number;
  trend: string;
}

interface FreeAlternative {
  name: string;
  description: string;
  cost: string;
}

export function CostTracker() {
  const [summary, setSummary] = useState<CostSummary | null>(null);
  const [trends, setTrends] = useState<CostTrends | null>(null);
  const [alerts, setAlerts] = useState<CostAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [alternatives, setAlternatives] = useState<FreeAlternative[]>([]);

  const API_BASE = getApiBase();
  const AUTH_HEADERS = getAuthHeaders();

  useEffect(() => {
    const fetchCostData = async () => {
      try {
        const [summaryRes, trendsRes, alertsRes] = await Promise.all([
          fetch(`${API_BASE}/api/v1/costs/summary`, { headers: AUTH_HEADERS }),
          fetch(`${API_BASE}/api/v1/costs/trends`, { headers: AUTH_HEADERS }),
          fetch(`${API_BASE}/api/v1/costs/alerts`, { headers: AUTH_HEADERS })
        ]);

        if (!summaryRes.ok || !trendsRes.ok || !alertsRes.ok) {
          throw new Error('Failed to fetch cost data');
        }

        setSummary(await summaryRes.json());
        setTrends(await trendsRes.json());
        const alertsData = await alertsRes.json();
        setAlerts(alertsData.alerts || []);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchCostData();
  }, [API_BASE, AUTH_HEADERS]);

  const loadAlternatives = async (provider: string, endpoint: string) => {
    try {
      const response = await fetch(
        `${API_BASE}/api/v1/costs/free-alternatives?provider=${provider}&endpoint=${endpoint}`,
        { headers: AUTH_HEADERS }
      );
      if (!response.ok) throw new Error('Failed to fetch alternatives');
      const data = await response.json();
      setAlternatives(data.alternatives || []);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const chartData = trends?.dates.map((date, idx) => ({
    date: new Date(date).toLocaleDateString('pt-BR'),
    cost: trends.costs[idx]
  })) || [];

  const getTrendDirection = () => {
    if (!trends) return '';
    if (trends.trend === 'increasing') return '📈 Aumentando';
    if (trends.trend === 'decreasing') return '📉 Diminuindo';
    return '➡️ Estável';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
          <DollarSign className="w-8 h-8 text-green-500" />
          Rastreador de Custos de API
        </h2>
      </div>

      {/* Resumo de Custos */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-green-900/20 to-green-900/10 border border-green-600/30 rounded-lg p-6">
            <p className="text-green-400 text-sm mb-1">Custo Total (30 dias)</p>
            <p className="text-4xl font-bold text-green-400">${summary.total_cost_usd.toFixed(2)}</p>
            <p className="text-green-300 text-xs mt-2">Registros: {summary.record_count}</p>
          </div>

          <div className="bg-gradient-to-br from-blue-900/20 to-blue-900/10 border border-blue-600/30 rounded-lg p-6">
            <p className="text-blue-400 text-sm mb-1">Custo Diário Médio</p>
            <p className="text-4xl font-bold text-blue-400">${summary.average_daily_cost.toFixed(3)}</p>
            <p className="text-blue-300 text-xs mt-2">por dia</p>
          </div>

          <div className="bg-gradient-to-br from-purple-900/20 to-purple-900/10 border border-purple-600/30 rounded-lg p-6">
            <p className="text-purple-400 text-sm mb-1">Custo Estimado Mensal</p>
            <p className="text-4xl font-bold text-purple-400">${summary.estimated_monthly_cost.toFixed(2)}</p>
            <p className="text-purple-300 text-xs mt-2">projeção</p>
          </div>

          <div className={`bg-gradient-to-br rounded-lg p-6 border ${
            summary.exceeded_threshold
              ? 'from-red-900/20 to-red-900/10 border-red-600/30'
              : 'from-teal-900/20 to-teal-900/10 border-teal-600/30'
          }`}>
            <p className={summary.exceeded_threshold ? 'text-red-400 text-sm' : 'text-teal-400 text-sm'}>
              Orçamento
            </p>
            <div className="mt-2">
              {summary.exceeded_threshold ? (
                <p className="text-red-400 font-bold">⚠️ Acima do limite</p>
              ) : (
                <p className="text-teal-400 font-bold">✓ Dentro do limite</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Alertas */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map((alert, idx) => (
            <div
              key={idx}
              className={`border-l-4 p-4 rounded flex items-start gap-3 ${
                alert.severity === 'high'
                  ? 'bg-red-900/30 border-red-600 text-red-200'
                  : 'bg-yellow-900/30 border-yellow-600 text-yellow-200'
              }`}
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{alert.message}</p>
                <p className="text-xs opacity-80">
                  {new Date(alert.timestamp).toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Gráfico de Tendências */}
      {trends && chartData.length > 0 && (
        <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Tendência de Custos ({getTrendDirection()})
            </h3>
            <p className="text-sm text-slate-300">
              Pico: ${trends.peak_day.toFixed(2)}
            </p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#404854" />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '0.5rem',
                  color: '#e2e8f0'
                }}
              />
              <Line
                type="monotone"
                dataKey="cost"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Custos por Provider */}
      {summary && Object.keys(summary.by_provider).length > 0 && (
        <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Custos por Provedor</h3>
          <div className="space-y-3">
            {Object.entries(summary.by_provider).map(([provider, cost]) => (
              <div key={provider} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-white font-semibold capitalize">{provider}</p>
                  <div className="w-full bg-slate-800 rounded-full h-2 mt-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: `${(cost / (summary.total_cost_usd || 1)) * 100}%`
                      }}
                    />
                  </div>
                </div>
                <div className="text-right ml-4">
                  <p className="text-green-400 font-semibold">${cost.toFixed(2)}</p>
                  <p className="text-xs text-slate-400">
                    {((cost / (summary.total_cost_usd || 1)) * 100).toFixed(1)}%
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedProvider(provider);
                    loadAlternatives(provider, 'generic');
                  }}
                  className="ml-4 px-3 py-1 bg-slate-600 hover:bg-slate-500 rounded text-xs text-white"
                >
                  Alternativas
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alternativas Gratuitas */}
      {alternatives.length > 0 && selectedProvider && (
        <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Alternativas Gratuitas para {selectedProvider.toUpperCase()}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alternatives.map((alt, idx) => (
              <div key={idx} className="bg-slate-800/60 border border-slate-600 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-2">{alt.name}</h4>
                <p className="text-slate-300 text-sm mb-3">{alt.description}</p>
                <p className="text-green-400 text-sm font-semibold">💰 {alt.cost}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div className="text-center text-slate-300">Carregando dados de custo...</div>
      )}

      {error && (
        <div className="bg-red-900/30 border border-red-600/50 rounded-lg p-4 text-red-200">
          Erro: {error}
        </div>
      )}
    </div>
  );
}
