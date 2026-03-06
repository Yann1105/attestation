import { Request, Response } from 'express';
import { layerService } from '../layer/layer.service';

export class LayerController {

    /**
     * @swagger
     * /photoshop/projects/{projectId}/layers:
     *   post:
     *     summary: Create a new layer
     *     tags: [Photoshop]
     *     parameters:
     *       - in: path
     *         name: projectId
     *         required: true
     *         schema:
     *           type: string
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               name:
     *                 type: string
     *               type:
     *                 type: string
     *                 enum: [image, text, shape, group, adjustment]
     *     responses:
     *       200:
     *         description: The created layer
     */
    async createLayer(req: Request, res: Response) {
        try {
            const { projectId } = req.params;
            const layerData = req.body;

            const layer = await layerService.createLayer(projectId, layerData);
            res.json(layer);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to create layer' });
        }
    }

    async updateLayer(req: Request, res: Response) {
        try {
            const { layerId } = req.params;
            const updates = req.body;

            const layer = await layerService.updateLayer(layerId, updates);
            res.json(layer);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to update layer' });
        }
    }

    async deleteLayer(req: Request, res: Response) {
        try {
            const { layerId } = req.params;
            await layerService.deleteLayer(layerId);
            res.json({ success: true });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to delete layer' });
        }
    }

    async uploadLayerImage(req: Request, res: Response) {
        try {
            const { layerId } = req.params;
            const file = req.file;

            if (!file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }

            await layerService.updateLayerImage(layerId, file.buffer);
            res.json({ success: true });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to upload layer image' });
        }
    }
}

export const layerController = new LayerController();
