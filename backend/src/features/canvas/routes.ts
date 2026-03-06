import { Router, Request, Response } from 'express';
import { canvasController } from './canvas.controller';
import { authMiddleware, optionalAuthMiddleware } from '../../auth';

const router = Router();

// AI Generation
router.post('/generate', optionalAuthMiddleware, (req: Request, res: Response) => canvasController.generateTemplate(req, res));

// Template CRUD
router.post('/templates', authMiddleware, (req: Request, res: Response) => canvasController.createTemplate(req, res));
router.get('/templates', optionalAuthMiddleware, (req: Request, res: Response) => canvasController.getTemplates(req, res));
router.get('/templates/:id', optionalAuthMiddleware, (req: Request, res: Response) => canvasController.getTemplate(req, res));
router.put('/templates/:id', authMiddleware, (req: Request, res: Response) => canvasController.updateTemplate(req, res));
router.delete('/templates/:id', authMiddleware, (req: Request, res: Response) => canvasController.deleteTemplate(req, res));

// Template operations
router.post('/templates/:id/duplicate', authMiddleware, (req: Request, res: Response) => canvasController.duplicateTemplate(req, res));
router.get('/templates/:id/versions', authMiddleware, (req: Request, res: Response) => canvasController.getVersions(req, res));

// Rendering
router.post('/render/pdf', authMiddleware, (req: Request, res: Response) => canvasController.renderPDF(req, res));
router.post('/render/png', authMiddleware, (req: Request, res: Response) => canvasController.renderPNG(req, res));

// Variables
router.post('/fill', authMiddleware, (req: Request, res: Response) => canvasController.fillVariables(req, res));

export default router;
