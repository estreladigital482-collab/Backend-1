import { useState, useEffect } from 'react';
import type { ChatMessage } from '@/lib/types';

interface LocalUser {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  createdAt: string;
  isLocal: true;
}

type LocalStoredMessage = ChatMessage & {
  status?: 'pending' | 'sent' | 'failed';
  timestamp?: string;
};

interface LocalAuthState {
  user: LocalUser | null;
  isAuthenticated: boolean;
  isOnline: boolean;
}

const LOCAL_USER_KEY = 'aura_sphere_local_user';
const LOCAL_MESSAGES_KEY = 'aura_sphere_local_messages';

export function useLocalAuth() {
  const [state, setState] = useState<LocalAuthState>({
    user: null,
    isAuthenticated: false,
    isOnline: navigator.onLine,
  });

  // Verificar conexão online/offline
  useEffect(() => {
    const handleOnline = () => setState(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setState(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Carregar usuário local do localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem(LOCAL_USER_KEY);
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setState(prev => ({
          ...prev,
          user,
          isAuthenticated: true,
        }));
      } catch (error) {
        console.error('Erro ao carregar usuário local:', error);
        localStorage.removeItem(LOCAL_USER_KEY);
      }
    }
  }, []);

  const createLocalUser = (name: string = 'Caos') => {
    const user: LocalUser = {
      id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      createdAt: new Date().toISOString(),
      isLocal: true,
    };

    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
    setState(prev => ({
      ...prev,
      user,
      isAuthenticated: true,
    }));

    return user;
  };

  const logout = () => {
    localStorage.removeItem(LOCAL_USER_KEY);
    setState(prev => ({
      ...prev,
      user: null,
      isAuthenticated: false,
    }));
  };

  const clearLocalSession = () => {
    localStorage.removeItem(LOCAL_USER_KEY);
    localStorage.removeItem(LOCAL_MESSAGES_KEY);
    setState(prev => ({
      ...prev,
      user: null,
      isAuthenticated: false,
    }));
  };

  const getLocalMessages = (): LocalStoredMessage[] => {
    try {
      const messages = localStorage.getItem(LOCAL_MESSAGES_KEY);
      return messages ? JSON.parse(messages) : [];
    } catch (error) {
      console.error('Erro ao carregar mensagens locais:', error);
      return [];
    }
  };

  const saveLocalMessages = (messages: LocalStoredMessage[]) => {
    localStorage.setItem(LOCAL_MESSAGES_KEY, JSON.stringify(messages));
  };

  return {
    ...state,
    createLocalUser,
    logout,
    clearLocalSession,
    getLocalMessages,
    saveLocalMessages,
  };
}