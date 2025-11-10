import React, { useState } from 'react';
import { Upload, Plus, X } from 'lucide-react';
import { db } from '../../db/database';
import type { Widget } from '../../types/element';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  onClose: () => void;
  onImport: () => void;
}

export const WidgetImporter: React.FC<Props> = ({ onClose, onImport }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('custom');
  const [html, setHtml] = useState('');
  const [css, setCss] = useState('');
  const [width, setWidth] = useState(200);
  const [height, setHeight] = useState(200);

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    
    if (file.name.endsWith('.html')) {
      // Extraire CSS du HTML si présent
      const styleMatch = text.match(/<style>([\s\S]*?)<\/style>/);
      const cssContent = styleMatch ? styleMatch[1] : '';
      const htmlContent = text.replace(/<style>[\s\S]*?<\/style>/, '').trim();
      
      setHtml(htmlContent);
      setCss(cssContent);
    } else if (file.name.endsWith('.css')) {
      setCss(text);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !html.trim()) {
      alert('⚠️ Nom et HTML requis');
      return;
    }

    const widget: Widget = {
      id: uuidv4(),
      name: name.trim(),
      category,
      html,
      css,
      defaultSize: { width, height },
      createdAt: new Date()
    };

    try {
      await db.widgets.add(widget);
      alert('✅ Widget importé avec succès !');
      onImport();
      onClose();
    } catch (error) {
      alert('❌ Erreur lors de l\'importation');
      console.error(error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Importer un widget</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Informations de base */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom du widget *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Carte produit"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="custom">Personnalisé</option>
                <option value="forms">Formulaires</option>
                <option value="cards">Cartes</option>
                <option value="navigation">Navigation</option>
                <option value="layout">Layout</option>
              </select>
            </div>
          </div>

          {/* Taille par défaut */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Largeur (px)
              </label>
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hauteur (px)
              </label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Import de fichier */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Importer depuis un fichier
            </label>
            <div className="flex gap-2">
              <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 cursor-pointer transition-colors">
                <Upload className="w-5 h-5 text-gray-500" />
                <span className="text-gray-600">Choisir un fichier HTML/CSS</span>
                <input
                  type="file"
                  accept=".html,.css"
                  onChange={handleImportFile}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Code HTML */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Code HTML *
            </label>
            <textarea
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              placeholder="<div class='card'>...</div>"
              rows={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            />
          </div>

          {/* Code CSS */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Code CSS
            </label>
            <textarea
              value={css}
              onChange={(e) => setCss(e.target.value)}
              placeholder=".card { padding: 20px; ... }"
              rows={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Importer le widget
          </button>
        </div>
      </div>
    </div>
  );
};