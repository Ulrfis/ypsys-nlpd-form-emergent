# Changelog

Toutes les modifications notables de ce projet sont documentées ici.

Format basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/).

## [Non publié]

### Release debug stamp
- **Version app** : `0.1.1`
- **Itération** : `iter-2026-03-09-01`
- **Build publié** : `2026-03-09 19:10`
- **Référence panneau debug** : `CHANGELOG.md · [Non publié]`

### Ajouté
- **Supabase — persistance post-analyse** : `insertFormSubmissionAfterAnalysis` et `finalizeFormSubmissionLead` dans `frontend/src/lib/supabase.js` ; état `submissionId` dans `FormFlow` ; INSERT des réponses juste après l’analyse OpenAI (sans attendre l’email), UPDATE au formulaire lead ; fallback `saveSubmission` si pas de ligne initiale
- **RLS Supabase** : politique `Allow anon update on form_submissions` documentée dans `docs/supabase-schema-update.sql` (requis en prod pour le UPDATE lead)
- **API `/api/analyze`** : champ `score_100_assistant_raw` (valeur proposée par le modèle, audit) en plus du `score_100` imposé par le questionnaire
- **Prompt OpenAI v4** : `docs/assistant-prompt-nlpd-v4-score100.md` — prompt intégral à coller dans l’assistant, score rédactionnel aligné sur `payload.score` (l’app écrase le score affiché)
- **Documentation** : `docs/assistant-regression-testing.md` (tests Playground / export Supabase)
- **Prompt OpenAI v3 clean** : nouveau fichier `docs/assistant-prompt-nlpd-v3-score100.md` avec champs UI (`result_summary`, `result_focus_points`), seuils 0-59/60-89/90-100 et section email `Synthèse et prochaines étapes` enrichie du bloc `Diagnostic NLPD prioritaire offert`
- **Bloc offre diagnostic par palier** sur la page de résultat finale, avec CTA `Prenez rendez-vous ici` et mention `5 créneaux disponibles cette semaine`
- **Nouveau contrat OpenAI v2** : prise en charge de `score_100`, `severity_band` (`critical`/`vigilance`/`good`) et `top_issues` (3 priorités), en plus de `teaser`, `lead_temperature`, `email_user`, `email_sales`
- **Page de confirmation finale** : nouveau composant `FinalThankYouPage` après la page de résultat détaillée
- **Documentation** : ajout de `docs/assistant-prompt-nlpd-v2-score100.md` et `docs/plan-maj-scoring-nlpd.md`
- **Tracking analytics complet** :
  - intégration PostHog (`posthog-js`) avec autocapture + événements métier du questionnaire
  - intégration script SiteBehaviour (heatmap / comportement session)

### Modifié
- **Score /100** : source de vérité unique = calcul questionnaire (`calculateScore` / `payload.score.normalized`) ; backend `server.py` et frontend `openai.js` + `FormFlow.jsx` n’utilisent plus le `score_100` du modèle pour l’affichage (corrige incohérences type 10 vs 67 pour les mêmes réponses)
- **Calendrier résultat final** : embed iframe TidyCal meeting 30 min (`lib/booking.js` : `BOOKING_MEETING_PAGE_URL`, `BOOKING_EMBED_URL`) sur `ThankYouPage` avec lien d’ouverture nouvel onglet
- **Documentation flux** : `docs/openai-analyze-and-supabase-flow.md` — flux réel insert/update, score imposé, référence prompt v4
- **Référence prompt historique** : `docs/assistant-prompt-nlpd.md` pointe vers la v4 en production
- **Versionnement prompts** : `docs/assistant-prompt-nlpd-v2-score100.md` conservé en v2, et migration des nouvelles consignes vers `docs/assistant-prompt-nlpd-v3-score100.md`
- **Landing page** : texte d'accroche et encadré de risque réécrits selon le PDF `docs/Modifications formulaire nLPD 23-03-26.pdf`
- **Questionnaire** : suppression de l'encadré de relecture sur la dernière question
- **Parcours post-questions** : fusion de la page preview et du formulaire de capture (standard + prérempli `?email=`) sur une seule page
- **CTA principal post-analyse** : `Recevoir mon diagnostic prioritaire` + mention *Valeur du diagnostic de 650 CHF = offert*
- **Page résultat finale (`ThankYouPage`)** :
  - suppression de la jauge,
  - score affiché en grand,
  - nouveaux titres par palier: `Exemplaire` (90-100), `Risque modéré` (60-89), `Risque élevé` (0-59),
  - ajout des couches de contenu: générique + OpenAI + encart diagnostic
- **Seuils score harmonisés frontend/backend** : `critical` 0-59, `vigilance` 60-89, `good` 90-100
- **Contrat `/api/analyze` étendu** : ajout de `result_summary` et `result_focus_points` dans la réponse backend et la normalisation frontend
- **Documentation API/OpenAI** : `docs/openai-analyze-and-supabase-flow.md` alignée sur le contrat v3
- **PostHog** : activation uniquement si `REACT_APP_POSTHOG_KEY` est défini (clé retirée du code ; à définir en local dans `frontend/.env` et en prod dans Railway Variables pour le tracking usages / user flows).
- **Flux post-questionnaire** : `Questions -> Transition sans score -> Capture email -> Résultat complet -> Thank you final`
- **Écran avant email (`ResultsPreview`)** : suppression de toute notion de score ; texte orienté "analyse terminée" + livrables du rapport
- **Message intermédiaire avant email** : remplacement de la phrase fixe par un message adapté au niveau (`critical` / `vigilance` / `good`) avec un ton non alarmiste
- **Écran résultat après email (`ThankYouPage`)** : refonte complète avec titre "VOTRE SCORE CONFORMITÉ nLPD", jauge `/100`, contenu conditionnel selon 3 seuils (`<40`, `40-79`, `80-100`) et bloc CTA "PRENDRE RENDEZ-VOUS - 30 MIN"
- **Jauge (`ScoreGauge`)** : affichage `XX/100` et seuils couleurs alignés sur la nouvelle mécanique (`red <40`, `orange 40-79`, `green >=80`)
- **Robustesse scoring** : fallback local automatique si OpenAI ne renvoie pas `score_100` / `severity_band` / `top_issues`
- **Responsive mobile/desktop** : amélioration des CTA multilignes, typographie, interlignage, paddings et gestion des débordements (dont emails longs)
- **Politique de confidentialité** : mise à jour des sections données/finalités/destinataires pour refléter PostHog et SiteBehaviour
- **Référence assistant OpenAI** : documentation alignée sur le prompt actif `docs/assistant-prompt-nlpd-v2-score100.md`

### Décisions et alternatives documentées
- **Décision validée** : conserver le teaser personnalisé sur l’écran intermédiaire quand il est disponible.
- **Alternatives conservées pour itération future** :
  - texte neutre unique pour tous les niveaux,
  - suppression totale du bloc message intermédiaire,
  - affichage du teaser uniquement après validation éditoriale.
- **Pistes créatives/engageantes possibles** (non implémentées à ce stade) :
  - micro-animation différente selon le niveau pour renforcer la lisibilité sans dramatiser,
  - message d'encouragement personnalisé avec progression en 3 étapes,
  - variante storytelling courte ("où vous en êtes / prochaine action / bénéfice attendu").

### À venir
- Intégration Dreamlit pour envoi automatique d'emails
- Migration appel OpenAI vers Supabase Edge Function
- Dashboard admin pour visualiser les leads

---

## [0.9.0] - 2026-02-04

### Ajouté
- **Disclaimer légal** : mention en bas de la page de résultats indiquant que YPSYS ne s'engage pas sur l'exhaustivité/exactitude des résultats
- **Q8 nLPD** : précision FINMA pour le secteur financier concernant le stockage en Europe

### Modifié
- **Calendrier de réservation** : migration de Outlook Book With Me vers TidyCal (Lionel Dumas) avec embed intégré
- **Page d'accueil** : bloc d'avertissement déplacé au-dessus du bouton CTA ; line-height ajusté sur le sous-titre
- **Terminologie** : "expert nLPD" → "consultant nLPD", "Nos experts sont disponibles" → "Notre équipe est disponible"

---

## [0.8.0] - 2026-02-03

### Supprimé
- **PostHog** : retrait complet (PostHogLoader, posthog-loader.js) ; aucun outil d'analytics sur le formulaire
- **Bandeau cookies** : CookieBanner et CookieConsentContext retirés ; pas de cookies sur le formulaire

### Modifié
- **Politique de confidentialité** : section Destinataires sans mention de PostHog ni de cookies statistiques
- **Documentation** : README, audit RGPD/nLPD et STORY alignés (périmètre sans PostHog, pas de bandeau cookies)

---

## [0.7.0] - 2026-02-03

### Ajouté
- **Politique de confidentialité** : page `/politique-confidentialite` (structure alignée sur la politique de cookies Ypsys) avec sections Introduction, Données collectées, Finalités, Destinataires et transferts, Durée, Droits, Contact ; lien cliquable depuis le formulaire de capture de leads
- **Audit RGPD/nLPD** : [docs/audit-securite-rgpd-nlpd.md](docs/audit-securite-rgpd-nlpd.md) — inventaire des données, flux, conformité RGPD/nLPD, sécurité technique, recommandations ; mise en œuvre des actions P0 documentée

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
