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
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div 
        className="w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col rounded-xl shadow-2xl"
        style={{ backgroundColor: '#ffffff' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-6 border-b"
          style={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb' }}
        >
          <h2 className="text-2xl font-bold" style={{ color: '#1f2937' }}>
            Gestionnaire de projets
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full transition-colors"
            style={{ backgroundColor: 'transparent' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X className="w-6 h-6" style={{ color: '#6b7280' }} />
          </button>
        </div>

        {/* Actions */}
        <div 
          className="p-4 border-b"
          style={{ backgroundColor: '#f9fafb', borderColor: '#e5e7eb' }}
        >
          <button
            onClick={handleCreateNew}
            className="w-full px-4 py-3 rounded-lg transition-colors flex items-center justify-center gap-2 font-medium"
            style={{ backgroundColor: '#2563eb', color: '#ffffff' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
          >
            <Plus className="w-5 h-5" />
            Créer un nouveau projet
          </button>
        </div>

        {/* Liste des projets */}
        <div 
          className="flex-1 overflow-y-auto p-4"
          style={{ backgroundColor: '#ffffff' }}
        >
          {projects.length === 0 ? (
            <div className="text-center py-12" style={{ color: '#9ca3af' }}>
              <FolderOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Aucun projet sauvegardé</p>
              <p className="text-sm mt-2">Créez votre premier projet en ajoutant des composants au canvas</p>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="border-2 rounded-lg p-4 transition-all"
                  style={{ 
                    backgroundColor: '#ffffff', 
                    borderColor: '#e5e7eb'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#60a5fa'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold truncate" style={{ color: '#1f2937' }}>
                        {project.name}
                      </h3>
                      <div className="flex items-center gap-4 mt-2 text-sm" style={{ color: '#6b7280' }}>
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
                        className="px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
                        style={{ backgroundColor: '#2563eb', color: '#ffffff' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                      >
                        <FolderOpen className="w-4 h-4" />
                        Charger
                      </button>
                      <button
                        onClick={() => handleDeleteProject(project)}
                        className="p-2 rounded-lg transition-colors"
                        style={{ color: '#dc2626', backgroundColor: 'transparent' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
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
        <div 
          className="p-4 border-t text-center text-sm"
          style={{ 
            backgroundColor: '#f9fafb', 
            borderColor: '#e5e7eb',
            color: '#6b7280'
          }}
        >
          {projects.length} projet{projects.length > 1 ? 's' : ''} sauvegardé{projects.length > 1 ? 's' : ''} en mémoire locale
        </div>
      </div>
    </div>
  );
};