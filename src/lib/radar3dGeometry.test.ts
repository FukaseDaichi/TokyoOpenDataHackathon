import { describe, it, expect } from 'vitest';
import { axisAngle, axisPoint, ringPoints, labelPoint, valueToRadius } from './radar3dGeometry';

const N = 5;

describe('valueToRadius', () => {
  it('maps [-1, 1] onto [0, r]', () => {
    expect(valueToRadius(-1, 2)).toBe(0);
    expect(valueToRadius(0, 2)).toBe(1);
    expect(valueToRadius(1, 2)).toBe(2);
  });
});

describe('axisAngle', () => {
  it('starts axis 0 at the front (toward +Z camera) and goes clockwise seen from above', () => {
    // 軸0は手前（+Z）: x=0, z>0 に対応する角度 = π/2
    expect(axisAngle(0, N)).toBeCloseTo(Math.PI / 2);
    // 均等割り: 隣接軸との差は 2π/5
    expect(Math.abs(axisAngle(1, N) - axisAngle(0, N))).toBeCloseTo((Math.PI * 2) / N);
  });
});

describe('axisPoint', () => {
  it('puts axis 0 with value +1 at [0, y, r]', () => {
    const [x, y, z] = axisPoint(0, N, 1, 2, 0.5);
    expect(x).toBeCloseTo(0);
    expect(y).toBe(0.5);
    expect(z).toBeCloseTo(2);
  });

  it('collapses value -1 to the center', () => {
    const [x, y, z] = axisPoint(3, N, -1, 2, 0.1);
    expect(x).toBeCloseTo(0);
    expect(y).toBe(0.1);
    expect(z).toBeCloseTo(0);
  });

  it('keeps every vertex within radius r', () => {
    for (let i = 0; i < N; i++) {
      const [x, , z] = axisPoint(i, N, 1, 1.5, 0);
      expect(Math.hypot(x, z)).toBeLessThanOrEqual(1.5 + 1e-9);
    }
  });
});

describe('ringPoints', () => {
  it('returns a closed loop of n+1 points at the ring value', () => {
    const pts = ringPoints(N, 0, 2, 0.02);
    expect(pts).toHaveLength(N + 1);
    expect(pts[0]).toEqual(pts[N]);
    // value 0 → 半径の半分
    const [x, , z] = pts[0];
    expect(Math.hypot(x, z)).toBeCloseTo(1);
  });
});

describe('labelPoint', () => {
  it('sits outside the max radius on the axis direction', () => {
    const r = 2;
    const [x, , z] = labelPoint(0, N, r, 0.6, 1.25);
    expect(Math.hypot(x, z)).toBeCloseTo(r * 1.25);
    // 軸0の方向（+Z）を維持
    expect(x).toBeCloseTo(0);
    expect(z).toBeGreaterThan(0);
  });
});
