// ==========================================
// DATABASE CONNECTION SETUP
// This file handles connection to SQLite database
// ==========================================

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Fix: Use '../../' because this file is in backend/models/
// We need to go up two levels to find the database folder
const dbPath = path.join(__dirname, '../../database/hotel.db');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Database connection error:', err.message);
    console.error('   Trying to access:', dbPath); // Debugging help
  } else {
    console.log('✅ Connected to SQLite database');
    
    // Initialize database schema when server starts
    initializeDatabase();
  }
});

// ==========================================
// Initialize Database - Create all tables
// ==========================================
function initializeDatabase() {
  const fs = require('fs');
const schemaPath = path.join(__dirname, '../../database/schema.sql');
  
  
  fs.readFile(schemaPath, 'utf8', (err, data) => {
    if (err) {
      console.error('❌ Error reading schema file:', err.message);
      return;
    }

    // Execute all SQL statements in the schema file
    db.exec(data, (err) => {
      if (err) {
        // Ignore "table already exists" errors, that's normal
        if (!err.message.includes('already exists')) {
            console.error('❌ Error initializing database:', err.message);
        }
      } else {
        console.log('✅ Database schema initialized successfully');
      }
    });
  });
}

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

module.exports = db;