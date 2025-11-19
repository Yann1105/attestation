import React from 'react';

const PhotoshopShortcutsBar: React.FC = () => {
  const shortcuts = [
    { key: 'Ctrl + N', description: 'Nouveau' },
    { key: 'Ctrl + S', description: 'Enregistrer' },
    { key: 'Ctrl + T', description: 'Transformation libre' },
    { key: 'Ctrl + J', description: 'Dupliquer un calque' },
    { key: 'Ctrl + Z', description: 'Annuler' },
    { key: 'Ctrl + + / -', description: 'Zoom avant / arrière' },
    { key: 'Ctrl + 0', description: "Adapter à l'écran" },
    { key: 'Ctrl + Alt + Z', description: 'Revenir plusieurs fois en arrière' },
  ];

  return (
    <div className="bg-gray-800 text-white px-4 py-2 border-t border-gray-700">
      <div className="flex items-center justify-center space-x-6 text-sm">
        <span className="text-gray-400 mr-4">Raccourcis Windows Photoshop:</span>
        {shortcuts.map((shortcut, index) => (
          <div key={index} className="flex items-center space-x-2">
            <span className="bg-blue-600 px-2 py-1 rounded text-xs font-mono">
              {shortcut.key}
            </span>
            <span className="text-gray-300">→</span>
            <span className="text-white">{shortcut.description}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PhotoshopShortcutsBar;