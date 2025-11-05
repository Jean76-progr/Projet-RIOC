import React from 'react';
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
        
        {/* Canvas central - prend l'espace restant */}
        <main className="flex-1 overflow-auto bg-white">
          <Canvas />
        </main>
        
        {/* Code Editor droite - FORCÉ à 50% */}
        <aside 
          className="flex-shrink-0 overflow-hidden border-l border-gray-700"
          style={{ width: '50%' }}
        >
          <CodeEditor />
        </aside>
      </div>
    </div>
  );
}

export default App;