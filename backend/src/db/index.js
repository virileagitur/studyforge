const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

const fs = require('fs');
const path = require('path');

const query = (text, params) => pool.query(text, params);

const bootstrapDatabase = async () => {
  if (!process.env.DATABASE_URL) {
    console.log('No DATABASE_URL provided. Database bootstrap skipped.');
    return;
  }

  try {
    // Check if the 'users' table exists
    const checkTable = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    
    if (!checkTable.rows[0].exists) {
      console.log('Database tables not found. Initializing schema...');
      const schemaPath = path.join(__dirname, 'schema.sql');
      if (fs.existsSync(schemaPath)) {
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        await query(schemaSql);
        console.log('Database schema initialized successfully!');
      } else {
        console.warn('schema.sql file not found at ' + schemaPath);
      }
    } else {
      // Run the alter table check if it already exists
      await query("ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'user'");
    }

    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    if (adminEmail) {
      await query('UPDATE users SET role = $1 WHERE LOWER(email) = $2', ['admin', adminEmail]);
    }
  } catch (err) {
    console.error('Error during database bootstrap:', err);
  }
};

bootstrapDatabase().catch((err) => {
  console.error('Database bootstrap failed', err);
});

module.exports = { query, pool };
