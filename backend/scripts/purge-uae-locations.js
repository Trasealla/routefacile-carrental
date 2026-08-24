#!/usr/bin/env node
/**
 * Delete the previous owner's UAE locations and everything hanging off them.
 *
 * The locations table arrived with 26 Emirati branches (Dubai Airport terminals,
 * Abu Dhabi Mall, Ras Al Khaimah, Sharjah…). They were already inactive, so no
 * customer saw them, but they still filled the admin's dropdowns and dragged
 * along ~559,000 rows of dead pricing.
 *
 * Identified by longitude: Morocco lies west of the prime meridian, so any
 * location with long > 0 is not in Morocco. Safer than matching on names, which
 * are inconsistent, and it cannot accidentally catch a Moroccan record.
 *
 * Runs in a transaction and refuses to proceed if any BOOKING references one of
 * them — a booking is a real customer record and must never be orphaned.
 *
 *   node scripts/purge-uae-locations.js          # report only
 *   node scripts/purge-uae-locations.js --apply  # actually delete
 */
const mysql = require('mysql2/promise');
require('dotenv').config();

const APPLY = process.argv.includes('--apply');

// Order matters: children before parents, or the foreign keys reject it.
const DEPENDENTS = [
  ['rates_range', 'location_id'],
  ['location_opening_hours', 'location_id'],
  ['location_opening_hour_exceptions', 'location_id'],
  ['stop_sales', 'location_id'],
  ['booking_form_submissions', 'pickup_location_id'],
  ['booking_form_submissions', 'dropoff_location_id'],
];

// Deleting one of these would orphan a real customer's reservation.
const PROTECTED = [
  ['bookings', 'pickup_location_id'],
  ['bookings', 'dropoff_location_id'],
  ['bookings_temp', 'pickup_location_id'],
  ['bookings_temp', 'dropoff_location_id'],
];

(async () => {
  const conn = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT || 3306,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    multipleStatements: false,
  });

  const [rows] = await conn.execute(
    'SELECT id, name_en FROM locations WHERE CAST(`long` AS DECIMAL(10,6)) > 0'
  );
  const ids = rows.map((r) => r.id);

  if (ids.length === 0) {
    console.log('No locations outside Morocco — nothing to do.');
    await conn.end();
    return;
  }

  console.log(`Locations outside Morocco: ${ids.length}`);
  rows.forEach((r) => console.log(`   ${r.id.toString().padStart(4)}  ${r.name_en}`));

  console.log('\nBookings referencing them (must be zero):');
  let blocked = 0;
  for (const [t, col] of PROTECTED) {
    const [r] = await conn.query(`SELECT COUNT(*) n FROM \`${t}\` WHERE \`${col}\` IN (?)`, [ids]);
    console.log(`   ${t}.${col} = ${r[0].n}`);
    blocked += r[0].n;
  }
  if (blocked > 0) {
    console.error(`\nREFUSING: ${blocked} booking row(s) reference these locations.`);
    await conn.end();
    process.exit(1);
  }

  console.log('\nDependent rows to remove:');
  let total = 0;
  for (const [t, col] of DEPENDENTS) {
    const [r] = await conn.query(`SELECT COUNT(*) n FROM \`${t}\` WHERE \`${col}\` IN (?)`, [ids]);
    if (r[0].n) console.log(`   ${t}.${col} = ${r[0].n}`);
    total += r[0].n;
  }
  console.log(`   total = ${total}`);

  if (!APPLY) {
    console.log('\nDry run. Re-run with --apply to delete.');
    await conn.end();
    return;
  }

  console.log('\nDeleting...');
  await conn.beginTransaction();
  try {
    for (const [t, col] of DEPENDENTS) {
      const [r] = await conn.query(`DELETE FROM \`${t}\` WHERE \`${col}\` IN (?)`, [ids]);
      if (r.affectedRows) console.log(`   -${r.affectedRows.toString().padStart(7)}  ${t}.${col}`);
    }
    const [loc] = await conn.query('DELETE FROM locations WHERE id IN (?)', [ids]);
    console.log(`   -${loc.affectedRows.toString().padStart(7)}  locations`);
    await conn.commit();
    console.log('\nCommitted.');
  } catch (e) {
    await conn.rollback();
    console.error('\nRolled back:', e.message);
    await conn.end();
    process.exit(1);
  }

  const [left] = await conn.execute('SELECT COUNT(*) n FROM locations');
  const [outside] = await conn.execute(
    'SELECT COUNT(*) n FROM locations WHERE CAST(`long` AS DECIMAL(10,6)) > 0'
  );
  console.log(`\nlocations remaining: ${left[0].n} (outside Morocco: ${outside[0].n})`);

  await conn.end();
})().catch((e) => {
  console.error('FAILED:', e.message);
  process.exit(1);
});
