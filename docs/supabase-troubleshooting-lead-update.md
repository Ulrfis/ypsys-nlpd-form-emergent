# Dépannage : email non enregistré après le formulaire lead (Dreamlit)

Symptôme : une ligne `form_submissions` existe après le questionnaire (souvent `user_email` vide, `status` `teaser_ready`), mais après saisie du formulaire avec email **la même ligne ne se met pas à jour** et **aucune ligne `email_outputs`** → pas d’email Dreamlit.

## Cause la plus fréquente : politique RLS UPDATE manquante

Le navigateur utilise la clé **anon**. Sans politique `FOR UPDATE` sur `public.form_submissions`, PostgREST **n’autorise pas** l’UPDATE : l’app peut continuer jusqu’à la page merci alors que la base ne change pas (ou erreur silencieuse selon version).

### Vérifier les politiques actuelles

Dans **SQL Editor** :

```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename IN ('form_submissions', 'email_outputs')
ORDER BY tablename, policyname;
```

Tu dois voir au minimum pour `form_submissions` :

- une politique **INSERT** pour `anon` ;
- une politique **UPDATE** pour `anon` nommée par ex. `Allow anon update on form_submissions`.

Si **UPDATE** est absent, exécute (idempotent si le nom est identique) :

```sql
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
      FOR UPDATE
      TO anon
      USING (true)
      WITH CHECK (true);
  END IF;
END $$;
```

Puis refais un test complet (questionnaire → analyse → formulaire email).

## Autres causes

| Problème | Indice | Action |
|----------|--------|--------|
| OpenAI ne renvoie pas `email_user` / `email_sales` complets | Console navigateur : `[Supabase] email_outputs not written` | Vérifier prompt assistant v4 et logs backend ; sans les deux blocs markdown, **aucun** INSERT dans `email_outputs` (comportement voulu pour Dreamlit). |
| Ancien déploiement sans `submissionId` | Une seule ligne créée seulement au lead | Redéployer le frontend ; ou le fallback `saveSubmission` crée une **nouvelle** ligne complète si l’UPDATE échoue (voir ci‑dessous). |
| Mauvais projet Supabase | Variables `REACT_APP_SUPABASE_*` pointent ailleurs | Vérifier Railway / `.env` vs projet où tu regardes les tables. |

## Comportement applicatif (après correctif code)

Si l’UPDATE ne modifie **aucune ligne** (RLS ou id invalide), le client lève une erreur explicite puis enchaîne sur un **INSERT complet** (`saveSubmission`) pour ne pas perdre le lead ni les emails. Tu peux alors avoir **deux** lignes : une « abandonnée » sans email et une complète — à nettoyer manuellement si besoin.

## Vérifier `email_outputs`

```sql
SELECT eo.*, fs.user_email, fs.status
FROM email_outputs eo
JOIN form_submissions fs ON fs.id = eo.submission_id
ORDER BY eo.created_at DESC
LIMIT 20;
```

Si `email_outputs` est vide alors que l’assistant renvoie bien les emails, regarder la console réseau / logs pour erreur INSERT sur `email_outputs` (politique INSERT `anon` requise, déjà prévue dans `supabase-schema-update.sql`).
