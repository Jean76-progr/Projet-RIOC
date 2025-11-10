import React, { useState, useEffect } from 'react';
import { 
  MousePointerClick, 
  Type, 
  FileText, 
  Square, 
  Heading1, 
  AlignLeft, 
  Image as ImageIcon,
  Plus,
  Package
} from 'lucide-react';
import type { ElementType } from '../../types/element';
import { db } from '../../db/database';
import type { Widget } from '../../types/element';
import { WidgetImporter } from '../WidgetImporter/WidgetImporter';

interface ComponentTemplate {
  type: ElementType;
  label: string;
  Icon: React.ComponentType<any>;
  defaultSize: { width: number; height: number };
}

const builtInTemplates: ComponentTemplate[] = [
  { type: 'button', label: 'Bouton', Icon: MousePointerClick, defaultSize: { width: 120, height: 40 } },
  { type: 'input', label: 'Input', Icon: Type, defaultSize: { width: 200, height: 40 } },
  { type: 'textarea', label: 'Textarea', Icon: FileText, defaultSize: { width: 300, height: 100 } },
  { type: 'div', label: 'Container', Icon: Square, defaultSize: { width: 300, height: 200 } },
  { type: 'h1', label: 'Titre H1', Icon: Heading1, defaultSize: { width: 200, height: 40 } },
  { type: 'p', label: 'Paragraphe', Icon: AlignLeft, defaultSize: { width: 300, height: 60 } },
  { type: 'img', label: 'Image', Icon: ImageIcon, defaultSize: { width: 200, height: 200 } },
];

export const Sidebar: React.FC = () => {
  const [showImporter, setShowImporter] = useState(false);
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [activeTab, setActiveTab] = useState<'builtin' | 'custom'>('builtin');

  const loadWidgets = async () => {
    try {
      const allWidgets = await db.widgets.toArray();
      console.log('Widgets chargés:', allWidgets);
      setWidgets(allWidgets);
    } catch (error) {
      console.error('Erreur lors du chargement des widgets:', error);
    }
  };

  useEffect(() => {
    loadWidgets();
  }, []);

  const handleOpenImporter = () => {
    console.log('Ouverture du modal d\'import');
    setShowImporter(true);
  };

  const handleCloseImporter = () => {
    console.log('Fermeture du modal d\'import');
    setShowImporter(false);
  };

  const handleImportSuccess = () => {
    console.log('Widget importé avec succès');
    loadWidgets();
  };

  return (
    <>
      <div className="h-full bg-gray-50 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800 mb-3">Composants</h2>
          
          {/* Tabs */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setActiveTab('builtin')}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'builtin'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              Basiques
            </button>
            <button
              onClick={() => setActiveTab('custom')}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'custom'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              Widgets ({widgets.length})
            </button>
          </div>

          {/* Bouton importer */}
          {activeTab === 'custom' && (
            <button
              onClick={handleOpenImporter}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Importer un widget
            </button>
          )}
        </div>

        {/* Liste des composants */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {activeTab === 'builtin' ? (
            // Composants built-in
            builtInTemplates.map((template) => {
              const Icon = template.Icon;
              return (
                <div
                  key={template.type}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('componentType', template.type);
                    e.dataTransfer.setData('defaultSize', JSON.stringify(template.defaultSize));
                    e.dataTransfer.setData('isBuiltIn', 'true');
                  }}
                  className="p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-all cursor-move border border-gray-200 hover:border-blue-400"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-gray-700 text-sm">{template.label}</span>
                  </div>
                </div>
              );
            })
          ) : (
            // Widgets personnalisés
            widgets.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Aucun widget personnalisé</p>
                <p className="text-xs mt-1">Cliquez sur "Importer un widget"</p>
              </div>
            ) : (
              widgets.map((widget) => (
                <div
                  key={widget.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('widgetId', widget.id);
                    e.dataTransfer.setData(
                      'defaultSize',
                      JSON.stringify(
                        (
                          (widget as unknown as { defaultSize?: { width: number; height: number } })
                            .defaultSize ?? { width: 200, height: 200 }
                        )
                      )
                    );
                    e.dataTransfer.setData('isBuiltIn', 'false');
                  }}
                  className="p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-all cursor-move border border-gray-200 hover:border-purple-400"
                >
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-purple-600" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-700 text-sm truncate">{widget.name}</p>
                      <p className="text-xs text-gray-500">{widget.category}</p>
                    </div>
                  </div>
                </div>
              ))
            )
          )}
        </div>
      </div>

      {/* Modal d'import - TOUJOURS RENDU */}
      {showImporter && (
        <WidgetImporter
          onClose={handleCloseImporter}
          onImport={handleImportSuccess}
        />
      )}
    </>
  );
};