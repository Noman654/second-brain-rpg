-- Second Brain RPG Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  avatar_url TEXT,
  level INTEGER DEFAULT 1,
  current_xp INTEGER DEFAULT 0,
  xp_to_next_level INTEGER DEFAULT 100,
  strength INTEGER DEFAULT 1,
  intellect INTEGER DEFAULT 1,
  charisma INTEGER DEFAULT 1,
  wealth INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Areas (Realms)
CREATE TABLE areas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  associated_attribute TEXT NOT NULL,
  current_level INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects (Quests)
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  linked_area_id UUID REFERENCES areas(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  xp_reward INTEGER NOT NULL,
  deadline TIMESTAMPTZ,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Milestones
CREATE TABLE milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  is_done BOOLEAN DEFAULT FALSE,
  position INTEGER DEFAULT 0
);

-- Habits (Daily Quests)
CREATE TABLE habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  linked_area_id UUID REFERENCES areas(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  target_minutes INTEGER,
  xp_reward INTEGER DEFAULT 25,
  streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  last_completed_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resources (Lore/Notes)
CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Archives (Completed Quests Log)
CREATE TABLE archives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  original_id UUID,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  completed_date TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_areas_user_id ON areas(user_id);
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_habits_user_id ON habits(user_id);
CREATE INDEX idx_resources_user_id ON resources(user_id);
CREATE INDEX idx_archives_user_id ON archives(user_id);
CREATE INDEX idx_milestones_project_id ON milestones(project_id);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE archives ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only access their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Areas: Users can only access their own areas
CREATE POLICY "Users can view own areas" ON areas
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own areas" ON areas
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own areas" ON areas
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own areas" ON areas
  FOR DELETE USING (auth.uid() = user_id);

-- Projects: Users can only access their own projects
CREATE POLICY "Users can view own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON projects
  FOR DELETE USING (auth.uid() = user_id);

-- Milestones: Users can access milestones of their projects
CREATE POLICY "Users can view own milestones" ON milestones
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects WHERE projects.id = milestones.project_id AND projects.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can insert own milestones" ON milestones
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects WHERE projects.id = milestones.project_id AND projects.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can update own milestones" ON milestones
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM projects WHERE projects.id = milestones.project_id AND projects.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can delete own milestones" ON milestones
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM projects WHERE projects.id = milestones.project_id AND projects.user_id = auth.uid()
    )
  );

-- Habits: Users can only access their own habits
CREATE POLICY "Users can view own habits" ON habits
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own habits" ON habits
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own habits" ON habits
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own habits" ON habits
  FOR DELETE USING (auth.uid() = user_id);

-- Resources: Users can only access their own resources
CREATE POLICY "Users can view own resources" ON resources
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own resources" ON resources
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own resources" ON resources
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own resources" ON resources
  FOR DELETE USING (auth.uid() = user_id);

-- Archives: Users can only access their own archives
CREATE POLICY "Users can view own archives" ON archives
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own archives" ON archives
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  
  -- Create default areas for new user
  INSERT INTO public.areas (user_id, title, associated_attribute) VALUES
    (NEW.id, 'Work & Career', 'wealth'),
    (NEW.id, 'Health & Fitness', 'strength'),
    (NEW.id, 'Learning', 'intellect'),
    (NEW.id, 'Social', 'charisma');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call function on new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
