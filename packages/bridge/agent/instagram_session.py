#!/usr/bin/env python3
"""
InstagramSession - Wrapper seguro para sessões do Instagram
Gerencia autenticação e armazenamento criptografado de credenciais
"""

import os
import json
from typing import Optional, Dict, Any
from base64 import urlsafe_b64encode
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kex import ECDH
from cryptography.hazmat.primitives.kex.ec import SECP256R1
from instagrapi import Client
from instagrapi.exceptions import LoginRequired


class InstagramSession:
    """Gerenciador de sessão do Instagram com criptografia"""

    def __init__(self, user_id: str, encryption_key: Optional[str] = None):
        self.user_id = user_id
        self.client = Client()
        self.is_logged_in = False

        # Gerar ou usar chave de criptografia
        if encryption_key:
            self.encryption_key = encryption_key.encode()
        else:
            # Gerar chave baseada no user_id (determinística mas segura)
            key_material = user_id.encode() + b'instagram_session_salt'
            digest = hashes.Hash(hashes.SHA256())
            digest.update(key_material)
            raw_key = digest.finalize()
            self.encryption_key = urlsafe_b64encode(raw_key)

        self.fernet = Fernet(self.encryption_key)

    def login(self, username: str, password: str, verification_code: Optional[str] = None) -> Dict[str, Any]:
        """
        Fazer login no Instagram

        Args:
            username: Nome de usuário do Instagram
            password: Senha
            verification_code: Código 2FA se necessário

        Returns:
            Dict com status e informações da conta
        """
        try:
            # Tentar login
            if verification_code:
                self.client.login(username, password, verification_code=verification_code)
            else:
                self.client.login(username, password)

            self.is_logged_in = True

            # Obter informações da conta
            account_info = self.client.account_info()
            account_data = {
                'id': account_info.pk,
                'username': account_info.username,
                'full_name': account_info.full_name,
                'is_private': account_info.is_private,
                'media_count': account_info.media_count,
                'follower_count': account_info.follower_count,
                'following_count': account_info.following_count,
                'biography': account_info.biography,
                'profile_pic_url': account_info.profile_pic_url
            }

            # Salvar credenciais criptografadas
            self._save_encrypted_credentials(username, password)

            return {
                'success': True,
                'account': account_data,
                'requires_2fa': False
            }

        except Exception as e:
            error_message = str(e)

            # Verificar se precisa 2FA
            if 'two_factor' in error_message.lower() or 'verification' in error_message.lower():
                return {
                    'success': False,
                    'requires_2fa': True,
                    'error': 'Código de verificação necessário'
                }

            return {
                'success': False,
                'requires_2fa': False,
                'error': error_message
            }

    def logout(self) -> bool:
        """Fazer logout e limpar sessão"""
        try:
            self.client.logout()
            self.is_logged_in = False
            self._clear_credentials()
            return True
        except Exception:
            return False

    def get_saved_posts(self, limit: int = 50) -> list:
        """
        Obter posts salvos do usuário

        Args:
            limit: Número máximo de posts para buscar

        Returns:
            Lista de posts salvos
        """
        if not self.is_logged_in:
            raise LoginRequired("Usuário não está logado")

        try:
            saved_posts = []
            saved_feed = self.client.saved_medias()

            for media in saved_feed[:limit]:
                post_data = {
                    'id': media.id,
                    'media_type': media.media_type,
                    'taken_at': media.taken_at.isoformat() if media.taken_at else None,
                    'caption': media.caption_text if hasattr(media, 'caption_text') else '',
                    'like_count': media.like_count,
                    'comment_count': media.comment_count,
                    'thumbnail_url': media.thumbnail_url,
                    'media_url': media.video_url if hasattr(media, 'video_url') and media.video_url else media.image_url,
                    'user': {
                        'username': media.user.username if media.user else None,
                        'full_name': media.user.full_name if media.user else None
                    }
                }
                saved_posts.append(post_data)

            return saved_posts

        except Exception as e:
            raise Exception(f"Erro ao buscar posts salvos: {str(e)}")

    def _save_encrypted_credentials(self, username: str, password: str):
        """Salvar credenciais criptografadas"""
        credentials = {
            'username': username,
            'password': password,
            'session_data': self.client.get_settings()
        }

        encrypted_data = self.fernet.encrypt(json.dumps(credentials).encode())

        # Salvar em arquivo (em produção, usar banco de dados)
        filename = f"instagram_session_{self.user_id}.enc"
        with open(filename, 'wb') as f:
            f.write(encrypted_data)

    def _load_encrypted_credentials(self) -> Optional[Dict[str, Any]]:
        """Carregar credenciais criptografadas"""
        filename = f"instagram_session_{self.user_id}.enc"

        if not os.path.exists(filename):
            return None

        try:
            with open(filename, 'rb') as f:
                encrypted_data = f.read()

            decrypted_data = self.fernet.decrypt(encrypted_data)
            return json.loads(decrypted_data.decode())
        except Exception:
            return None

    def _clear_credentials(self):
        """Limpar credenciais salvas"""
        filename = f"instagram_session_{self.user_id}.enc"
        if os.path.exists(filename):
            os.remove(filename)

    def restore_session(self) -> bool:
        """
        Tentar restaurar sessão salva

        Returns:
            True se sessão foi restaurada com sucesso
        """
        credentials = self._load_encrypted_credentials()

        if not credentials:
            return False

        try:
            # Restaurar configurações da sessão
            self.client.set_settings(credentials['session_data'])
            self.is_logged_in = True
            return True
        except Exception:
            return False


# Exemplo de uso
if __name__ == "__main__":
    session = InstagramSession("user123")

    # Login
    result = session.login("username", "password")
    if result['success']:
        print(f"Login bem-sucedido: {result['account']['username']}")

        # Buscar posts salvos
        saved_posts = session.get_saved_posts(10)
        print(f"Encontrados {len(saved_posts)} posts salvos")

    elif result['requires_2fa']:
        print("2FA necessário - forneça código de verificação")
        # result = session.login("username", "password", "123456")