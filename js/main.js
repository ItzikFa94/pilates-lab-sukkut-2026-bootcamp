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

// Testimonial previews
document.querySelectorAll('.testimonial-toggle').forEach(button => {
  const testimonial = document.getElementById(button.getAttribute('aria-controls'));
  if (!testimonial) return;

  button.addEventListener('click', () => {
    const isExpanded = testimonial.classList.toggle('is-expanded');
    button.setAttribute('aria-expanded', String(isExpanded));
    button.textContent = isExpanded ? 'להצגת פחות' : 'לקריאה מלאה';
  });
});

// Testimonial carousel controls are added only once there is more than one quote.
const testimonialCarousel = document.querySelector('.testimonial-carousel');
if (testimonialCarousel) {
  const testimonialCards = Array.from(testimonialCarousel.querySelectorAll('.testimonial-card'));
  const testimonialNavigation = testimonialCarousel.parentElement.querySelector('.testimonial-navigation');

  if (testimonialCards.length > 1 && testimonialNavigation) {
    let activeTestimonial = 0;
    let scrollFrame;
    const prev = document.createElement('button');
    const next = document.createElement('button');
    const dots = document.createElement('div');
    const dotButtons = testimonialCards.map((card, index) => {
      const dot = document.createElement('button');
      dot.className = 'testimonial-dot';
      dot.type = 'button';
      dot.setAttribute('aria-label', `המלצה ${index + 1}`);
      dot.addEventListener('click', () => scrollToTestimonial(index));
      dots.append(dot);
      return dot;
    });

    prev.className = 'carousel-arrow';
    prev.type = 'button';
    prev.textContent = '→';
    prev.setAttribute('aria-label', 'להמלצה הקודמת');
    next.className = 'carousel-arrow';
    next.type = 'button';
    next.textContent = '←';
    next.setAttribute('aria-label', 'להמלצה הבאה');
    dots.className = 'testimonial-dots';
    testimonialNavigation.append(prev, dots, next);
    testimonialNavigation.hidden = false;

    function setActiveTestimonial(index) {
      activeTestimonial = Math.max(0, Math.min(index, testimonialCards.length - 1));
      dotButtons.forEach((dot, dotIndex) => {
        dot.classList.toggle('is-active', dotIndex === activeTestimonial);
        dot.setAttribute('aria-current', dotIndex === activeTestimonial ? 'true' : 'false');
      });
      prev.disabled = activeTestimonial === 0;
      next.disabled = activeTestimonial === testimonialCards.length - 1;
    }

    function scrollToTestimonial(index) {
      setActiveTestimonial(index);
      testimonialCards[activeTestimonial].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    }

    function closestTestimonialIndex() {
      const carouselRect = testimonialCarousel.getBoundingClientRect();
      const carouselCenter = carouselRect.left + carouselRect.width / 2;
      return testimonialCards.reduce((closestIndex, card, index) => {
        const cardRect = card.getBoundingClientRect();
        const closestRect = testimonialCards[closestIndex].getBoundingClientRect();
        const distance = Math.abs(cardRect.left + cardRect.width / 2 - carouselCenter);
        const closestDistance = Math.abs(closestRect.left + closestRect.width / 2 - carouselCenter);
        return distance < closestDistance ? index : closestIndex;
      }, 0);
    }

    prev.addEventListener('click', () => scrollToTestimonial(activeTestimonial - 1));
    next.addEventListener('click', () => scrollToTestimonial(activeTestimonial + 1));
    testimonialCarousel.addEventListener('scroll', () => {
      cancelAnimationFrame(scrollFrame);
      scrollFrame = requestAnimationFrame(() => setActiveTestimonial(closestTestimonialIndex()));
    }, { passive: true });
    setActiveTestimonial(0);
  }
}

// ========== DAY CAROUSEL ==========
const dayCarousel = document.querySelector('.days-carousel');
if (dayCarousel) {
  const dayCards = Array.from(dayCarousel.querySelectorAll('.day-card'));
  const dayDots = Array.from(document.querySelectorAll('.carousel-dot'));
  const dayPrev = document.getElementById('dayPrev');
  const dayNext = document.getElementById('dayNext');
  let activeDay = 0;
  let scrollFrame;

  function setActiveDay(index) {
    activeDay = Math.max(0, Math.min(index, dayCards.length - 1));
    dayDots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === activeDay);
      dot.setAttribute('aria-current', dotIndex === activeDay ? 'true' : 'false');
    });
    dayPrev.disabled = activeDay === 0;
    dayNext.disabled = activeDay === dayCards.length - 1;
  }

  function scrollToDay(index) {
    setActiveDay(index);
    dayCards[activeDay].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
  }

  function closestDayIndex() {
    const carouselRect = dayCarousel.getBoundingClientRect();
    const carouselCenter = carouselRect.left + carouselRect.width / 2;
    return dayCards.reduce((closestIndex, card, index) => {
      const cardRect = card.getBoundingClientRect();
      const distance = Math.abs(cardRect.left + cardRect.width / 2 - carouselCenter);
      const closestRect = dayCards[closestIndex].getBoundingClientRect();
      const closestDistance = Math.abs(closestRect.left + closestRect.width / 2 - carouselCenter);
      return distance < closestDistance ? index : closestIndex;
    }, 0);
  }

  dayPrev.addEventListener('click', () => scrollToDay(activeDay - 1));
  dayNext.addEventListener('click', () => scrollToDay(activeDay + 1));
  dayDots.forEach((dot, index) => dot.addEventListener('click', () => scrollToDay(index)));
  dayCarousel.addEventListener('scroll', () => {
    cancelAnimationFrame(scrollFrame);
    scrollFrame = requestAnimationFrame(() => setActiveDay(closestDayIndex()));
  }, { passive: true });
  setActiveDay(0);
}

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

function isValidPhoneNumber(value) {
  const normalized = value.trim().replace(/[\s().-]/g, '');
  if (!normalized) return false;

  // Accept an international number with a + country code, or an Israeli mobile
  // number with or without its leading zero (for example 0502121876 / 502121876).
  if (/^\+\d{8,15}$/.test(normalized)) return true;
  if (!/^\d+$/.test(normalized)) return false;
  return /^(?:(?:00)?972)?0?5\d{8}$/.test(normalized);
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
  const hasName = oneDayNameEl.value.trim().length > 0;
  const hasPhone = isValidPhoneNumber(oneDayPhoneEl.value);
  totalEl.textContent = total.toLocaleString('he-IL') + ' ₪';
  originalTotalEl.classList.toggle('is-hidden', selected.length !== checks.length);

  if (!userEditedMsg) {
    msgEl.value = buildMessage(selected, oneDayNameEl.value);
  }

  if (selected.length === 0 || !hasName || !hasPhone) {
    btnEl.setAttribute('disabled', 'true');
    btnEl.setAttribute('aria-disabled', 'true');
    btnEl.href = '#';
  } else {
    btnEl.removeAttribute('disabled');
    btnEl.setAttribute('aria-disabled', 'false');
    btnEl.href = 'https://wa.me/972523166617?text=' + encodeURIComponent(
      msgEl.value || buildMessage(selected, oneDayNameEl.value)
    );
  }
}

checks.forEach(c => c.addEventListener('change', () => {
  userEditedMsg = false; // regenerate base message when selection changes
  refresh();
}));
[oneDayNameEl, oneDayPhoneEl].forEach(field => {
  ['input', 'change', 'blur'].forEach(eventName => field.addEventListener(eventName, refresh));
});

btnEl.addEventListener('click', (e) => {
  refresh(); // Covers browsers that populate the fields through autofill without an input event.
  const selected = checks.filter(c => c.checked);
  if (btnEl.hasAttribute('disabled') || selected.length === 0) {
    e.preventDefault();
  }
});

refresh();
window.addEventListener('pageshow', refresh);
window.setTimeout(refresh, 300);

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
