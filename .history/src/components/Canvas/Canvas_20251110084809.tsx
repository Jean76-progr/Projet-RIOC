import React, { useRef } from 'react';
import { useStore } from '../../store/useStore';
import { DraggableElement } from '../DraggableElement/DraggableElement';
import type { ElementType } from '../../types/element';
import { snapPositionToGrid } from '../../utils/snapToGrid';
import { db } from '../../db/database';

export const Canvas: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const { elements, addElement, gridSize, showGrid, snapToGrid } = useStore();

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    
    const isBuiltIn = e.dataTransfer.getData('isBuiltIn') === 'true';
    
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();

    if (isBuiltIn) {
      // Composant built-in
      const componentType = e.dataTransfer.getData('componentType') as ElementType;
      const defaultSize = JSON.parse(e.dataTransfer.getData('defaultSize'));
      
      let x = e.clientX - rect.left - defaultSize.width / 2;
      let y = e.clientY - rect.top - defaultSize.height / 2;

      if (snapToGrid) {
        const snapped = snapPositionToGrid({ x, y }, gridSize);
        x = snapped.x;
        y = snapped.y;
      }

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
    } else {
      // Widget personnalisé
      const widgetId = e.dataTransfer.getData('widgetId');
      const widget = await db.widgets.get(widgetId);
      
      if (!widget) return;

      const defaultSize = JSON.parse(e.dataTransfer.getData('defaultSize'));
      
      let x = e.clientX - rect.left - defaultSize.width / 2;
      let y = e.clientY - rect.top - defaultSize.height / 2;

      if (snapToGrid) {
        const snapped = snapPositionToGrid({ x, y }, gridSize);
        x = snapped.x;
        y = snapped.y;
      }

      x = Math.max(0, x);
      y = Math.max(0, y);

      // Ajouter le widget comme élément personnalisé
      addElement({
        type: 'div' as ElementType,
        position: { x, y },
        size: defaultSize,
        content: widget.html,
        styles: {},
        attributes: {
          'data-widget-id': widget.id,
          'data-widget-name': widget.name,
          'data-widget-css': widget.css
        }
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

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
      {elements.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center text-gray-400">
            <p className="text-sm mt-2">
            </p>
          </div>
        </div>
      )}
      
      {elements.map((element) => (
        <DraggableElement key={element.id} element={element} />
      ))}
    </div>
  );
};

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