import { useLocalAuth } from './useLocalAuth';
import { useOfflineChat } from './useOfflineChat';

interface SyncServiceOptions {
  userId: string;
  isOnline: boolean;
  onSyncComplete?: (success: boolean, syncedCount: number) => void;
  onSyncProgress?: (stage: string, progress: number) => void;
}

interface SyncConflict {
  type: 'message' | 'profile' | 'memory';
  local: Record<string, unknown>;
  remote: Record<string, unknown>;
  resolution: 'local' | 'remote' | 'merge' | 'manual';
}

const isLocalId = (id: string) => id.startsWith('local_');

export function useSyncService({
  userId,
  isOnline,
  onSyncComplete,
  onSyncProgress,
}: SyncServiceOptions) {
  const { getLocalMessages, saveLocalMessages, user: localUser, clearLocalSession } = useLocalAuth();
  const { markAsSent, markAsFailed } = useOfflineChat();

  const syncMessages = async (): Promise<{ success: boolean; syncedCount: number; conflicts: SyncConflict[] }> => {
    if (!isOnline || !userId || isLocalId(userId)) {
      return { success: false, syncedCount: 0, conflicts: [] };
    }

    try {
      onSyncProgress?.('messages', 0);
      const localMessages = getLocalMessages();
      const pendingMessages = localMessages.filter(msg => msg.status === 'pending' || msg.status === 'failed');

      if (pendingMessages.length === 0) {
        onSyncProgress?.('messages', 100);
        return { success: true, syncedCount: 0, conflicts: [] };
      }

      const syncPromises = pendingMessages.map(async (message) => {
        try {
          const response = await fetch('/api/chat-messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: userId,
              role: message.role || 'user',
              content: message.content,
              created_at: message.timestamp,
            }),
          });
          if (response.ok) {
            markAsSent(message.id);
            return { success: true };
          }
          markAsFailed(message.id);
          return { success: false };
        } catch {
          markAsFailed(message.id);
          return { success: false };
        }
      });

      const results = await Promise.all(syncPromises);
      const successfulSyncs = results.filter(r => r.success).length;
      saveLocalMessages(getLocalMessages());
      onSyncProgress?.('messages', 100);
      return { success: successfulSyncs > 0, syncedCount: successfulSyncs, conflicts: [] };
    } catch {
      return { success: false, syncedCount: 0, conflicts: [] };
    }
  };

  const syncProfile = async (): Promise<{ success: boolean; conflicts: SyncConflict[] }> => {
    return { success: false, conflicts: [] };
  };

  const syncMemories = async (): Promise<{ success: boolean; syncedCount: number }> => {
    if (!isOnline || !userId) return { success: false, syncedCount: 0 };

    try {
      const localMemories = JSON.parse(localStorage.getItem('caos_memories') || '[]');
      if (localMemories.length === 0) return { success: true, syncedCount: 0 };

      const syncPromises = localMemories.map(async (memory: Record<string, unknown>) => {
        try {
          const response = await fetch('/api/memories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, ...memory }),
          });
          return response.ok;
        } catch {
          return false;
        }
      });

      const results = await Promise.all(syncPromises);
      const successfulSyncs = results.filter(Boolean).length;
      if (successfulSyncs === localMemories.length) {
        localStorage.removeItem('caos_memories');
      }
      return { success: successfulSyncs > 0, syncedCount: successfulSyncs };
    } catch {
      return { success: false, syncedCount: 0 };
    }
  };

  const performFullSync = async () => {
    if (!isOnline) {
      return {
        success: false,
        results: {
          messages: { success: false, syncedCount: 0, conflicts: [] },
          profile: { success: false, conflicts: [] },
          memories: { success: false, syncedCount: 0 },
        },
      };
    }

    onSyncProgress?.('starting', 0);
    const messageResult = await syncMessages();
    onSyncProgress?.('messages_done', 50);
    const memoryResult = await syncMemories();
    onSyncProgress?.('memories_done', 100);

    const overallSuccess = messageResult.success || memoryResult.success;
    onSyncComplete?.(overallSuccess, messageResult.syncedCount + memoryResult.syncedCount);

    return {
      success: overallSuccess,
      results: {
        messages: messageResult,
        profile: { success: false, conflicts: [] },
        memories: memoryResult,
      },
    };
  };

  const migrateLocalData = async (_cloudUserId: string): Promise<boolean> => {
    if (!localUser?.isLocal) return false;
    clearLocalSession();
    return true;
  };

  const resolveConflict = async (_conflict: SyncConflict, _resolution: 'local' | 'remote' | 'merge'): Promise<boolean> => {
    return true;
  };

  return {
    syncMessages,
    syncProfile,
    syncMemories,
    performFullSync,
    migrateLocalData,
    resolveConflict,
  };
}
