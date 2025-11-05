import React from 'react';
import { useStore } from '../../store/useStore';
import { db } from '../../db/database';

export const Toolbar: React.FC = () => {
  const { elements, clearCanvas } = useStore();

  const handleSave = async () => {
    const projectName = prompt('Nom du projet :');
    if (!projectName) return;

    await db.projects.add({
      id: Date.now().toString(),
      name: projectName,
      elements,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    alert('Projet sauvegardé !');
  };

  const handleLoad = async () => {
    const projects = await db.projects.toArray();
    if (projects.length === 0) {
      alert('Aucun projet sauvegardé');
      return;
    }

    // Afficher liste des projets (simplifié)
    const projectNames = projects.map((p, i) => `${i}: ${p.name}`).join('\n');
    const choice = prompt(`Choisir un projet:\n${projectNames}`);
    
    if (choice !== null) {
      const index = parseInt(choice);
      const project = projects[index];
      if (project) {
        clearCanvas();
        project.elements.forEach(el => useStore.getState().addElement(el));
        alert('Projet chargé !');
      }
    }
  };

  return (
    <div className="bg-gray-800 text-white p-3 flex items-center gap-4">
      <h1 className="text-xl font-bold">EasyFront</h1>
      <button onClick={handleSave} className="px-4 py-2 bg-green-600 rounded hover:bg-green-700">
        💾 Sauvegarder
      </button>
      <button onClick={handleLoad} className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700">
        📂 Charger
      </button>
      <button onClick={clearCanvas} className="px-4 py-2 bg-red-600 rounded hover:bg-red-700">
        🗑️ Tout effacer
      </button>
    </div>
  );
};