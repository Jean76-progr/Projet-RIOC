import React, { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';
import { useStore } from '../../store/useStore';
import { generateHTML, generateCSS, generateCompleteHTML } from '../../utils/codeGenerator';

/**
 * Composant CodeEditor - Éditeur de code Monaco (moteur VS Code)
 * 
 * Responsabilités :
 * - Afficher le code HTML/CSS généré en temps réel
 * - Permettre la modification du code (édition manuelle)
 * - Gérer l'aperçu du rendu dans une nouvelle fenêtre
 * - Permettre le téléchargement des fichiers HTML/CSS
 * 
 * Fonctionnalités :
 * - Onglets HTML/CSS
 * - Coloration syntaxique automatique
 * - Bouton "Aperçu" : ouvre le rendu dans une nouvelle fenêtre
 * - Bouton "Télécharger" : exporte les fichiers HTML et CSS
 * 
 * @component
 */
export const CodeEditor: React.FC = () => {
  // Récupération de la liste des éléments depuis le store global
  const { elements } = useStore();
  
  // Onglet actif (HTML ou CSS)
  const [activeTab, setActiveTab] = useState<'html' | 'css'>('html');
  
  // Code HTML généré (affiché dans l'éditeur)
  const [htmlCode, setHtmlCode] = useState('');
  
  // Code CSS généré (affiché dans l'éditeur)
  const [cssCode, setCssCode] = useState('');

  /**
   * Effet : Régénérer le code à chaque modification des éléments
   * 
   * Déclenché quand :
   * - Un élément est ajouté/supprimé sur le canvas
   * - Un élément est déplacé/redimensionné
   * - Les propriétés d'un élément changent
   * 
   * Synchronisation automatique Canvas → Code Editor
   */
  useEffect(() => {
    // Générer le code HTML (structure uniquement, sans CSS inline)
    setHtmlCode(generateHTML(elements));
    
    // Générer le code CSS (positionnement + styles)
    setCssCode(generateCSS(elements));
  }, [elements]); // Dépendance : se déclenche quand 'elements' change

  /**
   * Télécharger les fichiers HTML et CSS
   * 
   * Processus :
   * 1. Génère un fichier HTML complet (avec CSS intégré dans <style>)
   * 2. Crée un Blob pour le HTML
   * 3. Crée un lien de téléchargement temporaire
   * 4. Déclenche le téléchargement automatique
   * 5. Fait la même chose pour le fichier CSS séparé
   * 6. Nettoie les URLs temporaires après 100ms
   * 
   * Note : L'utilisateur reçoit 2 fichiers :
   * - index.html (avec CSS intégré)
   * - styles.css (fichier CSS séparé)
   */
  const handleDownload = () => {
    // Générer le HTML complet avec CSS intégré dans <style>
    const completeHTML = generateCompleteHTML(elements);
    
    // ========================================
    // TÉLÉCHARGEMENT DU FICHIER HTML
    // ========================================
    const htmlBlob = new Blob([completeHTML], { type: 'text/html' });
    const htmlUrl = URL.createObjectURL(htmlBlob); // Créer une URL temporaire
    const htmlLink = document.createElement('a');
    htmlLink.href = htmlUrl;
    htmlLink.download = 'index.html'; // Nom du fichier téléchargé
    htmlLink.click(); // Déclencher le téléchargement

    // ========================================
    // TÉLÉCHARGEMENT DU FICHIER CSS
    // ========================================
    const cssBlob = new Blob([cssCode], { type: 'text/css' });
    const cssUrl = URL.createObjectURL(cssBlob);
    const cssLink = document.createElement('a');
    cssLink.href = cssUrl;
    cssLink.download = 'styles.css'; // Nom du fichier téléchargé
    cssLink.click();

    // Nettoyer les URLs temporaires pour libérer la mémoire
    setTimeout(() => {
      URL.revokeObjectURL(htmlUrl);
      URL.revokeObjectURL(cssUrl);
    }, 100);
  };

  /**
   * Ouvrir un aperçu du rendu HTML dans une nouvelle fenêtre
   * 
   * Processus :
   * 1. Génère le HTML complet (avec CSS intégré)
   * 2. Ouvre une nouvelle fenêtre/onglet
   * 3. Injecte le HTML dans cette fenêtre
   * 4. L'utilisateur voit le rendu final comme sur un serveur web
   * 
   * Gestion d'erreur :
   * - Si la fenêtre est bloquée par un bloqueur de pop-up,
   *   affiche une alerte pour informer l'utilisateur
   * 
   * Cas d'usage :
   * - Tester le rendu responsive
   * - Vérifier que le code généré fonctionne correctement
   * - Partager rapidement le résultat
   */
  const handlePreview = () => {
    // Générer le HTML complet avec CSS intégré
    const completeHTML = generateCompleteHTML(elements);
    
    // Ouvrir une nouvelle fenêtre vierge
    const previewWindow = window.open('', '_blank');
    
    if (previewWindow) {
      // Si la fenêtre s'est ouverte avec succès
      previewWindow.document.open();              // Commencer à écrire
      previewWindow.document.write(completeHTML); // Injecter le HTML
      previewWindow.document.close();             // Terminer l'écriture
    } else {
      // Si la fenêtre a été bloquée (pop-up blocker)
      alert("La fenêtre d'aperçu n'a pas pu s'ouvrir. Vérifiez les bloqueurs de pop-up.");
    }
  };

  return (
    <div className="h-full bg-gray-900 flex flex-col">
      {/* ======================================== */}
      {/* BARRE D'ONGLETS ET ACTIONS              */}
      {/* ======================================== */}
      <div className="flex bg-gray-800 border-b border-gray-700">
        {/* Onglet HTML */}
        <button
          onClick={() => setActiveTab('html')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'html'
              ? 'bg-gray-900 text-white border-b-2 border-blue-500' // Actif
              : 'text-gray-400 hover:text-white' // Inactif
          }`}
        >
          HTML
        </button>
        
        {/* Onglet CSS */}
        <button
          onClick={() => setActiveTab('css')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'css'
              ? 'bg-gray-900 text-white border-b-2 border-blue-500' // Actif
              : 'text-gray-400 hover:text-white' // Inactif
          }`}
        >
          CSS
        </button>
        
        {/* Bouton Aperçu */}
        {/* Ouvre une nouvelle fenêtre avec le rendu HTML */}
        <button
          onClick={handlePreview}
          className="px-6 py-3 bg-purple-600 text-white hover:bg-purple-700 transition-colors font-medium mr-2"
          title="Aperçu dans une nouvelle fenêtre"
        >
          👀 Aperçu
        </button>
        
        {/* Bouton Télécharger */}
        {/* Télécharge index.html + styles.css */}
        <button
          onClick={handleDownload}
          className="px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium"
        >
          🗃️ Télécharger
        </button>
      </div>

      {/* ======================================== */}
      {/* ÉDITEUR MONACO (VS CODE)                */}
      {/* ======================================== */}
      <div className="flex-1">
        <Editor
          height="100%" // Prend toute la hauteur disponible
          language={activeTab} // 'html' ou 'css' selon l'onglet actif
          value={activeTab === 'html' ? htmlCode : cssCode} // Code à afficher
          theme="vs-dark" // Thème sombre (comme VS Code)
          options={{
            readOnly: false, // Code éditable manuellement
            minimap: { enabled: true }, // Minimap à droite (aperçu du code)
            fontSize: 14, // Taille de la police
            lineNumbers: 'on', // Afficher les numéros de ligne
            scrollBeyondLastLine: false, // Ne pas scroller au-delà de la dernière ligne
            automaticLayout: true, // Redimensionnement automatique
            wordWrap: 'on', // Retour à la ligne automatique
          }}
        />
      </div>
    </div>
  );
};