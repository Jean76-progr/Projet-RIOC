import React, { useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { Sidebar } from './components/Sidebar/SideBar.tsx';
import { Canvas } from './components/Canvas/Canvas';
import { CodeEditor } from './components/CodeEditor/CodeEditor';
import { Toolbar } from './components/ToolBar/ToolBar';
import { useStore } from './store/useStore';
import { generateCompleteHTML } from './utils/codeGenerator';

function App() {
  const { elements } = useStore();
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      {/* Toolbar fixe en haut */}
      <Toolbar />

      {/* Zone principale - 3 colonnes */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar gauche - largeur fixe */}
        <aside className="w-64 flex-shrink-0 overflow-y-auto border-r border-gray-300">
          <Sidebar />
        </aside>

        {/* Split Pane entre Canvas et CodeEditor */}
        <PanelGroup direction="horizontal" className="flex-1">
          {/* Canvas central */}
          <Panel defaultSize={60} minSize={30}>
            <main className="h-full overflow-auto bg-white">
              <Canvas />
            </main>
          </Panel>

          {/* Barre de redimensionnement */}
          <PanelResizeHandle className="w-2 bg-gray-300 hover:bg-blue-500 transition-colors group relative">
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-1 bg-gray-500 group-hover:bg-blue-600 rounded-full" />
          </PanelResizeHandle>

          {/* Code Editor droite */}
          <Panel defaultSize={40} minSize={20}>
            <aside className="h-full overflow-hidden border-l border-gray-700 relative">
              <CodeEditor />
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="absolute top-2 right-2 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors z-10"
                title={showPreview ? "Masquer l'aperçu" : "Aperçu rapide"}
              >
                👁️
              </button>
            </aside>
          </Panel>
        </PanelGroup>
      </div>

      {/* Aperçu en superposition */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full h-full max-w-4xl max-h-[90vh] rounded-lg shadow-2xl overflow-hidden relative">
            <button
              onClick={() => setShowPreview(false)}
              className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors z-10"
              title="Fermer l'aperçu"
            >
              ✕
            </button>
            <iframe
              srcDoc={generateCompleteHTML(elements)}
              className="w-full h-full border-0"
              title="Aperçu du rendu"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
