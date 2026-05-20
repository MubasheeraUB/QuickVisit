// PostgreSQL Database Connection Pool
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'quickvisit',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('connect', () => {
  console.log('PostgreSQL: Client connected');
});

pool.on('error', (err) => {
  console.error('PostgreSQL Pool Error:', err);
});

// Test connection on startup
(async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('PostgreSQL: Connected at', result.rows[0].now);
    client.release();
  } catch (err) {
    console.error('PostgreSQL: Connection failed -', err.message);
  }
})();

module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
  pool
};
