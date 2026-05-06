---
source: /workspaces/Aura-sphere-/knowledge_vault/Integração/sync-service.md
filename: sync-service.md
---

# sync-service.md

---
category: Integração
source: packages/frontend/src/lib/sync-service.ts
created: 2026-05-05T19:45:45.739168
size: 6121 bytes
hash: 073e1ba0f60c8ebc5913aae432760b96
headers:
---

# sync-service.ts

## Metadados
- **Categoria**: Integração
- **Caminho Original**: `packages/frontend/src/lib/sync-service.ts`
- **Tamanho**: 6121 bytes

## Conteúdo

import { ChatMessage } from "@/lib/types";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
const AUTH_HEADERS = import.meta.env.VITE_API_KEY
  ? { Authorization: `Bearer ${import.meta.env.VITE_API_KEY}` }
  : {};

interface SyncJob {
  id: string;
  type: "message" | "profile" | "memory";
  data: any;
  userId: string;
  timestamp: string;
  retries: number;
}

const SYNC_QUEUE_KEY = "aura_sync_queue";
const MAX_RETRIES = 3;

export class SyncService {
  private static instance: SyncService;
  private queue: SyncJob[] = [];
  private isSyncing = false;
  private listeners: ((status: "online" | "offline" | "syncing" | "idle") => void)[] = [];

  private constructor() {
    this.loadQueue();
    this.setupNetworkListeners();
  }

  static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  private setupNetworkListeners() {
    window.addEventListener("online", () => {
      this.notify("online");
      this.syncQueue();
    });

    window.addEventListener("offline", () => {
      this.notify("offline");
    });
  }

  private loadQueue() {
    try {
      const stored = localStorage.getItem(SYNC_QUEUE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch (e) {
      console.error("Failed to load sync queue:", e);
      this.queue = [];
    }
  }

  private saveQueue() {
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(this.queue));
  }

  private notify(status: "online" | "offline" | "syncing" | "idle") {
    this.listeners.forEach((listener) => listener(status));
  }

  onStatusChange(callback: (status: "online" | "offline" | "syncing" | "idle") => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  addMessageSync(userId: string, message: ChatMessage) {
    const job: SyncJob = {
      id: `msg_${Date.now()}_${Math.random()}`,
      type: "message",
      data: message,
      userId,
      timestamp: new Date().toISOString(),
      retries: 0,
    };

    this.queue.push(job);
    this.saveQueue();

    if (navigator.onLine) {
      this.syncQueue();
    }
  }

  addProfileSync(userId: string, profile: { ai_name: string; voice_id: string }) {
    const job: SyncJob = {
      id: `prof_${Date.now()}`,
      type: "profile",
      data: profile,
      userId,
      timestamp: new Date().toISOString(),
      retries: 0,
    };

    this.queue.push(job);
    this.saveQueue();

    if (navigator.onLine) {
      this.syncQueue();
    }
  }

  async syncQueue() {
    if (this.isSyncing || !navigator.onLine || this.queue.length === 0) {
      return;
    }

    this.isSyncing = true;
    this.notify("syncing");

    const failedJobs: SyncJob[] = [];

    for (const job of this.queue) {
      try {
        await this.executeSync(job);
      } catch (error) {
        console.error("Sync job failed:", job, error);
        job.retries++;

        if (job.retries < MAX_RETRIES) {
          failedJobs.push(job);
        }
      }
    }

    this.queue = failedJobs;
    this.saveQueue();
    this.isSyncing = false;
    this.notify(navigator.onLine ? "online" : "offline");
  }

  private async executeSync(job: SyncJob) {
    switch (job.type) {
      case "message":
        return this.syncMessage(job);
      case "profile":
        return this.syncProfile(job);
      case "memory":
        return this.syncMemory(job);
    }
  }

  private async syncMessage(job: SyncJob) {
    const response = await fetch(`${API_BASE}/api/v1/memory`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...AUTH_HEADERS,
      },
      body: JSON.stringify({
        user_id: job.userId,
        role: job.data.role,
        content: job.data.content,
        category: "chat",
      }),
    });

    if (!response.ok) {
      throw new Error(`Sync failed: ${response.status}`);
    }
  }

  private async syncProfile(job: SyncJob) {
    const response = await fetch(`${API_BASE}/api/v1/profile`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...AUTH_HEADERS,
      },
      body: JSON.stringify({
        user_id: job.userId,
        ...job.data,
      }),
    });

    if (!response.ok) {
      throw new Error(`Profile sync failed: ${response.status}`);
    }
  }

  private async syncMemory(job: SyncJob) {
    const response = await fetch(`${API_BASE}/api/v1/memory`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...AUTH_HEADERS,
      },
      body: JSON.stringify({
        user_id: job.userId,
        ...job.data,
      }),
    });

    if (!response.ok) {
      throw new Error(`Memory sync failed: ${response.status}`);
    }
  }

  getQueueLength(): number {
    return this.queue.length;
  }

  async migrateLocalToCloud(localUserId: string, cloudUserId: string) {
    // Buscar todas as mensagens locais
    const localMessages = localStorage.getItem(`messages_${localUserId}`);
    if (localMessages) {
      try {
        const messages: ChatMessage[] = JSON.parse(localMessages);
        for (const msg of messages) {
          this.addMessageSync(cloudUserId, msg);
        }
      } catch (e) {
        console.error("Failed to migrate messages:", e);
      }
    }

    // Buscar perfil local
    const aiName = localStorage.getItem(`ai_name_${localUserId}`);
    const voiceId = localStorage.getItem(`voice_id_${localUserId}`);
    if (aiName) {
      this.addProfileSync(cloudUserId, {
        ai_name: aiName,
        voice_id: voiceId || "pt-female",
      });
    }

    // Limpar dados locais
    localStorage.removeItem(`messages_${localUserId}`);
    localStorage.removeItem(`ai_name_${localUserId}`);
    localStorage.removeItem(`voice_id_${localUserId}`);
    localStorage.removeItem(`onboarded_${localUserId}`);

    // Sincronizar tudo
    if (navigator.onLine) {
      await this.syncQueue();
    }
  }
}

export const syncService = SyncService.getInstance();


## Tags
#categoria/integração

