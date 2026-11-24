-- users: everyone who has an account
CREATE TABLE IF NOT EXISTS users (
  id              SERIAL PRIMARY KEY,
  name            TEXT NOT NULL,
  email           TEXT NOT NULL UNIQUE,
  password_hash   TEXT NOT NULL,
  role            TEXT NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN')),
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  phone_encrypted TEXT,
  created_at      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- sessions: one row per logged-in browser
CREATE TABLE IF NOT EXISTS sessions (
  token      TEXT PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions (user_id);

-- expenses: every expense belongs to one user
CREATE TABLE IF NOT EXISTS expenses (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  amount     NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
  category   TEXT NOT NULL DEFAULT 'Other',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_expenses_user_created ON expenses (user_id, created_at);