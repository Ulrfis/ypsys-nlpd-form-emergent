# Variables d'environnement pour le déploiement Railway

L'app est déployée en un seul service Railway : le **backend** sert l'API et les fichiers statiques du **frontend**. Les variables `REACT_APP_*` sont **injectées au moment du build** (pendant `npm run build`). Il faut donc les définir dans Railway **avant** le déploiement.

## Où configurer les variables

1. Ouvrez votre projet sur [Railway](https://railway.app/dashboard).
2. Sélectionnez le service (ou le projet).
3. Onglet **Variables** (ou **Settings** → **Variables**).
4. Ajoutez les variables ci‑dessous.
5. **Redéployez** (Redeploy) pour que le prochain build prenne en compte les nouvelles variables.

## Variables obligatoires pour le frontend (build)

Ces variables doivent être définies **au niveau du projet ou du service** pour que le build du frontend les reçoive.

| Variable | Exemple | Rôle |
|----------|---------|------|
| **REACT_APP_SUPABASE_URL** | `https://xxxxx.supabase.co` | URL du projet Supabase (Settings → API → Project URL). |
| **REACT_APP_SUPABASE_ANON_KEY** | `eyJhbGciOiJIUzI1NiIs...` | Clé anon/public Supabase (Settings → API → anon public). |

Sans elles, la sauvegarde des soumissions du formulaire échoue (« Failed to fetch » / « Supabase credentials not configured »).

## Variable optionnelle pour le frontend

| Variable | Exemple | Rôle |
|----------|---------|------|
| **REACT_APP_BACKEND_URL** | `https://votre-app.up.railway.app` | URL de l’API. En production, si le frontend est servi par le **même** service Railway, l’app utilise automatiquement l’origine courante (`window.location.origin`) quand cette variable n’est pas définie. À définir seulement si le frontend est hébergé ailleurs (autre domaine). |

## Variables pour le backend (runtime)

À définir dans les **Variables** Railway pour que le backend les lise au démarrage.

| Variable | Rôle |
|----------|------|
| **OPENAI_API_KEY** | Clé API OpenAI (route `/api/analyze`). |
| **OPENAI_ASSISTANT_ID** | ID de l’assistant OpenAI. |
| **CORS_ORIGINS** | (Optionnel) Origines autorisées, séparées par des virgules. Par défaut le backend accepte les requêtes du même domaine. |

## Résumé

- **Supabase** : obligatoire en production. Ajouter **REACT_APP_SUPABASE_URL** et **REACT_APP_SUPABASE_ANON_KEY** dans Railway Variables, puis **redéployer**.
- **OpenAI** : le backend doit avoir **OPENAI_API_KEY** et **OPENAI_ASSISTANT_ID** ; le frontend appelle `/api/analyze` sur la même origine en prod, pas besoin de **REACT_APP_BACKEND_URL** si tout est sur le même service Railway.
