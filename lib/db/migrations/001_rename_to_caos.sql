-- ============================================================
-- CAOS — Migration 001: Renomear tabelas para identidade CAOS
-- Data: 2026-05-13
-- Segurança: usa DO $$ ... END para verificar existência antes
-- ============================================================

DO $$
BEGIN

  -- ── CAOS Shell (ex-Aura Sphere) ──────────────────────────

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public') THEN
    ALTER TABLE profiles RENAME TO caos_profiles;
    RAISE NOTICE 'profiles → caos_profiles ✓';
  ELSE
    RAISE NOTICE 'Tabela profiles não encontrada (já renomeada ou não existe)';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chat_messages' AND table_schema = 'public') THEN
    ALTER TABLE chat_messages RENAME TO caos_chat_messages;
    RAISE NOTICE 'chat_messages → caos_chat_messages ✓';
  ELSE
    RAISE NOTICE 'Tabela chat_messages não encontrada';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'memories' AND table_schema = 'public') THEN
    ALTER TABLE memories RENAME TO caos_shell_memories;
    RAISE NOTICE 'memories → caos_shell_memories ✓';
  ELSE
    RAISE NOTICE 'Tabela memories não encontrada';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'skills' AND table_schema = 'public') THEN
    ALTER TABLE skills RENAME TO caos_shell_skills;
    RAISE NOTICE 'skills → caos_shell_skills ✓';
  ELSE
    RAISE NOTICE 'Tabela skills não encontrada';
  END IF;

  -- ── CAOS Nexus (ex-Nexus AI) ──────────────────────────────

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_profiles' AND table_schema = 'public') THEN
    ALTER TABLE ai_profiles RENAME TO caos_ai_profiles;
    RAISE NOTICE 'ai_profiles → caos_ai_profiles ✓';
  ELSE
    RAISE NOTICE 'Tabela ai_profiles não encontrada';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'nexus_skills' AND table_schema = 'public') THEN
    ALTER TABLE nexus_skills RENAME TO caos_nexus_skills;
    RAISE NOTICE 'nexus_skills → caos_nexus_skills ✓';
  ELSE
    RAISE NOTICE 'Tabela nexus_skills não encontrada';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'nexus_conversations' AND table_schema = 'public') THEN
    ALTER TABLE nexus_conversations RENAME TO caos_nexus_conversations;
    RAISE NOTICE 'nexus_conversations → caos_nexus_conversations ✓';
  ELSE
    RAISE NOTICE 'Tabela nexus_conversations não encontrada';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'nexus_messages' AND table_schema = 'public') THEN
    ALTER TABLE nexus_messages RENAME TO caos_nexus_messages;
    RAISE NOTICE 'nexus_messages → caos_nexus_messages ✓';
  ELSE
    RAISE NOTICE 'Tabela nexus_messages não encontrada';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'nexus_activity_log' AND table_schema = 'public') THEN
    ALTER TABLE nexus_activity_log RENAME TO caos_nexus_activity_log;
    RAISE NOTICE 'nexus_activity_log → caos_nexus_activity_log ✓';
  ELSE
    RAISE NOTICE 'Tabela nexus_activity_log não encontrada';
  END IF;

  -- ── CAOS Hub (ex-Creator Hub) ─────────────────────────────

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'hub_items' AND table_schema = 'public') THEN
    ALTER TABLE hub_items RENAME TO caos_hub_items;
    RAISE NOTICE 'hub_items → caos_hub_items ✓';
  ELSE
    RAISE NOTICE 'Tabela hub_items não encontrada';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'hub_themes' AND table_schema = 'public') THEN
    ALTER TABLE hub_themes RENAME TO caos_hub_themes;
    RAISE NOTICE 'hub_themes → caos_hub_themes ✓';
  ELSE
    RAISE NOTICE 'Tabela hub_themes não encontrada';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'hub_agents' AND table_schema = 'public') THEN
    ALTER TABLE hub_agents RENAME TO caos_hub_agents;
    RAISE NOTICE 'hub_agents → caos_hub_agents ✓';
  ELSE
    RAISE NOTICE 'Tabela hub_agents não encontrada';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'hub_skills' AND table_schema = 'public') THEN
    ALTER TABLE hub_skills RENAME TO caos_hub_skills;
    RAISE NOTICE 'hub_skills → caos_hub_skills ✓';
  ELSE
    RAISE NOTICE 'Tabela hub_skills não encontrada';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'hub_projects' AND table_schema = 'public') THEN
    ALTER TABLE hub_projects RENAME TO caos_hub_projects;
    RAISE NOTICE 'hub_projects → caos_hub_projects ✓';
  ELSE
    RAISE NOTICE 'Tabela hub_projects não encontrada';
  END IF;

END $$;
