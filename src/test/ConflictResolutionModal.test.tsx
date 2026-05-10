import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ConflictResolutionModal } from '@/components/ConflictResolutionModal';

describe('ConflictResolutionModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockConflicts = [
    {
      id: 'conflict_1',
      type: 'message' as const,
      localVersion: { content: 'Local message content', role: 'user' },
      remoteVersion: { content: 'Remote message content', role: 'user' },
      localTimestamp: '2024-01-10T10:00:00Z',
      remoteTimestamp: '2024-01-10T11:00:00Z',
    },
  ];

  it('should render modal when isOpen is true', () => {
    render(
      <ConflictResolutionModal
        isOpen={true}
        conflicts={mockConflicts}
        onResolve={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(screen.getByText(/Resolver Conflitos de Sincronização/)).toBeInTheDocument();
    expect(screen.getByText(/1 conflito detectado/)).toBeInTheDocument();
  });

  it('should not render modal when isOpen is false', () => {
    const { container } = render(
      <ConflictResolutionModal
        isOpen={false}
        conflicts={mockConflicts}
        onResolve={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument();
  });

  it('should expand conflict item when clicked', async () => {
    render(
      <ConflictResolutionModal
        isOpen={true}
        conflicts={mockConflicts}
        onResolve={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    const conflictHeader = screen.getByText(/message/i).closest('button');
    if (conflictHeader) {
      fireEvent.click(conflictHeader);

      await waitFor(() => {
        expect(screen.getByText('Versão Local')).toBeInTheDocument();
        expect(screen.getByText('Versão Remota')).toBeInTheDocument();
      });
    }
  });

  it('should handle local resolution', async () => {
    const onResolve = vi.fn();
    render(
      <ConflictResolutionModal
        isOpen={true}
        conflicts={mockConflicts}
        onResolve={onResolve}
        onCancel={vi.fn()}
      />
    );

    const conflictHeader = screen.getByText(/message/i).closest('button');
    if (conflictHeader) {
      fireEvent.click(conflictHeader);

      await waitFor(() => {
        const useLocalButton = screen.getAllByText(/Usar Local/)[0];
        fireEvent.click(useLocalButton);
      });

      await waitFor(() => {
        const applyButton = screen.getByText(/Aplicar Resoluções/);
        expect(applyButton).not.toBeDisabled();
      });
    }
  });

  it('should disable apply button when not all conflicts are resolved', () => {
    const onResolve = vi.fn();
    render(
      <ConflictResolutionModal
        isOpen={true}
        conflicts={mockConflicts}
        onResolve={onResolve}
        onCancel={vi.fn()}
      />
    );

    const applyButton = screen.getByText(/Aplicar Resoluções/);
    expect(applyButton).toBeDisabled();
  });

  it('should call onCancel when cancel button is clicked', () => {
    const onCancel = vi.fn();
    render(
      <ConflictResolutionModal
        isOpen={true}
        conflicts={mockConflicts}
        onResolve={vi.fn()}
        onCancel={onCancel}
      />
    );

    const cancelButton = screen.getByText(/Cancelar/);
    fireEvent.click(cancelButton);

    expect(onCancel).toHaveBeenCalled();
  });

  it('should display multiple conflicts', () => {
    const multipleConflicts = [
      ...mockConflicts,
      {
        id: 'conflict_2',
        type: 'profile' as const,
        localVersion: { ai_name: 'Local Name' },
        remoteVersion: { ai_name: 'Remote Name' },
        localTimestamp: '2024-01-10T10:00:00Z',
        remoteTimestamp: '2024-01-10T11:00:00Z',
      },
    ];

    render(
      <ConflictResolutionModal
        isOpen={true}
        conflicts={multipleConflicts}
        onResolve={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(screen.getByText(/2 conflitos detectados/)).toBeInTheDocument();
  });

  it('should disable buttons during sync', () => {
    const onCancel = vi.fn();
    const onResolve = vi.fn();
    
    const { rerender } = render(
      <ConflictResolutionModal
        isOpen={true}
        conflicts={mockConflicts}
        onResolve={onResolve}
        onCancel={onCancel}
        isSyncing={false}
      />
    );

    const cancelButton = screen.getByText(/Cancelar/);
    expect(cancelButton).not.toBeDisabled();

    rerender(
      <ConflictResolutionModal
        isOpen={true}
        conflicts={mockConflicts}
        onResolve={onResolve}
        onCancel={onCancel}
        isSyncing={true}
      />
    );

    expect(cancelButton).toBeDisabled();
  });
});
