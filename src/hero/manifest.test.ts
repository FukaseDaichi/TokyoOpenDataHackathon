import { describe, it, expect } from 'vitest';
import { HERO_CARDS } from './manifest';

// 現存する13枚のSSR画像（assets/characters/ssr/ 調査結果 2026-07-11）
const EXISTING_SLUGS = [
  'chiyoda', 'chuo', 'minato', 'shinjuku', 'bunkyo', 'taito', 'sumida',
  'koto', 'shinagawa', 'meguro', 'ota', 'setagaya', 'shibuya',
];

describe('HERO_CARDS manifest', () => {
  it('has exactly 23 wards with unique ids', () => {
    expect(HERO_CARDS).toHaveLength(23);
    expect(new Set(HERO_CARDS.map((c) => c.id)).size).toBe(23);
    expect(HERO_CARDS.every((c) => c.name.endsWith('区'))).toBe(true);
  });

  it('is deterministic across module usage (frozen values)', () => {
    const first = JSON.stringify(HERO_CARDS);
    const second = JSON.stringify(HERO_CARDS);
    expect(first).toBe(second);
  });

  it('only existing images get a slug; the missing 10 wards get null', () => {
    const withSlug = HERO_CARDS.filter((c) => c.slug !== null);
    expect(withSlug.map((c) => c.slug).sort()).toEqual([...EXISTING_SLUGS].sort());
    expect(HERO_CARDS.filter((c) => c.slug === null)).toHaveLength(10);
  });

  it('uses at least 5 distinct depth bands and both left/right sides', () => {
    expect(new Set(HERO_CARDS.map((c) => c.depthBand)).size).toBeGreaterThanOrEqual(5);
    expect(HERO_CARDS.some((c) => c.side === -1)).toBe(true);
    expect(HERO_CARDS.some((c) => c.side === 1)).toBe(true);
  });

  it('spreads corridor positions along z over a wide range', () => {
    const zs = HERO_CARDS.map((c) => c.corridor.z);
    expect(Math.max(...zs) - Math.min(...zs)).toBeGreaterThan(40);
    zs.forEach((z) => {
      expect(z).toBeLessThanOrEqual(18);
      expect(z).toBeGreaterThanOrEqual(-70);
    });
  });

  it('gives every card a distinct float phase', () => {
    const phases = new Set(HERO_CARDS.map((c) => c.floatPhase.toFixed(6)));
    expect(phases.size).toBe(23);
  });

  it('assigns closeups only to wards that have a real image, within scene 3 range', () => {
    const closeups = HERO_CARDS.filter((c) => c.closeupAt !== null);
    expect(closeups.length).toBeGreaterThanOrEqual(4);
    closeups.forEach((c) => {
      expect(c.slug).not.toBeNull();
      expect(c.closeupAt!).toBeGreaterThanOrEqual(0.35);
      expect(c.closeupAt!).toBeLessThanOrEqual(0.8);
    });
    // クローズアップ時刻は重ならない（交互に来る）
    const ts = closeups.map((c) => c.closeupAt!).sort((a, b) => a - b);
    for (let i = 1; i < ts.length; i++) {
      expect(ts[i] - ts[i - 1]).toBeGreaterThan(0.03);
    }
  });

  it('keeps card scale positive (2:3 aspect is fixed by geometry)', () => {
    HERO_CARDS.forEach((c) => {
      expect(c.scale).toBeGreaterThan(0);
      expect(Number.isFinite(c.scale)).toBe(true);
    });
  });
});
