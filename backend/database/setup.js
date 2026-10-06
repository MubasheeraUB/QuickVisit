// Creates all tables and loads sample data into the database.
// Usage (from backend folder):  npm run db:setup
// WARNING: schema.sql drops existing tables first -- this wipes the database.
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const db = require('../config/db');

(async () => {
  try {
    for (const file of ['schema.sql', 'seed.sql']) {
      const sql = fs.readFileSync(path.join(__dirname, file), 'utf8');
      await db.query(sql);
      console.log(`Ran ${file}`);
    }
    console.log('Database ready. Admin login: admin@quickvisit.com / admin123');
    process.exit(0);
  } catch (err) {
    console.error('Setup failed:', err.message);
    process.exit(1);
  }
})();
