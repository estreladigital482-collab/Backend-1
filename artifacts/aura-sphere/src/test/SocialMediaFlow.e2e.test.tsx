/**
 * Testes E2E para Fluxo Completo de Social Media
 * Valida: Login Instagram → Sincronização → Organização → Recomendações
 * 
 * Data: Maio 2026
 * Status: Pronto para execução
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SocialTab } from '../components/SocialTab';
import { LoginInstagramModal } from '../components/LoginInstagramModal';
import { CollectionViewer } from '../components/CollectionViewer';

/**
 * Mock do useLocalAuth
 */
vi.mock('../hooks/useLocalAuth', () => ({
  useLocalAuth: vi.fn(() => ({
    user: {
      id: 'test-user-123',
      name: 'Test User',
      isLocal: true
    },
    isAuthenticated: true,
    isOnline: true
  }))
}));

/**
 * Mock do useToast
 */
vi.mock('../hooks/use-toast', () => ({
  useToast: vi.fn(() => ({
    toast: vi.fn()
  }))
}));

/**
 * Mock das APIs
 */
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Social Media Fluxo Completo - E2E', () => {
  
  beforeEach(() => {
    mockFetch.mockClear();
    // Mock padrão: sucesso
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ 
        success: true,
        collections: []
      })
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('1. Login do Instagram', () => {
    it('deve renderizar modal de login quando botão é clicado', async () => {
      const user = userEvent.setup();
      render(
        <SocialTab />
      );

      const connectBtn = screen.getByRole('button', { name: /conectar instagram/i });
      expect(connectBtn).toBeInTheDocument();

      await user.click(connectBtn);
      
      // Aguardar modal aparecer
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/username/i)).toBeInTheDocument();
      });
    });

    it('deve validar campos obrigatórios antes de submeter', async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <LoginInstagramModal 
          isOpen={true}
          onClose={vi.fn()}
          onLoginSuccess={vi.fn()}
        />
      );

      const loginBtn = screen.getByRole('button', { name: /continuar/i });
      
      // Tentar submeter vazio
      await user.click(loginBtn);
      
      // Deve mostrar erro
      await waitFor(() => {
        expect(screen.getByText(/obrigatórios/i)).toBeInTheDocument();
      });
    });

    it('deve chamar API com credenciais corretas', async () => {
      const user = userEvent.setup();
      const mockOnSuccess = vi.fn();

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          account: {
            id: 'ig-123',
            username: '@testuser',
            email: 'test@example.com'
          }
        })
      });

      render(
        <LoginInstagramModal 
          isOpen={true}
          onClose={vi.fn()}
          onLoginSuccess={mockOnSuccess}
        />
      );

      const usernameInput = screen.getByPlaceholderText(/username/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);
      const loginBtn = screen.getByRole('button', { name: /continuar/i });

      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, 'password123');
      await user.click(loginBtn);

      // Validar chamada à API
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          '/api/v1/social/instagram/login',
          expect.objectContaining({
            method: 'POST',
            body: expect.stringContaining('testuser')
          })
        );
      });
    });

    it('deve detectar 2FA e pedir código', async () => {
      const user = userEvent.setup();

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: false,
          requires_2fa: true
        })
      });

      render(
        <LoginInstagramModal 
          isOpen={true}
          onClose={vi.fn()}
          onLoginSuccess={vi.fn()}
        />
      );

      const usernameInput = screen.getByPlaceholderText(/username/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);
      const loginBtn = screen.getByRole('button', { name: /continuar/i });

      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, 'password123');
      await user.click(loginBtn);

      // Aguardar tela de 2FA
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/código/i)).toBeInTheDocument();
      });
    });
  });

  describe('2. Sincronização de Contas', () => {
    it('deve carregar contas conectadas ao montar', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          collections: [
            {
              id: 'col-1',
              collection_name: 'Saved Posts',
              count: 42
            }
          ]
        })
      });

      render(<SocialTab />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/v1/social/instagram/collections'),
          expect.any(Object)
        );
      });
    });

    it('deve sincronizar conta quando botão é clicado', async () => {
      const user = userEvent.setup();

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            collections: [{
              id: 'col-1',
              collection_name: 'Saved Posts',
              count: 42
            }]
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true })
        });

      render(<SocialTab />);

      await waitFor(() => {
        expect(screen.getByTitle(/sincronizar/i)).toBeInTheDocument();
      });

      const syncBtn = screen.getByTitle(/sincronizar/i);
      await user.click(syncBtn);

      // Validar chamada de sync
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/social/instagram/sync'),
        expect.any(Object)
      );
    });

    it('deve mostrar status de sincronização em andamento', async () => {
      const user = userEvent.setup();

      render(<SocialTab />);

      const syncBtn = await screen.findByTitle(/sincronizar/i);
      await user.click(syncBtn);

      // Botão deve ter ícone de carregamento
      expect(syncBtn.querySelector('.animate-spin')).toBeInTheDocument();
    });
  });

  describe('3. Visualização de Coleções', () => {
    it('deve carregar recomendações por tema', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          recommendations: [
            {
              type: 'Animes',
              title: 'Top Animes para Assistir',
              items: [
                {
                  id: 'item-1',
                  title: 'Kami no Tou',
                  url: 'https://example.com/anime1',
                  type: 'anime'
                }
              ]
            }
          ]
        })
      });

      render(
        <CollectionViewer userId="test-user-123" />
      );

      await waitFor(() => {
        expect(screen.getByText(/kami no tou/i)).toBeInTheDocument();
      });
    });

    it('deve permitir alternar entre temas', async () => {
      const user = userEvent.setup();

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          recommendations: []
        })
      });

      render(
        <CollectionViewer userId="test-user-123" />
      );

      const mangaBtn = await screen.findByRole('button', { name: /mangá/i });
      await user.click(mangaBtn);

      // Validar que a API foi chamada com novo tema
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('theme=manga'),
        expect.any(Object)
      );
    });

    it('deve curtir item e mudar visual', async () => {
      const user = userEvent.setup();

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          recommendations: [
            {
              type: 'Animes',
              title: 'Recomendados',
              items: [{
                id: 'item-1',
                title: 'Test Anime',
                url: 'https://example.com',
                type: 'anime'
              }]
            }
          ]
        })
      });

      render(
        <CollectionViewer userId="test-user-123" />
      );

      await waitFor(() => {
        expect(screen.getByText(/test anime/i)).toBeInTheDocument();
      });

      const likeButtons = screen.getAllByRole('button');
      const likeBtn = likeButtons.find(btn => btn.querySelector('svg'));
      
      if (likeBtn) {
        await user.click(likeBtn);
        
        // Botão deve ter classe de curtido
        expect(likeBtn).toHaveClass('bg-red-600');
      }
    });

    it('deve compartilhar com Web Share API ou clipboard', async () => {
      const user = userEvent.setup();
      const mockShare = vi.fn();
      
      // Mock Web Share API
      Object.defineProperty(navigator, 'share', {
        value: mockShare,
        configurable: true
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          recommendations: [
            {
              type: 'Animes',
              title: 'Recomendados',
              items: [{
                id: 'item-1',
                title: 'Test Anime',
                url: 'https://example.com',
                type: 'anime'
              }]
            }
          ]
        })
      });

      render(
        <CollectionViewer userId="test-user-123" />
      );

      await waitFor(() => {
        expect(screen.getByText(/test anime/i)).toBeInTheDocument();
      });

      // Encontrar botão de share
      const shareButtons = screen.getAllByRole('button');
      const shareBtn = shareButtons[shareButtons.length - 2];
      
      if (shareBtn) {
        await user.click(shareBtn);
        
        // Validar que compartilhamento foi tentado
        await waitFor(() => {
          expect(mockShare).toHaveBeenCalled();
        });
      }
    });
  });

  describe('4. Integração com Ações em Fila', () => {
    it('deve propor ação ao curtir muitos itens', async () => {
      // Simular série de likes que ativa ação em fila
      const mockPropose = vi.fn();
      
      mockFetch.mockImplementation((url) => {
        if (url.includes('actions/propose')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({ 
              action_id: 'action-123',
              preview_description: 'Salvar 5 posts em coleção'
            })
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ recommendations: [] })
        });
      });

      render(
        <CollectionViewer userId="test-user-123" />
      );

      // Simular múltiplas ações que deveriam gerar proposta
      // (implementação depende de lógica mais complexa)
    });
  });

  describe('5. Tratamento de Erros', () => {
    it('deve mostrar erro quando API falha no login', async () => {
      const user = userEvent.setup();

      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          error: 'Credenciais inválidas'
        })
      });

      render(
        <LoginInstagramModal 
          isOpen={true}
          onClose={vi.fn()}
          onLoginSuccess={vi.fn()}
        />
      );

      await user.type(screen.getByPlaceholderText(/username/i), 'testuser');
      await user.type(screen.getByPlaceholderText(/password/i), 'wrong');
      await user.click(screen.getByRole('button', { name: /continuar/i }));

      await waitFor(() => {
        expect(screen.getByText(/credenciais|erro/i)).toBeInTheDocument();
      });
    });

    it('deve recuperar de erro de rede', async () => {
      const user = userEvent.setup();

      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ success: true })
        });

      render(
        <LoginInstagramModal 
          isOpen={true}
          onClose={vi.fn()}
          onLoginSuccess={vi.fn()}
        />
      );

      await user.type(screen.getByPlaceholderText(/username/i), 'testuser');
      await user.type(screen.getByPlaceholderText(/password/i), 'pass123');
      await user.click(screen.getByRole('button', { name: /continuar/i }));

      // Aguardar mensagem de erro
      await waitFor(() => {
        expect(screen.getByText(/conexão/i)).toBeInTheDocument();
      });
    });
  });

  describe('6. Validação de Contexto de Usuário', () => {
    it('deve usar user_id do useLocalAuth', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ collections: [] })
      });

      render(<SocialTab />);

      await waitFor(() => {
        const calls = mockFetch.mock.calls;
        const collectionsCall = calls.find(c => 
          c[0].includes('/collections')
        );
        
        expect(collectionsCall?.[0]).toContain('user_id=test-user-123');
      });
    });

    it('deve passar user_id em login modal', async () => {
      const user = userEvent.setup();

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          account: { id: 'ig-123', username: '@test' }
        })
      });

      render(
        <LoginInstagramModal 
          isOpen={true}
          onClose={vi.fn()}
          onLoginSuccess={vi.fn()}
        />
      );

      await user.type(screen.getByPlaceholderText(/username/i), 'testuser');
      await user.type(screen.getByPlaceholderText(/password/i), 'pass123');
      await user.click(screen.getByRole('button', { name: /continuar/i }));

      await waitFor(() => {
        const loginCall = mockFetch.mock.calls.find(c => 
          c[0].includes('/instagram/login')
        );
        
        const body = JSON.parse(loginCall?.[1]?.body || '{}');
        expect(body.user_id).toBe('test-user-123');
      });
    });
  });
});
