"""
OfflineFirstSync - Estratégia de sincronização offline-first
Prioriza dados locais e sincroniza em background
"""

import os
import json
import sqlite3
from pathlib import Path
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import threading
import time

class OfflineFirstSync:
    """Gerenciador de sincronização offline-first"""

    def __init__(self, user_id: str, local_db_path: str = None):
        self.user_id = user_id
        self.local_db_path = Path(local_db_path or f"offline_sync_{user_id}.db")
        self.sync_queue = []
        self.is_online = True  # Assumir online inicialmente
        self.last_sync = None
        self._init_local_db()

        # Iniciar thread de sync em background
        self.sync_thread = threading.Thread(target=self._background_sync_loop, daemon=True)
        self.sync_thread.start()

    def _init_local_db(self):
        """Inicializar banco local SQLite para cache offline"""
        self.conn = sqlite3.connect(str(self.local_db_path))
        self.conn.execute('''
            CREATE TABLE IF NOT EXISTS sync_queue (
                id INTEGER PRIMARY KEY,
                action TEXT NOT NULL,
                data TEXT NOT NULL,
                timestamp REAL,
                retry_count INTEGER DEFAULT 0,
                status TEXT DEFAULT 'pending'
            )
        ''')

        self.conn.execute('''
            CREATE TABLE IF NOT EXISTS local_cache (
                key TEXT PRIMARY KEY,
                data TEXT NOT NULL,
                timestamp REAL,
                expires_at REAL
            )
        ''')

        self.conn.execute('''
            CREATE TABLE IF NOT EXISTS sync_metadata (
                key TEXT PRIMARY KEY,
                value TEXT
            )
        ''')

        self.conn.commit()

    def queue_action(self, action: str, data: Dict[str, Any]):
        """Enfileirar ação para sync posterior"""
        timestamp = datetime.now().timestamp()

        self.conn.execute('''
            INSERT INTO sync_queue (action, data, timestamp)
            VALUES (?, ?, ?)
        ''', (action, json.dumps(data), timestamp))

        self.conn.commit()

        # Tentar sync imediata se online
        if self.is_online:
            self._process_sync_queue()

    def get_cached_data(self, key: str) -> Optional[Dict[str, Any]]:
        """Obter dados do cache local"""
        cursor = self.conn.execute('''
            SELECT data, expires_at FROM local_cache
            WHERE key = ? AND (expires_at IS NULL OR expires_at > ?)
        ''', (key, datetime.now().timestamp()))

        row = cursor.fetchone()
        if row:
            return json.loads(row[0])
        return None

    def set_cached_data(self, key: str, data: Dict[str, Any], ttl_seconds: int = None):
        """Armazenar dados no cache local"""
        timestamp = datetime.now().timestamp()
        expires_at = timestamp + ttl_seconds if ttl_seconds else None

        self.conn.execute('''
            INSERT OR REPLACE INTO local_cache (key, data, timestamp, expires_at)
            VALUES (?, ?, ?, ?)
        ''', (key, json.dumps(data), timestamp, expires_at))

        self.conn.commit()

    def get_sync_status(self) -> Dict[str, Any]:
        """Obter status da sincronização"""
        cursor = self.conn.execute('SELECT COUNT(*) FROM sync_queue WHERE status = "pending"')
        pending_count = cursor.fetchone()[0]

        cursor = self.conn.execute('SELECT value FROM sync_metadata WHERE key = "last_sync"')
        last_sync_row = cursor.fetchone()
        last_sync = float(last_sync_row[0]) if last_sync_row else None

        return {
            'is_online': self.is_online,
            'pending_actions': pending_count,
            'last_sync': datetime.fromtimestamp(last_sync).isoformat() if last_sync else None,
            'local_db_size_mb': self.local_db_path.stat().st_size / (1024 * 1024) if self.local_db_path.exists() else 0
        }

    def _background_sync_loop(self):
        """Loop de sincronização em background"""
        while True:
            try:
                if self.is_online:
                    self._process_sync_queue()
                    self._cleanup_expired_cache()

                # Verificar conectividade (simplificado)
                self._check_connectivity()

            except Exception as e:
                print(f"Erro no sync loop: {e}")

            time.sleep(30)  # Sync a cada 30 segundos

    def _process_sync_queue(self):
        """Processar fila de sincronização"""
        cursor = self.conn.execute('''
            SELECT id, action, data, retry_count FROM sync_queue
            WHERE status = 'pending'
            ORDER BY timestamp ASC
            LIMIT 10
        ''')

        for row in cursor.fetchall():
            action_id, action, data_str, retry_count = row
            data = json.loads(data_str)

            try:
                # Tentar executar ação
                success = self._execute_remote_action(action, data)

                if success:
                    self.conn.execute('UPDATE sync_queue SET status = "completed" WHERE id = ?', (action_id,))
                else:
                    # Incrementar retry count
                    new_retry = retry_count + 1
                    if new_retry >= 3:
                        self.conn.execute('UPDATE sync_queue SET status = "failed" WHERE id = ?', (action_id,))
                    else:
                        self.conn.execute('UPDATE sync_queue SET retry_count = ? WHERE id = ?', (new_retry, action_id))

            except Exception as e:
                print(f"Erro executando ação {action}: {e}")
                # Marcar como falha após algumas tentativas
                new_retry = retry_count + 1
                if new_retry >= 3:
                    self.conn.execute('UPDATE sync_queue SET status = "failed" WHERE id = ?', (action_id,))
                else:
                    self.conn.execute('UPDATE sync_queue SET retry_count = ? WHERE id = ?', (new_retry, action_id))

        # Atualizar timestamp do último sync
        self.conn.execute('''
            INSERT OR REPLACE INTO sync_metadata (key, value)
            VALUES ('last_sync', ?)
        ''', (str(datetime.now().timestamp()),))

        self.conn.commit()

    def _execute_remote_action(self, action: str, data: Dict[str, Any]) -> bool:
        """Executar ação remotamente (simulado)"""
        # Simulação - em produção, faria chamadas reais para APIs
        if action == 'save_post':
            # Simular salvamento de post
            print(f"Sync: Salvando post {data.get('post_id')}")
            return True
        elif action == 'create_collection':
            # Simular criação de coleção
            print(f"Sync: Criando coleção {data.get('name')}")
            return True
        elif action == 'update_profile':
            # Simular atualização de perfil
            print(f"Sync: Atualizando perfil")
            return True

        return False

    def _check_connectivity(self):
        """Verificar conectividade (simplificado)"""
        # Em produção, faria ping para servidor ou verificação real
        self.is_online = True  # Assumir sempre online para demo

    def _cleanup_expired_cache(self):
        """Limpar cache expirado"""
        now = datetime.now().timestamp()
        self.conn.execute('DELETE FROM local_cache WHERE expires_at < ?', (now,))
        self.conn.commit()

    def force_sync_now(self):
        """Forçar sincronização imediata"""
        if self.is_online:
            self._process_sync_queue()
            return True
        return False

    def get_failed_actions(self) -> List[Dict[str, Any]]:
        """Obter ações que falharam"""
        cursor = self.conn.execute('''
            SELECT action, data, retry_count, timestamp FROM sync_queue
            WHERE status = 'failed'
            ORDER BY timestamp DESC
        ''')

        failed_actions = []
        for row in cursor.fetchall():
            failed_actions.append({
                'action': row[0],
                'data': json.loads(row[1]),
                'retry_count': row[2],
                'timestamp': datetime.fromtimestamp(row[3]).isoformat()
            })

        return failed_actions

    def retry_failed_actions(self):
        """Tentar novamente ações falhadas"""
        self.conn.execute('''
            UPDATE sync_queue
            SET status = 'pending', retry_count = 0
            WHERE status = 'failed'
        ''')
        self.conn.commit()

    def close(self):
        """Fechar conexões"""
        if hasattr(self, 'conn'):
            self.conn.close()