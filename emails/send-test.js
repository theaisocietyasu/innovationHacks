/**
 * Test email sender — sends a single registration confirmation to one address.
 * Usage: node emails/send-test.js
 *
 * Required in .env.local:
 *   MONGODB_URI=...
 *   ZOHO_EMAIL=help@innovationhacks.dev   (or whichever Zoho account you use)
 *   ZOHO_APP_PASSWORD=...
 */

require('dotenv').config({ path: '.env.local' });

const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// ─── Config ──────────────────────────────────────────────────────────────────

const TEST_EMAIL = 'gsing136@asu.edu';

const REQUIRED_ENV = ['MONGODB_URI', 'ZOHO_EMAIL', 'ZOHO_APP_PASSWORD'];
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.error(`Missing env var: ${key}`);
    process.exit(1);
  }
}

// ─── Registration schema (inline, no TS needed) ──────────────────────────────

const registrationSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  school: String,
  status: String,
});

const Registration =
  mongoose.models?.Registration ||
  mongoose.model('Registration', registrationSchema);

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateCheckinId(firstName, lastName, mongoId) {
  // Short deterministic ID: IH2026-FIRSTNAME-<last 8 chars of mongo _id>
  const namePart = firstName.toUpperCase().slice(0, 8);
  const idPart = mongoId.toString().slice(-8).toUpperCase();
  return `IH2026-${namePart}-${idPart}`;
}

function buildHtml(template, { firstName, fullName, school, checkinId }) {
  return template
    .replace(/Hey Gunbir,/g, `Hey ${firstName},`)
    .replace(/Gunbir Singh/g, fullName)
    .replace(/Arizona State University/g, school)
    .replace(/IH2026-GUNBIR-A3F9B2C1/g, checkinId)
    .replace(
      /data=IH2026-GUNBIR-A3F9B2C1/g,
      `data=${encodeURIComponent(checkinId)}`
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Connecting to MongoDB…');
  await mongoose.connect(process.env.MONGODB_URI);

  const reg = await Registration.findOne({
    email: TEST_EMAIL.toLowerCase(),
  }).lean();

  if (!reg) {
    console.error(`No registration found for ${TEST_EMAIL}`);
    process.exit(1);
  }

  console.log(`Found registration: ${reg.firstName} ${reg.lastName} (${reg.status})`);

  const checkinId = generateCheckinId(reg.firstName, reg.lastName, reg._id);
  const templatePath = path.join(__dirname, 'Hackathon Check-in registration.html');
  const template = fs.readFileSync(templatePath, 'utf8');

  const html = buildHtml(template, {
    firstName: reg.firstName,
    fullName: `${reg.firstName} ${reg.lastName}`,
    school: reg.school,
    checkinId,
  });

  console.log(`Check-in ID: ${checkinId}`);

  const transporter = nodemailer.createTransport({
    host: 'smtp.zoho.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.ZOHO_EMAIL,
      pass: process.env.ZOHO_APP_PASSWORD,
    },
  });

  console.log('Sending email…');
  const info = await transporter.sendMail({
    from: `"Innovation Hacks 2.0" <${process.env.ZOHO_EMAIL}>`,
    to: TEST_EMAIL,
    subject: "You're in — Innovation Hacks 2.0 Check-in QR 🚀",
    html,
  });

  console.log(`Done! Message ID: ${info.messageId}`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
