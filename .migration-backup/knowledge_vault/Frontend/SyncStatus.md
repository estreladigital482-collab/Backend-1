---
category: Frontend
source: packages/frontend/src/components/SyncStatus.tsx
created: 2026-05-05T19:45:45.739168
size: 4224 bytes
hash: 5a66f9cc644ae91e1f1e099b0e2ea8c8
headers:
---

# SyncStatus.tsx

## Metadados
- **Categoria**: Frontend
- **Caminho Original**: `packages/frontend/src/components/SyncStatus.tsx`
- **Tamanho**: 4224 bytes

## Conteúdo

import { useState, useEffect } from "react";
import { Cloud, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface SyncStatusProps {
  isOffline: boolean;
  isLocal: boolean;
  lastSync?: string;
  onToggleOffline?: (offline: boolean) => void;
  onSignOut?: () => void;
}

export function SyncStatus({
  isOffline,
  isLocal,
  lastSync,
  onToggleOffline,
  onSignOut,
}: SyncStatusProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const getStatusLabel = () => {
    if (isLocal) {
      return isOffline ? "Modo Offline" : "Modo Local";
    }
    return isOnline ? "Sincronizado" : "Sem Conexão";
  };

  const getStatusIcon = () => {
    if (!isOnline) {
      return <WifiOff className="w-4 h-4" />;
    }
    if (isLocal) {
      return <Wifi className="w-4 h-4" />;
    }
    return <Cloud className="w-4 h-4" />;
  };

  const getStatusColor = () => {
    if (!isOnline) return "destructive";
    if (isLocal) return "secondary";
    return "default";
  };

  const formatLastSync = () => {
    if (!lastSync) return "";
    const date = new Date(lastSync);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return "Agora";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m atrás`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h atrás`;
    return date.toLocaleDateString();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 h-auto py-1.5 px-2 text-xs"
        >
          {getStatusIcon()}
          <span>{getStatusLabel()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
          Estado da Sincronização
        </div>
        
        <div className="px-2 py-2 space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span>Conexão:</span>
            <Badge variant={isOnline ? "default" : "destructive"}>
              {isOnline ? "Online" : "Offline"}
            </Badge>
          </div>
          {isLocal && (
            <div className="flex items-center justify-between">
              <span>Modo:</span>
              <Badge variant="secondary">Local</Badge>
            </div>
          )}
          {lastSync && (
            <div className="flex items-center justify-between">
              <span>Última Sincronização:</span>
              <span className="text-muted-foreground">{formatLastSync()}</span>
            </div>
          )}
        </div>

        <DropdownMenuSeparator />

        {isLocal && isOnline && onToggleOffline && (
          <>
            <DropdownMenuCheckboxItem
              checked={!isOffline}
              onCheckedChange={(checked) => onToggleOffline(!checked)}
            >
              Trabalhar em Modo Sincronizado
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={isOffline}
              onCheckedChange={(checked) => onToggleOffline(checked)}
            >
              Trabalhar em Modo Offline
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
          </>
        )}

        {onSignOut && (
          <DropdownMenuItem onClick={onSignOut} className="text-destructive focus:text-destructive">
            Sair
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


## Tags
#categoria/frontend
