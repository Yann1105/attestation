import express from 'express';
import fs from 'fs';
import { query } from '../database';
import { sendConfirmationEmail, sendCertificateEmail } from '../emailService';
import { validate, createParticipantSchema, updateParticipantSchema } from '../validation';
import { authMiddleware } from '../auth';
import { CertificateGenerator } from '../utils/certificateGenerator';

const router = express.Router();

// Get all participants
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM participants ORDER BY created_at DESC');
    const participants = result.rows.map(row => ({
      id: row.id.toString(),
      participantName: row.participant_name,
      email: row.email,
      phone: row.phone,
      organization: row.organization,
      trainingTitle: row.training_title,
      trainingDate: row.training_date,
      trainingLocation: row.training_location,
      trainingDuration: row.training_duration,
      instructor: row.instructor,
      certificateNumber: row.certificate_number,
      requestDate: row.request_date,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
    res.json(participants);
  } catch (error) {
    console.error('Error fetching participants:', error);
    res.status(500).json({ error: 'Failed to fetch participants' });
  }
});

// Create participant (public endpoint)
router.post('/', validate(createParticipantSchema), async (req, res) => {
  try {
    const { participantName, email, phone, organization, trainingTitle, trainingDate, trainingLocation, trainingDuration, instructor } = req.body;

    const result = await query(`
      INSERT INTO participants (participant_name, email, phone, organization, training_title, training_date, training_location, training_duration, instructor, request_date, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `, [
      participantName,
      email,
      phone,
      organization,
      trainingTitle,
      trainingDate || null,
      trainingLocation,
      trainingDuration,
      instructor,
      new Date().toISOString().split('T')[0],
      'pending'
    ]);

    const row = result.rows[0];
    const participant = {
      id: row.id.toString(),
      participantName: row.participant_name,
      email: row.email,
      phone: row.phone,
      organization: row.organization,
      trainingTitle: row.training_title,
      trainingDate: row.training_date,
      trainingLocation: row.training_location,
      trainingDuration: row.training_duration,
      instructor: row.instructor,
      requestDate: row.request_date,
      status: row.status,
      approvalDate: row.approval_date,
      rejectionReason: row.rejection_reason,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };

    // Send confirmation email to participant
    const emailResult = await sendConfirmationEmail(participant.email, participant.participantName);
    if (!emailResult.success) {
      console.error('Failed to send confirmation email:', emailResult.error);
      // Don't fail the request if email fails, just log it
    }

    res.status(201).json(participant);
  } catch (error) {
    console.error('Error creating participant:', error);
    res.status(500).json({ error: 'Failed to create participant' });
  }
});

// Update participant (requires authentication)
router.put('/:id', authMiddleware, validate(updateParticipantSchema), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const fields = [];
    const values = [];
    let paramCount = 1;

    if (updates.participantName !== undefined) {
      fields.push(`participant_name = $${paramCount++}`);
      values.push(updates.participantName);
    }
    if (updates.email !== undefined) {
      fields.push(`email = $${paramCount++}`);
      values.push(updates.email);
    }
    if (updates.phone !== undefined) {
      fields.push(`phone = $${paramCount++}`);
      values.push(updates.phone);
    }
    if (updates.organization !== undefined) {
      fields.push(`organization = $${paramCount++}`);
      values.push(updates.organization);
    }
    if (updates.trainingTitle !== undefined) {
      fields.push(`training_title = $${paramCount++}`);
      values.push(updates.trainingTitle);
    }
    if (updates.trainingDate !== undefined) {
      fields.push(`training_date = $${paramCount++}`);
      values.push(updates.trainingDate || null);
    }
    if (updates.trainingLocation !== undefined) {
      fields.push(`training_location = $${paramCount++}`);
      values.push(updates.trainingLocation);
    }
    if (updates.trainingDuration !== undefined) {
      fields.push(`training_duration = $${paramCount++}`);
      values.push(updates.trainingDuration);
    }
    if (updates.instructor !== undefined) {
      fields.push(`instructor = $${paramCount++}`);
      values.push(updates.instructor);
    }
    if (updates.certificateNumber !== undefined) {
      fields.push(`certificate_number = $${paramCount++}`);
      values.push(updates.certificateNumber);
    }
    if (updates.status !== undefined) {
      fields.push(`status = $${paramCount++}`);
      values.push(updates.status);
    }
    if (updates.approvalDate !== undefined) {
      fields.push(`approval_date = $${paramCount++}`);
      values.push(updates.approvalDate || null);
    }
    if (updates.rejectionReason !== undefined) {
      fields.push(`rejection_reason = $${paramCount++}`);
      values.push(updates.rejectionReason);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(parseInt(id)); // TODO: use participantId after validation

    const result = await query(`
      UPDATE participants
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Participant not found' });
    }

    const row = result.rows[0];
    const participant = {
      id: row.id.toString(),
      participantName: row.participant_name,
      email: row.email,
      phone: row.phone,
      organization: row.organization,
      trainingTitle: row.training_title,
      trainingDate: row.training_date,
      trainingLocation: row.training_location,
      trainingDuration: row.training_duration,
      instructor: row.instructor,
      certificateNumber: row.certificate_number,
      requestDate: row.request_date,
      status: row.status,
      approvalDate: row.approval_date,
      rejectionReason: row.rejection_reason,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };

    res.json(participant);
  } catch (error) {
    console.error('Error updating participant:', error);
    res.status(500).json({ error: 'Failed to update participant' });
  }
});

// Approve participant and generate certificate (requires authentication)
router.post('/:id/approve', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { templateId, trainingData } = req.body;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ error: 'Invalid participant ID' });
    }

    const participantId = parseInt(id);

    if (!templateId) {
      return res.status(400).json({ error: 'Template ID is required' });
    }

    // Update participant with training data if provided
    if (trainingData) {
      const updateFields = [];
      const updateValues = [];
      let paramCount = 1;

      if (trainingData.organization !== undefined) {
        updateFields.push(`organization = $${paramCount++}`);
        updateValues.push(trainingData.organization);
      }
      if (trainingData.trainingTitle !== undefined) {
        updateFields.push(`training_title = $${paramCount++}`);
        updateValues.push(trainingData.trainingTitle);
      }
      if (trainingData.trainingDate !== undefined) {
        updateFields.push(`training_date = $${paramCount++}`);
        updateValues.push(trainingData.trainingDate || null);
      }
      if (trainingData.trainingLocation !== undefined) {
        updateFields.push(`training_location = $${paramCount++}`);
        updateValues.push(trainingData.trainingLocation);
      }
      if (trainingData.trainingDuration !== undefined) {
        updateFields.push(`training_duration = $${paramCount++}`);
        updateValues.push(trainingData.trainingDuration);
      }
      if (trainingData.instructor !== undefined) {
        updateFields.push(`instructor = $${paramCount++}`);
        updateValues.push(trainingData.instructor);
      }

      if (updateFields.length > 0) {
        updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
        updateValues.push(participantId);

        await query(
          `UPDATE participants SET ${updateFields.join(', ')} WHERE id = $${paramCount}`,
          updateValues
        );
      }
    }

    // Get updated participant data
    const participantResult = await query('SELECT * FROM participants WHERE id = $1', [participantId]);
    if (participantResult.rows.length === 0) {
      return res.status(404).json({ error: 'Participant not found' });
    }

    let participant = participantResult.rows[0];

    // Generate certificate number if not present or invalid format
    let certificateNumber = participant.certificate_number;
    const isValidFormat = certificateNumber && /^CERT\d+/.test(certificateNumber);

    if (!certificateNumber || !isValidFormat) {
      // Generate a certificate number that starts with CERT followed by digits only
      const timestamp = Date.now();
      const randomDigits = Math.floor(Math.random() * 10000); // 4-digit random number
      certificateNumber = `CERT${timestamp}${randomDigits}`;

      // Update participant with generated certificate number
      await query(
        'UPDATE participants SET certificate_number = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [certificateNumber, participantId]
      );

      // Refresh participant data
      const updatedResult = await query('SELECT * FROM participants WHERE id = $1', [participantId]);
      participant = updatedResult.rows[0];
    }

    // Get template data
    const templateResult = await query('SELECT * FROM templates WHERE id = $1', [parseInt(templateId)]);
    if (templateResult.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }

    const template = templateResult.rows[0];

    // Ensure training date is in YYYY-MM-DD format
    let trainingDate = participant.training_date;
    if (trainingDate && !/^\d{4}-\d{2}-\d{2}$/.test(trainingDate)) {
      // Try to parse and reformat the date
      const parsedDate = new Date(trainingDate);
      if (!isNaN(parsedDate.getTime())) {
        trainingDate = parsedDate.toISOString().split('T')[0];
        // Update the participant with corrected date
        await query(
          'UPDATE participants SET training_date = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          [trainingDate, participantId]
        );
        participant.training_date = trainingDate;
      }
    }

    // Prepare certificate data
    const certificateData = {
      participantName: participant.participant_name,
      certificateNumber: certificateNumber,
      trainingTitle: participant.training_title,
      trainingDate: trainingDate,
      trainingLocation: participant.training_location,
      trainingDuration: participant.training_duration,
      instructor: participant.instructor,
      organization: participant.organization,
      issueDate: new Date().toISOString().split('T')[0],
      canvasData: template.canvas_data
    };

    // Generate PDF certificate
    const generator = new CertificateGenerator();
    const outputPath = `./certificates/${certificateNumber}.pdf`;

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
      throw new Error('Le template sélectionné ne contient pas de données valides. Veuillez utiliser un template créé avec l\'éditeur ou un template HTML valide.');
    }

    const pdfResult = await generator.generateCertificatePDF(certificateData, outputPath, htmlContent);

    if (!pdfResult.success) {
      return res.status(500).json({ error: 'Failed to generate certificate PDF', details: pdfResult.error });
    }

    // Update participant status to approved and store template_id
    await query(
      'UPDATE participants SET status = $1, approval_date = $2, template_id = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4',
      ['approved', new Date().toISOString(), parseInt(templateId), participantId]
    );

    // Send certificate email
    const emailResult = await sendCertificateEmail(
      participant.email,
      {
        participantName: participant.participant_name,
        certificateNumber: certificateNumber,
        template: template,
        formData: participant
      },
      pdfResult.path
    );

    if (!emailResult.success) {
      console.error('Failed to send certificate email:', emailResult.error);
      // Don't fail the request if email fails, but log it
    }

    res.json({
      success: true,
      message: 'Participant approved and certificate sent',
      certificatePath: pdfResult.path,
      emailSent: emailResult.success
    });

  } catch (error) {
    console.error('Error approving participant:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    res.status(500).json({ error: 'Failed to approve participant', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Delete participant (requires authentication)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ error: 'Invalid participant ID' });
    }
    await query('DELETE FROM participants WHERE id = $1', [parseInt(id)]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting participant:', error);
    res.status(500).json({ error: 'Failed to delete participant' });
  }
});

export { router as participantsRouter };