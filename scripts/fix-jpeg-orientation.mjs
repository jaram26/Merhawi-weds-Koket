/**
 * Re-encode JPEGs in assets/wedding with EXIF orientation applied to pixels
 * and stripped, so browsers show them upright even without EXIF support.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const weddingDir = path.join(__dirname, '..', 'assets', 'wedding');

const files = fs.readdirSync(weddingDir).filter((f) => /\.jpe?g$/i.test(f));

for (const name of files) {
  const inputPath = path.join(weddingDir, name);
  const meta = await sharp(inputPath).metadata();
  const orient = meta.orientation ?? 1;
  const { width, height } = meta;
  await sharp(inputPath)
    .rotate() // apply EXIF orientation; default angle from EXIF
    .jpeg({ quality: 92, mozjpeg: true })
    .toFile(inputPath + '.tmp');
  fs.renameSync(inputPath + '.tmp', inputPath);
  console.log(name, { beforeOrientation: orient, beforeWxH: `${width}x${height}` });
}

console.log('Done:', files.length, 'files');
