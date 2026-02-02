# Design : Améliorations Homepage et Résultats

**Date** : 2026-02-02
**Statut** : Validé
**Auteur** : Claude Code + Ulrich Fischer

---

## Contexte

Modifications demandées par le client pour améliorer l'expérience utilisateur du formulaire nLPD Ypsys :
- Simplification de la page d'accueil avec logo professionnel
- Amélioration visuelle des résultats avec gauge interactif
- Simplification du formulaire de capture
- Intégration d'un calendrier de réservation

---

## 1. Page d'Accueil (LandingPage.jsx)

### 1.1 Logo Ypsys
**Fichier** : `frontend/src/components/LandingPage.jsx` (lignes 18-24)

**Changement** :
- Remplacer l'icône Shield par le logo PNG Ypsys
- Fichier à ajouter : `frontend/public/logo-ypsys.png`
- Dimensions : ~200-250px de largeur, hauteur automatique
- Centré en haut de page

**Code actuel** :
```jsx
<div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
  <Shield className="w-7 h-7 text-primary-foreground" />
</div>
<span className="text-2xl font-bold">Ypsys</span>
```

**Nouveau code** :
```jsx
<img
  src="/logo-ypsys.png"
  alt="Ypsys - time for real performance"
  className="h-16 md:h-20 w-auto"
/>
```

### 1.2 Statistiques 90% / 70%
**Fichier** : `frontend/src/components/LandingPage.jsx` (lignes 39-62)

**Changement** :
- **Supprimer** : Les deux Card components avec bordures colorées
- **Remplacer par** : Paragraphe narratif avec pourcentages en gras

**Nouveau design** :
```jsx
<motion.div className="text-center mb-10">
  <p className="text-xl md:text-2xl text-foreground leading-relaxed max-w-3xl mx-auto">
    <span className="text-3xl md:text-4xl font-extrabold text-warning">90%</span>{' '}
    des PME suisses pensent être conformes, mais{' '}
    <span className="text-3xl md:text-4xl font-extrabold text-danger">70%</span>{' '}
    ne le sont pas réellement
  </p>
</motion.div>
```

### 1.3 Section "La différence"
**Fichier** : `frontend/src/components/LandingPage.jsx` (lignes 86-104)

**Changements** :
- **Supprimer** : Le titre "La différence?"
- **Modifier** : Le texte du paragraphe
- **Garder** : La structure avec icône AlertTriangle et Card

**Nouveau texte** :
```jsx
<p className="text-sm text-muted-foreground">
  Elles découvrent leurs failles trop tard : après un{' '}
  <strong>incident de sécurité</strong>, ou lors d'une{' '}
  <strong>réclamation d'un patient/client</strong>.
</p>
```

---

## 2. Page des Résultats (ResultsPreview.jsx)

### 2.1 Nouveau Composant : ScoreGauge
**Fichier à créer** : `frontend/src/components/ScoreGauge.jsx`

**Spécifications** :
- Gauge semi-circulaire (demi-cercle)
- 3 zones colorées :
  - **Rouge** (0-30%) : danger - `#ef4444`
  - **Orange** (31-69%) : warning - `#f59e0b`
  - **Vert** (70-100%) : success - `#10b981`
- Aiguille/indicateur pointant vers le score
- Pourcentage affiché au centre en grand (text-4xl ou text-5xl)
- Animation d'entrée avec Framer Motion

**Props** :
```typescript
interface ScoreGaugeProps {
  score: number;        // 0-100
  size?: number;        // default: 200
  animated?: boolean;   // default: true
}
```

**Bibliothèque recommandée** :
- Option 1 : Recharts avec RadialBarChart customisé
- Option 2 : SVG custom avec animations Framer Motion
- Option 3 : react-circular-progressbar adaptée

### 2.2 Intégration du Gauge
**Fichier** : `frontend/src/components/ResultsPreview.jsx`

**Changements** :
- Remplacer la Card du score (lignes 77-89)
- Intégrer le composant ScoreGauge
- Afficher le pourcentage à côté du gauge

**Structure** :
```jsx
<div className="flex flex-col items-center mb-6">
  <ScoreGauge score={score.normalized * 10} />
  <p className="text-sm text-muted-foreground mt-4">
    Votre score de conformité
  </p>
</div>
```

### 2.3 Nouveaux Textes par Niveau
**Fichier** : `frontend/src/components/ResultsPreview.jsx` (lignes 92-117)

**Logique de scoring** :
- **Attention** (rouge) : score 0-3/10 (0-30%)
- **Vigilance** (orange) : score 4-6/10 (40-69%)
- **Conforme** (vert) : score 7-10/10 (70-100%)

**Textes** :

**Niveau Attention (rouge)** :
```
Attention {firstName}! Votre organisation présente un score de {score}%,
révélant des failles critiques dans votre conformité nLPD. Un audit du
PFPDT pourrait entraîner des sanctions allant jusqu'à CHF 250'000. Pour
éviter toute sanction et/ou amende, il est fortement conseillé de
commencer une mise en conformité. Demandez votre rapport complet gratuit.
```

**Niveau Vigilance (orange)** :
```
Votre organisation obtient un score de {score}%. Des lacunes significatives
ont été identifiées dans votre conformité nLPD. Sans action corrective,
vous pourriez être exposé à des sanctions et/ou amendes en cas d'audit du
PFPDT ou d'incident de sécurité. Demandez votre rapport complet gratuit.
```

**Niveau Conforme (vert)** :
```
Bravo {firstName}! Votre organisation obtient un score de {score}%, ce qui
indique une bonne maîtrise des exigences nLPD. Quelques ajustements mineurs
pourraient renforcer encore votre conformité. Consultez votre email pour un
rapport détaillé avec des recommandations personnalisées. Demandez votre
rapport complet gratuit.
```

**Note** : Utiliser le prénom si disponible, sinon juste "Votre organisation"

---

## 3. Formulaire de Capture (LeadCaptureForm.jsx)

### 3.1 Réorganisation des Champs
**Fichier** : `frontend/src/components/LeadCaptureForm.jsx`

**Champs obligatoires** :
1. **Nom** (lastName) - ligne 42 → devient obligatoire
2. **Nom de l'entreprise** (companyName) - ligne 161 → devient obligatoire
3. **Email professionnel** (email) - ligne 44

**Champs optionnels** (dans le collapsible) :
- Prénom (firstName) - ligne 41 → devient optionnel
- Taille entreprise (companySize)
- Secteur (industry)
- Canton (canton)

### 3.2 Modification du Texte de Consentement
**Fichier** : `frontend/src/components/LeadCaptureForm.jsx` (ligne 260)

**Ancien texte** :
```
J'accepte de recevoir mes résultats et des recommandations pour
sécuriser ma conformité nLPD.
```

**Nouveau texte** :
```
J'accepte de recevoir mes résultats pour sécuriser la conformité nLPD
de ma société/cabinet et d'être contacté par YPSYS.
```

### 3.3 Validation Form
Mettre à jour la fonction `validateForm()` :
- Ajouter validation pour `lastName` (obligatoire)
- Ajouter validation pour `companyName` (obligatoire)
- Retirer validation pour `firstName` (optionnel)

---

## 4. Page de Remerciement (ThankYouPage.jsx)

### 4.1 Intégration Calendrier
**Fichier** : `frontend/src/components/ThankYouPage.jsx`

**Ajout** : Intégration iframe calendrier de réservation

**URL provisoire** : `https://tidycal.com/memoways/30min`
**URL finale** : À remplacer par le calendrier Booking Me définitif

**Structure** :
```jsx
<Card className="border-2 border-border shadow-elegant mt-8">
  <CardHeader>
    <CardTitle>Réservez votre consultation gratuite</CardTitle>
    <CardDescription>
      Discutons de vos résultats et de votre plan d'action personnalisé
    </CardDescription>
  </CardHeader>
  <CardContent>
    <div className="w-full h-[600px] rounded-lg overflow-hidden">
      <iframe
        src="https://tidycal.com/memoways/30min"
        width="100%"
        height="600"
        frameBorder="0"
        title="Réservation de consultation"
      />
    </div>
  </CardContent>
</Card>
```

**Fallback** :
Si l'iframe ne charge pas, afficher un bouton :
```jsx
<Button variant="premium" size="lg" asChild>
  <a href="https://tidycal.com/memoways/30min" target="_blank" rel="noopener">
    Réserver un rendez-vous
  </a>
</Button>
```

### 4.2 Améliorations Textes
- Personnaliser avec le prénom/nom de l'utilisateur
- Rappeler l'email où le rapport a été envoyé
- Ajouter note : "Nos experts Ypsys sont à votre disposition"

---

## Fichiers à Modifier

| Fichier | Action | Priorité |
|---------|--------|----------|
| `frontend/public/logo-ypsys.png` | Ajouter | Haute |
| `frontend/src/components/LandingPage.jsx` | Modifier | Haute |
| `frontend/src/components/ScoreGauge.jsx` | Créer | Haute |
| `frontend/src/components/ResultsPreview.jsx` | Modifier | Haute |
| `frontend/src/components/LeadCaptureForm.jsx` | Modifier | Moyenne |
| `frontend/src/components/ThankYouPage.jsx` | Modifier | Moyenne |

---

## Tests à Effectuer

### Tests Visuels
- [ ] Logo Ypsys s'affiche correctement sur desktop et mobile
- [ ] Stats 90%/70% sont lisibles et bien mises en valeur
- [ ] Gauge semi-circulaire s'anime correctement
- [ ] Les 3 zones de couleur (rouge/orange/vert) sont clairement visibles
- [ ] Formulaire simplifié est user-friendly

### Tests Fonctionnels
- [ ] Validation du formulaire avec nouveaux champs obligatoires
- [ ] Textes de résultats changent selon le score (3 niveaux)
- [ ] Iframe TidyCal se charge correctement
- [ ] Fallback du calendrier fonctionne si iframe fail
- [ ] Personnalisation avec prénom/nom fonctionne

### Tests Responsive
- [ ] Logo adapté sur mobile (taille réduite)
- [ ] Stats 90%/70% lisibles sur petit écran
- [ ] Gauge responsive et centré
- [ ] Iframe calendrier scrollable sur mobile
- [ ] Formulaire utilisable sur mobile

---

## Notes d'Implémentation

### Dépendances potentielles
```json
{
  "recharts": "^2.x" // Si utilisé pour le gauge
  // OU
  "react-circular-progressbar": "^2.x" // Alternative pour gauge
}
```

### Variables CSS à utiliser
- Couleur principale Ypsys : `#C8007F` (magenta)
- Déjà définie dans Tailwind comme `primary`
- Danger : rouge `#ef4444`
- Warning : orange `#f59e0b`
- Success : vert `#10b981`

### Animations Framer Motion
- Gauge : Animation de remplissage progressive (0 → score)
- Durée : 1.5s avec easing "easeOut"
- Délai : 0.5s après apparition de la page

---

## Ordre d'Implémentation Recommandé

1. **Phase 1 : Homepage** (30 min)
   - Ajouter logo PNG
   - Modifier stats 90%/70%
   - Modifier texte "La différence"

2. **Phase 2 : Gauge Component** (1h)
   - Créer ScoreGauge.jsx
   - Implémenter le design semi-circulaire
   - Tests visuels

3. **Phase 3 : Résultats** (45 min)
   - Intégrer ScoreGauge dans ResultsPreview
   - Mettre à jour les textes par niveau
   - Tests avec différents scores

4. **Phase 4 : Formulaire** (30 min)
   - Réorganiser champs obligatoires/optionnels
   - Modifier texte consentement
   - Update validation

5. **Phase 5 : Page Remerciement** (30 min)
   - Intégrer iframe TidyCal
   - Ajouter fallback
   - Tests de chargement

---

## Checklist Finale

- [ ] Tous les fichiers modifiés
- [ ] Logo ajouté et s'affiche
- [ ] Tests visuels passés
- [ ] Tests fonctionnels passés
- [ ] Tests responsive passés
- [ ] Code review
- [ ] Commit avec message descriptif
- [ ] Push vers origin
- [ ] Test sur environnement de preview
- [ ] Validation client

---

**Estimation totale** : ~3-4 heures de développement + tests
