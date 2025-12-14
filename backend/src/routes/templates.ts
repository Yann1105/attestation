import express from 'express';
import { query } from '../database';
import { validate, createTemplateSchema, updateTemplateSchema } from '../validation';
import { authMiddleware } from '../auth';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// @ts-ignore
import PSD from 'psd';

const router = express.Router();

// Configure multer for image uploads
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'images');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const imageUpload = multer({
  storage: imageStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Configure multer for template uploads
const templateStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/templates');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const templateUpload = multer({
  storage: templateStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for templates
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/html' || file.originalname.endsWith('.html')) {
      cb(null, true);
    } else {
      cb(new Error('Only HTML template files are allowed'));
    }
  }
});

// Configure multer for PSD/AI imports
const psdStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/psd');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const psdUpload = multer({
  storage: psdStorage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for PSD/AI files
  },
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.psd', '.ai'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PSD and AI files are allowed'));
    }
  }
});

// Get all templates
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM templates ORDER BY created_at DESC');
    const templates = result.rows.map(row => {
      const hasCanvasData = row.canvas_data &&
        (typeof row.canvas_data === 'object' ||
         (typeof row.canvas_data === 'string' && row.canvas_data.trim().length > 0));

      return {
        id: row.id.toString(),
        name: row.name,
        description: row.description,
        type: row.type || 'custom',
        elements: row.elements || [],
        canvasData: row.canvas_data, // Keep camelCase for API consistency
        content: row.content,
        placeholders: row.placeholders || [],
        filePath: row.file_path,
        backgroundColor: row.background_color,
        width: row.width,
        height: row.height,
        editorType: row.editor_type,
        preferCanvas: hasCanvasData, // New field for frontend sorting
        createdAt: row.created_at,
        updatedAt: row.updated_at
      };
    });
    res.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

// Create template (requires authentication)
router.post('/', authMiddleware, validate(createTemplateSchema), async (req, res) => {
  try {
    const { name, description, elements, canvasData } = req.body;
    const { CertificateGenerator } = await import('../utils/certificateGenerator');
    const generator = new CertificateGenerator();

    // Auto-generate HTML content and extract placeholders
    let htmlContent = null;
    let extractedPlaceholders = null;

    if (canvasData) {
      // For canvas-based templates, generate HTML from canvas data
      htmlContent = generator.generateHTMLFromCanvas(canvasData);
      extractedPlaceholders = generator.extractPlaceholders(htmlContent);
    } else if (elements && elements.length > 0) {
      // For element-based templates, generate HTML from elements
      const templateData = {
        width: req.body.width || 1200,
        height: req.body.height || 850,
        backgroundColor: req.body.backgroundColor || '#FFFFFF'
      };
      htmlContent = generator.generateHTMLFromElements(elements, templateData);
      extractedPlaceholders = generator.extractPlaceholders(htmlContent);
    }

    const result = await query(`
      INSERT INTO templates (name, description, elements, canvas_data, editor_type, width, height, background_color, content, placeholders, file_path, type, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `, [
      name,
      description,
      JSON.stringify(elements),
      canvasData,
      req.body.editorType || (canvasData ? 'canvas' : 'simple'), // Default based on canvasData presence
      req.body.width || 1200,
      req.body.height || 850,
      req.body.backgroundColor || '#FFFFFF',
      htmlContent,
      extractedPlaceholders ? JSON.stringify(extractedPlaceholders) : null,
      req.body.filePath || null,
      req.body.type || 'custom'
    ]);

    const row = result.rows[0];
    const template = {
      id: row.id.toString(),
      name: row.name,
      description: row.description,
      type: row.type || 'custom',
      elements: row.elements || [],
      canvasData: row.canvas_data,
      content: row.content,
      placeholders: row.placeholders || [],
      filePath: row.file_path,
      backgroundColor: row.background_color,
      width: row.width,
      height: row.height,
      editorType: row.editor_type,
      preferCanvas: !!row.canvas_data,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };

    res.status(201).json(template);
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ error: 'Failed to create template' });
  }
});

// Update template (requires authentication)
router.put('/:id', authMiddleware, validate(updateTemplateSchema), async (req, res) => {
  try {
    const { id } = req.params;
    const templateId = id; // Keep as string

    const updates = req.body;
    const { CertificateGenerator } = await import('../utils/certificateGenerator');
    const generator = new CertificateGenerator();

    const fields = [];
    const values = [];
    let paramCount = 1;

    if (updates.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(updates.name);
    }
    if (updates.description !== undefined) {
      fields.push(`description = $${paramCount++}`);
      values.push(updates.description);
    }
    if (updates.elements !== undefined) {
      fields.push(`elements = $${paramCount++}`);
      values.push(JSON.stringify(updates.elements));
    }
    if (updates.canvasData !== undefined) {
      fields.push(`canvas_data = $${paramCount++}`);
      values.push(updates.canvasData);
    }
    if (updates.editorType !== undefined) {
      fields.push(`editor_type = $${paramCount++}`);
      values.push(updates.editorType);
    }

    // Auto-regenerate HTML content and placeholders if elements or canvasData changed
    if (updates.elements !== undefined || updates.canvasData !== undefined) {
      let htmlContent = null;
      let extractedPlaceholders = null;

      // Get current template data for dimensions and background
      const currentTemplate = await query('SELECT width, height, background_color FROM templates WHERE id = $1', [parseInt(id)]);
      const templateData = currentTemplate.rows[0] || {};

      if (updates.canvasData !== undefined && updates.canvasData) {
        // For canvas-based templates, generate HTML from canvas data
        htmlContent = generator.generateHTMLFromCanvas(updates.canvasData);
        extractedPlaceholders = generator.extractPlaceholders(htmlContent);
      } else if (updates.elements !== undefined && updates.elements && updates.elements.length > 0) {
        // For element-based templates, generate HTML from elements
        const fullTemplateData = {
          width: updates.width || templateData.width || 1200,
          height: updates.height || templateData.height || 850,
          backgroundColor: updates.backgroundColor || templateData.background_color || '#FFFFFF'
        };
        htmlContent = generator.generateHTMLFromElements(updates.elements, fullTemplateData);
        extractedPlaceholders = generator.extractPlaceholders(htmlContent);
      }

      if (htmlContent !== null) {
        fields.push(`content = $${paramCount++}`);
        values.push(htmlContent);
      }
      if (extractedPlaceholders !== null) {
        fields.push(`placeholders = $${paramCount++}`);
        values.push(JSON.stringify(extractedPlaceholders));
      }
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(parseInt(id));

    const result = await query(`
      UPDATE templates
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }

    const row = result.rows[0];
    const template = {
      id: row.id.toString(),
      name: row.name,
      description: row.description,
      type: row.type || 'custom',
      elements: row.elements || [],
      canvasData: row.canvas_data,
      content: row.content,
      placeholders: row.placeholders || [],
      filePath: row.file_path,
      backgroundColor: row.background_color,
      width: row.width,
      height: row.height,
      editorType: row.editor_type,
      preferCanvas: !!row.canvas_data,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };

    res.json(template);
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({ error: 'Failed to update template' });
  }
});

// Delete template (requires authentication)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const templateId = parseInt(id);

    // First, check if the template exists
    const templateResult = await query('SELECT file_path FROM templates WHERE id = $1', [templateId]);

    if (templateResult.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }

    const template = templateResult.rows[0];

    // Set template_id to NULL in certificates that reference this template
    await query('UPDATE certificates SET template_id = NULL WHERE template_id = $1', [templateId]);

    // If there's a file_path, delete the associated file
    if (template.file_path && fs.existsSync(template.file_path)) {
      try {
        fs.unlinkSync(template.file_path);
      } catch (fileError) {
        console.error('Error deleting template file:', fileError);
        // Continue with database deletion even if file deletion fails
      }
    }

    // Delete the template from database
    await query('DELETE FROM templates WHERE id = $1', [templateId]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ error: 'Failed to delete template' });
  }
});

// Upload image
router.post('/upload-image', imageUpload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // In a production environment, you might want to:
    // 1. Upload to cloud storage (AWS S3, Cloudinary, etc.)
    // 2. Optimize/compress images
    // 3. Generate multiple sizes/thumbnails

    // Return the relative URL for the uploaded image (goes through frontend proxy)
    const imageUrl = `/uploads/images/${req.file.filename}`;

    res.json({ imageUrl });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Upload HTML template (requires authentication)
router.post('/upload-template', authMiddleware, templateUpload.single('template'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No template file provided' });
    }

    const templatePath = req.file.path;
    const templateContent = fs.readFileSync(templatePath, 'utf-8');

    // Validate the template
    const { CertificateGenerator } = await import('../utils/certificateGenerator');
    const generator = new CertificateGenerator();
    const validation = generator.validateTemplate(templateContent);

    if (!validation.valid) {
      // Delete the uploaded file if validation fails
      fs.unlinkSync(templatePath);
      return res.status(400).json({
        error: 'Invalid template',
        details: validation.errors,
        missingRequired: validation.missingRequired
      });
    }

    // Extract placeholders for metadata
    const placeholders = generator.extractPlaceholders(templateContent);

    // Save template metadata to database
    const result = await query(`
      INSERT INTO templates (name, description, content, placeholders, file_path)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [
      req.body.name || `Template ${Date.now()}`,
      req.body.description || 'Uploaded HTML template',
      templateContent,
      JSON.stringify(placeholders),
      templatePath
    ]);

    const row = result.rows[0];
    const template = {
      id: row.id.toString(),
      name: row.name,
      description: row.description,
      content: row.content,
      placeholders: row.placeholders || [],
      filePath: row.file_path,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };

    res.status(201).json(template);
  } catch (error) {
    console.error('Error uploading template:', error);
    res.status(500).json({ error: 'Failed to upload template' });
  }
});

// Get template content by ID
router.get('/:id/content', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT content FROM templates WHERE id = $1', [parseInt(id)]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.setHeader('Content-Type', 'text/html');
    res.send(result.rows[0].content);
  } catch (error) {
    console.error('Error fetching template content:', error);
    res.status(500).json({ error: 'Failed to fetch template content' });
  }
});

// Preview template as image (PNG)
router.get('/:id/preview', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM templates WHERE id = $1', [parseInt(id)]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }

    const template = result.rows[0];
    const { CertificateGenerator } = await import('../utils/certificateGenerator');
    const generator = new CertificateGenerator();

    // Sample data for preview
    const sampleData = {
      participantName: 'John Doe',
      certificateNumber: 'CERT123456789',
      trainingTitle: 'Formation Example',
      trainingDate: new Date().toISOString().split('T')[0],
      trainingLocation: 'Sample Location',
      trainingDuration: '40 heures',
      instructor: 'Sample Instructor',
      organization: 'Sample Organization',
      issueDate: new Date().toISOString().split('T')[0],
      canvasData: template.canvas_data // Include canvas data for canvas templates
    };

    let htmlContent: string;

    // Handle different template types for preview
    if (template.canvas_data) {
      // Canvas-based template
      htmlContent = generator.generateHTMLFromCanvasWithData(template.canvas_data, sampleData, template);
    } else if (template.content) {
      // HTML template with content
      htmlContent = generator.injectDataIntoTemplate(template.content, sampleData, template);
    } else if (template.file_path && fs.existsSync(template.file_path)) {
      // Uploaded HTML template file
      const templateContent = fs.readFileSync(template.file_path, 'utf-8');
      htmlContent = generator.injectDataIntoTemplate(templateContent, sampleData, template);
    } else {
      return res.status(400).json({
        error: 'Ce template ne peut pas être prévisualisé. Le template ne contient pas de données valides.'
      });
    }

    // Return HTML content for preview (displayed in iframe)
    res.setHeader('Content-Type', 'text/html');
    res.send(htmlContent);
  } catch (error) {
    console.error('Error generating template preview:', error);
    res.status(500).json({ error: 'Failed to generate template preview' });
  }
});

// Download template
router.get('/:id/download', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM templates WHERE id = $1', [parseInt(id)]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }

    const template = result.rows[0];

    if (template.file_path && fs.existsSync(template.file_path)) {
      // Download the uploaded file
      const filename = `template_${template.name.replace(/[^a-zA-Z0-9]/g, '_')}.html`;
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', 'text/html');
      res.sendFile(template.file_path);
    } else if (template.content) {
      // Generate and download HTML content
      const filename = `template_${template.name.replace(/[^a-zA-Z0-9]/g, '_')}.html`;
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', 'text/html');
      res.send(template.content);
    } else {
      // For canvas-based or HTML templates, generate HTML with sample data
      const { CertificateGenerator } = await import('../utils/certificateGenerator');
      const generator = new CertificateGenerator();

      const sampleData = {
        participantName: 'John Doe',
        certificateNumber: 'CERT123456789',
        trainingTitle: 'Formation Example',
        trainingDate: new Date().toISOString().split('T')[0],
        trainingLocation: 'Sample Location',
        trainingDuration: '40 heures',
        instructor: 'Sample Instructor',
        organization: 'Sample Organization',
        issueDate: new Date().toISOString().split('T')[0],
        canvasData: template.canvas_data // Include canvas data for canvas templates
      };

      let htmlContent: string;

      if (template.canvas_data) {
        // Canvas-based template
        htmlContent = generator.generateHTMLFromCanvasWithData(template.canvas_data, sampleData, template);
      } else if (template.content) {
        // HTML template with content
        htmlContent = generator.injectDataIntoTemplate(template.content, sampleData, template);
      } else if (template.file_path && fs.existsSync(template.file_path)) {
        // Uploaded HTML template file
        const templateContent = fs.readFileSync(template.file_path, 'utf-8');
        htmlContent = generator.injectDataIntoTemplate(templateContent, sampleData, template);
      } else {
        return res.status(400).json({
          error: 'Ce template ne peut pas être téléchargé. Le template ne contient pas de données valides.'
        });
      }

      const filename = `template_${template.name.replace(/[^a-zA-Z0-9]/g, '_')}.html`;

      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', 'text/html');
      res.send(htmlContent);
    }
  } catch (error) {
    console.error('Error downloading template:', error);
    res.status(500).json({ error: 'Failed to download template' });
  }
});

// Import PSD/AI file (requires authentication)
router.post('/import-psd', authMiddleware, psdUpload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const filePath = req.file.path;
    const fileExt = path.extname(req.file.originalname).toLowerCase();

    let templateData: any = {};

    if (fileExt === '.psd') {
      // Parse PSD file
      const psd = PSD.fromFile(filePath);
      psd.parse();

      const tree = psd.tree();
      const canvas = psd.image.toPng();

      // Convert PSD to template format
      templateData = convertPSDToTemplate(tree, canvas, req.file.originalname);
    } else if (fileExt === '.ai') {
      // For AI files, we'll need a different approach
      // For now, return an error as AI parsing is complex
      fs.unlinkSync(filePath); // Clean up
      return res.status(400).json({
        error: 'AI file import not yet implemented',
        suggestion: 'Please convert your AI file to PSD or SVG format for import'
      });
    }

    // Save the template to database
    const result = await query(`
      INSERT INTO templates (name, description, elements, canvas_data, editor_type, width, height, background_color, type, layers, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `, [
      templateData.name,
      templateData.description,
      JSON.stringify(templateData.elements),
      templateData.canvasData,
      'canvas',
      templateData.width,
      templateData.height,
      templateData.backgroundColor,
      'custom',
      JSON.stringify(templateData.layers || [])
    ]);

    const row = result.rows[0];
    const template = {
      id: row.id.toString(),
      name: row.name,
      description: row.description,
      type: row.type || 'custom',
      elements: row.elements || [],
      canvasData: row.canvas_data,
      layers: row.layers || [],
      backgroundColor: row.background_color,
      width: row.width,
      height: row.height,
      editorType: row.editor_type,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    res.status(201).json(template);
  } catch (error) {
    console.error('Error importing PSD/AI file:', error);
    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: 'Failed to import file' });
  }
});

// Helper function to convert PSD tree to template format
function convertPSDToTemplate(tree: any, canvas: any, filename: string) {
  const elements: any[] = [];
  const layers: any[] = [];
  let zIndex = 0;

  function processNode(node: any, parentId?: string): string | undefined {
    if (node.type === 'group') {
      // Create group layer
      const groupId = `group-${Date.now()}-${Math.random()}`;
      const groupLayer: any = {
        id: groupId,
        name: node.name || 'Group',
        type: 'group',
        visible: node.visible !== false,
        locked: false,
        opacity: node.opacity || 1,
        blendMode: node.blendMode || 'normal',
        parentId,
        children: []
      };

      layers.push(groupLayer);

      // Process children
      if (node.children) {
        for (const child of node.children) {
          const childId = processNode(child, groupId);
          if (childId) {
            groupLayer.children.push(childId);
          }
        }
      }

      return groupId;
    } else if (node.type === 'layer') {
      // Create element for the layer
      const elementId = `element-${Date.now()}-${Math.random()}`;
      const element: any = {
        id: elementId,
        type: node.text ? 'text' : 'image',
        x: node.left || 0,
        y: node.top || 0,
        width: node.width || 100,
        height: node.height || 100,
        zIndex: zIndex++,
        visible: node.visible !== false,
        opacity: node.opacity || 1,
        layerName: node.name,
        parentId,
        blendMode: node.blendMode || 'normal'
      };

      if (node.text) {
        // Text layer
        element.type = 'text';
        element.content = node.text.value || '';
        element.fontSize = node.text.font?.sizes?.[0] || 16;
        element.fontFamily = node.text.font?.name || 'Arial';
        element.color = node.text.font?.colors?.[0] ? `rgba(${node.text.font.colors[0].join(',')})` : '#000000';
      } else if (node.image) {
        // Image layer - we'll need to extract the image data
        element.type = 'image';
        // For now, we'll skip image data extraction as it requires more complex handling
      }

      elements.push(element);

      // Create layer entry
      const layerId = `layer-${Date.now()}-${Math.random()}`;
      const layer: any = {
        id: layerId,
        name: node.name || 'Layer',
        type: 'layer',
        visible: node.visible !== false,
        locked: false,
        opacity: node.opacity || 1,
        blendMode: node.blendMode || 'normal',
        parentId,
        elementId
      };

      layers.push(layer);
      return layerId;
    }
  }

  // Process the PSD tree
  if (tree.children) {
    for (const child of tree.children) {
      processNode(child);
    }
  }

  return {
    name: filename.replace(/\.[^/.]+$/, ''), // Remove extension
    description: `Imported from ${filename}`,
    elements,
    layers,
    width: tree.width || 800,
    height: tree.height || 600,
    backgroundColor: '#ffffff',
    canvasData: canvas ? canvas.toString('base64') : undefined
  };
}

export { router as templatesRouter };
