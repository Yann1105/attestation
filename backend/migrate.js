const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'certificate_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

const query = async (text, params) => {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
};

const migrate = async () => {
  try {
    console.log('🚀 Starting database migration...');

    // Create participants table
    await query(`
      CREATE TABLE IF NOT EXISTS participants (
        id SERIAL PRIMARY KEY,
        participant_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        organization VARCHAR(255),
        training_title VARCHAR(255),
        training_date DATE,
        training_location VARCHAR(255),
        training_duration VARCHAR(100),
        instructor VARCHAR(255),
        certificate_number VARCHAR(50),
        request_date DATE NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Created participants table');

    // Add missing columns if they don't exist
    await query(`ALTER TABLE participants ADD COLUMN IF NOT EXISTS training_title VARCHAR(255);`);
    await query(`ALTER TABLE participants ADD COLUMN IF NOT EXISTS training_date DATE;`);
    await query(`ALTER TABLE participants ADD COLUMN IF NOT EXISTS training_location VARCHAR(255);`);
    await query(`ALTER TABLE participants ADD COLUMN IF NOT EXISTS training_duration VARCHAR(100);`);
    await query(`ALTER TABLE participants ADD COLUMN IF NOT EXISTS instructor VARCHAR(255);`);
    await query(`ALTER TABLE participants ADD COLUMN IF NOT EXISTS certificate_number VARCHAR(50);`);
    await query(`ALTER TABLE participants ADD COLUMN IF NOT EXISTS request_date DATE;`);
    await query(`ALTER TABLE participants ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending';`);
    await query(`ALTER TABLE participants ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;`);
    await query(`ALTER TABLE participants ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;`);
    await query(`ALTER TABLE participants ADD COLUMN IF NOT EXISTS approval_date DATE;`);
    await query(`ALTER TABLE participants ADD COLUMN IF NOT EXISTS rejection_reason TEXT;`);
    console.log('✅ Added missing columns to participants table');

    // Remove unique constraint on email to allow multiple participants with same email
    await query(`ALTER TABLE participants DROP CONSTRAINT IF EXISTS participants_email_key;`);
    console.log('✅ Removed unique constraint on participants.email');

    // Create templates table
    await query(`
      CREATE TABLE IF NOT EXISTS templates (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        elements JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Created templates table');

    // Add canvas_data column if it doesn't exist
    await query(`ALTER TABLE templates ADD COLUMN IF NOT EXISTS canvas_data JSONB;`);
    console.log('✅ Added canvas_data column to templates table');

    // Add editor_type column if it doesn't exist
    await query(`ALTER TABLE templates ADD COLUMN IF NOT EXISTS editor_type VARCHAR(50);`);
    console.log('✅ Added editor_type column to templates table');

    // Create trainings table
    await query(`
      CREATE TABLE IF NOT EXISTS trainings (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        date DATE,
        location VARCHAR(255),
        duration VARCHAR(100),
        instructor VARCHAR(255),
        organization VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Created trainings table');

    // Create certificates table
    await query(`
      CREATE TABLE IF NOT EXISTS certificates (
        id SERIAL PRIMARY KEY,
        participant_id INTEGER REFERENCES participants(id) ON DELETE CASCADE,
        template_id INTEGER REFERENCES templates(id) ON DELETE SET NULL,
        certificate_number VARCHAR(50) NOT NULL UNIQUE,
        form_data JSONB,
        pdf_data TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Created certificates table');

    // Alter foreign key if table already exists without ON DELETE clauses
    try {
      await query(`ALTER TABLE certificates DROP CONSTRAINT IF EXISTS certificates_participant_id_fkey`);
      await query(`ALTER TABLE certificates ADD CONSTRAINT certificates_participant_id_fkey FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE`);
    } catch (error) {
      console.log('Note: Could not alter participant foreign key, may already be correct');
    }

    try {
      await query(`ALTER TABLE certificates DROP CONSTRAINT IF EXISTS certificates_template_id_fkey`);
      await query(`ALTER TABLE certificates ADD CONSTRAINT certificates_template_id_fkey FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE SET NULL`);
    } catch (error) {
      console.log('Note: Could not alter template foreign key, may already be correct');
    }

    console.log('🎉 Database migration completed successfully!');
  } catch (error) {
    console.error('❌ Error during migration:', error);
    process.exit(1);
  } finally {
    await pool.end();
    console.log('🔄 Database connection closed');
  }
};

migrate();