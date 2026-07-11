// assets/book-cover.png, assets/magic-circle.png（原本・非破壊）
// → public/book-cover.webp, public/magic-circle.png
// WardModalの絵本表紙・3Dレーダーの魔法陣テクスチャ用。
import sharp from 'sharp';

await sharp('assets/book-cover.png')
  .resize({ width: 1600, withoutEnlargement: true })
  .webp({ quality: 82 })
  .toFile('public/book-cover.webp');
console.log('public/book-cover.webp');

// three.jsのTextureLoaderで読むためアルファ透過を保つ必要がありPNGのまま圧縮
await sharp('assets/magic-circle.png')
  .resize({ width: 1024, withoutEnlargement: true })
  .png({ quality: 82, compressionLevel: 9 })
  .toFile('public/magic-circle.png');
console.log('public/magic-circle.png');
