import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const FILE_PAIRS = [
  ['data/processed/wards.json', 'src/data/ward-metrics.json'],
  ['data/processed/ward-details.json', 'src/data/ward-details.json'],
  ['data/processed/ward-geo.json', 'src/data/ward-geo.json'],
] as const;

describe('processed and bundled data parity', () => {
  for (const [processedPath, bundledPath] of FILE_PAIRS) {
    it(`${bundledPath} matches ${processedPath} byte-for-byte`, () => {
      const processed = readFileSync(path.resolve(process.cwd(), processedPath));
      const bundled = readFileSync(path.resolve(process.cwd(), bundledPath));

      expect(
        bundled.equals(processed),
        `${bundledPath} is out of sync with ${processedPath}; run npm run sync:data`,
      ).toBe(true);
    });
  }
});
