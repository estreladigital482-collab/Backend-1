import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLocalAuth } from '@/hooks/useLocalAuth';
import { useNavigate } from 'react-router-dom';

interface AuthGatewayProps {
  onAuthenticated: (user: any) => void;
}

export function AuthGateway({ onAuthenticated }: AuthGatewayProps) {
  const [mode, setMode] = useState<'choice' | 'local'>('choice');
  const [localName, setLocalName] = useState('');
  const { createLocalUser } = useLocalAuth();
  const navigate = useNavigate();

  const handleLocalStart = () => {
    const user = createLocalUser(localName.trim() || 'Caos');
    onAuthenticated(user);
  };

  if (mode === 'choice') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md border-white/10 bg-[hsl(224_71%_6%)]">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              Bem-vindo ao Caos
            </CardTitle>
            <CardDescription>
              Escolha como deseja acessar sua IA pessoal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={() => navigate('/sign-in')}
              className="w-full h-12 text-base bg-violet-600 hover:bg-violet-700"
            >
              Entrar / Criar conta
            </Button>
            <Button
              onClick={() => setMode('local')}
              className="w-full h-12 text-base"
              variant="outline"
            >
              🚀 Usar sem conta
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-white/10 bg-[hsl(224_71%_6%)]">
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
              className="bg-white/5 border-white/10 text-white"
            />
          </div>
          <Button onClick={handleLocalStart} className="w-full h-12 text-base bg-violet-600 hover:bg-violet-700">
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
