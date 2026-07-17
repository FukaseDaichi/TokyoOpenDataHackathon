import { describe, it, expect } from 'vitest';
import { loadWardTraits } from './traits';
import { loadWards } from './wards';

describe('ward traits', () => {
  it('全23区に3行ずつあり、空文字がない', () => {
    for (const ward of loadWards()) {
      const traits = loadWardTraits(ward.code);
      expect(traits, `${ward.name} (${ward.code})`).toHaveLength(3);
      for (const t of traits) {
        expect(t.trim().length).toBeGreaterThan(0);
        expect(t.length).toBeLessThanOrEqual(30); // カードに収まる短文
      }
    }
  });
  it('未知コードは空配列を返す', () => {
    expect(loadWardTraits('99999')).toEqual([]);
  });
});
