import React, { useState, useRef } from 'react';
import { Resizable } from 're-resizable';
import { useStore } from '../../store/useStore';
import type { Element } from '../../types/element';
import { snapPositionToGrid, snapSizeToGrid } from '../../utils/snapToGrid';

interface Props {
  element: Element;
}

export const DraggableElement: React.FC<Props> = ({ element }) => {
  const { 
    updateElement, 
    selectElement, 
    selectedElementId, 
    deleteElement,
    gridSize
  } = useStore();
  
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const isSelected = selectedElementId === element.id;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    
    e.stopPropagation();
    selectElement(element.id);
    setIsDragging(true);
    
    dragStartPos.current = {
      x: e.clientX - element.position.x,
      y: e.clientY - element.position.y
    };

    const handleMouseMove = (e: MouseEvent) => {
      let x = e.clientX - dragStartPos.current.x;
      let y = e.clientY - dragStartPos.current.y;

      // Magnétisme toujours actif
      const snapped = snapPositionToGrid({ x, y }, gridSize);
      x = Math.max(0, snapped.x);
      y = Math.max(0, snapped.y);

      updateElement(element.id, {
        position: { x, y }
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleResizeStop = (_e: any, _direction: any, ref: HTMLElement, d: any) => {
    let width = element.size.width + d.width;
    let height = element.size.height + d.height;

    // Magnétisme toujours actif
    const snapped = snapSizeToGrid({ width, height }, gridSize);
    width = snapped.width;
    height = snapped.height;

    updateElement(element.id, {
      size: { width, height }
    });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteElement(element.id);
  };

  const renderContent = () => {
    const commonClasses = "w-full h-full";
    
    // Si c'est un widget personnalisé
    if (element.attributes['data-widget-id']) {
      return (
        <div 
          className={commonClasses}
          dangerouslySetInnerHTML={{ __html: element.content }}
        />
      );
    }

    // Sinon, composant built-in
    switch (element.type) {
      case 'button':
        return (
          <button className={`${commonClasses} px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors`}>
            {element.content}
          </button>
        );
      case 'input':
        return (
          <input 
            className={`${commonClasses} px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500`}
            placeholder={element.attributes.placeholder || element.content}
            type={element.attributes.type || 'text'}
          />
        );
      case 'textarea':
        return (
          <textarea 
            className={`${commonClasses} p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
            placeholder={element.attributes.placeholder || element.content}
          />
        );
      case 'h1':
        return <h1 className={`${commonClasses} text-4xl font-bold`}>{element.content}</h1>;
      case 'h2':
        return <h2 className={`${commonClasses} text-3xl font-bold`}>{element.content}</h2>;
      case 'h3':
        return <h3 className={`${commonClasses} text-2xl font-bold`}>{element.content}</h3>;
      case 'p':
        return <p className={commonClasses}>{element.content}</p>;
      case 'label':
        return <label className={`${commonClasses} font-medium`}>{element.content}</label>;
      case 'img':
        return (
          <img 
            src={element.attributes.src || 'https://via.placeholder.com/200'} 
            alt={element.attributes.alt || element.content}
            className={`${commonClasses} object-cover`}
          />
        );
      case 'div':
        return (
          <div className={`${commonClasses} border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400`}>
            Container
          </div>
        );
      default:
        return <div className={commonClasses}>{element.content}</div>;
    }
  };

  return (
    <Resizable
      size={element.size}
      onResizeStop={handleResizeStop}
      grid={[gridSize, gridSize]} // Grille toujours active
      style={{
        position: 'absolute',
        left: element.position.x,
        top: element.position.y,
        zIndex: isSelected ? 1000 : 1,
      }}
      className={`
        ${isSelected ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:ring-1 hover:ring-gray-300'}
        ${isDragging ? 'opacity-70 cursor-grabbing' : 'cursor-grab'}
        transition-shadow
      `}
      enable={{
        top: isSelected,
        right: isSelected,
        bottom: isSelected,
        left: isSelected,
        topRight: isSelected,
        bottomRight: isSelected,
        bottomLeft: isSelected,
        topLeft: isSelected
      }}
    >
      <div
        onMouseDown={handleMouseDown}
        onClick={() => selectElement(element.id)}
        className="w-full h-full"
        style={element.styles}
      >
        {renderContent()}
        
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