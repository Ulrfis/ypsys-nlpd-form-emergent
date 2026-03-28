# Tests de non-régression — Assistant OpenAI (nLPD Ypsys)

Procédure interne pour valider le JSON de l’assistant, la qualité des textes et la **cohérence avec le score questionnaire** (l’application impose `score_100` ; le modèle ne doit pas diverger dans le contenu rédactionnel).

---

## 1. Préparer des jeux de données depuis Supabase

Dans le SQL Editor Supabase, exporter quelques soumissions représentatives (anonymiser si besoin) :

```sql
SELECT
  id,
  created_at,
  answers,
  score_raw,
  score_normalized,
  risk_level,
  teaser_text
FROM public.form_submissions
ORDER BY created_at DESC
LIMIT 10;
```

Pour reconstruire le **payload** envoyé à `/api/analyze` :

- `user` : reprendre les champs du formulaire (ou placeholders comme dans l’app avant capture lead).
- `answers` : objet `q1`…`q15` avec les **libellés** d’options (comme en production), pas seulement les ids.
- `answers_detailed` : optionnel mais recommandé — liste `{ question_id, question, answer }` alignée sur [questionsData.js](../frontend/src/data/questionsData.js).
- `score` : `{ value, normalized, level }` cohérents avec les réponses (vous pouvez recalculer hors ligne ou faire confiance aux colonnes `score_*` déjà stockées).
- `has_email` : `false` pour reproduire l’étape post-questionnaire.

**Score attendu côté app** : `score_100 = arrondi(score_normalized × 10)` (avec `score_normalized` sur échelle /10 dans la base).

---

## 2. Tester dans la console OpenAI

1. Ouvrir **OpenAI Platform** → **Assistants** → votre assistant de prod.
2. Onglet **Playground** / test : coller le JSON **complet** du payload (même structure que dans [openai-analyze-and-supabase-flow.md](openai-analyze-and-supabase-flow.md)).
3. Lancer le run et récupérer la réponse JSON.

---

## 3. Checklist par cas

| Critère | Vérification |
|--------|----------------|
| JSON valide | Parse sans erreur ; pas de texte hors JSON. |
| Clés obligatoires | `teaser`, `lead_temperature`, `top_issues` (3), `email_user`, `email_sales` avec `subject` + `body_markdown`. |
| Score affiché app | Après déploiement du correctif, l’UI utilise le score questionnaire ; en playground, vérifier que le **texte** des emails mentionne le même score que `round(normalized×10)`. |
| `severity_band` | Cohérent avec les seuils 0–59 / 60–89 / 90–100 pour ce score. |
| Emails | Ton et priorités alignés avec le niveau de risque (pas de score « inventé » dans le corps). |

### Jeux de cas recommandés

1. **Toutes les « bonnes » réponses** — score élevé, ton rassurant, sections CTA adaptées (v4).
2. **Une mauvaise réponse sur la dernière question** — le score doit refléter la pondération réelle du questionnaire, pas une estimation du modèle.
3. **Profil à risque** — score bas, emails et `top_issues` exigeants mais factuels.

---

## 4. Comparer avec l’API réelle (optionnel)

En local ou sur Railway :

```bash
curl -s -X POST "$BACKEND_URL/api/analyze" \
  -H "Content-Type: application/json" \
  -d '{"payload": { ... même JSON que ci-dessus ... }}'
```

Vérifier dans la réponse :

- `score_100` = valeur calculée depuis `payload.score.normalized`.
- `score_100_assistant_raw` = ce que le modèle avait proposé (peut différer ; utile pour diagnostiquer un prompt trop « créatif »).

---

## 5. Fréquence

- Après **toute modification** des instructions assistant (prompt v4+).
- Avant une **mise en production** majeure du formulaire ou des pondérations dans `questionsData.js`.
