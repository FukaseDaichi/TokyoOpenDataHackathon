import { describe, it, expect } from 'vitest';
import { cameraPose, scenePhases, cardPose, floatOffset } from './timeline';
import { HERO_CARDS } from './manifest';

const finite = (xs: number[]) => xs.every((x) => Number.isFinite(x));

describe('cameraPose', () => {
  it('is deterministic (same t -> identical pose, so reverse scroll replays exactly)', () => {
    for (const t of [0, 0.123, 0.5, 0.87, 1]) {
      expect(cameraPose(t)).toEqual(cameraPose(t));
    }
  });

  it('moves monotonically forward (z decreasing) through the corridor (0.15..0.8)', () => {
    let prev = cameraPose(0.15).pos[2];
    for (let t = 0.16; t <= 0.8; t += 0.01) {
      const z = cameraPose(t).pos[2];
      expect(z).toBeLessThan(prev);
      prev = z;
    }
  });

  it('stays finite and clamps outside [0,1]', () => {
    for (const t of [-0.5, 0, 0.5, 1, 1.5]) {
      const c = cameraPose(t);
      expect(finite([...c.pos, ...c.look])).toBe(true);
    }
    expect(cameraPose(-1)).toEqual(cameraPose(0));
    expect(cameraPose(2)).toEqual(cameraPose(1));
  });

  it('weaves laterally (an S-curve, not a straight line)', () => {
    const xs: number[] = [];
    for (let t = 0.15; t <= 0.8; t += 0.01) xs.push(cameraPose(t).pos[0]);
    expect(Math.max(...xs)).toBeGreaterThan(1.5);
    expect(Math.min(...xs)).toBeLessThan(-1.5);
  });
});

describe('scenePhases', () => {
  it('shows the title at start and hides it in the corridor', () => {
    expect(scenePhases(0).title).toBe(1);
    expect(scenePhases(0.3).title).toBe(0);
  });

  it('keeps the CTA hidden mid-scroll and fully visible at the end', () => {
    expect(scenePhases(0.5).cta).toBe(0);
    expect(scenePhases(0.85).cta).toBe(0);
    expect(scenePhases(1).cta).toBe(1);
  });

  it('locks the constellation between 0.8 and 0.95', () => {
    expect(scenePhases(0.8).constellation).toBe(0);
    expect(scenePhases(0.95).constellation).toBe(1);
  });

  it('fires the opening burst only near the start', () => {
    expect(scenePhases(0.05).burst).toBeGreaterThan(0);
    expect(scenePhases(0.5).burst).toBe(0);
  });
});

describe('cardPose', () => {
  it('is deterministic for every card', () => {
    for (const card of HERO_CARDS) {
      expect(cardPose(card, 0.42)).toEqual(cardPose(card, 0.42));
    }
  });

  it('is finite across the whole timeline for all 23 cards', () => {
    for (let t = 0; t <= 1.0001; t += 0.02) {
      for (const card of HERO_CARDS) {
        const p = cardPose(card, t);
        expect(finite([...p.pos, p.rotY, p.rotZ, p.scale, p.sheen, p.labelOpacity])).toBe(true);
      }
    }
  });

  it('gathers every card at its constellation slot at t=1', () => {
    for (const card of HERO_CARDS) {
      const p = cardPose(card, 1);
      expect(Math.abs(p.pos[0] - card.constellation.x)).toBeLessThan(0.6);
      expect(Math.abs(p.pos[1] - card.constellation.y)).toBeLessThan(0.6);
      expect(Math.abs(p.pos[2] - card.constellation.z)).toBeLessThan(0.6);
    }
  });

  it('raises sheen when a closeup card approaches the camera', () => {
    const card = HERO_CARDS.find((c) => c.closeupAt !== null)!;
    const atPeak = cardPose(card, card.closeupAt!);
    const far = cardPose(card, Math.max(0.16, card.closeupAt! - 0.2));
    expect(atPeak.sheen).toBeGreaterThan(far.sheen);
    expect(atPeak.labelOpacity).toBeGreaterThan(0.5);
  });
});

describe('floatOffset', () => {
  it('is a pure function of time and phase (no hidden state)', () => {
    const card = HERO_CARDS[0];
    expect(floatOffset(card, 12.5, 1)).toEqual(floatOffset(card, 12.5, 1));
  });

  it('is zero when the motion factor is zero (reduced motion)', () => {
    const [dx, dy] = floatOffset(HERO_CARDS[3], 99.9, 0);
    expect(dx).toBe(0);
    expect(dy).toBe(0);
  });

  it('differs between cards at the same time (phase variety)', () => {
    const a = floatOffset(HERO_CARDS[0], 5, 1);
    const b = floatOffset(HERO_CARDS[1], 5, 1);
    expect(a).not.toEqual(b);
  });
});
