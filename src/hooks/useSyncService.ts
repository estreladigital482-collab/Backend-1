import { useLocalAuth } from './useLocalAuth';
import { useOfflineChat } from './useOfflineChat';

interface SyncServiceOptions {
  userId: string;
  isOnline: boolean;
  onSyncComplete?: (success: boolean, syncedCount: number) => void;
}

export function useSyncService({ userId, isOnline, onSyncComplete }: SyncServiceOptions) {
  const { getLocalMessages, saveLocalMessages } = useLocalAuth();
  const { markAsSent, markAsFailed } = useOfflineChat();

  const syncMessages = async () => {
    if (!isOnline) return;

    try {
      const localMessages = getLocalMessages();
      const pendingMessages = localMessages.filter(msg => msg.status === 'pending');

      if (pendingMessages.length === 0) {
        onSyncComplete?.(true, 0);
        return;
      }

      // Simulação de envio para backend
      // Em produção, isso seria uma chamada real para a API
      const syncPromises = pendingMessages.map(async (message) => {
        try {
          // Simular delay de rede
          await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));

          // Simular sucesso (90% de chance) ou falha
          if (Math.random() > 0.1) {
            markAsSent(message.id);
            return { success: true, id: message.id };
          } else {
            markAsFailed(message.id);
            return { success: false, id: message.id };
          }
        } catch (error) {
          markAsFailed(message.id);
          return { success: false, id: message.id };
        }
      });

      const results = await Promise.all(syncPromises);
      const successfulSyncs = results.filter(r => r.success).length;

      // Atualizar mensagens locais
      const updatedMessages = getLocalMessages();
      saveLocalMessages(updatedMessages);

      onSyncComplete?.(successfulSyncs > 0, successfulSyncs);

    } catch (error) {
      console.error('Erro na sincronização:', error);
      onSyncComplete?.(false, 0);
    }
  };

  const syncProfile = async () => {
    if (!isOnline) return;

    try {
      // Sincronizar perfil local com nuvem
      const localUser = JSON.parse(localStorage.getItem('aura_sphere_local_user') || '{}');

      if (localUser?.isLocal) {
        // Em produção, enviar perfil para backend
        console.log('Sincronizando perfil local:', localUser);
      }
    } catch (error) {
      console.error('Erro na sincronização do perfil:', error);
    }
  };

  const performFullSync = async () => {
    if (!isOnline) return;

    await Promise.all([
      syncMessages(),
      syncProfile(),
    ]);
  };

  return {
    syncMessages,
    syncProfile,
    performFullSync,
  };
}