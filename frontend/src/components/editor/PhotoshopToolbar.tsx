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
    <div className="flex flex-col items-center w-full" style={{ fontSize: '10px' }}>
      {tools.map((tool) => (
        <div key={tool.id} className="relative group mb-1 w-full flex justify-center">
          <button
            onClick={() => handleToolSelect(tool.id)}
            onContextMenu={(e) => {
              e.preventDefault();
              if (tool.subTools) {
                setShowMenu(showMenu === tool.id ? null : tool.id);
              }
            }}
            draggable={tool.id !== 'move' && tool.id !== 'hand' && tool.id !== 'zoom'}
            onDragStart={(e) => handleDragStart(e, tool.id)}
            className={`w-7 h-7 flex items-center justify-center rounded-sm transition-colors relative ${selectedTool === tool.id ? 'bg-[#535353] text-white' : 'text-[#b3b3b3] hover:text-white hover:bg-[#454545]'
              }`}
            title={`${tool.label} (${tool.shortcut})`}
          >
            {React.createElement(getCurrentIcon(tool), { className: "w-4 h-4" })}
            {tool.subTools && (
              <div className="absolute bottom-0.5 right-0.5 w-1 h-1 bg-[#aaaaaa]" style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }}></div>
            )}
          </button>

          {/* Tooltip */}
          <div className="absolute left-full top-0 bg-[#282828] text-[#eeeeee] text-xs px-2 py-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap ml-2 z-[100] border border-[#111111] pointer-events-none">
            <span>{tool.label}</span> <span className="text-[#888888]">({tool.shortcut})</span>
          </div>

          {/* Sub-menu Context */}
          {tool.subTools && showMenu === tool.id && (
            <div className="absolute left-full top-0 bg-[#3a3a3a] border border-[#111111] shadow-2xl z-[100] ml-2 w-48 py-1">
              {tool.subTools.map((subTool) => (
                <button
                  key={subTool.id}
                  onClick={() => handleSubToolSelect(tool.id, subTool.id)}
                  className="w-full px-3 py-2 text-left hover:bg-[#2980b9] text-[#eeeeee] text-xs flex items-center space-x-3 group/item"
                >
                  {React.createElement(subTool.icon, { className: "w-4 h-4" })}
                  <div className="flex-1">{subTool.label}</div>
                  <div className="text-[#888888] group-hover/item:text-white text-[10px]">{tool.shortcut}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      ))}

      <div className="w-6 h-px bg-[#505050] my-2"></div>

      {/* Color Swatches */}
      <div className="relative w-8 h-8 mb-4">
        <div className="absolute top-0 left-0 w-5 h-5 bg-black border border-[#aaaaaa] z-10 cursor-pointer" title="Premier plan"></div>
        <div className="absolute bottom-0 right-0 w-5 h-5 bg-white border border-[#aaaaaa] cursor-pointer" title="Arrière plan"></div>
        <button className="absolute -top-1 -right-1 z-20 hover:text-white text-[#aaaaaa]" title="Inverser (X)">
          <RefreshCw className="w-2.5 h-2.5" />
        </button>
      </div>

      <div className="w-6 h-px bg-[#505050] my-2"></div>

      <button className="w-7 h-7 flex items-center justify-center rounded-sm text-[#b3b3b3] hover:text-white hover:bg-[#454545] mb-1" title="Mode Masque (Q)">
        <div className="w-4 h-4 border border-current rounded-full bg-transparent flex items-center justify-center">
          <div className="w-2 h-2 bg-current rounded-full"></div>
        </div>
      </button>

      <button className="w-7 h-7 flex items-center justify-center rounded-sm text-[#b3b3b3] hover:text-white hover:bg-[#454545]" title="Mode Écran (F)">
        <Monitor className="w-4 h-4" />
      </button>

    </div>
  );
};

export default PhotoshopToolbar;
