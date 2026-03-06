#!/bin/sh
set -e

echo "🔄 Waiting for database to be ready..."
# Use a simple node script to wait for the database, as nc can be unreliable with Docker DNS
node -e "
const { Client } = require('pg');
const client = new Client({
  host: 'attestation_db',
  port: 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'attestation_db'
});

async function wait() {
  for (let i = 0; i < 30; i++) {
    try {
      await client.connect();
      console.log('✅ Database is ready!');
      await client.end();
      process.exit(0);
    } catch (err) {
      console.log('⏳ Waiting for PostgreSQL (' + i + '/30)...');
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  console.error('❌ Database connection timed out');
  process.exit(1);
}
wait();
"

echo "🔄 Running database migrations..."
npm run migrate

echo "✅ Migrations completed!"
echo "🚀 Starting server..."
exec npm start
