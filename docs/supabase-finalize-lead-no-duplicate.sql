-- =============================================================================
-- Éviter les doublons form_submissions (ligne teaser + 2e ligne au lead)
-- =============================================================================
-- Contexte : après l’analyse, l’app fait un INSERT (souvent sans email).
-- À la capture lead, l’app fait un UPDATE par id. Si l’UPDATE ne matche aucune
-- ligne (RLS manquante, mauvais id), le frontend retombe sur un INSERT complet
-- → 2e ligne avec email.
--
-- Exécuter dans le SQL Editor Supabase (idempotent où c’est indiqué).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) INDISPENSABLE : autoriser l’UPDATE anon sur form_submissions
-- -----------------------------------------------------------------------------
-- Sans cette politique, PostgREST refuse l’UPDATE ; l’app crée alors une nouvelle
-- ligne via saveSubmission().

ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'form_submissions'
      AND policyname = 'Allow anon update on form_submissions'
  ) THEN
    CREATE POLICY "Allow anon update on form_submissions"
      ON public.form_submissions
      FOR UPDATE TO anon
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 2) OPTION A (recommandée si l’UPDATE direct reste bloqué) : RPC SECURITY DEFINER
-- -----------------------------------------------------------------------------
-- L’app peut appeler supabase.rpc('finalize_form_submission_lead', { ... })
-- au lieu d’un .update() — la fonction s’exécute avec les droits du propriétaire
-- et contourne RLS pour cette mise à jour ciblée par id.
--
-- Sécurité : même modèle que l’UPDATE anon permissif (qui connaît l’uuid peut
-- mettre à jour la ligne). Restreindre côté métier si besoin (ex. seulement
-- status = 'teaser_ready').

CREATE OR REPLACE FUNCTION public.finalize_form_submission_lead(
  p_submission_id uuid,
  p_user_email text,
  p_user_first_name text,
  p_user_last_name text,
  p_company_name text,
  p_company_size text,
  p_industry text,
  p_canton text
) RETURNS SETOF public.form_submissions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  n int;
BEGIN
  UPDATE public.form_submissions AS fs
  SET
    user_email = p_user_email,
    user_first_name = COALESCE(p_user_first_name, ''),
    user_last_name = p_user_last_name,
    company_name = p_company_name,
    company_size = p_company_size,
    industry = p_industry,
    canton = p_canton,
    consent_marketing = true,
    consent_timestamp = now(),
    status = 'lead_complete'
  WHERE fs.id = p_submission_id;

  GET DIAGNOSTICS n = ROW_COUNT;
  IF n = 0 THEN
    RAISE EXCEPTION 'form_submissions: no row updated for id %', p_submission_id
      USING ERRCODE = 'P0002';
  END IF;

  RETURN QUERY
  SELECT * FROM public.form_submissions WHERE id = p_submission_id;
END;
$$;

REVOKE ALL ON FUNCTION public.finalize_form_submission_lead(
  uuid, text, text, text, text, text, text, text
) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.finalize_form_submission_lead(
  uuid, text, text, text, text, text, text, text
) TO anon;

GRANT EXECUTE ON FUNCTION public.finalize_form_submission_lead(
  uuid, text, text, text, text, text, text, text
) TO authenticated;

COMMENT ON FUNCTION public.finalize_form_submission_lead IS
  'Met à jour la ligne créée après analyse avec le lead ; évite un 2e INSERT si RLS bloque UPDATE direct.';

-- -----------------------------------------------------------------------------
-- 3) OPTION B : dédup par identifiant de session navigateur (nécessite changement frontend)
-- -----------------------------------------------------------------------------
-- Colonne + index unique : le client envoie le même UUID sur l’INSERT post-analyse
-- et sur la finalisation, avec upsert PostgREST (onConflict).
--
-- ALTER TABLE public.form_submissions
--   ADD COLUMN IF NOT EXISTS client_flow_id uuid;
--
-- CREATE UNIQUE INDEX IF NOT EXISTS idx_form_submissions_client_flow_id
--   ON public.form_submissions (client_flow_id)
--   WHERE client_flow_id IS NOT NULL;
