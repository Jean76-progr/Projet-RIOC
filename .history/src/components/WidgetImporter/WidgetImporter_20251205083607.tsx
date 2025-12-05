import React, { useState, useRef } from 'react';
import { Upload, Plus, X, FileCheck, Sparkles, File } from 'lucide-react';
import { db } from '../../db/database';
import type { Widget } from '../../types/widget'; // ✅ Import depuis types/widget.ts
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
  const [fileName, setFileName] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsImporting(true);

    try {
      const text = await file.text();
      
      if (file.name.endsWith('.html')) {
        const styleMatch = text.match(/<style[^>]*>([\s\S]*?)<\/style>/);
        const cssContent = styleMatch ? styleMatch[1].trim() : '';
        
        const bodyMatch = text.match(/<body[^>]*>([\s\S]*?)<\/body>/);
        let htmlContent = bodyMatch ? bodyMatch[1].trim() : text;
        
        htmlContent = htmlContent
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .trim();
        
        setHtml(htmlContent);
        if (cssContent) {
          setCss(cssContent);
        }
        
        if (!name) {
          const cleanName = file.name
            .replace('.html', '')
            .replace(/[-_]/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
          setName(cleanName);
        }
        
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
      } else if (file.name.endsWith('.css')) {
        setCss(text);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
      }
    } catch (error) {
      console.error('Erreur lors de la lecture du fichier:', error);
      alert('❌ Erreur lors de la lecture du fichier');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
      console.log('✅ Widget ajouté:', widget);
      
      setShowSuccess(true);
      
      setTimeout(() => {
        onImport();
        onClose();
      }, 1000);
      
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
        {showSuccess && (
          <div 
            className="absolute top-4 right-4 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50"
            style={{ backgroundColor: '#10b981', color: '#ffffff' }}
          >
            <Sparkles className="w-5 h-5" />
            <span className="font-medium">Fichier chargé avec succès !</span>
          </div>
        )}

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

        <div className="p-6 space-y-6" style={{ backgroundColor: '#ffffff' }}>
          <div 
            className="border-2 rounded-lg p-6"
            style={{ backgroundColor: '#f0fdf4', borderColor: '#86efac' }}
          >
            <div className="text-center space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".html,.css"
                onChange={handleFileChange}
                className="hidden"
              />
              
              <button
                onClick={handleButtonClick}
                disabled={isImporting}
                className="mx-auto px-8 py-4 border-2 border-dashed rounded-xl transition-all flex items-center gap-3"
                style={{ 
                  borderColor: '#22c55e',
                  backgroundColor: isImporting ? '#f0fdf4' : '#ffffff',
                  color: '#15803d',
                  cursor: isImporting ? 'wait' : 'pointer'
                }}
              >
                {isImporting ? (
                  <>
                    <div 
                      className="w-6 h-6 rounded-full animate-spin"
                      style={{ 
                        border: '3px solid #16a34a',
                        borderTopColor: 'transparent'
                      }}
                    />
                    <span className="font-semibold text-lg">Chargement...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-7 h-7" />
                    <div className="text-left">
                      <div className="font-semibold text-lg">Choisir un fichier HTML ou CSS</div>
                      <div className="text-sm opacity-75">Cliquez pour parcourir</div>
                    </div>
                    <Plus className="w-6 h-6 ml-2" />
                  </>
                )}
              </button>

              {fileName && (
                <div 
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg"
                  style={{ backgroundColor: '#dcfce7', color: '#15803d' }}
                >
                  <FileCheck className="w-5 h-5" />
                  <File className="w-4 h-4" />
                  <span className="font-medium">{fileName}</span>
                </div>
              )}

              <p className="text-sm" style={{ color: '#15803d' }}>
                💡 Les fichiers HTML et CSS seront automatiquement extraits
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1 h-px" style={{ backgroundColor: '#e5e7eb' }} />
            <span className="text-sm font-medium" style={{ color: '#6b7280' }}>
              Ou saisissez manuellement
            </span>
            <div className="flex-1 h-px" style={{ backgroundColor: '#e5e7eb' }} />
          </div>

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
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                Largeur par défaut (px)
              </label>
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
                min={50}
                max={1000}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ 
                  borderColor: '#d1d5db',
                  backgroundColor: '#ffffff',
                  color: '#1f2937'
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                Hauteur par défaut (px)
              </label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                min={50}
                max={1000}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ 
                  borderColor: '#d1d5db',
                  backgroundColor: '#ffffff',
                  color: '#1f2937'
                }}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
              Code HTML *
            </label>
            <textarea
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              placeholder="<div class='mon-widget'>&#10;  <h3>Titre</h3>&#10;  <p>Description...</p>&#10;</div>"
              rows={10}
              className="w-full px-4 py-3 border rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ 
                borderColor: '#d1d5db',
                backgroundColor: '#f9fafb',
                color: '#1f2937'
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
              Code CSS (optionnel)
            </label>
            <textarea
              value={css}
              onChange={(e) => setCss(e.target.value)}
              placeholder=".mon-widget {&#10;  padding: 20px;&#10;  background: #fff;&#10;  border-radius: 8px;&#10;}"
              rows={8}
              className="w-full px-4 py-3 border rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ 
                borderColor: '#d1d5db',
                backgroundColor: '#f9fafb',
                color: '#1f2937'
              }}
            />
          </div>

          {html && (
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                📋 Prévisualisation
              </label>
              <div 
                className="border-2 rounded-lg p-6"
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

        <div 
          className="flex items-center justify-end gap-3 p-6 border-t sticky bottom-0"
          style={{ 
            backgroundColor: '#f9fafb',
            borderColor: '#e5e7eb'
          }}
        >
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg transition-colors font-medium"
            style={{ color: '#374151', backgroundColor: '#ffffff', border: '1px solid #d1d5db' }}
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || !html.trim()}
            className="px-6 py-2 rounded-lg transition-colors flex items-center gap-2 font-medium"
            style={{ 
              backgroundColor: (!name.trim() || !html.trim()) ? '#9ca3af' : '#2563eb', 
              color: '#ffffff',
              cursor: (!name.trim() || !html.trim()) ? 'not-allowed' : 'pointer',
              opacity: (!name.trim() || !html.trim()) ? 0.6 : 1
            }}
          >
            <Plus className="w-5 h-5" />
            Importer le widget
          </button>
        </div>
      </div>
    </div>
  );
};