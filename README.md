```markdown
# EasyFront 🎨

**EasyFront** est un éditeur visuel **drag-and-drop** pour créer des interfaces utilisateur HTML/CSS sans coder. Conçu pour simplifier la création de pages web, il génère automatiquement du code HTML/CSS propre et déployable.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![React](https://img.shields.io/badge/react-18.x-61dafb.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.x-3178c6.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

---

## 🚀 Fonctionnalités principales

### ✨ Interface visuelle intuitive
- **Canvas drag-and-drop** avec grille magnétique
- **Composants HTML prédéfinis** : boutons, inputs, titres, images, etc.
- **Widgets personnalisés** : importez vos propres composants HTML/CSS
- **Redimensionnement en temps réel** avec poignées visuelles
- **Positionnement précis** avec snap-to-grid automatique

### 💻 Génération de code
- **Code HTML/CSS propre** généré automatiquement
- **Éditeur Monaco** (VS Code) intégré pour édition en direct
- **Modification bidirectionnelle** : éditez le CSS, le canvas se met à jour
- **Export facile** : sauvegarde directe sur votre système de fichiers

### 🗂️ Gestion de projets
- **Sauvegarde locale** avec IndexedDB (pas de serveur nécessaire)
- **Gestionnaire de projets** : créer, charger, supprimer
- **Historique des projets** avec dates de création

### 🧩 Système de widgets
- **Importez des fichiers HTML/CSS** depuis votre ordinateur
- **Bibliothèque de widgets** personnalisée et réutilisable
- **Prévisualisation en direct** avant import
- **Catégorisation** pour une organisation optimale

---

## 📦 Technologies utilisées

| Technologie | Version | Description |
|------------|---------|-------------|
| **React** | 18.x | Framework UI principal |
| **TypeScript** | 5.x | Type safety et meilleure DX |
| **Vite** | 5.x | Build tool ultra-rapide |
| **Tailwind CSS** | 3.x | Styling utility-first |
| **Zustand** | 4.x | State management léger |
| **@dnd-kit** | 6.x | Drag & drop moderne |
| **re-resizable** | 6.x | Redimensionnement d'éléments |
| **Monaco Editor** | 0.45.x | Éditeur de code (VS Code) |
| **Dexie.js** | 3.x | IndexedDB simplifié |
| **Lucide React** | - | Icônes modernes |
| **UUID** | 9.x | Génération d'identifiants uniques |

---

## 🛠️ Installation

### Prérequis
- **Node.js** 16.x ou supérieur
- **npm** ou **yarn**

### Étapes d'installation

```bash
# 1. Cloner le repository
git clone https://github.com/votre-username/easyfront.git
cd easyfront

# 2. Installer les dépendances
npm install

# 3. Lancer le serveur de développement
npm run dev

# 4. Ouvrir dans le navigateur
# L'application sera accessible sur http://localhost:5173
```

### Build pour production

```bash
# Créer un build optimisé
npm run build

# Prévisualiser le build
npm run preview
```

---

## 📖 Guide d'utilisation

### 1️⃣ Créer une interface

1. **Glissez-déposez** des composants depuis la sidebar gauche vers le canvas
2. **Redimensionnez** les éléments en tirant sur les poignées
3. **Déplacez** les éléments en les faisant glisser
4. **Supprimez** un élément en le sélectionnant et cliquant sur le bouton ❌

### 2️⃣ Importer des widgets personnalisés

1. Cliquez sur l'onglet **"Widgets"** dans la sidebar
2. Cliquez sur **"Importer un widget"**
3. Sélectionnez un fichier **HTML** ou **CSS** depuis votre ordinateur
4. Le code est automatiquement extrait et une prévisualisation s'affiche
5. Cliquez sur **"Importer le widget"**
6. Glissez-déposez votre widget sur le canvas

**Exemple de fichier HTML à importer :**

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    .card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
      border-radius: 12px;
      color: white;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
    }
    .card h2 {
      margin: 0 0 10px 0;
      font-size: 24px;
    }
    .card p {
      margin: 0;
      opacity: 0.9;
    }
  </style>
</head>
<body>
  <div class="card">
    <h2>Widget personnalisé</h2>
    <p>Ceci est un exemple de widget importé</p>
  </div>
</body>
</html>
```

### 3️⃣ Éditer le code

1. Ouvrez l'éditeur de code à droite
2. Basculez entre les onglets **HTML** et **CSS**
3. **Modifiez le CSS** → le canvas se met à jour en temps réel
4. Copiez le code avec le bouton **"Copier"**

### 4️⃣ Sauvegarder et exporter

#### Sauvegarde locale (IndexedDB)
1. Cliquez sur **"Projets"**
2. Cliquez sur **"Créer un nouveau projet"**
3. Tous vos projets sont sauvegardés automatiquement

#### Export vers fichier HTML
1. Cliquez sur **"Sauvegarder"**
2. Entrez un nom de projet
3. Choisissez l'emplacement sur votre ordinateur
4. Un fichier **HTML autonome** (avec CSS intégré) est généré

---

## 🏗️ Architecture du projet

```
easyfront/
├── src/
│   ├── components/           # Composants React
│   │   ├── Canvas/          # Zone de drag & drop
│   │   ├── CodeEditor/      # Éditeur Monaco
│   │   ├── DraggableElement/ # Éléments redimensionnables
│   │   ├── ProjectManager/  # Gestion des projets
│   │   ├── Sidebar/         # Bibliothèque de composants
│   │   ├── Toolbar/         # Barre d'outils principale
│   │   └── WidgetImporter/  # Import de widgets
│   ├── db/                  # Configuration IndexedDB
│   │   └── database.ts
│   ├── store/               # State management (Zustand)
│   │   └── useStore.ts
│   ├── types/               # Types TypeScript
│   │   ├── element.ts
│   │   └── widget.ts
│   ├── utils/               # Fonctions utilitaires
│   │   ├── codeGenerator.ts # Génération HTML/CSS
│   │   └── snapToGrid.ts    # Magnétisme de grille
│   ├── App.tsx              # Composant racine
│   ├── main.tsx             # Point d'entrée
│   └── index.css            # Styles globaux
├── public/                  # Assets statiques
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

---

## 🎯 Patterns de conception utilisés

### Observer Pattern (Zustand)
Synchronisation automatique entre le Canvas et le Code Editor.

### Factory Pattern
Création d'éléments HTML selon leur type avec propriétés par défaut.

### Singleton Pattern
Instance unique de la base de données IndexedDB.

### Strategy Pattern
Différentes stratégies de génération de code selon le type d'élément.

---

## 🔧 Configuration

### Personnaliser la grille

Dans `src/store/useStore.ts` :

```typescript
export const useStore = create<StoreState>((set) => ({
  gridSize: 20, // Modifier la taille par défaut (10, 20, 30, 50)
  // ...
}));
```

### Ajouter des composants prédéfinis

Dans `src/components/Sidebar/Sidebar.tsx` :

```typescript
const builtInTemplates: ComponentTemplate[] = [
  {
    type: 'votre-type',
    label: 'Votre Label',
    Icon: VotreIcone,
    defaultSize: { width: 200, height: 100 }
  },
  // ...
];
```

---

## 🌐 Compatibilité navigateurs

| Navigateur | Version minimale | Sauvegarde fichier |
|------------|-----------------|-------------------|
| **Chrome** | 90+ | ✅ Supportée |
| **Edge** | 90+ | ✅ Supportée |
| **Firefox** | 88+ | ❌ Non supportée* |
| **Safari** | 14+ | ❌ Non supportée* |

_*La sauvegarde directe de fichiers utilise l'API **File System Access**, uniquement disponible sur Chrome/Edge. Les autres navigateurs peuvent copier le code manuellement._

---

## 🐛 Résolution de problèmes

### Le modal d'import ne s'affiche pas
**Solution :** Ouvrez la console (F12) et vérifiez les erreurs. Assurez-vous que tous les styles inline sont bien appliqués.

### Le canvas ne met pas à jour après modification du CSS
**Solution :** Vérifiez que votre CSS utilise bien les classes `.element-{id}` générées automatiquement.

### Les widgets importés ne s'affichent pas
**Solution :** Vérifiez que votre HTML ne contient pas de balises `<html>`, `<head>` ou `<body>`. Seul le contenu du body doit être importé.

### Erreur de sauvegarde de fichier
**Solution :** Cette fonctionnalité nécessite Chrome ou Edge. Sur Firefox/Safari, copiez le code manuellement depuis l'éditeur.

---

## 🚀 Roadmap

- [ ] Système de templates prédéfinis (landing pages, formulaires)
- [ ] Export en React components
- [ ] Mode collaboratif en temps réel
- [ ] Intégration avec Figma
- [ ] Support du responsive design (breakpoints)
- [ ] Historique Undo/Redo
- [ ] Glisser-déposer d'images depuis le système
- [ ] Générateur de palettes de couleurs
- [ ] Animations CSS prédéfinies

---

## 🤝 Contribution

Les contributions sont les bienvenues ! Voici comment participer :

1. **Fork** le projet
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Pushez vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une **Pull Request**

### Règles de contribution
- Respecter la structure du projet
- Ajouter des tests si applicable
- Documenter les nouvelles fonctionnalités
- Suivre les conventions de code TypeScript/React

---

## 📄 License

Ce projet est sous licence **MIT**. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## 👨‍💻 Auteur

**Votre Nom**
- GitHub : [@votre-username](https://github.com/votre-username)
- Email : votre.email@example.com

---

## 🙏 Remerciements

- [React](https://react.dev/) - Framework UI
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - Éditeur de code
- [Lucide](https://lucide.dev/) - Bibliothèque d'icônes
- [Dexie.js](https://dexie.org/) - Wrapper IndexedDB

---

## 📞 Support

Pour toute question ou problème :
- Ouvrez une **[issue](https://github.com/votre-username/easyfront/issues)**
- Consultez la **[documentation](https://github.com/votre-username/easyfront/wiki)**

---

**⭐ Si vous aimez ce projet, n'hésitez pas à lui donner une étoile sur GitHub !**

---

<p align="center">
  Fait avec ❤️ par <a href="https://github.com/votre-username">Votre Nom</a>
</p>
```

---

## 📸 Captures d'écran (optionnel)

Si vous voulez ajouter des captures d'écran, créez un dossier `docs/images/` et ajoutez :

```markdown
## 📸 Aperçu

### Interface principale
![Interface principale](docs/images/screenshot-main.png)

### Éditeur de code
![Éditeur de code](docs/images/screenshot-editor.png)

### Gestionnaire de projets
![Gestionnaire de projets](docs/images/screenshot-projects.png)

### Import de widgets
![Import de widgets](docs/images/screenshot-widgets.png)
```

---

Ce README est complet, professionnel et prêt à être utilisé ! 🚀
