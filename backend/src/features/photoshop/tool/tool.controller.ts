import { Request, Response } from 'express';
import { toolService } from './tool.service';

export class ToolController {

    /**
     * @swagger
     * /photoshop/tools/apply:
     *   post:
     *     summary: Apply a tool action to a layer
     *     tags: [Photoshop]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required: [projectId, layerId, tool, x, y]
     *             properties:
     *               projectId:
     *                 type: string
     *               layerId:
     *                 type: string
     *               tool:
     *                 type: string
     *                 enum: [magic-wand, clone-stamp, brush, eraser, fill]
     *               x:
     *                 type: integer
     *               y:
     *                 type: integer
     *               params:
     *                 type: object
     *     responses:
     *       200:
     *         description: Tool applied successfully
     */
    async applyTool(req: Request, res: Response) {
        try {
            const { projectId, layerId, tool, x, y, params } = req.body;

            await toolService.applyTool(layerId, projectId, {
                tool, x, y, params: params || {}
            });

            res.json({ success: true });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to apply tool' });
        }
    }
}

export const toolController = new ToolController();
