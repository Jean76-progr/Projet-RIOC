import React from 'react';
import { ElementType } from '../../types/Element';

interface ComponentTemplate {
  type: ElementType;
  label: string;
  icon: string;
  defaultSize: { width: number; height: number };
}

const templates: ComponentTemplate[] = [
  { type: 'button', label: 'Bouton', icon: '🔘', defaultSize: { width: 120, height: 40 } },
  { type: 'input', label: 'Input', icon: '📝', defaultSize: { width: 200, height: 40 } },
  { type: 'textarea', label: 'Textarea', icon: '📄', defaultSize: { width: 300, height: 100 } },
  { type: 'div', label: 'Container', icon: '📦', defaultSize: { width: 300, height: 200 } },
  { type: 'h1', label: 'Titre H1', icon: '🔤', defaultSize: { width: 200, height: 40 } },
  { type: 'p', label: 'Paragraphe', icon: '📰', defaultSize: { width: 300, height: 60 } },
  { type: 'img', label: 'Image', icon: '🖼️', defaultSize: { width: 200, height: 200 } },
];

export const Sidebar: React.FC = () => {
  return (
    <div className="w-64 bg-gray-100 p-4 border-r border-gray-300 overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">Composants</h2>
      <div className="space-y-2">
        {templates.map((template) => (
          <div
            key={template.type}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('componentType', template.type);
              e.dataTransfer.setData('defaultSize', JSON.stringify(template.defaultSize));
            }}
            className="p-3 bg-white rounded shadow cursor-move hover:shadow-lg transition-shadow"
          >
            <span className="text-2xl mr-2">{template.icon}</span>
            <span className="font-medium">{template.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};