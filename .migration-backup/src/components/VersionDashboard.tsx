import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, GitBranch, BarChart3 } from 'lucide-react';

interface AIVersion {
  id: string;
  version: string;
  status: 'production' | 'candidate' | 'deprecated';
  metrics: {
    accuracy: number;
    responseTime: number;
    errorRate: number;
    userSatisfaction: number;
  };
  createdAt: string;
  deployedAt?: string;
}

interface VersionDashboardProps {
  currentVersion: string;
  onVersionChange?: (versionId: string) => void;
}

export function VersionDashboard({ currentVersion, onVersionChange }: VersionDashboardProps) {
  const [versions, setVersions] = useState<AIVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data - em produção, buscar do backend
  useEffect(() => {
    const mockVersions: AIVersion[] = [
      {
        id: 'v1.2.3',
        version: '1.2.3',
        status: 'production',
        metrics: {
          accuracy: 94.2,
          responseTime: 1.2,
          errorRate: 2.1,
          userSatisfaction: 4.6,
        },
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        deployedAt: new Date(Date.now() - 43200000).toISOString(),
      },
      {
        id: 'v1.2.4',
        version: '1.2.4',
        status: 'candidate',
        metrics: {
          accuracy: 95.1,
          responseTime: 1.1,
          errorRate: 1.8,
          userSatisfaction: 4.7,
        },
        createdAt: new Date(Date.now() - 43200000).toISOString(),
      },
      {
        id: 'v1.2.2',
        version: '1.2.2',
        status: 'deprecated',
        metrics: {
          accuracy: 92.8,
          responseTime: 1.4,
          errorRate: 3.2,
          userSatisfaction: 4.3,
        },
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        deployedAt: new Date(Date.now() - 129600000).toISOString(),
      },
    ];

    setTimeout(() => {
      setVersions(mockVersions);
      setIsLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'production': return 'bg-green-500';
      case 'candidate': return 'bg-yellow-500';
      case 'deprecated': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'production': return <CheckCircle className="w-4 h-4" />;
      case 'candidate': return <AlertTriangle className="w-4 h-4" />;
      case 'deprecated': return <TrendingDown className="w-4 h-4" />;
      default: return null;
    }
  };

  const getMetricTrend = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (current < previous) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <GitBranch className="w-8 h-8 animate-pulse mx-auto mb-2 text-purple-500" />
          <p className="text-gray-400">Carregando versões...</p>
        </div>
      </div>
    );
  }

  const currentVersionData = versions.find(v => v.version === currentVersion);
  const candidateVersion = versions.find(v => v.status === 'candidate');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <GitBranch className="w-6 h-6 text-purple-500" />
            Versionamento da IA
          </h2>
          <p className="text-gray-400 mt-1">
            Versão atual: <span className="text-purple-400 font-medium">{currentVersion}</span>
          </p>
        </div>
        {candidateVersion && (
          <Button
            onClick={() => onVersionChange?.(candidateVersion.id)}
            className="bg-yellow-600 hover:bg-yellow-700"
          >
            Testar Candidata {candidateVersion.version}
          </Button>
        )}
      </div>

      {/* Current Version Metrics */}
      {currentVersionData && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Métricas da Versão Atual
            </CardTitle>
            <CardDescription>
              Performance em tempo real da versão {currentVersion}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {currentVersionData.metrics.accuracy}%
                </div>
                <div className="text-sm text-gray-400">Precisão</div>
                <Progress value={currentVersionData.metrics.accuracy} className="mt-2" />
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {currentVersionData.metrics.responseTime}s
                </div>
                <div className="text-sm text-gray-400">Tempo de Resposta</div>
                <Progress value={Math.max(0, 100 - currentVersionData.metrics.responseTime * 20)} className="mt-2" />
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">
                  {currentVersionData.metrics.errorRate}%
                </div>
                <div className="text-sm text-gray-400">Taxa de Erro</div>
                <Progress value={100 - currentVersionData.metrics.errorRate} className="mt-2" />
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  {currentVersionData.metrics.userSatisfaction}/5
                </div>
                <div className="text-sm text-gray-400">Satisfação</div>
                <Progress value={currentVersionData.metrics.userSatisfaction * 20} className="mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Version List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Histórico de Versões</h3>
        {versions.map((version, index) => {
          const previousVersion = versions[index + 1];
          return (
            <Card key={version.id} className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge className={`${getStatusColor(version.status)} text-white`}>
                      {getStatusIcon(version.status)}
                      <span className="ml-1 capitalize">{version.status}</span>
                    </Badge>
                    <span className="text-lg font-bold text-white">v{version.version}</span>
                  </div>
                  <div className="text-sm text-gray-400">
                    {version.deployedAt
                      ? `Implantada em ${new Date(version.deployedAt).toLocaleDateString('pt-BR')}`
                      : `Criada em ${new Date(version.createdAt).toLocaleDateString('pt-BR')}`
                    }
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    {previousVersion && getMetricTrend(version.metrics.accuracy, previousVersion.metrics.accuracy)}
                    <span>Precisão: <span className="font-medium">{version.metrics.accuracy}%</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    {previousVersion && getMetricTrend(previousVersion.metrics.responseTime - version.metrics.responseTime, 0)}
                    <span>Tempo: <span className="font-medium">{version.metrics.responseTime}s</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    {previousVersion && getMetricTrend(previousVersion.metrics.errorRate - version.metrics.errorRate, 0)}
                    <span>Erro: <span className="font-medium">{version.metrics.errorRate}%</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    {previousVersion && getMetricTrend(version.metrics.userSatisfaction, previousVersion.metrics.userSatisfaction)}
                    <span>Satisfação: <span className="font-medium">{version.metrics.userSatisfaction}/5</span></span>
                  </div>
                </div>
                {version.status === 'candidate' && (
                  <div className="mt-4 flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => onVersionChange?.(version.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Promover para Produção
                    </Button>
                    <Button size="sm" variant="outline">
                      Rejeitar Versão
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}