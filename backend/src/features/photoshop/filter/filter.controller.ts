import { Request, Response } from 'express';
import { filterService } from './filter.service';
import { layerService } from '../layer/layer.service';

export class FilterController {

    /**
     * @swagger
     * /photoshop/filters/apply:
     *   post:
     *     summary: Apply a filter to a layer
     *     tags: [Photoshop]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required: [projectId, layerId, filter]
     *             properties:
     *               projectId:
     *                 type: string
     *               layerId:
     *                 type: string
     *               filters:
     *                 type: object
     *                 properties:
     *                   blur:
     *                     type: integer
     *                   brightness:
     *                     type: integer
     *                   contrast:
     *                     type: integer
     *                   grayscale:
     *                     type: boolean
     *     responses:
     *       200:
     *         description: Filter applied successfully
     */
    async applyFilter(req: Request, res: Response) {
        try {
            const { projectId, layerId, filters } = req.body;

            // Get the layer to access its image data
            // optimization: having a service method to get just the buffer would be better
            const layers = await layerService.getLayers(projectId);
            const layer = layers.find(l => l.id === layerId);

            if (!layer || !layer.buffer) {
                return res.status(404).json({ error: 'Layer not found or improper type' });
            }

            // Apply filter
            // Note: This operation might be destructive or non-destructive depending on implementation.
            // Usually filters are non-destructive (stored as properties) OR destructive (pixel mod).
            // The `ImageProcessor` does pixel mod.
            // If we want non-destructive, we just update `properties.filters`.
            // If we want destructive (e.g. "Apply" button), we process buffer.
            // Let's assume destructive for this endpoint "Apply Filter".

            const newBuffer = await filterService.processLayerBuffer(layer.buffer, filters);
            await layerService.updateLayerImage(layerId, newBuffer);

            res.json({ success: true });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to apply filter' });
        }
    }
}

export const filterController = new FilterController();
