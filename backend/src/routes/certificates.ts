import express from 'express';
import fs from 'fs';
import { query } from '../database';
import { authMiddleware } from '../auth';
import { CertificateGenerator } from '../utils/certificateGenerator';

const router = express.Router();

// Generate certificate number
router.get('/generate-number', async (req, res) => {
  try {
    const certificateNumber = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    res.json({ certificateNumber });
  } catch (error) {
    console.error('Error generating certificate number:', error);
    res.status(500).json({ error: 'Failed to generate certificate number' });
  }
});

// Generate certificate
router.post('/generate', authMiddleware, async (req, res) => {
  try {
    const { templateId, participantData, formData, isQuickApproval } = req.body;

    if (!templateId || !participantData) {
      return res.status(400).json({ error: 'Template ID and participant data are required' });
    }

    // Get template data
    const templateResult = await query('SELECT * FROM templates WHERE id = $1', [parseInt(templateId)]);
    if (templateResult.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }

    const template = templateResult.rows[0];

    // Prepare certificate data
    const certificateData = {
      participantName: participantData.participantName,
      certificateNumber: participantData.certificateNumber,
      trainingTitle: formData?.trainingTitle || 'Formation',
      trainingDate: formData?.trainingDate || new Date().toISOString().split('T')[0],
      trainingLocation: formData?.trainingLocation || 'Lieu de formation',
      trainingDuration: formData?.trainingDuration || 'Durée',
      instructor: formData?.instructor || 'Formateur',
      organization: formData?.organization || 'Organisation',
      issueDate: new Date().toISOString().split('T')[0],
      canvasData: template.canvas_data
    };

    // Generate HTML certificate
    const generator = new CertificateGenerator();

    let htmlContent: string;

    // Handle different template types
    if (template.canvas_data) {
      // Canvas-based template
      htmlContent = generator.generateHTMLFromCanvasWithData(template.canvas_data, certificateData, template);
    } else if (template.content) {
      // HTML template with content
      htmlContent = generator.injectDataIntoTemplate(template.content, certificateData, template);
    } else if (template.file_path && fs.existsSync(template.file_path)) {
      // Uploaded HTML template file
      const templateContent = fs.readFileSync(template.file_path, 'utf-8');
      htmlContent = generator.injectDataIntoTemplate(templateContent, certificateData, template);
    } else {
      return res.status(400).json({
        error: 'Le template sélectionné ne contient pas de données valides. Veuillez utiliser un template créé avec l\'éditeur ou un template HTML valide.'
      });
    }

    res.json({
      success: true,
      html: htmlContent,
      certificateData,
      template
    });

  } catch (error) {
    console.error('Error generating certificate:', error);
    res.status(500).json({ error: 'Failed to generate certificate' });
  }
});

// View certificate for participant
router.get('/view/:participantId', authMiddleware, async (req, res) => {
  try {
    const { participantId } = req.params;

    // Get participant data
    const participantResult = await query('SELECT * FROM participants WHERE id = $1', [parseInt(participantId)]);
    if (participantResult.rows.length === 0) {
      return res.status(404).json({ error: 'Participant not found' });
    }

    const participant = participantResult.rows[0];

    if (participant.status !== 'approved') {
      return res.status(400).json({ error: 'Participant not approved' });
    }

    // Get template data
    const templateResult = await query('SELECT * FROM templates WHERE id = $1', [participant.template_id]);
    if (templateResult.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }

    const template = templateResult.rows[0];

    // Prepare certificate data
    const certificateData = {
      participantName: participant.participant_name,
      certificateNumber: participant.certificate_number,
      trainingTitle: participant.training_title,
      trainingDate: participant.training_date,
      trainingLocation: participant.training_location,
      trainingDuration: participant.training_duration,
      instructor: participant.instructor,
      organization: participant.organization,
      issueDate: participant.approval_date || new Date().toISOString().split('T')[0],
      canvasData: template.canvas_data
    };

    // Generate HTML certificate
    const generator = new CertificateGenerator();

    let htmlContent: string;

    // Handle different template types
    if (template.canvas_data) {
      // Canvas-based template
      htmlContent = generator.generateHTMLFromCanvasWithData(template.canvas_data, certificateData, template);
    } else if (template.content) {
      // HTML template with content
      htmlContent = generator.injectDataIntoTemplate(template.content, certificateData, template);
    } else if (template.file_path && fs.existsSync(template.file_path)) {
      // Uploaded HTML template file
      const templateContent = fs.readFileSync(template.file_path, 'utf-8');
      htmlContent = generator.injectDataIntoTemplate(templateContent, certificateData, template);
    } else {
      return res.status(400).json({
        error: 'Le template sélectionné ne contient pas de données valides. Veuillez utiliser un template créé avec l\'éditeur ou un template HTML valide.'
      });
    }

    res.json({
      success: true,
      html: htmlContent,
      participant,
      template
    });

  } catch (error) {
    console.error('Error viewing certificate:', error);
    res.status(500).json({ error: 'Failed to view certificate' });
  }
});

export { router as certificatesRouter };