import React, { useRef } from 'react';
import { useStore } from '../../store/useStore';
import { DraggableElement } from '../DraggableElement/DraggableElement';
import type { ElementType } from '../../types/element';
import { snapPositionToGrid } from '../../utils/snapToGrid';
import { db } from '../../db/database';

/**
 * Composant Canvas - Zone de travail principale
 * 
 * Responsabilités :
 * - Afficher la grille de positionnement
 * - Gérer le drag & drop des composants depuis la Sidebar
 * - Gérer le drop des widgets personnalisés
 * - Appliquer le magnétisme (snap to grid) automatiquement
 * - Rendre tous les éléments du projet
 * 
 * @component
 */
export const Canvas: React.FC = () => {
  // Référence au conteneur du canvas pour calculer les positions relatives
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Récupération du state global : liste des éléments, fonction d'ajout, taille de grille
  const { elements, addElement, gridSize } = useStore();

  /**
   * Gestion du drop d'un élément sur le canvas
   * 
   * Deux cas possibles :
   * 1. Composant built-in (button, input, etc.) → isBuiltIn = true
   * 2. Widget personnalisé importé → isBuiltIn = false
   * 
   * @param e - Événement de drag and drop React
   */
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    
    // Déterminer si c'est un composant natif ou un widget personnalisé
    const isBuiltIn = e.dataTransfer.getData('isBuiltIn') === 'true';
    
    if (!canvasRef.current) return;
    
    // Calculer la position du drop relative au canvas
    const rect = canvasRef.current.getBoundingClientRect();

    if (isBuiltIn) {
      // ========================================
      // CAS 1 : COMPOSANT BUILT-IN (natif)
      // ========================================
      
      // Récupérer le type de composant (button, input, div, etc.)
      const componentType = e.dataTransfer.getData('componentType') as ElementType;
      
      // Récupérer la taille par défaut (avec fallback si absente)
      let rawSize = e.dataTransfer.getData('defaultSize');
      if (!rawSize) {
        console.warn("Aucun defaultSize trouvé, utilisation de valeurs par défaut.");
        rawSize = JSON.stringify({ width: 300, height: 200 }); // fallback par défaut
      }
      const defaultSize = JSON.parse(rawSize);

      // Calculer la position de drop (centré sur le curseur)
      let x = e.clientX - rect.left - defaultSize.width / 2;
      let y = e.clientY - rect.top - defaultSize.height / 2;

      // Appliquer le magnétisme (snap to grid) - TOUJOURS ACTIF
      const snapped = snapPositionToGrid({ x, y }, gridSize);
      x = Math.max(0, snapped.x); // Empêcher les positions négatives
      y = Math.max(0, snapped.y);

      // Ajouter l'élément au store global
      addElement({
        type: componentType,
        position: { x, y },
        size: defaultSize,
        content: getDefaultContent(componentType), // Contenu par défaut selon le type
        styles: {}, // Styles CSS personnalisés (vide au départ)
        attributes: getDefaultAttributes(componentType) // Attributs HTML par défaut
      });
      
    } else {
      // ========================================
      // CAS 2 : WIDGET PERSONNALISÉ
      // ========================================
      
      // Récupérer l'ID du widget depuis les données de drag
      const widgetId = e.dataTransfer.getData('widgetId');
      console.log('Drop widget ID:', widgetId);
      
      try {
        // Chercher le widget dans IndexedDB
        const widget = await db.widgets.get(widgetId);
        console.log('Widget trouvé:', widget);
        
        // Vérifier que le widget existe
        if (!widget) {
          console.error('Widget non trouvé dans la base de données');
          alert('Widget introuvable');
          return;
        }

        // Récupérer la taille par défaut du widget
        let rawSize = e.dataTransfer.getData('defaultSize');
        if (!rawSize) {
          console.warn("Aucun defaultSize trouvé, utilisation de valeurs par défaut.");
          rawSize = JSON.stringify({ width: 300, height: 200 });
        }
        const defaultSize = JSON.parse(rawSize);

        // Calculer la position de drop (centré sur le curseur)
        let x = e.clientX - rect.left - defaultSize.width / 2;
        let y = e.clientY - rect.top - defaultSize.height / 2;

        // Appliquer le magnétisme (snap to grid)
        const snapped = snapPositionToGrid({ x, y }, gridSize);
        x = Math.max(0, snapped.x);
        y = Math.max(0, snapped.y);

        // Ajouter le widget comme un élément de type 'div'
        // Le HTML et CSS du widget sont stockés dans les attributs
        addElement({
          type: 'div' as ElementType, // Les widgets sont toujours des div
          position: { x, y },
          size: defaultSize,
          content: widget.html, // Code HTML du widget
          styles: {},
          attributes: {
            'data-widget-id': widget.id,        // ID pour retrouver le widget
            'data-widget-name': widget.name,    // Nom pour le CSS généré
            'data-widget-css': widget.css       // Styles CSS du widget
          }
        });

        console.log('Widget ajouté au canvas');
        
      } catch (error) {
        console.error('Erreur lors du drop du widget:', error);
        alert('Erreur lors de l\'ajout du widget');
      }
    }
  };

  /**
   * Gestion du survol pendant le drag
   * Nécessaire pour permettre le drop sur la zone
   * 
   * @param e - Événement de drag over
   */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy'; // Afficher l'icône "copier"
  };

  // ========================================
  // STYLE DE LA GRILLE (toujours visible)
  // ========================================
  const gridBackground = {
    backgroundImage: `
      linear-gradient(to right, rgba(0, 0, 0, 0.1) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(0, 0, 0, 0.1) 1px, transparent 1px)
    `,
    backgroundSize: `${gridSize}px ${gridSize}px` // Taille dynamique de la grille
  };

  return (
    <div
      ref={canvasRef}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className="h-full bg-white relative"
      style={{
        ...gridBackground,
        minWidth: '100%',
        minHeight: '100%'
      }}
    >
      {/* Rendu de tous les éléments du projet */}
      {/* Chaque élément est draggable et resizable via DraggableElement */}
      {elements.map((element) => (
        <DraggableElement key={element.id} element={element} />
      ))}
    </div>
  );
};

/**
 * Retourne le contenu textuel par défaut selon le type d'élément
 * 
 * @param type - Type d'élément HTML (button, h1, p, etc.)
 * @returns Contenu par défaut de l'élément
 * 
 * @example
 * getDefaultContent('button') → 'Bouton'
 * getDefaultContent('h1') → 'Titre H1'
 */
function getDefaultContent(type: ElementType): string {
  const defaults: Record<ElementType, string> = {
    button: 'Bouton',
    input: '',              // Les inputs n'ont pas de contenu textuel
    textarea: '',
    label: 'Label',
    h1: 'Titre H1',
    h2: 'Titre H2',
    h3: 'Titre H3',
    p: 'Paragraphe de texte',
    img: 'Image',
    div: 'Container',
    form: 'Formulaire'
  };
  return defaults[type] || 'Element';
}

/**
 * Retourne les attributs HTML par défaut selon le type d'élément
 * 
 * @param type - Type d'élément HTML
 * @returns Objet contenant les attributs HTML par défaut
 * 
 * @example
 * getDefaultAttributes('input') → { type: 'text', placeholder: '...' }
 * getDefaultAttributes('img') → { src: '...', alt: 'Image' }
 */
function getDefaultAttributes(type: ElementType): Record<string, string> {
  const defaults: Record<ElementType, Record<string, string>> = {
    input: { 
      type: 'text', 
      placeholder: 'Entrez du texte...' 
    },
    textarea: { 
      placeholder: 'Entrez du texte...' 
    },
    img: { 
      src: 'https://via.placeholder.com/200', // Image placeholder par défaut
      alt: 'Image' 
    },
    button: { 
      type: 'button' 
    },
    form: { 
      method: 'post' 
    },
    // Éléments sans attributs spéciaux
    label: {},
    h1: {},
    h2: {},
    h3: {},
    p: {},
    div: {}
  };
  return defaults[type] || {};
}