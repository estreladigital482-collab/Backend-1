import React, { useState, useEffect } from 'react';
import { Instagram, Plus, RefreshCw, Settings, BarChart3, Clock } from 'lucide-react';
import { ActionQueue } from './ActionQueue';

export function SocialTab() {
  const [connectedAccounts, setConnectedAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPendingActions, setShowPendingActions] = useState(false);

  useEffect(() => {
    loadConnectedAccounts();
  }, []);

  const loadConnectedAccounts = async () => {
    try {
      // TODO: Buscar contas conectadas da API
      setConnectedAccounts([
        {
          id: 'instagram-1',
          platform: 'instagram',
          username: '@example_user',
          status: 'connected',
          lastSync: '2024-01-15T10:30:00Z',
          stats: {
            followers: 1250,
            following: 890,
            posts: 45
          }
        }
      ]);
    } catch (error) {
      console.error('Erro ao carregar contas:', error);
    }
  };

  const handleConnectInstagram = () => {
    // TODO: Abrir modal de login do Instagram
    console.log('Conectar Instagram');
  };

  const handleSyncAccount = async (accountId: string) => {
    setIsLoading(true);
    try {
      // TODO: Chamar API de sync
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulação
      loadConnectedAccounts();
    } catch (error) {
      console.error('Erro no sync:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Redes Sociais</h2>
        <button
          onClick={handleConnectInstagram}
          className="flex items-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700"
        >
          <Plus size={20} />
          Conectar Instagram
        </button>
      </div>

      {/* Contas Conectadas */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Contas Conectadas</h3>

        {connectedAccounts.length === 0 ? (
          <div className="text-center text-slate-400 py-12">
            <Instagram size={48} className="mx-auto mb-4 opacity-50" />
            <p>Nenhuma conta conectada ainda</p>
            <p className="text-sm">Conecte sua conta do Instagram para organizar seus saves</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {connectedAccounts.map((account) => (
              <AccountCard
                key={account.id}
                account={account}
                onSync={() => handleSyncAccount(account.id)}
                isLoading={isLoading}
              />
            ))}
          </div>
        )}
      </div>

      {/* Ações Pendentes */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Clock size={20} />
            Ações Pendentes
          </h3>
          <button
            onClick={() => setShowPendingActions(!showPendingActions)}
            className="text-slate-400 hover:text-white text-sm"
          >
            {showPendingActions ? 'Ocultar' : 'Mostrar'}
          </button>
        </div>

        {showPendingActions && (
          <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-4">
            <ActionQueue />
          </div>
        )}
      </div>

      {/* Ações Rápidas */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Ações Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickActionCard
            icon={<BarChart3 size={24} />}
            title="Analytics"
            description="Ver estatísticas das contas"
            onClick={() => console.log('Analytics')}
          />
          <QuickActionCard
            icon={<Settings size={24} />}
            title="Configurações"
            description="Gerenciar contas e preferências"
            onClick={() => console.log('Settings')}
          />
          <QuickActionCard
            icon={<RefreshCw size={24} />}
            title="Sync All"
            description="Sincronizar todas as contas"
            onClick={() => console.log('Sync All')}
          />
        </div>
      </div>
    </div>
  );
}

function AccountCard({ account, onSync, isLoading }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-pink-600 rounded-full flex items-center justify-center">
            <Instagram size={24} className="text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-white">{account.username}</h4>
            <p className="text-sm text-slate-400 capitalize">{account.platform}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">
            {account.status}
          </span>
          <button
            onClick={onSync}
            disabled={isLoading}
            className="p-2 text-slate-400 hover:text-white disabled:opacity-50"
            title="Sincronizar"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-lg font-bold text-white">{account.stats.followers.toLocaleString()}</div>
          <div className="text-xs text-slate-400">Seguidores</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-white">{account.stats.following.toLocaleString()}</div>
          <div className="text-xs text-slate-400">Seguindo</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-white">{account.stats.posts}</div>
          <div className="text-xs text-slate-400">Posts</div>
        </div>
      </div>

      <div className="text-xs text-slate-500">
        Última sync: {formatDate(account.lastSync)}
      </div>
    </div>
  );
}

function QuickActionCard({ icon, title, description, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 hover:border-slate-500 transition text-left"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="text-slate-400">{icon}</div>
        <h4 className="font-semibold text-white">{title}</h4>
      </div>
      <p className="text-sm text-slate-400">{description}</p>
    </button>
  );
}