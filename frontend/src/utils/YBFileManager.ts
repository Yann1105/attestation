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
   * Placeholder for exporting project data to other formats.
   * This would involve specific rendering logic for each format.
   * @param format The target format (e.g., 'png', 'pdf', 'svg', 'psd').
   * @returns A Promise that resolves when the export is complete.
   */
  async exportTo(format: string): Promise<void> {
    console.warn(`Export to ${format} is not fully implemented. This is a placeholder.`);
    // In a real application, this would involve:
    // 1. Rendering the canvas to the desired format (e.g., using HTML Canvas API for PNG/JPEG).
    // 2. Using a library for PDF/SVG generation.
    // 3. PSD export would be highly complex and likely require a dedicated library or backend service.
    alert(`Exporting to ${format} is not yet fully supported.`);
    return Promise.resolve();
  }
}

export const ybFileManager = new YBFileManager();
