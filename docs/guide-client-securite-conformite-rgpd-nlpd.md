# Guide client - Sécurité et conformité RGPD/nLPD

**Projet**: Formulaire d'auto-évaluation nLPD  
**Public visé**: Direction, Marketing, Opérations, IT  
**Objectif**: Sensibiliser et guider les actions pour atteindre un niveau de conformité robuste et durable

---

## Pourquoi ce document ?

Votre formulaire fonctionne déjà bien sur le plan métier.  
En revanche, pour être **100% aligné sécurité + conformité**, il faut compléter plusieurs points techniques, organisationnels et contractuels.

L'idée n'est pas de "faire peur", mais d'éviter 3 risques concrets:

1. **Risque légal**: non-conformité RGPD/nLPD (information, consentement, transferts internationaux, droits des personnes).
2. **Risque réputationnel**: perte de confiance client en cas d'incident ou d'usage non transparent des données.
3. **Risque opérationnel**: fuites de données, abus d'API, envois d'emails non conformes.

---

## Ce qui est déjà en bonne voie

1. Intégration d'une bannière cookies/confidentialité avec analytics désactivés par défaut.
2. Durcissement progressif des accès Supabase (RLS) et fin des mises à jour publiques trop larges.
3. Passage vers une finalisation de lead via RPC sécurisée au lieu d'`UPDATE` direct.
4. Clarification du wording pour éviter les promesses inexactes.

C'est une base saine.

---

## Priorités de mise en conformité

## 1) Priorité immédiate (0-7 jours)

### A. Verrouiller définitivement les accès aux données

**À faire**:
1. Supprimer toutes les policies `SELECT`/`UPDATE` trop permissives pour les rôles publics.
2. Conserver uniquement les accès strictement nécessaires (`anon` pour insert minimal, rôle dédié pour Dreamlit).
3. Vérifier que Dreamlit lit via son rôle dédié uniquement.

**Pourquoi c'est important**:  
Moins il y a de droits ouverts, moins il y a de surface d'attaque.

### B. Protéger l'API d'analyse (`/api/analyze`)

**À faire**:
1. Ajouter un rate limiting (anti-spam/anti-abus).
2. Standardiser les erreurs (message générique côté client, détails côté logs internes).
3. Monitorer les appels anormaux.

**Pourquoi c'est important**:  
Évite les abus, les surcoûts et les indisponibilités.

### C. Consentement clair et prouvable

**À faire**:
1. Conserver les préférences cookies/analytics avec horodatage et version de politique.
2. Ne jamais activer analytics sans action explicite.
3. Garder le flux `?email=` en préremplissage uniquement (sans consentement implicite).

**Pourquoi c'est important**:  
Le consentement doit être libre, spécifique, éclairé et traçable.

---

## 2) Court terme (7-30 jours)

### A. Gouvernance des sous-traitants

**À faire**:
1. Vérifier/archiver les DPA (OpenAI, Supabase, Dreamlit).
2. Documenter les transferts internationaux (base juridique, garanties type SCC).
3. Mettre à jour la politique de confidentialité avec ces éléments.

**Pourquoi c'est important**:  
La conformité ne dépend pas que du code. Elle dépend aussi des contrats et du cadre légal.

### B. Traçabilité conformité

**À faire**:
1. Journaliser les preuves de consentement (`policy_version`, `source`, `timestamp`).
2. Tracer les envois email (template, statut, erreurs, idempotence).
3. Conserver une piste d'audit exploitable.

**Pourquoi c'est important**:  
En cas de contrôle, il faut pouvoir démontrer ce qui a été fait, quand, et pourquoi.

### C. Qualité des messages utilisateurs

**À faire**:
1. Éviter les formulations absolues ambiguës (ex: "jamais partagé") si des sous-traitants existent.
2. Expliquer simplement qui traite les données et pour quelle finalité.
3. Harmoniser le wording entre UI, politique et processus réels.

**Pourquoi c'est important**:  
La transparence protège juridiquement et renforce la confiance.

---

## 3) Moyen terme (30-90 jours)

### A. Cycle de vie des données

**À faire**:
1. Définir une durée de conservation par type de donnée.
2. Automatiser purge/anonymisation selon la politique retenue.
3. Vérifier régulièrement que la purge fonctionne réellement.

### B. Droits des personnes (DSAR)

**À faire**:
1. Mettre en place une procédure opérationnelle d'accès/rectification/suppression.
2. Définir un canal de demande et un délai de réponse.
3. Tester la procédure (exercice à blanc).

### C. Sécurité continue

**À faire**:
1. Revue trimestrielle des accès et policies.
2. Revue de dépendances et correctifs de sécurité.
3. Plan de réponse à incident (qui fait quoi, en combien de temps).

---

## Checklist "prêt conformité"

Cochez chaque point avant validation finale:

1. Les accès Supabase publics sont limités au strict minimum.
2. Dreamlit utilise un rôle dédié, pas un accès public générique.
3. L'API d'analyse est protégée contre l'abus (rate limit + monitoring).
4. Les analytics restent désactivés tant qu'il n'y a pas de consentement explicite.
5. Les consentements sont enregistrés avec horodatage et version de policy.
6. Les contrats/DPA des sous-traitants sont signés et archivés.
7. Les transferts internationaux sont documentés et justifiés.
8. La politique de confidentialité reflète fidèlement la réalité technique.
9. Une procédure DSAR existe et a été testée.
10. Une politique de conservation/purge est appliquée techniquement.

---

## Répartition des responsabilités (simple et claire)

1. **Direction**: valide les arbitrages et le niveau de risque acceptable.
2. **Juridique/Compliance**: valide base légale, politique, sous-traitants, transferts.
3. **Marketing/Produit**: garantit la clarté des messages et du consentement.
4. **Tech/Data**: implémente les contrôles (RLS, API, logs, purge, sécurité).
5. **Ops**: surveille, documente, et maintient les preuves d'audit.

---

## Message de sensibilisation à diffuser en interne

"La conformité n'est pas un frein business. C'est un facteur de confiance et de pérennité.  
Un formulaire conforme protège nos utilisateurs, notre marque et notre croissance.  
Chaque choix technique, chaque texte affiché et chaque accès base de données doit pouvoir être justifié simplement."

---

## Note importante

Ce guide est un document de sensibilisation opérationnelle.  
Pour validation juridique finale (notamment sur transferts internationaux, clauses contractuelles et obligations sectorielles), un avis juridique spécialisé reste recommandé.
