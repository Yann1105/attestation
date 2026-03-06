export interface Participant {
  id: string;
  participantName: string;
  email: string;
  phone?: string;
  organization?: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected';
  certificateNumber?: string;
  approvalDate?: string;
  rejectionReason?: string;
  templateId?: string;
  trainingTitle?: string;
  trainingDate?: string;
  trainingLocation?: string;
  trainingDuration?: string;
  instructor?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Training {
  id: string;
  title: string;
  date: string;
  location: string;
  duration: string;
  instructor: string;
  description?: string;
  organization?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CertificateTemplate {
  id: string;
  name: string;
  type?: 'bimades-gold' | 'bimades-green' | 'bimades-blue' | 'custom';
  description?: string;
  elements: TemplateElement[];
  canvasData?: any; // Allow object or string
  html?: string; // HTML content for HTML templates
  backgroundColor?: string;
  width?: number;
  height?: number;
  variables?: string[]; // Liste des variables utilisées dans le template
  variableValues?: Record<string, string>; // Valeurs des variables pour l'export
  editorType?: 'simple' | 'canvas'; // Type d'éditeur utilisé pour créer le template
  editableAfterSave?: boolean; // Permet la modification après enregistrement
  layers?: TemplateLayer[]; // Layer hierarchy for PSD/AI imports
  aiPrompt?: string;
  aiGenerated?: boolean;
  outputFormat?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TemplateLayer {
  id: string;
  name: string;
  type: 'layer' | 'group';
  visible: boolean;
  locked: boolean;
  opacity: number;
  blendMode: string;
  parentId?: string;
  children?: string[]; // IDs of child layers/groups
  elementId?: string; // Reference to the TemplateElement if it's a layer
}

export interface TemplateElement {
  id: string;
  type: 'text' | 'image' | 'shape' | 'logo' | 'group';
  children?: string[]; // IDs of child elements for groups
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  color?: string;
  textAlign?: 'left' | 'center' | 'right';
  backgroundColor?: string;
  borderRadius?: number;
  rotation?: number;
  scaleX?: number; // Horizontal scaling factor
  scaleY?: number; // Vertical scaling factor
  opacity?: number;
  imageUrl?: string;
  zIndex: number;
  isPlaceholder?: boolean; // Nouveau champ pour identifier les variables dynamiques
  variableName?: string; // Nom de la variable pour le remplacement dynamique
  textType?: 'point' | 'paragraph'; // Type de texte : ponctuel ou paragraphe
  warpIntensity?: number; // Intensité de la déformation pour les effets warp
  pathData?: string; // SVG path data for custom shapes
  controlPoints?: { x: number; y: number }[]; // Control points for shape deformation
  curvaturePoints?: { x: number; y: number }[]; // Curvature points for side bending
  shapeType?: string; // Shape type

  // Advanced shape manipulation properties
  skewX?: number; // Horizontal skew in degrees
  skewY?: number; // Vertical skew in degrees
  innerRadius?: number; // For stars/polygons
  outerRadius?: number; // For stars/polygons
  numberOfPoints?: number; // For stars/polygons
  initialAngle?: number; // For stars/polygons
  isCircle?: boolean; // Force circle aspect ratio
  isLine?: boolean; // Special handling for lines (only endpoints)

  // Path editing properties
  bezierHandles?: { x: number; y: number }[]; // Bezier control handles
  pointTypes?: ('corner' | 'smooth' | 'symmetric')[]; // Point types for path editing

  // Fill properties
  fillType?: 'solid' | 'gradient' | 'none';
  fillColor?: string;
  fillGradient?: {
    type: 'linear' | 'radial';
    colors: { color: string; position: number }[];
    angle?: number;
  };
  fillOpacity?: number;

  // Stroke properties
  strokeColor?: string;
  strokeWidth?: number;
  strokeStyle?: 'solid' | 'dashed' | 'dotted';
  strokePosition?: 'center' | 'inside' | 'outside';
  strokeOpacity?: number;

  // Rounded corners (individual control)
  borderRadiusTopLeft?: number;
  borderRadiusTopRight?: number;
  borderRadiusBottomLeft?: number;
  borderRadiusBottomRight?: number;

  // Shadows & Glows
  shadows?: {
    type: 'inner' | 'outer';
    color: string;
    opacity: number;
    blur: number;
    distance: number;
    angle: number;
    spread?: number;
  }[];

  // Layer properties
  locked?: boolean;
  visible?: boolean;

  // Filters
  filter?: {
    blur?: number;
    brightness?: number;
    contrast?: number;
    shadow?: {
      x: number;
      y: number;
      blur: number;
      color: string;
    };
    grayscale?: number;
    sepia?: number;
    hueRotate?: number;
    saturate?: number;
  };

  // PSD/AI import properties
  layerName?: string; // Original layer name from PSD/AI
  parentId?: string; // For layer groups/hierarchy
  blendMode?: 'normal' | 'multiply' | 'screen' | 'overlay' | 'soft-light' | 'hard-light' | 'color-dodge' | 'color-burn' | 'darken' | 'lighten' | 'difference' | 'exclusion' | 'hue' | 'saturation' | 'color' | 'luminosity';
  layerMask?: {
    type: 'vector' | 'raster';
    data?: string; // Base64 encoded mask data
    bounds?: { x: number; y: number; width: number; height: number };
  };
  clippingMask?: boolean; // Whether this layer clips to the layer below
  effects?: {
    type: 'drop-shadow' | 'inner-shadow' | 'outer-glow' | 'inner-glow' | 'bevel-emboss' | 'color-overlay' | 'gradient-overlay' | 'pattern-overlay' | 'stroke';
    enabled: boolean;
    settings: any; // Effect-specific settings
  }[];
}

export interface Statistics {
  totalCertified: number;
  pendingRequests: number;
  totalTrainings: number;
  certifiedByTraining: Record<string, number>;
  monthlyStats: Record<string, number>;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  signature?: string;
  token?: string;
}

export interface CertificateData {
  participantName: string;
  trainingTitle: string;
  trainingDate: string;
  trainingLocation: string;
  trainingDuration: string;
  instructor: string;
  certificateNumber: string;
  issueDate: string;
  organization: string;
  projectInfo?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}