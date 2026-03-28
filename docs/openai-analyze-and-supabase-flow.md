# API Analyze (OpenAI) et flux Supabase

Ce document décrit le format d'envoi vers OpenAI, la réponse attendue, et le flux vers Supabase pour stocker les emails générés.

---

## Flux global

1. **Utilisateur termine le questionnaire** → le frontend appelle `POST /api/analyze` avec **toutes** les réponses (answers + answers_detailed).
2. **Backend** transmet le payload complet à l’assistant OpenAI (thread + message + run).
3. **OpenAI** renvoie un JSON (teaser, emails, textes UI, etc.). Le champ `score_100` éventuellement renvoyé par le modèle est **ignoré** pour l’affichage et le stockage : le score sur 100 est **calculé côté application** à partir de `score.normalized` (questionnaire pondéré).
4. **Frontend** reçoit la réponse, affiche le teaser et les scores **déterministes**, puis appelle **`insertFormSubmissionAfterAnalysis`** → **INSERT** dans `form_submissions` (réponses + teaser + scores, sans email obligatoire ; `consent_marketing` reste false jusqu’à la capture lead). Les abandons après analyse sont ainsi enregistrés.
5. **Utilisateur remplit le formulaire de capture** (email, nom, etc.) → le frontend appelle **`finalizeFormSubmissionLead(submissionId, …)`** si une ligne existe, sinon **`saveSubmission`** (insert complet de secours, ex. session rechargée).
6. **Supabase** : **UPDATE** de `form_submissions` avec les coordonnées lead, puis **INSERT** dans `email_outputs` si `has_email` et que `email_user` et `email_sales` sont présents dans la réponse OpenAI stockée côté client.

L’envoi OpenAI **transite donc par l’app** (backend proxy) ; les deux réponses détaillées (email prospect + email commercial) sont ensuite stockées dans Supabase via le frontend au moment de la capture lead.

**RLS** : une politique **UPDATE** pour le rôle `anon` sur `form_submissions` est requise pour l’étape 6 (voir [docs/supabase-schema-update.sql](supabase-schema-update.sql)).

---

## Requête `POST /api/analyze`

Le backend envoie à OpenAI **l’intégralité** du payload (pas de résumé). Format attendu :

```json
{
  "payload": {
    "user": {
      "first_name": "string",
      "last_name": "string",
      "email": "string | null",
      "company": "string",
      "size": "string | null",
      "industry": "string | null",
      "canton": "string | null"
    },
    "answers": {
      "q1": "Libellé de la réponse choisie",
      "q2": "...",
      "q15": "..."
    },
    "answers_detailed": [
      {
        "question_id": "q1",
        "question": "Texte de la question (ex: Qui peut consulter les dossiers sensibles?)",
        "answer": "Libellé de la réponse"
      }
    ],
    "score": {
      "value": 26,
      "normalized": 4.2,
      "level": "orange"
    },
    "has_email": false
  }
}
```

- **answers** : toutes les réponses (q1..q15) avec le libellé de l’option choisie.
- **answers_detailed** : optionnel ; chaque entrée contient l’énoncé de la question et la réponse, pour que l’assistant ait le contexte sans dépendre uniquement du vector store.

L’assistant a le questionnaire dans son vector store ; envoyer **answers** + **answers_detailed** garantit une analyse détaillée et des conseils personnalisés.

---

## Réponse attendue de l’assistant OpenAI

L’assistant doit renvoyer **un seul objet JSON valide** (pas de texte avant/après).

Les **instructions** à jour sont dans **[docs/assistant-prompt-nlpd-v4-score100.md](assistant-prompt-nlpd-v4-score100.md)** (score imposé par l’app, cohérence rédactionnelle). Les versions antérieures (v2/v3) restent dans le dépôt à titre historique.

L'assistant doit renvoyer **un seul objet JSON valide** (pas de texte avant/après), avec au minimum :

```json
{
  "teaser": "2–3 phrases courtes pour l’écran de transition",
  "lead_temperature": "HOT | WARM | COLD",
  "score_100": 67,
  "severity_band": "critical | vigilance | good",
  "top_issues": ["Priorité 1", "Priorité 2", "Priorité 3"],
  "result_summary": "Résumé affichable dans l'UI finale",
  "result_focus_points": ["Point 1", "Point 2", "Point 3"],
  "email_user": {
    "subject": "Sujet de l’email prospect",
    "body_markdown": "Contenu markdown (400–600 mots)"
  },
  "email_sales": {
    "subject": "Sujet de l’email commercial Ypsys",
    "body_markdown": "Contenu markdown (500–800 mots)"
  }
}
```

- **teaser** : affiché à l’écran intermédiaire après l’analyse.
- **score_100 / severity_band (modèle)** : l’API backend **remplace** ces valeurs par le calcul issu de `payload.score` (`score_100 = arrondi(normalized × 10)`). Une copie optionnelle de la valeur modèle est exposée en `score_100_assistant_raw` pour audit / debug.
- **Seuils actifs** : `critical` 0-59, `vigilance` 60-89, `good` 90-100.
- **top_issues** : 3 priorités d'action utilisées dans la restitution finale.
- **result_summary** : résumé OpenAI affiché dans la page de résultat final.
- **result_focus_points** : points de risque/priorités affichés dans la page finale.
- **email_user** : rapport personnalisé pour le prospect (envoyé par email). Doit contenir `subject` et `body_markdown`.
- **email_sales** : analyse commerciale pour l’équipe Ypsys. Doit contenir `subject` et `body_markdown`.

**Important** : Si `email_user` ou `email_sales` est `null` (ou sans `body_markdown`), le frontend **n’écrit pas** dans `email_outputs`. Un message dans la console (mode debug) indique pourquoi `email_outputs` n’a pas été rempli. **`form_submissions`** est rempli **juste après l’analyse** (sans attendre l’email) ; `email_outputs` seulement après capture lead + emails complets.

---

## Réponse de l’API backend `POST /api/analyze`

Le backend renvoie les champs extraits de la réponse OpenAI, avec **score imposé par le questionnaire** :

```json
{
  "score_100": "number 0..100 (depuis payload.score, pas le modèle)",
  "score_100_assistant_raw": "number | null (valeur JSON du modèle si présente)",
  "severity_band": "critical | vigilance | good",
  "top_issues": ["string", "string", "string"],
  "result_summary": "string",
  "result_focus_points": ["string", "string", "string"],
  "teaser": "string",
  "lead_temperature": "HOT | WARM | COLD",
  "email_user": { "subject": "...", "body_markdown": "..." } | null,
  "email_sales": { "subject": "...", "body_markdown": "..." } | null
}
```

---

## Stockage Supabase

### Après l’analyse (sans email)

- **INSERT** `form_submissions` : `answers`, scores, `teaser_text`, `lead_temperature`, utilisateur placeholder, `consent_marketing` false, `status` typiquement `teaser_ready`.

### Après le formulaire de capture

- **UPDATE** `form_submissions` : email, identité, entreprise, `consent_marketing` true, `consent_timestamp`, `status` `lead_complete`.
- **INSERT** `email_outputs` (si OpenAI a renvoyé `email_user` et `email_sales` complets et `has_email` est true) :
  - `submission_id`, `user_email`, `lead_temperature`
  - `email_user_subject`, `email_user_markdown`
  - `email_sales_subject`, `email_sales_markdown`

**Important** : L'app n'écrit dans `email_outputs` que lorsque toutes ces données sont présentes. Dreamlit envoie les emails dès qu'une nouvelle ligne est créée ; il faut donc écrire toutes les données en une seule fois pour que l'envoi ait les textes générés par OpenAI.

**Relation email ↔ réponses ↔ réponse OpenAI** : la même session frontend conserve `submissionId` retourné par le premier INSERT ; le UPDATE rattache le lead à la ligne déjà créée avec les réponses et la sortie OpenAI de cette session. Si `submissionId` est absent (échec insert ou rechargement), `saveSubmission` effectue un **INSERT** complet équivalent à l’ancien comportement.

---

## Configuration de l'assistant OpenAI

- **Format de réponse** : utiliser **json_object** (pas "text"). Cela force l'assistant à renvoyer un JSON valide et correspond à ce que l'app parse.
- **Modèle** : **gpt-4o** est adapté (instructions complexes, longs textes en markdown).
- **Budget tokens** : le backend fixe **max_completion_tokens=8192** lors de la création du run, pour garantir assez de place pour le teaser + les deux emails (email_user 400–600 mots, email_sales 500–800 mots). Le réglage "max output tokens" n'est pas toujours visible dans l'interface OpenAI ; le passer côté API (run create) assure le budget même si l'UI ne l'expose pas. Une simulation typique consomme ~13k tokens au total (entrée + sortie) ; gpt-4o a une fenêtre de 128k, donc largement suffisant.

---

## Tests de non-régression (assistant)

Voir **[docs/assistant-regression-testing.md](assistant-regression-testing.md)** : export de lignes Supabase, jeux de payloads, checklist Playground.

---

## Panneau debug

Dans le panneau debug (mode `?debug=true`), la requête **analyze.proxy** affiche désormais le **payload complet** envoyé à `/api/analyze`, y compris `answers` et `answers_detailed`, pour vérifier que toutes les réponses sont bien envoyées à OpenAI.

---

## Dépannage : « email_user=null, email_sales=null » en prod

Si le message apparaît en console alors que l'assistant renvoie bien les emails en sandbox :

1. **Vérifier les variables OpenAI dans Railway**  
   Le backend a besoin de **OPENAI_API_KEY** et **OPENAI_ASSISTANT_ID** dans Railway (Variables du service).  
   **Sans OPENAI_API_KEY**, le backend n'appelle jamais l'API OpenAI et renvoie toujours le fallback (teaser seul, `email_user=null`, `email_sales=null`). Vérifier que les deux variables sont bien définies, puis redéployer si besoin (les variables runtime sont lues au démarrage).

2. **Vérifier OPENAI_ASSISTANT_ID**  
   Dans Railway → Variables, la valeur de `OPENAI_ASSISTANT_ID` doit être **exactement** l’ID de l’assistant configuré dans OpenAI (Instructions + format **json_object**).  
   Dans OpenAI : Assistants → ton assistant → l’ID est dans l’URL ou dans les paramètres (ex. `asst_xxxxx`). S’il existe plusieurs assistants (sandbox vs prod), mettre l’ID de celui qui a le bon prompt.

3. **Consulter les logs Railway après un test**  
   Faire une soumission complète depuis l’app (questionnaire + formulaire de capture avec email).  
   Puis Railway → Deployments → View logs. Chercher la ligne du type :  
   `OpenAI response missing email_user and/or email_sales. Keys in response: [...]. Snippet=...`  
   - **Keys in response** : si tu vois `teaser`, `lead_temperature` mais pas `email_user` / `email_sales`, l’assistant ne les renvoie pas (ou les met sous une autre clé).  
   - **Snippet** : début brut de la réponse. Si le JSON est coupé (fin abrupte), la réponse est peut‑être tronquée (limite de tokens ou timeout).  
   Cela permet de voir **exactement** ce que l’API a renvoyé.

4. **Recopier les instructions (version active v4)**  
   Remplacer entièrement les Instructions de l’assistant par le contenu de [docs/assistant-prompt-nlpd-v4-score100.md](assistant-prompt-nlpd-v4-score100.md). Enregistrer, refaire un test depuis l’app, puis revérifier les logs Railway.
