import React from 'react';
import { useStore } from '../../store/useStore';
import { db } from '../../db/database';

export const Toolbar: React.FC = () => {
  const { 
    elements, 
    clearCanvas, 
    gridSize, 
    showGrid, 
    snapToGrid,
    setGridSize,
    toggleGrid,
    toggleSnapToGrid
  } = useStore();

  const handleSave = async () => {
    const projectName = prompt('Nom du projet :');
    if (!projectName) return;

    try {
      await db.projects.add({
        id: Date.now().toString(),
        name: projectName,
        elements,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      alert('✅ Projet sauvegardé !');
    } catch (error) {
      alert('❌ Erreur lors de la sauvegarde');
      console.error(error);
    }
  };

  const handleLoad = async () => {
    const projects = await db.projects.toArray();
    if (projects.length === 0) {
      alert('Aucun projet sauvegardé');
      return;
    }

    const projectNames = projects.map((p, i) => `${i}: ${p.name}`).join('\n');
    const choice = prompt(`Choisir un projet:\n${projectNames}`);
    
    if (choice !== null) {
      const index = parseInt(choice);
      const project = projects[index];
      if (project) {
        clearCanvas();
        project.elements.forEach(el => useStore.getState().addElement(el));
        alert('✅ Projet chargé !');
      }
    }
  };

  return (
    <div className="bg-gray-800 text-white px-4 py-3 flex items-center gap-4 border-b border-gray-700">
      <h1 className="text-xl font-bold mr-4">EasyFront</h1>
      
      {/* Actions principales */}
      <button 
        onClick={handleSave} 
        className="px-4 py-2 bg-green-600 rounded hover:bg-green-700 transition-colors font-medium"
      >
        💾 Sauvegarder
      </button>
      
      <button 
        onClick={handleLoad} 
        className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition-colors font-medium"
      >
        📂 Charger
      </button>
      
      <button 
        onClick={clearCanvas} 
        className="px-4 py-2 bg-red-600 rounded hover:bg-red-700 transition-colors font-medium"
      >
        🗑️ Tout effacer
      </button>

      {/* Séparateur */}
      <div className="h-8 w-px bg-gray-600 mx-2"></div>

      {/* Contrôles de grille */}
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 cursor-pointer hover:text-blue-300 transition-colors">
          <input
            type="checkbox"
            checked={showGrid}
            onChange={toggleGrid}
            className="w-4 h-4"
          />
          <span className="text-sm font-medium">Afficher grille</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer hover:text-blue-300 transition-colors">
          <input
            type="checkbox"
            checked={snapToGrid}
            onChange={toggleSnapToGrid}
            className="w-4 h-4"
          />
          <span className="text-sm font-medium">🧲 Magnétisme</span>
        </label>

        <label className="flex items-center gap-2">
          <span className="text-sm font-medium">Taille:</span>
          <select
            value={gridSize}
            onChange={(e) => setGridSize(Number(e.target.value))}
            className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={10}>10px</option>
            <option value={20}>20px</option>
            <option value={30}>30px</option>
            <option value={50}>50px</option>
          </select>
        </label>
      </div>

      {/* Info nombre d'éléments */}
      <div className="ml-auto text-sm text-gray-400">
        {elements.length} élément{elements.length > 1 ? 's' : ''}
      </div>
    </div>
  );
};