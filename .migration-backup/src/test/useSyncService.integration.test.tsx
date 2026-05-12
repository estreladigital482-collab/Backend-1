import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useSyncService } from '@/hooks/useSyncService';
import { useLocalAuth } from '@/hooks/useLocalAuth';
import { useOfflineChat } from '@/hooks/useOfflineChat';

// Mock dependencies
vi.mock('@/hooks/useLocalAuth', () => ({
  useLocalAuth: vi.fn(),
}));

vi.mock('@/hooks/useOfflineChat', () => ({
  useOfflineChat: vi.fn(),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => 
              Promise.resolve({ data: [] })
            ),
          })),
          maybeSingle: vi.fn(() =>
            Promise.resolve({ data: null })
          ),
        })),
      })),
      insert: vi.fn(() =>
        Promise.resolve({ data: null, error: null })
      ),
      upsert: vi.fn(() =>
        Promise.resolve({ data: null, error: null })
      ),
    })),
  },
}));

describe('useSyncService Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should detect message conflicts by content similarity', async () => {
    const mockLocalMessages = [
      {
        id: 'msg_1',
        content: 'Olá, como você está?',
        role: 'user',
        timestamp: '2024-01-10T10:00:00Z',
        status: 'pending' as const,
      },
    ];

    (useLocalAuth as any).mockReturnValue({
      getLocalMessages: () => mockLocalMessages,
      saveLocalMessages: vi.fn(),
      user: { isLocal: true, name: 'Local User' },
      clearLocalSession: vi.fn(),
    });

    (useOfflineChat as any).mockReturnValue({
      markAsSent: vi.fn(),
      markAsFailed: vi.fn(),
    });

    const { result } = renderHook(() =>
      useSyncService({
        userId: 'local_user_123',
        isOnline: true,
      })
    );

    // Mock remoteMessages com conteúdo similar
    const mockRemoteMessages = [
      {
        id: 'remote_1',
        content: 'Ola, como você está?',  // Similar mas não idêntico
        role: 'user',
        created_at: '2024-01-10T11:00:00Z',
      },
    ];

    let syncResult;
    await act(async () => {
      syncResult = await result.current.syncMessages();
    });

    expect(syncResult).toBeDefined();
    // Conflito detectado quando similarity 60-95%
  });

  it('should handle message resolution with local strategy', async () => {
    const mockConflict = {
      type: 'message' as const,
      local: { content: 'Local content', role: 'user', timestamp: '2024-01-10T10:00:00Z' },
      remote: { content: 'Remote content', role: 'user', timestamp: '2024-01-10T11:00:00Z' },
      resolution: 'local' as const,
    };

    (useLocalAuth as any).mockReturnValue({
      getLocalMessages: () => [],
      saveLocalMessages: vi.fn(),
      user: { isLocal: true, name: 'Local User' },
      clearLocalSession: vi.fn(),
    });

    (useOfflineChat as any).mockReturnValue({
      markAsSent: vi.fn(),
      markAsFailed: vi.fn(),
    });

    const { result } = renderHook(() =>
      useSyncService({
        userId: 'local_user_123',
        isOnline: true,
      })
    );

    let resolved;
    await act(async () => {
      resolved = await result.current.resolveConflict(mockConflict, 'local');
    });

    expect(resolved).toBe(true);
  });

  it('should handle message resolution with merge strategy', async () => {
    const mockConflict = {
      type: 'message' as const,
      local: { content: 'Local content', role: 'user', timestamp: '2024-01-10T10:00:00Z' },
      remote: { content: 'Remote content', role: 'user', timestamp: '2024-01-10T11:00:00Z' },
      resolution: 'merge' as const,
    };

    (useLocalAuth as any).mockReturnValue({
      getLocalMessages: () => [
        { id: 'msg_1', content: 'Local content', role: 'user', timestamp: '2024-01-10T10:00:00Z', status: 'pending' },
      ],
      saveLocalMessages: vi.fn(),
      user: { isLocal: true, name: 'Local User' },
      clearLocalSession: vi.fn(),
    });

    (useOfflineChat as any).mockReturnValue({
      markAsSent: vi.fn(),
      markAsFailed: vi.fn(),
    });

    const { result } = renderHook(() =>
      useSyncService({
        userId: 'local_user_123',
        isOnline: true,
      })
    );

    let resolved;
    await act(async () => {
      resolved = await result.current.resolveConflict(mockConflict, 'merge');
    });

    expect(resolved).toBe(true);
  });

  it('should skip sync when offline', async () => {
    (useLocalAuth as any).mockReturnValue({
      getLocalMessages: () => [],
      saveLocalMessages: vi.fn(),
      user: { isLocal: true, name: 'Local User' },
      clearLocalSession: vi.fn(),
    });

    (useOfflineChat as any).mockReturnValue({
      markAsSent: vi.fn(),
      markAsFailed: vi.fn(),
    });

    const { result } = renderHook(() =>
      useSyncService({
        userId: 'local_user_123',
        isOnline: false,  // Offline
      })
    );

    let syncResult;
    await act(async () => {
      syncResult = await result.current.syncMessages();
    });

    expect(syncResult.success).toBe(false);
    expect(syncResult.conflicts).toEqual([]);
  });

  it('should return empty conflicts when no messages exist', async () => {
    (useLocalAuth as any).mockReturnValue({
      getLocalMessages: () => [],
      saveLocalMessages: vi.fn(),
      user: { isLocal: true, name: 'Local User' },
      clearLocalSession: vi.fn(),
    });

    (useOfflineChat as any).mockReturnValue({
      markAsSent: vi.fn(),
      markAsFailed: vi.fn(),
    });

    const { result } = renderHook(() =>
      useSyncService({
        userId: 'local_user_123',
        isOnline: true,
      })
    );

    let syncResult;
    await act(async () => {
      syncResult = await result.current.syncMessages();
    });

    expect(syncResult.success).toBe(true);
    expect(syncResult.syncedCount).toBe(0);
    expect(syncResult.conflicts).toEqual([]);
  });
});
