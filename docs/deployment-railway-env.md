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

À définir dans les **Variables** Railway pour que le backend les lise au démarrage. **OPENAI_API_KEY** et **OPENAI_ASSISTANT_ID** sont tous deux obligatoires pour que l'assistant génère les emails ; sinon le backend renvoie un fallback (teaser seul, email_outputs vide).

| Variable | Rôle |
|----------|------|
| **OPENAI_API_KEY** | Clé API OpenAI (route `/api/analyze`). **Obligatoire** — sans elle le backend ne appelle jamais l'API et renvoie toujours email_user=null, email_sales=null. À créer dans [OpenAI API keys](https://platform.openai.com/api-keys). |
| **OPENAI_ASSISTANT_ID** | ID de l’assistant OpenAI. |
| **CORS_ORIGINS** | (Optionnel) Origines autorisées, séparées par des virgules. Par défaut le backend accepte les requêtes du même domaine. |
| **API_ADMIN_SECRET** | (Optionnel) Voir section ci-dessous. |

### API_ADMIN_SECRET : quand faire quoi ?

Les routes **GET /api/submissions**, **GET /api/submissions/{id}** et **GET /api/stats** permettent de lire les soumissions du formulaire. Pour la conformité RGPD/nLPD, elles sont **protégées** : sans clé secrète, elles renvoient **403**.

- **Vous ne consultez les données que dans Supabase** (dashboard Supabase, Dreamlit, exports, etc.)  
  → **Vous n’avez rien à faire.** Ne définissez pas `API_ADMIN_SECRET`. Ces routes API restent refusées (403), ce qui est correct.

- **Vous avez un outil (script, back-office, autre app) qui appelle GET /api/submissions ou /api/stats**  
  → Définissez `API_ADMIN_SECRET` dans Railway (Variables) à une valeur secrète (ex. une longue chaîne aléatoire). Quand vous appelez l’API, envoyez l’en-tête :  
  `X-API-Key: <la même valeur que API_ADMIN_SECRET>`.

**En résumé** : si vous n’utilisez pas ces routes pour lire les données, n’ajoutez pas `API_ADMIN_SECRET`. Si vous les utilisez, ajoutez la variable et passez sa valeur dans l’en-tête `X-API-Key`.

## Dépannage : « Credentials not configured » en prod

Si vous avez bien ajouté **REACT_APP_SUPABASE_URL** et **REACT_APP_SUPABASE_ANON_KEY** dans Railway (onglet Variables) mais que l’app affiche encore « Supabase credentials not configured » ou « Failed to fetch » à la soumission du formulaire :

1. **Appliquer les changements** (« Apply X changes ») pour enregistrer les variables.
2. **Lancer un nouveau déploiement** (bouton **Deploy**). Les variables `REACT_APP_*` sont injectées **au moment du build** ; le build actuel a été fait sans elles. Un simple redémarrage du service ne suffit pas.
3. Attendre la fin du build et du déploiement, puis retester.

## Résumé

- **Supabase** : obligatoire en production. Ajouter **REACT_APP_SUPABASE_URL** et **REACT_APP_SUPABASE_ANON_KEY** dans Railway Variables, puis **redéployer** (Deploy).
- **OpenAI** : le backend doit avoir **OPENAI_API_KEY** et **OPENAI_ASSISTANT_ID** ; le frontend appelle `/api/analyze` sur la même origine en prod, pas besoin de **REACT_APP_BACKEND_URL** si tout est sur le même service Railway.
