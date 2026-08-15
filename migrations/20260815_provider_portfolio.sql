-- Migration: 20260815_provider_portfolio.sql
-- Description: Configure portfolio storage bucket, storage RLS policies, and portfolio_items security

-- 1. Create or update portfolio bucket in storage.buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'portfolio',
  'portfolio',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- 2. Storage RLS Policies for 'portfolio' bucket

-- Drop existing storage policies if present to prevent conflicts
DROP POLICY IF EXISTS "Public read portfolio storage" ON storage.objects;
DROP POLICY IF EXISTS "Provider insert own portfolio storage" ON storage.objects;
DROP POLICY IF EXISTS "Provider update own portfolio storage" ON storage.objects;
DROP POLICY IF EXISTS "Provider delete own portfolio storage" ON storage.objects;

-- Allow public read access to portfolio bucket objects
CREATE POLICY "Public read portfolio storage"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'portfolio');

-- Allow authenticated providers to insert objects only into their own provider folder: portfolio/{provider_profile_id}/filename
CREATE POLICY "Provider insert own portfolio storage"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'portfolio' AND
  EXISTS (
    SELECT 1 FROM public.provider_profiles pp
    JOIN public.profiles p ON p.id = pp.profile_id
    WHERE pp.id::text = (storage.foldername(name))[1]
    AND p.user_id = auth.uid()
  )
);

-- Allow authenticated providers to update objects in their own folder
CREATE POLICY "Provider update own portfolio storage"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'portfolio' AND
  EXISTS (
    SELECT 1 FROM public.provider_profiles pp
    JOIN public.profiles p ON p.id = pp.profile_id
    WHERE pp.id::text = (storage.foldername(name))[1]
    AND p.user_id = auth.uid()
  )
)
WITH CHECK (
  bucket_id = 'portfolio' AND
  EXISTS (
    SELECT 1 FROM public.provider_profiles pp
    JOIN public.profiles p ON p.id = pp.profile_id
    WHERE pp.id::text = (storage.foldername(name))[1]
    AND p.user_id = auth.uid()
  )
);

-- Allow authenticated providers to delete objects from their own folder
CREATE POLICY "Provider delete own portfolio storage"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'portfolio' AND
  EXISTS (
    SELECT 1 FROM public.provider_profiles pp
    JOIN public.profiles p ON p.id = pp.profile_id
    WHERE pp.id::text = (storage.foldername(name))[1]
    AND p.user_id = auth.uid()
  )
);

-- 3. Ensure portfolio_items table policies
DROP POLICY IF EXISTS "Public view published portfolio items" ON public.portfolio_items;
DROP POLICY IF EXISTS "Providers manage own portfolio" ON public.portfolio_items;

CREATE POLICY "Public view published portfolio items"
ON public.portfolio_items FOR SELECT
TO public
USING (
  EXISTS (
    SELECT 1 FROM public.provider_profiles pp 
    WHERE pp.id = public.portfolio_items.provider_id AND pp.status = 'published'
  )
);

CREATE POLICY "Providers manage own portfolio"
ON public.portfolio_items FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.provider_profiles pp 
    JOIN public.profiles p ON p.id = pp.profile_id 
    WHERE pp.id = public.portfolio_items.provider_id AND p.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.provider_profiles pp 
    JOIN public.profiles p ON p.id = pp.profile_id 
    WHERE pp.id = public.portfolio_items.provider_id AND p.user_id = auth.uid()
  )
);
