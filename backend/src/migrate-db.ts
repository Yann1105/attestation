import { query, closeDatabase } from './database';

async function migrateDatabase() {
  console.log('🔄 Starting database migration...');

  try {
    // Add missing columns to participants table
    console.log('📝 Updating participants table...');
    
    await query(`
      DO $$ 
      BEGIN
        -- Add training_title if not exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name='participants' AND column_name='training_title') THEN
          ALTER TABLE participants ADD COLUMN training_title VARCHAR(255);
        END IF;

        -- Add training_date if not exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name='participants' AND column_name='training_date') THEN
          ALTER TABLE participants ADD COLUMN training_date DATE;
        END IF;

        -- Add training_location if not exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name='participants' AND column_name='training_location') THEN
          ALTER TABLE participants ADD COLUMN training_location VARCHAR(255);
        END IF;

        -- Add training_duration if not exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name='participants' AND column_name='training_duration') THEN
          ALTER TABLE participants ADD COLUMN training_duration VARCHAR(100);
        END IF;

        -- Add instructor if not exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name='participants' AND column_name='instructor') THEN
          ALTER TABLE participants ADD COLUMN instructor VARCHAR(255);
        END IF;

        -- Add approval_date if not exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name='participants' AND column_name='approval_date') THEN
          ALTER TABLE participants ADD COLUMN approval_date DATE;
        END IF;

        -- Add rejection_reason if not exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name='participants' AND column_name='rejection_reason') THEN
          ALTER TABLE participants ADD COLUMN rejection_reason TEXT;
        END IF;

        -- Add template_id if not exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name='participants' AND column_name='template_id') THEN
          ALTER TABLE participants ADD COLUMN template_id INTEGER REFERENCES templates(id);
        END IF;
      END $$;
    `);

    // Add missing columns to templates table
    console.log('📝 Updating templates table...');

    await query(`
      DO $$
      BEGIN
        -- Add type if not exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name='templates' AND column_name='type') THEN
          ALTER TABLE templates ADD COLUMN type VARCHAR(50) DEFAULT 'custom';
        END IF;

        -- Add background_color if not exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name='templates' AND column_name='background_color') THEN
          ALTER TABLE templates ADD COLUMN background_color VARCHAR(20) DEFAULT '#FFFFFF';
        END IF;

        -- Add width if not exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name='templates' AND column_name='width') THEN
          ALTER TABLE templates ADD COLUMN width INTEGER DEFAULT 1200;
        END IF;

        -- Add height if not exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name='templates' AND column_name='height') THEN
          ALTER TABLE templates ADD COLUMN height INTEGER DEFAULT 850;
        END IF;

        -- Add content if not exists (for HTML templates)
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name='templates' AND column_name='content') THEN
          ALTER TABLE templates ADD COLUMN content TEXT;
        END IF;

        -- Add placeholders if not exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name='templates' AND column_name='placeholders') THEN
          ALTER TABLE templates ADD COLUMN placeholders JSONB;
        END IF;

        -- Add file_path if not exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name='templates' AND column_name='file_path') THEN
          ALTER TABLE templates ADD COLUMN file_path VARCHAR(500);
        END IF;
      END $$;
    `);

    // Add missing columns to certificates table
    console.log('📝 Updating certificates table...');
    
    await query(`
      DO $$ 
      BEGIN
        -- Add pdf_data if not exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name='certificates' AND column_name='pdf_data') THEN
          ALTER TABLE certificates ADD COLUMN pdf_data TEXT;
        END IF;
      END $$;
    `);

    // Add constraints and indexes
    console.log('📝 Adding constraints and indexes...');
    
    await query(`
      DO $$ 
      BEGIN
        -- Skip certificate_number unique constraint for now due to existing data issues
        -- Will be handled separately if needed

        -- Skip certificates certificate_number unique constraint for now due to existing data issues
        -- Will be handled separately if needed

        -- Add check constraint for status if not exists
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'participants_status_check') THEN
          ALTER TABLE participants ADD CONSTRAINT participants_status_check 
            CHECK (status IN ('pending', 'approved', 'rejected'));
        END IF;
      END $$;
    `);

    // Create indexes
    await query(`
      CREATE INDEX IF NOT EXISTS idx_participants_email ON participants(email);
      CREATE INDEX IF NOT EXISTS idx_participants_status ON participants(status);
      CREATE INDEX IF NOT EXISTS idx_participants_request_date ON participants(request_date);
      CREATE INDEX IF NOT EXISTS idx_certificates_number ON certificates(certificate_number);
    `);

    console.log('✅ Database migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await closeDatabase();
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { migrateDatabase };