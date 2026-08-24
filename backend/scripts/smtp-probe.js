/* eslint-disable */
// Standalone SMTP probe — mirrors the production mailer config in
// src/mail/mail.module.ts, but runs outside Nest so we can verify SMTP
// connectivity + auth + actual delivery without restarting the app.
//
// Usage:   node scripts/smtp-probe.js osamaalaa133@gmail.com
require('dotenv').config();
const nodemailer = require('nodemailer');

const to = process.argv[2] || 'osamaalaa133@gmail.com';
const port = parseInt(process.env.MAIL_PORT) || 587;

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port,
  secure: port === 465,
  requireTLS: port !== 465,
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
  tls: { rejectUnauthorized: false },
  connectionTimeout: 15_000,
  greetingTimeout: 10_000,
  socketTimeout: 30_000,
  logger: true,
  debug: true,
});

(async () => {
  console.log('--- SMTP probe ---');
  console.log('Host:', process.env.MAIL_HOST);
  console.log('Port:', port);
  console.log('User:', process.env.MAIL_USERNAME);
  console.log('From:', process.env.MAIL_FROM || process.env.MAIL_FROM_ADDRESS);
  console.log('To  :', to);

  try {
    await transporter.verify();
    console.log('\n[OK] verify() passed — SMTP reachable & auth accepted');
  } catch (err) {
    console.error('\n[FAIL] verify() failed:', err && err.message);
    process.exit(1);
  }

  try {
    const info = await transporter.sendMail({
      from: `"${process.env.MAIL_FROM_NAME || 'Autostrad Rent A Car'}" <${process.env.MAIL_FROM || process.env.MAIL_FROM_ADDRESS}>`,
      to,
      subject: 'Autostrad SMTP probe — ' + new Date().toISOString(),
      text:
        'This is an automated SMTP delivery test from the Autostrad backend.\n' +
        'If you receive this, SMTP outbound from the app is working end-to-end.',
      html:
        '<p>This is an automated SMTP delivery test from the <b>Autostrad backend</b>.</p>' +
        '<p>If you receive this, SMTP outbound from the app is working end-to-end.</p>',
    });
    console.log('\n[OK] sendMail accepted by SMTP server');
    console.log('messageId :', info.messageId);
    console.log('response  :', info.response);
    console.log('accepted  :', info.accepted);
    console.log('rejected  :', info.rejected);
    console.log('envelope  :', info.envelope);
  } catch (err) {
    console.error('\n[FAIL] sendMail failed:');
    console.error('  message      :', err && err.message);
    console.error('  code         :', err && err.code);
    console.error('  responseCode :', err && err.responseCode);
    console.error('  response     :', err && err.response);
    console.error('  command      :', err && err.command);
    process.exit(1);
  }
  process.exit(0);
})();
