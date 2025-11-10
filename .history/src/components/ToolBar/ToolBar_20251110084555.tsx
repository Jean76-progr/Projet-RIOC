import React, { useState } from 'react';
import { 
  Save, 
  FolderOpen, 
  Trash2, 
  Grid3x3, 
  Magnet,
  Download
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { db } from '../../db/database';
import { ExportModal } from '../ExportModal/ExportModal';
import { generateHTML, generateCSS } from '../../utils/codeGenerator';

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

  const [showExportModal, setShowExportModal] = useState(false);

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

  const handleExport = () => {
    if (elements.length === 0) {
      alert('⚠️ Aucun élément à exporter. Ajoutez des composants au canvas d\'abord.');
      return;
    }
    setShowExportModal(true);
  };

  return (
    <>
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-4 shadow-sm">
        {/* Logo */}
        <div className="flex items-center gap-3 mr-4">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">E</span>
          </div>
          <h1 className="text-xl font-bold text-gray-800">EasyFront</h1>
        </div>
        
        {/* Actions principales */}
        <div className="flex items-center gap-2">
          <button 
            onClick={handleSave} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Sauvegarder
          </button>
          
          <button 
            onClick={handleLoad} 
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center gap-2"
          >
            <FolderOpen className="w-4 h-4" />
            Charger
          </button>

          <button 
            onClick={handleExport} 
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Exporter
          </button>
          
          <button 
            onClick={() => {
              if (confirm('Voulez-vous vraiment tout effacer ?')) {
                clearCanvas();
              }
            }}
            className="px-4 py-2 bg-white border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Effacer
          </button>
        </div>

        {/* Séparateur */}
        <div className="h-8 w-px bg-gray-300 mx-2"></div>

        {/* Contrôles de grille */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleGrid}
            className={`px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors ${
              showGrid
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Grid3x3 className="w-4 h-4" />
            Grille
          </button>

          <button
            onClick={toggleSnapToGrid}
            className={`px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors ${
              snapToGrid
                ? 'bg-purple-100 text-purple-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Magnet className="w-4 h-4" />
            Magnétisme
          </button>

          <select
            value={gridSize}
            onChange={(e) => setGridSize(Number(e.target.value))}
            className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={10}>10px</option>
            <option value={20}>20px</option>
            <option value={30}>30px</option>
            <option value={50}>50px</option>
          </select>
        </div>

        {/* Info nombre d'éléments */}
        <div className="ml-auto flex items-center gap-2 text-sm text-gray-600">
          <span className="font-medium">{elements.length}</span>
          <span>élément{elements.length > 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Modal d'export */}
      {showExportModal && (
        <ExportModal
          onClose={() => setShowExportModal(false)}
          htmlContent={generateHTML(elements)}
          cssContent={generateCSS(elements)}
        />
      )}
    </>
  );
};