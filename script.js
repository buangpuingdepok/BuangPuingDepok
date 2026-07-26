// ============ MOBILE MENU ============
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('is-open');
  navToggle.setAttribute('aria-expanded', isOpen);
  navToggle.innerHTML = isOpen
    ? '<svg class="icon"><use href="#i-close"/></svg>'
    : '<svg class="icon"><use href="#i-menu"/></svg>';
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', false);
    navToggle.innerHTML = '<svg class="icon"><use href="#i-menu"/></svg>';
  });
});

// ============ SCROLL REVEAL ============
const revealEls = document.querySelectorAll('.reveal');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (reduceMotion) {
  revealEls.forEach(el => el.classList.add('is-visible'));
} else {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  revealEls.forEach(el => observer.observe(el));
}

// ============ BEFORE / AFTER SLIDER ============
const compare = document.getElementById('compareSlider');
const handle = document.getElementById('compareHandle');
const beforeScene = compare.querySelector('.compare__scene--before');

function setSliderPosition(percent) {
  const clamped = Math.min(96, Math.max(4, percent));
  beforeScene.style.clipPath = `inset(0 ${100 - clamped}% 0 0)`;
  handle.style.left = `${clamped}%`;
  handle.setAttribute('aria-valuenow', Math.round(clamped));
}

function positionFromEvent(clientX) {
  const rect = compare.getBoundingClientRect();
  const percent = ((clientX - rect.left) / rect.width) * 100;
  setSliderPosition(percent);
}

let dragging = false;

handle.addEventListener('pointerdown', (e) => {
  dragging = true;
  handle.setPointerCapture(e.pointerId);
});

compare.addEventListener('pointermove', (e) => {
  if (!dragging) return;
  positionFromEvent(e.clientX);
});

handle.addEventListener('pointerup', () => { dragging = false; });
handle.addEventListener('pointercancel', () => { dragging = false; });

// Click anywhere on the compare area to jump the slider
compare.addEventListener('click', (e) => {
  if (e.target.closest('.compare__handle')) return;
  positionFromEvent(e.clientX);
});

// Keyboard accessibility
handle.addEventListener('keydown', (e) => {
  const current = parseFloat(handle.style.left) || 50;
  if (e.key === 'ArrowLeft') setSliderPosition(current - 5);
  if (e.key === 'ArrowRight') setSliderPosition(current + 5);
});