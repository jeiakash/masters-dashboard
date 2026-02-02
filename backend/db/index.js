const { Pool } = require('pg');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'masters_dashboard',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  // Production-ready pool settings
  max: 20,                          // Max number of clients
  idleTimeoutMillis: 30000,        // Close idle clients after 30s
  connectionTimeoutMillis: 2000,    // Return error after 2s if no connection
  ...(isProduction && {
    ssl: {
      rejectUnauthorized: false     // Enable SSL in production
    }
  })
});

// Test connection
pool.on('connect', () => {
  console.log('📦 Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL connection error:', err);
  // Don't exit in production, let the process manager handle restarts
  if (!isProduction) {
    process.exit(-1);
  }
});

module.exports = pool;

