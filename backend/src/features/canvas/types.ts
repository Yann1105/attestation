// Canvas Template Types
export interface CanvasTemplate {
    id?: string;
    name: string;
    description?: string;
    category: 'certificate' | 'attestation' | 'poster' | 'other';
    canvasData: KonvaJSON | any; // Allow any including HTML string wrapper if needed
    html?: string; // Optional HTML content
    variables?: TemplateVariable[];
    width: number;
    height: number;
    backgroundColor?: string;
    createdBy?: number;
    createdAt?: Date;
    updatedAt?: Date;
    version?: number;
    isPublic?: boolean;
    aiPrompt?: string;
    outputFormat?: string;
}

export interface KonvaJSON {
    attrs?: {
        width: number;
        height: number;
        [key: string]: any;
    };
    className?: string;
    children?: KonvaNode[];
}

export interface KonvaNode {
    attrs: {
        [key: string]: any;
    };
    className: string;
    children?: KonvaNode[];
}

export interface TemplateVariable {
    name: string;
    type: 'text' | 'date' | 'number' | 'image';
    required?: boolean;
    default?: any;
    format?: string; // For dates: 'DD/MM/YYYY', etc.
}

export interface CanvasTemplateVersion {
    id?: string;
    templateId: string;
    version: number;
    canvasData: KonvaJSON;
    createdAt?: Date;
    createdBy?: number;
    changeDescription?: string;
}

export interface CanvasRender {
    id?: string;
    templateId: string;
    participantId?: number;
    renderType: 'pdf' | 'png' | 'jpeg';
    filePath?: string;
    variablesUsed?: Record<string, any>;
    createdAt?: Date;
}

export interface AIGenerateRequest {
    prompt: string;
    category?: 'certificate' | 'attestation' | 'poster';
    style?: 'modern' | 'classic' | 'elegant' | 'minimal';
    colorScheme?: string[];
    width?: number;
    height?: number;
    format?: 'json' | 'html'; // Added format
}

export interface RenderRequest {
    templateId?: string;
    canvasData?: KonvaJSON | string; // Support HTML string
    html?: string; // Explicit HTML field
    variables?: Record<string, any>;
    format: 'pdf' | 'png' | 'jpeg';
    dpi?: number;
}
