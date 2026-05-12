import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Copy, CheckCircle2 } from 'lucide-react';

interface ConflictItem {
  id: string;
  type: 'message' | 'profile' | 'memory';
  localVersion: Record<string, unknown>;
  remoteVersion: Record<string, unknown>;
  localTimestamp: string;
  remoteTimestamp: string;
}

interface ConflictResolutionModalProps {
  isOpen: boolean;
  conflicts: ConflictItem[];
  onResolve: (resolutions: Record<string, 'local' | 'remote' | 'merge'>) => void;
  onCancel: () => void;
  isSyncing?: boolean;
}

export function ConflictResolutionModal({
  isOpen,
  conflicts,
  onResolve,
  onCancel,
  isSyncing = false,
}: ConflictResolutionModalProps) {
  const [resolutions, setResolutions] = useState<Record<string, 'local' | 'remote' | 'merge'>>({});
  const [expandedId, setExpandedId] = useState<string | null>(conflicts[0]?.id || null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleResolution = (id: string, resolution: 'local' | 'remote' | 'merge') => {
    setResolutions((prev) => ({
      ...prev,
      [id]: resolution,
    }));
  };

  const allResolved = conflicts.every((c) => resolutions[c.id]);

  const handleCopy = (id: string, version: Record<string, unknown>) => {
    navigator.clipboard.writeText(JSON.stringify(version, null, 2));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <DialogTitle>Resolver Conflitos de Sincronização</DialogTitle>
          </div>
          <DialogDescription>
            {conflicts.length} conflito{conflicts.length !== 1 ? 's' : ''} detectado{conflicts.length !== 1 ? 's' : ''}. Escolha qual versão manter.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {conflicts.map((conflict) => {
            const isExpanded = expandedId === conflict.id;
            const resolution = resolutions[conflict.id];

            return (
              <div
                key={conflict.id}
                className="border rounded-lg overflow-hidden bg-slate-50"
              >
                {/* Header */}
                <button
                  onClick={() =>
                    setExpandedId(isExpanded ? null : conflict.id)
                  }
                  className="w-full p-3 flex items-center justify-between hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 text-left">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        resolution
                          ? 'bg-green-600'
                          : 'bg-yellow-600'
                      }`}
                    />
                    <div>
                      <p className="font-semibold text-sm capitalize">
                        {conflict.type}
                      </p>
                      <p className="text-xs text-gray-600">
                        ID: {conflict.id.substring(0, 8)}...
                      </p>
                    </div>
                  </div>

                  <Badge variant={resolution ? 'default' : 'outline'}>
                    {resolution ? `✓ ${resolution}` : 'Pendente'}
                  </Badge>
                </button>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t p-4 space-y-4 bg-white">
                    {/* Version Comparison */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Local Version */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-sm text-blue-700">
                            Versão Local
                          </h4>
                          <button
                            onClick={() =>
                              handleCopy(conflict.id, conflict.localVersion)
                            }
                            className="p-1 hover:bg-blue-100 rounded transition-colors"
                            title="Copiar"
                          >
                            {copiedId === conflict.id ? (
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-gray-600">
                          {new Date(conflict.localTimestamp).toLocaleString(
                            'pt-BR',
                          )}
                        </p>
                        <pre className="p-2 bg-blue-50 border border-blue-200 rounded text-xs overflow-auto max-h-40 text-blue-900">
                          {JSON.stringify(conflict.localVersion, null, 2)}
                        </pre>
                        <Button
                          size="sm"
                          variant={
                            resolution === 'local'
                              ? 'default'
                              : 'outline'
                          }
                          className="w-full"
                          onClick={() =>
                            handleResolution(conflict.id, 'local')
                          }
                          disabled={isSyncing}
                        >
                          {resolution === 'local' && '✓ '}
                          Usar Local
                        </Button>
                      </div>

                      {/* Remote Version */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-sm text-green-700">
                            Versão Remota
                          </h4>
                          <button
                            onClick={() =>
                              handleCopy(conflict.id, conflict.remoteVersion)
                            }
                            className="p-1 hover:bg-green-100 rounded transition-colors"
                            title="Copiar"
                          >
                            {copiedId === conflict.id ? (
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-gray-600">
                          {new Date(conflict.remoteTimestamp).toLocaleString(
                            'pt-BR',
                          )}
                        </p>
                        <pre className="p-2 bg-green-50 border border-green-200 rounded text-xs overflow-auto max-h-40 text-green-900">
                          {JSON.stringify(conflict.remoteVersion, null, 2)}
                        </pre>
                        <Button
                          size="sm"
                          variant={
                            resolution === 'remote'
                              ? 'default'
                              : 'outline'
                          }
                          className="w-full"
                          onClick={() =>
                            handleResolution(conflict.id, 'remote')
                          }
                          disabled={isSyncing}
                        >
                          {resolution === 'remote' && '✓ '}
                          Usar Remoto
                        </Button>
                      </div>
                    </div>

                    {/* Merge Note */}
                    <div className="p-3 bg-purple-50 border border-purple-200 rounded text-xs text-purple-900">
                      <p className="font-semibold mb-1">Merge (Advanced)</p>
                      <p>
                        Combine ambas versões. O sistema tentará mesclar
                        campos automaticamente.
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2"
                        onClick={() =>
                          handleResolution(conflict.id, 'merge')
                        }
                        disabled={isSyncing}
                      >
                        {resolution === 'merge' && '✓ '}
                        Tentar Merge
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <DialogFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isSyncing}
          >
            Cancelar
          </Button>
          <Button
            onClick={() => onResolve(resolutions)}
            disabled={!allResolved || isSyncing}
          >
            {isSyncing ? 'Aplicando...' : 'Aplicar Resoluções'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
