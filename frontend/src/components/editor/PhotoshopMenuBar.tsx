import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight } from 'lucide-react';

interface MenuItem {
  label?: string;
  shortcut?: string;
  action?: () => void;
  separator?: boolean;
  items?: MenuItem[];
  description?: string;
  disabled?: boolean;
}

interface Menu {
  name: string;
  items: MenuItem[];
}

export interface MenuActions {
  newFile?: () => void;
  openFile?: () => void;
  openAsLayer?: () => void;
  openRecent?: () => void;
  closeFile?: () => void;
  save?: () => void;
  saveAs?: () => void;
  export?: () => void;
  print?: () => void;
  documentInfo?: () => void;
  quit?: () => void;
  importImage?: () => void;
  importFile?: () => void;
  browseInBridge?: () => void;
  saveYB?: () => void;
  loadYB?: () => void;
  undo?: () => void;
  redo?: () => void;
  cut?: () => void;
  copy?: () => void;
  paste?: () => void;
  erase?: () => void;
  freeTransform?: () => void;
  fill?: () => void;
  stroke?: () => void;
  findReplace?: () => void;
  preferences?: () => void;
  systemSettings?: () => void;
  setBackgroundColor?: () => void;
  setForegroundColor?: () => void;
  selectAll?: () => void;
  deselect?: () => void;
  inverse?: () => void;
  zoomIn?: () => void;
  zoomOut?: () => void;
  actualPixels?: () => void;
  fitOnScreen?: () => void;
  showRulers?: () => void;
  showGrid?: () => void;
  showGuides?: () => void;
  snapToGuides?: () => void;
  fullScreen?: () => void;
  toggleTheme?: () => void;
  showActiveLayersOnly?: () => void;
  transformScale?: () => void;
  transformRotate?: () => void;
  transformSkew?: () => void;
  transformPerspective?: () => void;
  transformCurvature?: () => void;
  transformWarp?: () => void;
  transformFlipHorizontal?: () => void;
  transformFlipVertical?: () => void;
  transformRotate180?: () => void;
  transformRotate90CW?: () => void;
  transformRotate90CCW?: () => void;
  duplicateLayer?: () => void;
  deleteLayer?: () => void;
  groupLayers?: () => void;
  ungroupLayers?: () => void;
  hideLayers?: () => void;
  lockLayers?: () => void;
  mergeLayers?: () => void;
  flattenImage?: () => void;
  imageSize?: () => void;
  canvasSize?: () => void;
  invertSelection?: () => void;
  actualSize?: () => void;
  layerMask?: () => void;
  clippingMask?: () => void;
  colorOverlay?: () => void;
  gradientOverlay?: () => void;
  dropShadow?: () => void;
}

interface PhotoshopMenuBarProps {
  actions: MenuActions;
}

const PhotoshopMenuBar: React.FC<PhotoshopMenuBarProps> = ({ actions }) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const menus: Menu[] = [
    {
      name: 'Fichier',
      items: [
        { label: 'Nouveau...', shortcut: 'Ctrl+N', action: actions.newFile },
        { label: 'Ouvrir...', shortcut: 'Ctrl+O', action: actions.openFile },
        { label: 'Ouvrir récent', action: actions.openRecent },
        { separator: true },
        { label: 'Enregistrer', shortcut: 'Ctrl+S', action: actions.save },
        { label: 'Enregistrer sous...', shortcut: 'Shift+Ctrl+S', action: actions.saveAs },
        { label: 'Exporter le certificat', shortcut: 'Ctrl+E', action: actions.export },
        { separator: true },
        { label: 'Fermer', shortcut: 'Ctrl+W', action: actions.closeFile },
        { label: 'Quitter', shortcut: 'Ctrl+Q', action: actions.quit },
      ],
    },
    {
      name: 'Édition',
      items: [
        { label: 'Annuler', shortcut: 'Ctrl+Z', action: actions.undo },
        { label: 'Rétablir', shortcut: 'Shift+Ctrl+Z', action: actions.redo },
        { separator: true },
        { label: 'Couper', shortcut: 'Ctrl+X', action: actions.cut },
        { label: 'Copier', shortcut: 'Ctrl+C', action: actions.copy },
        { label: 'Coller', shortcut: 'Ctrl+V', action: actions.paste },
        { separator: true },
        { label: 'Transformation manuelle', shortcut: 'Ctrl+T', action: actions.freeTransform },
        { separator: true },
        { label: 'Préférences', shortcut: 'Ctrl+K', action: actions.preferences },
      ],
    },
    {
      name: 'Image',
      items: [
        { label: 'Mode' },
        { label: 'Réglages' },
        { separator: true },
        { label: 'Taille de l\'image...', shortcut: 'Alt+Ctrl+I', action: actions.imageSize },
        { label: 'Taille de la zone de travail...', shortcut: 'Alt+Ctrl+C', action: actions.canvasSize },
        { separator: true },
        { label: 'Rognage' },
        { label: 'Rotation de l\'image' },
        { separator: true },
        { label: 'Dupliquer...' }
      ],
    },
    {
      name: 'Calque',
      items: [
        {
          label: 'Nouveau', items: [
            { label: 'Calque...', shortcut: 'Shift+Ctrl+N' },
            { label: 'Groupe...', shortcut: 'G', action: actions.groupLayers }
          ]
        },
        { label: 'Dupliquer le calque...', action: actions.duplicateLayer },
        {
          label: 'Supprimer', items: [
            { label: 'Calque', action: actions.deleteLayer },
            { label: 'Calques cachés' }
          ]
        },
        { separator: true },
        {
          label: 'Style de calque', items: [
            { label: 'Options de fusion...' },
            { separator: true },
            { label: 'Ombre portée', action: actions.dropShadow },
            { label: 'Incrustation couleur', action: actions.colorOverlay },
            { label: 'Incrustation en dégradé', action: actions.gradientOverlay }
          ]
        },
        { separator: true },
        {
          label: 'Masque de fusion', items: [
            { label: 'Tout faire apparaître', action: actions.layerMask },
            { label: 'Tout masquer' }
          ]
        },
        { separator: true },
        { label: 'Fusionner les calques', shortcut: 'Ctrl+E', action: actions.mergeLayers },
        { label: 'Aplatir l\'image', action: actions.flattenImage }
      ],
    },
    {
      name: 'Sélection',
      items: [
        { label: 'Tout', shortcut: 'Ctrl+A', action: actions.selectAll },
        { label: 'Désélectionner', shortcut: 'Ctrl+D', action: actions.deselect },
        { label: 'Resélectionner', shortcut: 'Shift+Ctrl+D' },
        { label: 'Intervertir', shortcut: 'Shift+Ctrl+I', action: actions.invertSelection },
      ],
    },
    {
      name: 'Affichage',
      items: [
        { label: 'Zoom avant', shortcut: 'Ctrl++', action: actions.zoomIn },
        { label: 'Zoom arrière', shortcut: 'Ctrl+-', action: actions.zoomOut },
        { label: 'Adapter à l\'écran', shortcut: 'Ctrl+0', action: actions.fitOnScreen },
        { label: '100%', shortcut: 'Ctrl+1', action: actions.actualSize },
        { separator: true },
        { label: 'Règles', shortcut: 'Ctrl+R', action: actions.showRulers },
        { label: 'Grille', shortcut: 'Ctrl+\'', action: actions.showGrid },
        { label: 'Repères', shortcut: 'Ctrl+;', action: actions.showGuides },
      ],
    },
    {
      name: 'Fenêtre',
      items: [
        { label: 'Espace de travail' },
        { separator: true },
        { label: 'Calques', shortcut: 'F7' },
        { label: 'Propriétés' },
        { label: 'Outils' },
        { label: 'Historique' },
      ],
    },
    {
      name: 'Aide',
      items: [
        { label: 'Aide de Photoshop...', shortcut: 'F1' },
      ],
    },
  ];

  const handleMenuClick = (menuName: string) => {
    setActiveMenu(activeMenu === menuName ? null : menuName);
  };

  const MenuItemComponent = ({ item }: { item: MenuItem }) => {
    if (item.separator) {
      return <div className="h-px bg-[#505050] my-1" />;
    }

    return (
      <div
        className={`px-4 py-1.5 flex items-center justify-between text-xs hover:bg-[#2980b9] text-[#eeeeee] cursor-pointer group ${item.disabled ? 'opacity-50 pointer-events-none' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          if (item.action) {
            item.action();
            setActiveMenu(null);
          }
        }}
        title={item.description}
      >
        <span className="mr-8">{item.label}</span>
        {item.items ? (
          <ChevronRight className="w-3 h-3 text-[#aaaaaa]" />
        ) : (
          item.shortcut && <span className="text-[#aaaaaa] text-[10px] group-hover:text-white ml-4">{item.shortcut}</span>
        )}
      </div>
    );
  };

  return (
    <div className="flex items-center h-full px-2 space-x-1" ref={menuRef} style={{ fontSize: '11px' }}>
      <div className="mr-2 flex items-center justify-center p-1">
        <div className="w-4 h-4 bg-[#001e36] text-[#31a8ff] font-bold flex items-center justify-center text-[9px] border border-[#001e36] rounded-sm">
          Ps
        </div>
      </div>
      {menus.map((menu) => (
        <div key={menu.name} className="relative">
          <button
            className={`px-2 py-1 rounded-sm transition-colors ${activeMenu === menu.name
                ? 'bg-[#505050] text-white'
                : 'text-[#cccccc] hover:bg-[#505050] hover:text-white'
              }`}
            onClick={() => handleMenuClick(menu.name)}
            onMouseEnter={() => activeMenu && setActiveMenu(menu.name)}
          >
            {menu.name}
          </button>

          {activeMenu === menu.name && (
            <div className="absolute top-full left-0 min-w-[200px] bg-[#3a3a3a] border border-[#111111] shadow-xl z-50 py-1">
              {menu.items.map((item, index) => (
                <MenuItemComponent key={index} item={item} />
              ))}
            </div>
          )}
        </div>
      ))}

      <div className="flex-1"></div>

      <div className="flex items-center space-x-3 px-2">
        <button className="p-1 text-[#aaaaaa] hover:text-white" title="Rechercher (Ctrl+F)">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
        <div className="w-px h-3 bg-[#505050]"></div>
        <button className="px-2 py-0.5 bg-[#2980b9] text-white rounded-sm text-[10px] hover:bg-[#3498db]">
          Partager
        </button>
      </div>
    </div>
  );
};

export default PhotoshopMenuBar;
