// FAQ accordion toggle
document.querySelectorAll('.faq-item').forEach(item => {
  const q = item.querySelector('.faq-q');
  const a = item.querySelector('.faq-a');
  q.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(o => {
      o.classList.remove('open');
      o.querySelector('.faq-a').style.maxHeight = null;
    });
    if (!isOpen) {
      item.classList.add('open');
      a.style.maxHeight = a.scrollHeight + 'px';
    }
  });
});

// ========== ONE-DAY INTERACTIVE PICKER ==========
const checks = Array.from(document.querySelectorAll('.day-check'));
const totalEl = document.getElementById('pickerTotal');
const nudgeEl = document.getElementById('pickerNudge');
const msgEl = document.getElementById('msgPreview');
const btnEl = document.getElementById('oneDayBtn');
const PRICE_PER_DAY = 400;
let userEditedMsg = false;

msgEl.addEventListener('input', () => { userEditedMsg = true; });

function buildMessage(selected) {
  if (selected.length === 0) return '';
  const lines = selected.map(c => '• ' + c.dataset.label);
  return 'היי, מתעניינת בהרשמה לבוטקאמפ ל-' + selected.length + ' ימים:\n' +
    lines.join('\n') +
    '\n\nסה״כ: ' + (selected.length * PRICE_PER_DAY) + ' ₪';
}

function refresh() {
  const selected = checks.filter(c => c.checked);
  const total = selected.length * PRICE_PER_DAY;
  totalEl.textContent = total.toLocaleString('he-IL') + ' ₪';
  nudgeEl.classList.toggle('show', selected.length === 4);

  if (!userEditedMsg) {
    msgEl.value = buildMessage(selected);
  }

  if (selected.length === 0) {
    btnEl.setAttribute('disabled', 'true');
    btnEl.href = '#';
  } else {
    btnEl.removeAttribute('disabled');
  }
}

checks.forEach(c => c.addEventListener('change', () => {
  userEditedMsg = false; // regenerate base message when selection changes
  refresh();
}));

btnEl.addEventListener('click', (e) => {
  const selected = checks.filter(c => c.checked);
  if (selected.length === 0) { e.preventDefault(); return; }
  const text = encodeURIComponent(msgEl.value || buildMessage(selected));
  btnEl.href = 'https://wa.me/972523166617?text=' + text;
});

refresh();

// ========== LEAD CAPTURE ==========
// Fire a background call to Netlify function, never blocks WhatsApp
function sendLead(name, phone, note) {
  if (!name && !phone) return; // nothing to save, skip silently
  try {
    fetch('/.netlify/functions/create-lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, note }),
      keepalive: true,
    }).catch(() => {});
  } catch (e) { /* never block the user's flow on a tracking failure */ }
}

// Full bootcamp button
const fullBtn = document.getElementById('fullBtn');
fullBtn.addEventListener('click', () => {
  const name = document.getElementById('fbName').value.trim();
  const phone = document.getElementById('fbPhone').value.trim();
  sendLead(name, phone, 'FULL BOOTCAMP');
});

// One-day button
btnEl.addEventListener('click', () => {
  const name = document.getElementById('odName').value.trim();
  const phone = document.getElementById('odPhone').value.trim();
  const selected = checks.filter(c => c.checked).map(c => c.dataset.label).join(' | ');
  sendLead(name, phone, 'ONE DAY: ' + selected);
});

function initLeadGate(nameId, phoneId, btnId, waHref) {
  const nameInput = document.getElementById(nameId);
  const phoneInput = document.getElementById(phoneId);
  const btn = document.getElementById(btnId);
  const nameError = document.getElementById(nameId + 'Error');
  const phoneError = document.getElementById(phoneId + 'Error');

  function checkName(showError) {
    const value = nameInput.value.trim();
    const ok = value.length > 1;
    if (showError) {
      nameInput.classList.toggle('invalid', !ok);
      nameError.textContent = ok ? '' : 'נא להזין שם מלא';
      nameError.classList.toggle('visible', !ok);
    }
    return ok;
  }

  function checkPhone(showError) {
    const digits = phoneInput.value.trim().replace(/\D/g, '');
    const ok = digits.length >= 9 && digits.length <= 10;
    if (showError) {
      phoneInput.classList.toggle('invalid', !ok);
      phoneError.textContent = ok ? '' : 'נא להזין מספר טלפון תקין';
      phoneError.classList.toggle('visible', !ok);
    }
    return ok;
  }

  function validate(showErrors) {
    const nameOk = checkName(showErrors);
    const phoneOk = checkPhone(showErrors);
    btn.disabled = !(nameOk && phoneOk);
    return nameOk && phoneOk;
  }

  // Show error only after the user leaves the field (not while typing the first char)
  nameInput.addEventListener('blur', () => checkName(true));
  phoneInput.addEventListener('blur', () => checkPhone(true));

  // Clear/update errors live once the user starts correcting them
  nameInput.addEventListener('input', () => {
    if (nameInput.classList.contains('invalid')) checkName(true);
    validate(false);
  });
  phoneInput.addEventListener('input', () => {
    if (phoneInput.classList.contains('invalid')) checkPhone(true);
    validate(false);
  });

  btn.addEventListener('click', () => {
    if (btn.disabled) return;
    window.open(waHref, '_blank', 'noopener');
  });

  validate(false); // set initial disabled state without showing errors on load
}

initLeadGate(
  'fbName',
  'fbPhone',
  'fullBtn',
  'https://wa.me/972523166617?text=%D7%94%D7%99%D7%99%2C%20%D7%9E%D7%AA%D7%A2%D7%A0%D7%99%D7%99%D7%A0%D7%AA%20%D7%91%D7%94%D7%A8%D7%A9%D7%9E%D7%94%20%D7%9C%D7%90%D7%A8%D7%91%D7%A2%D7%AA%20%D7%99%D7%9E%D7%99%20%D7%94%D7%91%D7%95%D7%98%D7%A7%D7%90%D7%9E%D7%A4%20%D7%94%D7%9E%D7%9C%D7%90%20(28.09%E2%80%9301.10)'
);