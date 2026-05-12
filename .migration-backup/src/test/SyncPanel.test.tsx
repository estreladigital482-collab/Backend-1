import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SyncPanel } from '@/components/SyncPanel';
import { useOfflineChat } from '@/hooks/useOfflineChat';
import { useLocalAuth } from '@/hooks/useLocalAuth';

// Mock dependencies
vi.mock('@/hooks/useOfflineChat', () => ({
  useOfflineChat: vi.fn(),
}));

vi.mock('@/hooks/useLocalAuth', () => ({
  useLocalAuth: vi.fn(),
}));

describe('SyncPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display online status when connected', () => {
    (useLocalAuth as any).mockReturnValue({
      user: { isLocal: true },
    });
    (useOfflineChat as any).mockReturnValue({
      pendingCount: 0,
    });

    render(<SyncPanel userId="local_user123" isOnline={true} />);

    expect(screen.getByText('Online')).toBeInTheDocument();
  });

  it('should display offline status when disconnected', () => {
    (useLocalAuth as any).mockReturnValue({
      user: { isLocal: true },
    });
    (useOfflineChat as any).mockReturnValue({
      pendingCount: 3,
    });

    render(<SyncPanel userId="local_user123" isOnline={false} />);

    expect(screen.getByText('Offline')).toBeInTheDocument();
    expect(screen.getByText(/3 mensagens pendente/)).toBeInTheDocument();
  });

  it('should show sync button when online', () => {
    (useLocalAuth as any).mockReturnValue({
      user: { isLocal: true },
    });
    (useOfflineChat as any).mockReturnValue({
      pendingCount: 0,
    });

    render(<SyncPanel userId="local_user123" isOnline={true} />);

    const syncButton = screen.getByRole('button');
    expect(syncButton).toBeInTheDocument();
    expect(syncButton).toHaveTextContent('Sincronizar');
  });

  it('should not render panel for cloud users', () => {
    (useLocalAuth as any).mockReturnValue({
      user: { isLocal: false },
    });
    (useOfflineChat as any).mockReturnValue({
      pendingCount: 0,
    });

    const { container } = render(<SyncPanel userId="cloud_user_id" isOnline={true} />);

    expect(container.firstChild).toBeNull();
  });

  it('should show progress bar during sync', async () => {
    (useLocalAuth as any).mockReturnValue({
      user: { isLocal: true },
    });
    (useOfflineChat as any).mockReturnValue({
      pendingCount: 0,
    });

    render(<SyncPanel userId="local_user123" isOnline={true} />);

    const syncButton = screen.getByRole('button');
    fireEvent.click(syncButton);

    await waitFor(() => {
      expect(screen.getByText('Sincronizando...')).toBeInTheDocument();
    });
  });
});
