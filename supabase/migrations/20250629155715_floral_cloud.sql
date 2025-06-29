/*
# Career Weave Database Schema

This migration creates the complete database schema for the Career Weave application.

## New Tables
1. **profiles** - User profile information linked to auth.users
2. **work_experiences** - User's work history and job experiences  
3. **projects** - User's portfolio projects and accomplishments
4. **skills** - User's technical and soft skills
5. **weaves** - AI-generated career documents and job applications
6. **interview_sessions** - Mock interview questions, answers, and AI feedback

## Security
- Row Level Security (RLS) enabled on all tables
- Policies ensure users can only access their own data
- Foreign key constraints maintain data integrity

## Features
- UUID primary keys for all tables
- Proper timestamps and audit trails
- Optimized for the Career Weave AI workflow
*/

-- Enable the UUID generation function if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (links to auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'Users can view and update their own profile.'
  ) THEN
    CREATE POLICY "Users can view and update their own profile."
    ON profiles FOR ALL
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- 2. WORK EXPERIENCES TABLE
CREATE TABLE IF NOT EXISTS work_experiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_title TEXT NOT NULL,
  company_name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for work_experiences
ALTER TABLE work_experiences ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'work_experiences' AND policyname = 'Users can manage their own work experiences.'
  ) THEN
    CREATE POLICY "Users can manage their own work experiences."
    ON work_experiences FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- 3. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_title TEXT NOT NULL,
  description TEXT NOT NULL,
  project_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'projects' AND policyname = 'Users can manage their own projects.'
  ) THEN
    CREATE POLICY "Users can manage their own projects."
    ON projects FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- 4. SKILLS TABLE
CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for skills
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'skills' AND policyname = 'Users can manage their own skills.'
  ) THEN
    CREATE POLICY "Users can manage their own skills."
    ON skills FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- 5. WEAVES TABLE (for AI results)
CREATE TABLE IF NOT EXISTS weaves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_url TEXT NOT NULL,
  job_title TEXT,
  company_name TEXT,
  generated_resume TEXT,
  generated_cover_letter TEXT,
  generated_interview_strategy JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for weaves
ALTER TABLE weaves ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'weaves' AND policyname = 'Users can manage their own weaves.'
  ) THEN
    CREATE POLICY "Users can manage their own weaves."
    ON weaves FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- 6. INTERVIEW_SESSIONS TABLE (for the new AI Interview feature)
CREATE TABLE IF NOT EXISTS interview_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  weave_id UUID NOT NULL REFERENCES weaves(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  user_answer TEXT,
  ai_feedback TEXT,
  question_number INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for interview_sessions
ALTER TABLE interview_sessions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'interview_sessions' AND policyname = 'Users can manage their own interview sessions.'
  ) THEN
    CREATE POLICY "Users can manage their own interview sessions."
    ON interview_sessions FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;