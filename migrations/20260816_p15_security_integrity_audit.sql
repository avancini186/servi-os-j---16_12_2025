-- Migration: 20260816_p15_security_integrity_audit.sql
-- Description: Sprint P15 Security and Integrity Audit Fixes
-- Contains RLS hardening, trigger-based role escalation protection, admin visibility policies, and search_path configuration for SECURITY DEFINER RPCs

-- 1. SECURITY DEFINER FUNCTIONS HARDENING (SET search_path = public, pg_temp)

CREATE OR REPLACE FUNCTION public.is_admin(p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF p_user_id IS NULL THEN
    RETURN FALSE;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.admin_users WHERE user_id = p_user_id
  ) OR EXISTS (
    SELECT 1 FROM public.profiles WHERE user_id = p_user_id AND role = 'admin'
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  assigned_role text;
  user_full_name text;
BEGIN
  assigned_role := COALESCE(new.raw_user_meta_data->>'role', 'client');
  IF assigned_role NOT IN ('client', 'provider') THEN
    assigned_role := 'client';
  END IF;

  user_full_name := COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1));

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
$$;

CREATE OR REPLACE FUNCTION public.log_provider_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF (OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO public.provider_status_history (
      provider_id,
      from_status,
      to_status,
      changed_by,
      rejection_reason,
      created_at
    )
    VALUES (
      NEW.id,
      COALESCE(OLD.status, 'draft'),
      NEW.status,
      auth.uid(),
      NEW.rejection_reason,
      timezone('utc'::text, now())
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_approve_provider(p_provider_id BIGINT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_current_status TEXT;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Acesso negado: privilégios administrativos necessários.';
  END IF;

  SELECT status INTO v_current_status
  FROM public.provider_profiles
  WHERE id = p_provider_id;

  IF v_current_status IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'not_found', 'message', 'Prestador não encontrado.');
  END IF;

  UPDATE public.provider_profiles
  SET
    status = 'published',
    rejection_reason = NULL,
    updated_at = timezone('utc'::text, now())
  WHERE id = p_provider_id;

  RETURN jsonb_build_object('success', true, 'newStatus', 'published');
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_reject_provider(p_provider_id BIGINT, p_reason TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_current_status TEXT;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Acesso negado: privilégios administrativos necessários.';
  END IF;

  IF p_reason IS NULL OR trim(p_reason) = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'missing_reason', 'message', 'Por favor, informe o motivo da recusa.');
  END IF;

  SELECT status INTO v_current_status
  FROM public.provider_profiles
  WHERE id = p_provider_id;

  IF v_current_status IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'not_found', 'message', 'Prestador não encontrado.');
  END IF;

  UPDATE public.provider_profiles
  SET
    status = 'rejected',
    rejection_reason = trim(p_reason),
    updated_at = timezone('utc'::text, now())
  WHERE id = p_provider_id;

  RETURN jsonb_build_object('success', true, 'newStatus', 'rejected');
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_suspend_provider(p_provider_id BIGINT, p_reason TEXT DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_current_status TEXT;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Acesso negado: privilégios administrativos necessários.';
  END IF;

  SELECT status INTO v_current_status
  FROM public.provider_profiles
  WHERE id = p_provider_id;

  IF v_current_status IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'not_found', 'message', 'Prestador não encontrado.');
  END IF;

  UPDATE public.provider_profiles
  SET
    status = 'suspended',
    rejection_reason = p_reason,
    updated_at = timezone('utc'::text, now())
  WHERE id = p_provider_id;

  RETURN jsonb_build_object('success', true, 'newStatus', 'suspended');
END;
$$;

CREATE OR REPLACE FUNCTION public.log_analytics_event(
  p_provider_id BIGINT DEFAULT NULL,
  p_event_type TEXT DEFAULT 'profile_view',
  p_search_term TEXT DEFAULT NULL,
  p_channel TEXT DEFAULT NULL,
  p_portfolio_item_id BIGINT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_owner_user_id UUID;
  v_current_user_id UUID;
BEGIN
  v_current_user_id := auth.uid();

  IF p_provider_id IS NOT NULL AND v_current_user_id IS NOT NULL THEN
    SELECT p.user_id INTO v_owner_user_id
    FROM public.provider_profiles pp
    JOIN public.profiles p ON p.id = pp.profile_id
    WHERE pp.id = p_provider_id;

    IF v_owner_user_id IS NOT NULL AND v_owner_user_id = v_current_user_id THEN
      RETURN jsonb_build_object('success', true, 'ignored', true, 'reason', 'owner_self_view');
    END IF;
  END IF;

  INSERT INTO public.provider_analytics_events (
    provider_id,
    event_type,
    search_term,
    channel,
    portfolio_item_id,
    created_at
  )
  VALUES (
    p_provider_id,
    p_event_type,
    NULLIF(trim(p_search_term), ''),
    NULLIF(trim(p_channel), ''),
    p_portfolio_item_id,
    timezone('utc'::text, now())
  );

  RETURN jsonb_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- 2. ROLE ESCALATION PROTECTION (TRIGGER ON PROFILES)

CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF (OLD.role IS DISTINCT FROM NEW.role) AND NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Acesso negado: alteração da função (role) não é permitida.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profile_role ON public.profiles;
CREATE TRIGGER trg_protect_profile_role
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profile_role();

-- 3. REMOVE OVERLY PERMISSIVE LEGACY POLICY ON PROVIDER_PROFILES
DROP POLICY IF EXISTS "Providers manage own provider profile" ON public.provider_profiles;
DROP POLICY IF EXISTS "Providers update own profile draft or request review" ON public.provider_profiles;

-- Re-create provider_profiles UPDATE policy: restrict status mutation to draft or pending_review
CREATE POLICY "Providers update own profile draft or request review"
ON public.provider_profiles FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = public.provider_profiles.profile_id
    AND p.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = public.provider_profiles.profile_id
    AND p.user_id = auth.uid()
  ) AND
  (status IN ('draft', 'pending_review'))
);

-- Re-create provider_profiles INSERT policy for authenticated providers
DROP POLICY IF EXISTS "Providers insert own provider profile" ON public.provider_profiles;
CREATE POLICY "Providers insert own provider profile"
ON public.provider_profiles FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = public.provider_profiles.profile_id
    AND p.user_id = auth.uid()
  ) AND
  status = 'draft'
);

-- 4. ADMIN SELECT POLICIES ON CHILD TABLES FOR MODERATION

-- provider_services
DROP POLICY IF EXISTS "Public view published provider services" ON public.provider_services;
CREATE POLICY "Public view published provider services" ON public.provider_services FOR SELECT TO public USING (
  EXISTS (
    SELECT 1 FROM public.provider_profiles pp 
    WHERE pp.id = public.provider_services.provider_id AND pp.status = 'published'
  ) OR public.is_admin(auth.uid())
);

-- portfolio_items
DROP POLICY IF EXISTS "Public view published portfolio items" ON public.portfolio_items;
CREATE POLICY "Public view published portfolio items" ON public.portfolio_items FOR SELECT TO public USING (
  EXISTS (
    SELECT 1 FROM public.provider_profiles pp 
    WHERE pp.id = public.portfolio_items.provider_id AND pp.status = 'published'
  ) OR public.is_admin(auth.uid())
);

-- social_links
DROP POLICY IF EXISTS "Public view published social links" ON public.social_links;
CREATE POLICY "Public view published social links" ON public.social_links FOR SELECT TO public USING (
  EXISTS (
    SELECT 1 FROM public.provider_profiles pp 
    WHERE pp.id = public.social_links.provider_id AND pp.status = 'published'
  ) OR public.is_admin(auth.uid())
);

-- service_areas
DROP POLICY IF EXISTS "Public view published service areas" ON public.service_areas;
CREATE POLICY "Public view published service areas" ON public.service_areas FOR SELECT TO public USING (
  EXISTS (
    SELECT 1 FROM public.provider_profiles pp 
    WHERE pp.id = public.service_areas.provider_id AND pp.status = 'published'
  ) OR public.is_admin(auth.uid())
);

-- provider_subscriptions
DROP POLICY IF EXISTS "Providers view own subscriptions" ON public.provider_subscriptions;
CREATE POLICY "Providers and Admins view subscriptions" ON public.provider_subscriptions FOR SELECT TO authenticated USING (
  public.is_admin(auth.uid()) OR
  EXISTS (
    SELECT 1 FROM public.provider_profiles pp
    JOIN public.profiles p ON p.id = pp.profile_id
    WHERE pp.id = public.provider_subscriptions.provider_id
    AND p.user_id = auth.uid()
  )
);

-- 5. REVIEWS SELF-REVIEW PREVENTION
DROP POLICY IF EXISTS "Authenticated users insert reviews" ON public.reviews;
CREATE POLICY "Authenticated users insert reviews" ON public.reviews FOR INSERT TO authenticated WITH CHECK (
  author_user_id = auth.uid() AND
  NOT EXISTS (
    SELECT 1 FROM public.provider_profiles pp
    JOIN public.profiles p ON p.id = pp.profile_id
    WHERE pp.id = public.reviews.provider_id
    AND p.user_id = auth.uid()
  )
);

-- 6. STORAGE OBJECTS ADMIN DELETE POLICY
DROP POLICY IF EXISTS "Provider delete own portfolio storage" ON storage.objects;
CREATE POLICY "Provider and Admin delete portfolio storage" ON storage.objects FOR DELETE TO authenticated USING (
  bucket_id = 'portfolio' AND (
    public.is_admin(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.provider_profiles pp
      JOIN public.profiles p ON p.id = pp.profile_id
      WHERE pp.id::text = (storage.foldername(name))[1]
      AND p.user_id = auth.uid()
    )
  )
);
