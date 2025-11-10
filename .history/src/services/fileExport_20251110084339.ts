/**
 * Service d'export de fichiers vers le système de fichiers du client
 * Utilise l'API File System Access (Chrome/Edge moderne)
 */

export interface ExportOptions {
  projectName: string;
  htmlContent: string;
  cssContent: string;
}

/**
 * Vérifie si l'API File System Access est supportée
 */
export const isFileSystemAccessSupported = (): boolean => {
  return 'showDirectoryPicker' in window;
};

/**
 * Demande à l'utilisateur de choisir un dossier et y exporte les fichiers
 */
export const exportToFileSystem = async (options: ExportOptions): Promise<boolean> => {
  if (!isFileSystemAccessSupported()) {
    // Fallback : téléchargement classique
    return exportAsDownload(options);
  }

  try {
    // Demander à l'utilisateur de choisir un dossier
    const directoryHandle = await (window as any).showDirectoryPicker({
      mode: 'readwrite',
      startIn: 'documents'
    });

    // Créer un sous-dossier avec le nom du projet
    const projectFolderHandle = await directoryHandle.getDirectoryHandle(
      options.projectName,
      { create: true }
    );

    // Écrire le fichier HTML
    const htmlFileHandle = await projectFolderHandle.getFileHandle('index.html', { create: true });
    const htmlWritable = await htmlFileHandle.createWritable();
    await htmlWritable.write(options.htmlContent);
    await htmlWritable.close();

    // Écrire le fichier CSS
    const cssFileHandle = await projectFolderHandle.getFileHandle('styles.css', { create: true });
    const cssWritable = await cssFileHandle.createWritable();
    await cssWritable.write(options.cssContent);
    await cssWritable.close();

    return true;
  } catch (error) {
    if ((error as any).name === 'AbortError') {
      // L'utilisateur a annulé
      return false;
    }
    console.error('Erreur lors de l\'export:', error);
    throw error;
  }
};

/**
 * Export classique par téléchargement (fallback)
 */
export const exportAsDownload = (options: ExportOptions): boolean => {
  try {
    // Télécharger HTML
    const htmlBlob = new Blob([options.htmlContent], { type: 'text/html' });
    const htmlUrl = URL.createObjectURL(htmlBlob);
    const htmlLink = document.createElement('a');
    htmlLink.href = htmlUrl;
    htmlLink.download = `${options.projectName}_index.html`;
    htmlLink.click();
    URL.revokeObjectURL(htmlUrl);

    // Télécharger CSS
    const cssBlob = new Blob([options.cssContent], { type: 'text/css' });
    const cssUrl = URL.createObjectURL(cssBlob);
    const cssLink = document.createElement('a');
    cssLink.href = cssUrl;
    cssLink.download = `${options.projectName}_styles.css`;
    cssLink.click();
    URL.revokeObjectURL(cssUrl);

    return true;
  } catch (error) {
    console.error('Erreur lors du téléchargement:', error);
    return false;
  }
};

/**
 * Export en tant qu'archive ZIP (nécessite une bibliothèque)
 */
export const exportAsZip = async (options: ExportOptions): Promise<void> => {
  // TODO: Implémenter avec JSZip
  alert('🚧 Export ZIP - En développement');
};