# Audit de sécurité et conformité RGPD / nLPD

**Application** : Formulaire nLPD Ypsys  
**Date** : 3 février 2026  
**Périmètre** : Frontend (React), Backend (FastAPI), Supabase, OpenAI, PostHog

---

## 1. Résumé exécutif

L’application collecte des **données personnelles** (nom, prénom, email, entreprise, réponses au questionnaire) pour fournir un diagnostic de conformité nLPD et envoyer un rapport par email. Les données sont envoyées à **OpenAI** (traitement IA), stockées dans **Supabase** (EU possible), et des analytics sont envoyées à **PostHog** (US).

**Verdict** : Plusieurs points sont **conformes** (consentement explicite, clé API côté serveur, RLS Supabase). Les **actions prioritaires P0 et P1** ont été mises en œuvre (API backend protégée par `X-API-Key`, politique de confidentialité en place avec lien depuis le formulaire, PostHog chargé uniquement après consentement via bandeau cookies, logs debug sanitisés). Il reste à documenter/encadrer les transferts US (OpenAI, PostHog) dans la politique et à traiter les points P2 si besoin (consentement granulaire, sous-traitants).

---

## 2. Données personnelles : inventaire et flux

### 2.1 Données collectées

| Donnée | Finalité | Base légale (RGPD) / Fondement (nLPD) |
|--------|----------|----------------------------------------|
| Nom, prénom | Identification, personnalisation du rapport | Consentement |
| Email | Envoi du rapport, contact commercial | Consentement |
| Nom / taille / secteur / canton entreprise | Contexte du diagnostic | Consentement |
| Réponses au questionnaire (q1–q15) | Calcul du score et génération du rapport | Consentement |
| Score, niveau de risque | Diagnostic nLPD | Exécution du contrat (service demandé) |
| Consentement marketing + horodatage | Preuve du consentement | — |

**Données techniques** : `session_id` (généré côté client), logs debug (si mode debug activé, voir § 5.2).

### 2.2 Flux de données

1. **Utilisateur → Frontend** : Saisie dans le formulaire (LeadCaptureForm).
2. **Frontend → Backend** : POST `/api/analyze` avec `user`, `answers`, `answers_detailed`, `score`, `has_email`.
3. **Backend → OpenAI** : Même payload envoyé à l’API Assistants (thread + message). **Transfert hors UE/CH** (OpenAI, États-Unis).
4. **Frontend → Supabase** : Insert dans `form_submissions` puis, si sortie complète, dans `email_outputs` (email prospect + contexte commercial).
5. **Frontend → PostHog** : Script chargé **uniquement après consentement** (bandeau cookies) ; envoi vers `us.i.posthog.com` (US). Voir § 9.

---

## 3. Conformité RGPD (règlement UE)

### 3.1 Points conformes

- **Consentement explicite** : Case à cocher obligatoire avec libellé clair (« J'accepte de recevoir mes résultats… et d'être contacté par YPSYS ») et horodatage (`consent_timestamp`).
- **Minimisation** : Champs optionnels regroupés (prénom, taille, secteur, canton).
- **Clé API OpenAI** : Utilisée uniquement côté backend (proxy `/api/analyze`), pas d’exposition dans le bundle frontend.
- **RLS Supabase** : Activé sur `form_submissions` et `email_outputs` ; politiques INSERT pour `anon` ; pas de SELECT public (lecture à configurer côté dashboard avec un rôle dédié).
- **Fichiers .env** : Exclus du dépôt Git (`.gitignore`).

### 3.2 Écarts / risques RGPD

| Article / Principe | Constat | Risque |
|-------------------|---------|--------|
| **Art. 13 / 14 (information)** | Aucune page « Politique de confidentialité » ni « Mentions légales » ; le formulaire indique « politique de confidentialité » sans lien. | Manque de transparence, difficulté à prouver l’information préalable. |
| **Art. 28 (sous-traitant)** | Pas de mention de sous-traitants (OpenAI, Supabase, PostHog, hébergeur) ni de garanties (clauses type ou équivalent). | Responsabilité du responsable de traitement, contrôles CNIL. |
| **Art. 44 et s. (transferts)** | Données envoyées à OpenAI (US) et PostHog (US). Pas de mécanisme explicite (clauses types, DPA, etc.) ni d’information dans la politique. | Transferts illicites au sens RGPD. |
| **Art. 5 (limitation de la finalité)** | Consentement unique « résultats + contact YPSYS » ; pas de dissociation rapport / prospection. | Moins de granularité, possible refus partiel. |
| **Art. 32 (sécurité)** | ~~API non protégée, logs~~ → **Corrigé** : API protégée par `X-API-Key`, logs sanitisés (données personnelles masquées). | — |

---

## 4. Conformité nLPD (Suisse, loi révisée)

La nLPD (révision en vigueur depuis septembre 2023) est alignée sur les principes du RGPD tout en restant une loi suisse.

### 4.1 Points conformes

- **Consentement** : Explicite, enregistré avec horodatage.
- **Proportionnalité** : Données limitées à ce qui est nécessaire pour le diagnostic et l’envoi du rapport.
- **Transparence** : Texte sous la case de consentement avec lien vers la page « Politique de confidentialité » (`/politique-confidentialite`).

### 4.2 Écarts / risques nLPD

- **Information préalable (art. 19 nLPD)** : ~~Politique absente~~ → **Corrigé** : page Politique de confidentialité accessible avec nature des données, finalités, destinataires, durée, droits, transferts.
- **Transferts à l’étranger (art. 16 nLPD)** : OpenAI et PostHog situés aux États-Unis. La Suisse exige un niveau de protection adéquat ou des garanties appropriées (clauses types, DPA). À documenter et à mentionner dans la politique.
- **Sous-traitants** : À lister et à encadrer contractuellement (DPA / garanties conformes nLPD).

---

## 5. Sécurité technique

### 5.1 Critique : API backend non protégée

- **GET `/api/submissions`** : Retourne toutes les soumissions (jusqu’à `limit`), sans authentification.
- **GET `/api/submissions/{id}`** : Retourne une soumission par ID, sans contrôle d’accès.
- **GET `/api/stats`** : Statistiques agrégées, sans authentification.

En production, toute personne connaissant l’URL du backend peut **extraire l’intégralité des données personnelles** (identité, réponses, emails). **Risque majeur** pour la vie privée et la conformité.

**Recommandation** : Supprimer ou désactiver ces routes en production, ou les protéger par authentification forte (API key, JWT, rôle service) et limiter l’accès au seul usage interne (dashboard admin).

### 5.2 Logs debug et localStorage

- **DebugContext** : En mode debug (`?debug=true`), les requêtes (Supabase, OpenAI) sont loguées avec un **payload contenant `user`, `answers`, `score`**.
- **sanitizeLog** / **sanitizeRequest** : Seuls `apiKey`, `token` et `Authorization` sont retirés. Les **données personnelles (email, nom, réponses)** restent dans le payload logué.
- **localStorage** : Ces logs sont persistés dans `localStorage` sous la clé `nlpd_debug_logs` (jusqu’à 7 jours, 100 entrées).

Conséquence : sur un poste partagé ou un appareil non sécurisé, des **données personnelles** peuvent être lues dans le navigateur. **Recommandation** : en production, désactiver complètement le mode debug ou ne jamais logger le payload complet ; si besoin de debug, anonymiser (hash email, pas de réponses en clair).

### 5.3 CORS

- CORS configuré avec une liste d’origines (`CORS_ORIGINS`) ou défaut `localhost`. Pas d’origine `*` avec `allow_credentials=True`. **Conforme** pour éviter les requêtes cross-origin non autorisées.

### 5.4 Stockage backend (Railway)

- Les soumissions sont aussi stockées en mémoire dans `submissions_store` (backend). En cas de redémarrage, perte des données ; en production, la source de vérité est Supabase. **Risque** : si le backend est exposé (voir § 5.1), ces données le sont aussi.

### 5.5 PostHog (analytics)

- Script PostHog chargé dans `index.html`, clé API en clair, envoi vers `us.i.posthog.com`.
- Pas de consentement préalable (cookie / bandeau) avant activation.
- Personnes potentiellement identifiées ou associées à des événements (pages, clics). **Conforme RGPD/nLPD** seulement si : consentement préalable au dépôt de cookies / analytics, information dans la politique, et garanties pour le transfert US (DPA, clauses types).

---

## 6. Synthèse des non-conformités et risques

| Priorité | Thème | Action requise |
|----------|--------|-----------------|
| **P0** | API `/api/submissions` et `/api/submissions/{id}` accessibles sans auth | Protéger ou désactiver en production |
| **P0** | Absence de politique de confidentialité | Créer une page et y lier depuis le formulaire |
| **P1** | Transferts US (OpenAI, PostHog) non documentés / non encadrés | Documenter, DPA / clauses types, mention dans la politique |
| **P1** | PostHog sans consentement préalable | Activer seulement après consentement (cookie banner / préférences) |
| **P2** | Logs debug contenant des données personnelles | Anonymiser ou désactiver en prod |
| **P2** | Consentement unique (rapport + prospection) | Optionnel : séparer « envoi du rapport » et « contact commercial » |
| **P2** | Liste des sous-traitants | Publier dans la politique et encadrer par contrats / DPA |

---

## 7. Recommandations prioritaires

### 7.1 Immédiat (P0)

1. **Sécuriser l’API backend**  
   - En production : ne pas exposer `GET /api/submissions` et `GET /api/submissions/{id}` au public.  
   - Si besoin pour un back-office : ajouter une authentification (ex. clé API secrète ou JWT) et restreindre les IP ou le réseau.

2. **Politique de confidentialité**  
   - Rédiger une page « Politique de confidentialité » (et si besoin « Mentions légales »).  
   - Y inclure : responsable du traitement, finalités, données collectées, durée de conservation, destinataires (Supabase, OpenAI, PostHog, Dreamlit si utilisé), transferts hors UE/CH et garanties, droits (accès, rectification, effacement, portabilité, opposition, réclamation auprès de l’autorité).  
   - Mettre un **lien cliquable** à côté de la phrase « conformément à notre politique de confidentialité » dans LeadCaptureForm.

### 7.2 Court terme (P1)

3. **PostHog et consentement**  
   - Ne charger PostHog qu’après consentement (ex. bandeau cookies / préférences « Analytics »).  
   - Documenter dans la politique l’utilisation de PostHog et le transfert vers les États-Unis.

4. **Transferts internationaux**  
   - Vérifier les contrats / DPA avec OpenAI (et PostHog) pour clauses types ou garanties équivalentes.  
   - Indiquer dans la politique que des données sont transférées aux États-Unis et sur quelles bases (adéquation, clauses types, etc.).

### 7.3 Moyen terme (P2)

5. **Logs debug**  
   - En production : désactiver le mode debug ou ne pas logger les payloads contenant des données personnelles.  
   - Si log nécessaire : anonymiser (ex. hash de l’email, pas de réponses en clair).

6. **Consentement granulaire**  
   - Proposer deux cases : « Recevoir mon rapport par email » et « Accepter d’être contacté par Ypsys pour des offres / conseils », avec enregistrement séparé des consentements.

7. **Supabase – lecture**  
   - Conserver les politiques RLS actuelles (INSERT anon). Pour la lecture (dashboard, export), créer des politiques SELECT pour un rôle dédié (ex. `service_role` ou utilisateur authentifié admin), jamais pour `anon`.

---

## 8. Références

- **RGPD** : [Règlement (UE) 2016/679](https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX%3A32016R0679)
- **nLPD** : [Loi fédérale sur la protection des données](https://www.fedlex.admin.ch/eli/cc/1993/1945_1945_1945/fr) (révision du 25.09.2020, en vigueur depuis le 01.09.2023)
- **PFPDT** : Préposé fédéral à la protection des données et à la transparence (autorité de contrôle suisse)
- **CNIL** : Recommandations sur les cookies et autres traceurs, transferts, sous-traitants

---

## 9. Mise en œuvre des actions prioritaires (3 février 2026)

Les trois actions prioritaires ont été appliquées :

1. **API backend** : Les routes `GET /api/submissions`, `GET /api/submissions/{id}` et `GET /api/stats` exigent désormais l'en-tête `X-API-Key` avec la valeur de la variable d'environnement `API_ADMIN_SECRET`. Si `API_ADMIN_SECRET` n'est pas défini, ces routes renvoient 403. Voir `backend/.env.example`.

2. **Politique de confidentialité** : Une page `/politique-confidentialite` a été ajoutée (structure alignée sur la [politique de cookies Ypsys](https://www.ypsys.com/politique-de-cookies-ue/)) avec les sections : Introduction, Données collectées, Finalités, Destinataires et transferts, Durée, Droits, Contact. Un lien cliquable « politique de confidentialité » a été ajouté dans le formulaire de capture de leads (LeadCaptureForm).

3. **PostHog et consentement** : Le script PostHog a été retiré de `index.html`. Un bandeau de consentement cookies (CookieBanner) s'affiche à la première visite ; PostHog n'est chargé qu'après clic sur « Tout accepter ». Le consentement est enregistré dans `localStorage` (`nlpd_cookie_consent`). Voir `CookieConsentContext`, `CookieBanner`, `PostHogLoader`.

---

*Document généré dans le cadre d’un audit de conformité. Les mesures correctives relèvent de la responsabilité du responsable du traitement (Ypsys / organisation désignée).*
