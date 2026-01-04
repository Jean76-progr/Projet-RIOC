import React, { useState } from 'react';
import { 
  Save, 
  Trash2, 
  Grid3x3,
  Layers
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { db } from '../../db/database';
import { generateHTML} from '../../utils/codeGenerator';
import { ProjectManager } from '../ProjectManager/ProjectManager';

export const Toolbar: React.FC = () => {
  const { 
    elements, 
    clearCanvas, 
    gridSize,
    setGridSize
  } = useStore();

  const [showProjectManager, setShowProjectManager] = useState(false);

  const handleSave = async () => {
    if (elements.length === 0) {
      alert('Aucun élément à sauvegarder. Ajoutez des composants au canvas d\'abord.');
      return;
    }

    const projectName = prompt('Nom du projet :');
    if (!projectName) return;

    try {
      // Vérifier si l'API File System Access est supportée
      if (!('showSaveFilePicker' in window)) {
        alert('Votre navigateur ne supporte pas la sauvegarde de fichiers. Utilisez Chrome ou Edge.');
        return;
      }

      // Demander à l'utilisateur où sauvegarder
      const htmlHandle = await (window as any).showSaveFilePicker({
        suggestedName: `${projectName}.html`,
        types: [{
          description: 'Fichier HTML',
          accept: { 'text/html': ['.html'] }
        }]
      });

      // Générer le code
      const htmlContent = generateHTML(elements);

      // Écrire le fichier
      const writable = await htmlHandle.createWritable();
      await writable.write(htmlContent);
      await writable.close();

      // Sauvegarder aussi dans IndexedDB
      await db.projects.add({
        id: Date.now().toString(),
        name: projectName,
        elements,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      alert('Projet sauvegardé avec succès !');
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return;
      }
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde du fichier');
    }
  };

  return (
    <>
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-4 shadow-sm">
        {/* Logo */}
        <div className="flex items-center gap-3 mr-4">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg"></span>
          </div>
          <h1 className="text-xl font-bold text-gray-800">EasyFront  </h1>
        </div>
        
        {/* Actions principales */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowProjectManager(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center gap-2"
          >
            <Layers className="w-4 h-4" />
            Projets
          </button>

          <button 
            onClick={handleSave} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Sauvegarder
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

        {/* Contrôle taille de grille */}
        <div className="flex items-center gap-3">
          <Grid3x3 className="w-5 h-5 text-gray-600" />
          <label className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Taille de grille:</span>
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
          </label>
        </div>

        {/* Info nombre d'éléments */}
        <div className="ml-auto flex items-center gap-2 text-sm text-gray-600">
          <span className="font-medium">{elements.length}</span>
          <span>élément{elements.length > 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Modal gestionnaire de projets */}
      {showProjectManager && (
        <ProjectManager onClose={() => setShowProjectManager(false)} />
      )}
    </>
  );
};