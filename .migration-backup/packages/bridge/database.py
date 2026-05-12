import os

from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, func, Float, ForeignKey
from sqlalchemy.orm import declarative_base, relationship, sessionmaker
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.pool import StaticPool

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./data.db")
if DATABASE_URL.startswith("sqlite") and ":memory:" in DATABASE_URL:
    engine = create_engine(
        DATABASE_URL,
        future=True,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
else:
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


class Plan(Base):
    """Plano de estudo/projeto com milestones"""
    __tablename__ = "plans"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, nullable=False, index=True)  # Adicionado índice
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(32), default="active", index=True)  # Adicionado índice
    progress = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)  # Adicionado índice
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    tasks = relationship("Task", back_populates="plan", lazy="joined")


class Project(Base):
    """Projeto com tarefas associadas"""
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, nullable=False, index=True)
    title = Column(String(255), nullable=False)
    status = Column(String(32), default="active")  # active, completed, archived
    progress = Column(Float, default=0.0)  # 0-100
    description = Column(Text, nullable=True)
    linked_tasks = Column(String, nullable=True)  # JSON array of task IDs
    archived = Column(String, default="false")  # "true" or "false"
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class Account(Base):
    """Contas de negócio ou recursos (bank, business, learning)"""
    __tablename__ = "accounts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, nullable=False, index=True)
    account_type = Column(String(64), nullable=False)  # bank, business, learning
    account_name = Column(String(255), nullable=False)
    status = Column(String(32), default="active")  # active, inactive, deleted
    value_usd = Column(Float, default=0.0)
    description = Column(Text, nullable=True)
    metadata_json = Column(Text, nullable=True)  # JSON string
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class Task(Base):
    """Tarefa dentro de um plano"""
    __tablename__ = "tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    plan_id = Column(Integer, ForeignKey("plans.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(32), default="pending", index=True)  # pending, in_progress, completed
    progress = Column(Float, default=0.0)  # 0-100
    priority = Column(Integer, default=5, index=True)  # 1-10
    due_date = Column(DateTime(timezone=True), nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    plan = relationship("Plan", back_populates="tasks")


class ActionProposal(Base):
    """Ações que requerem aprovação do usuário"""
    __tablename__ = "action_proposals"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, nullable=False, index=True)
    action_type = Column(String(64), nullable=False)  # publish, schedule, execute, etc
    description = Column(Text, nullable=False)
    parameters = Column(Text, nullable=True)  # JSON string
    status = Column(String(32), default="pending")  # pending, approved, rejected, executed
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=True)
    executed_at = Column(DateTime(timezone=True), nullable=True)


class SecurityIssue(Base):
    """Problemas de segurança detectados"""
    __tablename__ = "security_issues"
    
    id = Column(String, primary_key=True, index=True)
    severity = Column(String(32), nullable=False)  # critical, high, medium, low
    description = Column(Text, nullable=False)
    component = Column(String(255), nullable=False)
    resolution = Column(Text, nullable=False)
    reported_at = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(String(32), default="open")  # open, resolved, ignored
    details = Column(Text, nullable=True)  # JSON string


class ApiUsage(Base):
    """Registro de uso de APIs externas com custos"""
    __tablename__ = "api_usage"
    
    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, nullable=False, index=True)
    provider = Column(String(64), nullable=False)  # openai, anthropic, google, etc
    endpoint = Column(String(255), nullable=False)
    cost_usd = Column(Float, default=0.0)
    model = Column(String(128), nullable=True)
    tokens_used = Column(Integer, nullable=True)
    response_time_ms = Column(Float, nullable=True)
    metadata_json = Column(Text, nullable=True)  # JSON string, renamed to avoid SQLAlchemy reserved attribute
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    executed_at = Column(DateTime(timezone=True), nullable=True)


def init_db() -> None:
    Base.metadata.create_all(bind=engine)

