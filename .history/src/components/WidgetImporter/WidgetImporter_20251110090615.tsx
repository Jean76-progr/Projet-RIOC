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
  const [width, setWidth] = useState(300);
  const [height, setHeight] = useState(200);

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      
      if (file.name.endsWith('.html')) {
        // Extraire CSS du HTML si présent
        const styleMatch = text.match(/<style>([\s\S]*?)<\/style>/);
        const cssContent = styleMatch ? styleMatch[1].trim() : '';
        
        // Extraire le body ou tout le contenu
        const bodyMatch = text.match(/<body[^>]*>([\s\S]*?)<\/body>/);
        const htmlContent = bodyMatch ? bodyMatch[1].trim() : text.trim();
        
        setHtml(htmlContent);
        if (cssContent) {
          setCss(cssContent);
        }
        
        // Auto-remplir le nom si vide
        if (!name) {
          const fileName = file.name.replace('.html', '');
          setName(fileName);
        }
      } else if (file.name.endsWith('.css')) {
        setCss(text);
      }
    } catch (error) {
      console.error('Erreur lors de la lecture du fichier:', error);
      alert('❌ Erreur lors de la lecture du fichier');
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert('⚠️ Veuillez entrer un nom pour le widget');
      return;
    }
    
    if (!html.trim()) {
      alert('⚠️ Veuillez entrer le code HTML du widget');
      return;
    }

    const widget: Widget = {
      id: uuidv4(),
      name: name.trim(),
      category,
      html: html.trim(),
      css: css.trim(),
      defaultSize: { width, height },
      createdAt: new Date()
    };

    try {
      await db.widgets.add(widget);
      console.log('Widget ajouté:', widget);
      alert('✅ Widget importé avec succès !');
      onImport();
      onClose();
    } catch (error) {
      console.error('Erreur lors de l\'importation:', error);
      alert('❌ Erreur lors de l\'importation du widget');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
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
          {/* Import de fichier en premier */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <label className="block text-sm font-medium text-blue-900 mb-3">
              📁 Importer depuis un fichier HTML
            </label>
            <label className="flex items-center justify-center gap-3 px-6 py-4 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-500 hover:bg-blue-100 cursor-pointer transition-all">
              <Upload className="w-6 h-6 text-blue-600" />
              <span className="text-blue-700 font-medium">Choisir un fichier HTML</span>
              <input
                type="file"
                accept=".html"
                onChange={handleImportFile}
                className="hidden"
              />
            </label>
            <p className="text-xs text-blue-700 mt-2 text-center">
              Le HTML et CSS seront automatiquement extraits
            </p>
          </div>

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
                min={50}
                max={1000}
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
                min={50}
                max={1000}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
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
              placeholder="<div class='card'>\n  <h2>Mon Widget</h2>\n  <p>Description...</p>\n</div>"
              rows={10}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            />
          </div>

          {/* Code CSS */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Code CSS (optionnel)
            </label>
            <textarea
              value={css}
              onChange={(e) => setCss(e.target.value)}
              placeholder=".card {\n  padding: 20px;\n  border: 1px solid #ddd;\n  border-radius: 8px;\n}"
              rows={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            />
          </div>

          {/* Prévisualisation */}
          {html && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prévisualisation
              </label>
              <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                <style>{css}</style>
                <div dangerouslySetInnerHTML={{ __html: html }} />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50 sticky bottom-0">
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