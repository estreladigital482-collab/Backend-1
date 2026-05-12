import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Shield, TrendingUp } from 'lucide-react';
import { getApiBase, getAuthHeaders } from '@/lib/api';

interface SecurityIssue {
  id: string;
  severity: string;
  description: string;
  component: string;
  resolution: string;
  reported_at: string;
  status: string;
  details: Record<string, unknown>;
}

interface SecuritySummary {
  total_issues: number;
  by_severity: Record<string, number>;
  critical_count: number;
  requires_attention: boolean;
  timestamp: string;
}

export function SecurityDashboard() {
  const [issues, setIssues] = useState<SecurityIssue[]>([]);
  const [summary, setSummary] = useState<SecuritySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [auditCode, setAuditCode] = useState('');
  const [auditing, setAuditing] = useState(false);

  const API_BASE = getApiBase();
  const AUTH_HEADERS = getAuthHeaders();

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/v1/security/issues`, { headers: AUTH_HEADERS });
        if (!response.ok) throw new Error('Falha ao buscar issues');
        const data = await response.json();
        setIssues(data.issues || []);
      } catch (err) {
        setError((err as Error).message);
      }
    };

    const fetchSummary = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/v1/security/summary`, { headers: AUTH_HEADERS });
        if (!response.ok) throw new Error('Falha ao buscar resumo');
        setSummary(await response.json());
      } catch (err) {
        setError((err as Error).message);
      }
    };

    Promise.all([fetchIssues(), fetchSummary()]).finally(() => setLoading(false));
  }, [API_BASE, AUTH_HEADERS]);

  const runAudit = async () => {
    if (!auditCode.trim()) return;

    setAuditing(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/v1/security/audit`, {
        method: 'POST',
        headers: AUTH_HEADERS,
        body: JSON.stringify({
          code: auditCode,
          language: 'python',
          component: 'user_audit'
        })
      });

      if (!response.ok) throw new Error('Falha na auditoria');
      const data = await response.json();

      setIssues(data.issues || []);
      setSummary(data.summary || null);
      setAuditCode('');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setAuditing(false);
    }
  };

  const updateIssueStatus = async (issueId: string, newStatus: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/security/issues/${issueId}/status`, {
        method: 'PATCH',
        headers: AUTH_HEADERS,
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) throw new Error('Falha ao atualizar status');

      setIssues(issues.map((i) => (i.id === issueId ? { ...i, status: newStatus } : i)));
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-500 bg-red-50';
      case 'high':
        return 'text-orange-500 bg-orange-50';
      case 'medium':
        return 'text-yellow-500 bg-yellow-50';
      case 'low':
        return 'text-blue-500 bg-blue-50';
      default:
        return 'text-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="p-6 space-y-8">
      <div className="glass-panel border border-white/10 p-6 shadow-[0_32px_90px_-40px_rgba(0,0,0,0.85)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <Shield className="w-10 h-10 text-blue-400" />
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Sentinela de Segurança</p>
              <h2 className="text-3xl font-bold text-white">Security Dashboard</h2>
            </div>
          </div>
          <p className="max-w-2xl text-sm text-slate-300">Monitore vulnerabilidades e execute auditorias diretamente do seu painel de comando.</p>
        </div>
      </div>

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.8)]">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Vulnerabilidades</p>
            <p className="text-3xl font-semibold text-white mt-3">{summary.total_issues}</p>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.8)]">
            <p className="text-sm uppercase tracking-[0.2em] text-red-400">Crítico</p>
            <p className="text-3xl font-semibold text-red-400 mt-3">{summary.by_severity.critical || 0}</p>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.8)]">
            <p className="text-sm uppercase tracking-[0.2em] text-orange-400">Alto</p>
            <p className="text-3xl font-semibold text-orange-400 mt-3">{summary.by_severity.high || 0}</p>
          </div>
          <div className={`rounded-[2rem] border p-6 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.8)] ${summary.requires_attention ? 'border-red-600/30 bg-red-900/10' : 'border-green-600/30 bg-green-900/10'}`}>
            <p className={summary.requires_attention ? 'text-red-400 text-sm uppercase tracking-[0.2em]' : 'text-green-400 text-sm uppercase tracking-[0.2em]'}>Status</p>
            <p className="mt-3 text-3xl font-semibold text-white">{summary.requires_attention ? 'Atenção Necessária' : 'Seguro'}</p>
          </div>
        </div>
      )}

      <div className="glass-panel border border-white/10 p-6 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.75)]">
        <h3 className="text-lg font-semibold text-white mb-4">Executar Auditoria de Código</h3>
        <div className="space-y-4">
          <textarea
            value={auditCode}
            onChange={(e) => setAuditCode(e.target.value)}
            placeholder="Cole seu código Python aqui para auditoria..."
            className="w-full h-48 rounded-3xl border border-white/10 bg-slate-950/80 p-4 text-white placeholder:text-slate-500 font-mono text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
          />
          <button
            onClick={runAudit}
            disabled={auditing || !auditCode.trim()}
            className="inline-flex items-center justify-center rounded-3xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:bg-slate-600"
          >
            {auditing ? 'Auditando...' : 'Executar Auditoria'}
          </button>
        </div>
      </div>

      {issues.length > 0 && (
        <div className="glass-panel border border-white/10 p-6 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.75)]">
          <h3 className="text-lg font-semibold text-white mb-4">Problemas Detectados ({issues.length})</h3>
          <div className="space-y-4">
            {issues.map((issue) => (
              <div key={issue.id} className={`rounded-[1.75rem] border-l-4 p-5 ${getSeverityColor(issue.severity)} bg-slate-950/80 border-white/10`}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className={`font-semibold uppercase text-xs px-2 py-1 rounded ${getSeverityColor(issue.severity)}`}>{issue.severity}</span>
                      <span className="text-xs text-slate-400">{issue.component}</span>
                    </div>
                    <h4 className="text-white font-semibold text-lg">{issue.description}</h4>
                    <p className="text-slate-300 text-sm mt-2">{issue.resolution}</p>
                    {issue.details?.line && (
                      <p className="text-xs text-slate-400 mt-2">Linha {issue.details.line}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={issue.status}
                      onChange={(e) => updateIssueStatus(issue.id, e.target.value)}
                      className="rounded-3xl border border-white/10 bg-slate-900/80 px-3 py-2 text-xs text-white outline-none"
                    >
                      <option value="open">Open</option>
                      <option value="resolved">Resolved</option>
                      <option value="ignored">Ignored</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 text-center text-slate-300 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.8)]">Carregando dados de segurança...</div>
      )}

      {error && (
        <div className="rounded-[2rem] border border-red-600/40 bg-red-900/20 p-6 text-red-200">Erro: {error}</div>
      )}

      {!loading && issues.length === 0 && !error && (
        <div className="rounded-[2rem] border border-green-600/40 bg-green-900/20 p-6 text-green-200">✓ Nenhum problema de segurança detectado</div>
      )}
    </div>
  );
}
