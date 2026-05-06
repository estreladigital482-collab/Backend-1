-- Tabelas para Abilities
CREATE TABLE IF NOT EXISTS abilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    source_repo VARCHAR(500),
    functions_json JSONB,
    version VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ability_id UUID REFERENCES abilities(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    parameters JSONB,
    examples JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabelas para Social
CREATE TABLE IF NOT EXISTS social_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    platform VARCHAR(50),
    username VARCHAR(255),
    auth_token_encrypted TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    synced_at TIMESTAMP,
    UNIQUE(user_id, platform, username)
);

CREATE TABLE IF NOT EXISTS saved_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID REFERENCES social_accounts(id) ON DELETE CASCADE,
    platform_post_id VARCHAR(500),
    content_type VARCHAR(50),
    title VARCHAR(500),
    url TEXT,
    metadata_json JSONB,
    category VARCHAR(100),
    saved_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS content_collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    collection_name VARCHAR(255),
    filters_json JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabelas para Device
CREATE TABLE IF NOT EXISTS device_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    device_type VARCHAR(50),
    os VARCHAR(50),
    storage_mb BIGINT,
    ram_mb BIGINT,
    capabilities JSONB,
    health_score INT,
    last_seen TIMESTAMP,
    UNIQUE(user_id)
);

-- Tabelas para Security
CREATE TABLE IF NOT EXISTS security_issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    component VARCHAR(255),
    severity VARCHAR(20),
    description TEXT,
    resolution TEXT,
    reported_at TIMESTAMP DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'open',
    updated_at TIMESTAMP
);

-- Criar índices
CREATE INDEX idx_abilities_user_id ON abilities(user_id);
CREATE INDEX idx_abilities_name ON abilities(name);
CREATE INDEX idx_social_accounts_user_id ON social_accounts(user_id);
CREATE INDEX idx_saved_content_account_id ON saved_content(account_id);
CREATE INDEX idx_saved_content_category ON saved_content(category);
CREATE INDEX idx_content_collections_user_id ON content_collections(user_id);
CREATE INDEX idx_device_profiles_user_id ON device_profiles(user_id);
CREATE INDEX idx_security_issues_status ON security_issues(status);
