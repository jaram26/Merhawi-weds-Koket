import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const weddingDir = path.join(__dirname, '..', 'assets', 'wedding');

/** Files we had rotated +90° from landscape; +180° corrects upside-down result */
const names = ['gallery-02.jpg', 'gallery-05.jpg', 'gallery-11.jpg', 'story-proposal.jpg'];

for (const name of names) {
  const inputPath = path.join(weddingDir, name);
  if (!fs.existsSync(inputPath)) continue;
  await sharp(inputPath)
    .rotate(180)
    .jpeg({ quality: 92, mozjpeg: true })
    .toFile(inputPath + '.tmp');
  fs.renameSync(inputPath + '.tmp', inputPath);
  console.log('rotated 180:', name);
}
