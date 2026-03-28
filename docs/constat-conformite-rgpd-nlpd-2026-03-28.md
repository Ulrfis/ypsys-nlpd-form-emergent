# Constat de conformité sécurité / RGPD / nLPD

**Projet**: Formulaire nLPD Ypsys  
**Date du constat**: 28 mars 2026  
**Périmètre**: Frontend React, Backend FastAPI, Supabase, OpenAI Assistant, Dreamlit, wording utilisateur

---

## 1. Résumé exécutif

L'application est **partiellement conforme**, mais **pas encore au niveau "standards complets"** sécurité + RGPD/nLPD.

Les points déjà en place (ex: proxy backend OpenAI, protection des routes admin par API key, redaction des logs debug) sont positifs, mais plusieurs écarts bloquants subsistent, notamment:

1. tracking analytics activé sans consentement préalable explicite,
2. wording contradictoire sur le partage avec des tiers,
3. RLS Supabase trop permissive (update anon global),
4. bypass de consentement via paramètre `?email=`,
5. durcissement insuffisant anti-abus de `/api/analyze`.

---

## 2. Constat détaillé (preuves code)

### 2.1 Écarts critiques

1. **Tracking avant consentement**
   - Initialisation analytics au chargement: `frontend/src/App.js:22`
   - PostHog autocapture + SiteBehaviour: `frontend/src/lib/analytics.js:41`, `frontend/src/lib/analytics.js:44`, `frontend/src/lib/analytics.js:47`
   - Identification utilisateur via email: `frontend/src/components/FormFlow.jsx:368`

2. **Wording trompeur / contradictoire**
   - Formulaire: "ne seront jamais partagées avec des tiers": `frontend/src/components/LeadCaptureForm.jsx:323`
   - Politique: mention explicite de tiers (OpenAI, PostHog, SiteBehaviour): `frontend/src/components/PrivacyPolicy.jsx:93`, `frontend/src/components/PrivacyPolicy.jsx:95`

3. **RLS Supabase permissive**
   - Politique `UPDATE TO anon USING (true) WITH CHECK (true)`: `docs/supabase-schema-update.sql:241`

### 2.2 Écarts importants

4. **Bypass consentement via URL**
   - Consentement forcé à `true` dans flux `?email=`: `frontend/src/components/FormFlow.jsx:421`

5. **Route `/api/analyze` sans garde anti-abus**
   - Endpoint public sans rate-limit applicatif: `backend/server.py:306`

6. **Fallback OpenAI côté navigateur encore possible**
   - Variables frontend OpenAI + `dangerouslyAllowBrowser`: `frontend/src/lib/openai.js:4`, `frontend/src/lib/openai.js:38`

7. **Message d'erreur backend potentiellement trop verbeux**
   - Retour de `detail=str(e)` côté client: `backend/server.py:437`

### 2.3 Écarts documentaires

8. **Documentation d'audit partiellement obsolète**
   - Le document existant affirme l'absence d'analytics alors que le code en active: `docs/audit-securite-rgpd-nlpd.md:12`, `docs/audit-securite-rgpd-nlpd.md:106`

---

## 3. Plan de mise en conformité

## 3.1 Code (frontend + backend)

### P0 (48-72h)

1. Bloquer tout tracking avant consentement explicite.
2. Supprimer l'envoi d'identifiants personnels (email) vers analytics.
3. Retirer le bypass `?email=` qui auto-valide le consentement.
4. Supprimer le fallback OpenAI en navigateur (`dangerouslyAllowBrowser`).
5. Mettre rate-limit + protection anti-abus sur `/api/analyze`.
6. Normaliser les erreurs backend (message générique côté client, détails en logs serveur).

### P1 (1 semaine)

1. Mettre en place un gestionnaire de consentements granulaires (rapport / marketing / analytics).
2. Journaliser les preuves de consentement (horodatage, version policy, source).
3. Ajouter une politique de rétention (purge/anonymisation planifiée).
4. Préparer endpoints/process DSAR (accès, suppression, rectification).

### Critères d'acceptation

1. Sans consentement analytics, zéro appel trackers tiers.
2. `/api/analyze` renvoie `429` en cas d'abus.
3. Aucune clé OpenAI exploitable dans le bundle frontend.

---

## 3.2 Supabase

### P0

1. Supprimer la policy `UPDATE anon` globale.
2. Réserver les updates sensibles au backend (service role).
3. Isoler la preuve de consentement dans une table dédiée (`consents`).

### P1

1. Chiffrement des champs sensibles (email / contenu emails) selon architecture retenue.
2. Purge automatique selon durée de conservation documentée.
3. Vues minimisées pour besoins métier (principe de minimisation).
4. Procédure SQL DSAR prête (export/suppression).

### Critères d'acceptation

1. Le rôle `anon` ne peut plus modifier arbitrairement des soumissions.
2. Toutes les opérations sensibles passent par backend contrôlé.
3. Purge automatisée vérifiable (journal d'exécution).

---

## 3.3 Assistant OpenAI

### P0

1. Vérifier/activer DPA OpenAI et archivage contractuel.
2. Documenter la base légale de transfert international (SCC/garanties équivalentes).
3. Minimiser le payload envoyé au modèle (PII strictement nécessaire).

### P1

1. Réviser les instructions assistant pour limiter la reprise de PII dans sorties commerciales.
2. Forcer un schéma de sortie JSON strict et validé.
3. Journaliser `assistant_id`, version de prompt, hash payload.

### Critères d'acceptation

1. DPA/SCC et registre de transfert documentés.
2. Payload minimisé et tracé.
3. Version de prompt auditable par soumission.

---

## 3.4 Dreamlit

### P0

1. Confirmer base contractuelle (DPA) et zone d'hébergement.
2. Sécuriser les déclenchements (signature webhook/HMAC).
3. Mettre l'idempotence stricte pour éviter doubles envois.
4. Transmettre uniquement les données strictement nécessaires.

### P1

1. Journal d'envoi complet (consentement, template version, statut, erreur).
2. Lien de désinscription explicite sur les emails de prospection.
3. Synchronisation des désinscriptions vers la base principale.

### Critères d'acceptation

1. Aucun envoi marketing sans consentement valide.
2. Historique d'envoi complet et exportable.
3. Désinscription propagée rapidement et de manière vérifiable.

---

## 3.5 Messages et wording (UI + politique)

### P0

1. Corriger le texte "jamais partagées avec des tiers".
2. Séparer le consentement "rapport demandé" et "contact commercial".
3. Afficher et stocker version/date de politique au moment du consentement.

### P1

1. Aligner la politique sur le comportement réel technique.
2. Détailler finalités, bases légales, destinataires, durées de conservation, transferts hors CH/UE, droits.
3. Mettre en place CMP si traceurs non exemptés.

### Critères d'acceptation

1. Aucune contradiction entre UI et politique.
2. Consentements granulaires, horodatés, prouvables.
3. Preuves d'information et de consentement exportables.

---

## 4. Séquencement recommandé (4 semaines)

1. **Semaine 1**: P0 code + wording + RLS.
2. **Semaine 2**: consentements granulaires + preuves légales + DSAR minimal.
3. **Semaine 3**: sécurisation Dreamlit + audit trail emailing.
4. **Semaine 4**: rétention/purge + documentation finale (registre et procédures).

---

## 5. Références réglementaires et standards

1. EDPB Guidelines 05/2020 (consentement RGPD).
2. CNIL – traceurs/cookies et consentement.
3. CNIL – transferts hors UE et garanties (SCC/CCT).
4. PFPDT (Suisse) – transferts de données à l'étranger (nLPD).
5. OpenAI – DPA et politiques d'usage des données API.

---

## 6. Décision proposée

Valider ce plan comme **baseline de remédiation conformité**, puis ouvrir les tickets techniques dans cet ordre:

1. P0 sécurité/compliance (blocage release si non fait),
2. P1 juridique-opérationnel,
3. durcissement continu (P2).
