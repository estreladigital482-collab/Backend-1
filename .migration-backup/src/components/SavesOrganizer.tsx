import React, { useState, useEffect } from 'react';
import { Grid, List, Filter, Search, Tag, Calendar, Heart, MessageCircle, Eye } from 'lucide-react';

interface SavedPost {
  id: string;
  media_type: 'photo' | 'video' | 'carousel' | 'reel';
  taken_at: string;
  caption: string;
  like_count: number;
  comment_count: number;
  thumbnail_url: string;
  media_url: string;
  user: {
    username: string;
    full_name: string;
  };
  category?: string;
  tags?: string[];
}

interface SavesOrganizerProps {
  accountId: string;
}

export function SavesOrganizer({ accountId }: SavesOrganizerProps) {
  const [posts, setPosts] = useState<SavedPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<SavedPost[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSavedPosts();
  }, [accountId]);

  useEffect(() => {
    filterPosts();
  }, [posts, searchTerm, selectedCategory]);

  const loadSavedPosts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/v1/social/instagram/sync?user_id=${accountId}`);
      const data = await response.json();

      // Mock data para desenvolvimento
      const mockPosts: SavedPost[] = [
        {
          id: '1',
          media_type: 'photo',
          taken_at: '2024-01-15T10:30:00Z',
          caption: 'Beautiful sunset at the beach 🏖️ #sunset #beach #nature',
          like_count: 1250,
          comment_count: 45,
          thumbnail_url: '/api/placeholder/300/300',
          media_url: '/api/placeholder/300/300',
          user: { username: 'photographer', full_name: 'John Photographer' },
          category: 'nature',
          tags: ['sunset', 'beach', 'nature']
        },
        {
          id: '2',
          media_type: 'video',
          taken_at: '2024-01-14T15:20:00Z',
          caption: 'Amazing cooking tutorial! 🍳 #cooking #recipe #foodie',
          like_count: 890,
          comment_count: 23,
          thumbnail_url: '/api/placeholder/300/300',
          media_url: '/api/placeholder/300/300',
          user: { username: 'chef_master', full_name: 'Chef Master' },
          category: 'food',
          tags: ['cooking', 'recipe', 'foodie']
        },
        {
          id: '3',
          media_type: 'reel',
          taken_at: '2024-01-13T20:15:00Z',
          caption: 'Dance challenge! 💃 #dance #challenge #fun',
          like_count: 2100,
          comment_count: 89,
          thumbnail_url: '/api/placeholder/300/300',
          media_url: '/api/placeholder/300/300',
          user: { username: 'dancer_pro', full_name: 'Pro Dancer' },
          category: 'entertainment',
          tags: ['dance', 'challenge', 'fun']
        }
      ];

      setPosts(mockPosts);
    } catch (error) {
      console.error('Erro ao carregar posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterPosts = () => {
    let filtered = posts;

    // Filtro por categoria
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(post => post.category === selectedCategory);
    }

    // Filtro por busca
    if (searchTerm) {
      filtered = filtered.filter(post =>
        post.caption.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredPosts(filtered);
  };

  const categories = ['all', ...new Set(posts.map(p => p.category).filter(Boolean))];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6">
      {/* Header com controles */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Posts Salvos</h3>

        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'}`}
          >
            <Grid size={16} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'}`}
          >
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar posts salvos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-700 text-white placeholder-slate-400 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 bg-slate-700 text-white border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {categories.map(category => (
            <option key={category} value={category}>
              {category === 'all' ? 'Todas as categorias' : category.charAt(0).toUpperCase() + category.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-slate-400 mt-2">Carregando posts salvos...</p>
        </div>
      )}

      {/* Posts */}
      {!isLoading && (
        <>
          {filteredPosts.length === 0 ? (
            <div className="text-center text-slate-400 py-12">
              <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart size={24} className="text-slate-500" />
              </div>
              <p>Nenhum post encontrado</p>
              <p className="text-sm">Tente ajustar os filtros ou sincronizar novamente</p>
            </div>
          ) : (
            <div className={viewMode === 'grid'
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              : "space-y-4"
            }>
              {filteredPosts.map((post) => (
                <PostCard key={post.id} post={post} viewMode={viewMode} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function PostCard({ post, viewMode }: { post: SavedPost; viewMode: 'grid' | 'list' }) {
  const [isHovered, setIsHovered] = useState(false);

  if (viewMode === 'list') {
    return (
      <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-4 hover:border-slate-500 transition">
        <div className="flex gap-4">
          <div className="w-20 h-20 bg-slate-600 rounded-lg overflow-hidden flex-shrink-0">
            <img
              src={post.thumbnail_url}
              alt="Post thumbnail"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = '/api/placeholder/80/80';
              }}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-medium text-white text-sm">{post.user.username}</p>
                <p className="text-xs text-slate-400">{formatDate(post.taken_at)}</p>
              </div>
              <span className="px-2 py-1 bg-slate-600 text-xs rounded-full capitalize">
                {post.media_type}
              </span>
            </div>

            <p className="text-sm text-slate-300 mb-2 line-clamp-2">{post.caption}</p>

            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Heart size={12} />
                {post.like_count}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle size={12} />
                {post.comment_count}
              </span>
            </div>

            {post.tags && post.tags.length > 0 && (
              <div className="flex gap-1 mt-2 flex-wrap">
                {post.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="px-2 py-1 bg-blue-600 text-xs rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-slate-700/50 border border-slate-600 rounded-lg overflow-hidden hover:border-slate-500 transition cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="aspect-square bg-slate-600 relative">
        <img
          src={post.thumbnail_url}
          alt="Post thumbnail"
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = '/api/placeholder/300/300';
          }}
        />

        {post.media_type === 'video' && (
          <div className="absolute top-2 right-2 w-6 h-6 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
            <div className="w-0 h-0 border-l-3 border-l-white border-t-2 border-t-transparent border-b-2 border-b-transparent ml-0.5"></div>
          </div>
        )}

        {isHovered && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <Eye size={24} className="text-white" />
          </div>
        )}
      </div>

      <div className="p-3">
        <p className="font-medium text-white text-sm mb-1">{post.user.username}</p>
        <p className="text-xs text-slate-400 mb-2">{formatDate(post.taken_at)}</p>
        <p className="text-sm text-slate-300 line-clamp-2 mb-2">{post.caption}</p>

        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Heart size={12} />
              {post.like_count}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle size={12} />
              {post.comment_count}
            </span>
          </div>
          <span className="capitalize">{post.media_type}</span>
        </div>
      </div>
    </div>
  );
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('pt-BR');
}