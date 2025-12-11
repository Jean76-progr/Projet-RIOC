# Explanation – Éléments complémentaires au projet éditeur visuel

Ce document présente les aspects explicatifs qui influencent le projet, mais qui ne font pas directement partie du code source.

## 1. Contraintes Techniques
Le choix des technologies (React, TypeScript, Zustand, Dexie, Monaco Editor, Tailwind) repose sur :
- la nécessité d’un rendu dynamique et performant (Virtual DOM),
- la gestion flexible de l’état global (Zustand),
- la persistance locale obligatoire pour pouvoir sauvegarder des projets sans serveur (IndexedDB),
- la génération de code via un moteur personnalisé.

## 2. Contraintes UX/UI
L’éditeur impose :
- une grille d’alignement, essentielle pour la précision du placement,
- un système de drag-and-drop fluide (dnd-kit),
- un découplage net entre données, logique et interface.

## 3. Inspirations fonctionnelles
Le RIOC se base sur des concepts existants :
- Webflow : éditeur professionnel no-code,
- Figma : manipulation visuelle intuitive,
- VS Code : éditeur de code avancé.

Ces comparatifs ont permis d’adopter :
- un éditeur intégré (Monaco),
- un modèle hiérarchique d’éléments,
- un moteur de génération exportable.

## 4. Contraintes futures
Le projet a été pensé pour :
- pouvoir intégrer un export ZIP,
- permettre l’import de widgets personnalisés,
- ajouter une structure multi-pages.
