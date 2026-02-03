# Changelog

Toutes les modifications notables de ce projet sont documentées ici.

Format basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/).

## [Non publié]

### À venir
- Intégration Dreamlit pour envoi automatique d'emails
- Application calendrier pour réservation de consultations
- Migration appel OpenAI vers Supabase Edge Function
- Dashboard admin pour visualiser les leads

---

## [0.7.0] - 2026-02-03

### Ajouté
- **Politique de confidentialité** : page `/politique-confidentialite` (structure alignée sur la politique de cookies Ypsys) avec sections Introduction, Données collectées, Finalités, Destinataires et transferts, Durée, Droits, Contact ; lien cliquable depuis le formulaire de capture de leads
- **Bandeau de consentement cookies** : CookieBanner à la première visite ; choix « Refuser les statistiques » / « Tout accepter » ; consentement stocké dans `localStorage` (`nlpd_cookie_consent`)
- **PostHog après consentement** : PostHog n'est plus chargé dans `index.html` ; chargement uniquement après clic sur « Tout accepter » (CookieConsentContext, PostHogLoader)
- **Audit RGPD/nLPD** : [docs/audit-securite-rgpd-nlpd.md](docs/audit-securite-rgpd-nlpd.md) — inventaire des données, flux, conformité RGPD/nLPD, sécurité technique, recommandations ; mise en œuvre des actions P0/P1 documentée

### Modifié
- **API backend** : routes GET `/api/submissions`, GET `/api/submissions/{id}` et GET `/api/stats` protégées par l'en-tête `X-API-Key` (variable `API_ADMIN_SECRET`) ; sans clé ou si `API_ADMIN_SECRET` non défini → 403
- **Logs debug** : sanitisation des payloads (redactPayload) — données personnelles (user, email, answers, etc.) remplacées par `[REDACTED]` avant stockage dans localStorage ; conformité RGPD/nLPD
- **Version mobile** : CTA et barre de navigation (Précédent/Suivant) toujours visibles sans scroll ; barre de navigation fixe en bas (layout `h-screen` + zone scrollable) ; questionnaire compact (polices plus petites, capsule chapitre supprimée, barre de progression moins haute) ; validation avec touche Entrée après sélection d'une réponse ; boutons et pages sans débordement largeur
- **Page « Votre analyse est prête »** : bloc « Aperçu de vos priorités » supprimé ; conservés : score gauge, carte niveau de risque, « Obtenez votre rapport complet par email »
- **Page « Votre diagnostic nLPD »** : logo Ypsys en header (remplace icône + texte) ; blocs « Score et Gaps » et « Analyse personnalisée » supprimés ; bloc « Vos 3 priorités » supprimé ; conservés : « Rapport complet envoyé par email », calendrier consultation, CTA

### Documentation
- [docs/deployment-railway-env.md](docs/deployment-railway-env.md) : section API_ADMIN_SECRET (quand définir, quand ne pas définir)
- [backend/.env.example](backend/.env.example) : commentaire pour API_ADMIN_SECRET

---

## [0.6.0] - 2026-02-03

### Ajouté
- Envoi à OpenAI de **toutes** les réponses du questionnaire : `answers` (q1..q15) + `answers_detailed` (question + réponse par item) pour une analyse détaillée par l'assistant
- Documentation [docs/openai-analyze-and-supabase-flow.md](docs/openai-analyze-and-supabase-flow.md) : format requête/réponse API analyze, flux vers Supabase (teaser, email_user, email_sales)
- Script SQL [docs/supabase-schema-update.sql](docs/supabase-schema-update.sql) : création/mise à jour des tables Supabase (form_submissions, email_outputs) pour recevoir toutes les réponses et les 3 sorties de l'assistant (teaser, rapport prospect, contexte commerciaux)
- Section dépannage dans [docs/deployment-railway-env.md](docs/deployment-railway-env.md) : « Credentials not configured » en prod → appliquer les variables puis **redéployer** (build-time pour REACT_APP_*)

### Modifié
- Panneau debug (mode `?debug=true`) : affichage du **payload complet** envoyé à `/api/analyze` (answers + answers_detailed) au lieu d'un simple résumé
- Backend : modèle `AnalyzePayload` accepte un champ optionnel `answers_detailed` (liste question_id, question, answer) et transmet l'intégralité du payload à OpenAI

### Amélioré
- L'assistant OpenAI reçoit désormais le contexte explicite de chaque question et réponse pour produire teaser, email_user et email_sales détaillés ; les deux emails sont stockés dans `email_outputs` après capture du lead

---

## [0.5.0] - 2026-02-02

### Modifié
- Révision complète des textes des 15 questions du questionnaire nLPD
- Réorganisation de l'ordre des réponses (rouge → vert) pour toutes les questions
- Simplification des tooltips et explications
- Remplacement des termes techniques par des formulations plus accessibles
- Q5 : "Vos sauvegardes fonctionnent-elles vraiment?" → "Comment est organisée la sauvegarde des données sensibles?"
- Q13 : "Votre équipe connaît-elle les règles de base nLPD?" → "Votre équipe est-elle sensibilisée aux risques de cyberattaque?"

### Supprimé
- Q9 : Option "Je ne sais pas si c'est obligatoire"
- Q14 : Option "C'est réparti, mais pas formalisé"

### Amélioré
- Messages moins culpabilisants et plus orientés solution
- Focus sur les principes nLPD plutôt que sur les sanctions PFPDT
- Terminologie simplifiée : "MdP" → "mot de passe", "Chiffrement" → "Cryptage"
- Questions plus directes et actionnables

---

## [0.4.0] - 2026-01-28

### Ajouté
- Déploiement Railway fonctionnel avec virtual environment Python
- Configuration Nixpacks corrigée pour environnement Nix/PEP 668

### Corrigé
- `nixpacks.toml` : utilisation d'un venv pour contourner PEP 668 (externally-managed-environment)
- `railway.toml`, `railway.json`, `Procfile` : chemins uvicorn alignés avec le venv (`/app/venv/bin/uvicorn`)
- Fix "No module named pip" : passage de `python3 -m pip` à création de venv

### Note technique
Ce déploiement a nécessité 8 tentatives (5 avec Claude Code, 3 avec Cursor) pour résoudre les problèmes spécifiques à Nixpacks + Python + Nix.

---

## [0.3.0] - 2026-01-28

### Ajouté
- Configuration Railway initiale (railway.json, nixpacks.toml, Procfile)
- Fichiers .python-version et .node-version
- Script start.sh pour déploiement
- Backend simplifié sans dépendance MongoDB
- Serveur de fichiers statiques pour frontend buildé

### Modifié
- requirements.txt minimal (7 dépendances au lieu de 140+)
- Backend adapté pour fonctionner standalone avec Supabase

---

## [0.2.0] - 2026-01-27

### Ajouté
- Nouveau flux utilisateur après questionnaire :
  1. "Envoyer les réponses" (nouveau bouton)
  2. Écran d'analyse animé (4 étapes visuelles)
  3. Page de résultats avec teaser IA
  4. CTA "Recevoir mon rapport complet gratuit"
  5. Formulaire simplifié
- Composant ResultsPreview avec design inspiré des maquettes client
- Formulaire de capture simplifié (prénom + email obligatoires uniquement)
- Section "Informations complémentaires" dépliable pour champs optionnels

### Modifié
- QuestionCard : bouton "Terminer" remplacé par "Envoyer les réponses"
- AnalysisLoadingScreen : redesign avec 4 étapes et icônes
- LeadCaptureForm : champs optionnels en collapsible
- FormFlow : nouveau flux avec étape RESULTS_PREVIEW

---

## [0.1.0] - 2026-01-27

### Ajouté
- Setup initial du projet React + FastAPI
- Design system Ypsys (couleur Magenta #C8007F)
- 15 questions nLPD avec tooltips enrichis et feedback
- 5 sections thématiques avec barre de progression
- Support mode sombre/clair
- Intégration OpenAI Assistant API
- Intégration Supabase (PostgreSQL Europe)
- Tables : form_submissions, email_outputs
- Calcul de score avec niveaux de risque (vert/orange/rouge)
- Page de remerciement avec top 3 priorités
- Suppression du badge "Made with Emergent"

### Configuration
- Tailwind CSS avec tokens de design personnalisés
- shadcn/ui composants (button, card, input, select, etc.)
- Framer Motion pour animations
- Politiques RLS Supabase configurées

---

<!-- 
GUIDE RAPIDE:
- "Ajouté" pour les nouvelles fonctionnalités
- "Modifié" pour les changements de fonctionnalités existantes  
- "Déprécié" pour les fonctionnalités qui seront supprimées
- "Supprimé" pour les fonctionnalités supprimées
- "Corrigé" pour les corrections de bugs
- "Sécurité" pour les vulnérabilités corrigées

VERSIONING:
- 0.x.x = prototype/dev
- 1.0.0 = première release stable
- x.Y.x = nouvelle fonctionnalité
- x.x.Z = correction de bug
-->
