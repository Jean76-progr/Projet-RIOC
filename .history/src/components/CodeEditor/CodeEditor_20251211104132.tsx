import React, { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { useStore } from '../../store/useStore';
import { generateHTML, generateCSS, generateCompleteHTML } from '../../utils/codeGenerator';

export const CodeEditor: React.FC = () => {
  const { elements } = useStore();
  const [activeTab, setActiveTab] = useState<'html' | 'css'>('html');
  const [htmlCode, setHtmlCode] = useState('');
  const [cssCode, setCssCode] = useState('');
  const [previewHtml, setPreviewHtml] = useState('');

  useEffect(() => {
    setHtmlCode(generateHTML(elements));
    setCssCode(generateCSS(elements));
  }, [elements]);

  useEffect(() => {
    const preview = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>${cssCode}</style>
        </head>
        <body>
          ${htmlCode}
        </body>
      </html>
    `;
    setPreviewHtml(preview);
  }, [htmlCode, cssCode]);

  const handleEditorChange = (value: string | undefined) => {
    if (activeTab === 'html' && value) {
      setHtmlCode(value);
    } else if (activeTab === 'css' && value) {
      setCssCode(value);
    }
  };

  const handleDownload = () => {
    const completeHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>${cssCode}</style>
        </head>
        <body>
          ${htmlCode}
        </body>
      </html>
    `;
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
      <div className="flex-1 flex">
        <div className="w-1/2 h-full border-r border-gray-700">
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
        <div className="w-1/2 h-full">
          <iframe
            srcDoc={previewHtml}
            className="w-full h-full border-0"
            title="Preview"
          />
        </div>
      </div>
    </div>
  );
};
