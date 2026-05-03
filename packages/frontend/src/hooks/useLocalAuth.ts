import { useEffect, useState } from "react";

export interface LocalUser {
  id: string;
  email: string;
  name: string;
  isLocal: true;
  createdAt: string;
}

export interface LocalSession {
  user: LocalUser;
  isOffline: boolean;
  lastSync?: string;
}

const STORAGE_KEY = "aura_local_session";
const DEVICE_ID_KEY = "aura_device_id";

function generateDeviceId(): string {
  const existing = localStorage.getItem(DEVICE_ID_KEY);
  if (existing) return existing;

  const newId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  localStorage.setItem(DEVICE_ID_KEY, newId);
  return newId;
}

export function useLocalAuth() {
  const [session, setSession] = useState<LocalSession | null>(null);
  const [user, setUser] = useState<LocalUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  // Inicializar com usuário local se existir
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const localSession = JSON.parse(stored);
        setSession(localSession);
        setUser(localSession.user);
        setIsOffline(localSession.isOffline ?? false);
      } catch (e) {
        console.error("Failed to parse local session:", e);
      }
    }
    setLoading(false);
  }, []);

  // Monitorar mudança de conexão
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const createLocalSession = (name?: string) => {
    const deviceId = generateDeviceId();
    const newUser: LocalUser = {
      id: deviceId,
      email: `local_${deviceId}@aura.local`,
      name: name || "Usuário Local",
      isLocal: true,
      createdAt: new Date().toISOString(),
    };

    const newSession: LocalSession = {
      user: newUser,
      isOffline: !navigator.onLine,
      lastSync: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSession));
    setSession(newSession);
    setUser(newUser);
    setIsOffline(!navigator.onLine);
  };

  const clearLocalSession = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSession(null);
    setUser(null);
  };

  const updateOfflineMode = (offline: boolean) => {
    if (session) {
      const updated = { ...session, isOffline: offline, lastSync: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setSession(updated);
      setIsOffline(offline);
    }
  };

  return {
    session,
    user,
    loading,
    isOffline,
    createLocalSession,
    clearLocalSession,
    updateOfflineMode,
  };
}
