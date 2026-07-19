// assets/book-cover.png, assets/magic-circle.png（原本・非破壊）
// → public/book-cover.webp, public/magic-circle.png
// book-cover.webpはWardModalの絵本表紙に使う。magic-circle.pngは現行UIから未参照。
import sharp from 'sharp';

await sharp('assets/book-cover.png')
  .resize({ width: 1600, withoutEnlargement: true })
  .webp({ quality: 82 })
  .toFile('public/book-cover.webp');
console.log('public/book-cover.webp');

// アルファ透過を保った生成物としてPNGのまま圧縮
await sharp('assets/magic-circle.png')
  .resize({ width: 1024, withoutEnlargement: true })
  .png({ quality: 82, compressionLevel: 9 })
  .toFile('public/magic-circle.png');
console.log('public/magic-circle.png');
