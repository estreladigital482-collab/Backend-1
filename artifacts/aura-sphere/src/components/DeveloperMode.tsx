import React, { useEffect, useState } from 'react';

export function DeveloperMode() {
  const [logs, setLogs] = useState<string[]>([]);
  const [metrics, setMetrics] = useState({ requests: 0, errors: 0, uptime: '0h 0m' });

  useEffect(() => {
    const storedLogs = window.localStorage.getItem('aura_sphere_dev_logs');
    if (storedLogs) {
      setLogs(JSON.parse(storedLogs));
    }

    setMetrics({ requests: 42, errors: 1, uptime: '03h 22m' });
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-3xl font-bold text-white">Developer Mode</h2>
      <div className="grid gap-4 md:grid-cols-3">
        <Widget title="Requests" value={metrics.requests.toString()} />
        <Widget title="Errors" value={metrics.errors.toString()} />
        <Widget title="Uptime" value={metrics.uptime} />
      </div>

      <div className="rounded-3xl bg-slate-800/70 border border-slate-600 p-6">
        <h3 className="text-xl font-semibold text-white mb-4">Console Logs</h3>
        <div className="max-h-96 overflow-y-auto rounded-2xl bg-slate-900 p-4 text-slate-200">
          {logs.length === 0 ? (
            <p className="text-slate-500">Nenhum log disponível ainda.</p>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="mb-3 text-sm leading-6">
                <span className="text-slate-400">[{index + 1}]</span> {log}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function Widget({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-3xl bg-slate-700/70 border border-slate-600 p-6 text-center">
      <p className="text-sm uppercase tracking-[0.2em] text-slate-400 mb-3">{title}</p>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  );
}
