import { describe, expect, it } from 'vitest';
import { geoBounds, nearestWards, ringToPath, toView } from './geo';
import type { WardGeo } from '../data/geo';

const sq = (cx: number, cy: number): WardGeo => ({
  code: '13101', name: 'テスト', center: [cx, cy], areaKm2: 4,
  rings: [[[cx - 1, cy - 1], [cx + 1, cy - 1], [cx + 1, cy + 1], [cx - 1, cy + 1]]],
});

describe('geoBounds', () => {
  it('全リングを含む境界を返す', () => {
    expect(geoBounds([sq(0, 0), sq(10, 5)])).toEqual({ minX: -1, minY: -1, maxX: 11, maxY: 6 });
  });
});

describe('toView', () => {
  it('北(+y)が上（小さいv）になる', () => {
    const b = { minX: 0, minY: 0, maxX: 10, maxY: 10 };
    const [, vTop] = toView([5, 10], b, 100, 100, 0);
    const [, vBottom] = toView([5, 0], b, 100, 100, 0);
    expect(vTop).toBeLessThan(vBottom);
  });
  it('アスペクト比を保ち中央寄せする', () => {
    const b = { minX: 0, minY: 0, maxX: 10, maxY: 5 };
    expect(toView([0, 5], b, 100, 100, 10)).toEqual([10, 30]); // 幅80に対し高さ40→上下40-70
    expect(toView([10, 0], b, 100, 100, 10)).toEqual([90, 70]);
  });
});

describe('ringToPath', () => {
  it('M/L/Zの閉パスを生成する', () => {
    const b = { minX: 0, minY: 0, maxX: 2, maxY: 2 };
    const d = ringToPath([[0, 0], [2, 0], [2, 2]], b, 100, 100, 0);
    expect(d).toBe('M0,100 L100,100 L100,0 Z');
  });
});

describe('nearestWards', () => {
  it('自身を除き近い順にk件返す', () => {
    const a = { ...sq(0, 0), code: 'a' };
    const wards = [a, { ...sq(1, 0), code: 'b' }, { ...sq(5, 0), code: 'c' }, { ...sq(2, 0), code: 'd' }];
    expect(nearestWards(a, wards, 2).map((w) => w.code)).toEqual(['b', 'd']);
  });
});
