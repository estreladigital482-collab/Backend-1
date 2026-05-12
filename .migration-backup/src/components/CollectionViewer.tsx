import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Share2, ExternalLink, Loader } from 'lucide-react';
import { useLocalAuth } from '@/hooks/useLocalAuth';
import { useToast } from '@/hooks/use-toast';

interface CollectionItem {
  id: string;
  title: string;
  url: string;
  type: string;
  category?: string;
}

interface Recommendation {
  type: string;
  title: string;
  items: CollectionItem[];
}

interface CollectionViewerProps {
  collectionId?: string;
  userId: string;
}

export function CollectionViewer({ collectionId, userId }: CollectionViewerProps) {
  const { user } = useLocalAuth();
  const { toast } = useToast();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('anime');
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadRecommendations();
  }, [theme, userId]);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/v1/social/instagram/recommendations?user_id=${userId}&theme=${theme}&limit=10`
      );
      const data = await response.json();
      setRecommendations(data.recommendations || []);
    } catch (error) {
      console.error('Erro ao carregar recomendações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (itemId: string) => {
    if (!user?.id) {
      toast({
        title: "Erro",
        description: "Você precisa estar autenticado",
        variant: "destructive"
      });
      return;
    }

    try {
      // Toggle like state
      const newLikedItems = new Set(likedItems);
      if (newLikedItems.has(itemId)) {
        newLikedItems.delete(itemId);
      } else {
        newLikedItems.add(itemId);
      }
      setLikedItems(newLikedItems);

      // Aqui você poderia fazer chamada à API para persistir o like
      // await fetch(`/api/v1/social/instagram/like`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ user_id: user.id, item_id: itemId })
      // });

      toast({
        title: "Sucesso",
        description: newLikedItems.has(itemId) ? "Adicionado aos favoritos!" : "Removido dos favoritos",
      });
    } catch (error) {
      console.error('Erro ao curtir:', error);
      toast({
        title: "Erro",
        description: "Não foi possível processar a ação",
        variant: "destructive"
      });
    }
  };

  const handleShare = async (itemId: string) => {
    try {
      const item = recommendations
        .flatMap(r => r.items)
        .find(i => i.id === itemId);

      if (!item) return;

      // Usar Web Share API se disponível
      if (navigator.share) {
        await navigator.share({
          title: item.title,
          text: item.title,
          url: item.url
        });
      } else {
        // Fallback: copiar para clipboard
        await navigator.clipboard.writeText(item.url);
        toast({
          title: "Sucesso",
          description: "Link copiado para a área de transferência",
        });
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      toast({
        title: "Erro",
        description: "Não foi possível compartilhar",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader className="animate-spin" size={24} />
        <span className="ml-2">Carregando recomendações...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Recomendações</h2>
        <div className="flex gap-2">
          <Button
            variant={theme === 'anime' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTheme('anime')}
          >
            Anime
          </Button>
          <Button
            variant={theme === 'manga' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTheme('manga')}
          >
            Mangá
          </Button>
          <Button
            variant={theme === 'games' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTheme('games')}
          >
            Jogos
          </Button>
        </div>
      </div>

      {recommendations.map((rec, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="text-red-500" size={20} />
              {rec.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rec.items.map((item) => (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm line-clamp-2">
                        {item.title}
                      </h4>
                      <Badge variant="secondary" className="text-xs">
                        {item.type}
                      </Badge>
                    </div>

                    {item.category && (
                      <Badge variant="outline" className="text-xs mb-2">
                        {item.category}
                      </Badge>
                    )}

                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        variant={likedItems.has(item.id) ? "default" : "outline"}
                        onClick={() => handleLike(item.id)}
                        className={likedItems.has(item.id) ? "bg-red-600 hover:bg-red-700" : ""}
                      >
                        <Heart 
                          size={14} 
                          className={likedItems.has(item.id) ? "fill-current" : ""}
                        />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleShare(item.id)}
                      >
                        <Share2 size={14} />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        asChild
                      >
                        <a href={item.url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink size={14} />
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {recommendations.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              Nenhuma recomendação encontrada para o tema "{theme}".
              Tente sincronizar mais saves do Instagram primeiro.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}