import React from 'react';
import { 
  Save, 
  FolderOpen, 
  Trash2, 
  Grid3x3
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { db } from '../../db/database';
import { generateHTML, generateCSS } from '../../utils/codeGenerator';

export const Toolbar: React.FC = () => {
  const { 
    elements, 
    clearCanvas, 
    gridSize,
    setGridSize
  } = useStore();

  const handleSave = async () => {
    if (elements.length === 0) {
      alert('⚠️ Aucun élément à sauvegarder. Ajoutez des composants au canvas d\'abord.');
      return;
    }

    const projectName = prompt('Nom du projet :');
    if (!projectName) return;

    try {
      // Vérifier si l'API File System Access est supportée
      if (!('showSaveFilePicker' in window)) {
        alert('❌ Votre navigateur ne supporte pas la sauvegarde de fichiers. Utilisez Chrome ou Edge.');
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
      const cssContent = generateCSS(elements);

      // Injecter le CSS dans le HTML
      const fullHTML = htmlContent.replace(
        '<link rel="stylesheet" href="styles.css">',
        `<style>\n${cssContent}\n</style>`
      );

      // Écrire le fichier
      const writable = await htmlHandle.createWritable();
      await writable.write(fullHTML);
      await writable.close();

      // Sauvegarder aussi dans IndexedDB
      await db.projects.add({
        id: Date.now().toString(),
        name: projectName,
        elements,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      alert('✅ Projet sauvegardé avec succès !');
    } catch (error: any) {
      if (error.name === 'AbortError') {
        // L'utilisateur a annulé
        return;
      }
      console.error('Erreur lors de la sauvegarde:', error);
      alert('❌ Erreur lors de la sauvegarde du fichier');
    }
  };

  const handleLoad = async () => {
    const projects = await db.projects.toArray();
    if (projects.length === 0) {
      alert('Aucun projet sauvegardé en mémoire');
      return;
    }

    const projectList = projects.map((p, i) => 
      `${i + 1}. ${p.name} (${new Date(p.createdAt).toLocaleDateString()})`
    ).join('\n');
    
    const choice = prompt(`Choisir un projet:\n\n${projectList}\n\nEntrez le numéro :`);
    
    if (choice !== null) {
      const index = parseInt(choice) - 1;
      const project = projects[index];
      if (project) {
        clearCanvas();
        project.elements.forEach(el => useStore.getState().addElement(el));
        alert('✅ Projet chargé !');
      } else {
        alert('❌ Projet non trouvé');
      }
    }
  };

  return (
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

      {/* Contrôle taille de grille uniquement */}
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
  );
};