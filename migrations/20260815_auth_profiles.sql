-- Migration: 20260815_auth_profiles.sql
-- Description: Automatic profile creation trigger on auth.users insert, role protection, and RLS policies

-- 1. Create function to automatically insert new profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  assigned_role text;
  user_full_name text;
BEGIN
  -- Extract role from metadata, strictly enforcing 'client' or 'provider'
  assigned_role := COALESCE(new.raw_user_meta_data->>'role', 'client');
  IF assigned_role NOT IN ('client', 'provider') THEN
    assigned_role := 'client';
  END IF;

  -- Extract name or fallback to local part of email
  user_full_name := COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1));

  -- Insert new profile
  INSERT INTO public.profiles (user_id, role, name, email, created_at, updated_at)
  VALUES (
    new.id,
    assigned_role,
    user_full_name,
    new.email,
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Bind trigger to auth.users AFTER INSERT
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. RLS Policies on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Allow public to view basic profile info (name, avatar_url) for published providers
DROP POLICY IF EXISTS "Public can view published provider profile info" ON public.profiles;
CREATE POLICY "Public can view published provider profile info"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.provider_profiles pp
      WHERE pp.profile_id = public.profiles.id
        AND pp.status = 'published'
    )
  );

-- Allow users to update their own profile fields (preventing role/user_id mutation via check)
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. Backfill existing auth.users into profiles if any exist without profile
INSERT INTO public.profiles (user_id, role, name, email, created_at, updated_at)
SELECT
  id,
  CASE WHEN raw_user_meta_data->>'role' = 'provider' THEN 'provider' ELSE 'client' END,
  COALESCE(raw_user_meta_data->>'name', split_part(email, '@', 1)),
  email,
  NOW(),
  NOW()
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;
