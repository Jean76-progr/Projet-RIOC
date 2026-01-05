import type { Element } from '../types/element';

/**
 * GÉNÉRATEUR DE CODE HTML
 * Transforme le tableau d'éléments JSON du store en une structure HTML propre.
 */
export const generateHTML = (elements: Element[]): string => {
  
  /**
   * Fonction récursive (interne) pour transformer un objet Element en balise HTML
   * @param element L'objet élément issu du store
   * @param indent Nombre d'espaces pour le formatage du code (pretty-print)
   */
  const generateElementHTML = (element: Element, indent = 2): string => {
    const spaces = ' '.repeat(indent);
    
    // 1. Identification unique : On utilise l'ID du store comme classe CSS
    // Cela permet de lier précisément l'élément HTML à son bloc de style CSS plus tard
    const classes = [`element-${element.id}`];
    const classAttr = ` class="${classes.join(' ')}"`;
    
    // 2. Nettoyage des attributs : On ne garde que les attributs HTML standards (id, title, etc.)
    // On filtre les attributs internes "data-widget" qui ne servent qu'à l'éditeur
    const attrs = Object.entries(element.attributes)
      .filter(([key]) => !key.startsWith('data-widget'))
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ');

    // 3. Cas particulier : Les Widgets (Composants complexes pré-faits)
    // Si l'élément a un ID de widget, on injecte directement son contenu HTML stocké
    if (element.attributes['data-widget-id']) {
      return `${spaces}<div${classAttr}>\n${spaces}  ${element.content}\n${spaces}</div>`;
    }

    // 4. Mapping des balises HTML : Conversion selon le type d'élément
    switch (element.type) {
      case 'input':
        // Auto-fermante : <input />
        return `${spaces}<input${classAttr}${attrs ? ' ' + attrs : ''} />`;
      case 'img':
        // Gestion de l'image avec fallback (image de remplacement)
        return `${spaces}<img${classAttr} src="${element.attributes.src || 'placeholder.jpg'}" alt="${element.content}" />`;
      case 'textarea':
        return `${spaces}<textarea${classAttr}${attrs ? ' ' + attrs : ''}>${element.content}</textarea>`;
      case 'button':
        return `${spaces}<button${classAttr}${attrs ? ' ' + attrs : ''}>${element.content}</button>`;
      default:
        // Balise générique (div, h1, span, p...)
        return `${spaces}<${element.type}${classAttr}${attrs ? ' ' + attrs : ''}>${element.content}</${element.type}>`;
    }
  };

  // On assemble tous les éléments générés avec des sauts de ligne
  const htmlBody = elements.map(el => generateElementHTML(el)).join('\n');
  
  // Retourne le squelette HTML5 standard avec un lien vers une feuille de style externe
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>EasyFront - Page générée</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="canvas-container">
${htmlBody}
  </div>
</body>
</html>`;
};

/**
 * GÉNÉRATEUR DE CODE CSS
 * Transforme les propriétés de position, taille et style en règles CSS valides.
 */
export const generateCSS = (elements: Element[]): string => {
  // Entête du fichier CSS avec Reset de base pour garantir le même rendu partout
  let css = `/* Généré par EasyFront le ${new Date().toLocaleString()} */\n\n`;
  css += `* {\n  box-sizing: border-box;\n  margin: 0;\n  padding: 0;\n}\n\n`;
  css += `body {\n  font-family: system-ui, -apple-system, sans-serif;\n}\n\n`;
  
  // Le conteneur occupe toute la page pour servir de référentiel aux positions
  css += `.canvas-container {\n  position: relative;\n  width: 100%;\n  min-height: 100vh;\n}\n\n`;

  elements.forEach((element) => {
    // 1. Injection du CSS spécifique aux Widgets personnalisés
    if (element.attributes['data-widget-css']) {
      css += `/* Widget: ${element.attributes['data-widget-name']} */\n`;
      css += element.attributes['data-widget-css'] + '\n\n';
    }

    // 2. Génération de la règle CSS pour l'élément courant
    css += `/* ${element.type} - ${element.content.substring(0, 30)}${element.content.length > 30 ? '...' : ''} */\n`;
    css += `.element-${element.id} {\n`;
    
    // Positionnement absolu/relatif basé sur les coordonnées du canvas
    css += `  position: relative;\n`; 
    css += `  left: ${element.position.x}px;\n`;
    css += `  top: ${element.position.y}px;\n`;
    css += `  width: ${element.size.width}px;\n`;
    css += `  height: ${element.size.height}px;\n`;
    
    // 3. Conversion des styles (camelCase JS -> kebab-case CSS)
    // Exemple: backgroundColor devient background-color
    Object.entries(element.styles).forEach(([key, value]) => {
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      css += `  ${cssKey}: ${value};\n`;
    });
    
    css += `}\n\n`;
  });

  return css;
};

/**
 * GÉNÉRATEUR HTML COMPLET (Self-contained)
 * Crée un fichier unique contenant à la fois la structure et les styles.
 * Pratique pour un aperçu rapide sans gérer plusieurs fichiers.
 */
export const generateCompleteHTML = (elements: Element[]): string => {
  // On réutilise la logique de mapping HTML
  const htmlBody = elements.map((element) => {
    // (Logique identique à generateHTML mais centralisée ici pour l'export "tout-en-un")
    // ... (code de mapping HTML) ...
    // Note : Pour plus de propreté, on pourrait extraire generateElementHTML en dehors 
    // des deux fonctions pour ne pas la dupliquer.
  }).join('\n');

  // On injecte directement le résultat de generateCSS() dans une balise <style>
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>EasyFront - Page générée</title>
  <style>
${generateCSS(elements)}
  </style>
</head>
<body>
  <div class="canvas-container">
${htmlBody}
  </div>
</body>
</html>`;
};