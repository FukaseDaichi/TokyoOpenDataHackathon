import { describe, it, expect } from 'vitest';
import { AXIS_KEYS } from '../domain/axes';
import { loadAffinityText } from './affinity';
import { loadWards } from './wards';

describe('ward affinity texts', () => {
  it('covers all 23 wards x 5 axes with non-empty text', () => {
    const wards = loadWards();
    expect(wards).toHaveLength(23);
    for (const w of wards) {
      for (const axis of AXIS_KEYS) {
        const text = loadAffinityText(w.code, axis);
        expect(text, `${w.code} ${w.name} ${axis}`).toBeTruthy();
        // 実データ根拠つき2〜3文: 十分な長さがあること
        expect(text!.length, `${w.code} ${w.name} ${axis}`).toBeGreaterThan(40);
      }
    }
  });

  it('returns null for unknown codes and axes', () => {
    expect(loadAffinityText('99999', 'liveliness')).toBeNull();
  });

  it('mentions the underlying open data for representative pairs', () => {
    // 新宿×世帯=単身世帯率1位 / 千代田×賑わい=昼夜間人口比率 / 江戸川×みどり=公園
    expect(loadAffinityText('13104', 'family')).toMatch(/単身世帯率/);
    expect(loadAffinityText('13101', 'liveliness')).toMatch(/昼夜間人口比率/);
    expect(loadAffinityText('13123', 'greenery')).toMatch(/公園/);
  });
});
