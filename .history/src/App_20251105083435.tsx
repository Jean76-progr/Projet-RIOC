import React from 'react';
import { Sidebar } from './components/Sidebar/SideBar.tsx';
import { Canvas } from './components/Canvas/Canvas';
import { CodeEditor } from './components/CodeEditor/CodeEditor';
import { Toolbar } from './components/ToolBar/Toolbar';


function App() {
  return (
    <div className="h-screen flex flex-col">
      <Toolbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <Canvas />
        <CodeEditor />
      </div>
    </div>
  );
}

export default App;