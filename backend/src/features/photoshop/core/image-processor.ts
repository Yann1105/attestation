import { createCanvas, loadImage, Canvas, CanvasRenderingContext2D, Image } from 'canvas';
import { FilterState } from './types';

export class ImageProcessor {
    /**
     * Applies filters to an image buffer and returns the new buffer.
     * This performs REAL pixel manipulation using node-canvas.
     */
    async applyFilters(imageBuffer: Buffer, filters: FilterState): Promise<Buffer> {
        const image = await loadImage(imageBuffer);
        const canvas = createCanvas(image.width, image.height);
        const ctx = canvas.getContext('2d');

        // Draw original image
        ctx.drawImage(image, 0, 0);

        // Get pixel data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Apply pixel-level filters
        // Note: Convolution filters (Blur) are expensive and usually done via separate pass
        // or using canvas filter string if registered, but node-canvas filter support is limited.
        // We will implement manual pixel manipulation for maximum control.

        for (let i = 0; i < data.length; i += 4) {
            let r = data[i];
            let g = data[i + 1];
            let b = data[i + 2];
            // a = data[i + 3] (alpha)

            // Brightness
            if (filters.brightness !== undefined && filters.brightness !== 100) {
                const factor = filters.brightness / 100;
                r *= factor;
                g *= factor;
                b *= factor;
            }

            // Contrast
            if (filters.contrast !== undefined && filters.contrast !== 100) {
                const factor = (259 * (filters.contrast + 255)) / (255 * (259 - filters.contrast)); // Correction formula? 
                // Simple contrast: (color - 128) * factor + 128
                // Using standard formula:
                // factor = (259 * (contrast + 255)) / (255 * (259 - contrast)) 
                // where contrast is -255 to 255. Our input is likely 0-200 (100 is neutral).
                // Let's normalize 100 -> 0.
                const c = (filters.contrast - 100) * 2.55;
                const f = (259 * (c + 255)) / (255 * (259 - c));

                r = f * (r - 128) + 128;
                g = f * (g - 128) + 128;
                b = f * (b - 128) + 128;
            }

            // Grayscale
            if (filters.grayscale) {
                const avg = 0.3 * r + 0.59 * g + 0.11 * b; // Luminosity method
                r = avg;
                g = avg;
                b = avg;
            }

            // Invert
            if (filters.invert) {
                r = 255 - r;
                g = 255 - g;
                b = 255 - b;
            }

            // Sepia
            if (filters.sepia) {
                const tr = 0.393 * r + 0.769 * g + 0.189 * b;
                const tg = 0.349 * r + 0.686 * g + 0.168 * b;
                const tb = 0.272 * r + 0.534 * g + 0.131 * b;
                r = tr;
                g = tg;
                b = tb;
            }

            // Clamping
            data[i] = Math.min(255, Math.max(0, r));
            data[i + 1] = Math.min(255, Math.max(0, g));
            data[i + 2] = Math.min(255, Math.max(0, b));
        }

        ctx.putImageData(imageData, 0, 0);

        // Apply Gaussian Blur if needed
        // Since manual convolution in JS is slow, we might use canvas compositing acts
        // or a simplified stack blur. For now, we'll skip complex blur in this pass
        // or rely on a specialized library if performance is critical.

        return canvas.toBuffer('image/png');
    }

    /**
     * Resizes an image buffer.
     */
    async resize(imageBuffer: Buffer, width: number, height: number): Promise<Buffer> {
        const image = await loadImage(imageBuffer);
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        ctx.drawImage(image, 0, 0, width, height);

        return canvas.toBuffer('image/png');
    }

    /**
     * Crops an image buffer.
     */
    async crop(imageBuffer: Buffer, x: number, y: number, width: number, height: number): Promise<Buffer> {
        const image = await loadImage(imageBuffer);
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        ctx.drawImage(image, x, y, width, height, 0, 0, width, height);

        return canvas.toBuffer('image/png');
    }

    /**
     * Composites multiple layers into a single image.
     * This respects z-index, blending modes, and opacity.
     */
    async compositeLayers(layers: any[], width: number, height: number): Promise<Buffer> {
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        // Sort by zIndex
        const sortedLayers = [...layers].sort((a, b) => a.zIndex - b.zIndex);

        for (const layer of sortedLayers) {
            if (!layer.visible || !layer.buffer) continue;

            const layerImg = await loadImage(layer.buffer);

            ctx.globalAlpha = layer.opacity / 100;
            ctx.globalCompositeOperation = layer.blendMode || 'source-over';

            ctx.drawImage(layerImg, layer.x, layer.y, layer.width, layer.height);
        }

        return canvas.toBuffer('image/png');
    }

    async getImageData(imageBuffer: Buffer): Promise<{ width: number; height: number; data: Uint8ClampedArray }> {
        const image = await loadImage(imageBuffer);
        const canvas = createCanvas(image.width, image.height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0);
        return ctx.getImageData(0, 0, image.width, image.height);
    }
}

export const imageProcessor = new ImageProcessor();
