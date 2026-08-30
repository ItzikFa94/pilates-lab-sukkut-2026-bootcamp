# PILATES LAB — Landing Page + Wix Contacts Tracking

## What's in this folder
- `index.html` + `img/` — the landing page (static, mobile-first, RTL)
- `netlify/functions/create-lead.js` — serverless function that creates a Wix Contact
- `netlify.toml` — tells Netlify where the function lives

## How it works
1. Someone fills in name/phone (optional) and taps a WhatsApp button.
2. The page opens WhatsApp immediately (nothing blocks that).
3. In the background, it also calls `create-lead`, which creates a Contact in your
   Wix site's backoffice (Contacts list) — so you can see who's interested,
   even before they reply on WhatsApp.

## One-time setup (10 minutes)

### 1. Generate a Wix API key
1. Go to https://manage.wix.com/account/api-keys
2. Create a new key. Under **Sites**, restrict it to this site only ("My Site" /
   `05a78d41-5935-41e6-8047-14be12965623`) — don't give it account-wide access.
3. Under **Permissions**, give it **Manage Contacts** only.
4. Copy the key — you won't see it again after closing the dialog.

### 2. Deploy to Netlify
1. Go to https://app.netlify.com → **Add new site** → **Deploy manually**
2. Drag this whole folder (or the zip) onto the upload area.
3. Once it's live, go to **Site settings → Environment variables** and add:
   - `WIX_API_KEY` = the key you copied above
   - `WIX_SITE_ID` = `05a78d41-5935-41e6-8047-14be12965623` (already the default, but explicit is safer)
4. Redeploy (Netlify does this automatically after saving env vars, or trigger it manually).

### 3. Point your domain (optional)
Netlify gives you a `*.netlify.app` URL immediately. To use your own domain,
add it under **Domain settings** and follow Netlify's DNS instructions.

## Checking it worked
Fill in a test name/phone on the page, tap a WhatsApp button, then check
your Wix site's **Contacts** list (Dashboard → Contacts) — a new contact
should appear within a few seconds, tagged with a note about which
package they were interested in.

## Notes
- Name and phone are **optional** on the page — someone can still just tap
  WhatsApp with no fields filled, exactly as before. Nothing here adds a
  "registration" step; it's just two extra optional inputs before the
  same WhatsApp button.
- If the Wix API call ever fails (bad key, rate limit, etc.), it fails
  silently — it will never block or delay opening WhatsApp for the visitor.
