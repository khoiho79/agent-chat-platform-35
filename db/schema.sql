CREATE SCHEMA IF NOT EXISTS project_35;

CREATE TABLE IF NOT EXISTS project_35.tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  priority TEXT NOT NULL DEFAULT 'normal',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

ALTER TABLE project_35.tasks ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE project_35.tasks ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE project_35.tasks ADD COLUMN IF NOT EXISTS priority TEXT NOT NULL DEFAULT 'normal';
ALTER TABLE project_35.tasks ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();
ALTER TABLE project_35.tasks ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON project_35.tasks (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON project_35.tasks (status);

CREATE TABLE IF NOT EXISTS project_35.messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT,
  role TEXT,
  content TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

ALTER TABLE project_35.messages ADD COLUMN IF NOT EXISTS conversation_id TEXT;
ALTER TABLE project_35.messages ADD COLUMN IF NOT EXISTS role TEXT;
ALTER TABLE project_35.messages ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE project_35.messages ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON project_35.messages (conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON project_35.messages (created_at DESC);

CREATE TABLE IF NOT EXISTS project_35.memory (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  memory_key TEXT,
  value TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

ALTER TABLE project_35.memory ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE project_35.memory ADD COLUMN IF NOT EXISTS memory_key TEXT;
ALTER TABLE project_35.memory ADD COLUMN IF NOT EXISTS value TEXT;
ALTER TABLE project_35.memory ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_memory_user_id ON project_35.memory (user_id);
CREATE INDEX IF NOT EXISTS idx_memory_created_at ON project_35.memory (created_at DESC);

CREATE TABLE IF NOT EXISTS project_35.notes (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

ALTER TABLE project_35.notes ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE project_35.notes ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_notes_created_at ON project_35.notes (created_at DESC);
