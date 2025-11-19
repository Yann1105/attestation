import React, { useState } from 'react';
import {
  Move, Square, Circle, Lasso, Wand2, Scissors, Pipette,
  Brush, Pencil, Eraser, PaintBucket, Zap, MousePointer,
  Pen, Type, Hand, ZoomIn, Monitor, Hexagon, Star, Minus,
  Triangle, ArrowRight, Heart, RotateCcw, Eye, Droplet, Ruler, StickyNote, Hash,
  Stamp, Palette as PaletteIcon, Flame, Sun, Moon, RefreshCw, Plus, Expand
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface PhotoshopToolbarProps {
  onAddElement: (type: 'text' | 'shape' | 'image' | 'logo', x?: number, y?: number) => void;
  onToolSelect?: (tool: string) => void;
}

interface SubTool {
  id: string;
  icon: LucideIcon;
  label: string;
}

interface Tool {
  id: string;
  icon: LucideIcon;
  label: string;
  shortcut: string;
  subTools?: SubTool[];
}

const PhotoshopToolbar: React.FC<PhotoshopToolbarProps> = ({ onAddElement, onToolSelect }) => {
  const [selectedTool, setSelectedTool] = useState('move');
  const [currentSubTools, setCurrentSubTools] = useState<{ [key: string]: string }>({});
  const [showMenu, setShowMenu] = useState<string | null>(null);

  const handleToolSelect = (toolId: string) => {
    setSelectedTool(toolId);
    onToolSelect?.(toolId);
    setShowMenu(null);
  };

  const handleDragStart = (e: React.DragEvent, toolId: string) => {
    e.dataTransfer.setData('application/json', JSON.stringify({
      type: 'tool',
      toolId: toolId,
      elementType: getElementTypeFromTool(toolId)
    }));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const getElementTypeFromTool = (toolId: string): 'text' | 'shape' | 'image' | 'logo' => {
    switch (toolId) {
      case 'text':
      case 'horizontal-text':
      case 'vertical-text':
        return 'text';
      case 'rectangle':
      case 'ellipse':
      case 'polygon':
      case 'star':
      case 'line':
      case 'triangle':
      case 'heart':
      case 'arrow':
        return 'shape';
      default:
        return 'shape';
    }
  };

  const handleSubToolSelect = (mainToolId: string, subToolId: string) => {
    setCurrentSubTools(prev => ({ ...prev, [mainToolId]: subToolId }));
    setSelectedTool(mainToolId);
    onToolSelect?.(subToolId);
    setShowMenu(null);
  };

  const getCurrentIcon = (tool: any) => {
    if (tool.subTools && currentSubTools[tool.id]) {
      const subTool = tool.subTools.find((st: any) => st.id === currentSubTools[tool.id]);
      return subTool ? subTool.icon : tool.icon;
    }
    return tool.icon;
  };

  const tools: Tool[] = [
    {
      id: 'move',
      icon: Move,
      label: 'Outil de déplacement',
      shortcut: 'V'
    },
    {
      id: 'canvas-resize',
      icon: Expand,
      label: 'Redimensionner le canvas',
      shortcut: 'R'
    },
    {
      id: 'marquee',
      icon: Square,
      label: 'Outils de sélection rectangulaire',
      shortcut: 'M',
      subTools: [
        { id: 'marquee-rect', icon: Square, label: 'Rectangle' },
        { id: 'marquee-ellipse', icon: Circle, label: 'Ellipse' },
        { id: 'marquee-hline', icon: Minus, label: 'Ligne horizontale' },
        { id: 'marquee-vline', icon: Minus, label: 'Ligne verticale' }
      ]
    },
    {
      id: 'lasso',
      icon: Lasso,
      label: 'Outils Lasso',
      shortcut: 'L',
      subTools: [
        { id: 'lasso-free', icon: Lasso, label: 'Lasso libre' },
        { id: 'lasso-poly', icon: Hexagon, label: 'Lasso polygonal' },
        { id: 'lasso-magnetic', icon: Zap, label: 'Lasso magnétique' }
      ]
    },
    {
      id: 'quick-select',
      icon: Wand2,
      label: 'Outils de sélection rapide / Baguette magique',
      shortcut: 'W',
      subTools: [
        { id: 'quick-select', icon: Wand2, label: 'Sélection rapide' },
        { id: 'magic-wand', icon: Wand2, label: 'Baguette magique' }
      ]
    },
    {
      id: 'crop',
      icon: Scissors,
      label: 'Outils de recadrage',
      shortcut: 'C',
      subTools: [
        { id: 'crop', icon: Scissors, label: 'Recadrage' },
        { id: 'slice', icon: Square, label: 'Tranche' },
        { id: 'perspective', icon: Hexagon, label: 'Sélection de perspective' }
      ]
    },
    {
      id: 'eyedropper',
      icon: Pipette,
      label: 'Outils Pipette',
      shortcut: 'I',
      subTools: [
        { id: 'eyedropper', icon: Pipette, label: 'Pipette' },
        { id: 'color-sampler', icon: Droplet, label: 'Échantillonneur de couleur' },
        { id: 'ruler', icon: Ruler, label: 'Règle' },
        { id: 'note', icon: StickyNote, label: 'Note' },
        { id: 'count', icon: Hash, label: 'Comptage' }
      ]
    },
    {
      id: 'healing',
      icon: Zap,
      label: 'Outils Correcteurs et Tampons',
      shortcut: 'J',
      subTools: [
        { id: 'spot-healing', icon: Zap, label: 'Correcteur localisé' },
        { id: 'healing', icon: Zap, label: 'Correcteur' },
        { id: 'patch', icon: Square, label: 'Pièce' },
        { id: 'content-aware', icon: Move, label: 'Déplacement basé sur le contenu' },
        { id: 'red-eye', icon: Eye, label: 'Yeux rouges' },
        { id: 'clone-stamp', icon: Stamp, label: 'Tampon de duplication' },
        { id: 'pattern-stamp', icon: PaletteIcon, label: 'Tampon de motif' }
      ]
    },
    {
      id: 'brush',
      icon: Brush,
      label: 'Outils de peinture',
      shortcut: 'B',
      subTools: [
        { id: 'brush', icon: Brush, label: 'Pinceau' },
        { id: 'pencil', icon: Pencil, label: 'Crayon' },
        { id: 'mixer-brush', icon: Brush, label: 'Pinceau mélangeur' },
        { id: 'pattern-stamp', icon: PaletteIcon, label: 'Tampon de motif' }
      ]
    },
    {
      id: 'eraser',
      icon: Eraser,
      label: 'Outils de suppression',
      shortcut: 'E',
      subTools: [
        { id: 'eraser', icon: Eraser, label: 'Gomme standard' },
        { id: 'background-eraser', icon: Eraser, label: 'Gomme d\'arrière-plan' },
        { id: 'magic-eraser', icon: Eraser, label: 'Gomme magique' }
      ]
    },
    {
      id: 'paint',
      icon: PaintBucket,
      label: 'Outils de remplissage',
      shortcut: 'G',
      subTools: [
        { id: 'paint-bucket', icon: PaintBucket, label: 'Pot de peinture' },
        { id: 'gradient', icon: PaintBucket, label: 'Dégradé' }
      ]
    },
    {
      id: 'blur',
      icon: MousePointer,
      label: 'Outils de retouche',
      shortcut: 'O',
      subTools: [
        { id: 'blur', icon: MousePointer, label: 'Flou' },
        { id: 'sharpen', icon: Sun, label: 'Netteté' },
        { id: 'smudge', icon: MousePointer, label: 'Doigt' }
      ]
    },
    {
      id: 'dodge',
      icon: Flame,
      label: 'Outils d\'exposition',
      shortcut: 'O',
      subTools: [
        { id: 'dodge', icon: Flame, label: 'Densité +' },
        { id: 'burn', icon: Moon, label: 'Densité -' },
        { id: 'sponge', icon: Droplet, label: 'Éponge' }
      ]
    },
    {
      id: 'pen',
      icon: Pen,
      label: 'Outils de dessin vectoriel',
      shortcut: 'P',
      subTools: [
        { id: 'pen', icon: Pen, label: 'Plume' },
        { id: 'freeform-pen', icon: Pen, label: 'Plume libre' },
        { id: 'add-anchor', icon: Plus, label: 'Ajouter/Supprimer point' },
        { id: 'convert-anchor', icon: RefreshCw, label: 'Convertir point d\'ancrage' }
      ]
    },
    {
      id: 'shape',
      icon: Square,
      label: 'Outils de forme',
      shortcut: 'U',
      subTools: [
        { id: 'rectangle', icon: Square, label: 'Rectangle' },
        { id: 'ellipse', icon: Circle, label: 'Ellipse' },
        { id: 'polygon', icon: Hexagon, label: 'Polygone' },
        { id: 'line', icon: Minus, label: 'Ligne' },
        { id: 'triangle', icon: Triangle, label: 'Triangle' },
        { id: 'star', icon: Star, label: 'Étoile' },
        { id: 'heart', icon: Heart, label: 'Cœur' },
        { id: 'arrow', icon: ArrowRight, label: 'Flèche' }
      ]
    },
    {
      id: 'text',
      icon: Type,
      label: 'Outils de texte',
      shortcut: 'T',
      subTools: [
        { id: 'horizontal-text', icon: Type, label: 'Texte horizontal' },
        { id: 'vertical-text', icon: Type, label: 'Texte vertical' },
        { id: 'horizontal-mask', icon: Type, label: 'Masque de texte horizontal' },
        { id: 'vertical-mask', icon: Type, label: 'Masque de texte vertical' }
      ]
    },
    {
      id: 'warp',
      icon: RotateCcw,
      label: 'Outil de déformation',
      shortcut: 'W'
    },
    {
      id: 'hand',
      icon: Hand,
      label: 'Outils de navigation',
      shortcut: 'H',
      subTools: [
        { id: 'hand', icon: Hand, label: 'Main' },
        { id: 'rotate-view', icon: RotateCcw, label: 'Rotation de la vue' },
        { id: 'zoom', icon: ZoomIn, label: 'Zoom' }
      ]
    }
  ];

  return (
    <div className="w-32 bg-[#2D2D2D] flex flex-col items-start" style={{ fontSize: '5px', direction: 'rtl', overflowY: 'auto' }}>
      <div style={{ direction: 'ltr', textAlign: 'left', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        {tools.map((tool, index) => (
        <div key={tool.id} className="relative group mb-0.5">
          <button
            onClick={() => handleToolSelect(tool.id)}
            onContextMenu={(e) => {
              e.preventDefault();
              if (tool.subTools) {
                setShowMenu(showMenu === tool.id ? null : tool.id);
              }
            }}
            draggable={tool.id !== 'move' && tool.id !== 'hand' && tool.id !== 'zoom'} // Only allow dragging for creation tools
            onDragStart={(e) => handleDragStart(e, tool.id)}
            className={`w-12 h-12 flex items-center justify-center rounded transition-colors ${
              selectedTool === tool.id ? 'bg-blue-600' : 'hover:bg-blue-500'
            } ${tool.id !== 'move' && tool.id !== 'hand' && tool.id !== 'zoom' ? 'cursor-grab active:cursor-grabbing' : ''}`}
            title={`${tool.label} (${tool.shortcut})`}
          >
            {React.createElement(getCurrentIcon(tool), { className: "w-6 h-6 text-white" })}
          </button>
          <div className="absolute left-full top-0 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap ml-2 z-50">
            <span className="text-xs">{tool.label}</span>
            <br />
            <span className="text-gray-400 text-xs">{tool.shortcut}</span>
          </div>
          {tool.subTools && showMenu === tool.id && (
            <div className="absolute left-full top-0 bg-gray-200 border border-gray-300 rounded shadow-lg z-50 ml-2">
              {tool.subTools.map((subTool) => (
                <button
                  key={subTool.id}
                  onClick={() => handleSubToolSelect(tool.id, subTool.id)}
                  className="w-full px-2 py-1 text-left hover:bg-gray-300 text-gray-800 text-xs flex items-center space-x-2"
                >
                  {React.createElement(subTool.icon, { className: "w-3 h-3" })}
                  <span>{subTool.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Color Pickers */}
      <div className="w-full mt-4">
        <div className="w-8 h-px bg-gray-600 my-2 mx-auto"></div>
        <div className="space-y-1">
          <div className="w-8 h-8 bg-black border-2 border-white rounded mx-auto cursor-pointer" title="Couleur de premier plan"></div>
          <div className="w-8 h-8 bg-white border-2 border-gray-400 rounded mx-auto cursor-pointer" title="Couleur d'arrière-plan"></div>
          <button className="w-8 h-8 flex items-center justify-center hover:bg-blue-500 rounded mx-auto" title="Inverser les couleurs (X)">
            <div className="w-4 h-4 border border-gray-300 rounded-sm relative">
              <div className="absolute inset-0 bg-black rounded-sm transform rotate-45 scale-75"></div>
            </div>
          </button>
          <button className="w-8 h-8 flex items-center justify-center hover:bg-blue-500 rounded mx-auto" title="Restaurer noir/blanc">
            <RefreshCw className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Screen Modes */}
      <div className="w-full mt-4">
        <div className="w-8 h-px bg-gray-600 my-2 mx-auto"></div>
        <div className="space-y-1">
          <button className="w-8 h-8 flex items-center justify-center hover:bg-blue-500 rounded mx-auto" title="Mode normal">
            <Monitor className="w-4 h-4 text-white" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center hover:bg-blue-500 rounded mx-auto" title="Plein écran avec barres">
            <Monitor className="w-4 h-4 text-white" />
          </button>
          <button className="w-8 h-8 flex items-center justify-center hover:bg-blue-500 rounded mx-auto" title="Plein écran total">
            <Monitor className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
      </div>
    </div>
  );
};

export default PhotoshopToolbar;