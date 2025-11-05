import React, { useRef } from 'react';
import { useStore } from '../../store/useStore';
import { DraggableElement } from '../DraggableElement/DraggableElement.tsx';
import type { ElementType } from '../../types/element';

export const Canvas: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const { elements, addElement } = useStore();

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    const componentType = e.dataTransfer.getData('componentType') as ElementType;
    const defaultSize = JSON.parse(e.dataTransfer.getData('defaultSize'));
    
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    addElement({
      type: componentType,
      position: { x, y },
      size: defaultSize,
      content: `${componentType} content`,
      styles: {},
      attributes: {}
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div
      ref={canvasRef}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className="h-full bg-white relative overflow-auto"
      style={{
        backgroundImage: `
          linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 1px)
        `,
        backgroundSize: '20px 20px'
      }}
    >
      {elements.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-lg">
          Glissez-déposez des composants ici 👆
        </div>
      )}
      
      {elements.map((element) => (
        <DraggableElement key={element.id} element={element} />
      ))}
    </div>
  );
};