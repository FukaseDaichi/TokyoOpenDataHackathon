import sharp from 'sharp';
const src = 'assets/title.png';
const meta = await sharp(src).metadata();
const trimmed = sharp(src).trim({ threshold: 10 });
const buf = await trimmed.png().toBuffer();
const tmeta = await sharp(buf).metadata();
console.log('original', meta.width, meta.height, '-> trimmed', tmeta.width, tmeta.height);
for (const w of [720, 1440]) {
  const out = `public/title-w${w}.webp`;
  await sharp(buf).resize({ width: Math.min(w, tmeta.width) }).webp({ quality: 90, alphaQuality: 90 }).toFile(out);
}
