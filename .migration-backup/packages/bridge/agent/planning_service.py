"""Serviço de planejamento com barras de progresso"""

from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from dataclasses import dataclass

import sys
sys.path.append("..")
from database import SessionLocal, Plan, Task, Project, Account
from agent.cache_manager import CacheManager


@dataclass
class PlanResponse:
    id: int
    user_id: str
    title: str
    description: str
    status: str
    progress: float
    task_count: int
    completed_tasks: int
    created_at: str


class PlanningService:
    """Gerencia planos e tarefas com progresso"""
    
    def create_plan(self, user_id: str, title: str, description: str = "") -> Dict[str, Any]:
        """Criar novo plano"""
        with SessionLocal() as session:
            plan = Plan(
                user_id=user_id,
                title=title,
                description=description,
                progress=0.0
            )
            session.add(plan)
            session.commit()
            session.refresh(plan)
            
            return {
                "plan_id": plan.id,
                "title": plan.title,
                "status": "created",
                "progress": 0.0
            }
    
    def get_user_plans(self, user_id: str) -> List[Dict[str, Any]]:
        """Obter todos os planos do usuário com eager loading para tarefas"""
        from sqlalchemy.orm import joinedload

        cache_key = f"user_plans:{user_id}"
        cached = cache_manager.get(cache_key)
        if cached is not None:
            return cached
        
        with SessionLocal() as session:
            # Usar joinedload para carregar tarefas junto com planos (evita N+1 queries)
            plans = (
                session.query(Plan)
                .options(joinedload(Plan.tasks))  # Carrega tarefas junto
                .filter(Plan.user_id == user_id)
                .all()
            )
            
            result = []
            for plan in plans:
                # Agora as tarefas já estão carregadas, sem query adicional
                tasks = plan.tasks if hasattr(plan, 'tasks') else []
                completed = len([t for t in tasks if t.status == "completed"])
                total = len(tasks)
                
                progress = (completed / total * 100) if total > 0 else 0.0
                
                result.append({
                    "id": plan.id,
                    "title": plan.title,
                    "description": plan.description,
                    "status": plan.status,
                    "progress": progress,
                    "task_count": total,
                    "completed_tasks": completed,
                    "created_at": plan.created_at.isoformat() if plan.created_at else None
                })
            
            cache_manager.set(cache_key, result, ttl=180)
            return result
    
    def _recalculate_plan_progress(self, session, plan_id: int) -> Optional[Plan]:
        """Recalcula progresso e status do plano com base nas tarefas."""
        from sqlalchemy.orm import joinedload
        
        plan = (
            session.query(Plan)
            .options(joinedload(Plan.tasks))
            .filter(Plan.id == plan_id)
            .first()
        )
        if not plan:
            return None

        # Tarefas já carregadas via joinedload
        tasks = plan.tasks if hasattr(plan, 'tasks') else []
        completed = len([t for t in tasks if t.status == "completed"])
        total = len(tasks)

        plan.progress = (completed / total * 100) if total > 0 else 0.0
        if total > 0 and completed == total:
            plan.status = "completed"
        elif plan.status == "completed":
            plan.status = "active"

        session.commit()
        session.refresh(plan)
        return plan

    def add_task(self, plan_id: int, title: str, priority: int = 5, 
                 due_date: Optional[str] = None) -> Dict[str, Any]:
        """Adicionar tarefa a um plano"""
        with SessionLocal() as session:
            plan = session.query(Plan).filter(Plan.id == plan_id).first()
            if not plan:
                return {"error": "Plan not found"}

            due = datetime.fromisoformat(due_date) if due_date else None
            
            task = Task(
                plan_id=plan_id,
                title=title,
                priority=priority,
                due_date=due,
                status="pending",
                progress=0.0
            )
            session.add(task)
            session.commit()
            session.refresh(task)

            self._recalculate_plan_progress(session, plan_id)
            cache_manager.delete_pattern(f"user_plans:{plan.user_id}*")
            
            return {
                "task_id": task.id,
                "title": task.title,
                "status": "pending",
                "progress": 0.0
            }
    
    def update_task_progress(self, task_id: int, progress: float) -> Dict[str, Any]:
        """Atualizar progresso de uma tarefa (0-100)"""
        with SessionLocal() as session:
            task = session.query(Task).filter(Task.id == task_id).first()
            if not task:
                return {"error": "Task not found"}
            
            task.progress = min(max(progress, 0), 100)
            
            # Se progresso = 100, marcar como completed
            if task.progress == 100:
                task.status = "completed"
            elif task.status == "pending":
                task.status = "in_progress"
            
            session.commit()
            session.refresh(task)
            self._recalculate_plan_progress(session, task.plan_id)
            cache_manager.delete_pattern(f"user_plans:{task.plan.user_id}*")
            
            return {
                "task_id": task.id,
                "status": task.status,
                "progress": task.progress
            }
    
    def get_plan_dashboard(self, user_id: str) -> Dict[str, Any]:
        """Dashboard completo do usuário"""
        plans = self.get_user_plans(user_id)
        
        total_plans = len(plans)
        active_plans = len([p for p in plans if p["status"] == "active"])
        total_tasks = sum(p["task_count"] for p in plans)
        
        total_progress = 0
        if total_tasks > 0:
            completed_tasks = sum(p["completed_tasks"] for p in plans)
            total_progress = (completed_tasks / total_tasks * 100)
        
        return {
            "user_id": user_id,
            "total_plans": total_plans,
            "active_plans": active_plans,
            "total_tasks": total_tasks,
            "overall_progress": round(total_progress, 1),
            "plans": plans
        }
    
    def create_project(self, user_id: str, title: str, description: str = "") -> Dict[str, Any]:
        """Criar novo projeto"""
        with SessionLocal() as session:
            project = Project(
                user_id=user_id,
                title=title,
                description=description,
                status="active",
                progress=0.0,
                archived="false"
            )
            session.add(project)
            session.commit()
            session.refresh(project)
            
            return {
                "project_id": project.id,
                "title": project.title,
                "status": "created",
                "progress": 0.0
            }
    
    def get_user_projects(self, user_id: str) -> List[Dict[str, Any]]:
        """Listar projetos do usuário"""
        with SessionLocal() as session:
            projects = session.query(Project).filter(Project.user_id == user_id).all()
            
            return [
                {
                    "id": p.id,
                    "title": p.title,
                    "description": p.description,
                    "status": p.status,
                    "progress": p.progress,
                    "archived": p.archived,
                    "created_at": p.created_at.isoformat() if p.created_at else None
                }
                for p in projects
            ]
    
    def create_account(self, user_id: str, account_type: str, account_name: str, 
                       value_usd: float = 0.0, description: str = "") -> Dict[str, Any]:
        """Criar nova conta (bank, business, learning)"""
        with SessionLocal() as session:
            account = Account(
                user_id=user_id,
                account_type=account_type,
                account_name=account_name,
                value_usd=value_usd,
                description=description,
                status="active"
            )
            session.add(account)
            session.commit()
            session.refresh(account)
            
            return {
                "account_id": account.id,
                "account_name": account.account_name,
                "account_type": account.account_type,
                "value_usd": account.value_usd,
                "status": "created"
            }
    
    def get_user_accounts(self, user_id: str) -> List[Dict[str, Any]]:
        """Listar contas do usuário"""
        with SessionLocal() as session:
            accounts = session.query(Account).filter(Account.user_id == user_id).all()
            
            return [
                {
                    "id": a.id,
                    "account_type": a.account_type,
                    "account_name": a.account_name,
                    "status": a.status,
                    "value_usd": a.value_usd,
                    "description": a.description,
                    "created_at": a.created_at.isoformat() if a.created_at else None
                }
                for a in accounts
            ]

cache_manager = CacheManager()
# Instância global
planning_service = PlanningService()