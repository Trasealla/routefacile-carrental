#!/usr/bin/env node
/**
 * Print a row count for every table, as JSON.
 *
 * Run on two servers and diff the output to prove a migration carried
 * everything across — information_schema.TABLE_ROWS is only an estimate for
 * InnoDB, so this counts for real.
 */
const mysql = require('mysql2/promise');
require('dotenv').config();

(async () => {
  const conn = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT || 3306,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  });

  const [tables] = await conn.execute(
    "SELECT TABLE_NAME t FROM information_schema.TABLES " +
    "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_TYPE = 'BASE TABLE' ORDER BY TABLE_NAME"
  );

  const counts = {};
  for (const { t } of tables) {
    const [r] = await conn.query(`SELECT COUNT(*) AS n FROM \`${t}\``);
    counts[t] = r[0].n;
  }

  await conn.end();
  console.log(JSON.stringify(counts));
})().catch((e) => {
  console.error('FAILED:', e.message);
  process.exit(1);
});
