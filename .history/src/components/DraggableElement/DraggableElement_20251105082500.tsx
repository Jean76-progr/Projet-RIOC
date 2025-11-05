import React, { useState } from 'react';
import { Resizable } from 're-resizable';
import { useStore } from '../../store/useStore';
import { Element } from '../../types/element';

interface Props {
  element: Element;
}

export const DraggableElement: React.FC<Props> = ({ element }) => {
  const { updateElement, selectElement, selectedElementId, deleteElement } = useStore();
  const [isDragging, setIsDragging] = useState(false);
  const isSelected = selectedElementId === element.id;

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    selectElement(element.id);
    
    // Offset pour un drag précis
    const rect = e.currentTarget.getBoundingClientRect();
    e.dataTransfer.setData('offsetX', String(e.clientX - rect.left));
    e.dataTransfer.setData('offsetY', String(e.clientY - rect.top));
    e.dataTransfer.setData('elementId', element.id);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setIsDragging(false);
    
    const canvas = e.currentTarget.closest('.relative');
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const offsetX = parseFloat(e.dataTransfer.getData('offsetX'));
    const offsetY = parseFloat(e.dataTransfer.getData('offsetY'));
    
    const x = e.clientX - rect.left - offsetX;
    const y = e.clientY - rect.top - offsetY;

    updateElement(element.id, {
      position: { x: Math.max(0, x), y: Math.max(0, y) }
    });
  };

  const renderContent = () => {
    switch (element.type) {
      case 'button':
        return <button className="w-full h-full">{element.content}</button>;
      case 'input':
        return <input className="w-full h-full px-2 border" placeholder={element.content} />;
      case 'textarea':
        return <textarea className="w-full h-full p-2 border" placeholder={element.content} />;
      case 'h1':
        return <h1 className="text-3xl font-bold">{element.content}</h1>;
      case 'p':
        return <p>{element.content}</p>;
      case 'div':
        return <div className="w-full h-full border-2 border-dashed border-gray-300 flex items-center justify-center">Container</div>;
      default:
        return <div>{element.content}</div>;
    }
  };

  return (
    <Resizable
      size={element.size}
      onResizeStop={(e, direction, ref, d) => {
        updateElement(element.id, {
          size: {
            width: element.size.width + d.width,
            height: element.size.height + d.height
          }
        });
      }}
      style={{
        position: 'absolute',
        left: element.position.x,
        top: element.position.y,
      }}
      className={`
        ${isSelected ? 'ring-2 ring-blue-500' : ''}
        ${isDragging ? 'opacity-50' : ''}
      `}
    >
      <div
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onClick={() => selectElement(element.id)}
        className="w-full h-full cursor-move"
        style={element.styles}
      >
        {renderContent()}
        
        {/* Bouton de suppression */}
        {isSelected && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteElement(element.id);
            }}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
          >
            ×
          </button>
        )}
      </div>
    </Resizable>
  );
};