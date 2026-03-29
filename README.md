# Merhawi & Koket — Wedding Website

A responsive, elegant wedding website with a romantic garden theme, soft pastels (blush, gold, ivory, sage), and subtle Ethiopian-inspired decorative elements.

## Quick start

Open `index.html` in a browser. No build step required. For local development with live reload, you can use any static server (e.g. `npx serve .`).

## Customize your wedding

### Photos
- **Hero:** Replace the `hero-bg img` `src` in `index.html` with your main wedding/engagement image.
- **Story timeline:** Update the three `timeline-img` images with your “how we met,” “first date,” and “proposal” photos.
- **Bride & Groom:** Replace the two `couple-photo img` sources with your portraits.
- **Gallery:** Replace each `gallery-item` image (both `data-src` and `img src`) with your engagement/pre-wedding photos. Use high‑res URLs in `data-src` for the lightbox.

### Venue & details
- **Wedding Details:** Edit the venue name, address, ceremony/reception times, and schedule in the “Wedding Details” and “Schedule” sections.
- **Maps:** Replace the `iframe` `src` in both `#venueMap` and `#travelMap` with your Google Maps embed URL (or other map embed) for the venue and area.

### Music
- Replace the `audio source` in `index.html` with your chosen romantic instrumental track (e.g. MP3 URL or path to a file in the project).

### RSVP
- The form currently shows a success message without sending data. To collect responses:
  - **Option A:** Use [Formspree](https://formspree.io): set `form action="https://formspree.io/f/YOUR_ID" method="POST"` and adjust `js/main.js` to submit via the form (or use Formspree’s optional JavaScript).
  - **Option B:** Point the form to your own backend endpoint and handle submission in `js/main.js`.

### Gifts / QR code
- Replace the “QR Code” placeholder in the Gifts section with your actual QR image (e.g. for bank transfer or mobile payment):
  - Add an `<img src="path/to/your-qr.png" alt="Scan for gifts" />` inside `.gifts-qr` or replace the content of `.qr-placeholder`.

### Travel & accommodation
- Update the “Nearby Hotels” list and “Tips” text with real hotel names, addresses, phone numbers, and any shuttle or travel info.

### Contact & social
- In the footer, set the email `href` and the Instagram/Facebook (or other) links to your real contact and social URLs.

### Hashtag
- The footer uses `#MerhawiWedsKoket`; change it in the HTML if you prefer another hashtag.

## Features

- **Loading screen** with “M & K” and simple animation  
- **Hero** with countdown to April 19, 2026  
- **Our Story** timeline (how we met, first date, proposal) and Mark 10:9  
- **Bride & Groom** bios and a short message to guests  
- **Wedding Details** with venue, map, dress code, and schedule  
- **Gallery** with grid and lightbox (click to enlarge)  
- **Bible verses** (1 Corinthians 13:4–7, Ecclesiastes 4:9–12, Genesis 2:24)  
- **RSVP form** (name, attendance, guest count, message)  
- **Gifts** section with QR placeholder  
- **Travel & accommodation** and area map  
- **Footer** with contact, social links, and hashtag  
- **Optional:** Holy songs page (`songs.html`), English/Amharic toggle, floating hearts, scroll-triggered section animations  

## Files

- `index.html` — All content and structure  
- `css/style.css` — Layout, theme, animations, responsive styles  
- `js/main.js` — Countdown, optional audio toggle, language switch, nav, gallery lightbox, RSVP handling  

## Browser support

Works in modern browsers (Chrome, Firefox, Safari, Edge). For older browsers, consider adding a minimal polyfill for `IntersectionObserver` if you keep the scroll animations.

---

*With love, M & K*
