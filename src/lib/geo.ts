import type { WardGeo } from '../data/geo';

export interface Bounds { minX: number; minY: number; maxX: number; maxY: number }

/** 全区の全リングを含む境界ボックス */
export function geoBounds(all: WardGeo[]): Bounds {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const w of all) for (const ring of w.rings) for (const [x, y] of ring) {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
  return { minX, minY, maxX, maxY };
}

/** 局所km座標→ビュー座標。y軸反転（北が上）、アスペクト比維持で中央寄せ */
export function toView(p: [number, number], b: Bounds, w: number, h: number, pad: number): [number, number] {
  const spanX = b.maxX - b.minX;
  const spanY = b.maxY - b.minY;
  const scale = Math.min((w - pad * 2) / spanX, (h - pad * 2) / spanY);
  const ox = (w - spanX * scale) / 2;
  const oy = (h - spanY * scale) / 2;
  return [ox + (p[0] - b.minX) * scale, h - oy - (p[1] - b.minY) * scale];
}

export function ringToPath(ring: [number, number][], b: Bounds, w: number, h: number, pad: number): string {
  return ring
    .map((p, i) => {
      const [x, y] = toView(p, b, w, h, pad);
      return `${i === 0 ? 'M' : 'L'}${round1(x)},${round1(y)}`;
    })
    .join(' ') + ' Z';
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/** target自身を除く、重心距離の近い順k件 */
export function nearestWards(target: WardGeo, all: WardGeo[], k: number): WardGeo[] {
  return all
    .filter((w) => w.code !== target.code)
    .map((w) => ({ w, d: (w.center[0] - target.center[0]) ** 2 + (w.center[1] - target.center[1]) ** 2 }))
    .sort((a, b) => a.d - b.d)
    .slice(0, k)
    .map((x) => x.w);
}
