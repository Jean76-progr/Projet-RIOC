import React from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { Sidebar } from './components/Sidebar/SideBar.tsx';
import { Canvas } from './components/Canvas/Canvas';
import { CodeEditor } from './components/CodeEditor/CodeEditor';
import { Toolbar } from './components/ToolBar/ToolBar';

function App() {
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
          {/* Canvas central - prend l'espace restant par défaut */}
          <Panel defaultSize={60} minSize={30}>
            <main className="h-full overflow-auto bg-white">
              <Canvas />
            </main>
          </Panel>

          {/* Barre de redimensionnement */}
          <PanelResizeHandle className="w-2 bg-gray-300 hover:bg-blue-500 transition-colors group relative">
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-1 bg-gray-500 group-hover:bg-blue-600 rounded-full" />
          </PanelResizeHandle>

          {/* Code Editor droite - redimensionnable */}
          <Panel defaultSize={40} minSize={20}>
            <aside className="h-full overflow-hidden border-l border-gray-700">
              <CodeEditor />
            </aside>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}

export default App;
