import { TemplateElement } from '../types';

export interface AIImportResult {
  canvasSize: { width: number; height: number };
  elements: TemplateElement[];
  warnings: string[];
  layers: AILayerInfo[];
}

export interface AILayerInfo {
  name: string;
  visible: boolean;
  opacity: number;
  bounds: { x: number; y: number; width: number; height: number };
  type: 'layer' | 'group' | 'path' | 'text' | 'image' | 'shape';
  effects?: AIEffect[];
  blendMode?: string;
  mask?: {
    type: 'opacity' | 'clipping';
    path?: string;
  };
  clippingMask?: boolean;
  group?: AIGroupInfo;
  text?: AITextInfo;
  path?: AIPathInfo;
}

export interface AIGroupInfo {
  name: string;
  children: AILayerInfo[];
}

export interface AITextInfo {
  content: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  color: { r: number; g: number; b: number; a?: number };
  bounds: { x: number; y: number; width: number; height: number };
  alignment: 'left' | 'center' | 'right' | 'justify';
  textAnchor?: 'start' | 'middle' | 'end';
}

export interface AIPathInfo {
  svgPath: string;
  fill?: {
    type: 'solid' | 'gradient' | 'pattern';
    color?: { r: number; g: number; b: number; a?: number };
    gradient?: {
      type: 'linear' | 'radial';
      stops: { color: { r: number; g: number; b: number; a?: number }; offset: number }[];
      angle?: number;
    };
    pattern?: {
      name: string;
      scale?: number;
    };
  };
  stroke?: {
    color: { r: number; g: number; b: number; a?: number };
    width: number;
    style: 'solid' | 'dashed' | 'dotted';
    opacity: number;
  };
  bounds: { x: number; y: number; width: number; height: number };
}

export interface AIEffect {
  type: 'dropShadow' | 'innerShadow' | 'outerGlow' | 'innerGlow' | 'blur' | 'gradient' | 'pattern' | 'stroke' | 'feather' | 'innerGlow';
  enabled: boolean;
  settings: any;
}

export class AIImporter {
  static async importAI(file: File): Promise<AIImportResult> {
    try {
      const warnings: string[] = [];

      // AI files are complex PDF-based formats
      // For now, we'll provide a basic implementation with fallbacks

      // Check if it's actually a PDF (AI files are often saved as PDFs)
      if (file.type === 'application/pdf') {
        warnings.push('AI file detected as PDF. Converting to image elements. Vector data may be lost.');
        return this.handleAsPDF(file, warnings);
      }

      // Try to read as text to see if it contains SVG-like data
      const textContent = await this.readFileAsText(file);
      if (textContent.includes('<svg') || textContent.includes('<?xml')) {
        return this.parseAsSVG(textContent, warnings);
      }

      // Fallback: treat as image
      warnings.push('AI file format not fully supported. Importing as image with limited editing capabilities.');
      return this.handleAsImage(file, warnings);

    } catch (error) {
      console.error('Error importing AI:', error);
      throw new Error(`Failed to import AI file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static async readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string || '');
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  private static async handleAsPDF(file: File, warnings: string[]): Promise<AIImportResult> {
    // For PDF/AI files, we'll create a placeholder element
    // In a full implementation, you'd use pdf.js or similar
    const element: TemplateElement = {
      id: `ai-element-${Date.now()}`,
      type: 'image',
      x: 100,
      y: 100,
      width: 400,
      height: 300,
      zIndex: 0,
      content: 'PDF/AI content - vector editing not available',
      backgroundColor: '#f0f0f0'
    };

    const layer: AILayerInfo = {
      name: 'PDF/AI Content',
      visible: true,
      opacity: 1,
      bounds: { x: 100, y: 100, width: 400, height: 300 },
      type: 'image'
    };

    return {
      canvasSize: { width: 800, height: 600 },
      elements: [element],
      warnings,
      layers: [layer]
    };
  }

  private static parseAsSVG(svgContent: string, warnings: string[]): AIImportResult {
    const elements: TemplateElement[] = [];
    const layers: AILayerInfo[] = [];

    try {
      // Parse SVG as DOM (browser environment)
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');

      // Get SVG dimensions
      const svgElement = svgDoc.querySelector('svg');
      const widthStr = svgElement?.getAttribute('width') || '800';
      const heightStr = svgElement?.getAttribute('height') || '600';

      // Parse dimensions, handle both px values and plain numbers
      const width = parseInt(widthStr.replace('px', '')) || 800;
      const height = parseInt(heightStr.replace('px', '')) || 600;

      // Extract text elements
      const textElements = svgDoc.querySelectorAll('text');
      textElements.forEach((textEl: Element, index: number) => {
        // For SVG parsing in browser, we need to estimate bounds
        const bbox = (textEl as SVGGraphicsElement).getBBox?.();
        const x = bbox?.x || 0;
        const y = bbox?.y || 0;
        const width = bbox?.width || 200;
        const height = bbox?.height || 20;

        // Extract text properties
        const fontSize = textEl.getAttribute('font-size') || '16px';
        const fontFamily = textEl.getAttribute('font-family') || 'Arial';
        const fill = textEl.getAttribute('fill') || '#000000';

        const element: TemplateElement = {
          id: `ai-text-${index}`,
          type: 'text',
          x,
          y,
          width,
          height,
          zIndex: index,
          content: textEl.textContent || '',
          fontSize: parseInt(fontSize),
          fontFamily,
          color: fill.startsWith('#') ? fill : '#000000'
        };
        elements.push(element);

        layers.push({
          name: `Text Layer ${index + 1}`,
          visible: true,
          opacity: 1,
          bounds: { x: element.x, y: element.y, width: element.width, height: element.height },
          type: 'text',
          text: {
            content: textEl.textContent || '',
            fontFamily,
            fontSize: parseInt(fontSize),
            fontWeight: 'normal',
            color: this.parseColor(fill),
            bounds: element,
            alignment: 'left'
          }
        });
      });

      // Extract basic shapes
      const shapeElements = svgDoc.querySelectorAll('rect, circle, ellipse, line, polygon, polyline, path');
      shapeElements.forEach((shapeEl: Element, index: number) => {
        const bbox = (shapeEl as SVGGraphicsElement).getBBox?.();
        const x = bbox?.x || 0;
        const y = bbox?.y || 0;
        const width = bbox?.width || 100;
        const height = bbox?.height || 100;

        const shapeType = shapeEl.tagName.toLowerCase();
        const fill = shapeEl.getAttribute('fill') || '#cccccc';
        const stroke = shapeEl.getAttribute('stroke') || '#000000';
        const strokeWidth = parseInt(shapeEl.getAttribute('stroke-width') || '1');

        const element: TemplateElement = {
          id: `ai-shape-${index}`,
          type: 'shape',
          x,
          y,
          width,
          height,
          zIndex: elements.length + index,
          shapeType: this.mapShapeType(shapeType),
          backgroundColor: fill.startsWith('#') ? fill : '#cccccc',
          strokeColor: stroke.startsWith('#') ? stroke : '#000000',
          strokeWidth
        };
        elements.push(element);

        layers.push({
          name: `${shapeType.charAt(0).toUpperCase() + shapeType.slice(1)} ${index + 1}`,
          visible: true,
          opacity: 1,
          bounds: { x: element.x, y: element.y, width: element.width, height: element.height },
          type: 'shape',
          path: {
            svgPath: shapeEl.getAttribute('d') || '',
            fill: {
              type: 'solid',
              color: this.parseColor(fill)
            },
            stroke: {
              color: this.parseColor(stroke),
              width: strokeWidth,
              style: 'solid',
              opacity: 1
            },
            bounds: element
          }
        });
      });

      return {
        canvasSize: { width, height },
        elements,
        warnings,
        layers
      };
    } catch (error: unknown) {
      console.error('SVG parsing error:', error);
      warnings.push('Failed to parse SVG content from AI file');
      return this.fallbackResult(warnings);
    }
  }

  private static async handleAsImage(file: File, warnings: string[]): Promise<AIImportResult> {
    // Create an image element from the file
    const url = URL.createObjectURL(file);
    const element: TemplateElement = {
      id: `ai-image-${Date.now()}`,
      type: 'image',
      x: 100,
      y: 100,
      width: 400,
      height: 300,
      zIndex: 0,
      content: url, // Store the blob URL
      locked: true // Prevent editing since it's a complex format
    };

    const layer: AILayerInfo = {
      name: 'AI Image Content',
      visible: true,
      opacity: 1,
      bounds: { x: 100, y: 100, width: 400, height: 300 },
      type: 'image'
    };

    return {
      canvasSize: { width: 800, height: 600 },
      elements: [element],
      warnings,
      layers: [layer]
    };
  }

  private static fallbackResult(warnings: string[]): AIImportResult {
    warnings.push('Unable to parse AI file. Creating placeholder element.');

    const element: TemplateElement = {
      id: `ai-fallback-${Date.now()}`,
      type: 'shape',
      x: 100,
      y: 100,
      width: 400,
      height: 200,
      zIndex: 0,
      shapeType: 'rectangle',
      backgroundColor: '#e0e0e0',
      content: 'AI file imported as placeholder - full editing not available'
    };

    return {
      canvasSize: { width: 800, height: 600 },
      elements: [element],
      warnings,
      layers: []
    };
  }

  private static parseColor(color: string): { r: number; g: number; b: number; a?: number } {
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      return { r, g, b };
    } else if (color.startsWith('rgb')) {
      const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      if (match) {
        return { r: parseInt(match[1]), g: parseInt(match[2]), b: parseInt(match[3]) };
      }
    }
    // Default to black
    return { r: 0, g: 0, b: 0 };
  }

  private static mapShapeType(svgShape: string): string {
    switch (svgShape) {
      case 'rect':
        return 'rectangle';
      case 'circle':
        return 'circle';
      case 'ellipse':
        return 'ellipse';
      case 'line':
        return 'line';
      case 'polygon':
        return 'polygon';
      case 'polyline':
        return 'polyline';
      case 'path':
        return 'path';
      default:
        return 'custom-shape';
    }
  }
}
