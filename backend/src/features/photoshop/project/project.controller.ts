import { Request, Response } from 'express';
import { query } from '../../../database';

export class ProjectController {

    /**
     * @swagger
     * /photoshop/projects:
     *   post:
     *     summary: Create a new project
     *     tags: [Photoshop]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required: [name, width, height]
     *             properties:
     *               name:
     *                 type: string
     *               width:
     *                 type: integer
     *               height:
     *                 type: integer
     *               backgroundColor:
     *                 type: string
     *     responses:
     *       200:
     *         description: The created project
     */
    async createProject(req: Request, res: Response) {
        try {
            const { name, width, height, backgroundColor } = req.body;

            const result = await query(
                `INSERT INTO ps_projects (name, width, height, background_color)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
                [name, width, height, backgroundColor || '#FFFFFF']
            );

            res.json(result.rows[0]);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to create project' });
        }
    }

    /**
     * @swagger
     * /photoshop/projects/{id}:
     *   get:
     *     summary: Get a project by ID
     *     tags: [Photoshop]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: The project details
     */
    async getProject(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const projectResult = await query(`SELECT * FROM ps_projects WHERE id = $1`, [id]);

            if (projectResult.rows.length === 0) {
                return res.status(404).json({ error: 'Project not found' });
            }

            // Also fetch layers
            const layersResult = await query(`SELECT * FROM ps_layers WHERE project_id = $1 ORDER BY z_index ASC`, [id]);

            const project = projectResult.rows[0];
            project.layers = layersResult.rows;

            res.json(project);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to fetch project' });
        }
    }

    async listProjects(req: Request, res: Response) {
        try {
            const result = await query(`SELECT * FROM ps_projects ORDER BY updated_at DESC`);
            res.json(result.rows);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to list projects' });
        }
    }
}

export const projectController = new ProjectController();
