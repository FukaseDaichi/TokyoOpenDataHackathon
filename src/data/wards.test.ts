import { describe, it, expect } from 'vitest';
import { loadWards, nameGroups, GROUP_COUNT, DATA_SOURCES } from './wards';
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

describe('系統の命名', () => {
  const wards = loadWards();
  const byName = new Map(wards.map((w) => [w.name, w]));

  it('全区が「系統n」ではなく街の雰囲気名を持つ', () => {
    for (const w of wards) {
      expect(w.group).not.toMatch(/^系統\d+$/);
    }
  });

  it('現行スナップショットの所属を固定する（データ更新時は命名を見直す）', () => {
    const groupOf = (name: string) => byName.get(name)!.group;
    expect(groupOf('千代田区')).toBe('ど真ん中シティ系');
    expect(groupOf('中央区')).toBe('ベイサイド新星系');
    expect(groupOf('港区')).toBe('きらめきセレブ系');
    for (const n of ['新宿区', '台東区', '渋谷区', '中野区', '豊島区']) {
      expect(groupOf(n)).toBe('にぎやか繁華街系');
    }
    for (const n of ['文京区', '品川区', '目黒区', '世田谷区', '杉並区']) {
      expect(groupOf(n)).toBe('おだやか住宅街系');
    }
    for (const n of [
      '墨田区', '江東区', '大田区', '北区', '荒川区',
      '板橋区', '練馬区', '足立区', '葛飾区', '江戸川区',
    ]) {
      expect(groupOf(n)).toBe('下町あったか系');
    }
  });

  it('代表区が同じクラスタに落ちたら例外を投げて命名の見直しを強制する', () => {
    // 千代田(13101)と中央(13102)が同一ラベル0になる不正な割り当て
    const codes = wards.map((w) => w.code);
    const labels = wards.map((w) => (w.code === '13101' || w.code === '13102' ? 0 : 1));
    expect(() => nameGroups(labels, codes)).toThrow(/代表区/);
  });
});
