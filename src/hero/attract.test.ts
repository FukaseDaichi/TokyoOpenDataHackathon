import { describe, it, expect } from 'vitest';
import { attractPulse, ATTRACT_AMP, ATTRACT_CYCLE_MS, ATTRACT_REST_MS } from './attract';

describe('attractPulse', () => {
  it('starts and stays at zero for non-positive elapsed time', () => {
    expect(attractPulse(-100)).toBe(0);
    expect(attractPulse(0)).toBe(0);
  });

  it('peaks at the amplitude mid-cycle and returns to zero at cycle end', () => {
    expect(attractPulse(ATTRACT_CYCLE_MS / 2)).toBeCloseTo(ATTRACT_AMP, 5);
    expect(attractPulse(ATTRACT_CYCLE_MS)).toBeCloseTo(0, 5);
  });

  it('rests at zero between cycles', () => {
    expect(attractPulse(ATTRACT_CYCLE_MS + ATTRACT_REST_MS / 2)).toBe(0);
  });

  it('repeats periodically', () => {
    const period = ATTRACT_CYCLE_MS + ATTRACT_REST_MS;
    for (const ms of [300, 900, ATTRACT_CYCLE_MS / 2]) {
      expect(attractPulse(ms + period)).toBeCloseTo(attractPulse(ms), 8);
    }
  });

  it('never goes negative nor exceeds the amplitude', () => {
    for (let ms = 0; ms <= 12000; ms += 50) {
      const v = attractPulse(ms);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(ATTRACT_AMP + 1e-9);
    }
  });
});
