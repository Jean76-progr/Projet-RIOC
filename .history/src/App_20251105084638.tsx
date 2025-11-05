import React from 'react';
import { Sidebar } from './components/Sidebar/SideBar.tsx';
import { Canvas } from './components/Canvas/Canvas';
import { CodeEditor } from './components/CodeEditor/CodeEditor';
import { Toolbar } from './components/ToolBar/ToolBar';

function App() {
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Toolbar en haut */}
      <Toolbar />
      
      {/* Zone principale avec 3 colonnes */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar gauche - largeur fixe 280px */}
        <div className="w-[280px] flex-shrink-0">
          <Sidebar />
        </div>
        
        {/* Canvas central - prend l'espace restant */}
        <div className="flex-1 overflow-auto">
          <Canvas />
        </div>
        
        {/* Code Editor droite - largeur 50% de l'écran */}
        <div className="w-1/2 flex-shrink-0">
          <CodeEditor />
        </div>
      </div>
    </div>
  );
}

export default App;