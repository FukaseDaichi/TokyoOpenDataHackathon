import { describe, it, expect } from 'vitest';
import { CODE_TO_SLUG, SLUG_TO_CODE, ALL_SLUGS } from './slugs';

describe('slugs', () => {
  it('has 23 slugs, all round-trip', () => {
    expect(ALL_SLUGS).toHaveLength(23);
    expect(CODE_TO_SLUG['13103']).toBe('minato');
    expect(SLUG_TO_CODE['minato']).toBe('13103');
    for (const s of ALL_SLUGS) expect(CODE_TO_SLUG[SLUG_TO_CODE[s]]).toBe(s);
  });
});
