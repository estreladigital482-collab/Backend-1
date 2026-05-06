import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Share2, ExternalLink, Loader } from 'lucide-react';

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
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('anime');

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

  const handleLike = (itemId: string) => {
    // TODO: Implementar like
    console.log('Like item:', itemId);
  };

  const handleShare = (itemId: string) => {
    // TODO: Implementar share
    console.log('Share item:', itemId);
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
                        variant="outline"
                        onClick={() => handleLike(item.id)}
                      >
                        <Heart size={14} />
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