import React, { useState } from 'react';
import { X, Download, FolderOpen, FileArchive, AlertCircle } from 'lucide-react';
import { exportToFileSystem, exportAsDownload, isFileSystemAccessSupported } from '../../services/fileExport';
import JSZip from 'jszip';

interface Props {
  onClose: () => void;
  htmlContent: string;
  cssContent: string;
}

export const ExportModal: React.FC<Props> = ({ onClose, htmlContent, cssContent }) => {
  const [projectName, setProjectName] = useState('mon-projet');
  const [exportMethod, setExportMethod] = useState<'filesystem' | 'download' | 'zip'>('filesystem');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!projectName.trim()) {
      alert('⚠️ Veuillez entrer un nom de projet');
      return;
    }

    setIsExporting(true);

    try {
      const options = {
        projectName: projectName.trim(),
        htmlContent,
        cssContent
      };

      let success = false;

      switch (exportMethod) {
        case 'filesystem':
          if (isFileSystemAccessSupported()) {
            success = await exportToFileSystem(options);
            if (success) {
              alert('✅ Projet exporté avec succès !');
              onClose();
            }
          } else {
            alert('❌ Votre navigateur ne supporte pas cette fonctionnalité. Utilisez Chrome/Edge.');
            setExportMethod('download');
          }
          break;

        case 'download':
          success = exportAsDownload(options);
          if (success) {
            alert('✅ Fichiers téléchargés !');
            onClose();
          }
          break;

        case 'zip':
          await exportAsZipFile(options);
          alert('✅ Archive ZIP téléchargée !');
          onClose();
          break;
      }
    } catch (error) {
      console.error('Erreur d\'export:', error);
      alert('❌ Erreur lors de l\'export');
    } finally {
      setIsExporting(false);
    }
  };

  const exportAsZipFile = async (options: { projectName: string; htmlContent: string; cssContent: string }) => {
    const zip = new JSZip();
    
    // Créer un dossier avec le nom du projet
    const folder = zip.folder(options.projectName);
    
    if (folder) {
      folder.file('index.html', options.htmlContent);
      folder.file('styles.css', options.cssContent);
      
      // Ajouter un README
      folder.file('README.txt', `Projet: ${options.projectName}\nGénéré par EasyFront\nDate: ${new Date().toLocaleString()}`);
    }

    // Générer le ZIP
    const content = await zip.generateAsync({ type: 'blob' });
    
    // Télécharger
    const url = URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${options.projectName}.zip`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Exporter le projet</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Nom du projet */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom du projet
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="mon-projet"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Méthode d'export */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Méthode d'export
            </label>
            <div className="space-y-3">
              {/* Export vers dossier */}
              <label className={`flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                exportMethod === 'filesystem'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="exportMethod"
                  value="filesystem"
                  checked={exportMethod === 'filesystem'}
                  onChange={(e) => setExportMethod(e.target.value as any)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <FolderOpen className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-gray-800">Sauvegarder dans un dossier</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Choisissez un dossier sur votre ordinateur où sauvegarder les fichiers
                  </p>
                  {!isFileSystemAccessSupported() && (
                    <div className="flex items-center gap-2 mt-2 text-orange-600 text-xs">
                      <AlertCircle className="w-4 h-4" />
                      <span>Non supporté par votre navigateur</span>
                    </div>
                  )}
                </div>
              </label>

              {/* Téléchargement simple */}
              <label className={`flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                exportMethod === 'download'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="exportMethod"
                  value="download"
                  checked={exportMethod === 'download'}
                  onChange={(e) => setExportMethod(e.target.value as any)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Download className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-gray-800">Télécharger les fichiers</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Télécharge index.html et styles.css dans votre dossier de téléchargements
                  </p>
                </div>
              </label>

              {/* Export ZIP */}
              <label className={`flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                exportMethod === 'zip'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="exportMethod"
                  value="zip"
                  checked={exportMethod === 'zip'}
                  onChange={(e) => setExportMethod(e.target.value as any)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <FileArchive className="w-5 h-5 text-purple-600" />
                    <span className="font-medium text-gray-800">Archive ZIP</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Télécharge tous les fichiers dans une archive ZIP compressée
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Fichiers qui seront exportés :</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>index.html ({Math.round(htmlContent.length / 1024)} Ko)</li>
                  <li>styles.css ({Math.round(cssContent.length / 1024)} Ko)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            disabled={isExporting}
          >
            Annuler
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Export en cours...
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                Exporter
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};