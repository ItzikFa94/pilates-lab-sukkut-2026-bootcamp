// Creates a Wix Contact (CRM) so bootcamp leads show up in the Wix backoffice.
// The Wix API key lives ONLY here, as an env var — never in the page's HTML/JS.
//
// Required environment variables (set in Netlify → Site settings → Environment variables):
//   WIX_API_KEY  — from https://manage.wix.com/account/api-keys
//   WIX_SITE_ID  — 05a78d41-5935-41e6-8047-14be12965623 (PILATES LAB / my-site)

const WIX_SITE_ID = process.env.WIX_SITE_ID || '05a78d41-5935-41e6-8047-14be12965623';

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const apiKey = process.env.WIX_API_KEY;
  if (!apiKey) {
    console.error('Missing WIX_API_KEY env var');
    // Fail soft — never block the visitor's WhatsApp flow because of a server misconfig.
    return { statusCode: 200, body: JSON.stringify({ ok: false, reason: 'not_configured' }) };
  }

  let data;
  try {
    data = JSON.parse(event.body || '{}');
  } catch (e) {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  const { name = '', phone = '', note = '' } = data;
  const [first, ...rest] = String(name).trim().split(/\s+/);
  const last = rest.join(' ');

  if (!first && !phone) {
    return { statusCode: 200, body: JSON.stringify({ ok: false, reason: 'no_identifying_info' }) };
  }

  const contactBody = {
    contact: {
      name: first ? { first, ...(last ? { last } : {}) } : undefined,
      phone: phone ? { tag: 'MOBILE', phone } : undefined,
    },
    allowDuplicates: true,
  };

  try {
    const res = await fetch('https://www.wixapis.com/contacts/v5/contacts', {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'wix-site-id': WIX_SITE_ID,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contactBody),
    });

    const result = await res.json();

    if (!res.ok) {
      console.error('Wix Contacts API error', res.status, result);
      return { statusCode: 200, body: JSON.stringify({ ok: false, reason: 'wix_api_error' }) };
    }

    // Best-effort: attach the note (which days / which package) as an extended field
    // via a follow-up call is possible, but kept out for simplicity — the contact's
    // presence + timestamp is usually enough for tracking bootcamp signups manually.

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, contactId: result.contact && result.contact.id }),
    };
  } catch (err) {
    console.error('create-lead function failed', err);
    return { statusCode: 200, body: JSON.stringify({ ok: false, reason: 'exception' }) };
  }
};
