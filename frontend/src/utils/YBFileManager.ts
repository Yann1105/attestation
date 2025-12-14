import pako from 'pako'; // For gzip compression/decompression

import { TemplateLayer, TemplateElement } from '../types';

export interface ProjectData {
  layers: TemplateLayer[];
  elements: TemplateElement[]; // Store all renderable elements here
  positions: Record<string, { x: number; y: number; width: number; height: number }>;
  texts: TemplateElement[]; // Redundant if elements stores all, but kept for clarity based on prompt
  images: TemplateElement[]; // Redundant if elements stores all, but kept for clarity based on prompt
  effects: any[]; // Effects might be complex, keeping as any for now
  transparency: number;
  internalVariables: Record<string, any>;
  canvasSettings: {
    width: number;
    height: number;
    backgroundColor: string;
  };
  metadata: {
    author: string;
    date: string;
    version: string;
  };
}

const YB_FILE_VERSION = "1.0.0";

class YBFileManager {
  /**
   * Saves project data to a .yb file.
   * @param projectData The complete project data to save.
   * @returns A Promise that resolves when the file is saved.
   */
  async saveYB(projectData: ProjectData): Promise<void> {
    try {
      const dataToSave = {
        ...projectData,
        metadata: {
          ...projectData.metadata,
          version: YB_FILE_VERSION,
          date: new Date().toISOString(),
        },
      };

      const jsonString = JSON.stringify(dataToSave);
      const compressedData = pako.gzip(jsonString);

      const blob = new Blob([compressedData], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `project-${Date.now()}.yb`; // Suggest a default filename
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      console.log("Project saved successfully as .yb");
    } catch (error) {
      console.error("Error saving .yb file:", error);
      throw new Error("Failed to save .yb file.");
    }
  }

  /**
   * Loads project data from a .yb file.
   * @param file The .yb file to load.
   * @returns A Promise that resolves with the loaded ProjectData.
   */
  async loadYB(file: File): Promise<ProjectData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const compressedData = new Uint8Array(event.target?.result as ArrayBuffer);
          const decompressedData = pako.ungzip(compressedData, { to: 'string' });
          const projectData: ProjectData = JSON.parse(decompressedData);

          // Validate the loaded data
          this.validateYB(projectData);

          resolve(projectData);
        } catch (error) {
          console.error("Error loading .yb file:", error);
          reject(new Error("Failed to load or parse .yb file."));
        }
      };
      reader.onerror = (error) => {
        console.error("FileReader error:", error);
        reject(new Error("Failed to read file."));
      };
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Validates the structure and content of loaded project data.
   * @param projectData The project data object to validate.
   * @returns True if the data is valid, throws an error otherwise.
   */
  validateYB(projectData: ProjectData): boolean {
    if (!projectData || typeof projectData !== 'object') {
      throw new Error("Invalid .yb file: Root is not an object.");
    }

    // Check version
    if (projectData.metadata?.version !== YB_FILE_VERSION) {
      console.warn(`YB file version mismatch. Expected ${YB_FILE_VERSION}, got ${projectData.metadata?.version}. Attempting to load anyway.`);
      // Depending on requirements, this could be a hard error or a warning.
      // For now, it's a warning to allow loading older versions if compatible.
    }

    // Check essential top-level properties
    const requiredProps = [
      'layers', 'positions', 'texts', 'images', 'effects',
      'transparency', 'internalVariables', 'canvasSettings', 'metadata'
    ];
    for (const prop of requiredProps) {
      if (!(prop in projectData)) {
        throw new Error(`Invalid .yb file: Missing required property '${prop}'.`);
      }
    }

    // Basic type checks for some properties
    if (!Array.isArray(projectData.layers)) {
      throw new Error("Invalid .yb file: 'layers' is not an array.");
    }
    if (typeof projectData.transparency !== 'number') {
      throw new Error("Invalid .yb file: 'transparency' is not a number.");
    }
    if (typeof projectData.metadata !== 'object' || projectData.metadata === null) {
      throw new Error("Invalid .yb file: 'metadata' is not an object.");
    }

    // Further checks for layers (example: ensure each layer has a 'type' and 'id')
    for (const layer of projectData.layers) {
      if (typeof layer !== 'object' || layer === null || !('type' in layer) || !('id' in layer)) {
        throw new Error("Invalid .yb file: Malformed layer found.");
      }
      // Add more specific layer validation here if needed
    }

    // Check for data corruption (e.g., if JSON parsing failed silently for some parts)
    // This is harder to do generically without knowing the exact structure of each sub-object.
    // The JSON.parse will throw for malformed JSON, but if data types are wrong, it won't.
    // The above checks cover basic structural integrity.

    console.log("YB file validated successfully.");
    return true;
  }

  /**
   * Exports project data to other formats.
   * @param format The target format (e.g., 'png', 'pdf', 'svg', 'psd').
   * @param projectData The project data to export.
   * @returns A Promise that resolves when the export is complete.
   */
  async exportTo(format: string, projectData: ProjectData): Promise<void> {
    try {
      if (format === 'png') {
        await this.exportToPNG(projectData);
      } else if (format === 'pdf') {
        throw new Error('PDF export requires jsPDF library, which is not installed.');
      } else if (format === 'svg') {
        await this.exportToSVG(projectData);
      } else if (format === 'psd') {
        throw new Error('PSD export is not implemented. Requires complex PSD file generation library.');
      } else {
        throw new Error(`Unsupported export format: ${format}`);
      }
    } catch (error) {
      console.error(`Export to ${format} failed:`, error);
      throw error;
    }
  }

  private async exportToPNG(projectData: ProjectData): Promise<void> {
    const { canvasSettings, elements } = projectData;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Canvas context not available');
    }

    canvas.width = canvasSettings.width;
    canvas.height = canvasSettings.height;

    // Fill background
    ctx.fillStyle = canvasSettings.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Render elements (simplified, no advanced rendering)
    for (const element of elements) {
      if (element.type === 'text') {
        ctx.fillStyle = element.color || '#000000';
        ctx.font = `${element.fontSize || 16}px ${element.fontFamily || 'Arial'}`;
        ctx.fillText(element.content || '', element.x, element.y + (element.fontSize || 16));
      } else if (element.type === 'shape' || element.type === 'image') {
        // Simplified rendering
        ctx.fillStyle = element.backgroundColor || '#cccccc';
        ctx.fillRect(element.x, element.y, element.width, element.height);
      }
      // Add more rendering logic as needed for full support
    }

    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `project.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        console.log("Project exported successfully as PNG");
      }
    }, 'image/png');
  }

  private async exportToSVG(projectData: ProjectData): Promise<void> {
    const { canvasSettings, elements } = projectData;

    let svgContent = `<svg width="${canvasSettings.width}" height="${canvasSettings.height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${canvasSettings.backgroundColor}" />`;

    // Add elements (very basic)
    for (const element of elements) {
      if (element.type === 'text') {
        svgContent += `<text x="${element.x}" y="${element.y + (element.fontSize || 16)}" font-family="${element.fontFamily || 'Arial'}" font-size="${element.fontSize || 16}" fill="${element.color || '#000000'}">${(element.content || '').replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>')}</text>`;
      } else if (element.type === 'shape') {
        svgContent += `<rect x="${element.x}" y="${element.y}" width="${element.width}" height="${element.height}" fill="${element.backgroundColor || '#cccccc'}" />`;
      }
      // Add more as needed
    }

    svgContent += '</svg>';

    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `project.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    console.log("Project exported successfully as SVG");
  }
}

export const ybFileManager = new YBFileManager();
