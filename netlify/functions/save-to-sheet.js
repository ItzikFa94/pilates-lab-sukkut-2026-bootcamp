// Appends ONE DAY signups to a Google Sheet so they're tracked alongside Wix Contacts.
// The service account key lives ONLY here, as env vars — never in the page's HTML/JS.
//
// Required environment variables (set in Netlify → Site settings → Environment variables):
//   GOOGLE_SERVICE_ACCOUNT_EMAIL — from the service account's JSON key ("client_email")
//   GOOGLE_PRIVATE_KEY           — from the service account's JSON key ("private_key")
//
// The target spreadsheet must be shared with that service account email as an Editor.

const crypto = require('crypto');

const SHEET_ID = process.env.GOOGLE_SHEET_ID || '1OlRr2zQVmjKneG8ravpy0llaNswy_kfeNGgZCzCcOws';
const SHEET_RANGE = process.env.GOOGLE_SHEET_RANGE || 'Sheet1!A:D';

function base64url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

async function getAccessToken() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
  if (!email || !privateKey) return null;

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claim = {
    iss: email,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  };
  const unsigned = base64url(JSON.stringify(header)) + '.' + base64url(JSON.stringify(claim));

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(unsigned);
  signer.end();
  const signature = signer
    .sign(privateKey)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  const jwt = unsigned + '.' + signature;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:
      'grant_type=' + encodeURIComponent('urn:ietf:params:oauth:grant-type:jwt-bearer') +
      '&assertion=' + encodeURIComponent(jwt),
  });
  const data = await res.json();
  if (!res.ok) {
    console.error('Google token error', res.status, data);
    return null;
  }
  return data.access_token;
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let data;
  try {
    data = JSON.parse(event.body || '{}');
  } catch (e) {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  const { name = '', phone = '', note = '' } = data;
  if (!name && !phone) {
    return { statusCode: 200, body: JSON.stringify({ ok: false, reason: 'no_identifying_info' }) };
  }

  try {
    const token = await getAccessToken();
    if (!token) {
      console.error('Missing GOOGLE_SERVICE_ACCOUNT_EMAIL / GOOGLE_PRIVATE_KEY env vars');
      // Fail soft — never block the visitor's WhatsApp flow because of a server misconfig.
      return { statusCode: 200, body: JSON.stringify({ ok: false, reason: 'not_configured' }) };
    }

    const row = [new Date().toISOString(), name, phone, note];
    const url =
      `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/` +
      `${encodeURIComponent(SHEET_RANGE)}:append?valueInputOption=USER_ENTERED`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values: [row] }),
    });

    const result = await res.json();
    if (!res.ok) {
      console.error('Sheets API error', res.status, result);
      return { statusCode: 200, body: JSON.stringify({ ok: false, reason: 'sheets_api_error' }) };
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    console.error('save-to-sheet function failed', err);
    return { statusCode: 200, body: JSON.stringify({ ok: false, reason: 'exception' }) };
  }
};
