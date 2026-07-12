import { describe, it, expect } from 'vitest';
import { loadWardDetails, DETAIL_SOURCES } from './details';
import snapshot from './ward-details.json';

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
  it('全区に population と incomePerTaxpayer がある', () => {
    for (const d of map.values()) {
      expect(d.population).toBeGreaterThan(50000); // 最小の千代田区でも6万人超
      expect(d.incomePerTaxpayer).toBeGreaterThan(3000); // 千円単位
    }
  });
  it('港区の平均所得が23区最大', () => {
    const minato = map.get('13103')!;
    const values = [...map.values()].map((d) => d.incomePerTaxpayer!);
    expect(Math.max(...values)).toBe(minato.incomePerTaxpayer);
  });
  it('全区に crime_per_1000 があり妥当なレンジ', () => {
    for (const d of map.values()) {
      expect(d.crimePer1000).toBeGreaterThan(1);
      expect(d.crimePer1000).toBeLessThan(60); // 昼間人口の多い千代田区でも数十
    }
  });
  it('全区に waiting_children がある（0以上の整数）', () => {
    for (const w of snapshot.wards) {
      expect(Number.isInteger(w.waiting_children)).toBe(true);
      expect(w.waiting_children).toBeGreaterThanOrEqual(0);
    }
  });
});
