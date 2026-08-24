#!/usr/bin/env node
/**
 * Remove a single booking and everything hanging off it.
 *
 * Written to clear the smoke-test booking that verified the cmi_oid fix on
 * production. Takes the booking number so there is no chance of deleting the
 * wrong row by id, refuses to touch anything if the number does not match
 * exactly, and prints what it removed.
 *
 *   node scripts/delete-test-booking.js RF1 [--guest-user]
 *
 * --guest-user also removes the auto-created guest customer, but only if that
 * customer has no other bookings and carries a placeholder guest email.
 */
const mysql = require('mysql2/promise');
require('dotenv').config();

const bookingNumber = process.argv[2];
const alsoUser = process.argv.includes('--guest-user');

if (!bookingNumber) {
  console.error('usage: node scripts/delete-test-booking.js <BOOKING_NUMBER> [--guest-user]');
  process.exit(1);
}

(async () => {
  const conn = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT || 3306,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  });

  const [rows] = await conn.execute(
    'SELECT id, booking_number, user_id, user_email FROM bookings WHERE booking_number = ?',
    [bookingNumber],
  );

  if (rows.length === 0) {
    console.log(`No booking named ${bookingNumber} — nothing to do.`);
    await conn.end();
    return;
  }
  if (rows.length > 1) {
    console.error(`${rows.length} bookings share ${bookingNumber}; refusing to guess.`);
    await conn.end();
    process.exit(1);
  }

  const booking = rows[0];
  console.log(`Deleting booking ${booking.booking_number} (id ${booking.id}, ${booking.user_email})`);

  // Child rows first: no ON DELETE CASCADE is declared on these.
  for (const [table, column] of [
    ['booking_car_extras', 'booking_id'],
    ['booking_monthly_installments', 'booking_id'],
    ['booking_payment_transactions', 'booking_id'],
    ['mail_responses', 'booking_id'],
    ['sms_responses', 'booking_id'],
  ]) {
    try {
      const [r] = await conn.execute(`DELETE FROM \`${table}\` WHERE \`${column}\` = ?`, [booking.id]);
      if (r.affectedRows) console.log(`  - ${r.affectedRows} row(s) from ${table}`);
    } catch (e) {
      // A table that does not exist in this schema is not an error worth stopping for.
      if (!/doesn't exist|Unknown column/i.test(e.message)) throw e;
    }
  }

  const [del] = await conn.execute('DELETE FROM bookings WHERE id = ?', [booking.id]);
  console.log(`  - ${del.affectedRows} row(s) from bookings`);

  if (alsoUser && booking.user_id) {
    const [others] = await conn.execute(
      'SELECT COUNT(*) AS n FROM bookings WHERE user_id = ?',
      [booking.user_id],
    );
    const [u] = await conn.execute('SELECT email FROM users WHERE id = ?', [booking.user_id]);
    const email = u[0]?.email || '';
    const isTestGuest = email.endsWith('@guest.route-facile.local') || email === 'claude.smoketest@example.com';

    if (others[0].n === 0 && isTestGuest) {
      await conn.execute('DELETE FROM users WHERE id = ?', [booking.user_id]);
      console.log(`  - guest customer ${booking.user_id} (${email}) removed`);
    } else {
      console.log(`  = customer ${booking.user_id} kept (${others[0].n} other booking(s), email ${email})`);
    }
  }

  await conn.end();
  console.log('Done.');
})().catch((err) => {
  console.error('FAILED:', err.message);
  process.exit(1);
});
