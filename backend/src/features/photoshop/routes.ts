import express from 'express';
import { projectController } from './project/project.controller';
import { layerController } from './layer/layer.controller';
import { toolController } from './tool/tool.controller';
import { filterController } from './filter/filter.controller';
import { historyController } from './history/history.controller';
import { exportController } from './export/export.controller';
import multer from 'multer';

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

/**
 * Projects
 */
router.post('/projects', projectController.createProject);
router.get('/projects', projectController.listProjects);
router.get('/projects/:id', projectController.getProject);
router.get('/projects/:projectId/export', exportController.exportProject);

/**
 * Layers
 */
router.post('/projects/:projectId/layers', layerController.createLayer);
router.put('/layers/:layerId', layerController.updateLayer);
router.delete('/layers/:layerId', layerController.deleteLayer);
router.post('/layers/:layerId/image', upload.single('image'), layerController.uploadLayerImage);

/**
 * Tools & Filters
 */
router.post('/tools/apply', toolController.applyTool);
router.post('/filters/apply', filterController.applyFilter);

/**
 * History
 */
router.post('/projects/:projectId/history/undo', historyController.undo);

export const photoshopRoutes = router;
