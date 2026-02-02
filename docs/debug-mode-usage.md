# Guide d'utilisation du Mode Debug

## Vue d'ensemble

Le mode debug est une fonctionnalité de développement qui permet de visualiser en temps réel tous les échanges de données entre l'application et les services externes (Supabase et OpenAI Assistant API).

## Activation du Mode Debug

### Paramètre URL

Ajouter `?debug=true` à l'URL de l'application :

```
http://localhost:3000?debug=true
```

Le panneau de debug s'ouvre automatiquement depuis le côté droit de l'écran avec une animation fluide.

### Désactivation

- Cliquer sur le bouton ❌ en haut à droite du panneau
- Cliquer sur le fond assombri à l'extérieur du panneau
- Retirer le paramètre `?debug=true` de l'URL et recharger la page

## Interface du Panneau Debug

### En-tête

L'en-tête affiche :
- **Titre** : "Debug Panel"
- **Compteur** : Nombre total de logs capturés
- **Indication** : Instructions pour fermer le panneau

### Barre d'outils

Deux types de filtres sont disponibles :

- **🗄️ Supabase** : Affiche uniquement les logs Supabase (vert)
- **🧠 OpenAI** : Affiche uniquement les logs OpenAI (bleu)

Cliquer sur un filtre pour le basculer. Par défaut, tous les logs sont affichés.

#### Boutons d'action

- **📥 Exporter JSON** : Télécharge tous les logs au format JSON
- **🗑️ Effacer** : Supprime tous les logs (confirmation requise via localStorage)

### Zone de logs

Les logs sont affichés en ordre chronologique (le plus récent en haut).

## Anatomie d'un Log

Chaque log affiche les informations suivantes :

### Badges et métadonnées

- **Type** : `supabase` (vert) ou `openai` (bleu)
- **Timestamp** : Heure précise avec millisecondes (format : HH:mm:ss.SSS)
- **Durée** : Temps d'exécution en millisecondes
- **Statut** : `SUCCESS` (vert), `ERROR` (rouge), ou `PENDING` (jaune)

### Logs mis en évidence (⭐)

Deux types de logs sont automatiquement mis en évidence avec un badge jaune :

1. **Form Data** : Données de soumission du formulaire vers Supabase
2. **OpenAI Response** : Réponse complète de l'Assistant OpenAI

Ces logs sont encadrés en jaune pour faciliter leur identification.

### Détails du log (expandable)

Cliquer sur le chevron (▼/▲) pour afficher/masquer les détails complets :

#### Section Request
```json
{
  "endpoint": "form_submissions",
  "method": "INSERT",
  "payload": {
    "user": { ... },
    "score": { ... },
    "answers": { ... }
  }
}
```

#### Section Response

**En cas de succès** :
```json
{
  "data": {
    "id": "...",
    "created_at": "...",
    // autres champs
  }
}
```

**En cas d'erreur** :
```json
{
  "error": {
    "message": "...",
    "code": "...",
    // autres détails
  }
}
```

## Types de logs Supabase

### 1. Insert form_submissions (⭐ mis en évidence)

Enregistrement de la soumission du formulaire.

**Payload** :
- Réponses au questionnaire
- Score calculé
- Informations utilisateur

### 2. Insert email_outputs

Enregistrement des emails générés par OpenAI.

**Payload** :
- ID de soumission
- Température du lead
- Sujets et corps des emails

## Types de logs OpenAI

### 1. threads.create

Création d'un thread de conversation avec l'Assistant.

### 2. threads.messages.create

Envoi des données du formulaire à l'Assistant.

**Payload** :
- Résumé des données utilisateur
- Score de conformité
- Nombre de réponses

### 3. threads.runs.create

Démarrage de l'analyse par l'Assistant.

### 4. threads.runs.retrieve (multiple)

Vérification de l'état d'avancement de l'analyse (polling).

**Chaque poll affiche** :
- Numéro du poll (1, 2, 3...)
- Statut actuel (`queued`, `in_progress`, `completed`)

### 5. threads.messages.list

Récupération des messages après analyse complète.

### 6. assistant.response.complete (⭐ mis en évidence)

Réponse finale de l'Assistant avec toutes les données générées.

**Contient** :
- Teaser complet
- Température du lead (HOT/WARM/COLD)
- Emails utilisateur et sales
- Réponse brute complète

### 7. assistant.response.parse_failed (⭐ mis en évidence)

Erreur de parsing de la réponse JSON.

**Contient** :
- Extrait du texte brut (500 premiers caractères)
- Message d'erreur

### 8. assistant.error

Erreur générale de l'API OpenAI.

**Contient** :
- Message d'erreur
- Stack trace

## Persistance des logs

### LocalStorage

Les logs sont automatiquement sauvegardés dans le localStorage du navigateur.

**Clé** : `nlpd_debug_logs`

### Limites

- **Maximum** : 100 logs
- **Durée** : 7 jours
- **Rotation** : Les anciens logs sont automatiquement supprimés

Lorsque la limite est atteinte, les logs les plus anciens sont supprimés pour faire place aux nouveaux.

### Nettoyage automatique

Au démarrage de l'application, les logs de plus de 7 jours sont automatiquement effacés.

## Export des logs

### Format JSON

Cliquer sur "Exporter JSON" télécharge un fichier avec le format suivant :

```json
{
  "export_date": "2026-02-02T14:30:00.000Z",
  "total_logs": 42,
  "logs": [
    {
      "id": "log_1738502400000_abc123",
      "timestamp": 1738502400000,
      "type": "supabase",
      "operation": "insert.form_submissions",
      "status": "success",
      "duration": 245,
      "request": { ... },
      "response": { ... },
      "isHighlighted": true,
      "highlightReason": "form_data"
    },
    // ... autres logs
  ]
}
```

### Utilisation de l'export

L'export JSON peut être utilisé pour :
- Déboguer des problèmes en production
- Analyser les performances (durées)
- Partager des logs avec l'équipe
- Archiver les sessions de test

## Cas d'usage

### 1. Vérifier que les données du formulaire sont correctement envoyées

1. Activer le mode debug (ajouter `?debug=true` à l'URL)
2. Remplir et soumettre le formulaire
3. Chercher le log **⭐ Form Data** (badge jaune)
4. Vérifier que toutes les réponses sont présentes dans le payload

### 2. Déboguer une erreur OpenAI

1. Activer le mode debug
2. Soumettre le formulaire
3. Observer la séquence de logs OpenAI :
   - `threads.create` : Thread créé ?
   - `threads.messages.create` : Message envoyé ?
   - `threads.runs.create` : Run démarré ?
   - Polls : Combien de temps l'analyse prend-elle ?
   - `assistant.response.complete` : Réponse reçue ?

### 3. Analyser les performances

1. Activer le mode debug
2. Effectuer une soumission complète
3. Noter les durées de chaque opération :
   - Supabase INSERT : ~ 200-500 ms
   - OpenAI thread creation : ~ 300-800 ms
   - OpenAI run (total avec polls) : ~ 15-45 secondes

### 4. Examiner la réponse complète de l'Assistant

1. Chercher le log **⭐ OpenAI Response**
2. Développer le log (cliquer sur ▼)
3. Examiner la section Response > data > full_response
4. Vérifier :
   - Le teaser est-il cohérent ?
   - La température du lead est-elle correcte ?
   - Les emails sont-ils bien formatés ?

## Mode sombre

Le panneau debug s'adapte automatiquement au thème de l'application (clair/sombre).

## Limitations connues

### Performances

- L'affichage de plus de 50 logs peut ralentir l'interface
- Utiliser les filtres pour améliorer les performances

### Sécurité

- **Ne jamais activer en production**
- Les API keys sont automatiquement masquées dans les logs
- Les headers `Authorization` sont remplacés par `[REDACTED]`

### Compatibilité navigateurs

- Chrome/Edge : ✅ Complet
- Firefox : ✅ Complet
- Safari : ✅ Complet
- IE11 : ❌ Non supporté

## Dépannage

### Le panneau ne s'ouvre pas

1. Vérifier que le raccourci clavier fonctionne dans votre navigateur
2. Essayer de cliquer en dehors d'un champ de saisie
3. Vérifier la console JavaScript pour des erreurs

### Les logs ne s'affichent pas

1. Vérifier que l'opération a bien été exécutée (pas d'erreur en console)
2. Essayer de désactiver puis réactiver le mode debug
3. Effacer les logs et réessayer

### L'export JSON échoue

1. Vérifier les permissions de téléchargement du navigateur
2. Essayer dans un onglet de navigation privée
3. Vérifier qu'il y a au moins un log à exporter

## Désinstallation

Le mode debug peut être désactivé en supprimant :
1. Le raccourci clavier dans `FormFlow.jsx`
2. L'import et le rendu de `<DebugPanel />`
3. Les appels à `addDebugLog` et `updateDebugLog` dans les modules

Pour nettoyer complètement :
```bash
# Supprimer les fichiers debug
rm frontend/src/components/DebugPanel.jsx
rm frontend/src/lib/debugLogger.js
rm frontend/src/context/DebugContext.jsx

# Nettoyer localStorage dans la console navigateur
localStorage.removeItem('nlpd_debug_logs');
```

## Support

Pour toute question ou problème :
- Consulter le code source dans `frontend/src/components/DebugPanel.jsx`
- Consulter la documentation technique dans `docs/plans/2026-02-02-debug-mode-design.md`
- Ouvrir une issue sur le dépôt GitHub
