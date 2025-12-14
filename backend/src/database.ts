import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: './backend/.env' });
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***' : 'not set');

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

export const query = async (text: string, params?: any[]) => {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
};

export const initializeDatabase = async () => {
  try {
    // Create tables if they don't exist
    await query(`
      CREATE TABLE IF NOT EXISTS participants (
        id SERIAL PRIMARY KEY,
        participant_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(50),
        organization VARCHAR(255),
        training_title VARCHAR(255),
        training_date DATE,
        training_location VARCHAR(255),
        training_duration VARCHAR(100),
        instructor VARCHAR(255),
        certificate_number VARCHAR(50) UNIQUE,
        request_date DATE NOT NULL,
        status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
        approval_date DATE,
        rejection_reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS templates (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        type VARCHAR(50) DEFAULT 'custom',
        elements JSONB DEFAULT '[]'::jsonb,
        canvas_data TEXT,
        background_color VARCHAR(20) DEFAULT '#FFFFFF',
        width INTEGER DEFAULT 1200,
        height INTEGER DEFAULT 850,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

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

    // Create indexes for better performance
    await query(`
      CREATE INDEX IF NOT EXISTS idx_participants_email ON participants(email);
      CREATE INDEX IF NOT EXISTS idx_participants_status ON participants(status);
      CREATE INDEX IF NOT EXISTS idx_participants_request_date ON participants(request_date);
      CREATE INDEX IF NOT EXISTS idx_certificates_number ON certificates(certificate_number);
    `);

    console.log('✅ Database initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    // Don't throw error - allow server to start without database
    console.log('⚠️ Server will start without database connection');
  }
};

export const closeDatabase = async () => {
  await pool.end();
  console.log('🔄 Database connection closed');
};