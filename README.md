# Formulaire nLPD Ypsys

> **Statut**: 🟢 Livré

> **Type**: 🏢 Client

> **Créé avec**: Emergent AI (Claude) + React + FastAPI

> **Démarré**: 2026-01-27

---

## En une phrase
Formulaire interactif d'auto-diagnostic de conformité nLPD pour les cabinets médicaux, laboratoires et fiduciaires suisses, avec analyse IA personnalisée.

---

## Source of Truth
- **Brief/PRD Notion**: [PRD original fourni par le client]
- **Last Sync**: 2026-01-28

---

## Objectif du projet
Créer un outil d'évaluation de conformité à la nouvelle Loi fédérale sur la Protection des Données (nLPD) suisse. L'objectif est de générer des leads qualifiés pour Ypsys en offrant aux utilisateurs un diagnostic personnalisé de leur situation, avec des recommandations générées par l'IA.

---

## Livrables
- [x] Page d'accueil avec branding Ypsys (Magenta #C8007F)
- [x] Questionnaire interactif (15 questions, 5 sections)
- [x] Écran d'analyse animé avec étapes progressives
- [x] Intégration OpenAI Assistant pour génération de teaser personnalisé
- [x] Page de résultats avec score et aperçu IA
- [x] Formulaire de capture de leads simplifié
- [x] Page de remerciement avec détails complets
- [x] Sauvegarde des données dans Supabase (Europe)
- [x] Support mode sombre/clair
- [x] Configuration Railway pour déploiement

---

## Stack Technique
| Composant | Technologie |
|-----------|-------------|
| Frontend | React 19, Tailwind CSS, shadcn/ui, Framer Motion |
| Backend | FastAPI (Python 3.11) |
| Base de données | Supabase (PostgreSQL, Frankfurt EU) |
| IA | OpenAI Assistant API |
| Hosting | Railway (prévu) / Emergent (preview) |

---

## Quick Start
```bash
# Cloner
git clone [url-du-repo]

# Frontend
cd frontend
npm install
npm run dev

# Backend
cd backend
pip install -r requirements.txt
uvicorn server:app --reload
```

---

## Variables d'environnement

### Frontend (.env)
```
REACT_APP_BACKEND_URL=<url>
REACT_APP_SUPABASE_URL=https://hdvhvadnwgaibcvvqypk.supabase.co
REACT_APP_SUPABASE_ANON_KEY=<anon_key>
REACT_APP_OPENAI_API_KEY=<openai_key>
REACT_APP_OPENAI_ASSISTANT_ID=asst_felvhtNS41JmXwkrGMPbXo3S
```

### Backend (.env)
```
CORS_ORIGINS=*
```

---

## Links
- **Preview URL**: https://prd-builder-15.preview.emergentagent.com
- **Supabase Dashboard**: https://supabase.com/dashboard/project/hdvhvadnwgaibcvvqypk

---

## Structure
```
/
├── frontend/
│   ├── src/
│   │   ├── components/     # Composants React
│   │   ├── data/           # Données du questionnaire
│   │   ├── lib/            # Supabase, OpenAI clients
│   │   └── context/        # Theme context
│   └── public/
├── backend/
│   ├── server.py           # FastAPI app
│   └── requirements.txt
├── memory/
│   └── PRD.md              # Documentation technique
├── CHANGELOG.md            # Historique des versions
├── STORY.md                # Journal de développement
├── railway.json            # Config Railway
├── nixpacks.toml           # Config build
└── Procfile
```

---

## Notes
- Les données utilisateurs sont stockées exclusivement dans Supabase (Europe) pour conformité nLPD
- L'appel OpenAI se fait côté client (à migrer vers Edge Function pour production)
- Le formulaire est entièrement en français
- Timeout OpenAI de 45 secondes avec fallback local

---

*Project Memoways pour Ypsys*
