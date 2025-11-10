import React, { useState, useRef, useCallback } from 'react';
import { Upload, Plus, X, FileCheck, Sparkles } from 'lucide-react';
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
  const [fileName, setFileName] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const extractContentFromHTML = useCallback((text: string) => {
    // Extraire CSS
    const styleMatch = text.match(/<style[^>]*>([\s\S]*?)<\/style>/);
    const cssContent = styleMatch ? styleMatch[1].trim() : '';
    
    // Extraire HTML du body
    const bodyMatch = text.match(/<body[^>]*>([\s\S]*?)<\/body>/);
    let htmlContent = bodyMatch ? bodyMatch[1].trim() : text;
    
    // Nettoyer les balises script, style et link du HTML
    htmlContent = htmlContent
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<link[^>]*>[\s\S]*?>/gi, '')
      .trim();
    
    return { htmlContent, cssContent };
  }, []);

  const handleFileChange = async (e: { target: { files: FileList | null } } | React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsImporting(true);

    try {
      const text = await file.text();
      
      if (file.name.endsWith('.html')) {
        const { htmlContent, cssContent } = extractContentFromHTML(text);
        
        setHtml(htmlContent);
        if (cssContent) {
          setCss(cssContent);
        }
        
        // Auto-remplir le nom
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
      // Reset l'input file pour permettre de re-sélectionner le même fichier
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
      
      // Animation de succès
      setShowSuccess(true);
      
      // Attendre un peu avant de fermer
      setTimeout(() => {
        onImport();
        onClose();
      }, 1000);
      
    } catch (error) {
      console.error('Erreur lors de l\'importation:', error);
      alert('❌ Erreur lors de l\'importation du widget');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.name.endsWith('.html') || file.name.endsWith('.css')) {
        // Créer un faux event pour réutiliser handleFileChange
        const fakeEvent = {
          target: { files: [file] as unknown as FileList }
        };
        handleFileChange(fakeEvent);
      } else {
        alert('❌ Veuillez importer un fichier HTML ou CSS');
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Notification de succès */}
        {showSuccess && (
          <div className="absolute top-4 right-4 px-6 py-3 bg-green-500 text-white rounded-lg shadow-lg flex items-center gap-2 animate-bounce z-1000">
            <Sparkles className="w-5 h-5" />
            <span className="font-medium">Widget importé avec succès !</span>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
          <h2 className="text-2xl font-bold text-gray-800">
            Importer un widget
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full transition-colors hover:bg-gray-100"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 bg-white">
          {/* Zone d'import de fichier avec drag & drop */}
          <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
            <div className="text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept=".html,.css"
                onChange={handleFileChange}
                className="hidden"
              />
              
              <label
                htmlFor="widget-file"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={`mx-auto px-8 py-4 border-2 border-dashed border-green-500 rounded-xl transition-all flex items-center gap-3 cursor-pointer bg-white text-green-700 ${
                  isImporting ? 'opacity-70 cursor-wait' : 'hover:bg-green-50 hover:border-green-600'
                }`}
              >
                {isImporting ? (
                  <>
                    <div className="w-6 h-6 border-3 border-green-600 border-t-transparent rounded-full animate-spin" />
                    <span className="font-semibold text-lg">Importation...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-7 h-7" />
                    <div className="text-left">
                      <div className="font-semibold text-lg">Choisir un fichier HTML ou CSS</div>
                      <div className="text-sm opacity-75">
                        Cliquez pour parcourir ou glissez-déposez un fichier
                      </div>
                    </div>
                  </>
                )}
              </label>

              {fileName && (
                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg">
                  <FileCheck className="w-5 h-5" />
                  <span className="font-medium">{fileName}</span>
                </div>
              )}
            </div>
          </div>

          {/* Séparateur */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-sm font-medium text-gray-500">
              Ou saisissez manuellement
            </span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Informations de base */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Nom du widget *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Carte produit"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Catégorie
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Largeur par défaut (px)
              </label>
              <input
                type="number"
                value={width}
                onChange={(e) => setWidth(Math.max(50, Number(e.target.value)))}
                min={50}
                max={1000}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Hauteur par défaut (px)
              </label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(Math.max(50, Number(e.target.value)))}
                min={50}
                max={1000}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
              />
            </div>
          </div>

          {/* Code HTML */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Code HTML *
            </label>
            <textarea
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              placeholder="<div class='mon-widget'>&#10;  <h3>Titre</h3>&#10;  <p>Description...</p>&#10;</div>"
              rows={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900"
            />
          </div>

          {/* Code CSS */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Code CSS (optionnel)
            </label>
            <textarea
              value={css}
              onChange={(e) => setCss(e.target.value)}
              placeholder=".mon-widget {&#10;  padding: 20px;&#10;  background: #fff;&#10;  border-radius: 8px;&#10;}"
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900"
            />
          </div>

          {/* Prévisualisation */}
          {html && (
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Prévisualisation
              </label>
              <div className="border-2 border-gray-200 rounded-lg p-6 bg-gray-50">
                <style>{css}</style>
                <div 
                  dangerouslySetInnerHTML={{ __html: html }}
                  className="preview-container"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 sticky bottom-0">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg transition-colors font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-100"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || !html.trim()}
            className="px-6 py-2 rounded-lg transition-colors flex items-center gap-2 font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5" />
            Importer le widget
          </button>
        </div>
      </div>
    </div>
  );
};