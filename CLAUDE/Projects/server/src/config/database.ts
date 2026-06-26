const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

// Create a new database instance
const db = new sqlite3.Database(path.resolve(__dirname, '../../sqlite.db'), (err: any) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Helper function to run queries and return promises
export function query(sql: string, params: any[] = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err: any, rows: any[]) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

// Helper function to run a query that returns a single row
export function get(sql: string, params: any[] = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err: any, row: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

// Helper function to run a modification query (INSERT, UPDATE, DELETE)
export function run(sql: string, params: any[] = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(this: any, err: any) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
}

// Test the connection
(async () => {
  try {
    const result = await query('SELECT 1');
    console.log('Database connection test successful:', result);
  } catch (err) {
    console.error('Database connection test failed:', err);
  }
})();