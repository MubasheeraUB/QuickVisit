// Fixes seeded user passwords (seed.sql originally had invalid hashes).
// Usage (from backend folder):  node database/reset-passwords.js
require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../config/db');

(async () => {
  try {
    const admin = await bcrypt.hash('admin123', 10);
    const tourist = await bcrypt.hash('tourist123', 10);

    const a = await db.query(
      `UPDATE users SET password = $1, status = 'active' WHERE email = 'admin@quickvisit.com'`,
      [admin]
    );
    if (a.rowCount === 0) {
      await db.query(
        `INSERT INTO users (name, email, password, phone, role)
         VALUES ('Admin User', 'admin@quickvisit.com', $1, '+91 9999999999', 'admin')`,
        [admin]
      );
      console.log('Admin user created.');
    } else {
      console.log('Admin password reset.');
    }

    const t = await db.query(
      `UPDATE users SET password = $1 WHERE role = 'tourist' AND email IN
       ('mubasheera2002@gmail.com','rahul.sh@gmail.com','priya.m@gmail.com','ahmed.k@gmail.com','sarah.j@gmail.com')`,
      [tourist]
    );
    console.log(`Tourist passwords reset: ${t.rowCount}`);
    console.log('Login: admin@quickvisit.com / admin123');
    process.exit(0);
  } catch (err) {
    console.error('Failed:', err.message);
    process.exit(1);
  }
})();
