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
        const styleMatch = text.match(/<style>([\s\S]*?)<\/style>/);
        const cssContent = styleMatch ? styleMatch[1].trim() : '';
        
        const bodyMatch = text.match(/<body[^>]*>([\s\S]*?)<\/body>/);
        const htmlContent = bodyMatch ? bodyMatch[1].trim() : text.trim();
        
        setHtml(htmlContent);
        if (cssContent) {
          setCss(cssContent);
        }
        
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
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div 
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl"
        style={{ backgroundColor: '#ffffff' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between p-6 border-b sticky top-0 z-10"
          style={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb' }}
        >
          <h2 className="text-2xl font-bold" style={{ color: '#1f2937' }}>
            Importer un widget
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full transition-colors"
            style={{ backgroundColor: 'transparent' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X className="w-6 h-6" style={{ color: '#6b7280' }} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6" style={{ backgroundColor: '#ffffff' }}>
          {/* Import de fichier */}
          <div 
            className="border-2 rounded-lg p-4"
            style={{ backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }}
          >
            <label className="block text-sm font-medium mb-3" style={{ color: '#1e3a8a' }}>
              📁 Importer depuis un fichier HTML
            </label>
            <label 
              className="flex items-center justify-center gap-3 px-6 py-4 border-2 border-dashed rounded-lg cursor-pointer transition-all"
              style={{ borderColor: '#93c5fd', backgroundColor: 'transparent' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#3b82f6';
                e.currentTarget.style.backgroundColor = '#dbeafe';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#93c5fd';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <Upload className="w-6 h-6" style={{ color: '#2563eb' }} />
              <span className="font-medium" style={{ color: '#1d4ed8' }}>
                Choisir un fichier HTML
              </span>
              <input
                type="file"
                accept=".html"
                onChange={handleImportFile}
                className="hidden"
              />
            </label>
            <p className="text-xs mt-2 text-center" style={{ color: '#1e40af' }}>
              Le HTML et CSS seront automatiquement extraits
            </p>
          </div>

          {/* Informations de base */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                Nom du widget *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Carte produit"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{ 
                  borderColor: '#d1d5db',
                  backgroundColor: '#ffffff',
                  color: '#1f2937'
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                Catégorie
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{ 
                  borderColor: '#d1d5db',
                  backgroundColor: '#ffffff',
                  color: '#1f2937'
                }}
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
              <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                Largeur (px)
              </label>
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
                min={50}
                max={1000}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{ 
                  borderColor: '#d1d5db',
                  backgroundColor: '#ffffff',
                  color: '#1f2937'
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                Hauteur (px)
              </label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                min={50}
                max={1000}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                style={{ 
                  borderColor: '#d1d5db',
                  backgroundColor: '#ffffff',
                  color: '#1f2937'
                }}
              />
            </div>
          </div>

          {/* Code HTML */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
              Code HTML *
            </label>
            <textarea
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              placeholder="<div class='card'>&#10;  <h2>Mon Widget</h2>&#10;  <p>Description...</p>&#10;</div>"
              rows={10}
              className="w-full px-4 py-3 border rounded-lg font-mono text-sm focus:outline-none focus:ring-2"
              style={{ 
                borderColor: '#d1d5db',
                backgroundColor: '#ffffff',
                color: '#1f2937'
              }}
            />
          </div>

          {/* Code CSS */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
              Code CSS (optionnel)
            </label>
            <textarea
              value={css}
              onChange={(e) => setCss(e.target.value)}
              placeholder=".card {&#10;  padding: 20px;&#10;  border: 1px solid #ddd;&#10;  border-radius: 8px;&#10;}"
              rows={8}
              className="w-full px-4 py-3 border rounded-lg font-mono text-sm focus:outline-none focus:ring-2"
              style={{ 
                borderColor: '#d1d5db',
                backgroundColor: '#ffffff',
                color: '#1f2937'
              }}
            />
          </div>

          {/* Prévisualisation */}
          {html && (
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                Prévisualisation
              </label>
              <div 
                className="border-2 rounded-lg p-4"
                style={{ 
                  borderColor: '#e5e7eb',
                  backgroundColor: '#f9fafb'
                }}
              >
                <style>{css}</style>
                <div dangerouslySetInnerHTML={{ __html: html }} />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div 
          className="flex items-center justify-end gap-3 p-6 border-t sticky bottom-0"
          style={{ 
            backgroundColor: '#f9fafb',
            borderColor: '#e5e7eb'
          }}
        >
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg transition-colors"
            style={{ color: '#374151', backgroundColor: 'transparent' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
            style={{ backgroundColor: '#2563eb', color: '#ffffff' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
          >
            <Plus className="w-5 h-5" />
            Importer le widget
          </button>
        </div>
      </div>
    </div>
  );
};