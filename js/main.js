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

  // ---------- Gallery: load thumbnails in small batches (avoids scroll jank from 40 huge JPEGs) ----------
  function initProgressiveGalleryThumbs(grid) {
    const PLACEHOLDER =
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 5' width='400' height='500' fill='%23ede6db'/%3E";
    const maxConcurrent = 2;
    let loading = 0;
    const queue = [];

    function pump() {
      while (loading < maxConcurrent && queue.length) {
        const img = queue.shift();
        const url = img && img.dataset.thumbSrc;
        if (!url) continue;
        delete img.dataset.thumbSrc;
        loading += 1;
        const finish = () => {
          loading -= 1;
          img.onload = null;
          img.onerror = null;
          img.classList.add('gallery-thumb-loaded');
          pump();
        };
        img.onload = finish;
        img.onerror = finish;
        img.src = url;
      }
    }

    const imgs = grid.querySelectorAll('.gallery-item img');
    imgs.forEach((img) => {
      const url = img.getAttribute('src');
      if (!url || url.indexOf('data:') === 0) return;
      img.dataset.thumbSrc = url;
      img.removeAttribute('src');
      img.setAttribute('decoding', 'async');
      img.removeAttribute('loading');
      img.src = PLACEHOLDER;
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const img = entry.target;
          observer.unobserve(img);
          if (img.dataset.thumbSrc) queue.push(img);
          pump();
        });
      },
      { root: null, rootMargin: '180px 0px 240px 0px', threshold: 0 }
    );

    imgs.forEach((img) => {
      if (img.dataset.thumbSrc) observer.observe(img);
    });
  }

  // ---------- Gallery lightbox ----------
  function initGallery() {
    const grid = document.getElementById('galleryGrid');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const closeBtn = document.getElementById('lightboxClose');
    const prevBtn = document.getElementById('lightboxPrev');
    const nextBtn = document.getElementById('lightboxNext');
    const counterEl = document.getElementById('lightboxCounter');
    const downloadLink = document.getElementById('lightboxDownload');

    if (!grid || !lightbox || !lightboxImg) return;

    initProgressiveGalleryThumbs(grid);

    const items = Array.from(grid.querySelectorAll('.gallery-item'));
    const sources = items.map((item) => item.dataset.src || '');
    let currentIndex = 0;

    function galleryFilename(index) {
      return `merhawi-koket-gallery-${String(index + 1).padStart(2, '0')}.jpg`;
    }

    function updateDownloadLink(src, index) {
      if (!downloadLink || !src) return;
      downloadLink.href = src;
      downloadLink.download = galleryFilename(index);
      downloadLink.removeAttribute('hidden');
    }

    items.forEach((item, index) => {
      const src = item.dataset.src || item.querySelector('img')?.getAttribute('src');
      if (src) {
        const dl = document.createElement('a');
        dl.className = 'gallery-item-download';
        dl.href = src;
        dl.download = galleryFilename(index);
        dl.setAttribute('aria-label', `Download photo ${index + 1}`);
        dl.innerHTML =
          '<span class="gallery-item-download-icon" aria-hidden="true">↓</span><span class="gallery-item-download-text">Save</span>';
        dl.addEventListener('click', (e) => e.stopPropagation());
        item.appendChild(dl);
      }
    });

    function showSlide(i) {
      if (!items.length) return;
      const n = ((i % items.length) + items.length) % items.length;
      currentIndex = n;
      const src = sources[n];
      if (!src) return;
      lightboxImg.src = src;
      const alt = items[n].querySelector('img')?.getAttribute('alt') || 'Wedding photo';
      lightboxImg.alt = alt;
      if (counterEl) counterEl.textContent = `${n + 1} / ${items.length}`;
      updateDownloadLink(src, n);
    }

    items.forEach((item, index) => {
      item.addEventListener('click', () => {
        showSlide(index);
        lightbox.classList.add('active');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
      });
    });

    function closeLightbox() {
      lightbox.classList.remove('active');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (downloadLink) downloadLink.setAttribute('hidden', '');
    }

    if (downloadLink) {
      downloadLink.addEventListener('click', (e) => e.stopPropagation());
    }
    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showSlide(currentIndex - 1);
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showSlide(currentIndex + 1);
      });
    }
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        showSlide(currentIndex - 1);
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        showSlide(currentIndex + 1);
      }
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
    // threshold 0: any pixel visible (0.1 fails for very tall sections like the gallery)
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('in-view');
        });
      },
      { threshold: 0, rootMargin: '0px 0px -24px 0px' }
    );
    sections.forEach((s) => observer.observe(s));

    function revealIfInViewport() {
      const vh = window.innerHeight || document.documentElement.clientHeight;
      sections.forEach((s) => {
        const r = s.getBoundingClientRect();
        if (r.bottom > 0 && r.top < vh) s.classList.add('in-view');
      });
    }
    revealIfInViewport();
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
