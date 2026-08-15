-- Migration: 20260815_provider_onboarding.sql
-- Description: RLS security policies for provider_profiles, provider_services, and service_areas for onboarding management

-- 1. Enable RLS on all related tables
ALTER TABLE public.provider_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_areas ENABLE ROW LEVEL SECURITY;

-- -------------------------------------------------------------
-- POLICIES FOR provider_profiles
-- -------------------------------------------------------------

-- Public can view only published provider profiles
DROP POLICY IF EXISTS "Public can view published provider_profiles" ON public.provider_profiles;
CREATE POLICY "Public can view published provider_profiles"
  ON public.provider_profiles FOR SELECT
  USING (status = 'published');

-- Providers can view their own provider profile regardless of status
DROP POLICY IF EXISTS "Providers can view own provider_profile" ON public.provider_profiles;
CREATE POLICY "Providers can view own provider_profile"
  ON public.provider_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = public.provider_profiles.profile_id
        AND p.user_id = auth.uid()
    )
  );

-- Only authenticated users with role = 'provider' can insert their own provider_profile
DROP POLICY IF EXISTS "Providers can insert own provider_profile" ON public.provider_profiles;
CREATE POLICY "Providers can insert own provider_profile"
  ON public.provider_profiles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = profile_id
        AND p.user_id = auth.uid()
        AND p.role = 'provider'
    )
  );

-- Providers can update only their own provider_profile
DROP POLICY IF EXISTS "Providers can update own provider_profile" ON public.provider_profiles;
CREATE POLICY "Providers can update own provider_profile"
  ON public.provider_profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = public.provider_profiles.profile_id
        AND p.user_id = auth.uid()
        AND p.role = 'provider'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = profile_id
        AND p.user_id = auth.uid()
        AND p.role = 'provider'
    )
  );

-- -------------------------------------------------------------
-- POLICIES FOR provider_services
-- -------------------------------------------------------------

-- Public can view provider_services of published providers
DROP POLICY IF EXISTS "Public can view published provider_services" ON public.provider_services;
CREATE POLICY "Public can view published provider_services"
  ON public.provider_services FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.provider_profiles pp
      WHERE pp.id = provider_services.provider_id
        AND pp.status = 'published'
    )
  );

-- Providers can view their own provider_services
DROP POLICY IF EXISTS "Providers can view own provider_services" ON public.provider_services;
CREATE POLICY "Providers can view own provider_services"
  ON public.provider_services FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.provider_profiles pp
      JOIN public.profiles p ON p.id = pp.profile_id
      WHERE pp.id = provider_services.provider_id
        AND p.user_id = auth.uid()
    )
  );

-- Providers can insert/update/delete their own provider_services
DROP POLICY IF EXISTS "Providers can manage own provider_services" ON public.provider_services;
CREATE POLICY "Providers can manage own provider_services"
  ON public.provider_services FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.provider_profiles pp
      JOIN public.profiles p ON p.id = pp.profile_id
      WHERE pp.id = provider_services.provider_id
        AND p.user_id = auth.uid()
        AND p.role = 'provider'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.provider_profiles pp
      JOIN public.profiles p ON p.id = pp.profile_id
      WHERE pp.id = provider_services.provider_id
        AND p.user_id = auth.uid()
        AND p.role = 'provider'
    )
  );

-- -------------------------------------------------------------
-- POLICIES FOR service_areas
-- -------------------------------------------------------------

-- Public can view service_areas of published providers
DROP POLICY IF EXISTS "Public can view published service_areas" ON public.service_areas;
CREATE POLICY "Public can view published service_areas"
  ON public.service_areas FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.provider_profiles pp
      WHERE pp.id = service_areas.provider_id
        AND pp.status = 'published'
    )
  );

-- Providers can view their own service_areas
DROP POLICY IF EXISTS "Providers can view own service_areas" ON public.service_areas;
CREATE POLICY "Providers can view own service_areas"
  ON public.service_areas FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.provider_profiles pp
      JOIN public.profiles p ON p.id = pp.profile_id
      WHERE pp.id = service_areas.provider_id
        AND p.user_id = auth.uid()
    )
  );

-- Providers can insert/update/delete their own service_areas
DROP POLICY IF EXISTS "Providers can manage own service_areas" ON public.service_areas;
CREATE POLICY "Providers can manage own service_areas"
  ON public.service_areas FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.provider_profiles pp
      JOIN public.profiles p ON p.id = pp.profile_id
      WHERE pp.id = service_areas.provider_id
        AND p.user_id = auth.uid()
        AND p.role = 'provider'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.provider_profiles pp
      JOIN public.profiles p ON p.id = pp.profile_id
      WHERE pp.id = service_areas.provider_id
        AND p.user_id = auth.uid()
        AND p.role = 'provider'
    )
  );
