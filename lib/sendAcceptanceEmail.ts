/**
 * Sends the check-in QR code acceptance email to a single participant.
 *
 * Requires env vars: ZEPTOMAIL_TOKEN, EMAIL_FROM
 * Optional env var:  SITE_URL (defaults to https://innovationhacks.dev)
 */

import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import QRCode from 'qrcode';
import { SendMailClient } from 'zeptomail';

const SITE_URL = process.env.SITE_URL || 'https://innovationhacks.dev';
const TEMPLATE_PATH = path.join(
  process.cwd(),
  'emails',
  'Hackathon Check-in registration.html',
);

function buildHtml(
  template: string,
  opts: { firstName: string; fullName: string; school: string; tokenLabel: string },
) {
  return template
    .replace(`Hey Gunbir, you're in. 🎉`, `Hey ${opts.firstName}, you're in. 🎉`)
    .replace(/Gunbir Singh/g, opts.fullName)
    .replace(/Arizona State University/g, opts.school)
    .replace(
      /https:\/\/api\.qrserver\.com\/v1\/create-qr-code\/\?[^"]+/,
      'cid:checkin-qr',
    )
    .replace(/IH2026-GUNBIR-A3F9B2C1/g, opts.tokenLabel);
}

export interface AcceptanceEmailResult {
  success: boolean;
  token?: string;
}

export async function sendAcceptanceEmail(registration: {
  _id: unknown;
  firstName: string;
  lastName: string;
  email: string;
  school: string;
  checkin_token?: string;
}): Promise<AcceptanceEmailResult> {
  const { firstName, lastName, email, school, checkin_token } = registration;
  const fullName = `${firstName} ${lastName}`;

  try {
    const token = checkin_token || crypto.randomBytes(128).toString('hex');
    const url = `${SITE_URL}/api/admin/checkin/${token}`;

    const qrBuffer = await QRCode.toBuffer(url, {
      width: 180,
      margin: 1,
      color: { dark: '#0a0614', light: '#ffffff' },
    });

    const tokenLabel = `${token.slice(0, 16)}…`;
    const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');
    const html = buildHtml(template, { firstName, fullName, school, tokenLabel });

    const client = new SendMailClient({
      url: 'api.zeptomail.com/',
      token: process.env.ZEPTOMAIL_TOKEN!,
    });

    await client.sendMail({
      from: { address: process.env.EMAIL_FROM!, name: 'Innovation Hacks' },
      to: [{ email_address: { address: email, name: fullName } }],
      subject: "You're in — Innovation Hacks 2.0 Check-in QR 🚀",
      htmlbody: html,
      inline_images: [
        {
          cid: 'checkin-qr',
          content: qrBuffer.toString('base64'),
          mime_type: 'image/png',
        },
      ],
    });

    return { success: true, token };
  } catch (err) {
    console.error(`[sendAcceptanceEmail] Failed for ${fullName} <${email}>:`, err);
    return { success: false };
  }
}
