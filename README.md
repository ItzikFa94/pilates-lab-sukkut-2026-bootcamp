# PILATES LAB — Landing Page + Google Sheets Lead Tracking

## What's in this folder

- `index.html` + `img/` — the static, mobile-first RTL landing page.
- `netlify/functions/save-to-sheet.js` — the serverless function that appends every
  completed pricing enquiry to Google Sheets.
- `netlify.toml` — tells Netlify where the function lives.

## What gets saved

After a visitor enters a valid name and phone number and opens WhatsApp from either
pricing option, the page saves a row to this [Google Sheet](https://docs.google.com/spreadsheets/d/1OlRr2zQVmjKneG8ravpy0llaNswy_kfeNGgZCzCcOws/edit?gid=0#gid=0):

1. Timestamp
2. Name
3. Phone
4. Interest — either the full bootcamp or the exact selected days

WhatsApp remains immediate: a sheet failure never prevents the visitor from opening it.

## One-time setup

1. In [Google Cloud Console](https://console.cloud.google.com/), create or use a
   project, enable the Google Sheets API, and create a service account.
2. Create a JSON key for the service account. Copy its `client_email` and
   `private_key` values.
3. Share the target Google Sheet with the service-account `client_email` as an
   **Editor**.
4. Deploy the site to Netlify. In **Site settings → Environment variables**, add:
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL` — the JSON key's `client_email`.
   - `GOOGLE_PRIVATE_KEY` — the JSON key's `private_key`, including its line breaks.
5. Redeploy, then submit a test lead from the deployed site and confirm that a row
   appears in the sheet.

The default target is `Sheet1!A:D`. If the destination tab has another name, set
`GOOGLE_SHEET_RANGE` in Netlify, for example `Leads!A:D`.

## Local testing

A `file://` preview cannot execute Netlify functions. Test lead tracking on the
deployed Netlify URL or run the project with `netlify dev`.
