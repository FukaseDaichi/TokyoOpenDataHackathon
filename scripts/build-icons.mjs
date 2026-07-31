// assets/icons/*.png (原本・非破壊) → public/icons/{slug}.webp (256×256)
// 区詳細ページ「区のプロフィール」に72pxで表示する円形アイコン。
// 丸抜きはCSS側(border-radius)で行うため、原本・出力とも正方形のまま保持する。
// 表示は72pxだが3倍DPRを見込んで256pxで書き出す。
import { readdir, mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const SRC_DIR = 'assets/icons';
const OUT_DIR = 'public/icons';
const SIZE = 256;

const files = (await readdir(SRC_DIR)).filter((f) => f.endsWith('.png'));
await mkdir(OUT_DIR, { recursive: true });

for (const file of files) {
  const slug = path.basename(file, '.png');
  const out = path.join(OUT_DIR, `${slug}.webp`);
  await sharp(path.join(SRC_DIR, file))
    .resize({ width: SIZE, height: SIZE, fit: 'cover' })
    .webp({ quality: 88 })
    .toFile(out);
  console.log(out);
}
console.log(`done: ${files.length} images`);
