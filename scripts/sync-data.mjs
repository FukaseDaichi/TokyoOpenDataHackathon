import { access, copyFile } from 'node:fs/promises';

const FILE_PAIRS = [
  ['data/processed/wards.json', 'src/data/ward-metrics.json'],
  ['data/processed/ward-details.json', 'src/data/ward-details.json'],
  ['data/processed/ward-geo.json', 'src/data/ward-geo.json'],
];

for (const [source] of FILE_PAIRS) {
  try {
    await access(source);
  } catch (error) {
    if (error?.code === 'ENOENT') {
      console.error(`processed data file not found: ${source}`);
      process.exit(1);
    }
    throw error;
  }
}

for (const [source, destination] of FILE_PAIRS) {
  await copyFile(source, destination);
  console.log(`${source} -> ${destination}`);
}

console.log(`done: ${FILE_PAIRS.length} files synced`);
