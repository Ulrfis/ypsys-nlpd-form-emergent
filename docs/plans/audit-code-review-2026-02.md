# Audit technique et plan d'amélioration

**Application** : Formulaire nLPD Ypsys  
**Date** : 4 février 2026  
**Périmètre** : Frontend (React), Backend (FastAPI), intégrations (Supabase, OpenAI)  
**Auteur** : Audit automatisé Claude Code + Oracle

---

## Table des matières

1. [Résumé exécutif](#1-résumé-exécutif)
2. [Méthodologie](#2-méthodologie)
3. [Priorité P0 — Corrections critiques](#3-priorité-p0--corrections-critiques)
4. [Priorité P1 — Améliorations importantes](#4-priorité-p1--améliorations-importantes)
5. [Priorité P2 — Nice-to-have](#5-priorité-p2--nice-to-have)
6. [Checklist de validation](#6-checklist-de-validation)

---

## 1. Résumé exécutif

### Points forts identifiés

- ✅ Architecture frontend/backend bien séparée
- ✅ Proxy OpenAI côté backend (clé API non exposée au client)
- ✅ Fallbacks en cas d'erreur OpenAI (teaser généré localement)
- ✅ Validation frontend fonctionnelle (email, champs requis)
- ✅ Logs debug sanitisés pour conformité RGPD/nLPD
- ✅ API admin protégée par `X-API-Key`
- ✅ RLS Supabase activé sur les tables sensibles
- ✅ Design responsive avec approche mobile-first

### Risques principaux

| Catégorie | Risque | Impact |
|-----------|--------|--------|
| Sécurité | Pas de rate limiting sur `/api/analyze` | Coûts OpenAI, DoS |
| Robustesse | `time.sleep` bloque l'event loop async | Dégradation sous charge |
| Sécurité | Messages d'erreur exposent des détails internes | Fuite d'information |
| Responsive | `100vh` cassé sur iOS Safari | UX mobile dégradée |
| Coûts | Génération emails OpenAI avant capture lead | Tokens gaspillés |

---

## 2. Méthodologie

L'audit a couvert :

1. **Revue de code statique** : analyse des fichiers React et FastAPI
2. **Analyse de sécurité** : validation des entrées, exposition des clés, CORS
3. **Test responsive** : breakpoints Tailwind, overflow, accessibilité mobile
4. **Conformité RGPD/nLPD** : référence au document `docs/audit-securite-rgpd-nlpd.md`
5. **Performance** : patterns React, intégrations async

---

## 3. Priorité P0 — Corrections critiques

> **Effort estimé** : 2–4 heures  
> **Impact** : Sécurité, stabilité, conformité

### 3.1 Remplacer `time.sleep` par `asyncio.sleep`

**Fichier** : `backend/server.py` (lignes 301–305)

**Problème** :  
La route `/api/analyze` utilise `time.sleep(1.5)` dans une boucle d'attente. Dans une application FastAPI async, cela **bloque l'event loop** et empêche le serveur de traiter d'autres requêtes pendant l'attente.

**Risque** :  
Sous charge (plusieurs utilisateurs simultanés), le serveur devient non-réactif. Les requêtes s'accumulent et peuvent timeout.

**Solution** :

```python
# Avant
import time
while run.status in ("queued", "in_progress"):
    if time.time() - start > max_wait:
        raise HTTPException(status_code=504, detail="OpenAI analysis timeout")
    time.sleep(1.5)
    run = client.beta.threads.runs.retrieve(thread_id=thread.id, run_id=run.id)

# Après
import asyncio
import time
while run.status in ("queued", "in_progress"):
    if time.time() - start > max_wait:
        raise HTTPException(status_code=504, detail="OpenAI analysis timeout")
    await asyncio.sleep(1.5)
    run = client.beta.threads.runs.retrieve(thread_id=thread.id, run_id=run.id)
```

**Note** : Les appels au SDK OpenAI sont synchrones. Pour une solution complète, utiliser `run_in_executor` ou le client async OpenAI. La correction `asyncio.sleep` est un minimum viable.

---

### 3.2 Ajouter un rate limiting sur `/api/analyze`

**Fichier** : `backend/server.py`

**Problème** :  
Aucune protection contre les abus. Un attaquant peut :
- Générer des coûts OpenAI importants (tokens facturés)
- Saturer le serveur (DoS)
- Épuiser les quotas API

**Risque** :  
Financier (facture OpenAI), disponibilité (service indisponible).

**Solution** : Rate limiter simple en mémoire (IP + fenêtre glissante)

```python
# Ajouter en haut du fichier
from collections import defaultdict
from datetime import datetime, timedelta

# Rate limiting simple (en mémoire)
_rate_limit_store: dict[str, list[datetime]] = defaultdict(list)
RATE_LIMIT_MAX_REQUESTS = 10  # max requêtes par fenêtre
RATE_LIMIT_WINDOW_SECONDS = 60  # fenêtre de 1 minute


def check_rate_limit(client_ip: str) -> bool:
    """Retourne True si la requête est autorisée, False si rate limited."""
    now = datetime.now(timezone.utc)
    window_start = now - timedelta(seconds=RATE_LIMIT_WINDOW_SECONDS)
    
    # Nettoyer les anciennes entrées
    _rate_limit_store[client_ip] = [
        ts for ts in _rate_limit_store[client_ip] if ts > window_start
    ]
    
    if len(_rate_limit_store[client_ip]) >= RATE_LIMIT_MAX_REQUESTS:
        return False
    
    _rate_limit_store[client_ip].append(now)
    return True


# Dans la route /api/analyze
from fastapi import Request

@api_router.post("/analyze")
async def analyze(request: AnalyzeRequest, req: Request):
    client_ip = req.client.host if req.client else "unknown"
    if not check_rate_limit(client_ip):
        raise HTTPException(status_code=429, detail="Too many requests. Please wait.")
    # ... reste de la logique
```

**Évolution possible** : Redis pour persistance multi-instances.

---

### 3.3 Sécuriser les messages d'erreur

**Fichier** : `backend/server.py` (multiples emplacements)

**Problème** :  
`raise HTTPException(status_code=500, detail=str(e))` expose potentiellement :
- Des stack traces
- Des messages SDK (clés partielles, endpoints internes)
- Des détails de configuration

**Risque** :  
Fuite d'information exploitable par un attaquant.

**Solution** :

```python
# Avant
except Exception as e:
    logging.error(f"Error creating submission: {e}")
    raise HTTPException(status_code=500, detail=str(e))

# Après
except Exception as e:
    logging.exception("Error creating submission")  # Log complet côté serveur
    raise HTTPException(
        status_code=500, 
        detail="Une erreur interne s'est produite. Veuillez réessayer."
    )
```

Appliquer ce pattern à toutes les routes : `/api/submissions`, `/api/stats`, `/api/analyze`.

---

### 3.4 Durcir la validation Pydantic backend

**Fichier** : `backend/server.py`

**Problème** :  
Les modèles `AnalyzePayload` acceptent `Dict[str, Any]` sans contraintes. Un attaquant peut :
- Envoyer des payloads énormes (DoS)
- Injecter des données inattendues
- Contourner la validation frontend

**Solution** : Modèles Pydantic stricts

```python
from pydantic import BaseModel, Field, field_validator
from typing import Literal
from enum import Enum


class RiskLevel(str, Enum):
    GREEN = "green"
    ORANGE = "orange"
    RED = "red"


class UserPayload(BaseModel):
    first_name: str = Field(max_length=100)
    last_name: str = Field(default="", max_length=100)
    email: Optional[EmailStr] = None
    company: str = Field(default="Non renseigné", max_length=200)
    size: Optional[str] = Field(default=None, max_length=50)
    industry: Optional[str] = Field(default=None, max_length=100)
    canton: Optional[str] = Field(default=None, max_length=50)


class ScorePayload(BaseModel):
    value: int = Field(ge=0, le=100)
    normalized: float = Field(ge=0, le=10)
    level: RiskLevel


class AnswerDetail(BaseModel):
    question_id: str = Field(pattern=r"^q([1-9]|1[0-5])$")  # q1 à q15
    question: str = Field(max_length=500)
    answer: str = Field(max_length=500)


class AnalyzePayload(BaseModel):
    user: UserPayload
    answers: Dict[str, str] = Field(max_length=15)  # max 15 questions
    score: ScorePayload
    has_email: bool = False
    answers_detailed: Optional[List[AnswerDetail]] = Field(default=None, max_length=15)

    @field_validator("answers")
    @classmethod
    def validate_answers_keys(cls, v):
        allowed_keys = {f"q{i}" for i in range(1, 16)}
        for key in v.keys():
            if key not in allowed_keys:
                raise ValueError(f"Clé de réponse invalide: {key}")
        return v
```

---

### 3.5 Corriger le type checkbox indeterminate

**Fichier** : `frontend/src/components/LeadCaptureForm.jsx` (ligne 69)

**Problème** :  
Le composant `Checkbox` de shadcn/ui peut renvoyer `boolean | "indeterminate"`. Stocker directement cette valeur peut casser la validation ou l'envoi API.

**Solution** :

```jsx
// Avant
onCheckedChange={(checked) => handleChange('consentMarketing', checked)}

// Après
onCheckedChange={(checked) => handleChange('consentMarketing', checked === true)}
```

---

## 4. Priorité P1 — Améliorations importantes

> **Effort estimé** : 4–8 heures  
> **Impact** : UX mobile, performance, observabilité

### 4.1 Corriger `100vh` pour iOS Safari

**Fichier** : `frontend/src/components/FormFlow.jsx` (ligne 261)

**Problème** :  
Sur iOS Safari, `100vh` inclut la barre d'adresse, ce qui crée un overflow vertical. Les utilisateurs doivent scroller pour voir le CTA.

**Solution** :

```jsx
// Avant
<div key="questions" className="h-screen flex flex-col ...">

// Après (Tailwind 3.4+)
<div key="questions" className="min-h-[100dvh] flex flex-col ...">
```

**Alternative CSS** (si Tailwind < 3.4) :

```css
/* Dans index.css */
.h-screen-safe {
  height: 100vh;
  height: 100dvh;
  height: -webkit-fill-available;
}
```

---

### 4.2 Responsive grid dans LeadCaptureForm

**Fichier** : `frontend/src/components/LeadCaptureForm.jsx` (ligne 183)

**Problème** :  
`grid-cols-2` sans breakpoint. Sur petits écrans (< 375px), les champs sont trop serrés.

**Solution** :

```jsx
// Avant
<div className="grid grid-cols-2 gap-4">

// Après
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
```

---

### 4.3 Safe area pour la barre de navigation sticky

**Fichier** : `frontend/src/components/FormFlow.jsx` (ligne 284)

**Problème** :  
Sur iPhone avec encoche/barre Home, le CTA peut être masqué par la zone système.

**Solution** :

```jsx
// Avant
<div className="flex-shrink-0 border-t border-border bg-card/95 backdrop-blur-sm sticky bottom-0">

// Après
<div className="flex-shrink-0 border-t border-border bg-card/95 backdrop-blur-sm sticky bottom-0 pb-[env(safe-area-inset-bottom)]">
```

**Note** : Ajouter aussi dans `index.css` :

```css
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .pb-safe {
    padding-bottom: env(safe-area-inset-bottom);
  }
}
```

---

### 4.4 Améliorer le fallback iframe calendrier

**Fichier** : `frontend/src/components/ThankYouPage.jsx` (lignes 74–100)

**Problème** :  
Le fallback actuel utilise `getElementById` (anti-pattern React) et `onError` sur `iframe` est peu fiable selon les navigateurs/CSP.

**Solution** : State React + timeout

```jsx
import React, { useState, useEffect } from 'react';

export const ThankYouPage = ({ score, priorities, userEmail, onBookConsultation }) => {
  const [calendarFailed, setCalendarFailed] = useState(false);
  const [calendarLoading, setCalendarLoading] = useState(true);

  useEffect(() => {
    // Timeout de sécurité : si l'iframe ne charge pas en 8s, afficher fallback
    const timeout = setTimeout(() => {
      if (calendarLoading) {
        setCalendarFailed(true);
        setCalendarLoading(false);
      }
    }, 8000);
    return () => clearTimeout(timeout);
  }, [calendarLoading]);

  const handleIframeLoad = () => {
    setCalendarLoading(false);
  };

  const handleIframeError = () => {
    setCalendarFailed(true);
    setCalendarLoading(false);
  };

  return (
    // ... reste du composant
    <div className="relative">
      {calendarLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      
      {!calendarFailed ? (
        <iframe
          src={BOOKING_CALENDAR_URL}
          title="Réserver une consultation"
          className="w-full border-0 rounded-lg"
          style={{ height: '600px', minHeight: '600px' }}
          onLoad={handleIframeLoad}
          onError={handleIframeError}
        />
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            Le calendrier ne peut pas être chargé pour le moment.
          </p>
          <Button
            variant="premium"
            size="lg"
            onClick={() => window.open(BOOKING_CALENDAR_URL, '_blank')}
          >
            Ouvrir le calendrier dans un nouvel onglet
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
      
      {/* Bouton fallback toujours visible sur mobile */}
      <div className="mt-4 text-center sm:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(BOOKING_CALENDAR_URL, '_blank')}
        >
          Ouvrir dans un nouvel onglet
        </Button>
      </div>
    </div>
  );
};
```

---

### 4.5 Scinder l'analyse OpenAI (optimisation coûts)

**Fichier** : `backend/server.py`

**Problème** :  
Actuellement, `/api/analyze` génère le teaser + 2 emails longs (8192 tokens max) **avant** la capture du lead. Si l'utilisateur abandonne, les tokens sont perdus.

**Solution** : Deux endpoints

```python
# Endpoint 1 : Preview rapide (avant capture lead)
@api_router.post("/analyze/preview")
async def analyze_preview(request: AnalyzeRequest, req: Request):
    """Génère uniquement le teaser et la température du lead."""
    # ... rate limiting, validation
    # Appel OpenAI avec max_completion_tokens=1024
    # Retourne: { teaser, lead_temperature }


# Endpoint 2 : Analyse complète (après capture lead)
@api_router.post("/analyze/full")
async def analyze_full(request: AnalyzeFullRequest, req: Request):
    """Génère les emails complets après capture du lead."""
    # ... validation, vérification que le lead existe
    # Appel OpenAI avec max_completion_tokens=8192
    # Retourne: { email_user, email_sales }
```

**Impact** : Réduction de 60–80% des coûts OpenAI pour les utilisateurs qui abandonnent.

---

## 5. Priorité P2 — Nice-to-have

> **Effort estimé** : 8–16 heures  
> **Impact** : Maintenabilité, accessibilité, conformité avancée

### 5.1 Refactorer FormFlow avec useReducer

**Problème** :  
`FormFlow.jsx` contient 10+ `useState` et une logique de transition complexe entre les étapes. Risque de bugs d'état et difficile à tester.

**Solution** : Machine à états avec `useReducer`

```jsx
const initialState = {
  step: 'LANDING',
  questionIndex: 0,
  answers: {},
  userData: null,
  score: null,
  teaser: '',
  isAnalyzing: false,
  error: null,
};

function formReducer(state, action) {
  switch (action.type) {
    case 'START_QUESTIONNAIRE':
      return { ...state, step: 'QUESTIONS', questionIndex: 0 };
    case 'ANSWER_QUESTION':
      return { 
        ...state, 
        answers: { ...state.answers, [action.questionId]: action.value }
      };
    case 'NEXT_QUESTION':
      return { ...state, questionIndex: state.questionIndex + 1 };
    case 'PREVIOUS_QUESTION':
      return { ...state, questionIndex: Math.max(0, state.questionIndex - 1) };
    case 'START_ANALYSIS':
      return { ...state, step: 'ANALYZING', isAnalyzing: true };
    case 'ANALYSIS_COMPLETE':
      return { 
        ...state, 
        step: 'RESULTS_PREVIEW', 
        score: action.score,
        teaser: action.teaser,
        isAnalyzing: false 
      };
    // ... autres actions
    default:
      return state;
  }
}
```

---

### 5.2 Accessibilité (a11y)

**Améliorations recommandées** :

1. **Options de réponse** : Ajouter `aria-pressed` ou `role="radio"` avec `aria-checked`
2. **Focus management** : Après changement de question, focus sur le titre
3. **Handler Enter** : Attacher sur un wrapper focusable plutôt que `window`
4. **Skip links** : Lien "Aller au contenu" pour les lecteurs d'écran

```jsx
// QuestionCard.jsx - Exemple d'amélioration
<motion.button
  role="radio"
  aria-checked={isSelected}
  aria-describedby={isSelected ? `feedback-${option.value}` : undefined}
  // ...
>
```

---

### 5.3 Consentement granulaire (RGPD/nLPD)

**Problème** :  
Une seule case combine "recevoir le rapport" et "être contacté par Ypsys". Moins robuste juridiquement.

**Solution** :

```jsx
// Deux cases séparées
<div className="space-y-3">
  <div className="flex items-start gap-3">
    <Checkbox
      id="consent-report"
      checked={formData.consentReport}
      onCheckedChange={(checked) => handleChange('consentReport', checked === true)}
    />
    <Label htmlFor="consent-report">
      J'accepte de recevoir mon rapport de conformité nLPD par email. <span className="text-danger">*</span>
    </Label>
  </div>
  
  <div className="flex items-start gap-3">
    <Checkbox
      id="consent-marketing"
      checked={formData.consentMarketing}
      onCheckedChange={(checked) => handleChange('consentMarketing', checked === true)}
    />
    <Label htmlFor="consent-marketing">
      J'accepte d'être contacté par Ypsys pour des conseils personnalisés (optionnel).
    </Label>
  </div>
</div>
```

**Backend** : Stocker les deux consentements séparément avec horodatage.

---

### 5.4 Tests automatisés

**Tests unitaires recommandés** :

```javascript
// Frontend
describe('calculateScore', () => {
  it('should return green for all positive answers', () => { ... });
  it('should return red for all negative answers', () => { ... });
  it('should handle partial answers', () => { ... });
});

describe('LeadCaptureForm validation', () => {
  it('should require lastName', () => { ... });
  it('should validate email format', () => { ... });
  it('should require consent', () => { ... });
});
```

```python
# Backend
def test_analyze_valid_payload():
    response = client.post("/api/analyze", json=valid_payload)
    assert response.status_code == 200
    assert "teaser" in response.json()

def test_analyze_invalid_payload():
    response = client.post("/api/analyze", json={"invalid": "data"})
    assert response.status_code == 422

def test_analyze_rate_limit():
    for _ in range(15):
        client.post("/api/analyze", json=valid_payload)
    response = client.post("/api/analyze", json=valid_payload)
    assert response.status_code == 429

def test_analyze_openai_timeout():
    # Mock OpenAI pour simuler un timeout
    response = client.post("/api/analyze", json=valid_payload)
    assert response.status_code == 504
```

---

## 6. Checklist de validation

### Après implémentation P0

- [ ] `npm run build` passe sans erreur (frontend)
- [ ] `uvicorn server:app` démarre sans warning (backend)
- [ ] Test manuel : soumission formulaire complète
- [ ] Test manuel : rate limiting (`curl` 15 requêtes rapides → 429)
- [ ] Vérifier les logs Railway : pas de PII, erreurs génériques

### Après implémentation P1

- [ ] Test sur iPhone Safari : CTA visible sans scroll
- [ ] Test sur Android Chrome : formulaire lisible
- [ ] Test calendrier : fallback s'affiche après 8s si bloqué
- [ ] Vérifier les coûts OpenAI : réduction visible après split

### Après implémentation P2

- [ ] Audit Lighthouse Accessibility : score > 90
- [ ] Tests unitaires : couverture > 70%
- [ ] Tests E2E : flow complet passe

---

## Annexes

### A. Commandes utiles

```bash
# Frontend
cd frontend
npm run build          # Build production
npm run dev            # Dev server

# Backend
cd backend
uvicorn server:app --reload  # Dev server
pytest tests/                # Tests (si configurés)

# Déploiement
git push origin main   # Déclenche Railway
```

### B. Références

- [Audit sécurité RGPD/nLPD](./audit-securite-rgpd-nlpd.md)
- [Variables d'environnement Railway](./deployment-railway-env.md)
- [Flux OpenAI et Supabase](./openai-analyze-and-supabase-flow.md)

---

*Document généré le 4 février 2026. Réviser après chaque phase d'implémentation.*
