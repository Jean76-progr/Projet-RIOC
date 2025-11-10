import React, { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { useStore } from '../../store/useStore';
import { generateHTML, generateCSS } from '../../utils/codeGenerator';
import { Code, Palette, Copy, Check } from 'lucide-react';

export const CodeEditor: React.FC = () => {
  const { elements, updateElement, addElement, deleteElement } = useStore();
  const [activeTab, setActiveTab] = useState<'html' | 'css'>('html');
  const [htmlCode, setHtmlCode] = useState('');
  const [cssCode, setCssCode] = useState('');
  const [copied, setCopied] = useState(false);

  // Générer le code à partir des éléments
  useEffect(() => {
    const html = generatePureHTML(elements);
    const css = generateCSS(elements);
    setHtmlCode(html);
    setCssCode(css);
  }, [elements]);

  // Fonction pour générer uniquement le HTML (sans CSS inline)
  const generatePureHTML = (elements: any[]) => {
    if (elements.length === 0) {
      return '<!-- Ajoutez des composants au canvas pour voir le code HTML -->';
    }

    const htmlBody = elements.map(el => {
      const classes = [`element-${el.id}`];
      const classAttr = ` class="${classes.join(' ')}"`;
      
      const attrs = Object.entries(el.attributes)
        .filter(([key]) => !key.startsWith('data-widget'))
        .map(([key, value]) => `${key}="${value}"`)
        .join(' ');

      // Si c'est un widget
      if (el.attributes['data-widget-id']) {
        return `  <div${classAttr}>\n    ${el.content}\n  </div>`;
      }

      // Composants normaux
      switch (el.type) {
        case 'input':
          return `  <input${classAttr}${attrs ? ' ' + attrs : ''} />`;
        case 'img':
          return `  <img${classAttr} src="${el.attributes.src || 'placeholder.jpg'}" alt="${el.content}" />`;
        case 'textarea':
          return `  <textarea${classAttr}${attrs ? ' ' + attrs : ''}>${el.content}</textarea>`;
        case 'button':
          return `  <button${classAttr}${attrs ? ' ' + attrs : ''}>${el.content}</button>`;
        default:
          return `  <${el.type}${classAttr}${attrs ? ' ' + attrs : ''}>${el.content}</${el.type}>`;
      }
    }).join('\n');

    return `<div class="canvas-container">\n${htmlBody}\n</div>`;
  };

  const handleCopy = async () => {
    const textToCopy = activeTab === 'html' ? htmlCode : cssCode;
    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Gestion de la modification du code HTML
  const handleHTMLChange = (value: string | undefined) => {
    if (!value) return;
    setHtmlCode(value);
    
    // TODO: Parser le HTML et mettre à jour les éléments
    // Pour l'instant, on laisse juste l'édition sans sync inverse
    console.log('HTML modifié:', value);
  };

  // Gestion de la modification du code CSS
  const handleCSSChange = (value: string | undefined) => {
    if (!value) return;
    setCssCode(value);
    
    // Parser le CSS et mettre à jour les styles des éléments
    try {
      parseAndApplyCSS(value);
    } catch (error) {
      console.error('Erreur lors du parsing CSS:', error);
    }
  };

  // Parser le CSS et appliquer aux éléments
  const parseAndApplyCSS = (css: string) => {
    // Extraire les règles CSS pour chaque élément
    const regex = /\.element-([a-f0-9\-]+)\s*{([^}]+)}/g;
    let match;

    while ((match = regex.exec(css)) !== null) {
      const elementId = match[1];
      const cssRules = match[2];
      
      // Parser les propriétés CSS
      const styles: any = {};
      const properties = cssRules.split(';').filter(p => p.trim());
      
      properties.forEach(prop => {
        const [key, value] = prop.split(':').map(s => s.trim());
        if (key && value) {
          // Convertir les propriétés CSS en camelCase
          const camelKey = key.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
          styles[camelKey] = value;
        }
      });

      // Extraire position et taille si présentes
      let updates: any = {};
      
      if (styles.left) {
        const x = parseInt(styles.left);
        if (!isNaN(x)) {
          updates.position = { ...elements.find(e => e.id === elementId)?.position, x };
        }
        delete styles.left;
      }
      
      if (styles.top) {
        const y = parseInt(styles.top);
        if (!isNaN(y)) {
          updates.position = { 
            ...elements.find(e => e.id === elementId)?.position, 
            ...updates.position,
            y 
          };
        }
        delete styles.top;
      }
      
      if (styles.width) {
        const width = parseInt(styles.width);
        if (!isNaN(width)) {
          updates.size = { ...elements.find(e => e.id === elementId)?.size, width };
        }
        delete styles.width;
      }
      
      if (styles.height) {
        const height = parseInt(styles.height);
        if (!isNaN(height)) {
          updates.size = { 
            ...elements.find(e => e.id === elementId)?.size,
            ...updates.size,
            height 
          };
        }
        delete styles.height;
      }

      // Retirer position qui n'est pas un style visuel
      delete styles.position;

      // Mettre à jour l'élément
      if (Object.keys(updates).length > 0 || Object.keys(styles).length > 0) {
        updateElement(elementId, { ...updates, styles });
      }
    }
  };

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: '#1e1e1e' }}>
      {/* Tabs */}
      <div 
        className="flex border-b"
        style={{ backgroundColor: '#252526', borderColor: '#3e3e42' }}
      >
        <button
          onClick={() => setActiveTab('html')}
          className="px-6 py-3 font-medium transition-colors flex items-center gap-2"
          style={{
            backgroundColor: activeTab === 'html' ? '#1e1e1e' : 'transparent',
            color: activeTab === 'html' ? '#ffffff' : '#969696',
            borderBottom: activeTab === 'html' ? '2px solid #007acc' : 'none'
          }}
        >
          <Code className="w-4 h-4" />
          HTML
        </button>
        <button
          onClick={() => setActiveTab('css')}
          className="px-6 py-3 font-medium transition-colors flex items-center gap-2"
          style={{
            backgroundColor: activeTab === 'css' ? '#1e1e1e' : 'transparent',
            color: activeTab === 'css' ? '#ffffff' : '#969696',
            borderBottom: activeTab === 'css' ? '2px solid #007acc' : 'none'
          }}
        >
          <Palette className="w-4 h-4" />
          CSS
        </button>
        <button
          onClick={handleCopy}
          className="ml-auto px-6 py-3 transition-colors flex items-center gap-2"
          style={{ 
            backgroundColor: 'transparent',
            color: copied ? '#4ec9b0' : '#cccccc'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2a2d2e'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Copié !
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copier
            </>
          )}
        </button>
      </div>

      {/* Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          language={activeTab}
          value={activeTab === 'html' ? htmlCode : cssCode}
          onChange={activeTab === 'html' ? handleHTMLChange : handleCSSChange}
          theme="vs-dark"
          options={{
            readOnly: false,
            minimap: { enabled: true },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            wordWrap: 'on',
            tabSize: 2,
            formatOnPaste: true,
            formatOnType: true,
          }}
        />
      </div>
    </div>
  );
};