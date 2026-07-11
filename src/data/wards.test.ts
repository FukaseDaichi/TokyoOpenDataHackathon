import { describe, it, expect } from 'vitest';
import { loadWards, GROUP_COUNT, DATA_SOURCES } from './wards';
import { AXIS_KEYS } from '../domain/axes';

describe('loadWards', () => {
  const wards = loadWards();
  it('loads all 23 wards', () => {
    expect(wards).toHaveLength(23);
  });
  it('every ward has all 5 axes in [-1,1], a group, and raw metrics', () => {
    for (const w of wards) {
      for (const k of AXIS_KEYS) {
        expect(w.axes[k]).toBeGreaterThanOrEqual(-1);
        expect(w.axes[k]).toBeLessThanOrEqual(1);
      }
      expect(w.group).toBeTruthy();
      expect(w.metrics?.daytime_population_ratio).toBeGreaterThan(0);
    }
  });
  it('produces at most GROUP_COUNT distinct groups', () => {
    const groups = new Set(wards.map((w) => w.group));
    expect(groups.size).toBeLessThanOrEqual(GROUP_COUNT);
  });
  it('axes reflect the real open data (sanity checks)', () => {
    const byName = new Map(wards.map((w) => [w.name, w]));
    // 千代田区: 昼夜間人口比率が最大 → 賑わい最大
    expect(byName.get('千代田区')!.axes.liveliness).toBe(1);
    // 港区: 財政力指数1.15が最大 → 華やか最大
    expect(byName.get('港区')!.axes.luxury).toBe(1);
    // 賑わいはlogスケール: 2位の区でも線形なら沈むが log では -0.3 より上に来る
    const sorted = [...wards].sort((a, b) => b.axes.liveliness - a.axes.liveliness);
    expect(sorted[1].axes.liveliness).toBeGreaterThan(-0.3);
  });
  it('exposes data source attributions', () => {
    expect(Object.keys(DATA_SOURCES).length).toBeGreaterThan(0);
  });
});
