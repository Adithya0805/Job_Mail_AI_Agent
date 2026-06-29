-- Phase 3-C SQL Migration
-- Run this in your Supabase SQL Editor

CREATE TABLE applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- Enable RLS so users can only see their own rows
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Policy to restrict reads/updates/deletes to the owner
CREATE POLICY "Users see own applications"
  ON applications FOR ALL
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_applications_user_id ON applications(user_id);
CREATE INDEX idx_applications_created_at ON applications(created_at DESC);
