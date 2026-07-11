import { describe, it, expect } from 'vitest';
import { minMaxToSignedUnit, logMinMaxToSignedUnit } from './normalize';

describe('minMaxToSignedUnit', () => {
  it('maps min to -1, max to +1, mid to 0', () => {
    expect(minMaxToSignedUnit([0, 5, 10])).toEqual([-1, 0, 1]);
  });
  it('returns all zeros when every value is equal', () => {
    expect(minMaxToSignedUnit([4, 4, 4])).toEqual([0, 0, 0]);
  });
});

describe('logMinMaxToSignedUnit', () => {
  it('compresses a dominant outlier (Chiyoda case)', () => {
    // 昼夜間人口比率イメージ: 84%〜1355%。線形だと2位(374)が-0.54に沈むが、
    // logなら中間域が持ち上がる。
    const values = [84, 100, 374, 1355];
    const linear = minMaxToSignedUnit(values);
    const logged = logMinMaxToSignedUnit(values);
    expect(logged[0]).toBe(-1);
    expect(logged[3]).toBe(1);
    expect(logged[2]).toBeGreaterThan(linear[2]);
  });
  it('maps min/max to -1/+1', () => {
    const out = logMinMaxToSignedUnit([1, 10, 100]);
    expect(out[0]).toBeCloseTo(-1);
    expect(out[1]).toBeCloseTo(0);
    expect(out[2]).toBeCloseTo(1);
  });
});
