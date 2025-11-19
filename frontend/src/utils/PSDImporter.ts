import Psd from '@webtoon/psd';
import { TemplateElement } from '../types';

export interface PSDLayerInfo {
  name: string;
  visible: boolean;
  opacity: number;
  blendMode: string;
  bounds: { x: number; y: number; width: number; height: number };
  imageData?: ImageData;
  mask?: {
    bounds: { x: number; y: number; width: number; height: number };
    imageData?: ImageData;
    type: 'raster' | 'vector';
    density?: number;
    feather?: number;
  };
  vectorMask?: {
    bounds: { x: number; y: number; width: number; height: number };
    path: { x: number; y: number }[];
    invert?: boolean;
  };
  effects?: PSDEffect[];
  text?: PSDTextInfo;
  clippingMask?: boolean;
  layerMask?: {
    type: 'raster' | 'vector';
    data?: ImageData;
    bounds?: { x: number; y: number; width: number; height: number };
  };
  adjustmentLayer?: {
    type: string;
    settings: any;
  };
  smartObject?: {
    linked: boolean;
    path?: string;
    data?: Uint8Array;
  };
  group?: PSDGroupInfo;
}

export interface PSDEffect {
  type: 'dropShadow' | 'innerShadow' | 'outerGlow' | 'innerGlow' | 'bevel' | 'overlay' | 'colorOverlay' | 'gradientOverlay' | 'patternOverlay' | 'stroke' | 'satin' | 'chrome';
  enabled: boolean;
  color?: { r: number; g: number; b: number; a?: number };
  opacity?: number;
  angle?: number;
  distance?: number;
  size?: number;
  blur?: number;
  spread?: number;
  noise?: number;
  highlightMode?: string;
  shadowMode?: string;
  highlightColor?: { r: number; g: number; b: number; a?: number };
  shadowColor?: { r: number; g: number; b: number; a?: number };
  highlightOpacity?: number;
  shadowOpacity?: number;
  bevelStyle?: 'inner' | 'outer' | 'emboss' | 'pillow';
  technique?: 'smooth' | 'chisel' | 'chiselhard';
  gradient?: {
    type: 'linear' | 'radial' | 'angle' | 'reflected' | 'diamond';
    colors: { color: { r: number; g: number; b: number; a?: number }; position: number }[];
    angle?: number;
    scale?: number;
  };
  pattern?: {
    name: string;
    scale?: number;
    linked?: boolean;
  };
  strokeStyle?: 'solid' | 'dashed' | 'dotted';
  strokeWidth?: number;
  strokeFillType?: 'color' | 'gradient' | 'pattern';
  chromeType?: 'soft' | 'hard' | 'metal';
  invert?: boolean;
}

export interface PSDTextInfo {
  content: string;
  fontSize: number;
  fontFamily: string;
  color: { r: number; g: number; b: number };
  bounds: { x: number; y: number; width: number; height: number };
}

export interface PSDImportResult {
  canvasSize: { width: number; height: number };
  layers: PSDLayerInfo[];
  groups: PSDGroupInfo[];
}

export interface PSDGroupInfo {
  name: string;
  visible: boolean;
  opacity: number;
  bounds: { x: number; y: number; width: number; height: number };
  layers: PSDLayerInfo[];
  subgroups: PSDGroupInfo[];
}

export class PSDImporter {
  static async importPSD(file: File): Promise<PSDImportResult> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const psd = Psd.parse(arrayBuffer);

      const canvasSize = {
        width: psd.width,
        height: psd.height
      };

      const layers: PSDLayerInfo[] = [];
      const groups: PSDGroupInfo[] = [];

      // Process layers recursively
      this.processLayers(psd.children || [], layers, groups);

      return {
        canvasSize,
        layers,
        groups
      };
    } catch (error) {
      console.error('Error importing PSD:', error);
      throw new Error(`Failed to import PSD file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private static processLayers(
    psdLayers: any[],
    flatLayers: PSDLayerInfo[],
    groups: PSDGroupInfo[],
    parentGroup?: PSDGroupInfo
  ): void {
    for (const layer of psdLayers) {
      if (layer.children && layer.children.length > 0) {
        // This is a group
        const group: PSDGroupInfo = {
          name: layer.name || 'Group',
          visible: layer.visible !== false,
          opacity: layer.opacity !== undefined ? layer.opacity / 255 : 1,
          bounds: layer.bounds || { x: 0, y: 0, width: 0, height: 0 },
          layers: [],
          subgroups: []
        };

        // Process children recursively
        this.processLayers(layer.children, group.layers, group.subgroups, group);

        if (parentGroup) {
          parentGroup.subgroups.push(group);
        } else {
          groups.push(group);
        }
      } else {
        // This is a regular layer
        const layerInfo: PSDLayerInfo = {
          name: layer.name || 'Layer',
          visible: layer.visible !== false,
          opacity: layer.opacity !== undefined ? layer.opacity / 255 : 1,
          blendMode: layer.blendMode || 'normal',
          bounds: layer.bounds || { x: 0, y: 0, width: 0, height: 0 }
        };

        // Extract image data if available
        if (layer.imageData) {
          layerInfo.imageData = layer.imageData;
        }

        // Extract mask data
        if (layer.mask) {
          layerInfo.mask = {
            bounds: layer.mask.bounds,
            imageData: layer.mask.imageData
          };
        }

        // Extract vector mask
        if (layer.vectorMask) {
           layerInfo.vectorMask = {
             bounds: layer.vectorMask.bounds || layer.bounds,
             path: layer.vectorMask.path || [],
             invert: layer.vectorMask.invert || false
           };
         }

        // Extract effects
        if (layer.effects) {
          layerInfo.effects = this.extractEffects(layer.effects);
        }

        // Extract text information
        if (layer.text) {
          layerInfo.text = this.extractTextInfo(layer.text);
        }

        flatLayers.push(layerInfo);

        if (parentGroup) {
          parentGroup.layers.push(layerInfo);
        }
      }
    }
  }

  private static extractEffects(effects: any): PSDEffect[] {
    const result: PSDEffect[] = [];

    // Drop Shadow
    if (effects.dropShadow) {
      result.push({
        type: 'dropShadow',
        enabled: effects.dropShadow.enabled !== false,
        color: effects.dropShadow.color,
        opacity: effects.dropShadow.opacity,
        angle: effects.dropShadow.angle,
        distance: effects.dropShadow.distance,
        size: effects.dropShadow.size,
        blur: effects.dropShadow.blur,
        spread: effects.dropShadow.spread,
        noise: effects.dropShadow.noise
      });
    }

    // Inner Shadow
    if (effects.innerShadow) {
      result.push({
        type: 'innerShadow',
        enabled: effects.innerShadow.enabled !== false,
        color: effects.innerShadow.color,
        opacity: effects.innerShadow.opacity,
        angle: effects.innerShadow.angle,
        distance: effects.innerShadow.distance,
        size: effects.innerShadow.size,
        blur: effects.innerShadow.blur,
        spread: effects.innerShadow.spread,
        noise: effects.innerShadow.noise
      });
    }

    // Outer Glow
    if (effects.outerGlow) {
      result.push({
        type: 'outerGlow',
        enabled: effects.outerGlow.enabled !== false,
        color: effects.outerGlow.color,
        opacity: effects.outerGlow.opacity,
        size: effects.outerGlow.size,
        blur: effects.outerGlow.blur,
        noise: effects.outerGlow.noise
      });
    }

    // Inner Glow
    if (effects.innerGlow) {
      result.push({
        type: 'innerGlow',
        enabled: effects.innerGlow.enabled !== false,
        color: effects.innerGlow.color,
        opacity: effects.innerGlow.opacity,
        size: effects.innerGlow.size,
        blur: effects.innerGlow.blur,
        noise: effects.innerGlow.noise
      });
    }

    // Bevel/Emboss
    if (effects.bevelEmboss) {
      result.push({
        type: 'bevel',
        enabled: effects.bevelEmboss.enabled !== false,
        bevelStyle: effects.bevelEmboss.style,
        technique: effects.bevelEmboss.technique,
        depth: effects.bevelEmboss.depth,
        direction: effects.bevelEmboss.direction,
        size: effects.bevelEmboss.size,
        soften: effects.bevelEmboss.soften,
        angle: effects.bevelEmboss.angle,
        altitude: effects.bevelEmboss.altitude,
        highlightColor: effects.bevelEmboss.highlightColor,
        shadowColor: effects.bevelEmboss.shadowColor,
        highlightOpacity: effects.bevelEmboss.highlightOpacity,
        shadowOpacity: effects.bevelEmboss.shadowOpacity,
        highlightMode: effects.bevelEmboss.highlightMode,
        shadowMode: effects.bevelEmboss.shadowMode
      });
    }

    // Color Overlay
    if (effects.colorOverlay) {
      result.push({
        type: 'colorOverlay',
        enabled: effects.colorOverlay.enabled !== false,
        color: effects.colorOverlay.color,
        opacity: effects.colorOverlay.opacity
      });
    }

    // Gradient Overlay
    if (effects.gradientOverlay) {
      result.push({
        type: 'gradientOverlay',
        enabled: effects.gradientOverlay.enabled !== false,
        gradient: {
          type: effects.gradientOverlay.type,
          colors: effects.gradientOverlay.colors || [],
          angle: effects.gradientOverlay.angle,
          scale: effects.gradientOverlay.scale
        },
        opacity: effects.gradientOverlay.opacity
      });
    }

    // Pattern Overlay
    if (effects.patternOverlay) {
      result.push({
        type: 'patternOverlay',
        enabled: effects.patternOverlay.enabled !== false,
        pattern: {
          name: effects.patternOverlay.name,
          scale: effects.patternOverlay.scale,
          linked: effects.patternOverlay.linked
        },
          opacity: effects.patternOverlay.opacity
      });
    }

    // Stroke
    if (effects.stroke) {
      result.push({
        type: 'stroke',
        enabled: effects.stroke.enabled !== false,
        strokeStyle: effects.stroke.style,
        strokeWidth: effects.stroke.width,
        strokeFillType: effects.stroke.fillType,
        color: effects.stroke.color,
        opacity: effects.stroke.opacity
      });
    }

    // Satin
    if (effects.satin) {
      result.push({
        type: 'satin',
        enabled: effects.satin.enabled !== false,
        color: effects.satin.color,
        opacity: effects.satin.opacity,
        angle: effects.satin.angle,
        distance: effects.satin.distance,
        size: effects.satin.size,
        invert: effects.satin.invert
      });
    }

    return result;
  }

  private static extractTextInfo(text: any): PSDTextInfo {
    return {
      content: text.content || '',
      fontSize: text.fontSize || 12,
      fontFamily: text.fontFamily || 'Arial',
      color: text.color || { r: 0, g: 0, b: 0 },
      bounds: text.bounds || { x: 0, y: 0, width: 100, height: 20 }
    };
  }

  static convertToTemplateElements(psdResult: PSDImportResult): TemplateElement[] {
    const elements: TemplateElement[] = [];

    // Convert flat layers to template elements
    psdResult.layers.forEach((layer, index) => {
      const element: TemplateElement = {
        id: `psd-layer-${index}`,
        type: layer.text ? 'text' : 'image',
        x: layer.bounds.x,
        y: layer.bounds.y,
        width: layer.bounds.width,
        height: layer.bounds.height,
        zIndex: index,
        visible: layer.visible,
        opacity: layer.opacity,
        blendMode: layer.blendMode as any
      };

      if (layer.text) {
        element.content = layer.text.content;
        element.fontSize = layer.text.fontSize;
        element.fontFamily = layer.text.fontFamily;
        element.color = `rgb(${layer.text.color.r}, ${layer.text.color.g}, ${layer.text.color.b})`;
      }

      // Store PSD-specific data
      (element as any).psdData = layer;

      elements.push(element);
    });

    return elements;
  }
}