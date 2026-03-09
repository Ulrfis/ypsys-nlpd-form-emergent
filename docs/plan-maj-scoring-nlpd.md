# Plan de mise à jour scoring nLPD

## Objectif
Adapter le parcours UX et le contrat OpenAI pour la nouvelle mécanique de restitution:
- écran de transition avant email sans affichage de score,
- écran résultat immédiatement après email avec score `/100`,
- 3 blocs narratifs selon seuils (`<40`, `40-79`, `80-100`),
- priorités issues d'OpenAI (`top_issues`) avec fallback local.

## Flux cible
`Questions -> TransitionSansScore -> CaptureEmail -> ResultatFinalScore100 -> ThankYou`

## Changements UX
- **Transition avant email (`ResultsPreview`)**
  - Supprimer jauge, score, niveau de risque.
  - Afficher le message fixe:
    - "Votre analyse est terminée"
    - "Nous avons évalué 15 critères techniques..."
    - liste des éléments du rapport (score /100, 3 failles, roadmap, risques juridiques).
- **Résultat après email (`ThankYouPage` refondu)**
  - Titre: "VOTRE SCORE CONFORMITÉ nLPD"
  - Jauge visuelle rouge/orange/vert
  - Bloc de contenu conditionnel selon score:
    - `<40` Critique
    - `40-79` Vigilance requise
    - `80-100` Bon niveau
  - Section "VOS 3 FAILLES / PRIORITÉS / POINTS À FINALISER" issue de `top_issues`.
  - Bloc CTA "VOUS VOULEZ EN DISCUTER ?" + bouton "PRENDRE RENDEZ-VOUS - 30 MIN".
- **Thank you final**
  - Conserver une page finale après la page résultat (comme validé), allégée pour éviter la redondance.

## Contrat OpenAI v2
Réponse attendue enrichie:
- `teaser` (string)
- `lead_temperature` (`HOT` | `WARM` | `COLD`)
- `score_100` (number 0..100)
- `severity_band` (`critical` | `vigilance` | `good`)
- `top_issues` (array de 3 strings)
- `email_user` ({ `subject`, `body_markdown` })
- `email_sales` ({ `subject`, `body_markdown` })

## Fallback
Si OpenAI ne renvoie pas `score_100` ou `top_issues`:
- `score_100` depuis calcul local (`normalized * 10`, arrondi),
- `severity_band` dérivé des seuils score,
- `top_issues` depuis `getTopPriorities`.

## Fichiers à modifier
- `frontend/src/components/FormFlow.jsx`
- `frontend/src/components/ResultsPreview.jsx`
- `frontend/src/components/ThankYouPage.jsx`
- `frontend/src/components/ScoreGauge.jsx`
- `frontend/src/lib/openai.js`
- `backend/server.py`
- `docs/openai-analyze-and-supabase-flow.md`

## Vérification
- Tester 3 cas de score: `35`, `62`, `88`.
- Vérifier le flux complet post-questionnaire.
- Vérifier la non-régression de `email_user` et `email_sales` en base.
- Vérifier fallback local quand champs OpenAI v2 absents.
