#!/usr/bin/env node
/**
 * Add the CMI payment columns to `bookings`.
 *
 * The Booking entity gained `cmi_oid` / `cmi_response` when the Moroccan CMI
 * gateway was wired up, but DB_SYNCHRONIZE is off in production (rightly), so
 * the columns only ever existed on the dev database. Every INSERT into bookings
 * therefore failed on production with:
 *
 *     Unknown column 'cmi_oid' in 'field list'
 *
 * which meant no booking could be completed at all.
 *
 * Both columns are nullable with no default, so adding them touches no existing
 * row. The script checks before it alters, so running it twice is harmless.
 */
const mysql = require('mysql2/promise');
require('dotenv').config();

const COLUMNS = [
  { name: 'cmi_oid', ddl: 'ADD COLUMN `cmi_oid` VARCHAR(191) NULL AFTER `payfort_response`' },
  { name: 'cmi_response', ddl: 'ADD COLUMN `cmi_response` JSON NULL AFTER `cmi_oid`' },
];

(async () => {
  const conn = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT || 3306,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  });

  const [existing] = await conn.execute('SHOW COLUMNS FROM `bookings`');
  const present = new Set(existing.map((c) => c.Field));

  for (const col of COLUMNS) {
    if (present.has(col.name)) {
      console.log(`  = ${col.name} already present, skipping`);
      continue;
    }
    await conn.query(`ALTER TABLE \`bookings\` ${col.ddl}`);
    console.log(`  + ${col.name} added`);
  }

  const [after] = await conn.execute('SHOW COLUMNS FROM `bookings`');
  const now = new Set(after.map((c) => c.Field));
  const missing = COLUMNS.filter((c) => !now.has(c.name)).map((c) => c.name);

  await conn.end();

  if (missing.length) {
    console.error(`FAILED — still missing: ${missing.join(', ')}`);
    process.exit(1);
  }
  console.log('bookings table is in step with the Booking entity.');
})().catch((err) => {
  console.error('FAILED:', err.message);
  process.exit(1);
});
