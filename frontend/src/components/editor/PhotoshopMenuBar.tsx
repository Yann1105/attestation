import React from 'react';

interface MenuItem {
  label?: string;
  shortcut?: string;
  action?: () => void;
  separator?: boolean;
  items?: MenuItem[];
  description?: string;
}

interface Menu {
  name: string;
  items: MenuItem[];
}

interface MenuActions {
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
  saveYB?: () => void; // New action for saving .yb files
  loadYB?: () => void; // New action for loading .yb files
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
  // Transformation actions
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
  // Add more as needed
}

interface PhotoshopMenuBarProps {
  actions?: MenuActions;
}

const PhotoshopMenuBar: React.FC<PhotoshopMenuBarProps> = ({ actions = {} }) => {

  const menus: Menu[] = [
    {
      name: 'Fichier',
      items: [
        { label: 'Nouveau document', shortcut: 'Ctrl+N', action: actions.newFile },
        { label: 'Ouvrir', shortcut: 'Ctrl+O', action: actions.openFile },
        { label: 'Ouvrir un fichier .yb', action: actions.loadYB },
        { label: 'Importer (PNG, JPG, PSD, AI)', action: actions.importFile },
        { label: 'Ouvrir en tant que calque', action: actions.openAsLayer },
        { label: 'Parcourir dans Bridge', action: actions.browseInBridge },
        { label: 'Ouvrir récent', action: actions.openRecent },
        { separator: true },
        { label: 'Enregistrer', shortcut: 'Ctrl+S', action: actions.save },
        { label: 'Enregistrer sous...', shortcut: 'Ctrl+Shift+S', action: actions.saveAs },
        { label: 'Enregistrer (.yb)', action: actions.saveYB },
        { label: 'Exporter (PNG, JPG, PDF, SVG, PSD)', action: actions.export },
        { separator: true },
        { label: 'Imprimer', shortcut: 'Ctrl+P', action: actions.print },
        { label: 'Informations du document', action: actions.documentInfo },
        { separator: true },
        { label: 'Fermer le document', shortcut: 'Ctrl+W', action: actions.closeFile },
        { label: 'Quitter', action: actions.quit },
      ]
    },
    {
      name: 'Édition',
      items: [
        { label: 'Annuler', shortcut: 'Ctrl+Z', action: actions.undo },
        { label: 'Rétablir', shortcut: 'Ctrl+Shift+Z', action: actions.redo },
        { separator: true },
        { label: 'Couper', shortcut: 'Ctrl+X', action: actions.cut },
        { label: 'Copier', shortcut: 'Ctrl+C', action: actions.copy },
        { label: 'Coller', shortcut: 'Ctrl+V', action: actions.paste },
        { label: 'Effacer', shortcut: 'Del', action: actions.erase },
        { separator: true },
        { label: 'Transformation libre', shortcut: 'Ctrl+T', action: actions.freeTransform },
        { label: 'Transformation', items: [
          { label: 'Homothétie (Scale)', action: actions.transformScale },
          { label: 'Rotation (Rotate)', action: actions.transformRotate },
          { label: 'Inclinaison (Skew)', action: actions.transformSkew },
          { label: 'Perspective', items: [
            { label: 'Mode Perspective', action: actions.transformPerspective },
            { label: 'Courbure', action: actions.transformCurvature },
          ]},
          { label: 'Déformation (Warp)', action: actions.transformWarp, description: 'La Déformation (Warp) est un outil avancé de transformation permettant de modifier la forme d\'un objet, d\'un texte ou d\'une image en manipulant des points de contrôle, des courbes ou une grille flexible. Elle permet d\'obtenir des transformations organiques impossibles avec la simple rotation ou mise à l\'échelle.' },
          { separator: true },
          { label: 'Symétrie horizontale (Flip Horizontal)', action: actions.transformFlipHorizontal },
          { label: 'Symétrie verticale (Flip Vertical)', action: actions.transformFlipVertical },
          { separator: true },
          { label: 'Rotation 180°', action: actions.transformRotate180 },
          { label: 'Rotation 90° horaire (Rotate 90° CW)', action: actions.transformRotate90CW },
          { label: 'Rotation 90° antihoraire (Rotate 90° CCW)', action: actions.transformRotate90CCW },
        ]},
        { label: 'Transformation manuelle', action: () => console.log('Manual transform') },
        { label: 'Remplir', shortcut: 'Shift+F5', action: actions.fill },
        { label: 'Contour', action: actions.stroke },
        { separator: true },
        { label: 'Rechercher / Remplacer', shortcut: 'Ctrl+F', action: actions.findReplace },
        { separator: true },
        { label: 'Préférences', action: actions.preferences },
        { label: 'Paramètres du système', action: actions.systemSettings },
        { label: 'Définir la couleur d\'arrière-plan', action: actions.setBackgroundColor },
        { label: 'Définir la couleur de premier plan', action: actions.setForegroundColor },
      ]
    },
    {
      name: 'Image',
      items: [
        { label: 'Taille de l\'image', shortcut: 'Ctrl+Alt+I', action: () => console.log('Image size') },
        { label: 'Taille de la zone de travail', action: () => console.log('Canvas size') },
        { label: 'Mode de couleur', items: [
          { label: 'RVB', action: () => console.log('RGB mode') },
          { label: 'CMJN', action: () => console.log('CMYK mode') },
          { label: 'Niveaux de gris', action: () => console.log('Grayscale mode') },
        ]},
        { separator: true },
        { label: 'Réglages', items: [
          { label: 'Luminosité / Contraste', shortcut: 'Ctrl+Shift+L', action: () => console.log('Brightness/Contrast') },
          { label: 'Niveaux', shortcut: 'Ctrl+L', action: () => console.log('Levels') },
          { label: 'Courbes', shortcut: 'Ctrl+M', action: () => console.log('Curves') },
          { label: 'Balance des couleurs', action: () => console.log('Color balance') },
          { label: 'Teinte / Saturation', shortcut: 'Ctrl+U', action: () => console.log('Hue/Saturation') },
          { label: 'Correction sélective', action: () => console.log('Selective color') },
          { label: 'Noir et blanc', action: () => console.log('Black and white') },
        ]},
        { separator: true },
        { label: 'Rognage automatique', action: () => console.log('Auto crop') },
        { label: 'Rotation de l\'image', action: () => console.log('Image rotation') },
        { label: 'Inverser les couleurs', action: () => console.log('Invert colors') },
      ]
    },
    {
      name: 'Calque',
      items: [
        { label: 'Nouveau calque', shortcut: 'Ctrl+Shift+N', action: () => console.log('New layer') },
        { label: 'Créer un groupe de calques', action: () => console.log('New group') },
        { label: 'Calque de texte', shortcut: 'Ctrl+Shift+T', action: () => console.log('Text layer') },
        { label: 'Calque de forme', action: () => console.log('Shape layer') },
        { label: 'Dupliquer le calque', shortcut: 'Ctrl+J', action: () => console.log('Duplicate layer') },
        { label: 'Supprimer le calque', action: () => console.log('Delete layer') },
        { separator: true },
        { label: 'Fusionner les calques', shortcut: 'Ctrl+Shift+E', action: () => console.log('Merge layers') },
        { label: 'Aplatir l\'image', action: () => console.log('Flatten image') },
        { separator: true },
        { label: 'Masque de fusion', action: () => console.log('Layer mask') },
        { label: 'Masque d\'écrêtage', action: () => console.log('Clipping mask') },
        { separator: true },
        { label: 'Styles de calque', items: [
          { label: 'Ombre portée', action: () => console.log('Drop shadow') },
          { label: 'Lueur interne', action: () => console.log('Inner glow') },
          { label: 'Lueur externe', action: () => console.log('Outer glow') },
          { label: 'Biseautage / Estampage', action: () => console.log('Bevel/Emboss') },
          { label: 'Incrustation de couleur', action: () => console.log('Color overlay') },
          { label: 'Incrustation de dégradé', action: () => console.log('Gradient overlay') },
          { label: 'Incrustation de motif', action: () => console.log('Pattern overlay') },
        ]},
        { separator: true },
        { label: 'Verrouiller le calque', action: () => console.log('Lock layer') },
        { label: 'Aligner les calques', action: () => console.log('Align layers') },
      ]
    },
    {
      name: 'Sélection',
      items: [
        { label: 'Tout sélectionner', shortcut: 'Ctrl+A', action: actions.selectAll },
        { label: 'Désélectionner', shortcut: 'Ctrl+D', action: actions.deselect },
        { label: 'Ré-sélectionner', action: () => console.log('Reselect') },
        { label: 'Inverser la sélection', shortcut: 'Ctrl+Shift+I', action: actions.inverse },
        { separator: true },
        { label: 'Sélectionner la couche supérieure', action: () => console.log('Select top layer') },
        { label: 'Sélectionner la couche inférieure', action: () => console.log('Select bottom layer') },
        { label: 'Sélectionner le sujet', action: () => console.log('Subject select') },
        { label: 'Sélectionner et masquer', action: () => console.log('Select and mask') },
        { separator: true },
        { label: 'Agrandir ou réduire la sélection', action: () => console.log('Grow/Shrink selection') },
        { label: 'Lissage de la bordure', action: () => console.log('Smooth border') },
        { separator: true },
        { label: 'Sélection par couleur', action: () => console.log('Color range') },
      ]
    },
    {
      name: 'Filtre',
      items: [
        { label: 'Galerie de filtres', items: [
          { label: 'Artistique', action: () => console.log('Artistic') },
          { label: 'Flou', action: () => console.log('Blur') },
          { label: 'Déformation', action: () => console.log('Distort') },
          { label: 'Distorsion', action: () => console.log('Distortion') },
          { label: 'Esquisse', action: () => console.log('Sketch') },
          { label: 'Texture', action: () => console.log('Texture') },
          { label: 'Netteté', action: () => console.log('Sharpen') },
          { label: 'Flou gaussien', action: () => console.log('Gaussian blur') },
          { label: 'Netteté', action: () => console.log('Sharpen') },
          { label: 'Bruit', action: () => console.log('Noise') },
          { label: 'Rendu', items: [
            { label: 'Éclairage', action: () => console.log('Lighting') },
            { label: 'Nuages', action: () => console.log('Clouds') },
          ]},
          { label: 'Autres', items: [
            { label: 'Passe-haut', action: () => console.log('High pass') },
            { label: 'Décalage', action: () => console.log('Offset') },
          ]},
        ]},
      ]
    },
    {
      name: 'Affichage',
      items: [
        { label: 'Zoom avant', shortcut: 'Ctrl++', action: actions.zoomIn },
        { label: 'Zoom arrière', shortcut: 'Ctrl+-', action: actions.zoomOut },
        { label: 'Adapter à l\'écran', action: actions.fitOnScreen },
        { label: 'Afficher les pixels réels', shortcut: 'Ctrl+0', action: actions.actualPixels },
        { separator: true },
        { label: 'Afficher les règles', shortcut: 'Ctrl+R', action: actions.showRulers },
        { label: 'Afficher / masquer la grille', shortcut: 'Ctrl+\'', action: actions.showGrid },
        { label: 'Afficher / masquer les repères', action: actions.showGuides },
        { label: 'Magnétisme des repères', action: actions.snapToGuides },
        { separator: true },
        { label: 'Mode plein écran', shortcut: 'F', action: actions.fullScreen },
        { label: 'Interface claire / sombre', action: actions.toggleTheme },
        { separator: true },
        { label: 'Afficher les calques / masques actifs uniquement', action: actions.showActiveLayersOnly },
      ]
    },
    {
      name: 'Fenêtre',
      items: [
        { label: 'Disposition horizontale', action: () => console.log('Horizontal layout') },
        { label: 'Disposition verticale', action: () => console.log('Vertical layout') },
        { separator: true },
        { label: 'Afficher ou masquer les panneaux', items: [
          { label: 'Calques', shortcut: 'F7', action: () => console.log('Layers panel') },
          { label: 'Couleur', shortcut: 'F6', action: () => console.log('Color panel') },
          { label: 'Historique', shortcut: 'F9', action: () => console.log('History panel') },
          { label: 'Propriétés', action: () => console.log('Properties panel') },
          { label: 'Texte / Caractère', action: () => console.log('Text/Character panel') },
          { label: 'Formes', action: () => console.log('Shapes panel') },
          { label: 'Nuancier', action: () => console.log('Swatches panel') },
          { label: 'Chemins', action: () => console.log('Paths panel') },
          { label: 'Informations', action: () => console.log('Info panel') },
        ]},
        { separator: true },
        { label: 'Réinitialiser l\'espace de travail', action: () => console.log('Reset workspace') },
        { label: 'Créer un nouvel espace de travail personnalisé', action: () => console.log('New custom workspace') },
      ]
    },
    {
      name: 'Réglages',
      items: [
        { label: 'Préférences générales', action: () => console.log('General preferences') },
        { label: 'Paramètres d\'interface', action: () => console.log('Interface settings') },
        { label: 'Raccourcis clavier', action: () => console.log('Keyboard shortcuts') },
        { label: 'Paramètres de performance', action: () => console.log('Performance settings') },
        { separator: true },
        { label: 'Réinitialiser les paramètres', action: () => console.log('Reset settings') },
      ]
    },
    {
      name: 'Aide',
      items: [
        { label: 'Centre d\'aide', action: () => console.log('Help center') },
        { label: 'Didacticiels interactifs', action: () => console.log('Interactive tutorials') },
        { label: 'Recherche de commandes', action: () => console.log('Command search') },
        { label: 'Vérifier les mises à jour', action: () => console.log('Check for updates') },
        { label: 'À propos du logiciel', action: () => console.log('About software') },
        { label: 'Forum / Support technique', action: () => console.log('Forum/Technical support') },
      ]
    },
  ];

  const renderMenuItem = (item: MenuItem, depth = 0, index = 0): React.ReactNode => {
    if (item.separator) {
      return <div key={`separator-${depth}-${index}`} className="border-t border-gray-600 my-1" />;
    }

    if (item.items) {
      return (
        <div key={`${item.label}-${depth}-${index}`} className="relative group">
          <button className="w-full text-left px-3 py-1 hover:bg-gray-600 text-xs flex justify-between items-center">
            <span>{item.label}</span>
            <span className="text-gray-400">▶</span>
          </button>
          <div className="absolute left-full top-0 bg-gray-700 shadow-lg rounded-md py-1 min-w-48 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto z-50">
            {item.items.map((subItem, subIndex) => renderMenuItem(subItem, depth + 1, subIndex))}
          </div>
        </div>
      );
    }

    return (
      <div key={`${item.label}-${depth}-${index}`} className="relative group">
        <button
          onClick={item.action}
          className="w-full text-left px-3 py-1 hover:bg-gray-600 text-xs flex justify-between items-center"
        >
          <span>{item.label}</span>
          {item.shortcut && <span className="text-gray-400 ml-4">{item.shortcut}</span>}
        </button>
        {item.description && (
          <div className="absolute left-full top-0 ml-2 bg-black text-white text-xs px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 max-w-xs whitespace-normal">
            {item.description}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-gray-800 text-white px-2 py-1 flex items-center text-sm">
      {menus.map((menu) => (
        <div key={menu.name} className="relative group mr-1">
          <button className="px-3 py-1 hover:bg-gray-700 rounded transition-colors">
            {menu.name}
          </button>
          <div className="absolute top-full left-0 bg-gray-700 shadow-lg rounded-b-md py-1 min-w-48 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto z-50">
            {menu.items.map((item, index) => renderMenuItem(item, 0, index))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PhotoshopMenuBar;
