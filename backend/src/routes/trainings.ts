import express from 'express';
import { query } from '../database';
import { validate, createTrainingSchema, updateTrainingSchema } from '../validation';
import { authMiddleware } from '../auth';

const router = express.Router();

// Get all trainings
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM trainings ORDER BY created_at DESC');
    const trainings = result.rows.map(row => ({
      id: row.id.toString(),
      title: row.title,
      description: row.description,
      date: row.date,
      location: row.location,
      duration: row.duration,
      instructor: row.instructor,
      organization: row.organization,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
    res.json(trainings);
  } catch (error) {
    console.error('Error fetching trainings:', error);
    res.status(500).json({ error: 'Failed to fetch trainings' });
  }
});

// Create training (requires authentication)
router.post('/', authMiddleware, validate(createTrainingSchema), async (req, res) => {
  try {
    const { title, description, date, location, duration, instructor, organization } = req.body;

    const result = await query(`
      INSERT INTO trainings (title, description, date, location, duration, instructor, organization)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [
      title,
      description,
      date,
      location,
      duration,
      instructor,
      organization
    ]);

    const row = result.rows[0];
    const training = {
      id: row.id.toString(),
      title: row.title,
      description: row.description,
      date: row.date,
      location: row.location,
      duration: row.duration,
      instructor: row.instructor,
      organization: row.organization,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };

    res.status(201).json(training);
  } catch (error) {
    console.error('Error creating training:', error);
    res.status(500).json({ error: 'Failed to create training' });
  }
});

// Update training (requires authentication)
router.put('/:id', authMiddleware, validate(updateTrainingSchema), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const fields = [];
    const values = [];
    let paramCount = 1;

    if (updates.title !== undefined) {
      fields.push(`title = $${paramCount++}`);
      values.push(updates.title);
    }
    if (updates.description !== undefined) {
      fields.push(`description = $${paramCount++}`);
      values.push(updates.description);
    }
    if (updates.date !== undefined) {
      fields.push(`date = $${paramCount++}`);
      values.push(updates.date);
    }
    if (updates.location !== undefined) {
      fields.push(`location = $${paramCount++}`);
      values.push(updates.location);
    }
    if (updates.duration !== undefined) {
      fields.push(`duration = $${paramCount++}`);
      values.push(updates.duration);
    }
    if (updates.instructor !== undefined) {
      fields.push(`instructor = $${paramCount++}`);
      values.push(updates.instructor);
    }
    if (updates.organization !== undefined) {
      fields.push(`organization = $${paramCount++}`);
      values.push(updates.organization);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(parseInt(id));

    const result = await query(`
      UPDATE trainings
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Training not found' });
    }

    const row = result.rows[0];
    const training = {
      id: row.id.toString(),
      title: row.title,
      description: row.description,
      date: row.date,
      location: row.location,
      duration: row.duration,
      instructor: row.instructor,
      organization: row.organization,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };

    res.json(training);
  } catch (error) {
    console.error('Error updating training:', error);
    res.status(500).json({ error: 'Failed to update training' });
  }
});

// Delete training (requires authentication)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM trainings WHERE id = $1', [parseInt(id)]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting training:', error);
    res.status(500).json({ error: 'Failed to delete training' });
  }
});

export { router as trainingsRouter };