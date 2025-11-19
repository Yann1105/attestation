import { TemplateElement } from '../types';
import { PSDImportResult } from './PSDImporter';
import { AIImportResult } from './AIImporter';

export interface ImportPreviewData {
  canvasSize: { width: number; height: number };
  elements: TemplateElement[];
  thumbnail?: string;
  layerCount: number;
  hasTransparency: boolean;
  estimatedSize: number;
  warnings: string[];
  recommendedSettings: {
    canvasSize: boolean; // Suggest adjusting canvas size
    performanceMode: boolean; // Suggest performance optimizations
    layerGrouping: boolean; // Suggest grouping layers
  };
}

export class ImportPreview {
  static async generatePSDPreview(file: File, psdResult: PSDImportResult): Promise<ImportPreviewData> {
    const elements = psdResult.layers.map(layer => ({
      id: `preview-${layer.name}`,
      type: layer.text ? 'text' : 'image' as const,
      x: 0,
      y: 0,
      width: layer.bounds.width,
      height: layer.bounds.height,
      zIndex: 0,
      visible: layer.visible,
      opacity: layer.opacity,
      // Add preview-specific properties
      previewBounds: layer.bounds,
      hasEffects: layer.effects && layer.effects.length > 0,
      hasMask: !!(layer.mask || layer.vectorMask),
    }));

    const hasTransparency = psdResult.layers.some(layer =>
      layer.opacity < 1 || layer.mask || layer.vectorMask
    );

    const estimatedSize = this.estimateFileSize(psdResult.layers);

    return {
      canvasSize: psdResult.canvasSize,
      elements,
      layerCount: psdResult.layers.length + psdResult.groups.length,
      hasTransparency,
      estimatedSize,
      warnings: this.generateWarnings(psdResult),
      recommendedSettings: {
        canvasSize: psdResult.canvasSize.width > 2000 || psdResult.canvasSize.height > 2000,
        performanceMode: estimatedSize > 50 * 1024 * 1024, // 50MB
        layerGrouping: psdResult.groups.length > 10,
      }
    };
  }

  static async generateAIPreview(file: File, aiResult: AIImportResult): Promise<ImportPreviewData> {
    return {
      canvasSize: aiResult.canvasSize,
      elements: aiResult.elements,
      layerCount: aiResult.layers.length,
      hasTransparency: true, // AI files typically have transparency
      estimatedSize: this.estimateFileSize([]), // Simplified for AI
      warnings: aiResult.warnings,
      recommendedSettings: {
        canvasSize: aiResult.canvasSize.width > 2000 || aiResult.canvasSize.height > 2000,
        performanceMode: false,
        layerGrouping: aiResult.layers.length > 10,
      }
    };
  }

  private static estimateFileSize(layers: any[]): number {
    // Rough estimation based on layer count and typical sizes
    const baseSize = 1024 * 1024; // 1MB base
    const layerSize = 512 * 1024; // 512KB per layer
    return baseSize + (layers.length * layerSize);
  }

  private static generateWarnings(psdResult: PSDImportResult): string[] {
    const warnings: string[] = [];

    // Check for large canvas
    if (psdResult.canvasSize.width > 4000 || psdResult.canvasSize.height > 4000) {
      warnings.push('Large canvas size detected - may impact performance');
    }

    // Check for many layers
    if (psdResult.layers.length + psdResult.groups.length > 50) {
      warnings.push('High layer count - consider grouping layers for better performance');
    }

    // Check for unsupported effects
    const unsupportedEffects = psdResult.layers.flatMap(layer =>
      layer.effects?.filter(effect =>
        !['dropShadow', 'innerShadow', 'outerGlow', 'innerGlow', 'bevel'].includes(effect.type)
      ) || []
    );

    if (unsupportedEffects.length > 0) {
      warnings.push(`${unsupportedEffects.length} effects may not be fully supported and alternatives will be suggested`);
    }

    return warnings;
  }

  static renderThumbnail(elements: TemplateElement[], canvasSize: { width: number; height: number }): Promise<string> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve('');
        return;
      }

      // Create thumbnail size (200x150 max)
      const aspectRatio = canvasSize.width / canvasSize.height;
      let thumbWidth = 200;
      let thumbHeight = 150;

      if (aspectRatio > thumbWidth / thumbHeight) {
        thumbHeight = thumbWidth / aspectRatio;
      } else {
        thumbWidth = thumbHeight * aspectRatio;
      }

      canvas.width = thumbWidth;
      canvas.height = thumbHeight;

      // Fill background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, thumbWidth, thumbHeight);

      // Simple rendering of elements (just rectangles for preview)
      const scaleX = thumbWidth / canvasSize.width;
      const scaleY = thumbHeight / canvasSize.height;

      elements.slice(0, 10).forEach(element => { // Limit to first 10 elements for preview
        ctx.fillStyle = element.backgroundColor || '#cccccc';
        ctx.globalAlpha = element.opacity || 1;
        ctx.fillRect(
          element.x * scaleX,
          element.y * scaleY,
          element.width * scaleX,
          element.height * scaleY
        );
      });

      resolve(canvas.toDataURL('image/png'));
    });
  }
}