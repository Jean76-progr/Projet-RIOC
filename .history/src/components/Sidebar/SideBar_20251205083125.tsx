import React, { useState, useEffect, useRef } from 'react';
import {
  MousePointerClick,
  Type,
  FileText,
  Square,
  Heading1,
  AlignLeft,
  Image as ImageIcon,
  Plus,
  Package,
} from 'lucide-react';
import type { ElementType } from '../../types/element';
import { db } from '../../db/database';
import type { Widget } from '../../types/element';
import { WidgetImporter } from '../WidgetImporter/WidgetImporter';
import { useStore } from '../../store/useStore'; // ✅ pour ajouter un élément au canvas

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
  const { addElement } = useStore(); // ✅ pour insérer une image sur le canvas
  const [showImporter, setShowImporter] = useState(false);
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [activeTab, setActiveTab] = useState<'builtin' | 'custom'>('builtin');
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleSelectImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;

      try {
        addElement({
  type: 'img',
  attributes: { src }, // ✅ au lieu de 'properties'
  position: { x: 100, y: 100 },
  size: { width: 200, height: 200 },
  content: '',
  styles: {},
});

      } catch (error) {
        console.error("Erreur lors de l'ajout de l'image :", error);
        alert("❌ Erreur lors de l'import de l'image.");
      }
    };

    reader.readAsDataURL(file);
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

          {/* Bouton importer (uniquement dans l'onglet Widgets) */}
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
            // 🔹 Composants intégrés
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
                  onClick={() => {
                    if (template.type === 'img') {
                      fileInputRef.current?.click(); // 🖼️ ouvre l’explorateur de fichiers
                    }
                  }}
                  className={`p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-all cursor-${
                    template.type === 'img' ? 'pointer' : 'move'
                  } border border-gray-200 hover:border-blue-400`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-gray-700 text-sm">{template.label}</span>
                  </div>
                </div>
              );
            })
          ) : (
            // 🔸 Widgets personnalisés
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

      {/* Input caché pour l’import d’image */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleSelectImage}
        className="hidden"
      />

      {/* Modal d'import de widget */}
      {showImporter && (
        <WidgetImporter onClose={handleCloseImporter} onImport={handleImportSuccess} />
      )}
    </>
  );
};