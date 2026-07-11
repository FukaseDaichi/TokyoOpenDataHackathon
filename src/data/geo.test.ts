import { describe, expect, it } from 'vitest';
import snapshot from './ward-geo.json';

const WARD_IDS = Array.from({ length: 23 }, (_, i) => `131${String(i + 1).padStart(2, '0')}`);

describe('ward-geo.json', () => {
  it('23区が区コード順にそろっている', () => {
    expect(snapshot.wards.map((w) => w.id)).toEqual(WARD_IDS);
  });
  it('各区にリング・重心・面積がある', () => {
    for (const w of snapshot.wards) {
      expect(w.rings.length).toBeGreaterThan(0);
      expect(w.rings[0].length).toBeGreaterThan(10);
      expect(w.area_km2).toBeGreaterThan(5); // 最小の台東区でも10km^2強
      expect(Number.isFinite(w.center[0]) && Number.isFinite(w.center[1])).toBe(true);
    }
  });
  it('座標は東京近傍の局所km座標', () => {
    for (const w of snapshot.wards) {
      for (const [x, y] of w.rings[0]) {
        expect(Math.abs(x)).toBeLessThan(40);
        expect(Math.abs(y)).toBeLessThan(40);
      }
    }
  });
});
