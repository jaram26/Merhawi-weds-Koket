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
    const hide = () => {
      loader.classList.add('hidden');
      setTimeout(() => loader.remove(), 400);
    };
    // Hide shortly after DOM is ready — do not wait for full window load (images),
    // so the splash does not block for many seconds.
    const delayMs = 280;
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => setTimeout(hide, delayMs));
    } else {
      setTimeout(hide, delayMs);
    }
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

    const countdownRoot = document.getElementById('countdown');
    let prevSecond = -1;

    function pulseSeconds() {
      if (!countdownRoot) return;
      const secItem = countdownRoot.querySelector('.countdown-item:last-child');
      if (!secItem) return;
      secItem.classList.remove('countdown-tick');
      void secItem.offsetWidth;
      secItem.classList.add('countdown-tick');
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
      if (s !== prevSecond) {
        prevSecond = s;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        pulseSeconds();
      }
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
    const backdrop = document.getElementById('navBackdrop');

    function setMenuOpen(open) {
      if (!links) return;
      links.classList.toggle('open', open);
      if (toggle) {
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      }
      if (backdrop) {
        backdrop.classList.toggle('is-open', open);
        backdrop.setAttribute('aria-hidden', open ? 'false' : 'true');
      }
      document.body.style.overflow = open ? 'hidden' : '';
      document.documentElement.style.overflow = open ? 'hidden' : '';
    }

    if (nav) {
      window.addEventListener('scroll', () => {
        const y = window.scrollY;
        if (y > 80) nav.classList.add('scrolled');
        else nav.classList.remove('scrolled');
      }, { passive: true });
    }

    if (toggle && links) {
      toggle.addEventListener('click', () => {
        const open = !links.classList.contains('open');
        setMenuOpen(open);
      });
      links.querySelectorAll('a').forEach((a) => {
        a.addEventListener('click', () => setMenuOpen(false));
      });
      if (backdrop) {
        backdrop.addEventListener('click', () => setMenuOpen(false));
      }
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && links.classList.contains('open')) setMenuOpen(false);
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
    const prevBtn = document.getElementById('lightboxPrev');
    const nextBtn = document.getElementById('lightboxNext');
    const counterEl = document.getElementById('lightboxCounter');
    const downloadLink = document.getElementById('lightboxDownload');

    if (!grid || !lightbox || !lightboxImg) return;

    const items = Array.from(grid.querySelectorAll('.gallery-item'));
    const sources = items.map(
      (item) => item.dataset.src || item.querySelector('img')?.getAttribute('src') || ''
    );
    let currentIndex = 0;

    function galleryFilename(index) {
      return `merhawi-koket-gallery-${String(index + 1).padStart(2, '0')}.jpg`;
    }

    function galleryHdSrc(index) {
      const n = String(index + 1).padStart(2, '0');
      return `assets/wedding/hd/gallery-${n}.jpg`;
    }

    function updateDownloadLink(src, index) {
      if (!downloadLink || !src) return;
      downloadLink.href = galleryHdSrc(index);
      downloadLink.download = galleryFilename(index);
      downloadLink.removeAttribute('hidden');
    }

    items.forEach((item, index) => {
      const src = item.dataset.src || item.querySelector('img')?.getAttribute('src');
      if (src) {
        const dl = document.createElement('a');
        dl.className = 'gallery-item-download';
        dl.href = galleryHdSrc(index);
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

    let touchStartX = 0;
    let touchStartY = 0;
    lightbox.addEventListener(
      'touchstart',
      (e) => {
        if (!lightbox.classList.contains('active') || !e.changedTouches[0]) return;
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
      },
      { passive: true }
    );
    lightbox.addEventListener(
      'touchend',
      (e) => {
        if (!lightbox.classList.contains('active') || !e.changedTouches[0]) return;
        const dx = e.changedTouches[0].screenX - touchStartX;
        const dy = e.changedTouches[0].screenY - touchStartY;
        if (Math.abs(dx) < 56 || Math.abs(dx) < Math.abs(dy)) return;
        if (dx < 0) showSlide(currentIndex + 1);
        else showSlide(currentIndex - 1);
      },
      { passive: true }
    );
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

  // ---------- Songs page: one open lyrics panel at a time ----------
  function initLyricsAccordion() {
    const faq = document.querySelector('.lyrics-faq');
    if (!faq) return;
    const items = faq.querySelectorAll('details.lyrics-item');
    items.forEach((details) => {
      details.addEventListener('toggle', () => {
        if (!details.open) return;
        items.forEach((other) => {
          if (other !== details) other.removeAttribute('open');
        });
      });
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

  // ---------- Staggered reveals inside sections ----------
  function initStaggerReveal() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const blocks = document.querySelectorAll('[data-stagger]');
    if (!blocks.length) return;
    const step = 0.045;
    const maxDelay = 0.9;
    blocks.forEach((parent) => {
      Array.from(parent.children).forEach((child, i) => {
        const d = Math.min(i * step, maxDelay);
        child.style.transitionDelay = `${d}s`;
      });
    });
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('stagger-visible');
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -8% 0px' }
    );
    blocks.forEach((el) => io.observe(el));
  }

  // ---------- Welcome modal (once per browser session) ----------
  function initWelcomeModal() {
    const modal = document.getElementById('welcomeModal');
    const closeBtn = document.getElementById('welcomeModalClose');
    const backdrop = document.getElementById('welcomeModalBackdrop');
    if (!modal || !closeBtn) return;

    const KEY = 'mk_welcome_dismissed';
    function openModal() {
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
    }
    function closeModal() {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      try {
        sessionStorage.setItem(KEY, '1');
      } catch (e) {}
      window.dispatchEvent(new CustomEvent('mk-welcome-closed'));
    }

    let dismissed = false;
    try {
      dismissed = !!sessionStorage.getItem(KEY);
    } catch (e) {}
    if (!dismissed) {
      function showWelcomeSoon() {
        requestAnimationFrame(() => openModal());
      }
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', showWelcomeSoon);
      } else {
        showWelcomeSoon();
      }
    }

    closeBtn.addEventListener('click', closeModal);
    if (backdrop) backdrop.addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
    });
  }

  // ---------- PWA: service worker + install prompt ----------
  function initPwaInstall() {
    if ('serviceWorker' in navigator) {
      const swUrl = new URL('sw.js', window.location.href);
      window.addEventListener('load', () => {
        navigator.serviceWorker.register(swUrl.href).catch(() => {});
      });
    }

    const banner = document.getElementById('pwaInstallBanner');
    const installBtn = document.getElementById('pwaInstallBtn');
    const dismissBtn = document.getElementById('pwaInstallDismiss');
    const textEl = document.getElementById('pwaInstallText');
    if (!banner || !installBtn || !dismissBtn || !textEl) return;

    const DISMISS_KEY = 'mk_pwa_install_snoozed';
    const SNOOZE_MS = 14 * 24 * 60 * 60 * 1000;
    const WELCOME_KEY = 'mk_welcome_dismissed';

    function isSnoozed() {
      try {
        const t = localStorage.getItem(DISMISS_KEY);
        if (!t) return false;
        return Date.now() - parseInt(t, 10) < SNOOZE_MS;
      } catch (e) {
        return false;
      }
    }

    function snooze() {
      try {
        localStorage.setItem(DISMISS_KEY, String(Date.now()));
      } catch (e) {}
      hideBanner();
    }

    function isStandalone() {
      return (
        window.matchMedia('(display-mode: standalone)').matches ||
        window.matchMedia('(display-mode: fullscreen)').matches ||
        window.navigator.standalone === true
      );
    }

    function welcomeAlreadyDismissedThisSession() {
      try {
        return !!sessionStorage.getItem(WELCOME_KEY);
      } catch (e) {
        return false;
      }
    }

    function afterWelcomeClosed(fn) {
      if (welcomeAlreadyDismissedThisSession()) {
        setTimeout(fn, 400);
        return;
      }
      window.addEventListener('mk-welcome-closed', () => setTimeout(fn, 450), { once: true });
    }

    function hideBanner() {
      banner.classList.remove('is-visible');
      banner.setAttribute('aria-hidden', 'true');
      installBtn.hidden = false;
    }

    function showBanner(mode) {
      if (isStandalone() || isSnoozed()) return;
      banner.dataset.mode = mode;
      if (mode === 'ios') {
        installBtn.hidden = true;
        textEl.textContent =
          'Tap Share (the square with an arrow) at the bottom of Safari, scroll down, then tap “Add to Home Screen”.';
      } else {
        installBtn.hidden = false;
        textEl.textContent =
          'Add our invitation to your home screen for one-tap access and a fuller-screen experience.';
      }
      banner.classList.add('is-visible');
      banner.setAttribute('aria-hidden', 'false');
      if (installBtn.hidden) dismissBtn.focus({ preventScroll: true });
      else installBtn.focus({ preventScroll: true });
    }

    let deferredPrompt = null;
    let chromiumShowScheduled = false;

    function tryShowChromium() {
      if (!deferredPrompt || isStandalone() || isSnoozed()) return;
      showBanner('chromium');
    }

    function scheduleChromiumBanner() {
      if (chromiumShowScheduled) return;
      chromiumShowScheduled = true;
      afterWelcomeClosed(tryShowChromium);
    }

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      scheduleChromiumBanner();
    });

    window.addEventListener('appinstalled', () => {
      deferredPrompt = null;
      hideBanner();
    });

    function isLikelyIos() {
      const ua = navigator.userAgent || '';
      if (/iPad|iPhone|iPod/.test(ua)) return true;
      return navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
    }

    afterWelcomeClosed(() => {
      setTimeout(() => {
        if (isStandalone() || isSnoozed() || deferredPrompt) return;
        if (!isLikelyIos()) return;
        showBanner('ios');
      }, 400);
    });

    installBtn.addEventListener('click', async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      await deferredPrompt.userChoice.catch(() => {});
      deferredPrompt = null;
      hideBanner();
    });

    dismissBtn.addEventListener('click', snooze);
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
  initLyricsAccordion();
  initStaggerReveal();
  initWelcomeModal();
  initPwaInstall();
})();
