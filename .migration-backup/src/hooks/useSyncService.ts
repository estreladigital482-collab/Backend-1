import { useLocalAuth } from './useLocalAuth';
import { useOfflineChat } from './useOfflineChat';
import { supabase } from '@/integrations/supabase/client';

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

// Função auxiliar para importar getApiBase
const getApiBase = () => {
  if (typeof window === 'undefined') return '';
  const port = import.meta.env.VITE_API_PORT || '3000';
  const host = window.location.hostname;
  const protocol = window.location.protocol;
  return `${protocol}//${host}:${port}`;
};

// Função para detectar conflitos de conteúdo
const detectMessageConflict = (local: Record<string, unknown>, remote: Record<string, unknown>): boolean => {
  // Dois objetos são conflitantes se têm timestamps diferentes mas conteúdo similar
  const localContent = JSON.stringify(local).toLowerCase();
  const remoteContent = JSON.stringify(remote).toLowerCase();
  const similarity = calculateStringSimilarity(localContent, remoteContent);
  return similarity > 0.6 && similarity < 0.95; // Similar mas não idêntico
};

// Função auxiliar para calcular similaridade de strings
const calculateStringSimilarity = (a: string, b: string): number => {
  const longer = a.length > b.length ? a : b;
  const shorter = a.length > b.length ? b : a;

  if (longer.length === 0) return 1.0;

  const editDistance = getEditDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
};

// Implementação de Levenshtein distance
const getEditDistance = (s1: string, s2: string): number => {
  const costs = [];
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        let newValue = costs[j - 1];
        if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
          newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }
  return costs[s2.length];
};

export function useSyncService({
  userId,
  isOnline,
  onSyncComplete,
  onSyncProgress
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

      const { data: remoteMessages = [] } = await supabase
        .from('chat_messages')
        .select('id, content, created_at, role')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .limit(200);

      const conflicts: SyncConflict[] = [];
      const messagesToSync: typeof pendingMessages = [];

      for (const localMsg of pendingMessages) {
        const remoteMatch = remoteMessages.find(
          (remote) => remote.content === localMsg.content && remote.created_at === localMsg.timestamp,
        );

        if (remoteMatch) {
          // Mensagem já existe remotamente
          markAsSent(localMsg.id);
        } else {
          // Verificar se há conflito (conteúdo similar mas timestamps diferentes)
          const potentialConflict = remoteMessages.find(
            remote => detectMessageConflict(
              { content: localMsg.content, role: localMsg.role },
              { content: remote.content, role: remote.role }
            )
          );

          if (potentialConflict) {
            conflicts.push({
              type: 'message',
              local: { content: localMsg.content, role: localMsg.role, timestamp: localMsg.timestamp },
              remote: { content: potentialConflict.content, role: potentialConflict.role, timestamp: potentialConflict.created_at },
              resolution: 'manual'
            });
          } else {
            messagesToSync.push(localMsg);
          }
        }
      }

      onSyncProgress?.('messages', 50);

      const syncPromises = messagesToSync.map(async (message, index) => {
        try {
          const { error } = await supabase.from('chat_messages').insert({
            user_id: userId,
            role: message.role || 'user',
            content: message.content,
            created_at: message.timestamp,
          });

          if (!error) {
            markAsSent(message.id);
            onSyncProgress?.('messages', 50 + (index / Math.max(messagesToSync.length, 1)) * 50);
            return { success: true, id: message.id };
          }

          markAsFailed(message.id);
          return { success: false, id: message.id };
        } catch (error) {
          markAsFailed(message.id);
          return { success: false, id: message.id };
        }
      });

      const results = await Promise.all(syncPromises);
      const successfulSyncs = results.filter(r => r.success).length;
      saveLocalMessages(getLocalMessages());

      onSyncProgress?.('messages', 100);
      return { success: successfulSyncs > 0, syncedCount: successfulSyncs, conflicts };
    } catch (error) {
      console.error('Erro na sincronização de mensagens:', error);
      return { success: false, syncedCount: 0, conflicts: [] };
    }
  };

  const syncProfile = async (): Promise<{ success: boolean; conflicts: SyncConflict[] }> => {
    if (!isOnline || !userId || !localUser?.isLocal) {
      return { success: false, conflicts: [] };
    }

    try {
      onSyncProgress?.('profile', 0);

      const { data: remoteProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id, ai_name, voice_id, onboarded')
        .eq('id', userId)
        .maybeSingle();

      const conflicts: SyncConflict[] = [];

      if (profileError) {
        console.error('Erro ao buscar perfil remoto:', profileError);
        return { success: false, conflicts };
      }

      if (remoteProfile) {
        if (remoteProfile.ai_name !== localUser.name) {
          conflicts.push({
            type: 'profile',
            local: { ai_name: localUser.name },
            remote: { ai_name: remoteProfile.ai_name },
            resolution: 'merge'
          });

          await supabase
            .from('profiles')
            .update({ ai_name: localUser.name, voice_id: remoteProfile.voice_id ?? 'pt-female' })
            .eq('id', userId);
        }
      } else {
        const { error: insertError } = await supabase.from('profiles').insert({
          id: userId,
          ai_name: localUser.name,
          voice_id: 'pt-female',
          onboarded: true,
        });

        if (insertError) {
          console.error('Erro ao criar perfil remoto:', insertError);
          return { success: false, conflicts };
        }
      }

      onSyncProgress?.('profile', 100);
      return { success: true, conflicts };
    } catch (error) {
      console.error('Erro na sincronização do perfil:', error);
      return { success: false, conflicts: [] };
    }
  };

  const migrateLocalData = async (cloudUserId: string): Promise<boolean> => {
    if (!localUser?.isLocal || !cloudUserId) {
      return false;
    }

    try {
      const localMessages = getLocalMessages();
      for (const msg of localMessages) {
        const { error } = await supabase.from('chat_messages').insert({
          user_id: cloudUserId,
          role: 'user',
          content: msg.content,
          created_at: msg.timestamp || new Date().toISOString(),
        });

        if (error) {
          console.warn('Falha ao migrar mensagem local:', error);
        }
      }

      const { error: profileError } = await supabase.from('profiles').upsert({
        id: cloudUserId,
        ai_name: localUser.name,
        voice_id: 'pt-female',
        onboarded: true,
      });

      if (profileError) {
        console.warn('Falha ao migrar perfil local:', profileError);
      }

      const localMemories = JSON.parse(localStorage.getItem('aura_sphere_memories') || '[]') as Array<Record<string, unknown>>;
      for (const memory of localMemories) {
        try {
          await fetch(`${getApiBase()}/api/v1/memories`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: cloudUserId,
              content: memory.content,
              category: memory.category,
              tags: memory.tags,
              timestamp: memory.timestamp,
              source: 'local_migration',
            }),
          });
        } catch (error) {
          console.warn('Falha ao migrar memória local:', error);
        }
      }

      localStorage.removeItem('aura_sphere_memories');
      clearLocalSession();
      return true;
    } catch (error) {
      console.error('Erro na migração de dados locais:', error);
      return false;
    }
  };

  const syncMemories = async (): Promise<{ success: boolean; syncedCount: number }> => {
    if (!isOnline || !userId) return { success: false, syncedCount: 0 };

    try {
      onSyncProgress?.('memories', 0);

      // Buscar memórias locais (simulado)
      const localMemories = JSON.parse(localStorage.getItem('aura_sphere_memories') || '[]');

      if (localMemories.length === 0) {
        onSyncProgress?.('memories', 100);
        return { success: true, syncedCount: 0 };
      }

      // Sincronizar memórias com backend
      const syncPromises = localMemories.map(async (memory: Record<string, unknown>) => {
        try {
          const response = await fetch(`${getApiBase()}/api/v1/memories`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId,
              content: memory.content,
              category: memory.category,
              tags: memory.tags,
              timestamp: memory.timestamp,
              source: 'offline_sync',
            }),
          });
          return response.ok;
        } catch (error) {
          return false;
        }
      });

      const results = await Promise.all(syncPromises);
      const successfulSyncs = results.filter(Boolean).length;

      // Limpar memórias sincronizadas
      if (successfulSyncs === localMemories.length) {
        localStorage.removeItem('aura_sphere_memories');
      }

      onSyncProgress?.('memories', 100);
      return { success: successfulSyncs > 0, syncedCount: successfulSyncs };

    } catch (error) {
      console.error('Erro na sincronização de memórias:', error);
      return { success: false, syncedCount: 0 };
    }
  };

  const performFullSync = async (): Promise<{
    success: boolean;
    results: {
      messages: { success: boolean; syncedCount: number; conflicts: SyncConflict[] };
      profile: { success: boolean; conflicts: SyncConflict[] };
      memories: { success: boolean; syncedCount: number };
    }
  }> => {
    if (!isOnline) return {
      success: false,
      results: {
        messages: { success: false, syncedCount: 0, conflicts: [] },
        profile: { success: false, conflicts: [] },
        memories: { success: false, syncedCount: 0 }
      }
    };

    try {
      onSyncProgress?.('starting', 0);

      const messageResult = await syncMessages();
      onSyncProgress?.('messages_done', 33);

      const profileResult = await syncProfile();
      onSyncProgress?.('profile_done', 66);

      const memoryResult = await syncMemories();
      onSyncProgress?.('memories_done', 100);

      const overallSuccess = messageResult.success || profileResult.success || memoryResult.success;
      const totalSynced = messageResult.syncedCount + memoryResult.syncedCount;

      onSyncComplete?.(overallSuccess, totalSynced);

      return {
        success: overallSuccess,
        results: {
          messages: messageResult,
          profile: profileResult,
          memories: memoryResult
        }
      };

    } catch (error) {
      console.error('Erro na sincronização completa:', error);
      onSyncComplete?.(false, 0);
      return {
        success: false,
        results: {
          messages: { success: false, syncedCount: 0, conflicts: [] },
          profile: { success: false, conflicts: [] },
          memories: { success: false, syncedCount: 0 }
        }
      };
    }
  };

  const resolveConflict = async (conflict: SyncConflict, resolution: 'local' | 'remote' | 'merge'): Promise<boolean> => {
    if (!isOnline || !userId) return false;

    try {
      switch (resolution) {
        case 'local':
          // Manter versão local - inserir remotamente
          if (conflict.type === 'message') {
            const { error } = await supabase.from('chat_messages').insert({
              user_id: userId,
              role: (conflict.local.role as string) || 'user',
              content: conflict.local.content as string,
              created_at: conflict.local.timestamp as string,
            });
            return !error;
          }
          break;

        case 'remote':
          // Sobrescrever local com versão remota
          if (conflict.type === 'message') {
            const localMessages = getLocalMessages();
            const filtered = localMessages.filter(
              msg => msg.content !== (conflict.local.content as string)
            );
            saveLocalMessages(filtered);
            return true;
          }
          break;

        case 'merge':
          // Tentar mesclar ambas as versões
          if (conflict.type === 'message') {
            // Criar versão mesclada
            const localContent = conflict.local.content as string;
            const remoteContent = conflict.remote.content as string;
            const mergedContent = `${remoteContent}\n\n[Complemento local]\n${localContent}`;

            const { error } = await supabase.from('chat_messages').insert({
              user_id: userId,
              role: (conflict.local.role as string) || 'user',
              content: mergedContent,
              created_at: conflict.local.timestamp as string,
            });

            if (!error) {
              // Atualizar local com versão mesclada
              const localMessages = getLocalMessages();
              const updated = localMessages.map(msg =>
                msg.content === localContent
                  ? { ...msg, content: mergedContent }
                  : msg
              );
              saveLocalMessages(updated);
              return true;
            }
          }
          break;
      }

      return true;
    } catch (error) {
      console.error('Erro na resolução de conflito:', error);
      return false;
    }
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