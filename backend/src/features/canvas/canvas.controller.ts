import { Request, Response } from 'express';
import { query } from '../../database';
import { aiGeneratorService } from './services/ai-generator.service';
import { templateValidatorService } from './services/template-validator.service';
import { variableEngineService } from './services/variable-engine.service';
import { renderEngineService } from './services/render-engine.service';
import { CanvasTemplate, AIGenerateRequest, RenderRequest } from './types';
import { v4 as uuidv4 } from 'uuid';

export class CanvasController {

    /**
     * @swagger
     * /canvas/generate:
     *   post:
     *     summary: Generate a template using AI
     *     tags: [Canvas]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required: [prompt]
     *             properties:
     *               prompt:
     *                 type: string
     *               category:
     *                 type: string
     *                 enum: [certificate, attestation, poster, other]
     *               style:
     *                 type: string
     *                 enum: [modern, classic, elegant, minimal]
     *               width:
     *                 type: integer
     *               height:
     *                 type: integer
     *               format:
     *                 type: string
     *                 enum: [json, html]
     *     responses:
     *       200:
     *         description: Generated template
     */
    async generateTemplate(req: Request, res: Response) {
        try {
            const request: AIGenerateRequest = req.body;
            console.log('Canvas Generate Request:', JSON.stringify(request, null, 2));

            if (!request.prompt) {
                return res.status(400).json({ error: 'Prompt is required' });
            }

            const template = await aiGeneratorService.generateTemplate(request);

            return res.json({ success: true, ...template });

            // Validate generated template (only for Konva/JSON templates)
            const validation = templateValidatorService.validate(template);
            if (!validation.valid) {
                return res.status(400).json({
                    error: 'Generated template is invalid',
                    details: validation.errors
                });
            }

            // Fallback (should not happen with forced HTML service)
            res.json({ success: true, html: '<h1>Error: No HTML generated</h1>' });
        } catch (error) {
            console.error('Generate template error:', error);
            res.status(500).json({
                error: 'Failed to generate template',
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    /**
     * @swagger
     * /canvas/templates:
     *   post:
     *     summary: Create a new canvas template
     *     tags: [Canvas]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required: [name, canvasData, width, height]
     *     responses:
     *       200:
     *         description: Created template
     */
    async createTemplate(req: Request, res: Response) {
        try {
            const template: CanvasTemplate = req.body;
            const userId = (req as any).user?.id;

            // Validate template
            const validation = templateValidatorService.validate(template);
            if (!validation.valid) {
                return res.status(400).json({ error: 'Invalid template', details: validation.errors });
            }

            // Sanitize canvas data
            const sanitizedData = templateValidatorService.sanitize(template.canvasData);

            const result = await query(
                `INSERT INTO canvas_templates 
        (name, description, category, canvas_data, variables, width, height, background_color, created_by, version, is_public, ai_prompt, output_format)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *`,
                [
                    template.name,
                    template.description || null,
                    template.category || 'other',
                    JSON.stringify(sanitizedData),
                    JSON.stringify(template.variables || []),
                    template.width,
                    template.height,
                    template.backgroundColor || '#FFFFFF',
                    userId || null,
                    1,
                    template.isPublic || false,
                    template.aiPrompt || null,
                    template.outputFormat || 'html'
                ]
            );

            res.json({ success: true, template: result.rows[0] });
        } catch (error) {
            console.error('Create template error:', error);
            res.status(500).json({ error: 'Failed to create template' });
        }
    }

    /**
     * @swagger
     * /canvas/templates:
     *   get:
     *     summary: Get all canvas templates
     *     tags: [Canvas]
     *     parameters:
     *       - in: query
     *         name: category
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: List of templates
     */
    async getTemplates(req: Request, res: Response) {
        try {
            const { category } = req.query;
            const userId = (req as any).user?.id;

            let queryText = `
        SELECT * FROM canvas_templates 
        WHERE is_public = true OR created_by = $1
      `;
            const params: any[] = [userId || null];

            if (category) {
                queryText += ` AND category = $2`;
                params.push(category);
            }

            queryText += ` ORDER BY created_at DESC`;

            const result = await query(queryText, params);
            res.json({ success: true, templates: result.rows });
        } catch (error) {
            console.error('Get templates error:', error);
            res.status(500).json({ error: 'Failed to get templates' });
        }
    }

    /**
     * @swagger
     * /canvas/templates/{id}:
     *   get:
     *     summary: Get a canvas template by ID
     *     tags: [Canvas]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Template details
     */
    async getTemplate(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const result = await query(
                `SELECT * FROM canvas_templates WHERE id = $1`,
                [id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Template not found' });
            }

            res.json({ success: true, template: result.rows[0] });
        } catch (error) {
            console.error('Get template error:', error);
            res.status(500).json({ error: 'Failed to get template' });
        }
    }

    /**
     * @swagger
     * /canvas/templates/{id}:
     *   put:
     *     summary: Update a canvas template
     *     tags: [Canvas]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *     responses:
     *       200:
     *         description: Updated template
     */
    async updateTemplate(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const updates: Partial<CanvasTemplate> = req.body;
            const userId = (req as any).user?.id;

            // Check ownership
            const existing = await query(
                `SELECT * FROM canvas_templates WHERE id = $1`,
                [id]
            );

            if (existing.rows.length === 0) {
                return res.status(404).json({ error: 'Template not found' });
            }

            if (existing.rows[0].created_by !== userId && !existing.rows[0].is_public) {
                return res.status(403).json({ error: 'Not authorized to update this template' });
            }

            // Save version history
            await query(
                `INSERT INTO canvas_template_versions (template_id, version, canvas_data, created_by, change_description)
        VALUES ($1, $2, $3, $4, $5)`,
                [
                    id,
                    existing.rows[0].version,
                    existing.rows[0].canvas_data,
                    userId,
                    updates.description || 'Update'
                ]
            );

            // Update template
            const sanitizedData = updates.canvasData
                ? templateValidatorService.sanitize(updates.canvasData)
                : existing.rows[0].canvas_data;

            const result = await query(
                `UPDATE canvas_templates 
        SET name = COALESCE($1, name),
            description = COALESCE($2, description),
            category = COALESCE($3, category),
            canvas_data = COALESCE($4, canvas_data),
            variables = COALESCE($5, variables),
            width = COALESCE($6, width),
            height = COALESCE($7, height),
            background_color = COALESCE($8, background_color),
            version = version + 1,
            updated_at = CURRENT_TIMESTAMP,
            ai_prompt = COALESCE($10, ai_prompt),
            output_format = COALESCE($11, output_format)
        WHERE id = $9
        RETURNING *`,
                [
                    updates.name,
                    updates.description,
                    updates.category,
                    updates.canvasData ? JSON.stringify(sanitizedData) : null,
                    updates.variables ? JSON.stringify(updates.variables) : null,
                    updates.width,
                    updates.height,
                    updates.backgroundColor,
                    id,
                    updates.aiPrompt,
                    updates.outputFormat
                ]
            );

            res.json({ success: true, template: result.rows[0] });
        } catch (error) {
            console.error('Update template error:', error);
            res.status(500).json({ error: 'Failed to update template' });
        }
    }

    /**
     * @swagger
     * /canvas/templates/{id}:
     *   delete:
     *     summary: Delete a canvas template
     *     tags: [Canvas]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Template deleted
     */
    async deleteTemplate(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const userId = (req as any).user?.id;

            // Check ownership
            const existing = await query(
                `SELECT * FROM canvas_templates WHERE id = $1`,
                [id]
            );

            if (existing.rows.length === 0) {
                return res.status(404).json({ error: 'Template not found' });
            }

            if (existing.rows[0].created_by !== userId) {
                return res.status(403).json({ error: 'Not authorized to delete this template' });
            }

            await query(`DELETE FROM canvas_templates WHERE id = $1`, [id]);

            res.json({ success: true, message: 'Template deleted' });
        } catch (error) {
            console.error('Delete template error:', error);
            res.status(500).json({ error: 'Failed to delete template' });
        }
    }

    /**
     * @swagger
     * /canvas/templates/{id}/duplicate:
     *   post:
     *     summary: Duplicate a canvas template
     *     tags: [Canvas]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Duplicated template
     */
    async duplicateTemplate(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const userId = (req as any).user?.id;

            const existing = await query(
                `SELECT * FROM canvas_templates WHERE id = $1`,
                [id]
            );

            if (existing.rows.length === 0) {
                return res.status(404).json({ error: 'Template not found' });
            }

            const original = existing.rows[0];

            const result = await query(
                `INSERT INTO canvas_templates 
        (name, description, category, canvas_data, variables, width, height, background_color, created_by, version, is_public)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *`,
                [
                    `${original.name} (Copy)`,
                    original.description,
                    original.category,
                    original.canvas_data,
                    original.variables,
                    original.width,
                    original.height,
                    original.background_color,
                    userId,
                    1,
                    false
                ]
            );

            res.json({ success: true, template: result.rows[0] });
        } catch (error) {
            console.error('Duplicate template error:', error);
            res.status(500).json({ error: 'Failed to duplicate template' });
        }
    }

    /**
     * @swagger
     * /canvas/render/pdf:
     *   post:
     *     summary: Render canvas to PDF
     *     tags: [Canvas]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               templateId:
     *                 type: string
     *               canvasData:
     *                 type: object
     *               variables:
     *                 type: object
     *     responses:
     *       200:
     *         description: PDF file
     */
    async renderPDF(req: Request, res: Response) {
        try {
            const request: RenderRequest = req.body;

            let canvasData = request.canvasData;

            // If templateId provided, fetch template
            if (request.templateId) {
                const result = await query(
                    `SELECT * FROM canvas_templates WHERE id = $1`,
                    [request.templateId]
                );

                if (result.rows.length === 0) {
                    return res.status(404).json({ error: 'Template not found' });
                }

                canvasData = result.rows[0].canvas_data;
            }

            if (!canvasData) {
                return res.status(400).json({ error: 'Canvas data or template ID required' });
            }

            const pdfBuffer = await renderEngineService.renderToPDF({
                ...request,
                canvasData,
                format: 'pdf'
            });

            // Save render record
            if (request.templateId) {
                const filename = `${uuidv4()}.pdf`;
                const filePath = await renderEngineService.saveRender(pdfBuffer, filename);

                await query(
                    `INSERT INTO canvas_renders (template_id, participant_id, render_type, file_path, variables_used)
          VALUES ($1, $2, $3, $4, $5)`,
                    [request.templateId, null, 'pdf', filePath, JSON.stringify(request.variables || {})]
                );
            }

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename=certificate.pdf');
            res.send(pdfBuffer);
        } catch (error) {
            console.error('Render PDF error:', error);
            res.status(500).json({ error: 'Failed to render PDF' });
        }
    }

    /**
     * @swagger
     * /canvas/render/png:
     *   post:
     *     summary: Render canvas to PNG
     *     tags: [Canvas]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *     responses:
     *       200:
     *         description: PNG image
     */
    async renderPNG(req: Request, res: Response) {
        try {
            const request: RenderRequest = req.body;

            let canvasData = request.canvasData;

            if (request.templateId) {
                const result = await query(
                    `SELECT * FROM canvas_templates WHERE id = $1`,
                    [request.templateId]
                );

                if (result.rows.length === 0) {
                    return res.status(404).json({ error: 'Template not found' });
                }

                canvasData = result.rows[0].canvas_data;
            }

            if (!canvasData) {
                return res.status(400).json({ error: 'Canvas data or template ID required' });
            }

            const pngBuffer = await renderEngineService.renderToPNG({
                ...request,
                canvasData,
                format: 'png'
            });

            res.setHeader('Content-Type', 'image/png');
            res.setHeader('Content-Disposition', 'attachment; filename=certificate.png');
            res.send(pngBuffer);
        } catch (error) {
            console.error('Render PNG error:', error);
            res.status(500).json({ error: 'Failed to render PNG' });
        }
    }

    /**
     * @swagger
     * /canvas/fill:
     *   post:
     *     summary: Fill variables in a template
     *     tags: [Canvas]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required: [canvasData, variables]
     *     responses:
     *       200:
     *         description: Filled canvas data
     */
    async fillVariables(req: Request, res: Response) {
        try {
            const { canvasData, variables } = req.body;

            if (!canvasData || !variables) {
                return res.status(400).json({ error: 'Canvas data and variables required' });
            }

            const filledData = variableEngineService.fillVariables(canvasData, variables);

            res.json({ success: true, canvasData: filledData });
        } catch (error) {
            console.error('Fill variables error:', error);
            res.status(500).json({ error: 'Failed to fill variables' });
        }
    }

    /**
     * @swagger
     * /canvas/templates/{id}/versions:
     *   get:
     *     summary: Get version history of a template
     *     tags: [Canvas]
     *     parameters:
     *       - in: path
     *         name: id
     *         required: true
     *         schema:
     *           type: string
     *     responses:
     *       200:
     *         description: Version history
     */
    async getVersions(req: Request, res: Response) {
        try {
            const { id } = req.params;

            const result = await query(
                `SELECT * FROM canvas_template_versions 
        WHERE template_id = $1 
        ORDER BY version DESC`,
                [id]
            );

            res.json({ success: true, versions: result.rows });
        } catch (error) {
            console.error('Get versions error:', error);
            res.status(500).json({ error: 'Failed to get versions' });
        }
    }
}

export const canvasController = new CanvasController();
