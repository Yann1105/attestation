import { CertificateTemplate } from '../types';

export interface ExportOptions {
  format: 'png' | 'jpg' | 'svg' | 'pdf' | 'psd';
  quality?: number; // For JPG
  scale?: number; // Canvas scale factor
  includeTransparent?: boolean;
  backgroundColor?: string;
  resolution?: number; // DPI for PDF
}

export class ExportUtils {
  static async exportTemplate(
    template: CertificateTemplate,
    options: ExportOptions
  ): Promise<Blob> {
    switch (options.format) {
      case 'png':
        return this.exportToPNG(template, options);
      case 'jpg':
        return this.exportToJPG(template, options);
      case 'svg':
        return this.exportToSVG(template, options);
      case 'pdf':
        return this.exportToPDF(template, options);
      case 'psd':
        return this.exportToPSD(template, options);
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  }

  private static async exportToPNG(
    template: CertificateTemplate,
    options: ExportOptions
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Could not create canvas context'));
        return;
      }

      const scale = options.scale || 1;
      const templateWidth = template.width || 800;
      const templateHeight = template.height || 600;
      canvas.width = templateWidth * scale;
      canvas.height = templateHeight * scale;

      // Set background
      const bgColor = options.backgroundColor || template.backgroundColor || '#ffffff';
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw elements
      this.drawElementsOnCanvas(ctx, template.elements, scale);

      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create PNG blob'));
        }
      }, 'image/png');
    });
  }

  private static async exportToJPG(
    template: CertificateTemplate,
    options: ExportOptions
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Could not create canvas context'));
        return;
      }

      const scale = options.scale || 1;
      const templateWidth = template.width || 800;
      const templateHeight = template.height || 600;
      canvas.width = templateWidth * scale;
      canvas.height = templateHeight * scale;

      // Set background (JPG doesn't support transparency)
      const bgColor = options.backgroundColor || template.backgroundColor || '#ffffff';
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw elements
      this.drawElementsOnCanvas(ctx, template.elements, scale);

      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create JPG blob'));
        }
      }, 'image/jpeg', options.quality || 0.9);
    });
  }

  private static async exportToSVG(
    template: CertificateTemplate,
    options: ExportOptions
  ): Promise<Blob> {
    const svgContent = this.generateSVGContent(template, options);

    return new Blob([svgContent], { type: 'image/svg+xml' });
  }

  private static async exportToPDF(
    template: CertificateTemplate,
    options: ExportOptions
  ): Promise<Blob> {
    // For PDF export, we'll use a library if available
    // For now, we'll create a simple implementation using SVG conversion
    const svgContent = this.generateSVGContent(template, options);

    // Convert SVG to canvas then to PDF (simplified)
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Could not create canvas context'));
        return;
      }

      // Create image from SVG
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // For now, just return PNG. Full PDF implementation would use jsPDF
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create PDF blob'));
          }
        }, 'application/pdf');
      };

      img.onerror = () => reject(new Error('Failed to load SVG'));
      img.src = `data:image/svg+xml;base64,${btoa(svgContent)}`;
    });
  }

  private static async exportToPSD(
    template: CertificateTemplate,
    options: ExportOptions
  ): Promise<Blob> {
    // PSD export is complex and would require a PSD writer library
    // For now, convert to PNG and add PSD extension (not a real PSD)
    console.warn('PSD export is not fully implemented. Exporting as PNG with .psd extension.');

    const pngBlob = await this.exportToPNG(template, options);
    return new Blob([await pngBlob.arrayBuffer()], { type: 'application/x-photoshop' });
  }

  private static drawElementsOnCanvas(
    ctx: CanvasRenderingContext2D,
    elements: any[],
    scale: number
  ): void {
    elements
      .filter(el => el.visible !== false)
      .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
      .forEach(element => {
        ctx.save();

        // Apply transformations
        ctx.translate(element.x * scale, element.y * scale);

        // Apply opacity
        if (element.opacity !== undefined) {
          ctx.globalAlpha = element.opacity;
        }

        // Apply rotation
        if (element.rotation) {
          ctx.rotate((element.rotation * Math.PI) / 180);
        }

        // Draw based on element type
        switch (element.type) {
          case 'text':
            this.drawTextElement(ctx, element, scale);
            break;
          case 'shape':
            this.drawShapeElement(ctx, element, scale);
            break;
          case 'image':
            this.drawImageElement(ctx, element, scale);
            break;
        }

        ctx.restore();
      });
  }

  private static drawTextElement(
    ctx: CanvasRenderingContext2D,
    element: any,
    scale: number
  ): void {
    ctx.fillStyle = element.color || '#000000';
    ctx.font = `${element.fontSize * scale}px ${element.fontFamily || 'Arial'}`;
    ctx.textAlign = element.textAlign || 'left';
    ctx.textBaseline = 'top';

    if (element.backgroundColor) {
      ctx.fillStyle = element.backgroundColor;
      ctx.fillRect(0, 0, element.width * scale, element.height * scale);
      ctx.fillStyle = element.color || '#000000';
    }

    const lines = (element.content || '').split('\n');
    const lineHeight = (element.fontSize || 16) * scale * 1.2;
    let y = 0;

    lines.forEach((line: string) => {
      ctx.fillText(line, 0, y);
      y += lineHeight;
    });
  }

  private static drawShapeElement(
    ctx: CanvasRenderingContext2D,
    element: any,
    scale: number
  ): void {
    const width = element.width * scale;
    const height = element.height * scale;

    // Fill
    if (element.backgroundColor) {
      ctx.fillStyle = element.backgroundColor;
      ctx.fillRect(0, 0, width, height);
    }

    // Stroke
    if (element.strokeColor && element.strokeWidth) {
      ctx.strokeStyle = element.strokeColor;
      ctx.lineWidth = element.strokeWidth * scale;
      ctx.strokeRect(0, 0, width, height);
    }
  }

  private static drawImageElement(
    ctx: CanvasRenderingContext2D,
    element: any,
    scale: number
  ): void {
    // For image elements, we'd need to load the image first
    // This is a simplified version
    if (element.imageUrl && element.imageUrl.startsWith('blob:')) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, element.width * scale, element.height * scale);
      };
      img.src = element.imageUrl;
    }
  }

  private static generateSVGContent(
    template: CertificateTemplate,
    options: ExportOptions
  ): string {
    const scale = options.scale || 1;
    const templateWidth = template.width || 800;
    const templateHeight = template.height || 600;
    const width = templateWidth * scale;
    const height = templateHeight * scale;

    let svgElements = '';

    template.elements
      .filter(el => el.visible !== false)
      .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
      .forEach(element => {
        svgElements += this.generateSVGElement(element, scale);
      });

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${template.backgroundColor || '#ffffff'}"/>
  ${svgElements}
</svg>`;
  }

  private static generateSVGElement(element: any, scale: number): string {
    const x = element.x * scale;
    const y = element.y * scale;
    const width = element.width * scale;
    const height = element.height * scale;

    switch (element.type) {
      case 'text':
        return `<text x="${x}" y="${y + element.fontSize * scale}" font-family="${element.fontFamily || 'Arial'}" font-size="${element.fontSize * scale}" fill="${element.color || '#000000'}">${this.escapeXml(element.content || '')}</text>`;

      case 'shape':
        return `<rect x="${x}" y="${y}" width="${width}" height="${height}" fill="${element.backgroundColor || 'transparent'}" stroke="${element.strokeColor || 'none'}" stroke-width="${(element.strokeWidth || 0) * scale}"/>`;

      default:
        return '';
    }
  }

  private static escapeXml(text: string): string {
    return text
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"')
      .replace(/'/g, '&#39;');
  }

  static downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
