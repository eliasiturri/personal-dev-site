#!/usr/bin/env node

/**
 * Database Initialization Script
 * 
 * This script creates the SQLite database and required tables for the application.
 * Run this script before starting the server for the first time.
 * 
 * Usage: node scripts/init-db.js
 */

const path = require('path');
const fs = require('fs');

// Get the database module
const db = require('../database/database.js');

console.log('Initializing database...');

async function initDatabase() {
    try {
        // Create messages table
        await db.prepare(`
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                subject TEXT NOT NULL,
                text TEXT NOT NULL,
                site_lang TEXT,
                ip TEXT,
                ts TEXT NOT NULL
            )
        `).run();
        console.log('✓ Created "messages" table');

        // Create db_hits table for rate limiting
        await db.prepare(`
            CREATE TABLE IF NOT EXISTS db_hits (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ip TEXT NOT NULL,
                ts TEXT NOT NULL
            )
        `).run();
        console.log('✓ Created "db_hits" table');

        // Create indexes for better performance
        await db.prepare(`
            CREATE INDEX IF NOT EXISTS idx_db_hits_ip_ts 
            ON db_hits(ip, ts)
        `).run();
        console.log('✓ Created index on db_hits');

        await db.prepare(`
            CREATE INDEX IF NOT EXISTS idx_messages_ts 
            ON messages(ts)
        `).run();
        console.log('✓ Created index on messages');

        console.log('\n✅ Database initialization complete!');
        console.log('Database location:', path.resolve(__dirname, '../db.sqlite3'));
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error initializing database:', error);
        process.exit(1);
    }
}

initDatabase();
