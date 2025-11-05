import React from 'react';
import { Sidebar } from './components/Sidebar/SideBar.tsx';
import { Canvas } from './components/Canvas/Canvas';
import { CodeEditor } from './components/CodeEditor/CodeEditor';
import { Toolbar } from './components/ToolBar/ToolBar';

function App() {
  return (
    <div className="h-screen flex flex-col">
      <Toolbar />
      
      <div className="flex-1 grid grid-cols-12 overflow-hidden">
        {/* Sidebar : 2 colonnes sur 12 */}
        <div className="col-span-2 overflow-auto">
          <Sidebar />
        </div>
        
        {/* Canvas : 5 colonnes sur 12 */}
        <div className="col-span-5 overflow-auto">
          <Canvas />
        </div>
        
        {/* Code Editor : 5 colonnes sur 12 */}
        <div className="col-span-5 overflow-auto">
          <CodeEditor />
        </div>
      </div>
    </div>
  );
}

export default App;