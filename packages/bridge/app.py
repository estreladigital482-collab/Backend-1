import asyncio
import json
import os
from pathlib import Path
from typing import Any
from datetime import datetime

from dotenv import load_dotenv
from fastapi import FastAPI, Header, HTTPException, Depends, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from jose import JWTError, jwt
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi.util import get_remote_address

base_dir = Path(__file__).resolve().parents[2]
load_dotenv(dotenv_path=base_dir / ".env")

from database import SessionLocal, init_db, ChatMessage, MemoryEntry, User, Conversation
from schemas import (
    ChatRequest, 
    ChatHistoryResponse, 
    MemoryItem, 
    SearchResponse, 
    SearchResult,
    ConversationCreate,
    ConversationResponse,
    ConversationListResponse
)
from packages.mempalace.memory import MemoryEngine
from llm_service import get_llm_service
from embedding_service import get_embedding_service

ENV = os.getenv("ENV", "development")
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
ALGORITHM = "HS256"
API_ORIGINS = [os.getenv("CORS_ORIGIN", "http://localhost:3000"), "http://localhost:3000"]

app = FastAPI(title="Aura-Sphere Bridge", version="0.1.0")
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=API_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

init_db()
memory_engine = MemoryEngine()


def get_current_user(authorization: str | None = Header(None)) -> dict[str, Any]:
    if not authorization:
        if ENV != "production":
            return {"sub": "dev-user", "email": "dev@local", "name": "Developer"}
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing Authorization header")

    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Authorization header")

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")


@app.exception_handler(RateLimitExceeded)
def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(status_code=429, content={"detail": "Rate limit exceeded"})


@app.get("/api/v1/health")
def health():
    return {"status": "ok", "env": ENV}


@app.post("/api/v1/conversations", response_model=ConversationResponse)
def create_conversation(
    payload: ConversationCreate,
    current_user: dict[str, Any] = Depends(get_current_user)
):
    """Criar nova conversa/sessão para um usuário"""
    user_id = current_user.get("sub", "dev-user")
    
    with SessionLocal() as session:
        session.merge(User(id=user_id, email=current_user.get("email", "unknown")))
        
        conversation = Conversation(
            user_id=user_id,
            title=payload.title or f"Conversa {datetime.now().strftime('%d/%m %H:%M')}",
            system_prompt=payload.system_prompt,
            prompt_type=payload.prompt_type or "assistant"
        )
        session.add(conversation)
        session.commit()
        session.refresh(conversation)
        
        return ConversationResponse(
            id=conversation.id,
            user_id=conversation.user_id,
            title=conversation.title,
            system_prompt=conversation.system_prompt,
            prompt_type=conversation.prompt_type,
            created_at=conversation.created_at,
            updated_at=conversation.updated_at
        )


@app.get("/api/v1/conversations", response_model=ConversationListResponse)
def list_conversations(
    current_user: dict[str, Any] = Depends(get_current_user)
):
    """Listar todas as conversas do usuário"""
    user_id = current_user.get("sub", "dev-user")
    
    with SessionLocal() as session:
        conversations = (
            session.query(Conversation)
            .filter(Conversation.user_id == user_id)
            .order_by(Conversation.updated_at.desc())
            .all()
        )
        
        return ConversationListResponse(
            conversations=[
                ConversationResponse(
                    id=conv.id,
                    user_id=conv.user_id,
                    title=conv.title,
                    system_prompt=conv.system_prompt,
                    prompt_type=conv.prompt_type,
                    created_at=conv.created_at,
                    updated_at=conv.updated_at
                )
                for conv in conversations
            ]
        )


@app.delete("/api/v1/conversations/{conversation_id}")
def delete_conversation(
    conversation_id: int,
    current_user: dict[str, Any] = Depends(get_current_user)
):
    """Deletar uma conversa"""
    user_id = current_user.get("sub", "dev-user")
    
    with SessionLocal() as session:
        conversation = (
            session.query(Conversation)
            .filter(Conversation.id == conversation_id)
            .filter(Conversation.user_id == user_id)
            .first()
        )
        
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        # Deletar mensagens associadas
        session.query(ChatMessage).filter(
            ChatMessage.user_id == user_id
        ).delete()  # TODO: Adicionar conversation_id ao ChatMessage
        
        session.delete(conversation)
        session.commit()
        
        return {"status": "deleted"}


@app.get("/api/v1/history", response_model=ChatHistoryResponse)
def history(user_id: str, current_user: dict[str, Any] = Depends(get_current_user)):
    if ENV == "production" and current_user.get("sub") != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    with SessionLocal() as session:
        events = (
            session.query(ChatMessage)
            .filter(ChatMessage.user_id == user_id)
            .order_by(ChatMessage.created_at)
            .all()
        )

        return {
            "messages": [
                {"id": str(event.id), "role": event.role, "content": event.content}
                for event in events
            ]
        }


@app.post("/api/v1/memory")
def create_memory(item: MemoryItem, current_user: dict[str, Any] = Depends(get_current_user)):
    if ENV == "production" and current_user.get("sub") != item.user_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    with SessionLocal() as session:
        session.merge(User(id=item.user_id, email=current_user.get("email", "unknown")))
        session.add(
            MemoryEntry(
                user_id=item.user_id,
                role=item.role,
                content=item.content,
                category=item.category or "chat",
            )
        )
        session.commit()

    memory_engine.add_memory(item.user_id, item.content, category=item.category or "chat")
    return {"status": "saved"}


def build_system_prompt(ai_name: str, prompt_type: str = None) -> str:
    """Build dynamic system prompt based on AI name and prompt type"""
    base_prompts = {
        "assistant": f"Você é {ai_name}, um assistente útil e educado. Responda de forma clara, curta e objetiva em português.",
        "developer": f"Você é {ai_name}, um experiente desenvolvedor. Ajude com código, debugging e explicações técnicas. Responda em português.",
        "creative": f"Você é {ai_name}, um assistente criativo. Propõe ideias de projetos, sugestões inovadoras e soluções criativas. Responda em português.",
        "analytical": f"Você é {ai_name}, um analista rigoroso. Analise problemas em profundidade, questione suposições e forneça insights. Responda em português.",
        "formal": f"Você é {ai_name}, um assistente profissional e formal. Comunique-se de forma clara e profissional. Responda em português.",
        "summarizer": f"Você é {ai_name}, um especialista em resumos. Sintetize informações complexas de forma clara e concisa. Responda em português.",
    }
    
    prompt_type = prompt_type or "assistant"
    return base_prompts.get(prompt_type, base_prompts["assistant"])


@app.post("/api/v1/chat")
async def chat(request: ChatRequest, current_user: dict[str, Any] = Depends(get_current_user)):
    """
    Endpoint de chat com streaming.
    Integra com LLM Service (OpenAI, Anthropic, Lovable ou Local fallback).
    Salva histórico e memória automaticamente.
    """
    user_id = request.user_id or current_user.get("sub", "dev-user")
    ai_name = request.ai_name or "Aurora"
    prompt_type = request.prompt_type or "assistant"
    
    # Converter mensagens do formato da request para formato OpenAI
    formatted_messages = []
    for msg in request.messages:
        formatted_messages.append({
            "role": msg.role,
            "content": msg.content
        })
    
    # Build system prompt dinamicamente
    system_prompt = build_system_prompt(ai_name, prompt_type)
    
    # Salvar usuário e histórico
    def save_user_and_history():
        with SessionLocal() as session:
            session.merge(User(id=user_id, email=current_user.get("email", "unknown")))
            for message in request.messages:
                if message.role != "assistant":
                    session.add(
                        ChatMessage(
                            user_id=user_id,
                            role=message.role,
                            content=message.content,
                        )
                    )
            session.commit()
    
    save_user_and_history()
    
    # Get LLM service
    llm_service = get_llm_service()
    
    async def event_stream():
        """Stream resposta do LLM em chunks SSE"""
        full_response = ""
        
        try:
            # Stream da resposta do LLM
            async for chunk in llm_service.stream_chat_completion(
                formatted_messages,
                system_prompt=system_prompt
            ):
                full_response += chunk
                payload = {"choices": [{"delta": {"content": chunk}}]}
                yield f"data: {json.dumps(payload)}\n\n"
                await asyncio.sleep(0.01)  # Pequeno delay para evitar overwhelming
            
            yield "data: [DONE]\n\n"
        except Exception as e:
            error_msg = f"Erro ao processar chat: {str(e)}"
            full_response = error_msg
            payload = {"choices": [{"delta": {"content": error_msg}}]}
            yield f"data: {json.dumps(payload)}\n\n"
            yield "data: [DONE]\n\n"
        finally:
            # Salvar resposta assistente no histórico
            if full_response:
                with SessionLocal() as session:
                    session.add(
                        ChatMessage(
                            user_id=user_id,
                            role="assistant",
                            content=full_response,
                        )
                    )
                    session.commit()
                
                # Salvar na memória do engine
                memory_engine.add_memory(
                    user_id, 
                    full_response, 
                    category="assistant"
                )
    
    return StreamingResponse(event_stream(), media_type="text/event-stream")


@app.get("/api/v1/search", response_model=SearchResponse)
def search(
    user_id: str, 
    q: str, 
    semantic: bool = True,
    current_user: dict[str, Any] = Depends(get_current_user)
):
    """
    Busca em memória com suporte a busca semântica e text search
    
    Args:
        user_id: ID do usuário
        q: Query de busca
        semantic: Se True, usa busca semântica; se False, usa text search (ILIKE)
        current_user: Usuário autenticado
        
    Returns:
        SearchResponse com lista de resultados
    """
    if ENV == "production" and current_user.get("sub") != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")
    
    with SessionLocal() as session:
        # Buscar todas as entradas de memória do usuário
        memory_items = (
            session.query(MemoryEntry)
            .filter(MemoryEntry.user_id == user_id)
            .order_by(MemoryEntry.created_at.desc())
            .all()
        )
        
        if not memory_items:
            return {"results": []}
        
        # Se semantic search está habilitado e temos embeddings
        if semantic and os.getenv("SEMANTIC_SEARCH_ENABLED", "true").lower() == "true":
            try:
                embedding_service = get_embedding_service()
                
                # Preparar candidates para busca semântica
                candidates = [
                    (
                        str(item.id),
                        embedding_service.embed_text(item.content),
                        item.content
                    )
                    for item in memory_items
                ]
                
                # Fazer busca semântica
                search_results = embedding_service.search_similar(
                    q,
                    candidates,
                    top_k=20,
                    threshold=0.2  # Threshold mais baixo para resultados mais amplos
                )
                
                # Converter resultados para SearchResult format
                result_ids = [int(r["id"]) for r in search_results]
                results = []
                for result in search_results:
                    # Encontrar item original
                    item = next(i for i in memory_items if str(i.id) == result["id"])
                    results.append({
                        "id": str(item.id),
                        "role": item.role,
                        "content": item.content,
                        "category": item.category,
                    })
                
                return {"results": results}
            except Exception as e:
                # Fallback para text search se embeddings falhar
                print(f"Erro em busca semântica, usando text search: {str(e)}")
        
        # Fallback: text search com ILIKE
        term = f"%{q.lower()}%"
        items = (
            session.query(MemoryEntry)
            .filter(MemoryEntry.user_id == user_id)
            .filter(MemoryEntry.content.ilike(term))
            .order_by(MemoryEntry.created_at.desc())
            .limit(20)
            .all()
        )
        
        return {
            "results": [
                {
                    "id": str(item.id),
                    "role": item.role,
                    "content": item.content,
                    "category": item.category,
                }
                for item in items
            ]
        }
