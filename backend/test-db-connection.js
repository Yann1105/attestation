const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'certificate_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
});

async function testConnection() {
  console.log('🔍 Testing database connection...\n');
  console.log('Configuration:');
  console.log(`  Host: ${process.env.DB_HOST || 'localhost'}`);
  console.log(`  Port: ${process.env.DB_PORT || '5432'}`);
  console.log(`  Database: ${process.env.DB_NAME || 'certificate_db'}`);
  console.log(`  User: ${process.env.DB_USER || 'postgres'}`);
  console.log(`  Password: ${process.env.DB_PASSWORD ? '***' : 'not set'}\n`);

  try {
    const client = await pool.connect();
    console.log('✅ Successfully connected to PostgreSQL!');
    
    const result = await client.query('SELECT version()');
    console.log(`\n📊 PostgreSQL version:\n${result.rows[0].version}\n`);
    
    // Check if tables exist
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    if (tablesResult.rows.length > 0) {
      console.log('📋 Existing tables:');
      tablesResult.rows.forEach(row => {
        console.log(`  - ${row.table_name}`);
      });
    } else {
      console.log('⚠️  No tables found. Run the server to initialize the database.');
    }
    
    client.release();
    console.log('\n✅ Database connection test successful!');
  } catch (error) {
    console.error('\n❌ Database connection failed:');
    console.error(error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('  1. Make sure PostgreSQL is running');
    console.error('  2. Check your .env file configuration');
    console.error('  3. Verify database exists: createdb certificate_db');
    console.error('  4. Check user permissions');
  } finally {
    await pool.end();
  }
}

testConnection();