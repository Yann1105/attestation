import express from 'express';
import { sendCertificateEmail, testEmailConfiguration } from '../emailService';
import { validate, sendEmailSchema } from '../validation';
import { authMiddleware, optionalAuthMiddleware } from '../auth';
import { emailLimiter } from '../middleware';

const router = express.Router();

// Send certificate email (requires authentication + rate limiting)
router.post('/send-certificate', authMiddleware, emailLimiter, async (req, res) => {
  try {
    const { participantEmail, certificateData, templateId } = req.body;

    let certificatePath: string | undefined;

    // If templateId is provided, generate PDF first
    if (templateId) {
      const { query } = await import('../database');
      const { CertificateGenerator } = await import('../utils/certificateGenerator');
      const fs = await import('fs');

      // Get template data
      const templateResult = await query('SELECT * FROM templates WHERE id = $1', [parseInt(templateId)]);
      if (templateResult.rows.length === 0) {
        return res.status(404).json({ error: 'Template not found' });
      }

      const template = templateResult.rows[0];

      // Generate PDF certificate
      const generator = new CertificateGenerator();
      const outputPath = `./certificates/${certificateData.certificateNumber}.pdf`;

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

      const pdfResult = await generator.generateCertificatePDF(certificateData, outputPath, htmlContent);

      if (!pdfResult.success) {
        return res.status(500).json({ error: 'Failed to generate certificate PDF', details: pdfResult.error });
      }

      certificatePath = pdfResult.path;
    }

    const result = await sendCertificateEmail(participantEmail, certificateData, certificatePath);

    // Return actual result
    if (result.success) {
      res.json({
        success: true,
        messageId: result.messageId,
        recipient: participantEmail,
        certificateNumber: certificateData.certificateNumber,
        sentAt: result.sentAt,
        certificatePath,
        message: 'Email envoyé avec succès'
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error || 'Erreur lors de l\'envoi de l\'email'
      });
    }
  } catch (error) {
    console.error('Error sending certificate email:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
});

// Test email configuration
router.get('/test', async (req, res) => {
  try {
    const result = await testEmailConfiguration();
    if (result.success) {
      res.json({ success: true, message: 'Configuration email validée' });
    } else {
      res.json({ success: false, message: 'Configuration email invalide', error: result.error });
    }
  } catch (error) {
    console.error('Error testing email configuration:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
});

export { router as emailRouter };