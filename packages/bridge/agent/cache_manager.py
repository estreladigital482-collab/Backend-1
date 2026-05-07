import fnmatch
import json
import os
import time
from typing import Any, Optional

try:
    import redis
except ImportError:  # pragma: no cover
    redis = None


class CacheManager:
    """Gerenciador simples de cache com fallback Redis/in-memory."""

    def __init__(self):
        self.redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
        self.client = None
        self.store: dict[str, tuple[str, float]] = {}

        if redis is not None:
            try:
                self.client = redis.from_url(self.redis_url, decode_responses=True)
                self.client.ping()
            except Exception:
                self.client = None

    def set(self, key: str, value: Any, ttl: int = 300) -> None:
        data = json.dumps(value)

        if self.client:
            self.client.set(key, data, ex=ttl)
            return

        self.store[key] = (data, time.time() + ttl)

    def get(self, key: str) -> Optional[Any]:
        if self.client:
            raw = self.client.get(key)
            if raw is None:
                return None
            try:
                return json.loads(raw)
            except json.JSONDecodeError:
                return None

        cached = self.store.get(key)
        if not cached:
            return None

        raw, expires_at = cached
        if time.time() > expires_at:
            del self.store[key]
            return None

        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            return None

    def delete(self, key: str) -> None:
        if self.client:
            self.client.delete(key)
            return

        if key in self.store:
            del self.store[key]

    def delete_pattern(self, pattern: str) -> None:
        if self.client:
            for key in self.client.scan_iter(match=pattern):
                self.client.delete(key)
            return

        for key in list(self.store.keys()):
            if fnmatch.fnmatch(key, pattern):
                del self.store[key]

    def clear(self) -> None:
        if self.client:
            self.client.flushdb()
            return

        self.store.clear()
