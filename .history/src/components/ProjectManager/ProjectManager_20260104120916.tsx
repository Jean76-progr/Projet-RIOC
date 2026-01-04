import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, FolderOpen, Calendar } from 'lucide-react';
import { db } from '../../db/database';
import type { Project } from '../../types/element';
import { useStore } from '../../store/useStore';

/**
 * Props du composant ProjectManager
 */
interface Props {
  onClose: () => void; // Fonction callback pour fermer le modal
}

/**
 * Composant ProjectManager - Gestionnaire de projets
 * 
 * Responsabilités :
 * - Afficher la liste des projets sauvegardés dans IndexedDB
 * - Permettre la création d'un nouveau projet (efface le canvas actuel)
 * - Charger un projet existant (restaure tous les éléments)
 * - Supprimer définitivement un projet de la base de données
 * - Afficher les métadonnées (date, nombre d'éléments)
 * 
 * Fonctionnalités :
 * - Modal plein écran avec fond semi-transparent
 * - Liste scrollable de projets
 * - Tri par date (plus récent en premier)
 * - Confirmation avant actions destructives
 * - Persistance via IndexedDB (pas de serveur nécessaire)
 * 
 * @component
 */
export const ProjectManager: React.FC<Props> = ({ onClose }) => {
  // ========================================
  // STATE LOCAL
  // ========================================
  
  // Liste des projets chargés depuis IndexedDB
  const [projects, setProjects] = useState<Project[]>([]);
  
  // Actions du store global
  const { clearCanvas, addElement } = useStore();

  // ========================================
  // CHARGEMENT DES PROJETS
  // ========================================
  
  /**
   * Charge tous les projets depuis IndexedDB et les trie
   * 
   * Processus :
   * 1. Récupère tous les projets via Dexie.js
   * 2. Trie par date de création (plus récent en premier)
   * 3. Met à jour le state local
   * 
   * Gestion d'erreur :
   * - Affiche l'erreur dans la console si échec
   * - L'UI affiche "Aucun projet" si la liste est vide
   */
  const loadProjects = async () => {
    try {
      // Récupérer tous les projets de la table 'projects'
      const allProjects = await db.projects.toArray();
      
      // Trier par date décroissante (plus récent = premier)
      allProjects.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      // Mettre à jour le state
      setProjects(allProjects);
    } catch (error) {
      console.error('Erreur lors du chargement des projets:', error);
    }
  };

  /**
   * Effect Hook : Charger les projets au montage du composant
   * 
   * Se déclenche une seule fois quand le modal s'ouvre
   */
  useEffect(() => {
    loadProjects();
  }, []); // Dépendances vides = exécution unique

  // ========================================
  // GESTION DES ACTIONS
  // ========================================
  
  /**
   * Crée un nouveau projet en effaçant le canvas actuel
   * 
   * Sécurité :
   * - Demande confirmation avant d'effacer
   * - L'utilisateur est averti que le projet actuel sera perdu
   * 
   * Note : Ne crée pas réellement un objet Project dans la DB,
   * juste vide le canvas pour permettre de recommencer à zéro
   */
  const handleCreateNew = () => {
    if (confirm('Créer un nouveau projet ? (Le projet actuel sera effacé si non sauvegardé)')) {
      clearCanvas(); // Supprimer tous les éléments du canvas
      onClose();      // Fermer le modal
    }
  };

  /**
   * Charge un projet existant dans le canvas
   * 
   * Processus :
   * 1. Demande confirmation à l'utilisateur
   * 2. Vide le canvas actuel
   * 3. Ajoute chaque élément du projet sauvegardé
   * 4. Ferme le modal
   * 5. Affiche une notification de succès
   * 
   * @param project - Le projet à charger
   */
  const handleLoadProject = async (project: Project) => {
    if (confirm(`Charger le projet "${project.name}" ?`)) {
      // Vider le canvas actuel
      clearCanvas();
      
      // Restaurer tous les éléments du projet
      // Chaque élément est ajouté un par un avec son ID, position, taille, etc.
      project.elements.forEach(el => addElement(el));
      
      // Fermer le modal
      onClose();
      
      // Notification de succès
      alert('Projet chargé !');
    }
  };

  /**
   * Supprime définitivement un projet de IndexedDB
   * 
   * Sécurité :
   * - Double confirmation (nom du projet affiché)
   * - Action irréversible
   * 
   * Après suppression :
   * - Recharge la liste des projets pour mettre à jour l'UI
   * 
   * @param project - Le projet à supprimer
   */
  const handleDeleteProject = async (project: Project) => {
    if (confirm(`Supprimer définitivement le projet "${project.name}" ?`)) {
      try {
        // Supprimer de la base de données par ID
        await db.projects.delete(project.id);
        
        // Notification de succès
        alert('Projet supprimé !');
        
        // Recharger la liste pour refléter la suppression
        loadProjects();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  // ========================================
  // UTILITAIRES
  // ========================================
  
  /**
   * Formate une date en français lisible
   * 
   * Format de sortie : "25 janv. 2025, 14:30"
   * 
   * @param date - Date à formater
   * @returns Chaîne formatée
   * 
   * @example
   * formatDate(new Date('2025-01-25T14:30:00'))
   * // → "25 janv. 2025, 14:30"
   */
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',     // 01, 02, ..., 31
      month: 'short',     // janv., févr., mars, ...
      year: 'numeric',    // 2025
      hour: '2-digit',    // 00, 01, ..., 23
      minute: '2-digit'   // 00, 01, ..., 59
    });
  };

  // ========================================
  // RENDU DU COMPOSANT
  // ========================================
  
  return (
    // Overlay semi-transparent (fond noir à 50%)
    // Clic sur l'overlay ferme le modal
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      {/* Modal principal (clic ne propage pas à l'overlay) */}
      <div 
        className="w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col rounded-xl shadow-2xl"
        style={{ backgroundColor: '#ffffff' }}
        onClick={(e) => e.stopPropagation()} // Empêcher la fermeture au clic interne
      >
        {/* ======================================== */}
        {/* HEADER                                  */}
        {/* ======================================== */}
        <div 
          className="flex items-center justify-between p-6 border-b"
          style={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb' }}
        >
          <h2 className="text-2xl font-bold" style={{ color: '#1f2937' }}>
            Gestionnaire de projets
          </h2>
          
          {/* Bouton de fermeture (croix) */}
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

        {/* ======================================== */}
        {/* SECTION ACTIONS                         */}
        {/* ======================================== */}
        <div 
          className="p-4 border-b"
          style={{ backgroundColor: '#f9fafb', borderColor: '#e5e7eb' }}
        >
          {/* Bouton "Créer un nouveau projet" */}
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

        {/* ======================================== */}
        {/* LISTE DES PROJETS                       */}
        {/* ======================================== */}
        <div 
          className="flex-1 overflow-y-auto p-4"
          style={{ backgroundColor: '#ffffff' }}
        >
          {/* CAS 1 : Aucun projet */}
          {projects.length === 0 ? (
            <div className="text-center py-12" style={{ color: '#9ca3af' }}>
              <FolderOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Aucun projet sauvegardé</p>
              <p className="text-sm mt-2">
                Créez votre premier projet en ajoutant des composants au canvas
              </p>
            </div>
          ) : (
            // CAS 2 : Liste des projets
            <div className="space-y-3">
              {projects.map((project) => (
                // Carte de projet
                <div
                  key={project.id}
                  className="border-2 rounded-lg p-4 transition-all"
                  style={{ 
                    backgroundColor: '#ffffff', 
                    borderColor: '#e5e7eb'
                  }}
                  // Effet hover : bordure bleue
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#60a5fa'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Informations du projet */}
                    <div className="flex-1 min-w-0">
                      {/* Nom du projet */}
                      <h3 className="text-lg font-semibold truncate" style={{ color: '#1f2937' }}>
                        {project.name}
                      </h3>
                      
                      {/* Métadonnées (date + nombre d'éléments) */}
                      <div className="flex items-center gap-4 mt-2 text-sm" style={{ color: '#6b7280' }}>
                        {/* Date de création */}
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(project.createdAt)}</span>
                        </div>
                        
                        {/* Nombre d'éléments */}
                        <div className="flex items-center gap-1">
                          <span className="font-medium">{project.elements.length}</span>
                          <span>élément{project.elements.length > 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Boutons d'actions */}
                    <div className="flex items-center gap-2">
                      {/* Bouton "Charger" */}
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
                      
                      {/* Bouton "Supprimer" */}
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

        {/* ======================================== */}
        {/* FOOTER                                  */}
        {/* ======================================== */}
        <div 
          className="p-4 border-t text-center text-sm"
          style={{ 
            backgroundColor: '#f9fafb', 
            borderColor: '#e5e7eb',
            color: '#6b7280'
          }}
        >
          {/* Compteur de projets */}
          {projects.length} projet{projects.length > 1 ? 's' : ''} sauvegardé{projects.length > 1 ? 's' : ''} en mémoire locale
        </div>
      </div>
    </div>
  );
};