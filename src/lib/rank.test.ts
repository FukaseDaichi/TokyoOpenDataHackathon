import { describe, it, expect } from 'vitest';
import { rankOf, ratioToMean } from './rank';

describe('rank', () => {
  it('ranks descending by default (biggest = 1位)', () => {
    expect(rankOf([10, 30, 20], 30)).toBe(1);
    expect(rankOf([10, 30, 20], 10)).toBe(3);
  });
  it('ranks ascending when desc=false', () => {
    expect(rankOf([10, 30, 20], 10, false)).toBe(1);
  });
  it('computes ratio to mean', () => {
    expect(ratioToMean([1, 2, 3], 2)).toBe(1);
    expect(ratioToMean([1, 2, 3], 4)).toBe(2);
  });
});
