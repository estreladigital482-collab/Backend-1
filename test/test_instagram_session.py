import pytest
from unittest.mock import Mock, patch
from packages.bridge.agent.instagram_session import InstagramSession

class TestInstagramSession:
    """Testes para InstagramSession management"""

    @pytest.fixture
    def session(self):
        """Fixture para criar uma sessão de teste"""
        return InstagramSession("test_user")

    @patch('packages.bridge.agent.instagram_session.Instagrapi')
    def test_login_success(self, mock_instagrapi, session):
        """Testar login bem-sucedido"""
        # Mock do cliente instagrapi
        mock_client = Mock()
        mock_client.login.return_value = True
        mock_client.get_settings.return_value = {'account': {'id': '123', 'username': 'testuser'}}
        mock_instagrapi.return_value = mock_client

        result = session.login("testuser", "password")

        assert result['success'] is True
        assert result['account']['id'] == '123'
        mock_client.login.assert_called_once_with("testuser", "password")

    @patch('packages.bridge.agent.instagram_session.Instagrapi')
    def test_login_requires_2fa(self, mock_instagrapi, session):
        """Testar login que requer 2FA"""
        mock_client = Mock()
        mock_client.login.side_effect = Exception("checkpoint_required")
        mock_instagrapi.return_value = mock_client

        result = session.login("testuser", "password")

        assert result['success'] is False
        assert result['requires_2fa'] is True

    @patch('packages.bridge.agent.instagram_session.Instagrapi')
    def test_login_with_2fa(self, mock_instagrapi, session):
        """Testar login com código 2FA"""
        mock_client = Mock()
        mock_client.login.return_value = True
        mock_client.get_settings.return_value = {'account': {'id': '123', 'username': 'testuser'}}
        mock_instagrapi.return_value = mock_client

        result = session.login("testuser", "password", "123456")

        assert result['success'] is True
        mock_client.login.assert_called_once_with("testuser", "password", verification_code="123456")

    @patch('packages.bridge.agent.instagram_session.Instagrapi')
    @patch('os.path.exists')
    @patch('builtins.open', new_callable=Mock)
    def test_restore_session_success(self, mock_open, mock_exists, mock_instagrapi, session):
        """Testar restauração de sessão salva"""
        mock_exists.return_value = True
        mock_client = Mock()
        mock_client.login_by_sessionid.return_value = True
        mock_instagrapi.return_value = mock_client

        # Mock file read
        mock_file = Mock()
        mock_file.read.return_value = '{"session_id": "test_session"}'
        mock_open.return_value.__enter__.return_value = mock_file

        result = session.restore_session()

        assert result is True
        mock_client.login_by_sessionid.assert_called_once_with("test_session")

    @patch('packages.bridge.agent.instagram_session.Instagrapi')
    def test_get_saved_posts(self, mock_instagrapi, session):
        """Testar obtenção de posts salvos"""
        mock_client = Mock()
        mock_client.get_saved_medias.return_value = [
            {'id': '1', 'media_type': 'photo', 'permalink': 'url1'},
            {'id': '2', 'media_type': 'video', 'permalink': 'url2'}
        ]
        mock_instagrapi.return_value = mock_client

        # Simular sessão ativa
        session.client = mock_client

        posts = session.get_saved_posts(limit=10)

        assert len(posts) == 2
        assert posts[0]['id'] == '1'
        mock_client.get_saved_medias.assert_called_once_with(amount=10)

    def test_get_saved_posts_no_session(self, session):
        """Testar erro quando não há sessão ativa"""
        with pytest.raises(Exception):
            session.get_saved_posts()

    @patch('packages.bridge.agent.instagram_session.Instagrapi')
    @patch('builtins.open', new_callable=Mock)
    def test_save_session(self, mock_open, mock_instagrapi, session):
        """Testar salvamento de sessão"""
        mock_client = Mock()
        mock_client.get_settings.return_value = {'session_id': 'test_session'}
        mock_instagrapi.return_value = mock_client

        session.client = mock_client
        session.save_session()

        # Verificar se arquivo foi escrito
        mock_open.assert_called_once()
        mock_file = mock_open.return_value.__enter__.return_value
        mock_file.write.assert_called_once()

if __name__ == "__main__":
    pytest.main([__file__])