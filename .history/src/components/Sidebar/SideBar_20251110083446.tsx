import React from 'react';
import { 
  MousePointerClick, 
  Type, 
  FileText, 
  Square, 
  Heading1, 
  AlignLeft, 
  Image as ImageIcon 
} from 'lucide-react';
import type { ElementType } from '../../types/element';

interface ComponentTemplate {
  type: ElementType;
  label: string;
  Icon: React.ComponentType<any>;
  defaultSize: { width: number; height: number };
}

const templates: ComponentTemplate[] = [
  { type: 'button', label: 'Bouton', Icon: MousePointerClick, defaultSize: { width: 120, height: 40 } },
  { type: 'input', label: 'Input', Icon: Type, defaultSize: { width: 200, height: 40 } },
  { type: 'textarea', label: 'Textarea', Icon: FileText, defaultSize: { width: 300, height: 100 } },
  { type: 'div', label: 'Container', Icon: Square, defaultSize: { width: 300, height: 200 } },
  { type: 'h1', label: 'Titre H1', Icon: Heading1, defaultSize: { width: 200, height: 40 } },
  { type: 'p', label: 'Paragraphe', Icon: AlignLeft, defaultSize: { width: 300, height: 60 } },
  { type: 'img', label: 'Image', Icon: ImageIcon, defaultSize: { width: 200, height: 200 } },
];

export const Sidebar: React.FC = () => {
  return (
    <div className="h-full bg-gray-50 p-4 border-r border-gray-200 overflow-y-auto">
      <h2 className="text-lg font-bold mb-4 text-gray-800">Composants</h2>
      <div className="space-y-2">
        {templates.map((template) => {
          const Icon = template.Icon;
          return (
            <div
              key={template.type}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('componentType', template.type);
                e.dataTransfer.setData('defaultSize', JSON.stringify(template.defaultSize));
              }}
              className="p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-all cursor-move border border-gray-200 hover:border-blue-400"
            >
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-700 text-sm">{template.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};