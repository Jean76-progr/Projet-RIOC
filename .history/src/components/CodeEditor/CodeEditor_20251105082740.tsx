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
    <div className="w-1/2 bg-gray-900 flex flex-col">
      {/* Tabs */}
      <div className="flex bg-gray-800 border-b border-gray-700">
        <button
          onClick={() => setActiveTab('html')}
          className={`px-4 py-2 ${activeTab === 'html' ? 'bg-gray-900 text-white' : 'text-gray-400'}`}
        >
          HTML
        </button>
        <button
          onClick={() => setActiveTab('css')}
          className={`px-4 py-2 ${activeTab === 'css' ? 'bg-gray-900 text-white' : 'text-gray-400'}`}
        >
          CSS
        </button>
        <button
          onClick={handleDownload}
          className="ml-auto px-4 py-2 bg-blue-600 text-white hover:bg-blue-700"
        >
          📥 Télécharger
        </button>
      </div>

      {/* Editor */}
      <Editor
        height="100%"
        language={activeTab}
        value={activeTab === 'html' ? htmlCode : cssCode}
        theme="vs-dark"
        options={{
          readOnly: true,
          minimap: { enabled: true },
          fontSize: 14,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
        }}
      />
    </div>
  );
};