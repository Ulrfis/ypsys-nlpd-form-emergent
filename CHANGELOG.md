# <span data-proof="authored" data-by="ai:claude">Changelog</span>

<span data-proof="authored" data-by="ai:claude">Toutes les modifications notables de ce projet sont documentées ici.</span>

<span data-proof="authored" data-by="ai:claude">Format basé sur</span> [<span data-proof="authored" data-by="ai:claude">Keep a Changelog</span>](https://keepachangelog.com/fr/1.0.0/)<span data-proof="authored" data-by="ai:claude">.</span>

## <span data-proof="authored" data-by="ai:claude">[Non publié]</span>

### <span data-proof="authored" data-by="ai:claude">Release debug stamp</span>

* **<span data-proof="authored" data-by="ai:claude">Version app</span>** <span data-proof="authored" data-by="ai:claude">:</span> <span data-proof="authored" data-by="ai:claude">`0.1.1`</span>

* **<span data-proof="authored" data-by="ai:claude">Itération</span>** <span data-proof="authored" data-by="ai:claude">:</span> <span data-proof="authored" data-by="ai:claude">`iter-2026-03-09-01`</span>

* **<span data-proof="authored" data-by="ai:claude">Build publié</span>** <span data-proof="authored" data-by="ai:claude">:</span> <span data-proof="authored" data-by="ai:claude">`2026-03-09 19:10`</span>

* **<span data-proof="authored" data-by="ai:claude">Référence panneau debug</span>** <span data-proof="authored" data-by="ai:claude">:</span> <span data-proof="authored" data-by="ai:claude">`CHANGELOG.md · [Non publié]`</span>

### <span data-proof="authored" data-by="ai:claude">Ajouté</span>

* **<span data-proof="authored" data-by="ai:claude">Supabase — persistance post-analyse</span>** <span data-proof="authored" data-by="ai:claude">:</span> <span data-proof="authored" data-by="ai:claude">`insertFormSubmissionAfterAnalysis`</span> <span data-proof="authored" data-by="ai:claude">et</span> <span data-proof="authored" data-by="ai:claude">`finalizeFormSubmissionLead`</span> <span data-proof="authored" data-by="ai:claude">dans</span> <span data-proof="authored" data-by="ai:claude">`frontend/src/lib/supabase.js`</span> <span data-proof="authored" data-by="ai:claude">; état</span> <span data-proof="authored" data-by="ai:claude">`submissionId`</span> <span data-proof="authored" data-by="ai:claude">dans</span> <span data-proof="authored" data-by="ai:claude">`FormFlow`</span> <span data-proof="authored" data-by="ai:claude">; INSERT des réponses juste après l’analyse OpenAI (sans attendre l’email), UPDATE au formulaire lead ; fallback</span> <span data-proof="authored" data-by="ai:claude">`saveSubmission`</span> <span data-proof="authored" data-by="ai:claude">si pas de ligne initiale</span>

* **<span data-proof="authored" data-by="ai:claude">RLS Supabase</span>** <span data-proof="authored" data-by="ai:claude">: politique</span> <span data-proof="authored" data-by="ai:claude">`Allow anon update on form_submissions`</span> <span data-proof="authored" data-by="ai:claude">documentée dans</span> <span data-proof="authored" data-by="ai:claude">`docs/supabase-schema-update.sql`</span> <span data-proof="authored" data-by="ai:claude">(requis en prod pour le UPDATE lead)</span>

* **<span data-proof="authored" data-by="ai:claude">API</span>** **<span data-proof="authored" data-by="ai:claude">`/api/analyze`</span>** <span data-proof="authored" data-by="ai:claude">: champ</span> <span data-proof="authored" data-by="ai:claude">`score_100_assistant_raw`</span> <span data-proof="authored" data-by="ai:claude">(valeur proposée par le modèle, audit) en plus du</span> <span data-proof="authored" data-by="ai:claude">`score_100`</span> <span data-proof="authored" data-by="ai:claude">imposé par le questionnaire</span>

* **<span data-proof="authored" data-by="ai:claude">Prompt OpenAI v4</span>** <span data-proof="authored" data-by="ai:claude">:</span> <span data-proof="authored" data-by="ai:claude">`docs/assistant-prompt-nlpd-v4-score100.md`</span> <span data-proof="authored" data-by="ai:claude">— prompt intégral à coller dans l’assistant, score rédactionnel aligné sur</span> <span data-proof="authored" data-by="ai:claude">`payload.score`</span> <span data-proof="authored" data-by="ai:claude">(l’app écrase le score affiché)</span>

* **<span data-proof="authored" data-by="ai:claude">Documentation</span>** <span data-proof="authored" data-by="ai:claude">:</span> <span data-proof="authored" data-by="ai:claude">`docs/assistant-regression-testing.md`</span> <span data-proof="authored" data-by="ai:claude">(tests Playground / export Supabase)</span>

* **<span data-proof="authored" data-by="ai:claude">Prompt OpenAI v3 clean</span>** <span data-proof="authored" data-by="ai:claude">: nouveau fichier</span> <span data-proof="authored" data-by="ai:claude">`docs/assistant-prompt-nlpd-v3-score100.md`</span> <span data-proof="authored" data-by="ai:claude">avec champs UI (`result_summary`,</span> <span data-proof="authored" data-by="ai:claude">`result_focus_points`), seuils 0-59/60-89/90-100 et section email</span> <span data-proof="authored" data-by="ai:claude">`Synthèse et prochaines étapes`</span> <span data-proof="authored" data-by="ai:claude">enrichie du bloc</span> <span data-proof="authored" data-by="ai:claude">`Diagnostic NLPD prioritaire offert`</span>

* **<span data-proof="authored" data-by="ai:claude">Bloc offre diagnostic par palier</span>** <span data-proof="authored" data-by="ai:claude">sur la page de résultat finale, avec CTA</span> <span data-proof="authored" data-by="ai:claude">`Prenez rendez-vous ici`</span> <span data-proof="authored" data-by="ai:claude">et mention</span> <span data-proof="authored" data-by="ai:claude">`5 créneaux disponibles cette semaine`</span>

* **<span data-proof="authored" data-by="ai:claude">Nouveau contrat OpenAI v2</span>** <span data-proof="authored" data-by="ai:claude">: prise en charge de</span> <span data-proof="authored" data-by="ai:claude">`score_100`,</span> <span data-proof="authored" data-by="ai:claude">`severity_band`</span> <span data-proof="authored" data-by="ai:claude">(`critical`/`vigilance`/`good`) et</span> <span data-proof="authored" data-by="ai:claude">`top_issues`</span> <span data-proof="authored" data-by="ai:claude">(3 priorités), en plus de</span> <span data-proof="authored" data-by="ai:claude">`teaser`,</span> <span data-proof="authored" data-by="ai:claude">`lead_temperature`,</span> <span data-proof="authored" data-by="ai:claude">`email_user`,</span> <span data-proof="authored" data-by="ai:claude">`email_sales`</span>

* **<span data-proof="authored" data-by="ai:claude">Page de confirmation finale</span>** <span data-proof="authored" data-by="ai:claude">: nouveau composant</span> <span data-proof="authored" data-by="ai:claude">`FinalThankYouPage`</span> <span data-proof="authored" data-by="ai:claude">après la page de résultat détaillée</span>

* **<span data-proof="authored" data-by="ai:claude">Documentation</span>** <span data-proof="authored" data-by="ai:claude">: ajout de</span> <span data-proof="authored" data-by="ai:claude">`docs/assistant-prompt-nlpd-v2-score100.md`</span> <span data-proof="authored" data-by="ai:claude">et</span> <span data-proof="authored" data-by="ai:claude">`docs/plan-maj-scoring-nlpd.md`</span>

* **<span data-proof="authored" data-by="ai:claude">Tracking analytics complet</span>** <span data-proof="authored" data-by="ai:claude">:</span>

  * <span data-proof="authored" data-by="ai:claude">intégration PostHog (`posthog-js`) avec autocapture + événements métier du questionnaire</span>

  * <span data-proof="authored" data-by="ai:claude">intégration script SiteBehaviour (heatmap / comportement session)</span>

### <span data-proof="authored" data-by="ai:claude">Modifié</span>

* **<span data-proof="authored" data-by="ai:claude">ResultsPreview (post-questions)</span>** <span data-proof="authored" data-by="ai:claude">: remplacement de l'encadré score par le message métier du brief du 07/04/26 (`non-conformité nLPD`,</span> <span data-proof="authored" data-by="ai:claude">`risque opérationnel`,</span> <span data-proof="authored" data-by="ai:claude">`exposition financière potentielle jusqu'à CHF 250'000`) ; bloc</span> <span data-proof="authored" data-by="ai:claude">`Vous allez obtenir`</span> <span data-proof="authored" data-by="ai:claude">conservé</span>

* **<span data-proof="authored" data-by="ai:claude">Micro-copy FR</span>** <span data-proof="authored" data-by="ai:claude">: harmonisation ponctuelle de la typographie et des accents dans</span> <span data-proof="authored" data-by="ai:claude">`ResultsPreview`</span> <span data-proof="authored" data-by="ai:claude">(ponctuation avant</span> <span data-proof="authored" data-by="ai:claude">`:`,</span> <span data-proof="authored" data-by="ai:claude">`êtes-vous`,</span> <span data-proof="authored" data-by="ai:claude">`à`, formulation plus fluide)</span>

* **<span data-proof="authored" data-by="ai:claude">Créneaux TidyCal</span>** <span data-proof="authored" data-by="ai:claude">: suppression du libellé fixe « 5 créneaux disponibles cette semaine » sur</span> <span data-proof="authored" data-by="ai:claude">`ThankYouPage`</span> <span data-proof="authored" data-by="ai:claude">(non calculé côté app) ; prompts assistant v3/v4 mis à jour pour interdire tout nombre de créneaux ou délai agenda dans l’email —</span> **<span data-proof="authored" data-by="ai:claude">à recoller dans l’assistant OpenAI</span>** <span data-proof="authored" data-by="ai:claude">pour les nouveaux envois</span>

* **<span data-proof="authored" data-by="ai:claude">Score /100</span>** <span data-proof="authored" data-by="ai:claude">: source de vérité unique = calcul questionnaire (`calculateScore`</span> <span data-proof="authored" data-by="ai:claude">/</span> <span data-proof="authored" data-by="ai:claude">`payload.score.normalized`) ; backend</span> <span data-proof="authored" data-by="ai:claude">`server.py`</span> <span data-proof="authored" data-by="ai:claude">et frontend</span> <span data-proof="authored" data-by="ai:claude">`openai.js`</span> <span data-proof="authored" data-by="ai:claude">+</span> <span data-proof="authored" data-by="ai:claude">`FormFlow.jsx`</span> <span data-proof="authored" data-by="ai:claude">n’utilisent plus le</span> <span data-proof="authored" data-by="ai:claude">`score_100`</span> <span data-proof="authored" data-by="ai:claude">du modèle pour l’affichage (corrige incohérences type 10 vs 67 pour les mêmes réponses)</span>

* **<span data-proof="authored" data-by="ai:claude">Calendrier résultat final</span>** <span data-proof="authored" data-by="ai:claude">: embed iframe TidyCal meeting 30 min (`lib/booking.js`</span> <span data-proof="authored" data-by="ai:claude">:</span> <span data-proof="authored" data-by="ai:claude">`BOOKING_MEETING_PAGE_URL`,</span> <span data-proof="authored" data-by="ai:claude">`BOOKING_EMBED_URL`) sur</span> <span data-proof="authored" data-by="ai:claude">`ThankYouPage`</span> <span data-proof="authored" data-by="ai:claude">avec lien d’ouverture nouvel onglet</span>

* **<span data-proof="authored" data-by="ai:claude">Documentation flux</span>** <span data-proof="authored" data-by="ai:claude">:</span> <span data-proof="authored" data-by="ai:claude">`docs/openai-analyze-and-supabase-flow.md`</span> <span data-proof="authored" data-by="ai:claude">— flux réel insert/update, score imposé, référence prompt v4</span>

* **<span data-proof="authored" data-by="ai:claude">Référence prompt historique</span>** <span data-proof="authored" data-by="ai:claude">:</span> <span data-proof="authored" data-by="ai:claude">`docs/assistant-prompt-nlpd.md`</span> <span data-proof="authored" data-by="ai:claude">pointe vers la v4 en production</span>

* **<span data-proof="authored" data-by="ai:claude">Versionnement prompts</span>** <span data-proof="authored" data-by="ai:claude">:</span> <span data-proof="authored" data-by="ai:claude">`docs/assistant-prompt-nlpd-v2-score100.md`</span> <span data-proof="authored" data-by="ai:claude">conservé en v2, et migration des nouvelles consignes vers</span> <span data-proof="authored" data-by="ai:claude">`docs/assistant-prompt-nlpd-v3-score100.md`</span>

* **<span data-proof="authored" data-by="ai:claude">Landing page</span>** <span data-proof="authored" data-by="ai:claude">: texte d'accroche et encadré de risque réécrits selon le PDF</span> <span data-proof="authored" data-by="ai:claude">`docs/Modifications formulaire nLPD 23-03-26.pdf`</span>

* **<span data-proof="authored" data-by="ai:claude">Questionnaire</span>** <span data-proof="authored" data-by="ai:claude">: suppression de l'encadré de relecture sur la dernière question</span>

* **<span data-proof="authored" data-by="ai:claude">Parcours post-questions</span>** <span data-proof="authored" data-by="ai:claude">: fusion de la page preview et du formulaire de capture (standard + prérempli</span> <span data-proof="authored" data-by="ai:claude">`?email=`) sur une seule page</span>

* **<span data-proof="authored" data-by="ai:claude">CTA principal post-analyse</span>** <span data-proof="authored" data-by="ai:claude">:</span> <span data-proof="authored" data-by="ai:claude">`Recevoir mon diagnostic prioritaire`</span> <span data-proof="authored" data-by="ai:claude">+ mention</span> *<span data-proof="authored" data-by="ai:claude">Valeur du diagnostic de 650 CHF = offert</span>*

* **<span data-proof="authored" data-by="ai:claude">Page résultat finale (`ThankYouPage`)</span>** <span data-proof="authored" data-by="ai:claude">:</span>

  * <span data-proof="authored" data-by="ai:claude">suppression de la jauge,</span>

  * <span data-proof="authored" data-by="ai:claude">score affiché en grand,</span>

  * <span data-proof="authored" data-by="ai:claude">nouveaux titres par palier:</span> <span data-proof="authored" data-by="ai:claude">`Exemplaire`</span> <span data-proof="authored" data-by="ai:claude">(90-100),</span> <span data-proof="authored" data-by="ai:claude">`Risque modéré`</span> <span data-proof="authored" data-by="ai:claude">(60-89),</span> <span data-proof="authored" data-by="ai:claude">`Risque élevé`</span> <span data-proof="authored" data-by="ai:claude">(0-59),</span>

  * <span data-proof="authored" data-by="ai:claude">ajout des couches de contenu: générique + OpenAI + encart diagnostic</span>

* **<span data-proof="authored" data-by="ai:claude">Seuils score harmonisés frontend/backend</span>** <span data-proof="authored" data-by="ai:claude">:</span> <span data-proof="authored" data-by="ai:claude">`critical`</span> <span data-proof="authored" data-by="ai:claude">0-59,</span> <span data-proof="authored" data-by="ai:claude">`vigilance`</span> <span data-proof="authored" data-by="ai:claude">60-89,</span> <span data-proof="authored" data-by="ai:claude">`good`</span> <span data-proof="authored" data-by="ai:claude">90-100</span>

* **<span data-proof="authored" data-by="ai:claude">Contrat</span>** **<span data-proof="authored" data-by="ai:claude">`/api/analyze`</span><span data-proof="authored" data-by="ai:claude">étendu</span>**  <span data-proof="authored" data-by="ai:claude">: ajout de</span> <span data-proof="authored" data-by="ai:claude">`result_summary`</span> <span data-proof="authored" data-by="ai:claude">et</span> <span data-proof="authored" data-by="ai:claude">`result_focus_points`</span> <span data-proof="authored" data-by="ai:claude">dans la réponse backend et la normalisation frontend</span>

* **<span data-proof="authored" data-by="ai:claude">Documentation API/OpenAI</span>** <span data-proof="authored" data-by="ai:claude">:</span> <span data-proof="authored" data-by="ai:claude">`docs/openai-analyze-and-supabase-flow.md`</span> <span data-proof="authored" data-by="ai:claude">alignée sur le contrat v3</span>

* **<span data-proof="authored" data-by="ai:claude">PostHog</span>** <span data-proof="authored" data-by="ai:claude">: activation uniquement si</span> <span data-proof="authored" data-by="ai:claude">`REACT_APP_POSTHOG_KEY`</span> <span data-proof="authored" data-by="ai:claude">est défini (clé retirée du code ; à définir en local dans</span> <span data-proof="authored" data-by="ai:claude">`frontend/.env`</span> <span data-proof="authored" data-by="ai:claude">et en prod dans Railway Variables pour le tracking usages / user flows).</span>

* **<span data-proof="authored" data-by="ai:claude">Flux post-questionnaire</span>** <span data-proof="authored" data-by="ai:claude">:</span> <span data-proof="authored" data-by="ai:claude">`Questions -> Transition sans score -> Capture email -> Résultat complet -> Thank you final`</span>

* **<span data-proof="authored" data-by="ai:claude">Écran avant email (`ResultsPreview`)</span>** <span data-proof="authored" data-by="ai:claude">: suppression de toute notion de score ; texte orienté "analyse terminée" + livrables du rapport</span>

* **<span data-proof="authored" data-by="ai:claude">Message intermédiaire avant email</span>** <span data-proof="authored" data-by="ai:claude">: remplacement de la phrase fixe par un message adapté au niveau (`critical`</span> <span data-proof="authored" data-by="ai:claude">/</span> <span data-proof="authored" data-by="ai:claude">`vigilance`</span> <span data-proof="authored" data-by="ai:claude">/</span> <span data-proof="authored" data-by="ai:claude">`good`) avec un ton non alarmiste</span>

* **<span data-proof="authored" data-by="ai:claude">Écran résultat après email (`ThankYouPage`)</span>** <span data-proof="authored" data-by="ai:claude">: refonte complète avec titre "VOTRE SCORE CONFORMITÉ nLPD", jauge</span> <span data-proof="authored" data-by="ai:claude">`/100`, contenu conditionnel selon 3 seuils (`<40`,</span> <span data-proof="authored" data-by="ai:claude">`40-79`,</span> <span data-proof="authored" data-by="ai:claude">`80-100`) et bloc CTA "PRENDRE RENDEZ-VOUS - 30 MIN"</span>

* **<span data-proof="authored" data-by="ai:claude">Jauge (`ScoreGauge`)</span>** <span data-proof="authored" data-by="ai:claude">: affichage</span> <span data-proof="authored" data-by="ai:claude">`XX/100`</span> <span data-proof="authored" data-by="ai:claude">et seuils couleurs alignés sur la nouvelle mécanique (`red <40`,</span> <span data-proof="authored" data-by="ai:claude">`orange 40-79`,</span> <span data-proof="authored" data-by="ai:claude">`green >=80`)</span>

* **<span data-proof="authored" data-by="ai:claude">Robustesse scoring</span>** <span data-proof="authored" data-by="ai:claude">: fallback local automatique si OpenAI ne renvoie pas</span> <span data-proof="authored" data-by="ai:claude">`score_100`</span> <span data-proof="authored" data-by="ai:claude">/</span> <span data-proof="authored" data-by="ai:claude">`severity_band`</span> <span data-proof="authored" data-by="ai:claude">/</span> <span data-proof="authored" data-by="ai:claude">`top_issues`</span>

* **<span data-proof="authored" data-by="ai:claude">Responsive mobile/desktop</span>** <span data-proof="authored" data-by="ai:claude">: amélioration des CTA multilignes, typographie, interlignage, paddings et gestion des débordements (dont emails longs)</span>

* **<span data-proof="authored" data-by="ai:claude">Politique de confidentialité</span>** <span data-proof="authored" data-by="ai:claude">: mise à jour des sections données/finalités/destinataires pour refléter PostHog et SiteBehaviour</span>

* **<span data-proof="authored" data-by="ai:claude">Référence assistant OpenAI</span>** <span data-proof="authored" data-by="ai:claude">: documentation alignée sur le prompt actif</span> <span data-proof="authored" data-by="ai:claude">`docs/assistant-prompt-nlpd-v2-score100.md`</span>

### <span data-proof="authored" data-by="ai:claude">Décisions et alternatives documentées</span>

* **<span data-proof="authored" data-by="ai:claude">Décision validée</span>** <span data-proof="authored" data-by="ai:claude">: conserver le teaser personnalisé sur l’écran intermédiaire quand il est disponible.</span>

* **<span data-proof="authored" data-by="ai:claude">Alternatives conservées pour itération future</span>** <span data-proof="authored" data-by="ai:claude">:</span>

  * <span data-proof="authored" data-by="ai:claude">texte neutre unique pour tous les niveaux,</span>

  * <span data-proof="authored" data-by="ai:claude">suppression totale du bloc message intermédiaire,</span>

  * <span data-proof="authored" data-by="ai:claude">affichage du teaser uniquement après validation éditoriale.</span>

* **<span data-proof="authored" data-by="ai:claude">Pistes créatives/engageantes possibles</span>** <span data-proof="authored" data-by="ai:claude">(non implémentées à ce stade) :</span>

  * <span data-proof="authored" data-by="ai:claude">micro-animation différente selon le niveau pour renforcer la lisibilité sans dramatiser,</span>

  * <span data-proof="authored" data-by="ai:claude">message d'encouragement personnalisé avec progression en 3 étapes,</span>

  * <span data-proof="authored" data-by="ai:claude">variante storytelling courte ("où vous en êtes / prochaine action / bénéfice attendu").</span>

### <span data-proof="authored" data-by="ai:claude">Corrigé</span>

* **<span data-proof="authored" data-by="ai:claude">Soumission lead Supabase (production)</span>** <span data-proof="authored" data-by="ai:claude">: réalignement de la fonction RPC</span> <span data-proof="authored" data-by="ai:claude">`public.finalize_submission_lead`</span> <span data-proof="authored" data-by="ai:claude">avec la signature appelée par le frontend (`p_submission_id`,</span> <span data-proof="authored" data-by="ai:claude">`p_session_id`, champs utilisateur + consentements) ; suppression/recréation de la fonction pour contourner l'erreur PostgreSQL</span> <span data-proof="authored" data-by="ai:claude">`42P13`</span> <span data-proof="authored" data-by="ai:claude">(defaults de paramètres)</span>

* **<span data-proof="authored" data-by="ai:claude">Contrainte status Supabase</span>** <span data-proof="authored" data-by="ai:claude">: suppression de l'erreur</span> <span data-proof="authored" data-by="ai:claude">`23514 form_submissions_status_check`</span> <span data-proof="authored" data-by="ai:claude">lors de la finalisation lead en fixant un</span> <span data-proof="authored" data-by="ai:claude">`status`</span> <span data-proof="authored" data-by="ai:claude">compatible contrainte (`teaser_ready`) dans la RPC</span>

* **<span data-proof="authored" data-by="ai:claude">Incident tracking</span>** <span data-proof="authored" data-by="ai:claude">: clarification de diagnostic — erreurs observées en fin de questionnaire liées à la couche DB Supabase (RPC/contrainte) et non au banner cookies/PostHog</span>

### <span data-proof="authored" data-by="ai:claude">À venir</span>

* <span data-proof="authored" data-by="ai:claude">Intégration Dreamlit pour envoi automatique d'emails</span>

* <span data-proof="authored" data-by="ai:claude">Migration appel OpenAI vers Supabase Edge Function</span>

* <span data-proof="authored" data-by="ai:claude">Dashboard admin pour visualiser les leads</span>

***

## <span data-proof="authored" data-by="ai:claude">[0.9.0] - 2026-02-04</span>

### <span data-proof="authored" data-by="ai:claude">Ajouté</span>

* **<span data-proof="authored" data-by="ai:claude">Disclaimer légal</span>** <span data-proof="authored" data-by="ai:claude">: mention en bas de la page de résultats indiquant que YPSYS ne s'engage pas sur l'exhaustivité/exactitude des résultats</span>

* **<span data-proof="authored" data-by="ai:claude">Q8 nLPD</span>** <span data-proof="authored" data-by="ai:claude">: précision FINMA pour le secteur financier concernant le stockage en Europe</span>

### <span data-proof="authored" data-by="ai:claude">Modifié</span>

* **<span data-proof="authored" data-by="ai:claude">Calendrier de réservation</span>** <span data-proof="authored" data-by="ai:claude">: migration de Outlook Book With Me vers TidyCal (Lionel Dumas) avec embed intégré</span>

* **<span data-proof="authored" data-by="ai:claude">Page d'accueil</span>** <span data-proof="authored" data-by="ai:claude">: bloc d'avertissement déplacé au-dessus du bouton CTA ; line-height ajusté sur le sous-titre</span>

* **<span data-proof="authored" data-by="ai:claude">Terminologie</span>** <span data-proof="authored" data-by="ai:claude">: "expert nLPD" → "consultant nLPD", "Nos experts sont disponibles" → "Notre équipe est disponible"</span>

***

## <span data-proof="authored" data-by="ai:claude">[0.8.0] - 2026-02-03</span>

### <span data-proof="authored" data-by="ai:claude">Supprimé</span>

* **<span data-proof="authored" data-by="ai:claude">PostHog</span>** <span data-proof="authored" data-by="ai:claude">: retrait complet (PostHogLoader, posthog-loader.js) ; aucun outil d'analytics sur le formulaire</span>

* **<span data-proof="authored" data-by="ai:claude">Bandeau cookies</span>** <span data-proof="authored" data-by="ai:claude">: CookieBanner et CookieConsentContext retirés ; pas de cookies sur le formulaire</span>

### <span data-proof="authored" data-by="ai:claude">Modifié</span>

* **<span data-proof="authored" data-by="ai:claude">Politique de confidentialité</span>** <span data-proof="authored" data-by="ai:claude">: section Destinataires sans mention de PostHog ni de cookies statistiques</span>

* **<span data-proof="authored" data-by="ai:claude">Documentation</span>** <span data-proof="authored" data-by="ai:claude">: README, audit RGPD/nLPD et STORY alignés (périmètre sans PostHog, pas de bandeau cookies)</span>

***

## <span data-proof="authored" data-by="ai:claude">[0.7.0] - 2026-02-03</span>

### <span data-proof="authored" data-by="ai:claude">Ajouté</span>

* **<span data-proof="authored" data-by="ai:claude">Politique de confidentialité</span>** <span data-proof="authored" data-by="ai:claude">: page</span> <span data-proof="authored" data-by="ai:claude">`/politique-confidentialite`</span> <span data-proof="authored" data-by="ai:claude">(structure alignée sur la politique de cookies Ypsys) avec sections Introduction, Données collectées, Finalités, Destinataires et transferts, Durée, Droits, Contact ; lien cliquable depuis le formulaire de capture de leads</span>

* **<span data-proof="authored" data-by="ai:claude">Audit RGPD/nLPD</span>** <span data-proof="authored" data-by="ai:claude">:</span> [<span data-proof="authored" data-by="ai:claude">docs/audit-securite-rgpd-nlpd.md</span>](docs/audit-securite-rgpd-nlpd.md) <span data-proof="authored" data-by="ai:claude">— inventaire des données, flux, conformité RGPD/nLPD, sécurité technique, recommandations ; mise en œuvre des actions P0 documentée</span>

### <span data-proof="authored" data-by="ai:claude">Modifié</span>

* **<span data-proof="authored" data-by="ai:claude">API backend</span>** <span data-proof="authored" data-by="ai:claude">: routes GET</span> <span data-proof="authored" data-by="ai:claude">`/api/submissions`, GET</span> <span data-proof="authored" data-by="ai:claude">`/api/submissions/{id}`</span> <span data-proof="authored" data-by="ai:claude">et GET</span> <span data-proof="authored" data-by="ai:claude">`/api/stats`</span> <span data-proof="authored" data-by="ai:claude">protégées par l'en-tête</span> <span data-proof="authored" data-by="ai:claude">`X-API-Key`</span> <span data-proof="authored" data-by="ai:claude">(variable</span> <span data-proof="authored" data-by="ai:claude">`API_ADMIN_SECRET`) ; sans clé ou si</span> <span data-proof="authored" data-by="ai:claude">`API_ADMIN_SECRET`</span> <span data-proof="authored" data-by="ai:claude">non défini → 403</span>

* **<span data-proof="authored" data-by="ai:claude">Logs debug</span>** <span data-proof="authored" data-by="ai:claude">: sanitisation des payloads (redactPayload) — données personnelles (user, email, answers, etc.) remplacées par</span> <span data-proof="authored" data-by="ai:claude">`[REDACTED]`</span> <span data-proof="authored" data-by="ai:claude">avant stockage dans localStorage ; conformité RGPD/nLPD</span>

* **<span data-proof="authored" data-by="ai:claude">Version mobile</span>** <span data-proof="authored" data-by="ai:claude">: CTA et barre de navigation (Précédent/Suivant) toujours visibles sans scroll ; barre de navigation fixe en bas (layout</span> <span data-proof="authored" data-by="ai:claude">`h-screen`</span> <span data-proof="authored" data-by="ai:claude">+ zone scrollable) ; questionnaire compact (polices plus petites, capsule chapitre supprimée, barre de progression moins haute) ; validation avec touche Entrée après sélection d'une réponse ; boutons et pages sans débordement largeur</span>

* **<span data-proof="authored" data-by="ai:claude">Page « Votre analyse est prête »</span>** <span data-proof="authored" data-by="ai:claude">: bloc « Aperçu de vos priorités » supprimé ; conservés : score gauge, carte niveau de risque, « Obtenez votre rapport complet par email »</span>

* **<span data-proof="authored" data-by="ai:claude">Page « Votre diagnostic nLPD »</span>** <span data-proof="authored" data-by="ai:claude">: logo Ypsys en header (remplace icône + texte) ; blocs « Score et Gaps » et « Analyse personnalisée » supprimés ; bloc « Vos 3 priorités » supprimé ; conservés : « Rapport complet envoyé par email », calendrier consultation, CTA</span>

### <span data-proof="authored" data-by="ai:claude">Documentation</span>

* [<span data-proof="authored" data-by="ai:claude">docs/deployment-railway-env.md</span>](docs/deployment-railway-env.md) <span data-proof="authored" data-by="ai:claude">: section API_ADMIN_SECRET (quand définir, quand ne pas définir)</span>

* [<span data-proof="authored" data-by="ai:claude">backend/.env.example</span>](backend/.env.example) <span data-proof="authored" data-by="ai:claude">: commentaire pour API_ADMIN_SECRET</span>

***

## <span data-proof="authored" data-by="ai:claude">[0.6.0] - 2026-02-03</span>

### <span data-proof="authored" data-by="ai:claude">Ajouté</span>

* <span data-proof="authored" data-by="ai:claude">Envoi à OpenAI de</span> **<span data-proof="authored" data-by="ai:claude">toutes</span>** <span data-proof="authored" data-by="ai:claude">les réponses du questionnaire :</span> <span data-proof="authored" data-by="ai:claude">`answers`</span> <span data-proof="authored" data-by="ai:claude">(q1..q15) +</span> <span data-proof="authored" data-by="ai:claude">`answers_detailed`</span> <span data-proof="authored" data-by="ai:claude">(question + réponse par item) pour une analyse détaillée par l'assistant</span>

* <span data-proof="authored" data-by="ai:claude">Documentation</span> [<span data-proof="authored" data-by="ai:claude">docs/openai-analyze-and-supabase-flow.md</span>](docs/openai-analyze-and-supabase-flow.md) <span data-proof="authored" data-by="ai:claude">: format requête/réponse API analyze, flux vers Supabase (teaser, email_user, email_sales)</span>

* <span data-proof="authored" data-by="ai:claude">Script SQL</span> [<span data-proof="authored" data-by="ai:claude">docs/supabase-schema-update.sql</span>](docs/supabase-schema-update.sql) <span data-proof="authored" data-by="ai:claude">: création/mise à jour des tables Supabase (form_submissions, email_outputs) pour recevoir toutes les réponses et les 3 sorties de l'assistant (teaser, rapport prospect, contexte commerciaux)</span>

* <span data-proof="authored" data-by="ai:claude">Section dépannage dans</span> [<span data-proof="authored" data-by="ai:claude">docs/deployment-railway-env.md</span>](docs/deployment-railway-env.md) <span data-proof="authored" data-by="ai:claude">: « Credentials not configured » en prod → appliquer les variables puis</span> **<span data-proof="authored" data-by="ai:claude">redéployer</span>** <span data-proof="authored" data-by="ai:claude">(build-time pour REACT_APP_*)</span>

### <span data-proof="authored" data-by="ai:claude">Modifié</span>

* <span data-proof="authored" data-by="ai:claude">Panneau debug (mode</span> <span data-proof="authored" data-by="ai:claude">`?debug=true`) : affichage du</span> **<span data-proof="authored" data-by="ai:claude">payload complet</span>** <span data-proof="authored" data-by="ai:claude">envoyé à</span> <span data-proof="authored" data-by="ai:claude">`/api/analyze`</span> <span data-proof="authored" data-by="ai:claude">(answers + answers_detailed) au lieu d'un simple résumé</span>

* <span data-proof="authored" data-by="ai:claude">Backend : modèle</span> <span data-proof="authored" data-by="ai:claude">`AnalyzePayload`</span> <span data-proof="authored" data-by="ai:claude">accepte un champ optionnel</span> <span data-proof="authored" data-by="ai:claude">`answers_detailed`</span> <span data-proof="authored" data-by="ai:claude">(liste question_id, question, answer) et transmet l'intégralité du payload à OpenAI</span>

### <span data-proof="authored" data-by="ai:claude">Amélioré</span>

* <span data-proof="authored" data-by="ai:claude">L'assistant OpenAI reçoit désormais le contexte explicite de chaque question et réponse pour produire teaser, email_user et email_sales détaillés ; les deux emails sont stockés dans</span> <span data-proof="authored" data-by="ai:claude">`email_outputs`</span> <span data-proof="authored" data-by="ai:claude">après capture du lead</span>

***

## <span data-proof="authored" data-by="ai:claude">[0.5.0] - 2026-02-02</span>

### <span data-proof="authored" data-by="ai:claude">Modifié</span>

* <span data-proof="authored" data-by="ai:claude">Révision complète des textes des 15 questions du questionnaire nLPD</span>

* <span data-proof="authored" data-by="ai:claude">Réorganisation de l'ordre des réponses (rouge → vert) pour toutes les questions</span>

* <span data-proof="authored" data-by="ai:claude">Simplification des tooltips et explications</span>

* <span data-proof="authored" data-by="ai:claude">Remplacement des termes techniques par des formulations plus accessibles</span>

* <span data-proof="authored" data-by="ai:claude">Q5 : "Vos sauvegardes fonctionnent-elles vraiment?" → "Comment est organisée la sauvegarde des données sensibles?"</span>

* <span data-proof="authored" data-by="ai:claude">Q13 : "Votre équipe connaît-elle les règles de base nLPD?" → "Votre équipe est-elle sensibilisée aux risques de cyberattaque?"</span>

### <span data-proof="authored" data-by="ai:claude">Supprimé</span>

* <span data-proof="authored" data-by="ai:claude">Q9 : Option "Je ne sais pas si c'est obligatoire"</span>

* <span data-proof="authored" data-by="ai:claude">Q14 : Option "C'est réparti, mais pas formalisé"</span>

### <span data-proof="authored" data-by="ai:claude">Amélioré</span>

* <span data-proof="authored" data-by="ai:claude">Messages moins culpabilisants et plus orientés solution</span>

* <span data-proof="authored" data-by="ai:claude">Focus sur les principes nLPD plutôt que sur les sanctions PFPDT</span>

* <span data-proof="authored" data-by="ai:claude">Terminologie simplifiée : "MdP" → "mot de passe", "Chiffrement" → "Cryptage"</span>

* <span data-proof="authored" data-by="ai:claude">Questions plus directes et actionnables</span>

***

## <span data-proof="authored" data-by="ai:claude">[0.4.0] - 2026-01-28</span>

### <span data-proof="authored" data-by="ai:claude">Ajouté</span>

* <span data-proof="authored" data-by="ai:claude">Déploiement Railway fonctionnel avec virtual environment Python</span>

* <span data-proof="authored" data-by="ai:claude">Configuration Nixpacks corrigée pour environnement Nix/PEP 668</span>

### <span data-proof="authored" data-by="ai:claude">Corrigé</span>

* <span data-proof="authored" data-by="ai:claude">`nixpacks.toml`</span> <span data-proof="authored" data-by="ai:claude">: utilisation d'un venv pour contourner PEP 668 (externally-managed-environment)</span>

* <span data-proof="authored" data-by="ai:claude">`railway.toml`,</span> <span data-proof="authored" data-by="ai:claude">`railway.json`,</span> <span data-proof="authored" data-by="ai:claude">`Procfile`</span> <span data-proof="authored" data-by="ai:claude">: chemins uvicorn alignés avec le venv (`/app/venv/bin/uvicorn`)</span>

* <span data-proof="authored" data-by="ai:claude">Fix "No module named pip" : passage de</span> <span data-proof="authored" data-by="ai:claude">`python3 -m pip`</span> <span data-proof="authored" data-by="ai:claude">à création de venv</span>

### <span data-proof="authored" data-by="ai:claude">Note technique</span>

<span data-proof="authored" data-by="ai:claude">Ce déploiement a nécessité 8 tentatives (5 avec Claude Code, 3 avec Cursor) pour résoudre les problèmes spécifiques à Nixpacks + Python + Nix.</span>

***

## <span data-proof="authored" data-by="ai:claude">[0.3.0] - 2026-01-28</span>

### <span data-proof="authored" data-by="ai:claude">Ajouté</span>

* <span data-proof="authored" data-by="ai:claude">Configuration Railway initiale (railway.json, nixpacks.toml, Procfile)</span>

* <span data-proof="authored" data-by="ai:claude">Fichiers .python-version et .node-version</span>

* <span data-proof="authored" data-by="ai:claude">Script start.sh pour déploiement</span>

* <span data-proof="authored" data-by="ai:claude">Backend simplifié sans dépendance MongoDB</span>

* <span data-proof="authored" data-by="ai:claude">Serveur de fichiers statiques pour frontend buildé</span>

### <span data-proof="authored" data-by="ai:claude">Modifié</span>

* <span data-proof="authored" data-by="ai:claude">requirements.txt minimal (7 dépendances au lieu de 140+)</span>

* <span data-proof="authored" data-by="ai:claude">Backend adapté pour fonctionner standalone avec Supabase</span>

***

## <span data-proof="authored" data-by="ai:claude">[0.2.0] - 2026-01-27</span>

### <span data-proof="authored" data-by="ai:claude">Ajouté</span>

* <span data-proof="authored" data-by="ai:claude">Nouveau flux utilisateur après questionnaire :</span>

  1. <span data-proof="authored" data-by="ai:claude">"Envoyer les réponses" (nouveau bouton)</span>
  2. <span data-proof="authored" data-by="ai:claude">Écran d'analyse animé (4 étapes visuelles)</span>
  3. <span data-proof="authored" data-by="ai:claude">Page de résultats avec teaser IA</span>
  4. <span data-proof="authored" data-by="ai:claude">CTA "Recevoir mon rapport complet gratuit"</span>
  5. <span data-proof="authored" data-by="ai:claude">Formulaire simplifié</span>

* <span data-proof="authored" data-by="ai:claude">Composant ResultsPreview avec design inspiré des maquettes client</span>

* <span data-proof="authored" data-by="ai:claude">Formulaire de capture simplifié (prénom + email obligatoires uniquement)</span>

* <span data-proof="authored" data-by="ai:claude">Section "Informations complémentaires" dépliable pour champs optionnels</span>

### <span data-proof="authored" data-by="ai:claude">Modifié</span>

* <span data-proof="authored" data-by="ai:claude">QuestionCard : bouton "Terminer" remplacé par "Envoyer les réponses"</span>

* <span data-proof="authored" data-by="ai:claude">AnalysisLoadingScreen : redesign avec 4 étapes et icônes</span>

* <span data-proof="authored" data-by="ai:claude">LeadCaptureForm : champs optionnels en collapsible</span>

* <span data-proof="authored" data-by="ai:claude">FormFlow : nouveau flux avec étape RESULTS_PREVIEW</span>

***

## <span data-proof="authored" data-by="ai:claude">[0.1.0] - 2026-01-27</span>

### <span data-proof="authored" data-by="ai:claude">Ajouté</span>

* <span data-proof="authored" data-by="ai:claude">Setup initial du projet React + FastAPI</span>

* <span data-proof="authored" data-by="ai:claude">Design system Ypsys (couleur Magenta #C8007F)</span>

* <span data-proof="authored" data-by="ai:claude">15 questions nLPD avec tooltips enrichis et feedback</span>

* <span data-proof="authored" data-by="ai:claude">5 sections thématiques avec barre de progression</span>

* <span data-proof="authored" data-by="ai:claude">Support mode sombre/clair</span>

* <span data-proof="authored" data-by="ai:claude">Intégration OpenAI Assistant API</span>

* <span data-proof="authored" data-by="ai:claude">Intégration Supabase (PostgreSQL Europe)</span>

* <span data-proof="authored" data-by="ai:claude">Tables : form_submissions, email_outputs</span>

* <span data-proof="authored" data-by="ai:claude">Calcul de score avec niveaux de risque (vert/orange/rouge)</span>

* <span data-proof="authored" data-by="ai:claude">Page de remerciement avec top 3 priorités</span>

* <span data-proof="authored" data-by="ai:claude">Suppression du badge "Made with Emergent"</span>

### <span data-proof="authored" data-by="ai:claude">Configuration</span>

* <span data-proof="authored" data-by="ai:claude">Tailwind CSS avec tokens de design personnalisés</span>

* <span data-proof="authored" data-by="ai:claude">shadcn/ui composants (button, card, input, select, etc.)</span>

* <span data-proof="authored" data-by="ai:claude">Framer Motion pour animations</span>

* <span data-proof="authored" data-by="ai:claude">Politiques RLS Supabase configurées</span>

***

<span data-proof="authored" data-by="ai:claude"><!-- 
GUIDE RAPIDE:
- "Ajouté" pour les nouvelles fonctionnalités
- "Modifié" pour les changements de fonctionnalités existantes  
- "Déprécié" pour les fonctionnalités qui seront supprimées
- "Supprimé" pour les fonctionnalités supprimées
- "Corrigé" pour les corrections de bugs
- "Sécurité" pour les vulnérabilités corrigées

VERSIONING:
- 0.x.x = prototype/dev
- 1.0.0 = première release stable
- x.Y.x = nouvelle fonctionnalité
- x.x.Z = correction de bug
--></span>