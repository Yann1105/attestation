import React from 'react';
import { Trash2 } from 'lucide-react';
import { TemplateElement } from '../../types';

interface RightPanelProps {
  selectedElement: TemplateElement | null;
  onElementUpdate: (elementId: string, updates: Partial<TemplateElement>) => void;
  onElementDelete: (elementId: string) => void;
}

const RightPanel: React.FC<RightPanelProps> = ({
  selectedElement,
  onElementUpdate,
  onElementDelete,
}) => {
  if (!selectedElement) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Propriétés
        </h3>
        <p className="text-gray-500">
          Sélectionnez un élément pour modifier ses propriétés
        </p>
      </div>
    );
  }

  const handleUpdate = (field: keyof TemplateElement, value: any) => {
    onElementUpdate(selectedElement.id, { [field]: value });
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Propriétés
        </h3>
        <button
          onClick={() => onElementDelete(selectedElement.id)}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Supprimer"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Position */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Position
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-500">X</label>
              <input
                type="number"
                value={selectedElement.x}
                onChange={(e) => handleUpdate('x', parseInt(e.target.value) || 0)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500">Y</label>
              <input
                type="number"
                value={selectedElement.y}
                onChange={(e) => handleUpdate('y', parseInt(e.target.value) || 0)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              />
            </div>
          </div>
        </div>

        {/* Size */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Taille
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-500">Largeur</label>
              <input
                type="number"
                value={selectedElement.width}
                onChange={(e) => handleUpdate('width', parseInt(e.target.value) || 0)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500">Hauteur</label>
              <input
                type="number"
                value={selectedElement.height}
                onChange={(e) => handleUpdate('height', parseInt(e.target.value) || 0)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              />
            </div>
          </div>
        </div>

        {/* Text properties */}
        {selectedElement.type === 'text' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Texte
              </label>
              <textarea
                value={selectedElement.content || ''}
                onChange={(e) => handleUpdate('content', e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Police
              </label>
              <select
                value={selectedElement.fontFamily || 'Arial'}
                onChange={(e) => handleUpdate('fontFamily', e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="Arial">Arial</option>
                <option value="Helvetica">Helvetica</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Georgia">Georgia</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Taille
              </label>
              <input
                type="number"
                value={selectedElement.fontSize || 16}
                onChange={(e) => handleUpdate('fontSize', parseInt(e.target.value) || 16)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Couleur
              </label>
              <input
                type="color"
                value={selectedElement.color || '#000000'}
                onChange={(e) => handleUpdate('color', e.target.value)}
                className="w-full h-8 border border-gray-300 rounded"
              />
            </div>
          </>
        )}

        {/* Shape properties */}
        {selectedElement.type === 'shape' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Couleur de fond
            </label>
            <input
              type="color"
              value={selectedElement.backgroundColor || '#cccccc'}
              onChange={(e) => handleUpdate('backgroundColor', e.target.value)}
              className="w-full h-8 border border-gray-300 rounded"
            />
          </div>
        )}

        {/* Common properties */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rotation (°)
          </label>
          <input
            type="number"
            value={selectedElement.rotation || 0}
            onChange={(e) => handleUpdate('rotation', parseInt(e.target.value) || 0)}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Opacité
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={selectedElement.opacity || 1}
            onChange={(e) => handleUpdate('opacity', parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="text-xs text-gray-500 mt-1">
            {(selectedElement.opacity || 1) * 100}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default RightPanel;