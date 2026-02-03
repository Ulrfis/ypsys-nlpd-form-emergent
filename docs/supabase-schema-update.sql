-- =============================================================================
-- Script de mise à jour Supabase – Formulaire nLPD Ypsys
-- =============================================================================
-- À exécuter dans le SQL Editor de Supabase.
-- Idempotent : peut être relancé sans erreur (CREATE IF NOT EXISTS, ADD COLUMN
-- uniquement si la colonne n'existe pas).
--
-- Ce schéma permet de recevoir :
-- 1. Toutes les réponses du questionnaire (form_submissions.answers, jsonb)
-- 2. Les 3 sorties de l'assistant OpenAI :
--    - Teaser court (form_submissions.teaser_text)
--    - Rapport long prospect (email_outputs.email_user_markdown + email_user_subject)
--    - Contexte long commerciaux (email_outputs.email_sales_markdown + email_sales_subject)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Table form_submissions
-- -----------------------------------------------------------------------------
-- Stocke chaque soumission : identité, réponses complètes (jsonb), score,
-- teaser et lead_temperature renvoyés par l'assistant.
CREATE TABLE IF NOT EXISTS public.form_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),

  -- Identité / organisation
  user_email text,
  user_first_name text NOT NULL DEFAULT '',
  user_last_name text,
  company_name text,
  company_size text,
  industry text,
  canton text,

  -- Réponses : TOUTES les réponses du questionnaire (q1..q15) en JSON
  answers jsonb NOT NULL DEFAULT '{}',

  -- Score calculé côté app
  score_raw int4 NOT NULL,
  score_normalized numeric NOT NULL,
  risk_level text NOT NULL,

  -- Sortie 1 de l'assistant : teaser court (écran de remerciement)
  teaser_text text,
  lead_temperature text,

  -- Statut et consentement
  status text NOT NULL DEFAULT 'pending',
  consent_marketing boolean NOT NULL DEFAULT false,
  consent_timestamp timestamptz,
  session_id text,

  -- Optionnel : tracking
  device_type text,
  utm_source text,
  utm_campaign text
);

-- Index pour requêtes courantes
CREATE INDEX IF NOT EXISTS idx_form_submissions_created_at
  ON public.form_submissions (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_form_submissions_risk_level
  ON public.form_submissions (risk_level);
CREATE INDEX IF NOT EXISTS idx_form_submissions_lead_temperature
  ON public.form_submissions (lead_temperature);

-- Commentaires
COMMENT ON TABLE public.form_submissions IS 'Soumissions du formulaire nLPD : réponses complètes + teaser (sortie courte de l''assistant)';
COMMENT ON COLUMN public.form_submissions.answers IS 'Réponses à toutes les questions (q1..q15), ex: {"q1":"...", "q2":"...", ...}';
COMMENT ON COLUMN public.form_submissions.teaser_text IS 'Message court généré par l''assistant pour l''écran de remerciement';

-- -----------------------------------------------------------------------------
-- 2. Table email_outputs
-- -----------------------------------------------------------------------------
-- Une ligne par soumission ayant un email : les 2 sorties longues de l'assistant
-- (rapport prospect + contexte commercial), avec suivi d’envoi.
CREATE TABLE IF NOT EXISTS public.email_outputs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),

  submission_id uuid NOT NULL REFERENCES public.form_submissions (id) ON DELETE CASCADE,

  -- Email du prospect (lien explicite : cette sortie OpenAI est pour cet email)
  user_email text,

  -- Sortie 2 : rapport personnalisé pour le prospect (email)
  email_user_subject text,
  email_user_markdown text,

  -- Sortie 3 : analyse/contexte pour les commerciaux Ypsys
  email_sales_subject text,
  email_sales_markdown text,

  lead_temperature text,

  -- Suivi envoi des emails
  user_email_sent boolean NOT NULL DEFAULT false,
  user_email_sent_at timestamptz,
  sales_email_sent boolean NOT NULL DEFAULT false,
  sales_email_sent_at timestamptz,

  error_message text
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_email_outputs_submission_id
  ON public.email_outputs (submission_id);
CREATE INDEX IF NOT EXISTS idx_email_outputs_lead_temperature
  ON public.email_outputs (lead_temperature);

COMMENT ON TABLE public.email_outputs IS 'Sorties longues de l''assistant : email prospect (email_user_*) et contexte commercial (email_sales_*)';
COMMENT ON COLUMN public.email_outputs.email_user_markdown IS 'Rapport personnalisé pour le prospect (markdown)';
COMMENT ON COLUMN public.email_outputs.email_sales_markdown IS 'Analyse/contexte pour l''équipe commerciale Ypsys (markdown)';

-- -----------------------------------------------------------------------------
-- 3. Ajout des colonnes manquantes (si les tables existaient déjà)
-- -----------------------------------------------------------------------------
DO $$
DECLARE
  col_exists boolean;
BEGIN
  -- form_submissions
  SELECT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'form_submissions' AND column_name = 'answers')
  INTO col_exists;
  IF NOT col_exists THEN
    ALTER TABLE public.form_submissions ADD COLUMN answers jsonb NOT NULL DEFAULT '{}';
  END IF;

  SELECT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'form_submissions' AND column_name = 'teaser_text')
  INTO col_exists;
  IF NOT col_exists THEN
    ALTER TABLE public.form_submissions ADD COLUMN teaser_text text;
  END IF;

  SELECT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'form_submissions' AND column_name = 'lead_temperature')
  INTO col_exists;
  IF NOT col_exists THEN
    ALTER TABLE public.form_submissions ADD COLUMN lead_temperature text;
  END IF;

  SELECT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'form_submissions' AND column_name = 'device_type')
  INTO col_exists;
  IF NOT col_exists THEN
    ALTER TABLE public.form_submissions ADD COLUMN device_type text;
  END IF;

  SELECT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'form_submissions' AND column_name = 'utm_source')
  INTO col_exists;
  IF NOT col_exists THEN
    ALTER TABLE public.form_submissions ADD COLUMN utm_source text;
  END IF;

  SELECT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'form_submissions' AND column_name = 'utm_campaign')
  INTO col_exists;
  IF NOT col_exists THEN
    ALTER TABLE public.form_submissions ADD COLUMN utm_campaign text;
  END IF;

  -- email_outputs
  SELECT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'email_outputs' AND column_name = 'user_email')
  INTO col_exists;
  IF NOT col_exists THEN
    ALTER TABLE public.email_outputs ADD COLUMN user_email text;
  END IF;

  SELECT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'email_outputs' AND column_name = 'email_user_markdown')
  INTO col_exists;
  IF NOT col_exists THEN
    ALTER TABLE public.email_outputs ADD COLUMN email_user_markdown text;
  END IF;

  SELECT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'email_outputs' AND column_name = 'email_user_subject')
  INTO col_exists;
  IF NOT col_exists THEN
    ALTER TABLE public.email_outputs ADD COLUMN email_user_subject text;
  END IF;

  SELECT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'email_outputs' AND column_name = 'user_email_sent')
  INTO col_exists;
  IF NOT col_exists THEN
    ALTER TABLE public.email_outputs ADD COLUMN user_email_sent boolean NOT NULL DEFAULT false;
  END IF;

  SELECT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'email_outputs' AND column_name = 'user_email_sent_at')
  INTO col_exists;
  IF NOT col_exists THEN
    ALTER TABLE public.email_outputs ADD COLUMN user_email_sent_at timestamptz;
  END IF;

  SELECT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'email_outputs' AND column_name = 'sales_email_sent')
  INTO col_exists;
  IF NOT col_exists THEN
    ALTER TABLE public.email_outputs ADD COLUMN sales_email_sent boolean NOT NULL DEFAULT false;
  END IF;

  SELECT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'email_outputs' AND column_name = 'sales_email_sent_at')
  INTO col_exists;
  IF NOT col_exists THEN
    ALTER TABLE public.email_outputs ADD COLUMN sales_email_sent_at timestamptz;
  END IF;

  SELECT EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'email_outputs' AND column_name = 'error_message')
  INTO col_exists;
  IF NOT col_exists THEN
    ALTER TABLE public.email_outputs ADD COLUMN error_message text;
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 4. RLS (Row Level Security) – à adapter selon vos règles métier
-- -----------------------------------------------------------------------------
-- Si vous avez déjà des politiques RLS, commentez ou supprimez ce bloc.
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_outputs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'form_submissions' AND policyname = 'Allow anon insert on form_submissions') THEN
    CREATE POLICY "Allow anon insert on form_submissions"
      ON public.form_submissions FOR INSERT TO anon WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'email_outputs' AND policyname = 'Allow anon insert on email_outputs') THEN
    CREATE POLICY "Allow anon insert on email_outputs"
      ON public.email_outputs FOR INSERT TO anon WITH CHECK (true);
  END IF;
END $$;

-- Pour permettre la lecture (dashboard, exports) : créer des politiques SELECT
-- pour service_role ou authenticated selon votre besoin.
