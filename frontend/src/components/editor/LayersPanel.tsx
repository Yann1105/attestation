import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Unlock, Folder, Image, Type, Square } from 'lucide-react';
import { TemplateElement } from '../../types';

interface ContextMenuItem {
  label?: string;
  action?: () => void;
  separator?: boolean;
  disabled?: boolean;
}

interface LayersPanelProps {
  templateElements: TemplateElement[];
  selectedElement: TemplateElement | null;
  onElementSelect: (element: TemplateElement | null) => void;
  onElementUpdate: (elementId: string, updates: Partial<TemplateElement>) => void;
  onElementDelete: (elementId: string) => void;
}

const LayersPanel: React.FC<LayersPanelProps> = ({
  templateElements,
  selectedElement,
  onElementSelect,
  onElementUpdate,
  onElementDelete,
}) => {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; layerId: string } | null>(null);

  const getLayerIcon = (type: TemplateElement['type']) => {
    switch (type) {
      case 'text': return Type;
      case 'shape': return Square;
      case 'image': return Image;
      case 'logo': return Image;
      default: return Image;
    }
  };

  const handleLayerClick = (element: TemplateElement) => {
    onElementSelect(element);
  };

  const handleRightClick = (e: React.MouseEvent, element: TemplateElement) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, layerId: element.id });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  const contextMenuItems: ContextMenuItem[] = [
    // Layer Management
    { label: 'Nouveau calque à partir d\'un duplicata…', action: () => console.log('Duplicate layer') },
    { label: 'Dupliquer le calque…', action: () => console.log('Duplicate layer') },
    { label: 'Supprimer le calque', action: () => console.log('Delete layer') },
    { label: 'Renommer le calque', action: () => console.log('Rename layer') },
    { label: 'Convertir en objet dynamique', action: () => console.log('Convert to smart object') },
    { label: 'Pixelliser (Texte)', action: () => console.log('Rasterize text') },
    { label: 'Fusionner les calques', action: () => console.log('Merge layers') },
    { label: 'Fusionner les calques visibles', action: () => console.log('Merge visible') },
    { label: 'Aplatir l\'image', action: () => console.log('Flatten image') },
    { separator: true },

    // Styles and appearance
    { label: 'Options de fusion…', action: () => console.log('Blending options') },
    { label: 'Copier le style de calque', action: () => console.log('Copy layer style') },
    { label: 'Coller le style de calque', action: () => console.log('Paste layer style') },
    { label: 'Effacer le style de calque', action: () => console.log('Clear layer style') },
    { separator: true },

    // Organization and structure
    { label: 'Créer un masque d\'écrêtage', action: () => console.log('Create clipping mask') },
    { label: 'Libérer le masque d\'écrêtage', action: () => console.log('Release clipping mask'), disabled: true },
    { label: 'Grouper les calques', action: () => console.log('Group layers') },
    { label: 'Dégrouper les calques', action: () => console.log('Ungroup layers') },
    { label: 'Lier les calques', action: () => console.log('Link layers') },
    { label: 'Délier les calques', action: () => console.log('Unlink layers') },
    { label: 'Sélectionner les calques liés', action: () => console.log('Select linked layers') },
    { separator: true },

    // Conversion and content
    { label: 'Convertir en forme', action: () => console.log('Convert to shape') },
    { label: 'Modifier le contenu', action: () => console.log('Edit contents') },
    { label: 'Remplacer le contenu…', action: () => console.log('Replace contents') },
    { label: 'Exporter le contenu…', action: () => console.log('Export contents') },
    { label: 'Convertir en plan de travail', action: () => console.log('Convert to artboard') },
    { separator: true },

    // Masks and transparency
    { label: 'Ajouter un masque de fusion', action: () => console.log('Add layer mask') },
    { label: 'Activer/Désactiver le masque de fusion', action: () => console.log('Enable/disable layer mask') },
    { label: 'Supprimer le masque de fusion', action: () => console.log('Delete layer mask') },
    { label: 'Ajouter un masque vectoriel', action: () => console.log('Add vector mask') },
    { label: 'Lier / Délier le masque', action: () => console.log('Link/unlink mask') },
    { label: 'Appliquer le masque', action: () => console.log('Apply mask') },
    { label: 'Créer un masque d\'écrêtage', action: () => console.log('Create clipping mask') },
    { separator: true },

    // Export and duplication
    { label: 'Dupliquer vers un autre document…', action: () => console.log('Duplicate to document') },
    { label: 'Exporter en tant que…', action: () => console.log('Export as') },
    { label: 'Exportation rapide en PNG', action: () => console.log('Quick export PNG') },
    { separator: true },

    // Advanced functions
    { label: 'Convertir en calque vidéo', action: () => console.log('Convert to video layer') },
    { label: 'Convertir en calque de remplissage', action: () => console.log('Convert to fill layer') },
    { label: 'Convertir en calque normal', action: () => console.log('Convert to normal layer') },
    { label: 'Dupliquer vers un nouveau document', action: () => console.log('Duplicate to new document') },
    { label: 'Convertir en calque de référence', action: () => console.log('Convert to reference layer') },
  ];

  return (
    <div className="w-64 bg-[#2B2B2B] text-white font-['Segoe UI'] h-full flex flex-col" style={{ fontSize: '10px' }}>
      {/* Header */}
      <div className="px-2 py-1.5 border-b border-gray-600">
        <h3 className="text-xs font-semibold">Calques</h3>
      </div>

      {/* Layers List */}
      <div className="flex-1 overflow-y-auto">
        {templateElements.map((element, index) => {
          const IconComponent = getLayerIcon(element.type);
          return (
            <div
              key={element.id}
              className={`px-1.5 py-0.5 mx-0.5 my-0.5 rounded cursor-pointer flex items-center space-x-1 ${
                selectedElement?.id === element.id ? 'bg-blue-300' : 'hover:bg-gray-600'
              }`}
              onClick={() => handleLayerClick(element)}
              onContextMenu={(e) => handleRightClick(e, element)}
            >
              {/* Visibility Toggle */}
              <button
                className="w-3 h-3 flex items-center justify-center"
                onClick={(e) => {
                  e.stopPropagation();
                  onElementUpdate(element.id, { visible: !element.visible });
                }}
                title={element.visible !== false ? 'Masquer le calque' : 'Afficher le calque'}
              >
                {element.visible !== false ? (
                  <Eye className="w-2.5 h-2.5 text-white" />
                ) : (
                  <EyeOff className="w-2.5 h-2.5 text-gray-500" />
                )}
              </button>

              {/* Lock Toggle */}
              <button
                className="w-3 h-3 flex items-center justify-center"
                onClick={(e) => {
                  e.stopPropagation();
                  onElementUpdate(element.id, { locked: !element.locked });
                }}
                title={element.locked ? 'Déverrouiller le calque' : 'Verrouiller le calque'}
              >
                {element.locked ? (
                  <Lock className="w-2.5 h-2.5 text-yellow-400" />
                ) : (
                  <Unlock className="w-2.5 h-2.5 text-gray-400" />
                )}
              </button>

              {/* Layer Icon */}
              <IconComponent className="w-3 h-3 text-gray-300" />

              {/* Layer Name */}
              <span className="flex-1 text-xs truncate">
                {element.type === 'text' ? element.content?.substring(0, 20) || 'Texte' : `${element.type} ${index + 1}`}
              </span>

              {/* Opacity */}
              <span className="text-xs text-gray-400">{Math.round((element.opacity || 1) * 100)}%</span>
            </div>
          );
        })}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <>
          {/* Overlay to close menu */}
          <div
            className="fixed inset-0 z-40"
            onClick={closeContextMenu}
          />

          {/* Menu */}
          <div
            className="fixed z-50 bg-gray-100 border border-gray-300 rounded-md shadow-lg py-0.5 max-h-96 overflow-y-auto"
            style={{
              left: contextMenu.x,
              top: contextMenu.y,
              fontFamily: 'Segoe UI, sans-serif',
              fontSize: '11px'
            }}
          >
            {contextMenuItems.map((item, index) => (
              item.separator ? (
                <div key={index} className="border-t border-gray-300 my-0.5" />
              ) : (
                <button
                  key={index}
                  className={`w-full px-3 py-0.5 text-left text-xs hover:bg-blue-100 text-gray-900 flex items-center space-x-2 ${
                    item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                  onClick={() => {
                    if (!item.disabled && item.action) {
                      item.action();
                    }
                    closeContextMenu();
                  }}
                  disabled={item.disabled}
                >
                  <span>{item.label}</span>
                </button>
              )
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default LayersPanel;