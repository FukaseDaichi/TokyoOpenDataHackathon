// assets/characters/ssr/*.png (原本・非破壊) → public/characters/ssr/{slug}-w{512,896}.webp
// 2:3の縦横比を維持したまま幅だけ指定してリサイズする。
import { readdir, mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const SRC_DIR = 'assets/characters/ssr';
const OUT_DIR = 'public/characters/ssr';
const WIDTHS = [512, 896];

const files = (await readdir(SRC_DIR)).filter((f) => f.endsWith('.png'));
await mkdir(OUT_DIR, { recursive: true });

for (const file of files) {
  const slug = path.basename(file, '.png');
  for (const width of WIDTHS) {
    const out = path.join(OUT_DIR, `${slug}-w${width}.webp`);
    await sharp(path.join(SRC_DIR, file))
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 86 })
      .toFile(out);
    console.log(`${out}`);
  }
}
console.log(`done: ${files.length} sources × ${WIDTHS.length} sizes`);
