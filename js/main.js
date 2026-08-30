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
