# Database tables migration queries for setup
from db.database import get_db

CREATE_APPLICATIONS_TABLE = """
CREATE TABLE IF NOT EXISTS applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  company_name TEXT,
  role TEXT,
  hr_email TEXT NOT NULL,
  subject TEXT,
  mode_used TEXT,
  matched_skills TEXT[],
  word_count INTEGER,
  gmail_message_id TEXT,
  status TEXT DEFAULT 'sent',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_applications_user_id 
  ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_created_at 
  ON applications(created_at DESC);
"""

CREATE_PROFILES_TABLE = """
CREATE TABLE IF NOT EXISTS profiles (
  user_id TEXT PRIMARY KEY,
  profile_data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
"""

async def run_migrations():
    async with get_db() as db:
        # Enable pgcrypto extension to support gen_random_uuid() if not enabled
        await db.execute('CREATE EXTENSION IF NOT EXISTS "pgcrypto"')
        await db.execute(CREATE_APPLICATIONS_TABLE)
        await db.execute(CREATE_PROFILES_TABLE)
    print("Migrations complete")
