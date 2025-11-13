// test-db-connection.js
require('dotenv').config();
const mysql = require('mysql2/promise');

(async () => {
  try {
    const pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 5,
    });

    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    console.log('✅ DB connection OK. 1+1 =', rows[0].result);

    try {
      const [cols] = await pool.query("SHOW COLUMNS FROM users");
      console.log('✅ `users` table columns:');
      cols.forEach(c => console.log(` - ${c.Field} (${c.Type})`));
    } catch {
      console.warn('⚠️ `users` table does not exist.');
    }

    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ DB connection failed:', err.message || err);
    process.exit(1);
  }
})();
