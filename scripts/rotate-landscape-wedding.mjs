/**
 * Some exports are stored as landscape pixels (w>h) but the scene is portrait.
 * Rotate 90° clockwise so width/height swap and subjects read upright.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const weddingDir = path.join(__dirname, '..', 'assets', 'wedding');

const names = fs.readdirSync(weddingDir).filter((f) => /\.jpe?g$/i.test(f));

for (const name of names) {
  const inputPath = path.join(weddingDir, name);
  const meta = await sharp(inputPath).metadata();
  const w = meta.width ?? 0;
  const h = meta.height ?? 0;
  if (w <= h) continue;

  await sharp(inputPath)
    .rotate(90)
    .jpeg({ quality: 92, mozjpeg: true })
    .toFile(inputPath + '.tmp');
  fs.renameSync(inputPath + '.tmp', inputPath);
  const after = await sharp(inputPath).metadata();
  console.log(name, `${w}x${h} -> ${after.width}x${after.height}`);
}

console.log('Landscape rotation pass complete.');
