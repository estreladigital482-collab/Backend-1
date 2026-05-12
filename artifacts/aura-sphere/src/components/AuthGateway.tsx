import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLocalAuth } from '@/hooks/useLocalAuth';

interface AuthGatewayProps {
  onAuthenticated: (user: any) => void;
}

export function AuthGateway({ onAuthenticated }: AuthGatewayProps) {
  const [mode, setMode] = useState<'choice' | 'local'>('choice');
  const [localName, setLocalName] = useState('');
  const { createLocalUser } = useLocalAuth();

  const handleLocalStart = () => {
    const user = createLocalUser(localName.trim() || 'Caos');
    onAuthenticated(user);
  };

  if (mode === 'choice') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              Bem-vindo ao Caos
            </CardTitle>
            <CardDescription>
              Escolha como deseja acessar sua IA pessoal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => setMode('local')}
              className="w-full h-12 text-lg"
            >
              🚀 Começar Agora
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Modo Local
          </CardTitle>
          <CardDescription>
            Acesse instantaneamente sem criar conta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Como você quer chamar sua IA?</Label>
            <Input
              id="name"
              value={localName}
              onChange={(e) => setLocalName(e.target.value)}
              placeholder="Caos"
              onKeyDown={(e) => e.key === 'Enter' && handleLocalStart()}
            />
          </div>
          <Button onClick={handleLocalStart} className="w-full h-12 text-lg">
            🚀 Iniciar
          </Button>
          <Button
            onClick={() => setMode('choice')}
            variant="ghost"
            className="w-full"
          >
            ← Voltar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
