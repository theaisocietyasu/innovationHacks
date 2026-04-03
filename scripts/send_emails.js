/**
 * Bulk email sender — sends check-in QR codes to all accepted registrations
 * that haven't received an email yet.
 *
 * Usage (from project root): node scripts/send_emails.js
 *
 * Required in .env.local:
 *   MONGODB_URI=...
 *   ZEPTOMAIL_TOKEN=Zoho-enczapikey <your_token>
 *   EMAIL_FROM=...
 *
 * Optional in .env.local:
 *   SITE_URL=https://innovationhacks.dev  (defaults to that value)
 */

require('dotenv').config({ path: '.env.local' });

const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const QRCode = require('qrcode');
const { SendMailClient } = require('zeptomail');

// ─── Env validation ──────────────────────────────────────────────────────────

const REQUIRED_ENV = ['MONGODB_URI', 'ZEPTOMAIL_TOKEN', 'EMAIL_FROM'];
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.error(`Missing required env var: ${key}`);
    process.exit(1);
  }
}

// ─── Registration schema (inline) ────────────────────────────────────────────

const registrationSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  school: String,
  status: String,
  checkin_token: String,
  email_sent: Boolean,
});

const Registration =
  mongoose.models?.Registration ||
  mongoose.model('Registration', registrationSchema);

// ─── Template helpers ─────────────────────────────────────────────────────────

const TEMPLATE_PATH = path.join(
  __dirname,
  '../emails/Hackathon Check-in registration.html'
);

function buildHtml(template, { firstName, fullName, school, tokenLabel }) {
  return template
    // Greeting line: "Hey Gunbir, you're in. 🎉"
    .replace(
      `Hey Gunbir, you're in. 🎉`,
      `Hey ${firstName}, you're in. 🎉`
    )
    // Full name — two occurrences (greeting line + registration table)
    .replace(/Gunbir Singh/g, fullName)
    // School name
    .replace(/Arizona State University/g, school)
    // QR <img> src — replace external URL with CID reference (inline attachment)
    .replace(
      /https:\/\/api\.qrserver\.com\/v1\/create-qr-code\/\?[^"]+/,
      'cid:checkin-qr'
    )
    // Text display label
    .replace(/IH2026-GUNBIR-A3F9B2C1/g, tokenLabel);
}

// ─── Per-registration processor ──────────────────────────────────────────────

const client = new SendMailClient({
  url: 'api.zeptomail.com/',
  token: process.env.ZEPTOMAIL_TOKEN,
});
const SITE_URL = process.env.SITE_URL || 'https://innovationhacks.dev';

async function processRegistration(reg, template) {
  const fullName = `${reg.firstName} ${reg.lastName}`;

  try {
    // 1. Use existing token if present, otherwise generate a new 256-char hex token
    const token = reg.checkin_token || crypto.randomBytes(128).toString('hex');

    // 2. Build check-in URL
    const url = `${SITE_URL}/api/admin/checkin/${token}`;

    // 3. Generate QR code as PNG buffer
    const buffer = await QRCode.toBuffer(url, {
      width: 180,
      margin: 1,
      color: {
        dark: '#0a0614',
        light: '#ffffff',
      },
    });

    // 4. Token display label: first 16 chars + ellipsis
    const tokenLabel = `${token.slice(0, 16)}…`;

    // 5. Build HTML (QR src replaced with cid:checkin-qr)
    const html = buildHtml(template, {
      firstName: reg.firstName,
      fullName,
      school: reg.school,
      tokenLabel,
    });

    // 6. Send email via Zeptomail with QR as inline CID image
    const resp = await client.sendMail({
      from: { address: process.env.EMAIL_FROM },
      to: [{ email_address: { address: reg.email } }],
      subject: "You're in — Innovation Hacks 2.0 Check-in QR 🚀",
      htmlbody: html,
      inline_images: [
        {
          cid: 'checkin-qr',
          content: buffer.toString('base64'),
          mime_type: 'image/png',
        },
      ],
    });

    // 8. Update DB on success
    await Registration.updateOne(
      { _id: reg._id },
      { $set: { checkin_token: token, email_sent: true, status: 'accepted' } }
    );

    console.log(`✓ Sent to ${fullName} <${reg.email}> (request_id: ${resp?.request_id ?? 'n/a'})`);
    return { success: true };
  } catch (err) {
    console.error(`✗ Failed for ${fullName} <${reg.email}>:`, err.message || err);
    return { success: false };
  }
}

// ─── CLI args ─────────────────────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);
  if (args.includes('--all')) return { mode: 'all' };
  const emailIdx = args.indexOf('--email');
  if (emailIdx !== -1 && args[emailIdx + 1]) return { mode: 'single', email: args[emailIdx + 1] };
  console.error('Usage:');
  console.error('  node scripts/send_emails.js --all');
  console.error('  node scripts/send_emails.js --email <address>');
  process.exit(1);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const { mode, email } = parseArgs();

  console.log('Connecting to MongoDB…');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected.');

  const query = mode === 'single'
    ? { email: email.toLowerCase() }
    : { email_sent: { $ne: true } };

  const registrations = await Registration.find(query).lean();

  if (registrations.length === 0) {
    const msg = mode === 'single'
      ? `No pending registration found for ${email} (already sent or doesn't exist).`
      : 'No pending registrations found. All emails already sent.';
    console.log(msg);
    await mongoose.disconnect();
    return;
  }

  console.log(`Found ${registrations.length} registration(s) to process.`);

  // Read template once
  const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');

  // Process in batches of 3
  const BATCH_SIZE = 3;
  let sent = 0;
  let failed = 0;

  for (let i = 0; i < registrations.length; i += BATCH_SIZE) {
    const batch = registrations.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(
      batch.map((reg) => processRegistration(reg, template))
    );
    for (const result of results) {
      if (result.success) {
        sent++;
      } else {
        failed++;
      }
    }
    console.log(
      `Progress: ${Math.min(i + BATCH_SIZE, registrations.length)}/${registrations.length}`
    );
    await new Promise(resolve => setTimeout(resolve, 1000)); // brief pause to avoid overwhelming the email service
  }

  console.log(`\nDone. ${sent} email(s) sent, ${failed} failed.`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
