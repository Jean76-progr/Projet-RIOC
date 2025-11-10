import type { Element } from '../types/element';

export const generateHTML = (elements: Element[]): string => {
  const generateElementHTML = (element: Element, indent = 2): string => {
    const spaces = ' '.repeat(indent);
    const attrs = Object.entries(element.attributes)
      .filter(([key]) => !key.startsWith('data-widget'))
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ');
    
    const styleAttr = generateInlineStyles(element);

    // Si c'est un widget personnalisé
    if (element.attributes['data-widget-id']) {
      return `${spaces}<div${styleAttr}>\n${spaces}  ${element.content}\n${spaces}</div>`;
    }

    switch (element.type) {
      case 'input':
        return `${spaces}<input${attrs ? ' ' + attrs : ''}${styleAttr} />`;
      case 'img':
        return `${spaces}<img src="${element.attributes.src || 'placeholder.jpg'}" alt="${element.content}"${styleAttr} />`;
      case 'textarea':
        return `${spaces}<textarea${attrs ? ' ' + attrs : ''}${styleAttr}>${element.content}</textarea>`;
      default:
        return `${spaces}<${element.type}${attrs ? ' ' + attrs : ''}${styleAttr}>\n${spaces}  ${element.content}\n${spaces}</${element.type}>`;
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
${htmlBody}
</body>
</html>`;
};

export const generateCSS = (elements: Element[]): string => {
  let css = `/* Généré par EasyFront le ${new Date().toLocaleString()} */\n\n`;
  css += `body {\n  margin: 0;\n  padding: 0;\n  font-family: system-ui, -apple-system, sans-serif;\n}\n\n`;

  elements.forEach((element, index) => {
    // Si c'est un widget, ajouter son CSS personnalisé
    if (element.attributes['data-widget-css']) {
      css += `/* Widget: ${element.attributes['data-widget-name']} */\n`;
      css += element.attributes['data-widget-css'] + '\n\n';
    }

    // Générer le CSS pour le positionnement
    css += `/* Élément ${index + 1}: ${element.type} */\n`;
    css += `.element-${element.id} {\n`;
    css += `  position: absolute;\n`;
    css += `  left: ${element.position.x}px;\n`;
    css += `  top: ${element.position.y}px;\n`;
    css += `  width: ${element.size.width}px;\n`;
    css += `  height: ${element.size.height}px;\n`;
    
    Object.entries(element.styles).forEach(([key, value]) => {
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      css += `  ${cssKey}: ${value};\n`;
    });
    
    css += `}\n\n`;
  });

  return css;
};

const generateInlineStyles = (element: Element): string => {
  const styles = {
    position: 'absolute',
    left: `${element.position.x}px`,
    top: `${element.position.y}px`,
    width: `${element.size.width}px`,
    height: `${element.size.height}px`,
    ...element.styles
  };

  const styleString = Object.entries(styles)
    .map(([key, value]) => {
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `${cssKey}:${value}`;
    })
    .join(';');

  return styleString ? ` style="${styleString}"` : '';
};