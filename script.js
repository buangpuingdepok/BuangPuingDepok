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

// ============ CAPACITY PICKER (Jasa Urug & Suplai Tanah) ============
const capacityBtns = document.querySelectorAll('.capacity-picker__btn');
const urugWaLink = document.getElementById('urugWaLink');
const urugImg = document.getElementById('urugImg');
const urugMedia = urugImg ? urugImg.closest('.card__media') : null;

capacityBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const capacity = btn.dataset.capacity;
    const label = btn.dataset.label;

    capacityBtns.forEach(b => {
      b.classList.remove('is-active');
      b.setAttribute('aria-checked', 'false');
    });
    btn.classList.add('is-active');
    btn.setAttribute('aria-checked', 'true');

    document.querySelectorAll('.capacity-picker__note').forEach(note => {
      note.hidden = note.dataset.noteFor !== capacity;
    });

    if (urugImg && urugMedia && btn.dataset.image && urugImg.getAttribute('src') !== btn.dataset.image) {
      urugMedia.classList.add('is-swapping');
      setTimeout(() => {
        urugImg.src = btn.dataset.image;
        urugImg.alt = btn.dataset.alt || urugImg.alt;
        urugMedia.classList.remove('is-swapping');
      }, 200);
    }

    if (urugWaLink) {
      const message = `Halo, saya mau pesan jasa Urug dan Suplai Tanah (${capacity} m³, ${label})`;
      urugWaLink.href = `https://wa.me/628813877153?text=${encodeURIComponent(message)}`;
    }
  });
});

// ============ DOKUMENTASI: FILTER & LIGHTBOX ============
const docFilterBtns = document.querySelectorAll('.doc-filter__btn');
const docGalleryItems = document.querySelectorAll('.doc-grid__item');
const docGrid = document.querySelector('.doc-grid');
const docMoreBtn = document.getElementById('docMoreBtn');
const docLightbox = document.getElementById('docLightbox');
const docLightboxImg = document.getElementById('docLightboxImg');
const docLightboxClose = docLightbox.querySelector('.doc-lightbox__close');
const docLightboxPrev = docLightbox.querySelector('.doc-lightbox__prev');
const docLightboxNext = docLightbox.querySelector('.doc-lightbox__next');

let docVisibleItems = [];
let docCurrentIndex = 0;

// Mobile: Check if we're on mobile (<768px)
const isMobile = () => window.matchMedia('(max-width: 767px)').matches;

// Mobile: Update which items should be hidden (4th item onwards)
function updateMobileDocGrid() {
  if (!isMobile() || !docGrid) return;

  // Remove all --extra classes first
  docGalleryItems.forEach(item => item.classList.remove('doc-grid__item--extra'));

  // Get currently visible items (not hidden by filter)
  const visibleItems = Array.from(docGalleryItems).filter(
    item => !item.classList.contains('is-hidden')
  );

  // Add --extra class to items beyond the first 3
  visibleItems.forEach((item, index) => {
    if (index >= 3) {
      item.classList.add('doc-grid__item--extra');
    }
  });

  // Show/hide button based on whether there are more than 3 visible items
  if (docMoreBtn) {
    docMoreBtn.style.display = visibleItems.length > 3 ? 'inline-flex' : 'none';
  }

  // Reset expanded state when filter changes
  docGrid.classList.remove('is-expanded');
}

// Mobile: Handle "Lihat Selengkapnya" button click
if (docMoreBtn) {
  docMoreBtn.addEventListener('click', () => {
    if (!isMobile()) return;
    docGrid.classList.add('is-expanded');
    docMoreBtn.style.display = 'none';
  });
}

// Mobile: Handle window resize
const mobileMediaQuery = window.matchMedia('(max-width: 767px)');
mobileMediaQuery.addEventListener('change', () => {
  if (!isMobile()) {
    // When switching to desktop, remove all --extra classes and expanded state
    docGalleryItems.forEach(item => item.classList.remove('doc-grid__item--extra'));
    docGrid.classList.remove('is-expanded');
  } else {
    // When switching to mobile, apply mobile logic
    updateMobileDocGrid();
  }
});

// Filter functionality
docFilterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    // Update active state
    docFilterBtns.forEach(b => b.classList.remove('is-active'));
    btn.classList.add('is-active');

    const filter = btn.dataset.filter;

    // Show/hide items
    docGalleryItems.forEach(item => {
      if (filter === 'all' || item.dataset.category === filter) {
        item.classList.remove('is-hidden');
      } else {
        item.classList.add('is-hidden');
      }
    });

    // Update visible items array
    docVisibleItems = Array.from(docGalleryItems).filter(
      item => !item.classList.contains('is-hidden')
    );

    // Update mobile grid state
    updateMobileDocGrid();
  });
});

// Initialize visible items
docVisibleItems = Array.from(docGalleryItems);

// Initial mobile grid setup
updateMobileDocGrid();

// Lightbox open
docGalleryItems.forEach((item, index) => {
  item.addEventListener('click', () => {
    const img = item.querySelector('img');
    docLightboxImg.src = img.src;
    docLightboxImg.alt = img.alt;
    docLightbox.classList.add('is-open');
    document.body.style.overflow = 'hidden';

    // Find index in visible items
    docCurrentIndex = docVisibleItems.indexOf(item);
  });

  // Keyboard support
  item.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      item.click();
    }
  });
});

// Lightbox close
function closeDocLightbox() {
  docLightbox.classList.remove('is-open');
  document.body.style.overflow = '';
}

docLightboxClose.addEventListener('click', closeDocLightbox);

docLightbox.addEventListener('click', (e) => {
  if (e.target === docLightbox) {
    closeDocLightbox();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && docLightbox.classList.contains('is-open')) {
    closeDocLightbox();
  }
});

// Lightbox navigation
function updateDocLightboxImage() {
  const item = docVisibleItems[docCurrentIndex];
  const img = item.querySelector('img');
  docLightboxImg.src = img.src;
  docLightboxImg.alt = img.alt;
}

docLightboxPrev.addEventListener('click', () => {
  docCurrentIndex = (docCurrentIndex - 1 + docVisibleItems.length) % docVisibleItems.length;
  updateDocLightboxImage();
});

docLightboxNext.addEventListener('click', () => {
  docCurrentIndex = (docCurrentIndex + 1) % docVisibleItems.length;
  updateDocLightboxImage();
});

// Keyboard navigation in lightbox
document.addEventListener('keydown', (e) => {
  if (!docLightbox.classList.contains('is-open')) return;

  if (e.key === 'ArrowLeft') {
    docLightboxPrev.click();
  } else if (e.key === 'ArrowRight') {
    docLightboxNext.click();
  }
});