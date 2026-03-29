/**
 * Merhawi & Koket — Wedding Website
 * Interactive features: loader, countdown, optional song/audio toggle, nav, gallery, RSVP, language
 */

(function () {
  'use strict';

  const WEDDING_DATE = new Date('2026-04-19T16:00:00');

  // ---------- Loader ----------
  function initLoader() {
    const loader = document.getElementById('loader');
    if (!loader) return;
    window.addEventListener('load', () => {
      setTimeout(() => {
        loader.classList.add('hidden');
        setTimeout(() => loader.remove(), 600);
      }, 1200);
    });
  }

  // ---------- Countdown ----------
  function initCountdown() {
    const els = {
      days: document.getElementById('days'),
      hours: document.getElementById('hours'),
      minutes: document.getElementById('minutes'),
      seconds: document.getElementById('seconds'),
    };
    if (!els.days) return;

    function pad(n) {
      return String(n).padStart(2, '0');
    }

    function update() {
      const now = new Date();
      if (now >= WEDDING_DATE) {
        els.days.textContent = '0';
        els.hours.textContent = '00';
        els.minutes.textContent = '00';
        els.seconds.textContent = '00';
        return;
      }
      const diff = WEDDING_DATE - now;
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      els.days.textContent = d;
      els.hours.textContent = pad(h);
      els.minutes.textContent = pad(m);
      els.seconds.textContent = pad(s);
    }

    update();
    setInterval(update, 1000);
  }

  // ---------- Music ----------
  function initMusic() {
    const toggle = document.getElementById('musicToggle');
    const audio = document.getElementById('bgMusic');
    if (!toggle || !audio) return;

    toggle.addEventListener('click', () => {
      if (audio.paused) {
        audio.play().catch(() => {});
        toggle.classList.add('playing');
      } else {
        audio.pause();
        toggle.classList.remove('playing');
      }
    });
  }

  // ---------- Navigation ----------
  function initNav() {
    const nav = document.getElementById('mainNav');
    const toggle = document.getElementById('navToggle');
    const links = document.querySelector('.nav-links');

    if (nav) {
      let lastScroll = 0;
      window.addEventListener('scroll', () => {
        const y = window.scrollY;
        if (y > 80) nav.classList.add('scrolled');
        else nav.classList.remove('scrolled');
        lastScroll = y;
      }, { passive: true });
    }

    if (toggle && links) {
      toggle.addEventListener('click', () => links.classList.toggle('open'));
      links.querySelectorAll('a').forEach((a) => {
        a.addEventListener('click', () => links.classList.remove('open'));
      });
    }
  }

  // ---------- Smooth scroll for anchor links ----------
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      const id = a.getAttribute('href');
      if (id === '#') return;
      a.addEventListener('click', (e) => {
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  // ---------- Gallery lightbox ----------
  function initGallery() {
    const grid = document.getElementById('galleryGrid');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const closeBtn = document.getElementById('lightboxClose');

    if (!grid || !lightbox || !lightboxImg) return;

    grid.querySelectorAll('.gallery-item').forEach((item) => {
      item.addEventListener('click', () => {
        const src = item.dataset.src || item.querySelector('img')?.src;
        if (src) {
          lightboxImg.src = src;
          lightbox.classList.add('active');
          lightbox.setAttribute('aria-hidden', 'false');
          document.body.style.overflow = 'hidden';
        }
      });
    });

    function closeLightbox() {
      lightbox.classList.remove('active');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox.classList.contains('active')) closeLightbox();
    });
  }

  // ---------- RSVP form (Google Apps Script web app → Sheet) ----------
  function initRSVP() {
    const form = document.getElementById('rsvpForm');
    const successEl = document.getElementById('rsvpSuccess');
    const errorEl = document.getElementById('rsvpError');
    const submitBtn = document.getElementById('rsvpSubmit');

    if (!form || !successEl) return;

    function hideRsvpError() {
      if (!errorEl) return;
      errorEl.hidden = true;
      errorEl.textContent = '';
      errorEl.classList.add('hidden');
    }

    function showRsvpError(msg) {
      if (errorEl) {
        errorEl.textContent = msg;
        errorEl.hidden = false;
        errorEl.classList.remove('hidden');
      } else {
        window.alert(msg);
      }
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideRsvpError();

      const scriptUrl = (form.dataset.rsvpUrl || '').trim();
      if (!scriptUrl) {
        showRsvpError(
          'RSVP is not connected yet. Paste your Google Apps Script web app URL into data-rsvp-url on the RSVP form in index.html.'
        );
        return;
      }

      const btnText = submitBtn?.querySelector('.btn-text');
      if (submitBtn) {
        submitBtn.disabled = true;
        if (btnText) btnText.textContent = 'Sending...';
      }

      const payload = {
        name:
          form.elements.name && form.elements.name.value
            ? String(form.elements.name.value).trim()
            : '',
        attendance: form.querySelector('input[name="attendance"]:checked')?.value || '',
        guests: form.elements.guests ? String(form.elements.guests.value) : '',
        message:
          form.elements.message && form.elements.message.value
            ? String(form.elements.message.value).trim()
            : '',
      };

      // Apps Script web apps often omit CORS headers; JSON POST fails in the browser as "Failed to fetch".
      // Simple form body + no-cors avoids CORS; Apps Script reads fields via e.parameter (see apps-script/rsvp-webapp.gs).
      try {
        const body = new URLSearchParams({
          name: payload.name,
          attendance: payload.attendance,
          guests: payload.guests,
          message: payload.message,
        });
        await fetch(scriptUrl, {
          method: 'POST',
          mode: 'no-cors',
          body,
        });
        successEl.hidden = false;
        successEl.classList.remove('hidden');
        form.classList.add('hidden');
        form.reset();
      } catch (err) {
        showRsvpError(err.message || 'Something went wrong. Please try again.');
      } finally {
        if (submitBtn) submitBtn.disabled = false;
        if (btnText) btnText.textContent = 'Send RSVP';
      }
    });
  }

  // ---------- Scroll-triggered animations (optional) ----------
  function initScrollAnimations() {
    const sections = document.querySelectorAll('.section');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('in-view');
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );
    sections.forEach((s) => observer.observe(s));
  }

  // ---------- Run all ----------
  initLoader();
  initCountdown();
  initMusic();
  initNav();
  initSmoothScroll();
  initGallery();
  initRSVP();
  initScrollAnimations();
})();
