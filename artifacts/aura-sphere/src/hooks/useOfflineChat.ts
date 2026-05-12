import { useState, useEffect } from 'react';
import { useLocalAuth } from './useLocalAuth';
import type { ChatMessage } from '@/lib/types';

interface OfflineMessage extends ChatMessage {
  id: string;
  timestamp: string;
  status: 'pending' | 'sent' | 'failed';
}

export function useOfflineChat() {
  const { isOnline, getLocalMessages, saveLocalMessages } = useLocalAuth();
  const [messages, setMessages] = useState<OfflineMessage[]>([]);
  const [pendingCount, setPendingCount] = useState(0);

  // Carregar mensagens ao inicializar
  useEffect(() => {
    const savedMessages = getLocalMessages();
    setMessages(savedMessages);
    updatePendingCount(savedMessages);
  }, [getLocalMessages]);

  // Salvar mensagens quando mudarem
  useEffect(() => {
    saveLocalMessages(messages);
    updatePendingCount(messages);
  }, [messages, saveLocalMessages]);

  const updatePendingCount = (msgs: OfflineMessage[]) => {
    const pending = msgs.filter(m => m.status === 'pending').length;
    setPendingCount(pending);
  };

  const addMessage = (message: Omit<OfflineMessage, 'id' | 'status' | 'timestamp'>) => {
    const newMessage: OfflineMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      status: isOnline ? 'sent' : 'pending',
      ...message,
    };

    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  };

  const markAsSent = (messageId: string) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId ? { ...msg, status: 'sent' as const } : msg
      )
    );
  };

  const markAsFailed = (messageId: string) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId ? { ...msg, status: 'failed' as const } : msg
      )
    );
  };

  const retryFailedMessages = () => {
    if (!isOnline) return;

    setMessages(prev =>
      prev.map(msg =>
        msg.status === 'failed' ? { ...msg, status: 'pending' as const } : msg
      )
    );
  };

  const clearSentMessages = () => {
    setMessages(prev => prev.filter(msg => msg.status !== 'sent'));
  };

  return {
    messages,
    pendingCount,
    isOnline,
    addMessage,
    markAsSent,
    markAsFailed,
    retryFailedMessages,
    clearSentMessages,
  };
}