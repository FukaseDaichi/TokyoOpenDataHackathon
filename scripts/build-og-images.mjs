// assets/og/*.png (原本・非破壊) → public/og/{slug}.jpg (1200×630, JPEG品質85)
// 原本は1734×907(比1.912)でOGP比1.905とほぼ同一のため、coverクロップの欠けは実質ない。
import { readdir, mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const SRC_DIR = 'assets/og';
const OUT_DIR = 'public/og';
const WIDTH = 1200;
const HEIGHT = 630;

const files = (await readdir(SRC_DIR)).filter((f) => f.endsWith('.png'));
await mkdir(OUT_DIR, { recursive: true });

for (const file of files) {
  const slug = path.basename(file, '.png');
  const out = path.join(OUT_DIR, `${slug}.jpg`);
  await sharp(path.join(SRC_DIR, file))
    .resize({ width: WIDTH, height: HEIGHT, fit: 'cover' })
    .jpeg({ quality: 85, mozjpeg: true })
    .toFile(out);
  console.log(out);
}
console.log(`done: ${files.length} images`);
