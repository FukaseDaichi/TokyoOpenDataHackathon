import { describe, it, expect } from 'vitest';
import { AXIS_KEYS, emptyVector } from './axes';

describe('axes domain', () => {
  it('has exactly 5 axis keys in fixed order', () => {
    expect(AXIS_KEYS).toEqual(['liveliness', 'maturity', 'greenery', 'family', 'luxury']);
  });
  it('emptyVector returns 0 for every axis', () => {
    const v = emptyVector();
    expect(AXIS_KEYS.every((k) => v[k] === 0)).toBe(true);
  });
});
