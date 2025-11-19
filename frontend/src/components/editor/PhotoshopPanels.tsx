import React, { useState } from 'react';
import { Layers, Palette, Settings, History, Type, Sliders, SwatchBook, AlignLeft, Sparkles, Radio, Route, Library } from 'lucide-react';
import { TemplateElement } from '../../types';
import LayersPanel from './LayersPanel';
import DynamicVariablesPanel from './DynamicVariablesPanel';

interface PhotoshopPanelsProps {
   selectedElement: TemplateElement | null;
   onElementUpdate: (elementId: string, updates: Partial<TemplateElement>) => void;
   onElementDelete: (elementId: string) => void;
   onElementSelect: (element: TemplateElement | null) => void;
   templateElements: TemplateElement[];
   onVariableSelect?: (variable: any) => void;
   onVariableDrag?: (variable: any, e: React.DragEvent) => void;
}

const PhotoshopPanels: React.FC<PhotoshopPanelsProps> = ({
   selectedElement,
   onElementUpdate,
   onElementDelete,
   onElementSelect,
   templateElements,
   onVariableSelect,
   onVariableDrag,
}) => {
  const [activePanel, setActivePanel] = useState('properties');

  const panels = [
    { id: 'layers', icon: Layers, label: 'Calques', shortcut: 'F7' },
    { id: 'properties', icon: Settings, label: 'Propriétés' },
    { id: 'history', icon: History, label: 'Historique' },
    { id: 'swatches', icon: SwatchBook, label: 'Nuancier' },
    { id: 'color', icon: Palette, label: 'Couleur', shortcut: 'F6' },
    { id: 'adjustments', icon: Sliders, label: 'Réglages' },
    { id: 'character', icon: Type, label: 'Caractère', shortcut: 'Ctrl + T' },
    { id: 'paragraph', icon: AlignLeft, label: 'Paragraphe' },
    { id: 'styles', icon: Sparkles, label: 'Styles' },
    { id: 'channels', icon: Radio, label: 'Canaux' },
    { id: 'paths', icon: Route, label: 'Tracés' },
    { id: 'libraries', icon: Library, label: 'Bibliothèques' },
  ];

  const handleUpdate = (field: keyof TemplateElement, value: any) => {
    if (selectedElement) {
      onElementUpdate(selectedElement.id, { [field]: value });
    }
  };

  return (
    <div className="w-80 bg-gray-800 text-white flex flex-col h-full" style={{ fontSize: '10px' }}>
      {/* Panel Tabs */}
      <div className="flex border-b border-gray-700">
        {panels.map((panel) => (
          <button
            key={panel.id}
            onClick={() => setActivePanel(panel.id)}
            className={`flex-1 p-1.5 text-xs hover:bg-gray-700 transition-colors flex flex-col items-center ${
              activePanel === panel.id ? 'bg-gray-700' : ''
            }`}
            title={`${panel.label}${panel.shortcut ? ` (${panel.shortcut})` : ''}`}
          >
            <panel.icon className="w-3 h-3 mb-0.5" />
            <span className="text-xs">{panel.label}</span>
          </button>
        ))}
      </div>

      {/* Panel Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activePanel === 'layers' && (
          <LayersPanel
            templateElements={templateElements}
            selectedElement={selectedElement}
            onElementSelect={onElementSelect}
            onElementUpdate={onElementUpdate}
            onElementDelete={onElementDelete}
          />
        )}

        {activePanel === 'color' && (
          <div>
            <h3 className="text-sm font-semibold mb-3">Couleur</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs mb-1">Couleur de premier plan</label>
                <input
                  type="color"
                  defaultValue="#000000"
                  className="w-full h-8 rounded border border-gray-600"
                />
              </div>
              <div>
                <label className="block text-xs mb-1">Couleur d'arrière-plan</label>
                <input
                  type="color"
                  defaultValue="#ffffff"
                  className="w-full h-8 rounded border border-gray-600"
                />
              </div>
              <button className="w-full py-1 px-2 bg-gray-600 hover:bg-gray-500 rounded text-xs">
                Inverser (X)
              </button>
            </div>
          </div>
        )}

        {activePanel === 'properties' && (
          <div>
            <h3 className="text-sm font-semibold mb-3">Propriétés</h3>
            {selectedElement ? (
              <div className="space-y-4">
                {/* Basic Transform Properties */}
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-gray-300 uppercase tracking-wide">Transformation</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs mb-1">X</label>
                      <input
                        type="number"
                        value={Math.round(selectedElement.x)}
                        onChange={(e) => handleUpdate('x', parseInt(e.target.value) || 0)}
                        className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1">Y</label>
                      <input
                        type="number"
                        value={Math.round(selectedElement.y)}
                        onChange={(e) => handleUpdate('y', parseInt(e.target.value) || 0)}
                        className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1">L</label>
                      <input
                        type="number"
                        value={Math.round(selectedElement.width)}
                        onChange={(e) => handleUpdate('width', parseInt(e.target.value) || 0)}
                        className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1">H</label>
                      <input
                        type="number"
                        value={Math.round(selectedElement.height)}
                        onChange={(e) => handleUpdate('height', parseInt(e.target.value) || 0)}
                        className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                      />
                    </div>
                  </div>
                  {selectedElement.rotation && (
                    <div>
                      <label className="block text-xs mb-1">Rotation (°)</label>
                      <input
                        type="number"
                        value={Math.round(selectedElement.rotation)}
                        onChange={(e) => handleUpdate('rotation', parseInt(e.target.value) || 0)}
                        className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                      />
                    </div>
                  )}
                </div>

                {/* Element-specific properties */}
                {selectedElement.type === 'text' && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-gray-300 uppercase tracking-wide">Texte</h4>
                    <div>
                      <label className="block text-xs mb-1">Variable</label>
                      <div className="text-xs text-blue-400 bg-blue-900 bg-opacity-20 px-2 py-1 rounded">
                        {selectedElement.variableName || 'Aucune'}
                      </div>
                    </div>
                  </div>
                )}

                {selectedElement.type === 'shape' && (
                  <div className="space-y-4">
                    {/* Fill Properties */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-medium text-gray-300 uppercase tracking-wide">Remplissage</h4>
                      <div>
                        <label className="block text-xs mb-1">Type</label>
                        <select
                          value={selectedElement.fillType || 'solid'}
                          onChange={(e) => handleUpdate('fillType', e.target.value)}
                          className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                        >
                          <option value="solid">Uni</option>
                          <option value="gradient">Dégradé</option>
                          <option value="none">Aucun</option>
                        </select>
                      </div>

                      {selectedElement.fillType !== 'none' && (
                        <>
                          {selectedElement.fillType === 'solid' && (
                            <div>
                              <label className="block text-xs mb-1">Couleur</label>
                              <input
                                type="color"
                                value={selectedElement.fillColor || selectedElement.backgroundColor || '#cccccc'}
                                onChange={(e) => handleUpdate('fillColor', e.target.value)}
                                className="w-full h-8 rounded border border-gray-600"
                              />
                            </div>
                          )}

                          {selectedElement.fillType === 'gradient' && (
                            <div className="space-y-2">
                              <div>
                                <label className="block text-xs mb-1">Type de dégradé</label>
                                <select
                                  value={selectedElement.fillGradient?.type || 'linear'}
                                  onChange={(e) => {
                                    const gradient = selectedElement.fillGradient || { type: 'linear', colors: [{ color: '#ffffff', position: 0 }, { color: '#000000', position: 100 }], angle: 0 };
                                    gradient.type = e.target.value as 'linear' | 'radial';
                                    handleUpdate('fillGradient', gradient);
                                  }}
                                  className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                                >
                                  <option value="linear">Linéaire</option>
                                  <option value="radial">Radial</option>
                                </select>
                              </div>
                              {selectedElement.fillGradient?.type === 'linear' && (
                                <div>
                                  <label className="block text-xs mb-1">Angle (°)</label>
                                  <input
                                    type="number"
                                    value={selectedElement.fillGradient?.angle || 0}
                                    onChange={(e) => {
                                      const gradient = { ...selectedElement.fillGradient, angle: parseInt(e.target.value) || 0 };
                                      handleUpdate('fillGradient', gradient);
                                    }}
                                    className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                                  />
                                </div>
                              )}
                            </div>
                          )}

                          <div>
                            <label className="block text-xs mb-1">Opacité (%)</label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={Math.round((selectedElement.fillOpacity || 1) * 100)}
                              onChange={(e) => handleUpdate('fillOpacity', parseInt(e.target.value) / 100)}
                              className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                            />
                          </div>
                        </>
                      )}
                    </div>

                    {/* Stroke Properties */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-medium text-gray-300 uppercase tracking-wide">Contour</h4>
                      <div>
                        <label className="block text-xs mb-1">Couleur</label>
                        <input
                          type="color"
                          value={selectedElement.strokeColor || '#000000'}
                          onChange={(e) => handleUpdate('strokeColor', e.target.value)}
                          className="w-full h-8 rounded border border-gray-600"
                        />
                      </div>
                      <div>
                        <label className="block text-xs mb-1">Épaisseur</label>
                        <input
                          type="number"
                          min="0"
                          max="50"
                          value={selectedElement.strokeWidth || 0}
                          onChange={(e) => handleUpdate('strokeWidth', parseInt(e.target.value) || 0)}
                          className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs mb-1">Style</label>
                        <select
                          value={selectedElement.strokeStyle || 'solid'}
                          onChange={(e) => handleUpdate('strokeStyle', e.target.value)}
                          className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                        >
                          <option value="solid">Continu</option>
                          <option value="dashed">Pointillé</option>
                          <option value="dotted">Point</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs mb-1">Position</label>
                        <select
                          value={selectedElement.strokePosition || 'center'}
                          onChange={(e) => handleUpdate('strokePosition', e.target.value)}
                          className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                        >
                          <option value="center">Centre</option>
                          <option value="inside">Intérieur</option>
                          <option value="outside">Extérieur</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs mb-1">Opacité (%)</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={Math.round((selectedElement.strokeOpacity || 1) * 100)}
                          onChange={(e) => handleUpdate('strokeOpacity', parseInt(e.target.value) / 100)}
                          className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                        />
                      </div>
                    </div>

                    {/* Rounded Corners */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-medium text-gray-300 uppercase tracking-wide">Coins arrondis</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs mb-1">Haut-gauche</label>
                          <input
                            type="number"
                            min="0"
                            value={selectedElement.borderRadiusTopLeft || 0}
                            onChange={(e) => handleUpdate('borderRadiusTopLeft', parseInt(e.target.value) || 0)}
                            className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs mb-1">Haut-droite</label>
                          <input
                            type="number"
                            min="0"
                            value={selectedElement.borderRadiusTopRight || 0}
                            onChange={(e) => handleUpdate('borderRadiusTopRight', parseInt(e.target.value) || 0)}
                            className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs mb-1">Bas-gauche</label>
                          <input
                            type="number"
                            min="0"
                            value={selectedElement.borderRadiusBottomLeft || 0}
                            onChange={(e) => handleUpdate('borderRadiusBottomLeft', parseInt(e.target.value) || 0)}
                            className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs mb-1">Bas-droite</label>
                          <input
                            type="number"
                            min="0"
                            value={selectedElement.borderRadiusBottomRight || 0}
                            onChange={(e) => handleUpdate('borderRadiusBottomRight', parseInt(e.target.value) || 0)}
                            className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Shadows */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-medium text-gray-300 uppercase tracking-wide">Ombres & Lueurs</h4>
                      <button
                        onClick={() => {
                          const shadows = selectedElement.shadows || [];
                          shadows.push({
                            type: 'outer',
                            color: '#000000',
                            opacity: 0.5,
                            blur: 4,
                            distance: 4,
                            angle: 135,
                            spread: 0
                          });
                          handleUpdate('shadows', shadows);
                        }}
                        className="w-full py-1 px-2 bg-gray-600 hover:bg-gray-500 rounded text-xs"
                      >
                        Ajouter une ombre
                      </button>
                      {selectedElement.shadows?.map((shadow, index) => (
                        <div key={index} className="border border-gray-600 rounded p-2 space-y-2">
                          <div className="flex justify-between items-center">
                            <select
                              value={shadow.type}
                              onChange={(e) => {
                                const shadows = [...(selectedElement.shadows || [])];
                                shadows[index].type = e.target.value as 'inner' | 'outer';
                                handleUpdate('shadows', shadows);
                              }}
                              className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs"
                            >
                              <option value="outer">Extérieure</option>
                              <option value="inner">Intérieure</option>
                            </select>
                            <button
                              onClick={() => {
                                const shadows = (selectedElement.shadows || []).filter((_, i) => i !== index);
                                handleUpdate('shadows', shadows);
                              }}
                              className="text-red-400 hover:text-red-300 text-xs"
                            >
                              ×
                            </button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-xs mb-1">Couleur</label>
                              <input
                                type="color"
                                value={shadow.color}
                                onChange={(e) => {
                                  const shadows = [...(selectedElement.shadows || [])];
                                  shadows[index].color = e.target.value;
                                  handleUpdate('shadows', shadows);
                                }}
                                className="w-full h-6 rounded border border-gray-600"
                              />
                            </div>
                            <div>
                              <label className="block text-xs mb-1">Opacité</label>
                              <input
                                type="number"
                                min="0"
                                max="1"
                                step="0.1"
                                value={shadow.opacity}
                                onChange={(e) => {
                                  const shadows = [...(selectedElement.shadows || [])];
                                  shadows[index].opacity = parseFloat(e.target.value) || 0;
                                  handleUpdate('shadows', shadows);
                                }}
                                className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-xs mb-1">Flou</label>
                              <input
                                type="number"
                                min="0"
                                value={shadow.blur}
                                onChange={(e) => {
                                  const shadows = [...(selectedElement.shadows || [])];
                                  shadows[index].blur = parseInt(e.target.value) || 0;
                                  handleUpdate('shadows', shadows);
                                }}
                                className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-xs mb-1">Distance</label>
                              <input
                                type="number"
                                min="0"
                                value={shadow.distance}
                                onChange={(e) => {
                                  const shadows = [...(selectedElement.shadows || [])];
                                  shadows[index].distance = parseInt(e.target.value) || 0;
                                  handleUpdate('shadows', shadows);
                                }}
                                className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs"
                              />
                            </div>
                            <div className="col-span-2">
                              <label className="block text-xs mb-1">Angle (°)</label>
                              <input
                                type="number"
                                min="0"
                                max="360"
                                value={shadow.angle}
                                onChange={(e) => {
                                  const shadows = [...(selectedElement.shadows || [])];
                                  shadows[index].angle = parseInt(e.target.value) || 0;
                                  handleUpdate('shadows', shadows);
                                }}
                                className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-xs"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Opacity */}
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-gray-300 uppercase tracking-wide">Apparence</h4>
                  <div>
                    <label className="block text-xs mb-1">Opacité (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={Math.round((selectedElement.opacity || 1) * 100)}
                      onChange={(e) => handleUpdate('opacity', parseInt(e.target.value) / 100)}
                      className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-gray-600">
                  <button
                    onClick={() => onElementDelete(selectedElement.id)}
                    className="w-full py-2 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors"
                  >
                    Supprimer l'élément
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 text-sm mb-2">Aucun élément sélectionné</div>
                <div className="text-gray-500 text-xs">Cliquez sur un élément pour voir ses propriétés</div>
              </div>
            )}
          </div>
        )}

        {activePanel === 'history' && (
          <div>
            <h3 className="text-sm font-semibold mb-3">Historique</h3>
            <div className="space-y-1">
              <div className="flex items-center justify-between p-2 bg-gray-700 rounded text-xs">
                <span>Ajouter un élément</span>
                <button className="text-blue-400 hover:text-blue-300">⌫</button>
              </div>
              <div className="text-xs text-gray-400 mt-2">
                Ctrl + Alt + Z pour revenir en arrière
              </div>
            </div>
          </div>
        )}

        {activePanel === 'swatches' && (
          <div>
            <h3 className="text-sm font-semibold mb-3">Nuancier</h3>
            <div className="grid grid-cols-6 gap-1">
              {[
                '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
                '#FF00FF', '#00FFFF', '#800000', '#008000', '#000080', '#808000',
                '#800080', '#008080', '#808080', '#C0C0C0', '#FFA500', '#A52A2A'
              ].map((color) => (
                <div
                  key={color}
                  className="w-6 h-6 rounded border border-gray-600 cursor-pointer hover:border-white"
                  style={{ backgroundColor: color }}
                  onClick={() => console.log('Selected color:', color)}
                />
              ))}
            </div>
            <button className="w-full mt-3 py-1 px-2 bg-gray-600 hover:bg-gray-500 rounded text-xs">
              Nouveau nuancier
            </button>
          </div>
        )}

        {activePanel === 'adjustments' && (
          <DynamicVariablesPanel
            onVariableSelect={onVariableSelect}
            onVariableDrag={onVariableDrag}
          />
        )}

        {activePanel === 'paragraph' && (
          <div>
            <h3 className="text-sm font-semibold mb-3">Paragraphe</h3>
            {selectedElement?.type === 'text' ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs mb-1">Alignement</label>
                  <div className="flex space-x-1">
                    <button className="flex-1 py-1 px-2 bg-gray-600 hover:bg-gray-500 rounded text-xs">Gauche</button>
                    <button className="flex-1 py-1 px-2 bg-gray-600 hover:bg-gray-500 rounded text-xs">Centre</button>
                    <button className="flex-1 py-1 px-2 bg-gray-600 hover:bg-gray-500 rounded text-xs">Droite</button>
                    <button className="flex-1 py-1 px-2 bg-gray-600 hover:bg-gray-500 rounded text-xs">Justifié</button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs mb-1">Retrait gauche</label>
                  <input
                    type="number"
                    defaultValue="0"
                    className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1">Retrait droite</label>
                  <input
                    type="number"
                    defaultValue="0"
                    className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1">Interlignage</label>
                  <input
                    type="number"
                    defaultValue="1.2"
                    step="0.1"
                    className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                  />
                </div>
              </div>
            ) : (
              <p className="text-gray-400 text-sm">Sélectionnez un élément texte</p>
            )}
          </div>
        )}

        {activePanel === 'styles' && (
          <div>
            <h3 className="text-sm font-semibold mb-3">Styles</h3>
            <div className="space-y-2">
              <button className="w-full py-2 px-2 bg-gray-600 hover:bg-gray-500 rounded text-xs text-left">
                Ombre portée
              </button>
              <button className="w-full py-2 px-2 bg-gray-600 hover:bg-gray-500 rounded text-xs text-left">
                Lueur externe
              </button>
              <button className="w-full py-2 px-2 bg-gray-600 hover:bg-gray-500 rounded text-xs text-left">
                Lueur interne
              </button>
              <button className="w-full py-2 px-2 bg-gray-600 hover:bg-gray-500 rounded text-xs text-left">
                Biseau et estampage
              </button>
              <button className="w-full py-2 px-2 bg-gray-600 hover:bg-gray-500 rounded text-xs text-left">
                Incrustation couleur
              </button>
              <button className="w-full py-2 px-2 bg-gray-600 hover:bg-gray-500 rounded text-xs text-left">
                Superposition de dégradé
              </button>
              <button className="w-full py-2 px-2 bg-gray-600 hover:bg-gray-500 rounded text-xs text-left">
                Superposition de motif
              </button>
              <button className="w-full py-2 px-2 bg-gray-600 hover:bg-gray-500 rounded text-xs text-left">
                Contour
              </button>
            </div>
          </div>
        )}

        {activePanel === 'channels' && (
          <div>
            <h3 className="text-sm font-semibold mb-3">Canaux</h3>
            <div className="space-y-1">
              <div className="flex items-center justify-between p-2 bg-gray-700 rounded text-xs">
                <span>RVB</span>
                <div className="w-3 h-3 bg-white rounded"></div>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-700 rounded text-xs">
                <span>Rouge</span>
                <div className="w-3 h-3 bg-red-500 rounded"></div>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-700 rounded text-xs">
                <span>Vert</span>
                <div className="w-3 h-3 bg-green-500 rounded"></div>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-700 rounded text-xs">
                <span>Bleu</span>
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
              </div>
            </div>
          </div>
        )}

        {activePanel === 'paths' && (
          <div>
            <h3 className="text-sm font-semibold mb-3">Tracés</h3>
            <div className="space-y-1">
              <div className="text-xs text-gray-400 mb-2">Aucun tracé</div>
              <button className="w-full py-1 px-2 bg-gray-600 hover:bg-gray-500 rounded text-xs">
                Nouveau tracé
              </button>
            </div>
          </div>
        )}

        {activePanel === 'libraries' && (
          <div>
            <h3 className="text-sm font-semibold mb-3">Bibliothèques</h3>
            <div className="space-y-2">
              <div className="text-xs text-gray-400">Éléments enregistrés</div>
              <div className="grid grid-cols-2 gap-2">
                <div className="aspect-square bg-gray-700 rounded flex items-center justify-center text-xs">
                  Logo 1
                </div>
                <div className="aspect-square bg-gray-700 rounded flex items-center justify-center text-xs">
                  Style 1
                </div>
                <div className="aspect-square bg-gray-700 rounded flex items-center justify-center text-xs">
                  Couleur 1
                </div>
                <div className="aspect-square bg-gray-700 rounded flex items-center justify-center text-xs">
                  Forme 1
                </div>
              </div>
            </div>
          </div>
        )}

        {activePanel === 'character' && (
          <div>
            <h3 className="text-sm font-semibold mb-3">Caractère</h3>
            {selectedElement?.type === 'text' ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs mb-1">Police</label>
                  <select
                    value={selectedElement.fontFamily || 'Arial'}
                    onChange={(e) => handleUpdate('fontFamily', e.target.value)}
                    className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                  >
                    <option value="Arial">Arial</option>
                    <option value="Helvetica">Helvetica</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Georgia">Georgia</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs mb-1">Taille</label>
                  <input
                    type="number"
                    value={selectedElement.fontSize || 16}
                    onChange={(e) => handleUpdate('fontSize', parseInt(e.target.value) || 16)}
                    className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1">Couleur</label>
                  <input
                    type="color"
                    value={selectedElement.color || '#000000'}
                    onChange={(e) => handleUpdate('color', e.target.value)}
                    className="w-full h-8 rounded border border-gray-600"
                  />
                </div>
              </div>
            ) : (
              <p className="text-gray-400 text-sm">Sélectionnez un élément texte</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoshopPanels;