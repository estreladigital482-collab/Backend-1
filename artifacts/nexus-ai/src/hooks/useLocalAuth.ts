import { useState, useEffect, useCallback } from 'react';

interface LocalUser {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  createdAt: string;
  isLocal: true;
}

type LocalStoredMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: string;
  status?: 'pending' | 'sent' | 'failed';
};

interface LocalAuthState {
  user: LocalUser | null;
  isAuthenticated: boolean;
  isOnline: boolean;
}

const LOCAL_USER_KEY = 'caos_local_user';
const LOCAL_MESSAGES_KEY = 'caos_local_messages';

function readSavedUser(): LocalUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LOCAL_USER_KEY);
    return raw ? (JSON.parse(raw) as LocalUser) : null;
  } catch {
    return null;
  }
}

export function useLocalAuth() {
  const [state, setState] = useState<LocalAuthState>(() => {
    const saved = readSavedUser();
    return {
      user: saved,
      isAuthenticated: Boolean(saved),
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    };
  });

  useEffect(() => {
    const handleOnline  = () => setState(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setState(prev => ({ ...prev, isOnline: false }));
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const createLocalUser = useCallback((name = 'Caos'): LocalUser => {
    const user: LocalUser = {
      id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      createdAt: new Date().toISOString(),
      isLocal: true,
    };
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
    setState(prev => ({ ...prev, user, isAuthenticated: true }));
    return user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(LOCAL_USER_KEY);
    setState(prev => ({ ...prev, user: null, isAuthenticated: false }));
  }, []);

  const clearLocalSession = useCallback(() => {
    localStorage.removeItem(LOCAL_USER_KEY);
    localStorage.removeItem(LOCAL_MESSAGES_KEY);
    setState(prev => ({ ...prev, user: null, isAuthenticated: false }));
  }, []);

  const getLocalMessages = useCallback((): LocalStoredMessage[] => {
    try {
      const raw = localStorage.getItem(LOCAL_MESSAGES_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }, []);

  const saveLocalMessages = useCallback((messages: LocalStoredMessage[]) => {
    localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(messages));
  }, []);

  return {
    ...state,
    createLocalUser,
    logout,
    clearLocalSession,
    getLocalMessages,
    saveLocalMessages,
  };
}
