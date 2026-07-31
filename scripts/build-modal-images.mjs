// assets/book-cover.png（原本・非破壊） → public/book-cover.webp
// book-cover.webpはWardModalの絵本表紙に使う。
import sharp from 'sharp';

await sharp('assets/book-cover.png')
  .resize({ width: 1600, withoutEnlargement: true })
  .webp({ quality: 82 })
  .toFile('public/book-cover.webp');
console.log('public/book-cover.webp');
