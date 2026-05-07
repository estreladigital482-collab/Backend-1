import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLocalAuth } from '@/hooks/useLocalAuth';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface AuthGatewayProps {
  onAuthenticated: (user: any) => void;
}

export function AuthGateway({ onAuthenticated }: AuthGatewayProps) {
  const [mode, setMode] = useState<'choice' | 'local' | 'google'>('choice');
  const [localName, setLocalName] = useState('Caos');
  const { createLocalUser } = useLocalAuth();
  const { user: googleUser, loading: googleLoading } = useAuth();

  // Se já estiver logado com Google, prosseguir
  React.useEffect(() => {
    if (googleUser) {
      onAuthenticated(googleUser);
    }
  }, [googleUser, onAuthenticated]);

  const handleLocalStart = () => {
    const user = createLocalUser(localName);
    onAuthenticated(user);
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (error) {
      console.error('Erro no login Google:', error);
    }
  };

  if (mode === 'choice') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Bem-vindo ao Aura Sphere
            </CardTitle>
            <CardDescription>
              Escolha como deseja acessar sua IA pessoal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => setMode('local')}
              className="w-full h-12 text-lg"
              variant="outline"
            >
              🚀 Começar Agora (Modo Local)
            </Button>
            <Button
              onClick={() => setMode('google')}
              className="w-full h-12 text-lg"
              disabled={googleLoading}
            >
              🔐 Entrar com Google
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (mode === 'local') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Modo Local
            </CardTitle>
            <CardDescription>
              Acesse instantaneamente sem criar conta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da sua IA (opcional)</Label>
              <Input
                id="name"
                value={localName}
                onChange={(e) => setLocalName(e.target.value)}
                placeholder="Caos"
              />
            </div>
            <Button onClick={handleLocalStart} className="w-full h-12 text-lg">
              🚀 Iniciar Aura Sphere
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

  if (mode === 'google') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Entrar com Google
            </CardTitle>
            <CardDescription>
              Faça login para sincronizar seus dados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleGoogleLogin}
              className="w-full h-12 text-lg"
              disabled={googleLoading}
            >
              {googleLoading ? '🔄 Conectando...' : '🔐 Continuar com Google'}
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

  return null;
}