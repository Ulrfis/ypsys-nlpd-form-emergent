# PRD: Formulaire nLPD Ypsys

## Vue d'ensemble

Application web interactive d'auto-diagnostic de conformité nLPD (nouvelle Loi fédérale sur la protection des données) pour Ypsys, destinée aux cabinets médicaux, laboratoires et fiduciaires en Suisse.

## Flux utilisateur

```
1. Landing Page → "Commencer l'évaluation"
2. Questionnaire (15 questions) → "Envoyer les réponses"
3. Écran d'analyse animé (4 étapes visuelles)
4. Écran de résultats avec teaser IA → "Recevoir mon rapport complet gratuit"
5. Formulaire simplifié (prénom + email obligatoires)
6. Page de remerciement avec score complet
```

## Fonctionnalités implémentées

### 1. Page d'accueil
- Branding Ypsys avec couleur primaire Magenta (#C8007F)
- Statistiques clés (90% pensent être conformes, 70% ne le sont pas)
- Message d'avertissement explicatif
- Bouton CTA "Commencer l'évaluation"
- Support du mode sombre/clair

### 2. Questionnaire interactif (15 questions)
- **5 sections thématiques** avec barre de progression
- Tooltips enrichis "Pourquoi c'est important?"
- Feedback instantané (succès/avertissement/danger)
- **Bouton final**: "Envoyer les réponses" (et non "Suivant")

### 3. Écran d'analyse animé
Affiche 4 étapes avec animation progressive:
1. ✅ Analyse de vos réponses...
2. ✅ Calcul du score de conformité...
3. ✅ Évaluation des risques...
4. ✅ Génération des recommandations...

Icône shield animée + indicateur de progression (3 points)

### 4. Écran de résultats avec teaser IA (NOUVEAU)
- **En-tête**: "Votre analyse est prête !" avec icône sparkle
- **Score**: X/10 dans une carte dédiée
- **Status**: Vert/Orange/Rouge avec message contextuel
- **Aperçu des priorités**: Teaser généré par OpenAI Assistant
- **Section email**: "Obtenez votre rapport complet par email" avec 3 bénéfices
- **CTA**: "Recevoir mon rapport complet gratuit"

### 5. Formulaire simplifié (NOUVEAU)
**Champs obligatoires:**
- Prénom *
- Email professionnel *

**Champs optionnels** (dans section dépliable):
- Nom
- Nom de l'entreprise
- Taille de l'entreprise
- Secteur d'activité
- Canton

**Éléments:**
- Case de consentement obligatoire
- Bouton "Recevoir mon rapport"
- Mention "Gratuit • Sans engagement • Résultats immédiats"

### 6. Page de remerciement
- Score complet avec indicateur visuel
- Top 3 priorités d'action
- Confirmation d'envoi email
- CTA "Réserver une consultation"

## Architecture technique

### Frontend (React)
- **Framework**: React 19 avec React Router
- **Styling**: Tailwind CSS + shadcn/ui
- **Animations**: Framer Motion
- **Intégrations**: OpenAI SDK, Supabase JS Client

### Backend (Supabase - Europe)
- **Base de données**: PostgreSQL hébergé à Frankfurt
- **RLS**: Row Level Security activé
- **Tables**: form_submissions, email_outputs

### OpenAI Assistant
- **ID**: asst_felvhtNS41JmXwkrGMPbXo3S
- **Appel**: Après "Envoyer les réponses", avant le formulaire
- **Output**: Teaser personnalisé + classification lead

## Flux de données détaillé

```
[Question 15] 
    → Clic "Envoyer les réponses"
    → [Écran d'analyse animé]
    → Calculate score (frontend)
    → Build payload JSON
    → Call OpenAI Assistant (avec timeout 45s)
    → [Écran de résultats avec teaser]
    → Clic "Recevoir mon rapport"
    → [Formulaire simplifié]
    → Save to Supabase (form_submissions + email_outputs)
    → [Page de remerciement]
```

## Variables d'environnement

### Frontend (.env)
```
REACT_APP_BACKEND_URL=<preview_url>
REACT_APP_SUPABASE_URL=https://hdvhvadnwgaibcvvqypk.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJ...
REACT_APP_OPENAI_API_KEY=sk-...
REACT_APP_OPENAI_ASSISTANT_ID=asst_felvhtNS41JmXwkrGMPbXo3S
```

## URLs

- **Frontend**: https://prd-builder-15.preview.emergentagent.com
- **Supabase Dashboard**: https://supabase.com/dashboard/project/hdvhvadnwgaibcvvqypk

## Prochaines étapes

1. **Intégration Dreamlit**: Envoi automatique d'emails
2. **Application calendrier**: Réservation de consultations
3. **Sécurisation production**: Déplacer OpenAI côté serveur (Edge Function)

---

*Version 3.0 - Janvier 2026*
*Nouveau flux: Analyse → Teaser IA → Formulaire simplifié*
