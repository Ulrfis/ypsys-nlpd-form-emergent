# Design : Mode Debug avec Popup de Logging

**Date** : 2026-02-02
**Statut** : ✅ Validé
**Type** : Feature provisoire de développement

---

## Vue d'ensemble

Système de debug complet permettant de visualiser en temps réel tous les échanges de données entre l'application, Supabase et OpenAI Assistant, avec une emphase particulière sur les réponses au formulaire et les réponses de l'assistant IA.

### Objectifs

1. Tracer toutes les requêtes/réponses Supabase et OpenAI
2. Visualiser les données du formulaire envoyées
3. Inspecter les réponses complètes de l'assistant OpenAI (JSON brut)
4. Identifier rapidement les erreurs avec codes couleur
5. Persister les logs entre les sessions pour faciliter le debug

---

## 1. Architecture

### Composants principaux

```
src/
├── context/
│   └── DebugContext.jsx          # Context global pour le state de debug
├── lib/
│   ├── debugLogger.js            # Utilitaires de logging
│   ├── supabase.js               # Modifié avec interception
│   └── openai.js                 # Modifié avec interception
└── components/
    └── DebugPanel.jsx            # Interface popup du mode debug
```

### DebugContext (Context API)

**State géré** :
- `isDebugMode` : Boolean (activé/désactivé)
- `logs` : Array de tous les logs capturés
- `filters` : Filtres actifs (par type de service)

**API exposée** :
```javascript
{
  logs: Array,              // Tous les logs
  isDebugMode: Boolean,     // État actuel
  toggleDebugMode: Function,
  addLog: Function,         // Ajouter un log
  updateLog: Function,      // Mettre à jour un log
  clearLogs: Function,      // Vider tous les logs
  filterLogs: Function,     // Filtrer par type
  exportLogs: Function,     // Télécharger JSON
}
```

---

## 2. Format des Logs

### Structure d'un log

```javascript
{
  id: 'log_1234567890_abc',           // ID unique
  timestamp: 1706889234567,            // Unix timestamp
  type: 'supabase' | 'openai',         // Type de service
  operation: 'insert' | 'thread.create' | 'message.send' | 'response',
  status: 'success' | 'error' | 'pending',
  duration: 1234,                      // Durée en ms (null si pending)

  request: {
    endpoint: 'form_submissions',      // Table/endpoint
    method: 'INSERT' | 'SELECT',       // Méthode
    payload: {...},                    // Données envoyées
    headers: {...},                    // Headers (si mode détaillé)
  },

  response: {
    status: 201,                       // Code HTTP
    data: {...},                       // Données reçues
    error: null,                       // Erreur si échec
    headers: {...},                    // Headers (si mode détaillé)
  },

  // Flags pour mise en évidence
  isHighlighted: Boolean,              // true pour formulaire et assistant
  highlightReason: 'form_data' | 'assistant_response' | null,
}
```

### Utilitaires (debugLogger.js)

```javascript
// Créer un nouveau log (status: pending)
createLog(type, operation, request)

// Mettre à jour avec la réponse
updateLog(id, response, duration, status)

// Logger une erreur
logError(error, context)

// Générer ID unique
generateLogId()
```

---

## 3. Interception des Appels

### Supabase (supabase.js)

**Fonction `saveSubmission` modifiée** :

```javascript
export async function saveSubmission(payload, openaiResponse) {
  const { addLog, updateLog, isDebugMode } = useDebugContext();

  if (!isDebugMode) {
    // Comportement normal sans logging
    return originalSaveSubmission(payload, openaiResponse);
  }

  // LOG 1: Insert form_submissions
  const formLogId = addLog({
    type: 'supabase',
    operation: 'insert.form_submissions',
    status: 'pending',
    isHighlighted: true,
    highlightReason: 'form_data',
    request: {
      endpoint: 'form_submissions',
      method: 'INSERT',
      payload: {
        answers: payload.answers,        // ⭐ Réponses formulaire
        score: payload.score,
        user: payload.user,
      }
    }
  });

  const startTime = Date.now();

  // Appel Supabase
  const { data: submission, error: subError } = await supabase
    .from('form_submissions')
    .insert({...})
    .select()
    .single();

  // Mise à jour du log
  updateLog(formLogId, {
    status: subError ? 'error' : 'success',
    response: { data: submission, error: subError },
    duration: Date.now() - startTime
  });

  // LOG 2: Insert email_outputs (si applicable)
  if (payload.has_email && openaiResponse?.email_user) {
    const emailLogId = addLog({...});
    // ... même pattern
  }

  return submission;
}
```

### OpenAI (openai.js)

**Fonction `generateAnalysis` modifiée** :

Points de logging :
1. Thread creation
2. Message sent (avec payload formulaire)
3. Run creation
4. Polling status updates
5. **Assistant response** ⭐ (highlight)

```javascript
export async function generateAnalysis(payload, onStatusUpdate) {
  const { addLog, updateLog, isDebugMode } = useDebugContext();

  // LOG: Thread creation
  const threadLogId = addLog({
    type: 'openai',
    operation: 'thread.create',
    status: 'pending',
    request: { endpoint: 'threads', method: 'POST' }
  });

  const threadStart = Date.now();
  const thread = await openai.beta.threads.create();

  updateLog(threadLogId, {
    status: 'success',
    response: { thread_id: thread.id },
    duration: Date.now() - threadStart
  });

  // LOG: Message sent avec données formulaire
  const msgLogId = addLog({
    type: 'openai',
    operation: 'message.send',
    status: 'pending',
    isHighlighted: true,
    highlightReason: 'form_data',
    request: {
      endpoint: `threads/${thread.id}/messages`,
      method: 'POST',
      payload: payload  // ⭐ Tout le payload formulaire
    }
  });

  await openai.beta.threads.messages.create(thread.id, {
    role: "user",
    content: JSON.stringify(payload, null, 2)
  });

  updateLog(msgLogId, { status: 'success', duration: ... });

  // ... polling du run ...

  // LOG: Assistant response ⭐⭐⭐
  const responseLogId = addLog({
    type: 'openai',
    operation: 'assistant.response',
    status: 'success',
    isHighlighted: true,
    highlightReason: 'assistant_response',
    response: {
      teaser: response.teaser,
      lead_temperature: response.lead_temperature,
      email_user: response.email_user,
      email_sales: response.email_sales,
      full_json: responseText,  // ⭐ JSON brut complet
    },
    duration: Date.now() - analysisStart
  });

  return response;
}
```

---

## 4. Interface Utilisateur (DebugPanel)

### Activation

**Raccourci clavier** : `Cmd+Shift+D` (Mac) ou `Ctrl+Shift+D` (Windows/Linux)

Implémentation dans `App.jsx` :
```javascript
useEffect(() => {
  const handleKeyPress = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'D') {
      e.preventDefault();
      toggleDebugMode();
    }
  };

  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, [toggleDebugMode]);
```

### Layout

Position : **Fixed, bottom-right**

```
┌─────────────────────────────────────────────────┐
│ 🐛 Debug Panel        [Filters] [Clear] [Export] │
│ ─────────────────────────────────────────────── │
│                                                  │
│ [🟢 All] [🔵 OpenAI] [🟠 Supabase] [🔴 Errors]  │
│                                                  │
│ Timeline (scrollable):                          │
│ ┌──────────────────────────────────────────┐   │
│ │ 🟢 14:32:01.234 (+0ms)                   │   │
│ │ Supabase INSERT → form_submissions       │   │
│ │ ⭐ Highlighted: Form Data                │   │
│ │ [▼ Show request details]                 │   │
│ │                                          │   │
│ │ 🔵 14:32:02.456 (+1,222ms)              │   │
│ │ OpenAI Thread Created                   │   │
│ │ thread_abc123xyz                        │   │
│ │ [▼ Show full request/response]          │   │
│ │                                          │   │
│ │ 🔵 14:32:05.789 (+3,333ms)              │   │
│ │ OpenAI Assistant Response ⭐⭐⭐        │   │
│ │ Teaser: "Votre organisation..."         │   │
│ │ Temperature: WARM                        │   │
│ │ [▼ Show full JSON response] [📋 Copy]   │   │
│ │                                          │   │
│ │ 🟢 14:32:06.123 (+334ms)                │   │
│ │ Supabase INSERT → email_outputs         │   │
│ │ [▼ Show details]                         │   │
│ └──────────────────────────────────────────┘   │
│                                                  │
│ 📊 Stats: 5 logs | 4 success | 0 errors         │
└─────────────────────────────────────────────────┘
```

### Codes Couleur

| Couleur | Signification | Utilisation |
|---------|---------------|-------------|
| 🟢 Vert | Succès | Status HTTP 200-299 |
| 🔴 Rouge | Erreur | Status HTTP 400+, exceptions |
| 🟡 Jaune | En cours | Requête pending |
| 🔵 Bleu | Info OpenAI | Logs OpenAI spécifiques |
| 🟠 Orange | Info Supabase | Logs Supabase spécifiques |

### Fonctionnalités Interactives

1. **Toggles extensibles** :
   - Clic sur un log pour expand/collapse
   - Vue compacte par défaut
   - Vue détaillée sur demande

2. **Bouton "Copy JSON"** :
   - Copie le payload ou response complet
   - Format : JSON pretty-printed

3. **Highlight visuels** :
   - Bordure dorée pour logs highlighted
   - Badge ⭐ visible
   - Fond légèrement coloré

4. **Redimensionnable** :
   - Drag sur les bords pour resize
   - Taille min : 400x300px
   - Taille max : 90vw x 90vh

5. **Réductible** :
   - Clic sur header pour minimiser
   - État minimisé : petite icône 🐛 en bas à droite
   - Clic sur icône pour ré-ouvrir

6. **Filtres rapides** :
   - Boutons toggle pour chaque type
   - Combinables (ex: OpenAI + Errors)
   - Compteur de logs visibles

### Styling

- **Framework** : Tailwind CSS (cohérence avec l'app)
- **Positionnement** : `fixed bottom-4 right-4 z-50`
- **Thème** : Support dark/light mode via ThemeContext existant
- **Animations** : Framer Motion pour transitions
- **Scrolling** : Virtual scrolling avec `react-window` si > 50 logs

---

## 5. Persistance (LocalStorage)

### Stratégie

**Clé** : `nlpd_debug_logs`

**Structure** :
```javascript
{
  version: '1.0',
  maxLogs: 100,
  logs: [
    { id, timestamp, type, ... },
    { id, timestamp, type, ... }
  ],
  lastCleared: 1706889234567
}
```

### Cycle de Vie

**Au chargement** :
1. Lire `nlpd_debug_logs` depuis localStorage
2. Parser et valider la structure
3. Supprimer logs > 7 jours
4. Charger dans le state React

**À chaque log** :
1. Ajouter au state React
2. Sauvegarder dans localStorage
3. Si > 100 logs : supprimer les plus anciens

**Au Clear** :
1. Vider le state
2. Vider localStorage
3. Mettre à jour `lastCleared`

**À l'export** :
1. Générer JSON pretty-printed
2. Nom fichier : `debug-logs-${YYYY-MM-DD}-${HHmmss}.json`
3. Téléchargement automatique via `<a download>`

### Gestion de l'espace

- **Taille estimée** : ~500KB pour 100 logs complets
- **Limite stricte** : Max 100 logs
- **Nettoyage auto** : Logs > 7 jours supprimés
- **Compression** : JSON.stringify sans formatting pour économiser l'espace

### Bouton Clear

- Position : Header du popup
- Confirmation requise : Dialog "Supprimer tous les logs ?"
- Actions : [Annuler] [Supprimer]

---

## 6. Ordre d'Implémentation

### Phase 1 : Fondations
1. ✅ Créer `DebugContext.jsx` avec state minimal
2. ✅ Créer `debugLogger.js` avec utilitaires de base
3. ✅ Ajouter raccourci clavier pour toggle

### Phase 2 : Logging
4. ✅ Modifier `supabase.js` pour intercepter `saveSubmission`
5. ✅ Modifier `openai.js` pour intercepter `generateAnalysis`
6. ✅ Tester la capture des logs

### Phase 3 : UI Basique
7. ✅ Créer `DebugPanel.jsx` avec layout de base
8. ✅ Afficher timeline chronologique simple
9. ✅ Implémenter codes couleur

### Phase 4 : Features Avancées
10. ✅ Ajouter toggles extensibles
11. ✅ Implémenter filtres (All, OpenAI, Supabase, Errors)
12. ✅ Ajouter bouton "Copy JSON"
13. ✅ Highlight pour logs importants

### Phase 5 : Persistance
14. ✅ Implémenter localStorage read/write
15. ✅ Ajouter bouton Clear avec confirmation
16. ✅ Ajouter export JSON

### Phase 6 : Polish
17. ✅ Rendre le popup redimensionnable
18. ✅ Ajouter mode réduit (icône seule)
19. ✅ Support dark/light mode
20. ✅ Animations avec Framer Motion

---

## 7. Considérations Techniques

### Performance

- **Logging conditionnel** : Seulement si `isDebugMode === true`
- **Memoization** : `useMemo` pour filtres et transformations
- **Virtual scrolling** : `react-window` si > 50 logs
- **Debounce** : Sauvegardes localStorage debounced (300ms)

### Sécurité

⚠️ **Critiques** :
- Ne JAMAIS logger les clés API ou tokens
- Masquer `REACT_APP_OPENAI_API_KEY` dans les logs
- Masquer `REACT_APP_SUPABASE_ANON_KEY` dans les logs
- Ne pas logger les headers d'authentification

**Implémentation** :
```javascript
function sanitizeRequest(request) {
  const sanitized = { ...request };
  if (sanitized.headers?.Authorization) {
    sanitized.headers.Authorization = '[REDACTED]';
  }
  return sanitized;
}
```

### Production

- Le code de debug peut rester en production
- Il est inactif par défaut
- Aucun impact performance si désactivé
- Possibilité de désactiver complètement via variable d'env

### Tests

- Context facilement testable avec providers
- Utilitaires purs testables en isolation
- UI testable avec React Testing Library

---

## 8. Points d'Attention

### Ce qui est logged

✅ **OUI** :
- Payloads de formulaire (réponses utilisateur)
- Scores calculés
- Réponses de l'assistant OpenAI (teaser, température, emails)
- JSON brut complet de OpenAI
- Erreurs avec stack traces
- Timestamps et durées

❌ **NON** :
- Clés API
- Tokens d'authentification
- Headers sensibles
- Données personnelles si non nécessaire

### Limitations connues

- LocalStorage limité à ~5-10MB selon navigateur
- Virtual scrolling requis pour > 100 logs
- Pas de streaming en temps réel (refresh manuel si popup fermé)

### Évolutions futures possibles

- Export vers fichier CSV
- Recherche full-text dans les logs
- Graphiques de performance (timeline visuelle)
- Comparaison entre sessions
- Partage de logs (lien temporaire)

---

## 9. Exemples de Logs

### Log Supabase (Succès)

```json
{
  "id": "log_1706889234567_abc",
  "timestamp": 1706889234567,
  "type": "supabase",
  "operation": "insert.form_submissions",
  "status": "success",
  "duration": 234,
  "isHighlighted": true,
  "highlightReason": "form_data",
  "request": {
    "endpoint": "form_submissions",
    "method": "INSERT",
    "payload": {
      "user_email": "user@example.com",
      "answers": {
        "q1": "Oui",
        "q2": "Non",
        "q3": "Partiellement"
      },
      "score_normalized": 6.5,
      "risk_level": "orange"
    }
  },
  "response": {
    "status": 201,
    "data": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "created_at": "2026-02-02T14:32:01.234Z"
    },
    "error": null
  }
}
```

### Log OpenAI (Réponse Assistant)

```json
{
  "id": "log_1706889237890_xyz",
  "timestamp": 1706889237890,
  "type": "openai",
  "operation": "assistant.response",
  "status": "success",
  "duration": 3333,
  "isHighlighted": true,
  "highlightReason": "assistant_response",
  "request": {
    "endpoint": "threads/thread_abc123/messages",
    "method": "GET"
  },
  "response": {
    "status": 200,
    "data": {
      "teaser": "Votre organisation obtient un score de 6.5/10...",
      "lead_temperature": "WARM",
      "email_user": {
        "subject": "Votre diagnostic nLPD",
        "body_markdown": "Bonjour,\n\nVoici votre rapport..."
      },
      "email_sales": {
        "subject": "Nouveau lead WARM",
        "body_markdown": "Entreprise: Acme SA\nScore: 6.5/10..."
      },
      "full_json": "{\"teaser\":\"Votre organisation...\",\"lead_temperature\":\"WARM\",...}"
    },
    "error": null
  }
}
```

### Log Erreur

```json
{
  "id": "log_1706889240123_err",
  "timestamp": 1706889240123,
  "type": "openai",
  "operation": "thread.create",
  "status": "error",
  "duration": 10234,
  "isHighlighted": false,
  "request": {
    "endpoint": "threads",
    "method": "POST"
  },
  "response": {
    "status": null,
    "data": null,
    "error": {
      "message": "Thread creation timeout",
      "stack": "Error: Thread creation timeout\n    at withTimeout..."
    }
  }
}
```

---

## Conclusion

Ce design fournit un système de debug complet, non-intrusif et facilement activable pour tracer tous les échanges de données de l'application. L'emphase sur les données du formulaire et les réponses de l'assistant OpenAI permet un debugging efficace des flux métier critiques.

**Prochaines étapes** :
1. Valider ce design ✅
2. Créer un plan d'implémentation détaillé
3. Implémenter phase par phase
4. Tester sur des sessions réelles de formulaire
