import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, Cloud, CloudOff } from 'lucide-react';
import { useLocalAuth } from '@/hooks/useLocalAuth';

interface SyncStatusProps {
  className?: string;
}

export function SyncStatus({ className }: SyncStatusProps) {
  const { isOnline, user } = useLocalAuth();

  if (!user?.isLocal) {
    return null; // Não mostrar para usuários logados
  }

  return (
    <Badge
      variant={isOnline ? "default" : "secondary"}
      className={`flex items-center gap-1 ${className}`}
    >
      {isOnline ? (
        <>
          <Wifi className="w-3 h-3" />
          <Cloud className="w-3 h-3" />
          Online
        </>
      ) : (
        <>
          <WifiOff className="w-3 h-3" />
          <CloudOff className="w-3 h-3" />
          Offline
        </>
      )}
    </Badge>
  );
}