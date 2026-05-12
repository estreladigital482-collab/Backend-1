-- Migração para tabelas de integração com Instagram
-- Aura Sphere - Sprint 5-6: Instagram Integration

-- Tabela para contas sociais conectadas
CREATE TABLE IF NOT EXISTS social_accounts (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    platform VARCHAR(50) NOT NULL DEFAULT 'instagram',
    username VARCHAR(255) NOT NULL,
    auth_token_encrypted TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    synced_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,

    UNIQUE(user_id, platform, username)
);

-- Tabela para conteúdo salvo
CREATE TABLE IF NOT EXISTS saved_content (
    id SERIAL PRIMARY KEY,
    account_id INTEGER REFERENCES social_accounts(id) ON DELETE CASCADE,
    ig_post_id VARCHAR(255) NOT NULL,
    content_type VARCHAR(50) NOT NULL, -- 'photo', 'video', 'carousel', 'reel'
    title TEXT,
    url TEXT,
    media_url TEXT,
    thumbnail_url TEXT,
    metadata_json JSONB,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    category VARCHAR(100),
    tags TEXT[], -- Array de tags para busca

    UNIQUE(account_id, ig_post_id)
);

-- Tabela para coleções de conteúdo
CREATE TABLE IF NOT EXISTS content_collections (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    collection_name VARCHAR(255) NOT NULL,
    filters_json JSONB, -- Filtros aplicados à coleção
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,

    UNIQUE(user_id, collection_name)
);

-- Tabela para analytics sociais
CREATE TABLE IF NOT EXISTS social_analytics (
    id SERIAL PRIMARY KEY,
    account_id INTEGER REFERENCES social_accounts(id) ON DELETE CASCADE,
    metric_type VARCHAR(100) NOT NULL, -- 'followers', 'following', 'posts', 'engagement'
    value INTEGER NOT NULL,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_social_accounts_user_platform ON social_accounts(user_id, platform);
CREATE INDEX IF NOT EXISTS idx_saved_content_account ON saved_content(account_id);
CREATE INDEX IF NOT EXISTS idx_saved_content_category ON saved_content(category);
CREATE INDEX IF NOT EXISTS idx_saved_content_tags ON saved_content USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_content_collections_user ON content_collections(user_id);
CREATE INDEX IF NOT EXISTS idx_social_analytics_account ON social_analytics(account_id, metric_type);

-- Políticas RLS (Row Level Security) se usar Supabase
-- ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE saved_content ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE content_collections ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE social_analytics ENABLE ROW LEVEL SECURITY;