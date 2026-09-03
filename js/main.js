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

// ========== DAY SELECTION + PRICING ==========
const checks = Array.from(document.querySelectorAll('.day-check'));
const totalEl = document.getElementById('pickerTotal');
const originalTotalEl = document.getElementById('pickerOriginal');
const msgEl = document.getElementById('msgPreview');
const btnEl = document.getElementById('oneDayBtn');
const oneDayNameEl = document.getElementById('odName');
const oneDayPhoneEl = document.getElementById('odPhone');
const PRICE_PER_DAY = 400;
const FULL_BOOTCAMP_PRICE = 1400;
let userEditedMsg = false;

msgEl.addEventListener('input', () => { userEditedMsg = true; });

function totalFor(selected) {
  return selected.length === checks.length
    ? FULL_BOOTCAMP_PRICE
    : selected.length * PRICE_PER_DAY;
}

function buildMessage(selected, name = '') {
  if (selected.length === 0) return '';
  const lines = selected.map(c => '• ' + c.dataset.label);
  const greeting = name.trim()
    ? 'היי, אני ' + name.trim() + ', מתעניינת בהרשמה '
    : 'היי, מתעניינת בהרשמה ';
  const selectionLabel = selected.length === checks.length
    ? 'למסלול המלא (4 ימים)'
    : 'לבוטקאמפ ל-' + selected.length + ' ימים';
  return greeting + selectionLabel + ':\n' +
    lines.join('\n') +
    '\n\nסה״כ: ' + totalFor(selected) + ' ₪';
}

function refresh() {
  const selected = checks.filter(c => c.checked);
  const total = totalFor(selected);
  const hasName = oneDayNameEl.value.trim().length > 1;
  const phoneDigits = oneDayPhoneEl.value.trim().replace(/\D/g, '');
  const hasPhone = phoneDigits.length >= 9 && phoneDigits.length <= 10;
  totalEl.textContent = total.toLocaleString('he-IL') + ' ₪';
  originalTotalEl.classList.toggle('is-hidden', selected.length !== checks.length);

  if (!userEditedMsg) {
    msgEl.value = buildMessage(selected, oneDayNameEl.value);
  }

  if (selected.length === 0 || !hasName || !hasPhone) {
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
oneDayNameEl.addEventListener('input', refresh);
oneDayPhoneEl.addEventListener('input', refresh);

btnEl.addEventListener('click', (e) => {
  const selected = checks.filter(c => c.checked);
  if (btnEl.hasAttribute('disabled') || selected.length === 0) {
    e.preventDefault();
    return;
  }
  const text = encodeURIComponent(msgEl.value || buildMessage(selected, oneDayNameEl.value));
  btnEl.href = 'https://wa.me/972523166617?text=' + text;
});

refresh();

// Fire a background call to append a row to the Google Sheet, never blocks WhatsApp.
function saveToSheet(name, phone, selectedDays) {
  if (!name && !phone) return; // nothing to save, skip silently
  try {
    fetch('/.netlify/functions/save-to-sheet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, selectedDays }),
      keepalive: true,
    }).catch(() => {});
  } catch (e) { /* never block the user's flow on a tracking failure */ }
}

// Save the selected days when WhatsApp opens.
btnEl.addEventListener('click', () => {
  if (btnEl.hasAttribute('disabled')) return;
  const name = document.getElementById('odName').value.trim();
  const phone = document.getElementById('odPhone').value.trim();
  const selectedDays = checks.filter(c => c.checked).map(c => c.dataset.day);
  saveToSheet(name, phone, selectedDays);
});
