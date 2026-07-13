import { describe, it, expect } from 'vitest';
import { loadCharacterRationale } from './rationale';
import { loadWards } from './wards';

describe('character rationale', () => {
  it('covers all 23 wards with non-empty text', () => {
    const wards = loadWards();
    expect(wards).toHaveLength(23);
    for (const w of wards) {
      const text = loadCharacterRationale(w.code);
      expect(text, `${w.code} ${w.name}`).toBeTruthy();
      // データ根拠型3〜4文: 十分な長さがあること
      expect(text!.length, `${w.code} ${w.name}`).toBeGreaterThan(80);
    }
  });

  it('returns null for unknown codes', () => {
    expect(loadCharacterRationale('99999')).toBeNull();
  });

  it('mentions the flagship data evidence for representative wards', () => {
    // 千代田=昼夜間人口比率 / 港=財政力 / 江戸川=公園
    expect(loadCharacterRationale('13101')).toMatch(/昼夜間人口比率/);
    expect(loadCharacterRationale('13103')).toMatch(/財政力指数/);
    expect(loadCharacterRationale('13123')).toMatch(/公園/);
  });
});
