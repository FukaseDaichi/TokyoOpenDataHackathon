import { AXIS_KEYS, type AxisVector, type Ward } from '../domain/axes';
import { distance } from './matching';

/** 決定的k-means。初期centroidは先頭k区（乱数不使用なので同一入力で同一結果）。 */
export function kmeans(wards: Ward[], k: number, iterations = 20): number[] {
  const centroids: AxisVector[] = wards.slice(0, k).map((wd) => ({ ...wd.axes }));
  let assignments: number[] = new Array(wards.length).fill(0);

  for (let iter = 0; iter < iterations; iter++) {
    assignments = wards.map((wd) => {
      let best = 0;
      let bestD = Infinity;
      centroids.forEach((c, ci) => {
        const d = distance(wd.axes, c);
        if (d < bestD) {
          bestD = d;
          best = ci;
        }
      });
      return best;
    });

    for (let ci = 0; ci < k; ci++) {
      const members = wards.filter((_, i) => assignments[i] === ci);
      if (members.length === 0) continue;
      const c = {} as AxisVector;
      for (const key of AXIS_KEYS) {
        c[key] = members.reduce((s, m) => s + m.axes[key], 0) / members.length;
      }
      centroids[ci] = c;
    }
  }
  return assignments;
}
