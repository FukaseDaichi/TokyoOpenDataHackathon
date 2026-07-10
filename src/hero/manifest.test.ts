import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { GROUND_Y, HERO_CARDS } from './manifest';

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

  it('gives all 23 wards a unique slug whose built webp actually exists', () => {
    const slugs = HERO_CARDS.map((c) => c.slug);
    expect(slugs.every((s) => s !== null)).toBe(true);
    expect(new Set(slugs).size).toBe(23);
    for (const slug of slugs) {
      const file = path.join(process.cwd(), 'public', 'characters', 'ssr', `${slug}-w512.webp`);
      expect(existsSync(file), `missing ${file}`).toBe(true);
    }
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

  describe('map layout (Scene4, landscape Tokyo diorama)', () => {
    it('stands every card on the ground plane (bottom edge touches GROUND_Y)', () => {
      HERO_CARDS.forEach((c) => {
        expect(c.map.y - 1.5 * c.map.scale).toBeCloseTo(GROUND_Y, 5);
      });
    });

    it('preserves geographic order: east wards get larger x, north wards sit further away', () => {
      for (const a of HERO_CARDS) {
        for (const b of HERO_CARDS) {
          if (a.geo.x < b.geo.x) expect(a.map.x).toBeLessThan(b.map.x);
          // 北(geo.y大)ほど奥 = zがより負
          if (a.geo.y < b.geo.y) expect(a.map.z).toBeGreaterThan(b.map.z);
        }
      }
    });

    it('keeps neighbouring wards from standing inside each other', () => {
      const w = (c: (typeof HERO_CARDS)[number]) => 2 * c.map.scale; // カード幅
      for (let i = 0; i < HERO_CARDS.length; i++) {
        for (let j = i + 1; j < HERO_CARDS.length; j++) {
          const a = HERO_CARDS[i].map;
          const b = HERO_CARDS[j].map;
          const dist = Math.hypot(a.x - b.x, a.z - b.z);
          expect(dist).toBeGreaterThan(Math.max(w(HERO_CARDS[i]), w(HERO_CARDS[j])) * 0.55);
        }
      }
    });
  });

  describe('podium layout (Scene4, portrait group photo)', () => {
    it('never overlaps: same-row neighbours are at least a card width apart', () => {
      const byRowZ = new Map<number, Array<{ x: number; scale: number }>>();
      HERO_CARDS.forEach((c) => {
        const list = byRowZ.get(c.podium.z) ?? [];
        list.push({ x: c.podium.x, scale: c.podium.scale });
        byRowZ.set(c.podium.z, list);
      });
      for (const row of byRowZ.values()) {
        const xs = row.map((r) => r.x).sort((a, b) => a - b);
        const width = 2 * row[0].scale;
        for (let i = 1; i < xs.length; i++) {
          expect(xs[i] - xs[i - 1]).toBeGreaterThanOrEqual(width);
        }
      }
    });

    it('builds rising tiers: distinct rows step up in y and back in z', () => {
      const rows = [...new Set(HERO_CARDS.map((c) => c.podium.z))].sort((a, b) => b - a);
      expect(rows.length).toBeGreaterThanOrEqual(4);
      let prevY = -Infinity;
      for (const z of rows) {
        const ys = HERO_CARDS.filter((c) => c.podium.z === z).map((c) => c.podium.y);
        // 同じ段は同じ高さ
        expect(Math.max(...ys) - Math.min(...ys)).toBeLessThan(1e-9);
        expect(ys[0]).toBeGreaterThan(prevY);
        prevY = ys[0];
      }
    });

    it('stays narrow enough for a portrait viewport', () => {
      HERO_CARDS.forEach((c) => {
        expect(Math.abs(c.podium.x)).toBeLessThanOrEqual(3.2);
      });
    });
  });

  it('staggers gather timing slightly but keeps it within the scene', () => {
    HERO_CARDS.forEach((c) => {
      expect(c.gatherDelay).toBeGreaterThanOrEqual(0);
      expect(c.gatherDelay).toBeLessThan(0.05);
    });
  });
});
