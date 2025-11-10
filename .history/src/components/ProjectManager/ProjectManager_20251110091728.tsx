import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, FolderOpen, Calendar } from 'lucide-react';
import { db } from '../../db/database';
import type { Project } from '../../types/element';
import { useStore } from '../../store/useStore';

interface Props {
  onClose: () => void;
}

export const ProjectManager: React.FC<Props> = ({ onClose }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const { clearCanvas, addElement } = useStore();

  const loadProjects = async () => {
    try {
      const allProjects = await db.projects.toArray();
      // Trier par date de création (plus récent en premier)
      allProjects.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setProjects(allProjects);
    } catch (error) {
      console.error('Erreur lors du chargement des projets:', error);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreateNew = () => {
    if (confirm('Créer un nouveau projet ? (Le projet actuel sera effacé si non sauvegardé)')) {
      clearCanvas();
      onClose();
    }
  };

  const handleLoadProject = async (project: Project) => {
    if (confirm(`Charger le projet "${project.name}" ?`)) {
      clearCanvas();
      project.elements.forEach(el => addElement(el));
      onClose();
      alert('✅ Projet chargé !');
    }
  };

  const handleDeleteProject = async (project: Project) => {
    if (confirm(`Supprimer définitivement le projet "${project.name}" ?`)) {
      try {
        await db.projects.delete(project.id);
        alert('✅ Projet supprimé !');
        loadProjects();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('❌ Erreur lors de la suppression');
      }
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Gestionnaire de projets</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Actions */}
        <div className="p-4 border-b bg-gray-50">
          <button
            onClick={handleCreateNew}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
          >
            <Plus className="w-5 h-5" />
            Créer un nouveau projet
          </button>
        </div>

        {/* Liste des projets */}
        <div className="flex-1 overflow-y-auto p-4">
          {projects.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <FolderOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Aucun projet sauvegardé</p>
              <p className="text-sm mt-2">Créez votre premier projet en ajoutant des composants au canvas</p>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-blue-400 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-800 truncate">
                        {project.name}
                      </h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(project.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{project.elements.length}</span>
                          <span>élément{project.elements.length > 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleLoadProject(project)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium"
                      >
                        <FolderOpen className="w-4 h-4" />
                        Charger
                      </button>
                      <button
                        onClick={() => handleDeleteProject(project)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 text-center text-sm text-gray-600">
          {projects.length} projet{projects.length > 1 ? 's' : ''} sauvegardé{projects.length > 1 ? 's' : ''} en mémoire locale
        </div>
      </div>
    </div>
  );
};