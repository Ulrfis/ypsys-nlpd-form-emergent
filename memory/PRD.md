# PRD: Formulaire nLPD Ypsys

## Vue d'ensemble

Application web interactive d'auto-diagnostic de conformité nLPD (nouvelle Loi fédérale sur la protection des données) pour Ypsys, destinée aux cabinets médicaux, laboratoires et fiduciaires en Suisse.

## Fonctionnalités implémentées

### 1. Page d'accueil
- Branding Ypsys avec couleur primaire Magenta (#C8007F)
- Statistiques clés (90% pensent être conformes, 70% ne le sont pas)
- Message d'avertissement explicatif
- Bouton CTA "Commencer l'évaluation"
- Support du mode sombre/clair

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

### 3. Formulaire de capture de leads
- Champs: Prénom, Nom, Email, Entreprise
- Champs optionnels: Taille entreprise, Secteur, Canton suisse
- Case de consentement RGPD obligatoire

### 4. Écran d'analyse IA (NOUVEAU)
- Animation progressive montrant les étapes:
  1. Connexion au conseiller IA
  2. Transmission des données
  3. Analyse en cours
  4. Génération des recommandations
  5. Analyse terminée
- Appel à l'API OpenAI Assistant
- Timeout et fallback automatique si OpenAI indisponible

### 5. Page de résultats
- Score normalisé (0-10)
- Indicateur de niveau de risque (vert/orange/rouge)
- **Teaser personnalisé généré par OpenAI** avec prénom et nom d'entreprise
- Top 3 priorités d'action
- Confirmation d'envoi email
- CTA "Réserver une consultation"

## Architecture technique

### Frontend (React)
- **Framework**: React 19 avec React Router
- **Styling**: Tailwind CSS + shadcn/ui
- **Animations**: Framer Motion
- **Intégrations**: 
  - OpenAI SDK (Assistant API)
  - Supabase JS Client

### Backend (Supabase - Europe)
- **Base de données**: PostgreSQL hébergé en Europe (Frankfurt)
- **RLS**: Row Level Security activé pour sécurité des données
- **Tables**:
  - `form_submissions` - Soumissions du formulaire
  - `email_outputs` - Emails générés par l'IA

### OpenAI Assistant
- **ID**: asst_felvhtNS41JmXwkrGMPbXo3S
- **Fonctions**:
  - Génération du teaser personnalisé
  - Classification de la température du lead (HOT/WARM/COLD)
  - Génération des emails (utilisateur + commercial)

## Flux de données

```
User Submit 
    → [1] Calculate score (frontend)
    → [2] Build payload JSON
    → [3] Call OpenAI Assistant (avec timeout 45s)
    → [4] Save to Supabase (form_submissions + email_outputs)
    → [5] Display thank you page with teaser
```

## Modèles de données Supabase

### form_submissions
```sql
id UUID PRIMARY KEY
created_at TIMESTAMPTZ
user_email TEXT
user_first_name TEXT
user_last_name TEXT
company_name TEXT
company_size TEXT -- '1-10', '11-25', '26-50', '51-100', '100+'
industry TEXT -- 'lab', 'cabinet_medical', 'fiduciaire', 'autre'
canton TEXT
answers JSONB
score_raw INTEGER
score_normalized DECIMAL(3,1)
risk_level TEXT -- 'green', 'orange', 'red'
teaser_text TEXT
lead_temperature TEXT -- 'HOT', 'WARM', 'COLD'
status TEXT -- 'pending', 'processing', 'teaser_ready', 'emailed', 'error'
consent_marketing BOOLEAN
consent_timestamp TIMESTAMPTZ
session_id TEXT
```

### email_outputs
```sql
id UUID PRIMARY KEY
created_at TIMESTAMPTZ
submission_id UUID REFERENCES form_submissions(id)
email_user_subject TEXT
email_user_markdown TEXT
email_sales_subject TEXT
email_sales_markdown TEXT
lead_temperature TEXT
user_email_sent BOOLEAN
user_email_sent_at TIMESTAMPTZ
sales_email_sent BOOLEAN
sales_email_sent_at TIMESTAMPTZ
error_message TEXT
```

## Variables d'environnement

### Frontend (.env)
```
REACT_APP_BACKEND_URL=<preview_url>
REACT_APP_SUPABASE_URL=https://hdvhvadnwgaibcvvqypk.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJ...
REACT_APP_OPENAI_API_KEY=sk-...
REACT_APP_OPENAI_ASSISTANT_ID=asst_...
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

## URLs

- **Frontend**: https://prd-builder-15.preview.emergentagent.com
- **Supabase Dashboard**: https://supabase.com/dashboard/project/hdvhvadnwgaibcvvqypk

## Prochaines étapes

1. **Intégration Dreamlit**: Configurer l'envoi automatique d'emails depuis Supabase
2. **Application calendrier**: Remplacer le placeholder de réservation
3. **Back-office admin**: Dashboard pour visualiser les leads et statistiques
4. **Sécurisation production**: Déplacer l'appel OpenAI côté serveur (Edge Function)

---

*Version 2.0 - Janvier 2026*
*Intégrations: OpenAI Assistant + Supabase (Europe)*
