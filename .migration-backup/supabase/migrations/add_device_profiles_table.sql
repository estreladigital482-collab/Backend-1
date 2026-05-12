-- Tabela para perfis de dispositivos
CREATE TABLE IF NOT EXISTS device_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    device_type VARCHAR(50), -- desktop, mobile, tablet, etc.
    os VARCHAR(100), -- Windows, Linux, macOS
    os_version VARCHAR(100),
    storage_total_mb INTEGER,
    storage_free_mb INTEGER,
    ram_total_mb INTEGER,
    ram_available_mb INTEGER,
    cpu_cores INTEGER,
    cpu_freq_mhz DECIMAL(10,2),
    capabilities JSONB, -- {gpu_acceleration: bool, large_storage: bool, etc.}
    health_score INTEGER CHECK (health_score >= 0 AND health_score <= 100),
    last_seen TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, device_type, os) -- Um perfil por tipo de device/OS por usuário
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_device_profiles_user_id ON device_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_device_profiles_health_score ON device_profiles(health_score);
CREATE INDEX IF NOT EXISTS idx_device_profiles_last_seen ON device_profiles(last_seen);