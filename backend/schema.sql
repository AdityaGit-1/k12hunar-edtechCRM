-- ============================================================
-- HunarDesk database schema (Supabase / PostgreSQL)
--
-- How to run: Supabase Dashboard -> SQL Editor -> New query ->
-- paste this whole file -> Run. It is safe to run more than once.
-- ============================================================

-- ---------- admins ----------
-- Admin accounts for the dashboard. Passwords are stored only as
-- bcrypt hashes; the plain password is never saved.
CREATE TABLE IF NOT EXISTS admins (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT         NOT NULL,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- ---------- inquiries ----------
-- One row per public inquiry form submission.
-- user_type, category and status are restricted with CHECK
-- constraints so the database rejects invalid values even if
-- the API validation is ever bypassed.
CREATE TABLE IF NOT EXISTS inquiries (
  id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(255) NOT NULL,
  phone      VARCHAR(20)  NOT NULL,
  user_type  VARCHAR(20)  NOT NULL
             CHECK (user_type IN ('parent', 'student', 'school')),
  category   VARCHAR(30)  NOT NULL
             CHECK (category IN ('scholarship', 'concert', 'admission', 'general_query')),
  message    TEXT         NOT NULL
             CHECK (char_length(message) BETWEEN 10 AND 2000),
  status     VARCHAR(20)  NOT NULL DEFAULT 'new'
             CHECK (status IN ('new', 'in_progress', 'resolved')),
  created_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- ---------- indexes ----------
-- The dashboard sorts by newest first and filters on these columns.
CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON inquiries (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inquiries_category   ON inquiries (category);
CREATE INDEX IF NOT EXISTS idx_inquiries_user_type  ON inquiries (user_type);
CREATE INDEX IF NOT EXISTS idx_inquiries_status     ON inquiries (status);

-- ---------- row level security ----------
-- Supabase exposes tables in the public schema through its REST API
-- using the public "anon" key. This app never uses that API: only
-- the Express backend talks to the database, through the Postgres
-- connection string. Enabling RLS with no policies blocks all access
-- via the REST API, while the backend's direct connection is unaffected.
ALTER TABLE admins    ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
