import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { useOfflineChat } from '@/hooks/useOfflineChat';

interface OfflineIndicatorProps {
  className?: string;
}

export function OfflineIndicator({ className }: OfflineIndicatorProps) {
  const { pendingCount, isOnline, retryFailedMessages } = useOfflineChat();

  if (pendingCount === 0) {
    return null;
  }

  return (
    <Badge
      variant="outline"
      className={`flex items-center gap-2 cursor-pointer hover:bg-gray-50 ${className}`}
      onClick={retryFailedMessages}
    >
      <AlertCircle className="w-3 h-3 text-orange-500" />
      <span className="text-sm">
        {pendingCount} mensagem{pendingCount > 1 ? 'ns' : ''} pendente{pendingCount > 1 ? 's' : ''}
      </span>
      {isOnline && (
        <RefreshCw className="w-3 h-3 text-blue-500" />
      )}
    </Badge>
  );
}

interface MessageStatusProps {
  status: 'pending' | 'sent' | 'failed';
  className?: string;
}

export function MessageStatus({ status, className }: MessageStatusProps) {
  const statusConfig = {
    pending: {
      icon: AlertCircle,
      color: 'text-yellow-500',
      text: 'Pendente',
    },
    sent: {
      icon: CheckCircle,
      color: 'text-green-500',
      text: 'Enviado',
    },
    failed: {
      icon: XCircle,
      color: 'text-red-500',
      text: 'Falhou',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-1 text-xs ${className}`}>
      <Icon className={`w-3 h-3 ${config.color}`} />
      <span className={config.color}>{config.text}</span>
    </div>
  );
}