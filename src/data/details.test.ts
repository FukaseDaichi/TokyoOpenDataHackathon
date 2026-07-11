import { describe, it, expect } from 'vitest';
import { loadWardDetails, DETAIL_SOURCES } from './details';

describe('loadWardDetails', () => {
  const map = loadWardDetails();
  it('has details for all 23 wards', () => {
    expect(map.size).toBe(23);
  });
  it('land price is positive and Chiyoda is above 23-ward median', () => {
    const values = [...map.values()].map((d) => d.landPriceAvg).sort((a, b) => a - b);
    const chiyoda = map.get('13101')!;
    expect(chiyoda.landPriceAvg).toBeGreaterThan(values[11]);
    for (const d of map.values()) expect(d.landPriceAvg).toBeGreaterThan(0);
  });
  it('exposes sources', () => {
    expect(Object.keys(DETAIL_SOURCES).length).toBeGreaterThan(0);
  });
});
