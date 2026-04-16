import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(process.cwd());

function p(...parts) {
  return path.join(ROOT, ...parts);
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

function svgIcon() {
  // Simple luxury badge: ivory background, gold ring, “M & K”
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#b8923a"/>
      <stop offset="1" stop-color="#e6d4a8"/>
    </linearGradient>
    <filter id="s" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#000" flood-opacity="0.18"/>
    </filter>
  </defs>
  <rect width="512" height="512" rx="108" fill="#faf7f2"/>
  <g filter="url(#s)">
    <circle cx="256" cy="256" r="164" fill="none" stroke="url(#g)" stroke-width="18"/>
    <circle cx="256" cy="256" r="140" fill="none" stroke="#b8923a" stroke-opacity="0.25" stroke-width="2"/>
  </g>
  <text x="256" y="278" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="112" fill="#2c2a28" letter-spacing="2">
    M &amp; K
  </text>
  <text x="256" y="336" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" fill="#a85d68" letter-spacing="6">
    2026
  </text>
</svg>
`.trim();
}

async function buildIcons() {
  const svg = Buffer.from(svgIcon());

  const out32 = p('assets', 'favicon-32.png');
  const out180 = p('assets', 'apple-touch-icon.png');
  const out192 = p('assets', 'icon-192.png');
  const out512 = p('assets', 'icon-512.png');

  await ensureDir(p('assets'));

  await sharp(svg).resize(32, 32).png({ compressionLevel: 9 }).toFile(out32);
  await sharp(svg).resize(180, 180).png({ compressionLevel: 9 }).toFile(out180);
  await sharp(svg).resize(192, 192).png({ compressionLevel: 9 }).toFile(out192);
  await sharp(svg).resize(512, 512).png({ compressionLevel: 9 }).toFile(out512);
}

async function buildPhotos() {
  const hdDir = p('assets', 'wedding', 'hd');
  await ensureDir(hdDir);

  const web = { width: 1400, quality: 72 };
  const hd = { width: 2600, quality: 82 };

  const singleWebOnly = [
    p('assets', 'wedding', 'story-met.jpg'),
    p('assets', 'wedding', 'story-date.jpg'),
    p('assets', 'wedding', 'story-proposal.jpg'),
    p('assets', 'wedding', 'groom.jpg'),
    p('assets', 'wedding', 'bride.jpg'),
  ];

  // Gallery: build HD download versions, then overwrite the web versions in-place.
  const gallery = Array.from({ length: 40 }, (_, i) => {
    const n = String(i + 1).padStart(2, '0');
    return {
      src: p('assets', 'wedding', `gallery-${n}.jpg`),
      hd: p('assets', 'wedding', 'hd', `gallery-${n}.jpg`),
    };
  });

  async function makeJpeg(buf, { width, quality }) {
    return sharp(buf)
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .jpeg({ quality, mozjpeg: true, progressive: true })
      .toBuffer();
  }

  async function overwriteJpeg(targetPath, buf) {
    // Windows can intermittently lock destination files (AV/indexer),
    // so we overwrite in-place to avoid rename EPERM.
    await fs.writeFile(targetPath, buf);
  }

  for (const srcPath of singleWebOnly) {
    const buf = await fs.readFile(srcPath);
    const webBuf = await makeJpeg(buf, web);
    await overwriteJpeg(srcPath, webBuf);
  }

  for (const g of gallery) {
    const buf = await fs.readFile(g.src);
    const hdBuf = await makeJpeg(buf, hd);
    await fs.writeFile(g.hd, hdBuf);

    const webBuf = await makeJpeg(buf, web);
    await overwriteJpeg(g.src, webBuf);
  }
}

async function main() {
  await buildIcons();
  await buildPhotos();
  // eslint-disable-next-line no-console
  console.log('Assets built: icons + optimized photos + HD gallery downloads');
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});

