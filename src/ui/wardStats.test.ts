import { describe, it, expect } from 'vitest';
import { emptyVector } from '../domain/axes';
import { statLabelForAxis } from './wardStats';

describe('statLabelForAxis', () => {
  it('maps each axis to its underlying metric label', () => {
    const axes = emptyVector();
    expect(statLabelForAxis('liveliness', axes)).toBe('昼夜間人口比率');
    expect(statLabelForAxis('maturity', axes)).toBe('高齢化率');
    expect(statLabelForAxis('greenery', axes)).toBe('一人当たり公立公園面積');
    expect(statLabelForAxis('luxury', axes)).toBe('財政力指数');
  });

  it('picks the household metric matching the ward-side sign of the family axis', () => {
    expect(statLabelForAxis('family', { ...emptyVector(), family: 0.5 })).toBe('子育て世帯率');
    expect(statLabelForAxis('family', { ...emptyVector(), family: -0.5 })).toBe('単身世帯率');
    // 0は高い側（子育て）に倒す
    expect(statLabelForAxis('family', emptyVector())).toBe('子育て世帯率');
  });
});
