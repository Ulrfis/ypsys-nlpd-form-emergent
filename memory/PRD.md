# PRD: Formulaire nLPD Ypsys

## Vue d'ensemble

Application web interactive d'auto-diagnostic de conformité nLPD (nouvelle Loi fédérale sur la protection des données) pour Ypsys, destinée aux cabinets médicaux, laboratoires et fiduciaires en Suisse.

## Fonctionnalités implémentées

### 1. Page d'accueil
- Branding Ypsys avec couleur primaire Magenta (#C8007F)
- Statistiques clés (90% pensent être conformes, 70% ne le sont pas)
- Message d'avertissement explicatif
- Bouton CTA "Commencer l'évaluation"
- Support du mode sombre

### 2. Questionnaire interactif (15 questions)
- **5 sections thématiques**:
  - Accès aux données (Q1-Q3) - 30% du poids
  - Protection des données (Q4-Q6) - 25% du poids
  - Sous-traitants (Q7-Q8) - 20% du poids
  - Droits des personnes (Q9-Q11) - 15% du poids
  - Gestion des incidents (Q12-Q15) - 10% du poids

- **Fonctionnalités par question**:
  - Tooltip "Pourquoi c'est important?" avec contexte et risques
  - Exemple de faille/warning visible
  - 3-4 options de réponse
  - Feedback instantané (succès/avertissement/danger)
  - Explication détaillée de chaque réponse

- **Navigation**:
  - Barre de progression avec sections
  - Compteur de questions (X/15)
  - Boutons Précédent/Suivant
  - Indicateurs de complétion par section

### 3. Formulaire de capture de leads
- Champs: Prénom, Nom, Email, Entreprise
- Champs optionnels: Taille entreprise, Secteur, Canton suisse
- Case de consentement RGPD obligatoire
- Validation côté client

### 4. Page de résultats
- Score normalisé (0-10)
- Indicateur de niveau de risque (vert/orange/rouge)
- Top 3 priorités d'action
- Teaser personnalisé
- Confirmation d'envoi email
- CTA "Réserver une consultation"

## Architecture technique

### Frontend (React)
- **Framework**: React 19 avec React Router
- **Styling**: Tailwind CSS + shadcn/ui
- **Animations**: Framer Motion
- **État**: React useState/useCallback hooks

### Backend (FastAPI)
- **Base de données**: MongoDB (MONGO_URL)
- **Endpoints API**:
  - `POST /api/submissions` - Créer soumission
  - `GET /api/submissions` - Liste des soumissions
  - `GET /api/submissions/:id` - Détail soumission
  - `PATCH /api/submissions/:id/status` - Mise à jour statut
  - `POST /api/emails` - Créer email outputs
  - `GET /api/stats` - Statistiques

### Modèles de données

```javascript
// FormSubmission
{
  id: UUID,
  created_at: DateTime,
  user_email: String,
  user_first_name: String,
  user_last_name: String,
  company_name: String,
  company_size: String?, // '1-10', '11-25', '26-50', '51-100', '100+'
  industry: String?, // 'lab', 'cabinet_medical', 'fiduciaire', 'autre'
  canton: String?,
  answers: Object, // {q1: "option", q2: "option", ...}
  score_raw: Number, // 0-45
  score_normalized: Number, // 0-10
  risk_level: String, // 'green', 'orange', 'red'
  status: String, // 'pending', 'processing', 'teaser_ready', 'emailed'
  teaser_text: String?,
  consent_marketing: Boolean,
  consent_timestamp: DateTime?
}
```

## Intégrations futures (prêtes à implémenter)

### OpenAI Assistant API
- Variables d'environnement prêtes: `OPENAI_API_KEY`, `OPENAI_ASSISTANT_ID`
- Génération de teaser personnalisé
- Génération d'emails utilisateur et commercial
- Classification lead (HOT/WARM/COLD)

### Dreamlit (Email)
- Table `email_outputs` prête
- Triggers Supabase à configurer
- Templates Markdown pour conversion HTML

## URLs et endpoints

- **Frontend**: https://prd-builder-15.preview.emergentagent.com
- **API**: https://prd-builder-15.preview.emergentagent.com/api
- **Health check**: GET /api/health
- **Stats**: GET /api/stats

## Variables d'environnement

### Frontend (.env)
```
REACT_APP_BACKEND_URL=<preview_url>
```

### Backend (.env)
```
MONGO_URL=<mongodb_url>
DB_NAME=<database_name>
CORS_ORIGINS=*
# À ajouter pour OpenAI:
# OPENAI_API_KEY=sk-...
# OPENAI_ASSISTANT_ID=asst_...
```

## Design System

### Couleurs (HSL)
- **Primary (Magenta)**: 325 100% 39%
- **Success (Vert)**: 145 63% 42%
- **Warning (Orange)**: 38 92% 50%
- **Danger (Rouge)**: 4 90% 58%

### Typographie
- **Display**: Playfair Display (titres)
- **Body**: Inter (texte)

## Prochaines étapes

1. **Intégration OpenAI**: Connecter l'Assistant API pour génération de contenu personnalisé
2. **Intégration Dreamlit**: Configurer l'envoi d'emails automatique
3. **Application calendrier**: Remplacer le placeholder de réservation
4. **Back-office admin**: Dashboard pour visualiser les leads et statistiques

---

*Version 1.0 - Janvier 2026*
*Propriétaire: Ypsys + MemoWays*
