import type { Element } from '../types/element';

export const generateHTML = (elements: Element[]): string => {
  const generateElementHTML = (element: Element, indent = 2): string => {
    const spaces = ' '.repeat(indent);
    
    // Construire les classes CSS
    const classes = [`element-${element.id}`];
    const classAttr = ` class="${classes.join(' ')}"`;
    
    const attrs = Object.entries(element.attributes)
      .filter(([key]) => !key.startsWith('data-widget'))
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ');

    // Si c'est un widget personnalisé
    if (element.attributes['data-widget-id']) {
      return `${spaces}<div${classAttr}>\n${spaces}  ${element.content}\n${spaces}</div>`;
    }

    switch (element.type) {
      case 'input':
        return `${spaces}<input${classAttr}${attrs ? ' ' + attrs : ''} />`;
      case 'img':
        return `${spaces}<img${classAttr} src="${element.attributes.src || 'placeholder.jpg'}" alt="${element.content}" />`;
      case 'textarea':
        return `${spaces}<textarea${classAttr}${attrs ? ' ' + attrs : ''}>${element.content}</textarea>`;
      case 'button':
        return `${spaces}<button${classAttr}${attrs ? ' ' + attrs : ''}>${element.content}</button>`;
      default:
        return `${spaces}<${element.type}${classAttr}${attrs ? ' ' + attrs : ''}>${element.content}</${element.type}>`;
    }
  };

  const htmlBody = elements.map(el => generateElementHTML(el)).join('\n');
  
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

export const generateCSS = (elements: Element[]): string => {
  let css = `/* Généré par EasyFront le ${new Date().toLocaleString()} */\n\n`;
  css += `* {\n  box-sizing: border-box;\n  margin: 0;\n  padding: 0;\n}\n\n`;
  css += `body {\n  font-family: system-ui, -apple-system, sans-serif;\n}\n\n`;
  css += `.canvas-container {\n  position: relative;\n  width: 100%;\n  min-height: 100vh;\n}\n\n`;

  elements.forEach((element) => {
    // Si c'est un widget, ajouter son CSS personnalisé
    if (element.attributes['data-widget-css']) {
      css += `/* Widget: ${element.attributes['data-widget-name']} */\n`;
      css += element.attributes['data-widget-css'] + '\n\n';
    }

    // Générer le CSS pour chaque élément avec position RELATIVE
    css += `/* ${element.type} - ${element.content.substring(0, 30)}${element.content.length > 30 ? '...' : ''} */\n`;
    css += `.element-${element.id} {\n`;
    css += `  position: relative;\n`;
    css += `  left: ${element.position.x}px;\n`;
    css += `  top: ${element.position.y}px;\n`;
    css += `  width: ${element.size.width}px;\n`;
    css += `  height: ${element.size.height}px;\n`;
    
    // Ajouter les styles personnalisés
    Object.entries(element.styles).forEach(([key, value]) => {
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      css += `  ${cssKey}: ${value};\n`;
    });
    
    css += `}\n\n`;
  });

  return css;
};