/**
 * CAOS — Aplicador de Migration
 * Uso: node lib/db/migrations/apply.mjs
 *
 * Lê o arquivo SQL de migration e aplica no banco via DATABASE_URL.
 * Seguro para rodar múltiplas vezes — usa IF EXISTS em cada renomeação.
 */

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import pg from "pg";

const { Client } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dir = dirname(__filename);

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL não definida.");
  process.exit(1);
}

const MIGRATION_FILE = join(__dir, "001_rename_to_caos.sql");
const sql = readFileSync(MIGRATION_FILE, "utf8");

const client = new Client({ connectionString: DATABASE_URL });

async function run() {
  console.log("🔌 Conectando ao banco...");
  await client.connect();

  console.log("📋 Listando tabelas ANTES da migration:");
  const before = await client.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
  );
  console.table(before.rows.map((r) => r.table_name));

  console.log("\n🚀 Aplicando migration 001_rename_to_caos.sql...\n");
  try {
    await client.query(sql);
    console.log("✅ Migration aplicada com sucesso!\n");
  } catch (err) {
    console.error("❌ Erro ao aplicar migration:", err.message);
    await client.end();
    process.exit(1);
  }

  console.log("📋 Listando tabelas APÓS a migration:");
  const after = await client.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
  );
  console.table(after.rows.map((r) => r.table_name));

  await client.end();
  console.log("\n✅ Concluído.");
}

run().catch((err) => {
  console.error("Erro fatal:", err);
  process.exit(1);
});
