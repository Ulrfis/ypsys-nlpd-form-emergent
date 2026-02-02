# Formulaire nLPD Ypsys

> **Statut**: 🟢 En production

> **Type**: 🏢 Client

> **Créé avec**: Emergent AI (Claude) + Cursor + React + FastAPI

> **Déployé sur**: Railway

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
| Hosting | Railway (production) / Emergent (preview) |

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

Copier `frontend/.env.example` en `frontend/.env` et `backend/.env.example` en `backend/.env`, puis renseigner les valeurs.

### Frontend (`frontend/.env`)

| Variable | Où la mettre | Où la trouver |
|----------|-------------|----------------|
| **REACT_APP_BACKEND_URL** | `frontend/.env` | En local : `http://localhost:8000`. En production : URL du backend déployé (ex. `https://votre-backend.railway.app`). À définir dans les variables d'environnement du build (Railway/Vercel) lors du déploiement du frontend. |
| **REACT_APP_SUPABASE_URL** | `frontend/.env` uniquement | Supabase Dashboard → votre projet → **Settings** → **API** → **Project URL** |
| **REACT_APP_SUPABASE_ANON_KEY** | `frontend/.env` uniquement | Supabase Dashboard → **Settings** → **API** → **Project API keys** → **anon public** |

- Ne pas mettre les clés Supabase dans le backend : la connexion Supabase est côté frontend.
- **Ne jamais** mettre de clé OpenAI dans le frontend (`REACT_APP_*` est inclus dans le bundle = visible par tous). Mettre **OPENAI_API_KEY** et **OPENAI_ASSISTANT_ID** uniquement dans **backend/.env**.

### Backend (`backend/.env`)

| Variable | Rôle |
|----------|------|
| **OPENAI_API_KEY** | Clé API OpenAI (pour la route `/api/analyze`) |
| **OPENAI_ASSISTANT_ID** | ID de l’assistant OpenAI |
| **CORS_ORIGINS** | (Optionnel) Origines autorisées, séparées par des virgules. Par défaut : `http://localhost:3000`, `http://127.0.0.1:3000` |

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

## Déploiement Railway

Le déploiement utilise Nixpacks avec un virtual environment Python pour contourner les restrictions PEP 668.

**Points clés** :
- Le build crée un venv à `/app/venv`
- Tous les fichiers de config (`nixpacks.toml`, `railway.toml`, `railway.json`, `Procfile`) doivent utiliser `/app/venv/bin/uvicorn`
- La configuration Nixpacks inclut : `python311`, `python311Packages.pip`, `nodejs_20`

**Note historique** : Ce déploiement a nécessité 8 tentatives pour résoudre les problèmes spécifiques à Nixpacks + Python + Nix (5 avec Claude Code, 3 avec Cursor). Voir `STORY.md` pour les détails.

---

## Notes
- Les données utilisateurs sont stockées exclusivement dans Supabase (Europe) pour conformité nLPD
- L'appel OpenAI se fait côté client (à migrer vers Edge Function pour production)
- Le formulaire est entièrement en français
- Timeout OpenAI de 45 secondes avec fallback local
- Questionnaire révisé le 2026-02-02 : textes simplifiés, réorganisation des options, ton moins culpabilisant

---

*Project Memoways pour Ypsys — Développé avec Emergent AI, déployé avec Cursor*
