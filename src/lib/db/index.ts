import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'today-report.db');

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    // Ensure data directory exists
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');

    // Initialize schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf-8');
      db.exec(schema);
    } else {
      // Inline schema as fallback (when bundled)
      db.exec(`
        CREATE TABLE IF NOT EXISTS user_profile (
          id INTEGER PRIMARY KEY DEFAULT 1,
          name TEXT,
          skills TEXT NOT NULL DEFAULT '[]',
          technologies TEXT NOT NULL DEFAULT '[]',
          projects TEXT NOT NULL DEFAULT '[]',
          interests TEXT NOT NULL DEFAULT '[]',
          created_at TEXT DEFAULT (datetime('now')),
          updated_at TEXT DEFAULT (datetime('now'))
        );
        CREATE TABLE IF NOT EXISTS briefings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          date TEXT NOT NULL UNIQUE,
          status TEXT NOT NULL DEFAULT 'pending',
          content TEXT,
          raw_search_results TEXT,
          ai_provider TEXT,
          ai_model TEXT,
          token_usage TEXT,
          generation_time_ms INTEGER,
          created_at TEXT DEFAULT (datetime('now')),
          error TEXT
        );
        INSERT OR IGNORE INTO user_profile (id, name, skills, technologies, projects, interests)
        VALUES (1, NULL, '[]', '[]', '[]', '[]');
      `);
    }
  }
  return db;
}
