import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, Clock, RefreshCw, AlertTriangle } from 'lucide-react';
import { useOfflineChat } from '@/hooks/useOfflineChat';
import { useLocalAuth } from '@/hooks/useLocalAuth';

interface SyncConflict {
  type: 'message' | 'profile' | 'memory';
  local: Record<string, unknown>;
  remote: Record<string, unknown>;
  resolution?: 'local' | 'remote' | 'merge';
}

interface SyncPanelProps {
  userId: string;
  isOnline: boolean;
}

export function SyncPanel({ userId, isOnline }: SyncPanelProps) {
  const { pendingCount } = useOfflineChat();
  const { user } = useLocalAuth();
  const [syncProgress, setSyncProgress] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [conflicts, setConflicts] = useState<SyncConflict[]>([]);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  if (!user?.isLocal) {
    return null;
  }

  const syncStatusColor = isSyncing
    ? 'bg-blue-50 border-blue-200'
    : isOnline
      ? 'bg-green-50 border-green-200'
      : 'bg-yellow-50 border-yellow-200';

  const syncStatusIcon = isSyncing
    ? <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
    : isOnline
      ? <CheckCircle2 className="w-5 h-5 text-green-600" />
      : <Clock className="w-5 h-5 text-yellow-600" />;

  const syncStatusText = isSyncing
    ? 'Sincronizando...'
    : isOnline
      ? 'Online'
      : 'Offline';

  return (
    <Card className={`border-2 transition-colors ${syncStatusColor}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {syncStatusIcon}
            <div>
              <CardTitle className="text-sm">{syncStatusText}</CardTitle>
              <CardDescription className="text-xs">
                {pendingCount > 0 && `${pendingCount} mensagem${pendingCount > 1 ? 's' : ''} pendente${pendingCount > 1 ? 's' : ''}`}
                {pendingCount === 0 && lastSync && `Última sync: ${lastSync.toLocaleTimeString('pt-BR')}`}
                {pendingCount === 0 && !lastSync && 'Nenhuma alteração pendente'}
              </CardDescription>
            </div>
          </div>

          {isOnline && !isSyncing && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setIsSyncing(true);
                setSyncProgress(0);
                setTimeout(() => {
                  setSyncProgress(100);
                  setLastSync(new Date());
                  setIsSyncing(false);
                }, 1500);
              }}
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Sincronizar
            </Button>
          )}
        </div>
      </CardHeader>

      {isSyncing && (
        <CardContent className="pt-0">
          <div className="space-y-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${syncProgress}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 text-center">{syncProgress}%</p>
          </div>
        </CardContent>
      )}

      {conflicts.length > 0 && (
        <CardContent className="pt-3 border-t">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-red-700">
              <AlertTriangle className="w-4 h-4" />
              {conflicts.length} conflito{conflicts.length > 1 ? 's' : ''}
            </div>
            {conflicts.map((conflict, idx) => (
              <div
                key={idx}
                className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800"
              >
                <div className="font-semibold mb-1">
                  Conflito de {conflict.type}:
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="font-semibold">Local:</span>
                    <pre className="text-[10px] overflow-auto max-h-16">
                      {JSON.stringify(conflict.local, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <span className="font-semibold">Remoto:</span>
                    <pre className="text-[10px] overflow-auto max-h-16">
                      {JSON.stringify(conflict.remote, null, 2)}
                    </pre>
                  </div>
                </div>
                {!conflict.resolution && (
                  <div className="mt-2 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-6"
                      onClick={() => {
                        setConflicts((prev) =>
                          prev.map((c, i) =>
                            i === idx ? { ...c, resolution: 'local' } : c,
                          ),
                        );
                      }}
                    >
                      Usar Local
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-6"
                      onClick={() => {
                        setConflicts((prev) =>
                          prev.map((c, i) =>
                            i === idx ? { ...c, resolution: 'remote' } : c,
                          ),
                        );
                      }}
                    >
                      Usar Remoto
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
