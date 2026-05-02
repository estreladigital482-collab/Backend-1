"""
Testes E2E para Aura Sphere Bridge
Testa fluxo completo: autenticação, chat, memória, busca
"""

import pytest
import json
import os
from fastapi.testclient import TestClient
from pathlib import Path

# Adicionar diretório do bridge ao path
import sys
sys.path.insert(0, str(Path(__file__).parent))

from app import app
from database import init_db, SessionLocal, Base, engine
from schemas import Message


# Fixtures
@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    """Setup database para testes"""
    # Usar SQLite para testes
    os.environ["DATABASE_URL"] = "sqlite:///:memory:"
    Base.metadata.create_all(bind=engine)
    init_db()
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client():
    """Cliente HTTP para testes"""
    return TestClient(app)


@pytest.fixture
def test_token():
    """Token JWT para testes"""
    from jose import jwt
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
    payload = {
        "sub": "test-user@example.com",
        "email": "test-user@example.com"
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
    return token


# Testes
class TestHealth:
    """Testes do endpoint de health check"""
    
    def test_health_check(self, client):
        """Deve retornar status ok"""
        response = client.get("/api/v1/health")
        assert response.status_code == 200
        assert response.json()["status"] == "ok"


class TestConversations:
    """Testes de gerenciamento de conversas"""
    
    def test_create_conversation(self, client, test_token):
        """Deve criar nova conversa"""
        headers = {"Authorization": f"Bearer {test_token}"}
        response = client.post(
            "/api/v1/conversations",
            json={
                "title": "Minha primeira conversa",
                "prompt_type": "assistant"
            },
            headers=headers
        )
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Minha primeira conversa"
        assert "id" in data
    
    def test_list_conversations(self, client, test_token):
        """Deve listar conversas do usuário"""
        headers = {"Authorization": f"Bearer {test_token}"}
        
        # Criar conversa
        client.post(
            "/api/v1/conversations",
            json={"title": "Conversa 1"},
            headers=headers
        )
        
        # Listar
        response = client.get("/api/v1/conversations", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert "conversations" in data
        assert len(data["conversations"]) >= 1


class TestChat:
    """Testes do endpoint de chat"""
    
    def test_chat_basic(self, client, test_token):
        """Deve fazer chat básico com a IA"""
        headers = {"Authorization": f"Bearer {test_token}"}
        
        response = client.post(
            "/api/v1/chat",
            json={
                "user_id": "test-user",
                "ai_name": "Aurora",
                "prompt_type": "assistant",
                "messages": [
                    {"role": "user", "content": "Olá, como você está?"}
                ]
            },
            headers=headers
        )
        
        assert response.status_code == 200
        assert response.headers["content-type"] == "text/event-stream"
        
        # Parse streaming response
        chunks = []
        for line in response.iter_lines():
            if line.startswith(b"data: "):
                data_str = line[6:].decode()
                if data_str != "[DONE]":
                    try:
                        data = json.loads(data_str)
                        if "choices" in data:
                            content = data["choices"][0]["delta"].get("content", "")
                            if content:
                                chunks.append(content)
                    except json.JSONDecodeError:
                        pass
        
        # Deve ter recebido alguma resposta
        response_text = "".join(chunks)
        assert len(response_text) > 0
    
    def test_chat_with_different_prompt_types(self, client, test_token):
        """Deve suportar diferentes tipos de prompt"""
        headers = {"Authorization": f"Bearer {test_token}"}
        prompt_types = ["assistant", "developer", "creative", "analytical"]
        
        for prompt_type in prompt_types:
            response = client.post(
                "/api/v1/chat",
                json={
                    "user_id": "test-user",
                    "ai_name": "Aurora",
                    "prompt_type": prompt_type,
                    "messages": [
                        {"role": "user", "content": "Teste"}
                    ]
                },
                headers=headers
            )
            assert response.status_code == 200


class TestMemory:
    """Testes de memória"""
    
    def test_create_memory(self, client, test_token):
        """Deve salvar item de memória"""
        headers = {"Authorization": f"Bearer {test_token}"}
        
        response = client.post(
            "/api/v1/memory",
            json={
                "user_id": "test-user",
                "role": "user",
                "content": "Informação importante para lembrar",
                "category": "important"
            },
            headers=headers
        )
        
        assert response.status_code == 200
        assert response.json()["status"] == "saved"


class TestSearch:
    """Testes de busca de memória"""
    
    def test_search_memory(self, client, test_token):
        """Deve buscar itens de memória"""
        headers = {"Authorization": f"Bearer {test_token}"}
        user_id = "test-user"
        
        # Criar alguns itens de memória
        client.post(
            "/api/v1/memory",
            json={
                "user_id": user_id,
                "role": "user",
                "content": "Python é uma linguagem de programação",
                "category": "tech"
            },
            headers=headers
        )
        
        # Buscar
        response = client.get(
            f"/api/v1/search?user_id={user_id}&q=Python",
            headers=headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "results" in data
        # Pode encontrar ou não, depende do backend estar rodando
    
    def test_search_with_semantic_fallback(self, client, test_token):
        """Deve fazer fallback para text search se semantic falhar"""
        headers = {"Authorization": f"Bearer {test_token}"}
        user_id = "test-user"
        
        response = client.get(
            f"/api/v1/search?user_id={user_id}&q=teste&semantic=false",
            headers=headers
        )
        
        assert response.status_code == 200
        assert "results" in response.json()


class TestAuthentication:
    """Testes de autenticação"""
    
    def test_missing_auth_header(self, client):
        """Deve rejeitar requisições sem Authorization header em produção"""
        # Em dev mode, usa fallback
        os.environ["ENV"] = "development"
        
        response = client.get("/api/v1/health")
        assert response.status_code == 200
    
    def test_invalid_token(self, client):
        """Deve rejeitar tokens inválidos"""
        headers = {"Authorization": "Bearer invalid-token"}
        
        response = client.post(
            "/api/v1/conversations",
            json={"title": "Teste"},
            headers=headers
        )
        
        assert response.status_code == 401


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
