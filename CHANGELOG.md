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

## [0.3.0] - 2026-01-28

### Ajouté
- Configuration Railway complète (railway.json, nixpacks.toml, Procfile)
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
