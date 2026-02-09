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

-- Seed default profile if none exists
INSERT OR IGNORE INTO user_profile (id, name, skills, technologies, projects, interests)
VALUES (1, NULL, '[]', '[]', '[]', '[]');
