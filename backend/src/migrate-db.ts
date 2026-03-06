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

        -- Add ai_generated if not exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name='templates' AND column_name='ai_generated') THEN
          ALTER TABLE templates ADD COLUMN ai_generated BOOLEAN DEFAULT false;
        END IF;

        -- Add ai_prompt if not exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name='templates' AND column_name='ai_prompt') THEN
          ALTER TABLE templates ADD COLUMN ai_prompt TEXT;
        END IF;

        -- Add template_type if not exists
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                      WHERE table_name='templates' AND column_name='template_type') THEN
          ALTER TABLE templates ADD COLUMN template_type VARCHAR(50);
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

    // Add Photoshop tables
    console.log('📝 Creating Photoshop tables...');

    await query(`
      CREATE TABLE IF NOT EXISTS ps_projects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        width INTEGER NOT NULL,
        height INTEGER NOT NULL,
        background_color VARCHAR(20) DEFAULT '#FFFFFF',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS ps_layers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id UUID REFERENCES ps_projects(id) ON DELETE CASCADE,
        type VARCHAR(50) NOT NULL,
        name VARCHAR(255) NOT NULL,
        visible BOOLEAN DEFAULT true,
        opacity INTEGER DEFAULT 100,
        blend_mode VARCHAR(50) DEFAULT 'normal',
        x INTEGER DEFAULT 0,
        y INTEGER DEFAULT 0,
        width INTEGER NOT NULL,
        height INTEGER NOT NULL,
        z_index INTEGER NOT NULL,
        parent_id UUID REFERENCES ps_layers(id) ON DELETE CASCADE,
        image_data BYTEA,
        properties JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_ps_layers_project ON ps_layers(project_id);
      CREATE INDEX IF NOT EXISTS idx_ps_layers_parent ON ps_layers(parent_id);
      CREATE INDEX IF NOT EXISTS idx_ps_layers_z_index ON ps_layers(z_index);

      CREATE TABLE IF NOT EXISTS ps_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id UUID REFERENCES ps_projects(id) ON DELETE CASCADE,
        action_type VARCHAR(50) NOT NULL,
        layer_id UUID,
        parameters JSONB,
        undo_data JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_ps_history_project ON ps_history(project_id);
      CREATE INDEX IF NOT EXISTS idx_ps_history_created ON ps_history(created_at);
    `);

    // Add Canvas tables
    console.log('📝 Creating Canvas tables...');

    await query(`
      CREATE TABLE IF NOT EXISTS canvas_templates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(50) CHECK (category IN ('certificate', 'attestation', 'poster', 'other')),
        canvas_data JSONB NOT NULL,
        variables JSONB,
        width INTEGER NOT NULL,
        height INTEGER NOT NULL,
        background_color VARCHAR(20) DEFAULT '#FFFFFF',
        created_by INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        version INTEGER DEFAULT 1,
        is_public BOOLEAN DEFAULT false,
        ai_prompt TEXT,
        output_format VARCHAR(50) DEFAULT 'html'
      );

      CREATE INDEX IF NOT EXISTS idx_canvas_templates_category ON canvas_templates(category);
      CREATE INDEX IF NOT EXISTS idx_canvas_templates_created_by ON canvas_templates(created_by);
      CREATE INDEX IF NOT EXISTS idx_canvas_templates_created_at ON canvas_templates(created_at);

      CREATE TABLE IF NOT EXISTS canvas_template_versions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        template_id UUID REFERENCES canvas_templates(id) ON DELETE CASCADE,
        version INTEGER NOT NULL,
        canvas_data JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER,
        change_description TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_canvas_versions_template ON canvas_template_versions(template_id);
      CREATE INDEX IF NOT EXISTS idx_canvas_versions_created_at ON canvas_template_versions(created_at);

      CREATE TABLE IF NOT EXISTS canvas_renders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        template_id UUID REFERENCES canvas_templates(id) ON DELETE SET NULL,
        participant_id INTEGER REFERENCES participants(id) ON DELETE SET NULL,
        render_type VARCHAR(10) CHECK (render_type IN ('pdf', 'png', 'jpeg')),
        file_path TEXT,
        variables_used JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_canvas_renders_template ON canvas_renders(template_id);
      CREATE INDEX IF NOT EXISTS idx_canvas_renders_participant ON canvas_renders(participant_id);
      CREATE INDEX IF NOT EXISTS idx_canvas_renders_created_at ON canvas_renders(created_at);

      -- Add columns to existing table if they don't exist
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='canvas_templates' AND column_name='ai_prompt') THEN
          ALTER TABLE canvas_templates ADD COLUMN ai_prompt TEXT;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='canvas_templates' AND column_name='output_format') THEN
          ALTER TABLE canvas_templates ADD COLUMN output_format VARCHAR(50) DEFAULT 'html';
        END IF;
      END $$;
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