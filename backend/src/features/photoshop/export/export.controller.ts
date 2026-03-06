import { Request, Response } from 'express';
import { exportService } from './export.service';

export class ExportController {

    /**
     * @swagger
     * /photoshop/projects/{projectId}/export:
     *   get:
     *     summary: Export the project as an image
     *     tags: [Photoshop]
     *     parameters:
     *       - in: path
     *         name: projectId
     *         required: true
     *         schema:
     *           type: string
     *       - in: query
     *         name: format
     *         schema:
     *           type: string
     *           enum: [png, jpeg]
     *     responses:
     *       200:
     *         description: The image file
     *         content:
     *           image/png:
     *             schema:
     *               type: string
     *               format: binary
     */
    async exportProject(req: Request, res: Response) {
        try {
            const { projectId } = req.params;
            const format = (req.query.format as 'png' | 'jpeg') || 'png';

            const buffer = await exportService.exportProject(projectId, format);

            res.setHeader('Content-Type', `image/${format}`);
            res.send(buffer);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to export project' });
        }
    }
}

export const exportController = new ExportController();
