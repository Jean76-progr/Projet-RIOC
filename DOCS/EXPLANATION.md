# Explanation – Projet Editeur-Visuel

Ce document présente les éléments explicatifs et contextuels qui influencent le projet **Editeur-Visue**, sans faire partie directement du code source.  
Il vise à justifier les choix techniques, organisationnels et conceptuels réalisés au cours du développement.

---

## 1. Contexte et objectifs du projet

Le projet **Editeur-Visuel** a pour objectif de concevoir un outil web permettant la création d’interfaces HTML/CSS via une approche **visuelle et interactive**, sans nécessiter de connaissances avancées en développement web.

Les objectifs principaux sont :
- réduire la barrière technique à la création d’interfaces web,
- proposer un outil intuitif basé sur le glisser-déposer,
- générer un code HTML/CSS exploitable, lisible et modifiable,
- permettre une sauvegarde locale sans dépendance à un serveur distant.

---

## 2. Choix d’architecture globale

### 2.1 Architecture front-end uniquement

Le projet repose volontairement sur une **architecture 100 % front-end**.

Justifications :
- absence de contraintes liées à un backend (déploiement simplifié),
- fonctionnement hors ligne possible,
- stockage local suffisant pour un éditeur mono-utilisateur,
- cohérence avec l’objectif pédagogique du projet.

La persistance des données est assurée par **IndexedDB**, via la bibliothèque Dexie.js.

---

## 3. Choix technologiques et justifications

### 3.1 React + TypeScript
- React permet une architecture modulaire basée sur des composants.
- Le Virtual DOM assure de bonnes performances malgré les interactions fréquentes.
- TypeScript apporte :
  - sécurité de typage,
  - meilleure lisibilité,
  - détection d’erreurs à la compilation.

### 3.2 Zustand (gestion de l’état global)
Zustand a été choisi pour :
- sa simplicité par rapport à Redux,
- l’absence de boilerplate,
- une gestion claire de l’état global :
  - éléments du canvas,
  - sélection,
  - propriétés,
  - synchronisation avec l’éditeur de code.

### 3.3 dnd-kit (Drag & Drop)
Le système de glisser-déposer est un élément central du projet.

dnd-kit permet :
- une gestion fine des événements de drag,
- une bonne compatibilité React,
- une architecture flexible (sensors, collision detection).

### 3.4 TailwindCSS
TailwindCSS a été retenu pour :
- accélérer le développement de l’interface,
- garantir une cohérence visuelle,
- limiter la dette CSS,
- permettre un mapping plus simple entre styles visuels et styles générés.

### 3.5 Monaco Editor
Monaco Editor (éditeur de VS Code) est utilisé pour :
- offrir une édition avancée du code généré,
- bénéficier de la coloration syntaxique,
- rapprocher l’expérience utilisateur d’un environnement professionnel.

---

## 4. Génération automatique du code HTML/CSS

Un point clé du projet est la **transformation d’un modèle visuel en code**.

Principe :
- chaque élément du canvas est représenté par un objet typé,
- cet objet contient :
  - son type (div, button, text…),
  - ses propriétés,
  - son style,
- un moteur de génération parcourt ces objets et produit :
  - une structure HTML cohérente,
  - un ensemble de styles CSS correspondants.

Ce mécanisme permet :
- une synchronisation visuel ↔ code,
- un export propre,
- une évolution future vers des formats plus complexes (multi-pages, composants personnalisés).

---

## 5. Contraintes UX / UI

Plusieurs contraintes ont guidé la conception de l’interface :

- nécessité d’un **canvas clair et lisible**,
- alignement précis des éléments via une grille (snap-to-grid),
- retour visuel immédiat lors des interactions,
- séparation claire entre :
  - zone de création (Canvas),
  - bibliothèque de composants (Sidebar),
  - configuration (Properties Panel),
  - code (Code Editor).

---

## 6. Contraintes pédagogiques et organisationnelles

Le projet a été développé dans un cadre académique, ce qui implique :
- une architecture lisible et justifiable,
- une documentation claire et structurée,
- une séparation nette entre :
  - code,
  - documentation,
  - éléments explicatifs.

La création de fichiers dédiés (`README.md`, `How-To-Guides.md`, `Explanation.md`) répond à cette exigence.

---

## 7. Inspirations et références fonctionnelles

Le projet s’inspire de plusieurs outils existants :
- **Webflow** : éditeur no-code professionnel,
- **Figma** : manipulation visuelle intuitive,
- **VS Code** : édition de code avancée.

Ces inspirations ont guidé :
- le choix d’un éditeur intégré,
- la manipulation directe des éléments,
- la génération de code exploitable.

---

## 8. Limites actuelles du projet

À l’état actuel, le projet présente certaines limites :
- pas de gestion multi-utilisateurs,
- pas de backend,
- export limité au HTML/CSS simple,
- absence de gestion multi-pages.

Ces limites sont connues et assumées dans le cadre du périmètre initial.

---

## 9. Évolutions possibles

Le projet a été conçu pour permettre des évolutions futures :
- ajout d’un export ZIP,
- import/export de composants personnalisés,
- gestion multi-pages,
- intégration d’un backend pour la collaboration,
- ajout de templates prédéfinis.

---

## 10. Conclusion

Le projet **Editeur-Visuel** repose sur des choix techniques et conceptuels cohérents avec ses objectifs :
- simplicité d’utilisation,
- robustesse technique,
- lisibilité du code généré,
- conformité aux contraintes pédagogiques.
