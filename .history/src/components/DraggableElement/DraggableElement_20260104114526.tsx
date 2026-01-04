import React, { useState, useRef } from "react";
import { Resizable } from "re-resizable";
import { useStore } from "../../store/useStore";
import type { Element } from "../../types/element";
import { snapPositionToGrid, snapSizeToGrid } from "../../utils/snapToGrid";

/**
 * Props du composant DraggableElement
 */
interface Props {
  element: Element; // L'élément à rendre (button, input, widget, etc.)
}

/**
 * Composant DraggableElement - Wrapper interactif pour chaque élément du canvas
 * 
 * Responsabilités :
 * - Rendre l'élément avec son contenu approprié (button, input, widget, etc.)
 * - Permettre le déplacement par drag (glisser-déposer)
 * - Permettre le redimensionnement avec poignées
 * - Gérer la sélection de l'élément
 * - Afficher le bouton de suppression quand sélectionné
 * - Appliquer le magnétisme (snap to grid) automatiquement
 * 
 * Fonctionnalités :
 * - Drag & drop : Maintenir clic gauche et déplacer
 * - Resize : Tirer sur les poignées aux coins/bords
 * - Sélection : Clic simple sur l'élément
 * - Suppression : Bouton × en haut à droite quand sélectionné
 * - Édition inline : Certains éléments sont éditables directement (h1, p, textarea)
 * 
 * @component
 */
export const DraggableElement: React.FC<Props> = ({ element }) => {
  // ========================================
  // HOOKS ET STATE
  // ========================================
  
  // Récupération des fonctions du store global
  const {
    updateElement,      // Met à jour un élément (position, taille, contenu, styles)
    selectElement,      // Sélectionne un élément
    selectedElementId,  // ID de l'élément actuellement sélectionné
    deleteElement,      // Supprime un élément
    gridSize,          // Taille de la grille (10, 20, 30, 50px)
  } = useStore();

  // État local : indique si l'élément est en cours de déplacement
  const [isDragging, setIsDragging] = useState(false);
  
  // Référence : stocke la position de départ du drag pour calculer le déplacement
  const dragStartPos = useRef({ x: 0, y: 0 });
  
  // Vérifie si cet élément est actuellement sélectionné
  const isSelected = selectedElementId === element.id;

  // ========================================
  // GESTION DU DRAG (DÉPLACEMENT)
  // ========================================
  
  /**
   * Déclenché au clic sur l'élément pour commencer le drag
   * 
   * Processus :
   * 1. Vérifie que c'est un clic gauche (button 0)
   * 2. Sélectionne l'élément
   * 3. Calcule l'offset entre le curseur et la position de l'élément
   * 4. Attache des listeners globaux (mousemove, mouseup)
   * 5. À chaque mouvement, calcule la nouvelle position avec snap to grid
   * 6. Au relâchement, nettoie les listeners
   * 
   * @param e - Événement de clic souris
   */
  const handleMouseDown = (e: React.MouseEvent) => {
    // Ignorer les clics droits/milieu
    if (e.button !== 0) return;
    
    // Empêcher la propagation pour ne pas déclencher d'autres handlers
    e.stopPropagation();
    
    // Sélectionner cet élément
    selectElement(element.id);
    
    // Marquer comme étant en train d'être déplacé
    setIsDragging(true);

    // Calculer l'offset entre le curseur et le coin supérieur gauche de l'élément
    // Permet de garder le même point de "prise" pendant tout le drag
    dragStartPos.current = {
      x: e.clientX - element.position.x,
      y: e.clientY - element.position.y,
    };

    /**
     * Handler appelé à chaque mouvement de souris pendant le drag
     * Met à jour la position de l'élément en temps réel
     */
    const handleMouseMove = (e: MouseEvent) => {
      // Calculer la nouvelle position basée sur la position du curseur
      let x = e.clientX - dragStartPos.current.x;
      let y = e.clientY - dragStartPos.current.y;

      // Appliquer le magnétisme (snap to grid) - TOUJOURS ACTIF
      const snapped = snapPositionToGrid({ x, y }, gridSize);
      
      // Empêcher les positions négatives (sortir du canvas par la gauche/haut)
      x = Math.max(0, snapped.x);
      y = Math.max(0, snapped.y);

      // Mettre à jour la position de l'élément dans le store
      updateElement(element.id, { position: { x, y } });
    };

    /**
     * Handler appelé au relâchement de la souris
     * Termine le drag et nettoie les listeners
     */
    const handleMouseUp = () => {
      setIsDragging(false);
      // Retirer les listeners globaux pour éviter les fuites mémoire
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    // Attacher les listeners globaux (document level)
    // Permet de continuer le drag même si le curseur sort de l'élément
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // ========================================
  // GESTION DU RESIZE (REDIMENSIONNEMENT)
  // ========================================
  
  /**
   * Déclenché à la fin du redimensionnement (quand l'utilisateur relâche la poignée)
   * 
   * La bibliothèque `re-resizable` fournit :
   * - _e : événement (non utilisé ici)
   * - _direction : direction du resize (non utilisé ici)
   * - d : delta (différence de taille) { width, height }
   * 
   * @param d - Delta de redimensionnement
   */
  const handleResizeStop = (
    _e: any,
    _direction: any,
    d: any
  ) => {
    // Calculer la nouvelle taille en ajoutant le delta
    let width = element.size.width + d.width;
    let height = element.size.height + d.height;

    // Appliquer le magnétisme sur la taille (snap to grid)
    const snapped = snapSizeToGrid({ width, height }, gridSize);
    width = snapped.width;
    height = snapped.height;

    // Mettre à jour la taille dans le store
    updateElement(element.id, { size: { width, height } });
  };

  // ========================================
  // GESTION DE LA SUPPRESSION
  // ========================================
  
  /**
   * Supprime l'élément du canvas
   * 
   * @param e - Événement de clic sur le bouton de suppression
   */
  const handleDelete = (e: React.MouseEvent) => {
    // Empêcher la propagation pour ne pas déclencher la sélection
    e.stopPropagation();
    
    // Supprimer l'élément du store
    deleteElement(element.id);
  };

  // ========================================
  // RENDU DU CONTENU DE L'ÉLÉMENT
  // ========================================
  
  /**
   * Rend le contenu approprié selon le type d'élément
   * 
   * Trois catégories :
   * 1. Widgets personnalisés (HTML/CSS importé)
   * 2. Éléments éditables inline (h1, p, textarea, button)
   * 3. Éléments standards (input, img, div)
   * 
   * @returns JSX du contenu de l'élément
   */
  const renderContent = () => {
    const commonClasses = "w-full h-full";

    // ========================================
    // CAS 1 : WIDGET PERSONNALISÉ
    // ========================================
    // Si l'élément contient un attribut 'data-widget-id', c'est un widget importé
    if (element.attributes["data-widget-id"]) {
      return (
        <div
          className={commonClasses}
          // dangerouslySetInnerHTML : Injecte du HTML brut (nécessaire pour les widgets)
          // ATTENTION : Peut être dangereux si le HTML n'est pas fiable
          dangerouslySetInnerHTML={{ __html: element.content }}
        />
      );
    }

    // ========================================
    // CAS 2 : ÉLÉMENTS ÉDITABLES INLINE
    // ========================================
    // Ces éléments peuvent être modifiés directement sur le canvas
    switch (element.type) {
      case "button":
      case "h1":
      case "h2":
      case "h3":
      case "p":
      case "label":
        return (
          <input
            type="text"
            value={element.content}
            // À chaque changement, mettre à jour le contenu dans le store
            onChange={(e) =>
              updateElement(element.id, { content: e.target.value })
            }
            // Style spécifique pour les boutons, basique pour les autres
            className={`${commonClasses} ${
              element.type === "button" 
                ? "px-4 py-2 bg-blue-500 text-white rounded text-center" 
                : ""
            }`}
          />
        );
      
      // ========================================
      // CAS 3 : INPUT (non éditable, juste un placeholder)
      // ========================================
      case "input":
        return (
          <input
            className={`${commonClasses} px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500`}
            placeholder={element.attributes.placeholder || element.content}
            type={element.attributes.type || "text"}
          />
        );
      
      // ========================================
      // CAS 4 : TEXTAREA (éditable)
      // ========================================
      case "textarea":
        return (
          <textarea
            className={`${commonClasses} p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
            placeholder={element.attributes.placeholder || element.content}
            value={element.content}
            onChange={(e) =>
              updateElement(element.id, { content: e.target.value })
            }
          />
        );
      
      // ========================================
      // CAS 5 : IMAGE
      // ========================================
      case "img":
        return (
          <img
            src={element.attributes.src || "https://via.placeholder.com/200"}
            alt={element.attributes.alt || element.content}
            className={`${commonClasses} object-cover`}
          />
        );
      
      // ========================================
      // CAS 6 : CONTAINER DIV
      // ========================================
      case "div":
        return (
          <div
            className={`${commonClasses} border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400`}
          >
            Container
          </div>
        );
      
      // ========================================
      // CAS 7 : DÉFAUT (autres types)
      // ========================================
      default:
        return <div className={commonClasses}>{element.content}</div>;
    }
  };

  // ========================================
  // RENDU PRINCIPAL DU COMPOSANT
  // ========================================
  
  return (
    // Composant Resizable de la librairie 're-resizable'
    // Permet de redimensionner l'élément avec des poignées
    <Resizable
      size={element.size} // Taille actuelle de l'élément
      onResizeStop={handleResizeStop} // Callback quand le resize se termine
      grid={[gridSize, gridSize]} // Grille de redimensionnement (snap to grid)
      style={{
        position: "absolute", // Positionnement absolu sur le canvas
        left: element.position.x, // Position X
        top: element.position.y,  // Position Y
        zIndex: isSelected ? 1000 : 1, // Élément sélectionné au premier plan
      }}
      className={`
        ${isSelected ? "ring-2 ring-blue-500 shadow-lg" : "hover:ring-1 hover:ring-gray-300"}
        ${isDragging ? "opacity-70 cursor-grabbing" : "cursor-grab"}
        transition-shadow
      `}
      // Activer les poignées de redimensionnement uniquement si sélectionné
      enable={{
        top: isSelected,           // Poignée en haut
        right: isSelected,         // Poignée à droite
        bottom: isSelected,        // Poignée en bas
        left: isSelected,          // Poignée à gauche
        topRight: isSelected,      // Poignée coin haut-droit
        bottomRight: isSelected,   // Poignée coin bas-droit
        bottomLeft: isSelected,    // Poignée coin bas-gauche
        topLeft: isSelected,       // Poignée coin haut-gauche
      }}
    >
      {/* Div interne qui contient le contenu réel */}
      <div
        onMouseDown={handleMouseDown} // Déclenche le drag
        onClick={() => selectElement(element.id)} // Sélectionne au clic
        className="w-full h-full"
        style={element.styles} // Appliquer les styles CSS personnalisés
      >
        {/* Rendre le contenu approprié */}
        {renderContent()}

        {/* Bouton de suppression (visible seulement si sélectionné) */}
        {isSelected && (
          <button
            onClick={handleDelete}
            className="absolute -top-3 -right-3 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-lg z-10 text-sm font-bold"
            title="Supprimer"
          >
            ×
          </button>
        )}
      </div>
    </Resizable>
  );
};