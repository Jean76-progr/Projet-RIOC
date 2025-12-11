import React, { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { useStore } from '../../store/useStore';
import { generateHTML, generateCSS } from '../../utils/codeGenerator';
import { Code, Palette, Copy, Check } from 'lucide-react';

export const CodeEditor: React.FC = () => {
  const { elements, updateElement } = useStore();
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

  // ✅ Fonction pour générer uniquement le HTML (sans CSS inline)
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

  // ✅ Gestion de la modification du code CSS avec synchronisation en temps réel
  const handleCSSChange = (value: string | undefined) => {
    if (!value) return;
    setCssCode(value);
    
    // Parser et appliquer immédiatement les changements
    parseAndApplyCSS(value);
  };

  // ✅ Parser le CSS et mettre à jour les éléments en temps réel
  const parseAndApplyCSS = (css: string) => {
    try {
      // Regex pour capturer les règles CSS de chaque élément
      const regex = /\.element-([a-f0-9\-]+)\s*\{([^}]+)\}/g;
      let match;

      const updates: { [key: string]: any } = {};

      while ((match = regex.exec(css)) !== null) {
        const elementId = match[1];
        const cssRules = match[2];
        
        // Trouver l'élément correspondant
        const element = elements.find(e => e.id === elementId);
        if (!element) continue;

        // Parser les propriétés CSS
        const properties = cssRules.split(';').filter(p => p.trim());
        
        let position = { ...element.position };
        let size = { ...element.size };
        const styles: any = {};
        
        properties.forEach(prop => {
          const [key, value] = prop.split(':').map(s => s.trim());
          if (!key || !value) return;

          // Gérer les propriétés de position et taille
          switch (key) {
            case 'left':
              const leftValue = parseInt(value);
              if (!isNaN(leftValue)) {
                position.x = leftValue;
              }
              break;
            case 'top':
              const topValue = parseInt(value);
              if (!isNaN(topValue)) {
                position.y = topValue;
              }
              break;
            case 'width':
              const widthValue = parseInt(value);
              if (!isNaN(widthValue)) {
                size.width = widthValue;
              }
              break;
            case 'height':
              const heightValue = parseInt(value);
              if (!isNaN(heightValue)) {
                size.height = heightValue;
              }
              break;
            default:
              // Autres styles CSS (couleur, font, etc.)
              if (key !== 'position') {
                const camelKey = key.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
                styles[camelKey] = value;
              }
          }
        });

        // Préparer les mises à jour
        updates[elementId] = {
          position,
          size,
          styles
        };
      }

      // ✅ Appliquer toutes les mises à jour en une seule fois
      Object.entries(updates).forEach(([elementId, update]) => {
        updateElement(elementId, update);
      });

    } catch (error) {
      console.error('Erreur lors du parsing CSS:', error);
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

      {/* Info bar pour le CSS */}
      {activeTab === 'css' && (
        <div 
          className="px-4 py-2 text-xs flex items-center gap-2"
          style={{ backgroundColor: '#1a1a1a', color: '#4ec9b0', borderBottom: '1px solid #3e3e42' }}
        >
          <span>💡</span>
          <span>Les modifications CSS se reflètent en temps réel sur le canvas</span>
        </div>
      )}

      {/* Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          language={activeTab}
          value={activeTab === 'html' ? htmlCode : cssCode}
          onChange={activeTab === 'css' ? handleCSSChange : undefined}
          theme="vs-dark"
          options={{
            readOnly: activeTab === 'html', // ✅ HTML en lecture seule, CSS éditable
            minimap: { enabled: true },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            wordWrap: 'on',
            tabSize: 2,
            formatOnPaste: true,
            formatOnType: true,
            quickSuggestions: activeTab === 'css',
            suggest: {
              showProperties: activeTab === 'css',
              showColors: activeTab === 'css',
            }
          }}
        />
      </div>
    </div>
  );
};