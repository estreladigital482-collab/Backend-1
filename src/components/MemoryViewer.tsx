import React, { useState, useEffect } from 'react';
import { getApiBase } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Brain, Clock, Tag } from 'lucide-react';

interface MemoryItem {
  id: string;
  content: string;
  category: string;
  tags: string[];
  timestamp: string;
  relevance: number;
}

interface MemoryViewerProps {
  userId: string;
  onMemorySelect?: (memory: MemoryItem) => void;
}

export function MemoryViewer({ userId, onMemorySelect }: MemoryViewerProps) {
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMemories = async () => {
      setIsLoading(true);
      const storedMemories = (JSON.parse(localStorage.getItem('aura_sphere_memories') || '[]') as MemoryItem[])
        .map((memory) => ({
          ...memory,
          relevance: memory.relevance ?? 0.75,
        }));

      if (!navigator.onLine) {
        setMemories(storedMemories);
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${getApiBase()}/api/v1/memories?user_id=${encodeURIComponent(userId)}`);
        if (!response.ok) {
          throw new Error(`Memory request failed ${response.status}`);
        }

        const result = (await response.json()) as { memories?: MemoryItem[] };
        const remoteMemories = result.memories ?? [];
        const merged = [...storedMemories, ...remoteMemories];

        setMemories(merged);
      } catch (error) {
        setMemories(storedMemories);
      } finally {
        setIsLoading(false);
      }
    };

    loadMemories();
  }, [userId]);

  const filteredMemories = memories.filter(memory => {
    const matchesSearch = memory.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         memory.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || memory.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Array.from(new Set(memories.map(m => m.category)))];

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `${diffDays} dias atrás`;
    return date.toLocaleDateString('pt-BR');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Brain className="w-8 h-8 animate-pulse mx-auto mb-2 text-purple-500" />
          <p className="text-gray-400">Carregando memórias...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-500" />
            Memória da IA
          </h2>
          <p className="text-gray-400 mt-1">
            {memories.length} memórias armazenadas sobre você
          </p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Memória
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar memórias..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-700 text-white"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="whitespace-nowrap"
            >
              {category === 'all' ? 'Todas' : category}
            </Button>
          ))}
        </div>
      </div>

      {/* Memory Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredMemories.map(memory => (
          <Card
            key={memory.id}
            className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors cursor-pointer"
            onClick={() => onMemorySelect?.(memory)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <Badge variant="secondary" className="text-xs">
                  {memory.category}
                </Badge>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock className="w-3 h-3" />
                  {formatTimestamp(memory.timestamp)}
                </div>
              </div>
              <CardTitle className="text-sm text-white line-clamp-2">
                {memory.content}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-1">
                {memory.tags.slice(0, 3).map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    <Tag className="w-2 h-2 mr-1" />
                    {tag}
                  </Badge>
                ))}
                {memory.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{memory.tags.length - 3}
                  </Badge>
                )}
              </div>
              <div className="mt-2 text-xs text-gray-400">
                Relevância: {Math.round(memory.relevance * 100)}%
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMemories.length === 0 && (
        <div className="text-center py-12">
          <Brain className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-400 mb-2">
            Nenhuma memória encontrada
          </h3>
          <p className="text-gray-500">
            {searchTerm ? 'Tente ajustar os filtros de busca' : 'As memórias serão criadas automaticamente durante as conversas'}
          </p>
        </div>
      )}
    </div>
  );
}