import pytest
from unittest.mock import Mock, patch
from packages.bridge.agent.instagram_session import InstagramSession

class TestInstagramE2E:
    """Testes end-to-end para fluxo completo do Instagram"""

    @pytest.fixture
    def session(self):
        """Fixture para sessão de teste"""
        return InstagramSession("test_user")

    @patch('packages.bridge.agent.instagram_session.Instagrapi')
    def test_complete_flow_login_sync_categorize(self, mock_instagrapi, session):
        """Testar fluxo completo: login → sync → categorização"""
        # Mock do cliente
        mock_client = Mock()
        mock_client.login.return_value = True
        mock_client.get_settings.return_value = {
            'account': {'id': '123', 'username': 'testuser'}
        }
        mock_client.get_saved_medias.return_value = [
            {
                'id': '1',
                'media_type': 'photo',
                'permalink': 'https://instagram.com/p/abc123',
                'caption': 'Beautiful anime artwork #anime #art',
                'thumbnail_url': 'thumb1.jpg'
            },
            {
                'id': '2',
                'media_type': 'video',
                'permalink': 'https://instagram.com/p/def456',
                'caption': 'Gaming session highlights #gaming #esports',
                'thumbnail_url': 'thumb2.jpg'
            }
        ]
        mock_instagrapi.return_value = mock_client

        # 1. Login
        login_result = session.login("testuser", "password")
        assert login_result['success'] is True
        assert session.client is not None

        # 2. Sync posts
        saved_posts = session.get_saved_posts(limit=10)
        assert len(saved_posts) == 2

        # 3. Categorização automática (simulada)
        categorized_posts = []
        for post in saved_posts:
            category = 'anime' if 'anime' in post.get('caption', '').lower() else 'gaming'
            categorized_posts.append({
                **post,
                'category': category
            })

        assert len(categorized_posts) == 2
        assert categorized_posts[0]['category'] == 'anime'
        assert categorized_posts[1]['category'] == 'gaming'

    @patch('packages.bridge.agent.instagram_session.Instagrapi')
    def test_error_handling_flow(self, mock_instagrapi, session):
        """Testar tratamento de erros no fluxo"""
        # Mock que falha no login
        mock_client = Mock()
        mock_client.login.side_effect = Exception("Invalid credentials")
        mock_instagrapi.return_value = mock_client

        # Login deve falhar
        login_result = session.login("wronguser", "wrongpass")
        assert login_result['success'] is False
        assert 'error' in login_result

        # Sync deve falhar sem sessão
        with pytest.raises(Exception):
            session.get_saved_posts()

    @patch('packages.bridge.agent.instagram_session.Instagrapi')
    @patch('builtins.open', new_callable=Mock)
    def test_session_persistence_flow(self, mock_open, mock_instagrapi, session):
        """Testar persistência de sessão entre operações"""
        # Setup mocks
        mock_client = Mock()
        mock_client.login.return_value = True
        mock_client.get_settings.return_value = {
            'account': {'id': '123', 'username': 'testuser'},
            'session_id': 'persistent_session'
        }
        mock_client.get_saved_medias.return_value = [{'id': '1', 'caption': 'test'}]
        mock_instagrapi.return_value = mock_client

        # Mock file operations
        mock_file = Mock()
        mock_open.return_value.__enter__.return_value = mock_file

        # 1. Login e salvar sessão
        login_result = session.login("testuser", "password")
        assert login_result['success'] is True

        session.save_session()

        # Verificar se sessão foi salva
        mock_file.write.assert_called_once()

        # 2. Simular nova instância e restaurar
        new_session = InstagramSession("test_user")
        new_session.client = Mock()  # Simular cliente já criado

        # 3. Sync deve funcionar
        posts = session.get_saved_posts()
        assert len(posts) == 1

if __name__ == "__main__":
    pytest.main([__file__])