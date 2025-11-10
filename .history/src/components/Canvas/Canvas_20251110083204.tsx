import React, { useRef } from 'react';
import { useStore } from '../../store/useStore';
import { DraggableElement } from '../DraggableElement/DraggableElement';
import type { ElementType } from '../../types/element';
import { snapPositionToGrid } from '../../utils/snapToGrid';

export const Canvas: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const { elements, addElement, gridSize, showGrid, snapToGrid } = useStore();

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    const componentType = e.dataTransfer.getData('componentType') as ElementType;
    const defaultSize = JSON.parse(e.dataTransfer.getData('defaultSize'));
    
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    let x = e.clientX - rect.left - defaultSize.width / 2;
    let y = e.clientY - rect.top - defaultSize.height / 2;

    // Appliquer le snap to grid si activé
    if (snapToGrid) {
      const snapped = snapPositionToGrid({ x, y }, gridSize);
      x = snapped.x;
      y = snapped.y;
    }

    // S'assurer que l'élément reste dans le canvas
    x = Math.max(0, x);
    y = Math.max(0, y);

    addElement({
      type: componentType,
      position: { x, y },
      size: defaultSize,
      content: getDefaultContent(componentType),
      styles: {},
      attributes: getDefaultAttributes(componentType)
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  // Styles pour la grille
  const gridBackground = showGrid ? {
    backgroundImage: `
      linear-gradient(to right, rgba(0, 0, 0, 0.15) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(0, 0, 0, 0.15) 1px, transparent 1px)
    `,
    backgroundSize: `${gridSize}px ${gridSize}px`
  } : {};

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
      {/* Message d'aide si canvas vide */}
      {elements.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center text-gray-400">
            <div className="text-6xl mb-4">🎨</div>
            <p className="text-xl font-medium">Glissez-déposez des composants ici</p>
            <p className="text-sm mt-2">
            </p>
          </div>
        </div>
      )}
      
      {/* Éléments draggables */}
      {elements.map((element) => (
        <DraggableElement key={element.id} element={element} />
      ))}
    </div>
  );
};

// Fonctions helper pour le contenu par défaut
function getDefaultContent(type: ElementType): string {
  const defaults: Record<ElementType, string> = {
    button: 'Bouton',
    input: '',
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

function getDefaultAttributes(type: ElementType): Record<string, string> {
  const defaults: Record<ElementType, Record<string, string>> = {
    input: { type: 'text', placeholder: 'Entrez du texte...' },
    textarea: { placeholder: 'Entrez du texte...' },
    img: { src: 'https://via.placeholder.com/200', alt: 'Image' },
    button: { type: 'button' },
    form: { method: 'post' },
    label: {},
    h1: {},
    h2: {},
    h3: {},
    p: {},
    div: {}
  };
  return defaults[type] || {};
}