# Formulaire nLPD Ypsys — Development Story

**Status**: 🟢 Complete
**Creator**: Memoways / Emergent AI
**Started**: 2026-01-27
**Last Updated**: 2026-03-28 (Supabase insert post-analyse + RLS UPDATE, score déterministe app/API, prompt v4, TidyCal embed, doc tests assistant)

---

## Genesis Block

### The Friction
Les PME suisses (cabinets médicaux, laboratoires, fiduciaires) pensent être conformes à la nLPD à 90%, mais en réalité 70% ne le sont pas. Elles découvrent leurs failles trop tard : pendant un audit du PFPDT, après un incident de sécurité, ou lors d'une réclamation patient. Il manquait un outil d'auto-diagnostic simple, rapide et non-culpabilisant pour sensibiliser ces organisations.

### The Conviction
Ypsys, spécialisé dans l'accompagnement IT pour le secteur médical suisse, avait besoin d'un outil de génération de leads qualifiés. Un formulaire interactif combinant expertise juridique nLPD et intelligence artificielle permet de fournir une valeur immédiate (diagnostic) tout en identifiant les prospects à fort potentiel.

### Initial Vision
Créer un formulaire de 15 questions couvrant 5 domaines clés de la nLPD :
- Accès aux données
- Protection des données
- Sous-traitants
- Droits des personnes
- Gestion des incidents

Avec génération automatique d'un diagnostic personnalisé par IA et capture de leads pour l'équipe commerciale.

### Target Human
**Marie, 45 ans, directrice d'un cabinet médical de 12 personnes à Lausanne**

**Context**: Elle gère le cabinet depuis 10 ans, a entendu parler de la nLPD mais n'a jamais fait d'audit formel. Elle craint qu'un patient mécontent ou un employé qui part crée un incident.

**Struggle**: Elle ne sait pas par où commencer pour évaluer sa conformité. Les audits professionnels coûtent cher et prennent du temps. Elle a peur d'être "prise en défaut".

**Success**: Marie reçoit en 5 minutes un diagnostic clair avec ses 3 priorités d'action. Elle comprend ses failles sans jugement et sait quoi faire ensuite.

**How this helps**: Le formulaire est gratuit, rapide, non-culpabilisant, et fournit des recommandations actionnables immédiatement.

### Tools Arsenal
| Tool | Role |
|------|------|
| Emergent AI (Claude) | Développement full-stack, génération de code |
| React + Tailwind | Frontend interactif et responsive |
| FastAPI | Backend API |
| Supabase | Base de données PostgreSQL (Europe) |
| OpenAI Assistant | Génération de teaser personnalisé |
| Framer Motion | Animations fluides |
| shadcn/ui | Composants UI accessibles |

---

## Feature Chronicle

### 2026-01-27 — Setup initial et design system 🔷

**Intent**: Établir les fondations du projet avec le branding Ypsys et le design system.

**Prompt(s)**:
```
Il faut utiliser le PRD attaché pour construire ce formulaire interactif.
Utiliser les indications dans le questionnaire enrichi pour proposer une
expérience riche et plus complète, avec plus d'informations.
```

**Tool**: Emergent AI

**Outcome**:
- Design system complet avec couleur Magenta (#C8007F)
- Tokens CSS en HSL pour light/dark mode
- Composants shadcn/ui customisés
- Typography Playfair Display + Inter

**Surprise**: Le design system-first approach a permis une cohérence visuelle immédiate sans retouches.

**Time**: ~1h

---

### 2026-01-27 — Questionnaire 15 questions 🔷

**Intent**: Implémenter les 15 questions nLPD avec tooltips enrichis et feedback instantané.

**Outcome**:
- 5 sections avec icônes et progression
- Chaque question avec tooltip "Pourquoi c'est important?"
- 3-4 options par question avec feedback coloré
- Animation de transition entre questions

**Friction**: Les tooltips natifs HTML n'étaient pas assez riches.

**Resolution**: Utilisation de Radix UI Tooltip avec contenu structuré (titre, description, risque).

**Time**: ~2h

---

### 2026-01-27 — Intégration OpenAI Assistant + Supabase 🔷

**Intent**: Connecter l'Assistant OpenAI pour générer des analyses personnalisées et sauvegarder dans Supabase.

**Prompt(s)**:
```
Pour intégrer OpenAI Assistant et Supabase, j'ai besoin des informations suivantes:
1. OpenAI API Key
2. OpenAI Assistant ID
3. Supabase URL et clé anon
```

**Tool**: OpenAI SDK, Supabase JS Client

**Outcome**:
- Client OpenAI avec gestion de timeout (45s)
- Fallback local si OpenAI indisponible
- Tables Supabase form_submissions et email_outputs
- Politiques RLS configurées

**Friction**: Erreur 401 avec Supabase - la clé fournie initialement n'était pas la bonne (sb_publishable au lieu de eyJ...).

**Resolution**: Demande de clarification au client pour obtenir la clé anon correcte. Mise à jour des politiques RLS.

**Time**: ~1.5h

---

### 2026-01-27 — Nouveau flux avec écran de résultats IA 🔷

**Intent**: Implémenter le flux demandé : Envoyer → Analyse → Résultats avec teaser → Formulaire.

**Prompt(s)**:
```
Après la dernière question, IL FAUT ajouter un bouton "Envoyer les réponses"
puis mettre un écran qui montre l'envoi des données (animation), la génération
de la réponse (animation) et une fois la réponse reçue, montrer un écran qui
affiche la réponse générée par l'assistant.
```

**Tool**: Emergent AI, Framer Motion

**Outcome**:
- Bouton "Envoyer les réponses" à la dernière question
- Écran d'analyse avec 4 étapes animées
- Page ResultsPreview avec score + teaser IA + CTA
- Formulaire simplifié (prénom + email obligatoires)

**Surprise**: L'animation des étapes d'analyse crée une attente positive et donne une impression de "travail en cours" qui rassure l'utilisateur.

**Time**: ~1h

---

### 2026-01-28 — Configuration Railway 🔹

**Intent**: Préparer le projet pour déploiement sur Railway.

**Outcome**:
- railway.json, nixpacks.toml, Procfile créés
- Backend simplifié sans MongoDB
- requirements.txt minimal
- Support fichiers statiques pour SPA

**Time**: ~30min

---

### 2026-01-28 — Déploiement Railway : L'odyssée 🔴➡️🟢

**Intent**: Déployer le projet sur Railway pour la production.

**Tool(s)**: Claude Code (5 tentatives), puis Cursor (3 tentatives)

**The Journey**:

Ce déploiement a été une véritable leçon d'humilité. Malgré 5 tentatives avec Claude Code, le build échouait systématiquement. C'est finalement Cursor qui a résolu le problème en 3 itérations.

**Problème 1 — "No module named pip"** (Claude Code, tentatives 1-5)
```
/root/.nix-profile/bin/python3: No module named pip
```
La configuration initiale utilisait `python3 -m pip install`. Or, dans l'environnement Nix de Railway, `python311Packages.pip` installe pip comme commande standalone (`pip3`), PAS comme module Python. Claude Code n'a pas réussi à identifier cette subtilité de Nixpacks.

**Problème 2 — "externally-managed-environment"** (Cursor, tentative 1)
```
error: externally-managed-environment
× This environment is externally managed
```
Après correction vers `pip3 install`, le build a révélé un autre problème : PEP 668. L'environnement Python de Nix est "externally managed" et interdit les installations pip directes dans le système. Cursor a proposé d'utiliser un virtual environment.

**Problème 3 — "uvicorn: command not found"** (Cursor, tentative 2)
```
/bin/bash: line 1: uvicorn: command not found
```
Le venv était créé et pip fonctionnait, mais au démarrage le serveur ne trouvait pas uvicorn. Cause : `railway.toml`, `railway.json` et `Procfile` avaient leurs propres commandes de démarrage qui n'utilisaient pas le chemin du venv. Cursor a identifié ces 3 fichiers et les a tous corrigés.

**Solution finale**:
```toml
# nixpacks.toml
[phases.install]
cmds = [
    "cd frontend && npm install",
    "python3 -m venv /app/venv",
    "/app/venv/bin/pip install -r backend/requirements.txt"
]

[start]
cmd = "cd backend && /app/venv/bin/uvicorn server:app --host 0.0.0.0 --port ${PORT:-8000}"
```

**Outcome**:
- Virtual environment Python isolé
- Tous les fichiers de config alignés (nixpacks.toml, railway.toml, railway.json, Procfile)
- Build et déploiement réussis

**Friction**: 8 tentatives au total, 2h30 de debugging.

**Surprise**: La documentation Nixpacks ne mentionne pas explicitement ces edge cases Python/Nix. Claude Code connaissait les concepts mais n'arrivait pas à les connecter au contexte spécifique. Cursor, avec son approche plus itérative et son accès aux logs en temps réel, a mieux navigué ce problème.

**Emotional state**: Frustration initiale → Soulagement → Satisfaction d'avoir compris les mécanismes sous-jacents.

**Time**: ~2h30

---

### 2026-02-02 — Révision complète du questionnaire nLPD 🔷

**Intent**: Améliorer la clarté, l'accessibilité et l'expérience utilisateur du questionnaire suite aux retours du client.

**Prompt(s)**:
```
Mettre à jour le questionnaire selon les indications données dans le document joint
```

**Tool**: Claude Code

**Outcome**:
- 15 questions révisées avec textes simplifiés
- Ordre des réponses réorganisé (non-conforme → conforme) pour toutes les questions
- Suppression de 2 options redondantes (Q9, Q14)
- Tooltips raccourcis et plus directs
- Terminologie accessible : "MdP" → "mot de passe", "Chiffrement" → "Cryptage"
- Ton moins culpabilisant, plus orienté action
- Focus sur les principes nLPD plutôt que sur les sanctions

**Changes détaillés** :
- Q1-Q15 : Réorganisation des options (rouge/orange/vert → ordre logique)
- Q5 : Question renommée "Comment est organisée la sauvegarde..." (au lieu de "fonctionnent-elles")
- Q6 : "listant les accès" au lieu de "qui peut accéder à quoi"
- Q8 : "Hors Europe" devient non-conforme (rouge) au lieu d'acceptable (orange)
- Q13 : "sensibilisée aux risques de cyberattaque" au lieu de "connaît les règles nLPD"
- Q14 : Option "réparti mais pas formalisé" supprimée (seulement 2 options désormais)

**Friction**: Document de modifications fourni en .txt avec encodage UTF-8, nécessitant une lecture attentive pour bien interpréter les instructions.

**Resolution**: Traitement systématique question par question avec suivi via TodoWrite pour garantir l'exhaustivité.

**Surprise**: La réorganisation des options dans l'ordre "problématique → conforme" (au lieu de "conforme → problématique") améliore l'expérience : l'utilisateur voit d'abord ce qui ne va pas, puis la solution.

**Time**: ~1h30

---

### 2026-02-03 — Payload OpenAI complet, doc API et schéma Supabase 🔷

**Intent**: S'assurer que l'assistant OpenAI reçoit **toutes** les réponses du questionnaire pour produire une analyse détaillée (teaser + email prospect + email commerciaux), et que la base Supabase est prête à recevoir ces 3 sorties.

**Prompt(s)**:
- "Il faut envoyer TOUTES les réponses de TOUTES les questions pour que l'assistant OpenAI puisse travailler en détail..."
- "Mettre à jour la base Supabase pour recevoir toutes les réponses depuis l'application, ainsi que les réponses détaillées et formattées via l'assistant (les 3 réponses: teaser, rapport prospect, contexte commerciaux)"

**Tool**: Cursor

**Outcome**:
- Payload enrichi vers `/api/analyze` : `answers` (q1..q15) + `answers_detailed` (question_id, question, answer) pour chaque item ; le backend transmet l'intégralité à OpenAI
- Panneau debug affiche désormais le payload **complet** envoyé (plus seulement un résumé avec answer_count), pour vérifier en prod que toutes les réponses partent bien
- Documentation [docs/openai-analyze-and-supabase-flow.md](docs/openai-analyze-and-supabase-flow.md) : format requête/réponse API analyze, flux OpenAI → app → Supabase (form_submissions + email_outputs)
- Script SQL [docs/supabase-schema-update.sql](docs/supabase-schema-update.sql) : création/mise à jour idempotente des tables form_submissions et email_outputs (réponses complètes, teaser_text, lead_temperature, email_user_*, email_sales_*, suivi envoi), avec RLS
- Dépannage Railway : section dans deployment-railway-env.md pour « Credentials not configured » → variables REACT_APP_* injectées au **build** ; après ajout des variables, il faut **redéployer** (pas seulement redémarrer)

**Friction**: En production, le panneau debug ne montrait qu'un résumé (payload_summary avec user, score, answer_count), donnant l'impression que seules des infos globales étaient envoyées à OpenAI ; en réalité le corps de la requête contenait déjà le payload complet — seul l'affichage debug était réducteur.

**Resolution**: Log debug modifié pour afficher le payload réel (answers + answers_detailed). Enrichissement du payload avec answers_detailed côté frontend pour que l'assistant ait le contexte explicite de chaque question.

**Surprise**: Les variables REACT_APP_* dans Railway ne sont prises en compte qu'au moment du build ; un simple "Apply changes" sans nouveau déploiement laisse le bundle actuel sans ces variables.

**Time**: ~1h

---

### 2026-02-03 — Mobile responsive et conformité RGPD/nLPD 🔷

**Intent**: Améliorer l'expérience smartphone (CTA et barre de navigation toujours visibles, pas de débordement) ; renforcer la conformité RGPD et nLPD (audit, politique de confidentialité, consentement cookies, API protégée, logs sanitisés).

**Tool**: Cursor

**Outcome**:
- **Mobile** : Barre de navigation (Précédent/Suivant) fixe en bas (layout `h-screen` + zone scrollable) ; questionnaire compact (polices plus petites, capsule chapitre supprimée, barre de progression moins haute) ; validation avec touche Entrée après sélection ; CTA et pages sans débordement largeur
- **Pages simplifiées** : « Votre analyse est prête » — bloc « Aperçu de vos priorités » supprimé ; « Votre diagnostic nLPD » — logo Ypsys, blocs Score/Gaps, Analyse personnalisée et « Vos 3 priorités » supprimés
- **Audit RGPD/nLPD** : [docs/audit-securite-rgpd-nlpd.md](docs/audit-securite-rgpd-nlpd.md) — inventaire des données, flux, écarts RGPD/nLPD, sécurité technique, synthèse des non-conformités et recommandations
- **Actions P0/P1 mises en œuvre** : (1) API backend protégée par `X-API-Key` (GET /api/submissions, GET /api/submissions/{id} et GET /api/stats exigent `API_ADMIN_SECRET`) ; (2) Politique de confidentialité `/politique-confidentialite` avec lien depuis LeadCaptureForm ; (3) Logs debug sanitisés (redactPayload — données personnelles remplacées par `[REDACTED]`). **2026-02-03** : PostHog et bandeau cookies retirés ; pas de cookies ni d’analytics sur le formulaire.

**Friction**: L'audit initial identifiait des écarts (API non protégée, politique absente, PostHog sans consentement, logs contenant des données personnelles) ; la mise en œuvre a nécessité plusieurs fichiers (PrivacyPolicy, backend Depends require_admin_api_key, debugLogger redactPayload). Plus tard : décision de ne pas utiliser de cookies ; PostHog et bandeau cookies ont été retirés.

**Resolution**: Application des actions P0 (API + politique) et sanitisation des logs ; documentation déploiement (API_ADMIN_SECRET). Retrait de PostHog et du bandeau cookies (CookieBanner, CookieConsentContext, PostHogLoader) — le formulaire n’utilise aucun cookie ni analytics.

**Time**: ~2h

---

### 2026-02-03 — Retrait PostHog et bandeau cookies 🔷

**Intent**: Ne pas utiliser de cookies ni d’analytics sur le formulaire pour l’instant.

**Outcome**:
- **PostHog retiré** : suppression de `PostHogLoader.jsx`, `posthog-loader.js` ; plus aucun script PostHog chargé.
- **Bandeau cookies retiré** : suppression de `CookieBanner.jsx` et `CookieConsentContext.jsx` ; plus de bandeau à la première visite.
- **App.js** : plus de `CookieConsentProvider`, `CookieBanner`, `PostHogLoader`.
- **Politique de confidentialité** : section Destinataires sans mention de PostHog ni de cookies statistiques.
- **Documentation** : README, CHANGELOG (v0.8.0), STORY et [docs/audit-securite-rgpd-nlpd.md](docs/audit-securite-rgpd-nlpd.md) alignés (périmètre sans PostHog, pas de cookies).

**Time**: ~30 min

---

### 2026-02-04 — Ajustements landing page, calendrier TidyCal et disclaimer 🔷

**Intent**: Améliorer la landing page (UX), migrer vers le calendrier TidyCal de Lionel Dumas, ajouter un disclaimer légal, et affiner le contenu du questionnaire.

**Tool**: Cursor

**Outcome**:
- **Landing page** : bloc d'avertissement ("Elles découvrent leurs failles trop tard...") déplacé au-dessus du bouton CTA pour un meilleur flow narratif ; line-height du sous-titre ajusté (`leading-relaxed` → `leading-snug`)
- **Calendrier de réservation** : migration de Outlook Book With Me vers TidyCal (https://tidycal.com/ldumas?embed=1) dans `lib/booking.js`
- **Page de résultats (ThankYouPage)** :
  - Terminologie : "expert nLPD" → "consultant nLPD", "Nos experts sont disponibles" → "Notre équipe est disponible"
  - Ajout d'un disclaimer légal en bas de page : "YPSYS ne s'engage en aucun cas sur l'exhaustivité ou l'exactitude des résultats..."
- **Q8 questionnaire** : réponse "En Europe" enrichie avec mention FINMA pour le secteur financier et le stockage exclusif en Suisse pour certaines données

**Friction**: Aucune — modifications de contenu et de style simples.

**Time**: ~30 min

---

### 2026-03-09 — Nouveau flow scoring /100, OpenAI v2 et pass responsive 🔷

**Intent**: Aligner l'expérience utilisateur avec une mécanique de score /100 pilotée par OpenAI, supprimer le score avant email, afficher le résultat complet après capture, et fiabiliser le rendu desktop/smartphone.

**Tool**: Cursor

**Outcome**:
- **Flow refactorisé** : `Questions -> Transition sans score -> Capture email -> Résultat complet -> Thank you final`
- **Écran pré-email (`ResultsPreview`)** :
  - suppression de la jauge et du score,
  - nouveau message "Votre analyse est terminée",
  - liste des livrables du rapport (score /100, priorités, roadmap, risques)
- **Écran résultat (`ThankYouPage`)** :
  - titre "VOTRE SCORE CONFORMITÉ nLPD",
  - jauge `/100`,
  - 3 variantes éditoriales selon seuils:
    - `<40` (critique),
    - `40-79` (vigilance),
    - `80-100` (bon niveau),
  - section dynamique des 3 priorités
- **Contrat OpenAI v2** : support de `score_100`, `severity_band`, `top_issues` côté frontend et backend
- **Fallback robuste** : si OpenAI ne renvoie pas les nouveaux champs, fallback local (score converti /100 + priorités locales)
- **Responsive pass 2** :
  - boutons CTA sans troncature (multilignes),
  - amélioration padding/interlignage,
  - gestion des longues adresses email,
  - lisibilité renforcée mobile et desktop
- **Docs ajoutées** :
  - `docs/assistant-prompt-nlpd-v2-score100.md`
  - `docs/plan-maj-scoring-nlpd.md`
- **Tracking analytics** :
  - PostHog intégré (`posthog-js`) avec événements de funnel (start, answers, navigation, analyse, lead submit, conversion, booking CTA)
  - script SiteBehaviour injecté côté frontend pour heatmap / comportement session
  - suivi des pages via route tracker (`page_view`)
  - politique de confidentialité mise à jour pour refléter ces traitements

**Friction**: concilier le nouveau contenu long (blocs éditoriaux) avec des écrans mobiles étroits sans générer de débordement ni de CTA illisibles.

**Resolution**: approche mobile-first avec suppression des truncates, autorisation du wrapping sur CTA, typographies adaptatives et interlignage `leading-relaxed`.

**Surprise**: la clarté perçue augmente fortement quand le score est déplacé après la capture email, tout en gardant une page de transition utile et moins anxiogène.

**Time**: ~2h

---

### 2026-03-11 — Clarification client, décisions UX et alternatives futures 🔷

**Intent**: Transformer les ambiguïtés de wording en décisions claires pour l'écran intermédiaire, et documenter explicitement les alternatives (dont des pistes plus créatives/engageantes) pour les prochaines itérations.

**Tool**: Cursor

**Processus suivi**:
1. Identifier les zones ambiguës visibles côté utilisateur (message intermédiaire + teaser + version de consignes IA).
2. Valider les choix métier prioritaires avec questions ciblées.
3. Appliquer les choix dans l'interface et aligner la documentation.
4. Documenter les alternatives gardées en réserve pour faciliter un pivot futur.

**Décisions appliquées**:
- prompt de référence = version v2 score `/100`,
- message intermédiaire dynamique selon niveau (`critical`/`vigilance`/`good`) avec ton non anxiogène,
- teaser IA conservé sur l'écran intermédiaire.

**Alternatives conservées (non implémentées)**:
- texte neutre identique pour tous les cas,
- suppression complète du message intermédiaire,
- affichage conditionnel du teaser (uniquement après validation éditoriale).

**Alternatives créatives/engageantes possibles**:
- micro-animation et iconographie distinctes par niveau (lisibilité émotionnelle, sans dramatisation),
- mini-parcours en 3 étapes sur l'écran intermédiaire ("diagnostic", "priorités", "plan d'action"),
- microcopy orientée bénéfices ("gain rapide", "effort estimé", "impact attendu"),
- version "progressive reveal" du résultat (info par info pour maintenir l'attention).

**Outcome**:
- wording intermédiaire plus juste selon le niveau,
- meilleure cohérence entre écran, emails et consignes IA,
- cadre de décision documenté pour accélérer les prochains arbitrages produit.

**Time**: ~1h

---

### 2026-03-24 — Mise à jour majeure selon PDF 23-03-26 🔷

**Intent**: Appliquer la nouvelle version métier du formulaire nLPD avec repositionnement de l'offre diagnostic, fusion du parcours post-questions, et alignement complet UI/email/prompt.

**Tool**: Cursor

**Outcome**:
- **Landing page** : texte d'introduction remplacé et encadré risque réécrit selon le PDF
- **Questionnaire** : suppression de l'encadré de relecture en bas de la dernière question
- **Parcours post-questions** :
  - fusion de `ResultsPreview` et `LeadCaptureForm` en une seule page
  - formulaire standard ou mode prérempli (`?email=`) affiché directement après l'analyse
  - CTA principal renommé en **"Recevoir mon diagnostic prioritaire"**
  - mention ajoutée : *Valeur du diagnostic de 650 CHF = offert*
- **Restitution finale (`ThankYouPage`)** :
  - suppression de la jauge
  - score affiché en grand
  - nouveaux paliers éditoriaux:
    - `90-100`: **Exemplaire**
    - `60-89`: **Risque modéré**
    - `0-59`: **Risque élevé**
  - combinaison de 3 couches de contenu :
    1) texte générique par palier,
    2) bloc OpenAI (`result_summary` + `result_focus_points`),
    3) encart statique **Diagnostic NLPD prioritaire offert** avec promesse/CTA adaptés au palier
- **Contrat OpenAI/API** :
  - nouveaux champs `result_summary` et `result_focus_points`
  - seuils harmonisés frontend/backend:
    - `critical`: 0-59
    - `vigilance`: 60-89
    - `good`: 90-100
- **Prompt assistant** :
  - conservation de la **v2** dans son fichier d'origine
  - création d'une **v3 clean** dans `docs/assistant-prompt-nlpd-v3-score100.md`
  - ajout explicite dans l'email utilisateur de la section `## Synthèse et prochaines étapes` avec le paragraphe `### Diagnostic NLPD prioritaire offert` variable selon score
- **Documentation flux** : `docs/openai-analyze-and-supabase-flow.md` alignée sur le contrat v3

**Friction**: l'ancien fichier v2 a été temporairement écrasé par la version v3 lors de l'itération; il a fallu restaurer la v2 pour garder une séparation claire des versions de prompt.

**Resolution**: retour à une stratégie explicite de versionnement documentaire:
- `docs/assistant-prompt-nlpd-v2-score100.md` (stable / historique),
- `docs/assistant-prompt-nlpd-v3-score100.md` (nouvelle version active).

**Surprise**: la fusion preview + formulaire simplifie fortement la compréhension utilisateur tout en conservant le flux prérempli sans coût UX supplémentaire.

**Time**: ~2h

---

### 2026-03-28 — Supabase sans attendre l’email, score cohérent, prompt v4 🔷

**Intent**: Enregistrer les réponses dans `form_submissions` même si l’utilisateur abandonne avant la capture lead ; supprimer la variance du score /100 imputable au modèle ; documenter les tests assistant ; finaliser l’embed TidyCal sur la page post-email.

**Tool**: Cursor

**Outcome**:
- **Supabase** : après `generateAnalysis`, `insertFormSubmissionAfterAnalysis` écrit une ligne avec `answers`, scores, teaser, `consent_marketing` false jusqu’au lead ; à la soumission du formulaire, `finalizeFormSubmissionLead` fait un UPDATE (email, identité, consentement, `status` `lead_complete`) puis INSERT `email_outputs` si règles Dreamlit remplies ; `saveSubmission` reste en secours si `submissionId` absent ; politique RLS **UPDATE** `anon` sur `form_submissions` ajoutée dans `docs/supabase-schema-update.sql` (à exécuter en SQL Editor prod)
- **Score** : backend et frontend imposent `score_100` depuis `payload.score` ; `score_100_assistant_raw` exposé pour audit ; UI (`FormFlow`) utilise le score local pour la bande de sévérité
- **Prompt** : `docs/assistant-prompt-nlpd-v4-score100.md` — instructions complètes à coller dans OpenAI (marqueurs `<<<DEBUT_PROMPT>>>` / `<<<FIN_PROMPT>>>`) ; cohérence rédactionnelle avec le score questionnaire
- **Docs** : `docs/assistant-regression-testing.md`, mise à jour `docs/openai-analyze-and-supabase-flow.md`, `docs/assistant-prompt-nlpd.md` → v4
- **TidyCal** : `ThankYouPage` — iframe `?embed=1` sur le créneau `30-minute-meeting`, lien nouvel onglet conservé pour analytics

**Friction**: sans politique RLS UPDATE, le finalize lead échouait silencieusement ou en erreur pour les clients ; le score « inventé » par l’assistant créait de la méfiance côté client (tests 10/100 vs 67/100).

**Resolution**: policy UPDATE idempotente documentée ; source de vérité score = questionnaire ; prompt v4 rappelle d’utiliser `round(normalized×10)` dans les textes.

**Time**: ~1 session (impl + doc)

---

## Pivots & Breakages

### 2026-01-27 — Clé Supabase incorrecte

**What broke**: Erreur 401 lors des insertions Supabase - aucune donnée ne s'enregistrait.

**Why**: La clé fournie (`sb_publishable_...`) n'était pas la clé anon JWT standard de Supabase (`eyJ...`).

**What you learned**:
- Toujours vérifier le format des clés API avant de les utiliser
- Les clés Supabase anon commencent par `eyJ` (JWT)
- Avoir un fallback permet de continuer les tests même si une intégration échoue

**Emotional state**: Légère frustration mais vite résolue par une clarification directe avec le client.

---

### 2026-01-27 — OpenAI Assistant timeout

**What broke**: L'appel à l'Assistant OpenAI prenait plus de 60 secondes, bloquant l'UI.

**Why**: L'API `createAndPoll` peut bloquer indéfiniment si l'Assistant est lent ou surchargé.

**What you learned**:
- Toujours implémenter un timeout explicite pour les appels externes
- Avoir un fallback local garantit une expérience utilisateur même dégradée
- L'animation de chargement masque le temps d'attente perçu

**Emotional state**: Soulagement quand le fallback a fonctionné parfaitement.

---

### 2026-02-03 — « Credentials not configured » en prod malgré les variables Railway

**What broke**: En production, l'app affichait « Supabase credentials not configured » et « Failed to fetch » à la soumission du formulaire, alors que REACT_APP_SUPABASE_URL et REACT_APP_SUPABASE_ANON_KEY étaient bien configurées dans Railway (onglet Variables).

**Why**: Les variables REACT_APP_* sont injectées **au moment du build** (Create React App / craco), pas au runtime. Les variables avaient été ajoutées après le dernier déploiement ; le build actuel en prod avait donc été généré **sans** ces variables (undefined dans le bundle).

**What you learned**: Après ajout ou modification de variables REACT_APP_* dans Railway, il faut **redéployer** (bouton Deploy) pour relancer un build avec les nouvelles valeurs. Un simple redémarrage du service ne suffit pas. Documenté dans docs/deployment-railway-env.md (section Dépannage).

**Emotional state**: Légère confusion (« j'ai bien mis les variables ») puis soulagement une fois le mécanisme build-time compris.

---

### 2026-01-28 — Railway Deployment Hell

**What broke**: Le déploiement Railway échouait systématiquement (8 tentatives au total).

**Why**: Trois problèmes en cascade :
1. `python3 -m pip` ne fonctionne pas avec Nix (pip n'est pas un module Python)
2. `pip3 install` direct bloqué par PEP 668 (externally-managed-environment)
3. Les fichiers de config Railway (railway.toml, railway.json, Procfile) surchargent nixpacks.toml

**What you learned**:
- Nixpacks avec Python nécessite TOUJOURS un virtual environment
- Vérifier TOUS les fichiers de configuration, pas seulement nixpacks.toml
- Les outils IA ont des forces complémentaires : Claude Code pour l'architecture, Cursor pour le debugging itératif
- Lire les logs d'erreur COMPLÈTEMENT - chaque erreur était différente

**Emotional state**: Cycle frustration → investigation → eureka, répété 3 fois. Satisfaction finale d'avoir compris le "pourquoi" de chaque erreur.

---

## Pulse Checks

### 2026-01-27 — Pulse Check #1

**Energy level**: 8/10
**Current doubt**: Est-ce que l'Assistant OpenAI sera assez rapide en production?
**Current satisfaction**: Le design system et les animations donnent un résultat très professionnel.
**If you stopped now, what would you regret?**: Ne pas avoir testé le flux complet end-to-end.
**One word**: Satisfait

### 2026-01-28 — Pulse Check #2 (matin)

**Energy level**: 9/10
**Current doubt**: Le déploiement Railway va-t-il fonctionner du premier coup?
**Current satisfaction**: Le nouveau flux (Analyse → Résultats → Formulaire) est exactement ce que le client voulait.
**If you stopped now, what would you regret?**: Ne pas avoir documenté proprement le projet.
**One word**: Accompli

### 2026-01-28 — Pulse Check #3 (après-midi)

**Energy level**: 7/10 → 9/10
**Current doubt**: Après 5 échecs avec Claude Code, j'ai douté de pouvoir déployer du tout.
**Current satisfaction**: Cursor a résolu le problème en 3 itérations. Le projet est EN PRODUCTION !
**If you stopped now, what would you regret?**: Rien — le projet est complet et déployé.
**One word**: Victorieux

### 2026-02-02 — Pulse Check #4

**Energy level**: 8/10
**Current doubt**: Les modifications vont-elles vraiment améliorer l'expérience utilisateur ou juste changer les mots?
**Current satisfaction**: La réorganisation des réponses donne un flow plus naturel. Les utilisateurs voient d'abord leurs problèmes, puis les solutions.
**If you stopped now, what would you regret?**: Ne pas avoir testé le questionnaire avec de vrais utilisateurs pour valider ces améliorations.
**One word**: Affiné

### 2026-02-03 — Pulse Check #5

**Energy level**: 8/10
**Current doubt**: L'assistant OpenAI va-t-il bien renvoyer email_user et email_sales (format body_markdown + subject) pour que Supabase les stocke?
**Current satisfaction**: Payload complet vers OpenAI documenté et visible en debug ; schéma Supabase aligné avec l'app ; dépannage Railway documenté.
**If you stopped now, what would you regret?**: Ne pas avoir validé en prod un flux complet avec email_user/email_sales non null.
**One word**: Aligné

### 2026-02-03 — Pulse Check #6 (mobile + RGPD/nLPD)

**Energy level**: 8/10
**Current doubt**: Les utilisateurs vont-ils bien voir le bandeau cookies et comprendre « Tout accepter » vs « Refuser les statistiques »?
**Current satisfaction**: Audit RGPD/nLPD documenté ; politique de confidentialité en place ; API protégée ; mobile avec barre de nav fixe et CTA visibles. PostHog et bandeau cookies retirés — pas de cookies sur le formulaire.
**If you stopped now, what would you regret?**: Ne pas avoir documenté les transferts US (OpenAI) dans la politique (DPA / clauses types).
**One word**: Conforme

---

## Insights Vault

**2026-01-27**: Un design system-first approach économise énormément de temps sur les ajustements visuels ultérieurs.

**2026-01-27**: Les animations de chargement ne sont pas du "filler" - elles communiquent un travail en cours et réduisent la perception du temps d'attente.

**2026-01-27**: Toujours avoir un fallback pour les intégrations externes (IA, APIs) - l'expérience utilisateur ne doit jamais bloquer complètement.

**2026-01-28**: Pour Railway, un requirements.txt minimal est préférable à un pip freeze complet - moins de dépendances = moins de problèmes potentiels.

**2026-01-28**: Séparer l'appel IA de la capture de données utilisateur permet de montrer de la valeur AVANT de demander des informations personnelles.

**2026-01-28**: Nixpacks + Python + Nix = terrain miné. Toujours utiliser un venv pour les projets Python sur Railway avec Nixpacks.

**2026-01-28**: Les fichiers de configuration Railway peuvent se "surcharger" mutuellement (railway.toml > railway.json > Procfile > nixpacks.toml). S'assurer qu'ils sont tous alignés.

**2026-01-28**: Différents outils IA ont différentes forces. Claude Code excelle en architecture et refactoring. Cursor brille pour le debugging itératif avec feedback en temps réel.

**2026-02-02**: L'ordre de présentation des options dans un formulaire influence l'expérience : montrer d'abord le problème (rouge) puis la solution (vert) crée un parcours plus naturel que l'inverse.

**2026-02-02**: Simplifier n'est pas "dumbing down" - c'est rendre accessible. "Cryptage" au lieu de "chiffrement", "mot de passe" au lieu de "MdP" réduit la charge cognitive sans perdre la précision.

**2026-02-02**: Un ton moins culpabilisant ("Il faut agir rapidement" au lieu de "Urgent: mise en conformité + notification rétroactive") maintient l'urgence tout en étant moins anxiogène.

**2026-02-02**: Les modifications de contenu à grande échelle (15 questions × 3-4 options) bénéficient d'une approche systématique avec suivi (TodoWrite) - sinon on oublie des éléments.

**2026-02-03**: Les variables REACT_APP_* (CRA/craco) sont figées au build. En prod, toute modification de ces variables exige un **redéploiement** (nouveau build), pas seulement un redémarrage.

**2026-02-03**: Le panneau debug doit afficher le payload **réel** envoyé aux APIs (pas un résumé), sinon on croit à tort que peu de données sont envoyées (ex. OpenAI).

**2026-02-03**: Conformité RGPD/nLPD = audit + actions prioritaires (politique de confidentialité, API protégée, logs sans données personnelles). PostHog et bandeau cookies retirés : le formulaire n’utilise aucun cookie ni outil d’analytics.

---

## Artifact Links

| Date | Type | Link/Location | Note |
|------|------|---------------|------|
| 2026-01-27 | URL | https://prd-builder-15.preview.emergentagent.com | Preview Emergent |
| 2026-01-27 | Screenshot | /tmp/landing.png | Page d'accueil |
| 2026-01-27 | Screenshot | /tmp/question1.png | Première question |
| 2026-01-27 | Screenshot | /tmp/results_preview.png | Écran résultats IA |
| 2026-01-27 | Screenshot | /tmp/simplified_form.png | Formulaire simplifié |
| 2026-01-28 | Config | /app/railway.json | Configuration Railway |
| 2026-02-03 | Doc | docs/openai-analyze-and-supabase-flow.md | Format API analyze, flux Supabase |
| 2026-02-03 | SQL | docs/supabase-schema-update.sql | Schéma Supabase (form_submissions, email_outputs) |
| 2026-02-03 | Doc | docs/audit-securite-rgpd-nlpd.md | Audit sécurité et conformité RGPD/nLPD |
| 2026-02-03 | Doc | docs/assistant-prompt-nlpd.md | Prompt assistant OpenAI nLPD |

---

## Narrative Seeds

- "90% pensent être conformes, 70% ne le sont pas" — la statistique qui accroche
- "Pas de jugement" — le ton non-culpabilisant qui différencie cet outil
- "Votre analyse est prête !" — le moment de satisfaction après l'attente
- L'animation des 4 étapes d'analyse transforme une attente technique en moment de suspense positif
- Montrer la valeur (teaser IA) AVANT de demander l'email — inversion du modèle classique de lead gen

---

## Story Synthesis Prompt

```
You are helping me write the genesis story of the nLPD Ypsys Form.

Using the documented journey in this file, craft a compelling narrative following this structure:
1. Open with the Friction (make readers feel the problem viscerally)
2. Establish the Conviction (why this solution, why now, why you)
3. Show the messy Process (failures, pivots, unexpected challenges)
4. Highlight key Progression moments (breakthroughs, things clicking into place)
5. Weave in Human moments (frustration → insight cycles, emotional journey)
6. Close with Durable Insights (what you learned that applies beyond this project)

Tone: Honest, specific, humble but confident.
Length: Blog post (800-1200 words)
```

---

*Story documented with Emergent AI*
