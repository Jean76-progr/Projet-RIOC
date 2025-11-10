import React, { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { useStore } from '../../store/useStore';
import { generateHTML, generateCSS } from '../../utils/codeGenerator';

export const CodeEditor: React.FC = () => {
  const { elements } = useStore();
  const [activeTab, setActiveTab] = useState<'html' | 'css'>('html');
  const [htmlCode, setHtmlCode] = useState('');
  const [cssCode, setCssCode] = useState('');

  useEffect(() => {
    setHtmlCode(generateHTML(elements));
    setCssCode(generateCSS(elements));
  }, [elements]);

  const handleDownload = () => {
    // Télécharger HTML
    const htmlBlob = new Blob([htmlCode], { type: 'text/html' });
    const htmlUrl = URL.createObjectURL(htmlBlob);
    const htmlLink = document.createElement('a');
    htmlLink.href = htmlUrl;
    htmlLink.download = 'index.html';
    htmlLink.click();

    // Télécharger CSS
    const cssBlob = new Blob([cssCode], { type: 'text/css' });
    const cssUrl = URL.createObjectURL(cssBlob);
    const cssLink = document.createElement('a');
    cssLink.href = cssUrl;
    cssLink.download = 'styles.css';
    cssLink.click();
  };

  return (
    <div className="h-full bg-gray-900 flex flex-col">
      {/* Tabs */}
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

      {/* Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          language={activeTab}
          value={activeTab === 'html' ? htmlCode : cssCode}
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