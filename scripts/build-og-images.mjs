// OGP画像 1200x630 を23区分生成する。実行: node scripts/build-og-images.mjs
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const WARDS = [
  ['chiyoda', '千代田区'], ['chuo', '中央区'], ['minato', '港区'], ['shinjuku', '新宿区'],
  ['bunkyo', '文京区'], ['taito', '台東区'], ['sumida', '墨田区'], ['koto', '江東区'],
  ['shinagawa', '品川区'], ['meguro', '目黒区'], ['ota', '大田区'], ['setagaya', '世田谷区'],
  ['shibuya', '渋谷区'], ['nakano', '中野区'], ['suginami', '杉並区'], ['toshima', '豊島区'],
  ['kita', '北区'], ['arakawa', '荒川区'], ['itabashi', '板橋区'], ['nerima', '練馬区'],
  ['adachi', '足立区'], ['katsushika', '葛飾区'], ['edogawa', '江戸川区'],
];

const W = 1200, H = 630;
mkdirSync('public/og', { recursive: true });

const bg = Buffer.from(`<svg width="${W}" height="${H}">
  <defs>
    <linearGradient id="p" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f7ecd4"/><stop offset="1" stop-color="#e8d5ab"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#p)"/>
  <rect x="14" y="14" width="${W - 28}" height="${H - 28}" fill="none" stroke="#b8923f" stroke-width="4" rx="18"/>
</svg>`);

const label = (name) => Buffer.from(`<svg width="700" height="630">
  <text x="60" y="430" font-family="Hiragino Mincho ProN, serif" font-size="60" fill="#4a3418" letter-spacing="4">${name}ちゃん</text>
  <text x="60" y="500" font-family="Hiragino Mincho ProN, serif" font-size="34" fill="#7a5c2e" letter-spacing="4">タイプのあなたへ</text>
</svg>`);

const logo = await sharp('public/title-w720.webp').resize({ width: 480 }).toBuffer();

for (const [slug, name] of WARDS) {
  const art = await sharp(`public/characters/ssr/${slug}-w512.webp`)
    .resize(360, 540, { fit: 'cover' })
    .toBuffer();
  await sharp(bg)
    .composite([
      { input: logo, left: 80, top: 60 },
      { input: label(name), left: 0, top: 0 },
      { input: art, left: W - 420, top: 45 },
    ])
    .png()
    .toFile(`public/og/${slug}.png`);
}
console.log('generated 23 og images');
