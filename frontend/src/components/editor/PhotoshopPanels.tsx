import React, { useState } from 'react';
import { Layers, Palette, Settings, History, Type, Sliders, SwatchBook, AlignLeft, AlignCenterHorizontal, AlignRight, AlignStartVertical, AlignCenterVertical, AlignEndVertical, Sparkles, Radio, Route, Library, ChevronDown, ChevronRight, Eye, EyeOff, Lock, Unlock, MoreHorizontal, Trash2, Folder, FilePlus } from 'lucide-react';

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
  onAlign?: (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom') => void;
}

const PanelHeader = ({ title, icon: Icon, isOpen, onToggle, actions }: any) => (
  <div className="flex items-center justify-between px-2 py-1 bg-[#3a3a3a] border-b border-[#222] cursor-pointer" onClick={onToggle}>
    <div className="flex items-center space-x-2 text-[#cccccc]">
      {isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
      {Icon && <Icon className="w-3 h-3" />}
      <span className="text-xs font-medium select-none">{title}</span>
    </div>
    <div className="flex items-center space-x-1" onClick={e => e.stopPropagation()}>
      {actions}
      <button className="p-0.5 hover:bg-[#505050] rounded text-[#aaaaaa]">
        <MoreHorizontal className="w-3 h-3" />
      </button>
    </div>
  </div>
);

const PhotoshopPanels: React.FC<PhotoshopPanelsProps> = ({
  selectedElement,
  onElementUpdate,
  onElementDelete,
  onElementSelect,
  templateElements,
  onVariableSelect,
  onVariableDrag,
  onAlign,
}) => {
  const [panelsOpen, setPanelsOpen] = useState({
    properties: true,
    layers: true,
    history: false,
    library: false
  });

  const togglePanel = (panel: keyof typeof panelsOpen) => {
    setPanelsOpen(prev => ({ ...prev, [panel]: !prev[panel] }));
  };

  const handleUpdate = (field: keyof TemplateElement, value: any) => {
    if (selectedElement) {
      onElementUpdate(selectedElement.id, { [field]: value });
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#3a3a3a] text-[#eeeeee]" style={{ fontSize: '11px' }}>

      {/* Top Dock: Properties */}
      <div className="flex-1 flex flex-col min-h-[200px] border-b border-[#111111] overflow-hidden">
        <PanelHeader
          title="Propriétés"
          icon={Settings}
          isOpen={panelsOpen.properties}
          onToggle={() => togglePanel('properties')}
        />

        {panelsOpen.properties && (
          <div className="flex-1 overflow-y-auto p-3 bg-[#333333]">
            {selectedElement ? (
              <div className="space-y-4">
                {/* Basic Transform Properties */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold text-[#aaaaaa] uppercase tracking-wider mb-1">Alignement</h4>
                  <div className="flex space-x-1 justify-between">
                    <button onClick={() => onAlign && onAlign('left')} title="Aligner à gauche" className="p-1 hover:bg-[#505050] rounded"><AlignLeft className="w-3 h-3" /></button>
                    <button onClick={() => onAlign && onAlign('center')} title="Centrer horizontalement" className="p-1 hover:bg-[#505050] rounded"><AlignCenterHorizontal className="w-3 h-3" /></button>
                    <button onClick={() => onAlign && onAlign('right')} title="Aligner à droite" className="p-1 hover:bg-[#505050] rounded"><AlignRight className="w-3 h-3" /></button>
                    <div className="w-px bg-[#444] mx-1"></div>
                    <button onClick={() => onAlign && onAlign('top')} title="Aligner en haut" className="p-1 hover:bg-[#505050] rounded"><AlignStartVertical className="w-3 h-3" /></button>
                    <button onClick={() => onAlign && onAlign('middle')} title="Centrer verticalement" className="p-1 hover:bg-[#505050] rounded"><AlignCenterVertical className="w-3 h-3" /></button>
                    <button onClick={() => onAlign && onAlign('bottom')} title="Aligner en bas" className="p-1 hover:bg-[#505050] rounded"><AlignEndVertical className="w-3 h-3" /></button>
                  </div>

                  <h4 className="text-[10px] font-bold text-[#aaaaaa] uppercase tracking-wider mb-1 mt-3">Transformation</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2">
                      <label className="text-[10px] w-3 text-[#999]">X</label>
                      <input
                        type="number"
                        value={Math.round(selectedElement.x)}
                        onChange={(e) => handleUpdate('x', parseInt(e.target.value) || 0)}
                        className="w-full px-1 py-0.5 bg-[#222] border border-[#444] rounded text-xs text-right focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <label className="text-[10px] w-3 text-[#999]">Y</label>
                      <input
                        type="number"
                        value={Math.round(selectedElement.y)}
                        onChange={(e) => handleUpdate('y', parseInt(e.target.value) || 0)}
                        className="w-full px-1 py-0.5 bg-[#222] border border-[#444] rounded text-xs text-right focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <label className="text-[10px] w-3 text-[#999]">L</label>
                      <input
                        type="number"
                        value={Math.round(selectedElement.width)}
                        onChange={(e) => handleUpdate('width', parseInt(e.target.value) || 0)}
                        className="w-full px-1 py-0.5 bg-[#222] border border-[#444] rounded text-xs text-right focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <label className="text-[10px] w-3 text-[#999]">H</label>
                      <input
                        type="number"
                        value={Math.round(selectedElement.height)}
                        onChange={(e) => handleUpdate('height', parseInt(e.target.value) || 0)}
                        className="w-full px-1 py-0.5 bg-[#222] border border-[#444] rounded text-xs text-right focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Element-specific properties */}
                {selectedElement.type === 'text' && (
                  <div className="space-y-2 border-t border-[#444] pt-2">
                    <h4 className="text-[10px] font-bold text-[#aaaaaa] uppercase tracking-wider mb-1">Caractère</h4>
                    <div className="space-y-2">
                      <div>
                        <select
                          value={selectedElement.fontFamily || 'Arial'}
                          onChange={(e) => handleUpdate('fontFamily', e.target.value)}
                          className="w-full px-1 py-1 bg-[#222] border border-[#444] rounded text-xs outline-none"
                        >
                          <option value="Arial">Arial</option>
                          <option value="Helvetica">Helvetica</option>
                          <option value="Times New Roman">Times New Roman</option>
                          <option value="Georgia">Georgia</option>
                          <option value="Inter">Inter</option>
                          <option value="Roboto">Roboto</option>
                        </select>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          value={selectedElement.fontSize || 16}
                          onChange={(e) => handleUpdate('fontSize', parseInt(e.target.value) || 16)}
                          className="w-16 px-1 py-0.5 bg-[#222] border border-[#444] rounded text-xs text-right focus:border-blue-500 outline-none"
                        />
                        <span className="text-[10px] text-[#999]">px</span>
                        <input
                          type="color"
                          value={selectedElement.color || '#000000'}
                          onChange={(e) => handleUpdate('color', e.target.value)}
                          className="w-6 h-6 rounded border border-[#444] cursor-pointer bg-transparent"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {selectedElement.type === 'shape' && (
                  <div className="space-y-2 border-t border-[#444] pt-2">
                    <h4 className="text-[10px] font-bold text-[#aaaaaa] uppercase tracking-wider mb-1">Apparence</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] mb-1 text-[#999]">Fond</label>
                        <div className="flex items-center space-x-1">
                          <input
                            type="color"
                            value={selectedElement.fillColor || selectedElement.backgroundColor || '#cccccc'}
                            onChange={(e) => handleUpdate('fillColor', e.target.value)}
                            className="w-full h-6 rounded border border-[#444] cursor-pointer"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] mb-1 text-[#999]">Contour</label>
                        <div className="flex items-center space-x-1">
                          <input
                            type="color"
                            value={selectedElement.strokeColor || '#000000'}
                            onChange={(e) => handleUpdate('strokeColor', e.target.value)}
                            className="w-full h-6 rounded border border-[#444] cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 pt-1">
                      <label className="text-[10px] text-[#999] w-12">Epaisseur</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={selectedElement.strokeWidth || 0}
                        onChange={(e) => handleUpdate('strokeWidth', parseInt(e.target.value) || 0)}
                        className="w-full px-1 py-0.5 bg-[#222] border border-[#444] rounded text-xs text-right focus:border-blue-500 outline-none"
                      />
                      <span className="text-[10px] text-[#999]">px</span>
                    </div>
                  </div>
                )}

                {/* Filters Section */}
                <div className="space-y-2 border-t border-[#444] pt-2">
                  <h4 className="text-[10px] font-bold text-[#aaaaaa] uppercase tracking-wider mb-1">Filtres</h4>

                  {/* Blur */}
                  <div className="flex items-center space-x-2">
                    <label className="text-[10px] text-[#999] w-16">Flou</label>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      step="0.5"
                      value={selectedElement.filter?.blur || 0}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        onElementUpdate(selectedElement.id, {
                          filter: { ...selectedElement.filter, blur: val }
                        });
                      }}
                      className="flex-1 h-1 bg-[#222] rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-[10px] text-[#999] w-8 text-right">{selectedElement.filter?.blur || 0}px</span>
                  </div>

                  {/* Brightness */}
                  <div className="flex items-center space-x-2">
                    <label className="text-[10px] text-[#999] w-16">Luminosité</label>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={selectedElement.filter?.brightness ?? 100}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        onElementUpdate(selectedElement.id, {
                          filter: { ...selectedElement.filter, brightness: val }
                        });
                      }}
                      className="flex-1 h-1 bg-[#222] rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-[10px] text-[#999] w-8 text-right">{selectedElement.filter?.brightness ?? 100}%</span>
                  </div>

                  {/* Contrast */}
                  <div className="flex items-center space-x-2">
                    <label className="text-[10px] text-[#999] w-16">Contraste</label>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={selectedElement.filter?.contrast ?? 100}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        onElementUpdate(selectedElement.id, {
                          filter: { ...selectedElement.filter, contrast: val }
                        });
                      }}
                      className="flex-1 h-1 bg-[#222] rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-[10px] text-[#999] w-8 text-right">{selectedElement.filter?.contrast ?? 100}%</span>
                  </div>

                  {/* Drop Shadow */}
                  <div className="pt-2 mt-2 border-t border-[#444]">
                    <h5 className="text-[10px] font-bold text-[#aaaaaa] mb-2">Ombre PortÃ©e</h5>
                    <div className="flex items-center space-x-2 mb-2">
                      <label className="text-[10px] text-[#999] w-12">Couleur</label>
                      <input
                        type="color"
                        value={selectedElement.filter?.shadow?.color || '#000000'}
                        onChange={(e) => {
                          const newShadow = { ...selectedElement.filter?.shadow, color: e.target.value };
                          onElementUpdate(selectedElement.id, {
                            filter: { ...selectedElement.filter, shadow: newShadow }
                          });
                        }}
                        className="w-full h-4 rounded border border-[#444] cursor-pointer"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center space-x-1">
                        <label className="text-[10px] text-[#999] w-4">X</label>
                        <input
                          type="number"
                          value={selectedElement.filter?.shadow?.x || 0}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            const newShadow = { ...selectedElement.filter?.shadow, x: val };
                            onElementUpdate(selectedElement.id, {
                              filter: { ...selectedElement.filter, shadow: newShadow }
                            });
                          }}
                          className="w-full px-1 py-0.5 bg-[#222] border border-[#444] rounded text-xs"
                        />
                      </div>
                      <div className="flex items-center space-x-1">
                        <label className="text-[10px] text-[#999] w-4">Y</label>
                        <input
                          type="number"
                          value={selectedElement.filter?.shadow?.y || 0}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            const newShadow = { ...selectedElement.filter?.shadow, y: val };
                            onElementUpdate(selectedElement.id, {
                              filter: { ...selectedElement.filter, shadow: newShadow }
                            });
                          }}
                          className="w-full px-1 py-0.5 bg-[#222] border border-[#444] rounded text-xs"
                        />
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 mt-2">
                      <label className="text-[10px] text-[#999] w-12">Flou</label>
                      <input
                        type="number"
                        value={selectedElement.filter?.shadow?.blur || 0}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          const newShadow = { ...selectedElement.filter?.shadow, blur: val };
                          onElementUpdate(selectedElement.id, {
                            filter: { ...selectedElement.filter, shadow: newShadow }
                          });
                        }}
                        className="w-full px-1 py-0.5 bg-[#222] border border-[#444] rounded text-xs"
                      />
                      <span className="text-[10px] text-[#999]">px</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-2 border-t border-[#444]">
                  <button
                    onClick={() => onElementDelete(selectedElement.id)}
                    className="w-full py-1 bg-[#4a2e2e] hover:bg-[#683b3b] text-[#ffcccc] border border-[#683b3b] rounded text-xs transition-colors flex items-center justify-center space-x-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Supprimer</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-[#666] space-y-2">
                <Settings className="w-8 h-8 opacity-20" />
                <p className="text-center italic">Sélectionnez un élément<br />pour voir ses propriétés</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Dock: Layers */}
      <div className="flex-1 flex flex-col min-h-[200px] bg-[#333333]">
        <PanelHeader
          title="Calques"
          icon={Layers}
          isOpen={panelsOpen.layers}
          onToggle={() => togglePanel('layers')}
          actions={
            <>
              <button className="p-1 hover:bg-[#505050] rounded text-[#aaaaaa]" title="Nouveau calque"><FilePlus className="w-3 h-3" /></button>
              <button className="p-1 hover:bg-[#505050] rounded text-[#aaaaaa]" title="Nouveau groupe"><Folder className="w-3 h-3" /></button>
              <button className="p-1 hover:bg-[#505050] rounded text-[#aaaaaa]" title="Supprimer calque"><Trash2 className="w-3 h-3" /></button>
            </>
          }
        />
        {panelsOpen.layers && (
          <div className="flex-1 overflow-y-auto">
            <LayersPanel
              templateElements={templateElements}
              selectedElement={selectedElement}
              onElementSelect={onElementSelect}
              onElementUpdate={onElementUpdate}
              onElementDelete={onElementDelete}
            />
          </div>
        )}
      </div>

    </div>
  );
};

export default PhotoshopPanels;
