export type BlendMode =
    | 'normal'
    | 'multiply'
    | 'screen'
    | 'overlay'
    | 'darken'
    | 'lighten'
    | 'color-dodge'
    | 'color-burn'
    | 'hard-light'
    | 'soft-light'
    | 'difference'
    | 'exclusion'
    | 'hue'
    | 'saturation'
    | 'color'
    | 'luminosity';

export type LayerType = 'image' | 'text' | 'shape' | 'group' | 'adjustment';

export interface FilterState {
    blur?: number;
    brightness?: number;
    contrast?: number;
    grayscale?: number;
    invert?: number;
    sepia?: number;
    saturate?: number;
    hueRotate?: number;
}

export interface Layer {
    id: string;
    name: string;
    type: LayerType;
    visible: boolean;
    opacity: number;
    blendMode: BlendMode;
    x: number;
    y: number;
    width: number;
    height: number;
    zIndex: number;
    parentId?: string | null;

    // Data
    sourceUrl?: string; // Original source URL
    buffer?: Buffer; // Current pixel data (server-side only)

    // Specific properties
    text?: string;
    fontFamily?: string;
    fontSize?: number;
    color?: string;

    // Shape properties
    fillColor?: string;
    strokeColor?: string;
    strokeWidth?: number;

    // Filters
    filters: FilterState;
}

export interface PsProject {
    id: string;
    name: string;
    width: number;
    height: number;
    backgroundColor: string;
    createdAt: Date;
    updatedAt: Date;
    layers: Layer[];
}

export interface ToolAction {
    tool: string;
    x: number;
    y: number;
    params: Record<string, any>; // e.g., brushSize, color, tolerance
}

export interface HistoryState {
    id: string;
    timestamp: Date;
    actionDescription: string;
    projectDisplaySnapshot: string; // URL to a thumbnail
    fullState: PsProject; // Deep clone of project state
}
