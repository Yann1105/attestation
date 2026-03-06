import { imageProcessor } from '../core/image-processor';
import { layerService } from '../layer/layer.service';
import { ToolAction } from '../core/types';
import { createCanvas, loadImage } from 'canvas';

export class ToolService {
    async applyTool(layerId: string, projectId: string, action: ToolAction): Promise<void> { // Added projectId param
        // 1. Get Layer
        const layers = await layerService.getLayers(projectId);
        const layer = layers.find(l => l.id === layerId);

        if (!layer || !layer.buffer) {
            throw new Error('Layer not found or has no image data');
        }

        // 2. Perform Action
        let newBuffer: Buffer | null = null;

        switch (action.tool) {
            case 'magic-wand':
                // Magic Wand usually creates a SELECTION, not modifies the image directly.
                // But if used as "Paint Bucket" (Fill), it modifies. 
                // If action is purely selection, we return selection mask? 
                // The user prompt asked for "backend functionality", assuming "tools work".
                // Let's implement "Flood Fill" (Paint Bucket) which uses similar logic.
                // Or if it's "Mock-free", Magic Wand should return a selection mask to frontend?
                // Let's implement Paint Bucket for visual impact.
                if (action.params.fillColor) {
                    newBuffer = await this.floodFill(layer.buffer, action.x, action.y, action.params.fillColor, action.params.tolerance || 32);
                }
                break;

            case 'brush':
                newBuffer = await this.brushStroke(layer.buffer, action.x, action.y, action.params);
                break;

            case 'eraser':
                newBuffer = await this.eraserStroke(layer.buffer, action.x, action.y, action.params);
                break;
        }

        // 3. Save result
        if (newBuffer) {
            await layerService.updateLayerImage(layerId, newBuffer);
        }
    }

    private async floodFill(buffer: Buffer, startX: number, startY: number, hexColor: string, tolerance: number): Promise<Buffer> {
        const { width, height, data } = await imageProcessor.getImageData(buffer);
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');
        // Put original data
        const idata = ctx.createImageData(width, height);
        idata.data.set(data);

        const pixelStack = [[Math.round(startX), Math.round(startY)]];
        const startPos = (startY * width + startX) * 4;
        const startR = data[startPos];
        const startG = data[startPos + 1];
        const startB = data[startPos + 2];
        const startA = data[startPos + 3];

        // Parse target color
        const r = parseInt(hexColor.slice(1, 3), 16);
        const g = parseInt(hexColor.slice(3, 5), 16);
        const b = parseInt(hexColor.slice(5, 7), 16);
        const a = 255;

        // Helper to check match
        const match = (pos: number) => {
            const dr = data[pos] - startR;
            const dg = data[pos + 1] - startG;
            const db = data[pos + 2] - startB;
            const da = data[pos + 3] - startA;
            return (dr * dr + dg * dg + db * db + da * da) <= (tolerance * tolerance * 4); // Simple distance
        };

        const colorPixel = (pos: number) => {
            idata.data[pos] = r;
            idata.data[pos + 1] = g;
            idata.data[pos + 2] = b;
            idata.data[pos + 3] = a;
        };

        const visited = new Set<number>();

        while (pixelStack.length) {
            const newPos = pixelStack.pop();
            if (!newPos) break;
            const [x, y] = newPos;

            const pixelPos = (y * width + x) * 4;
            if (visited.has(pixelPos)) continue;

            // boundary check
            if (x < 0 || x >= width || y < 0 || y >= height) continue;

            if (match(pixelPos)) {
                colorPixel(pixelPos);
                visited.add(pixelPos);

                pixelStack.push([x + 1, y]);
                pixelStack.push([x - 1, y]);
                pixelStack.push([x, y + 1]);
                pixelStack.push([x, y - 1]);
            }
        }

        ctx.putImageData(idata, 0, 0);
        return canvas.toBuffer('image/png');
    }

    private async brushStroke(buffer: Buffer, x: number, y: number, params: any): Promise<Buffer> {
        const image = await loadImage(buffer);
        const canvas = createCanvas(image.width, image.height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0);

        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = params.color || '#000000';
        ctx.lineWidth = params.size || 5;

        // If we receive a path (points), draw it. If just one point, draw dot.
        if (params.points && Array.isArray(params.points)) {
            ctx.beginPath();
            ctx.moveTo(params.points[0].x, params.points[0].y);
            for (let i = 1; i < params.points.length; i++) {
                ctx.lineTo(params.points[i].x, params.points[i].y);
            }
            ctx.stroke();
        } else {
            ctx.beginPath();
            ctx.arc(x, y, (params.size || 5) / 2, 0, Math.PI * 2);
            ctx.fillStyle = params.color || '#000000';
            ctx.fill();
        }

        return canvas.toBuffer('image/png');
    }

    private async eraserStroke(buffer: Buffer, x: number, y: number, params: any): Promise<Buffer> {
        // Similar to brush but creating transparency
        const image = await loadImage(buffer);
        const canvas = createCanvas(image.width, image.height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0);

        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(x, y, (params.size || 10) / 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,1)';
        ctx.fill();

        return canvas.toBuffer('image/png');
    }
}

export const toolService = new ToolService();
