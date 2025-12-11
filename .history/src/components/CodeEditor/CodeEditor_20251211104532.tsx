import React, { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { useStore } from '../../store/useStore';
import { generateHTML, generateCSS, generateCompleteHTML } from '../../utils/codeGenerator';

export const CodeEditor: React.FC = () => {
  const { elements, selectedElementId, updateElement } = useStore();
  const [activeTab, setActiveTab] = useState<'html' | 'css'>('html');
  const [htmlCode, setHtmlCode] = useState('');
  const [cssCode, setCssCode] = useState('');

  // Charger le contenu de l'élément sélectionné
  useEffect(() => {
    const selectedElement = elements.find(el => el.id === selectedElementId);
    if (selectedElement) {
      setHtmlCode(selectedElement.content || '');
      setCssCode(selectedElement.styles?.toString() || '');
    } else {
      setHtmlCode('');
      setCssCode('');
    }
  }, [selectedElementId, elements]);

  // Mettre à jour l'élément sélectionné quand le code change
  const handleEditorChange = (value: string | undefined) => {
    if (!value || !selectedElementId) return;
    if (activeTab === 'html') {
      updateElement(selectedElementId, { content: value });
    } else if (activeTab === 'css') {
      // Parsing basique pour convertir le CSS en objet de style
      const styles: Record<string, string> = {};
      value.split(';').forEach(declaration => {
        const [property, val] = declaration.split(':').map(s => s.trim());
        if (property && val) {
          styles[property] = val;
        }
      });
      updateElement(selectedElementId, { styles });
    }
  };

  const handleDownload = () => {
    const completeHTML = generateCompleteHTML(elements);
    const htmlBlob = new Blob([completeHTML], { type: 'text/html' });
    const htmlUrl = URL.createObjectURL(htmlBlob);
    const htmlLink = document.createElement('a');
    htmlLink.href = htmlUrl;
    htmlLink.download = 'index.html';
    htmlLink.click();
    setTimeout(() => URL.revokeObjectURL(htmlUrl), 100);
  };

  return (
    <div className="h-full bg-gray-900 flex flex-col">
      <div className="flex bg-gray-800 border-b border-gray-700">
        <button
          onClick={() => setActiveTab('html')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'html'
              ? 'bg-gray-900 text-white border-b-2 border-blue-500'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          HTML
        </button>
        <button
          onClick={() => setActiveTab('css')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'css'
              ? 'bg-gray-900 text-white border-b-2 border-blue-500'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          CSS
        </button>
        <button
          onClick={handleDownload}
          className="ml-auto px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium"
        >
          📥 Télécharger
        </button>
      </div>
      <div className="flex-1">
        <Editor
          height="100%"
          language={activeTab}
          value={activeTab === 'html' ? htmlCode : cssCode}
          onChange={handleEditorChange}
          theme="vs-dark"
          options={{
            readOnly: false,
            minimap: { enabled: true },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            wordWrap: 'on',
          }}
        />
      </div>
    </div>
  );
};
