import os

from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, func, Float
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.dialects.postgresql import ARRAY

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./data.db")
engine = create_engine(DATABASE_URL, future=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    email = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, nullable=False, index=True)
    role = Column(String(32), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class MemoryEntry(Base):
    __tablename__ = "memory_entries"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, nullable=False, index=True)
    role = Column(String(32), nullable=False)
    content = Column(Text, nullable=False)
    category = Column(String(64), default="chat")
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class MessageEmbedding(Base):
    """Tabela para armazenar embeddings de mensagens para busca semântica"""
    __tablename__ = "message_embeddings"
    
    id = Column(Integer, primary_key=True, index=True)
    message_id = Column(Integer, nullable=False, index=True)  # Reference to chat_messages or memory_entries
    user_id = Column(String, nullable=False, index=True)
    content = Column(Text, nullable=False)
    embedding = Column(ARRAY(Float) if "postgresql" in DATABASE_URL else Text, nullable=False)  # Vector of floats
    embedding_model = Column(String(128), default="sentence-transformers/all-MiniLM-L6-v2")
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Conversation(Base):
    """Tabela para rastrear múltiplas conversas/sessões do usuário"""
    __tablename__ = "conversations"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, nullable=False, index=True)
    title = Column(String(255), nullable=True)  # Título da conversa
    system_prompt = Column(Text, nullable=True)
    prompt_type = Column(String(64), default="assistant")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


def init_db() -> None:
    Base.metadata.create_all(bind=engine)

