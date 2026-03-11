# Explication client — points à clarifier et choix retenus

## Pourquoi ce document
Ce document explique, en mots simples, les points qui pouvaient prêter à confusion dans le parcours du formulaire, les choix validés, et les autres options possibles si vous souhaitez faire évoluer l'expérience plus tard.

## Processus suivi pour décider
1. Relecture des indications fournies et des écrans concernés.
2. Identification des zones d'ambiguïté qui peuvent changer l'expérience client.
3. Validation explicite des choix prioritaires.
4. Mise en place des choix retenus.
5. Documentation des options non retenues pour garder de la flexibilité.

## Les points qui n'étaient pas totalement clairs

### 1) Quelle version des consignes utiliser pour l'assistant IA
Deux versions des consignes existaient. L'une était plus ancienne, l'autre plus récente avec un résultat plus complet (score sur 100, niveau de priorité, 3 points clés).

### 2) Message affiché juste après l'analyse
Un texte affichait automatiquement une phrase qui pouvait être perçue comme trop alarmante dans certains cas.

### 3) Affichage du texte personnalisé de l'analyse
Il fallait décider si le court message généré par l'assistant IA devait continuer à être visible sur l'écran intermédiaire, ou être remplacé par un texte fixe.

## Choix validés

### Choix A — Utiliser la version la plus récente des consignes IA
Décision: garder la version qui produit un résultat complet et structuré (score sur 100 + niveau + 3 priorités + contenu email).

Pourquoi:
- le résultat est plus lisible pour l'utilisateur;
- la restitution est plus cohérente entre les écrans et les emails;
- cela facilite les améliorations futures sans changer la logique métier.

### Choix B — Remplacer le message fixe par un message adapté au niveau
Décision: sur l'écran intermédiaire, le message doit varier selon le niveau du diagnostic, avec un ton clair mais non anxiogène.

Pourquoi:
- éviter un message unique qui peut sembler trop dur pour certains profils;
- mieux refléter la situation réelle de chaque répondant;
- améliorer la qualité perçue du diagnostic.

### Choix C — Conserver le court texte personnalisé de l'assistant IA
Décision: ce texte reste visible lorsqu'il est disponible.

Pourquoi:
- il rend l'expérience plus personnalisée;
- il crée de la continuité entre le questionnaire et le résultat détaillé;
- il aide à maintenir l'engagement avant la suite du parcours.

## Autres possibilités (si vous souhaitez changer plus tard)

### Option 1 — Revenir à une version plus simple des consignes IA
Conséquence:
- mise en place plus courte;
- mais résultat moins riche et moins précis.

### Option 2 — Utiliser un texte neutre identique pour tous
Conséquence:
- message très stable et facile à contrôler;
- mais moins personnalisé.

### Option 3 — Supprimer complètement le message intermédiaire
Conséquence:
- parcours plus direct;
- mais moins d'explication avant la demande de coordonnées.

### Option 4 — Afficher le texte personnalisé seulement s'il passe une validation éditoriale
Conséquence:
- meilleur contrôle de ton;
- mais une règle supplémentaire à gérer.

### Option 5 — Version plus créative et engageante (future itération)
Exemples possibles:
- message intermédiaire avec progression visuelle en 3 étapes (diagnostic, priorités, plan d'action);
- texte plus motivant orienté bénéfices ("ce que vous pouvez améliorer rapidement");
- mise en scène légère du résultat (apparition progressive des informations).

Conséquence:
- expérience plus mémorable;
- mais besoin de tests utilisateurs pour valider la compréhension.

## Ce que cela change concrètement pour le client final
- Le parcours reste fluide et compréhensible.
- Le ton est plus juste (ni trop alarmiste, ni trop vague).
- Le résultat final est plus utile pour décider des prochaines actions.
- Les futures évolutions restent possibles sans repartir de zéro.

## Règle de lecture recommandée
Si vous devez arbitrer rapidement:
- priorité à la clarté pour l'utilisateur final;
- puis cohérence entre l'écran et l'email;
- enfin simplicité de maintenance.

