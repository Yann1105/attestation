import { Request, Response } from 'express';
import { historyService } from './history.service';

export class HistoryController {

    /**
     * @swagger
     * /photoshop/projects/{projectId}/history/undo:
     *   post:
     *     summary: Undo the last action
     *     tags: [Photoshop]
     *     parameters:
     *       - in: path
     *         name: projectId
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Undo successful
     */
    async undo(req: Request, res: Response) {
        try {
            const { projectId } = req.params;
            await historyService.undo(projectId);
            res.json({ success: true });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to undo' });
        }
    }
}

export const historyController = new HistoryController();
