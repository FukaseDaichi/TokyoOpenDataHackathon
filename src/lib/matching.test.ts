import { describe, it, expect } from 'vitest';
import { distance, rankDiagnosisMatches, rankMatches, bestMatch, compatibilityPercents, similarityPercent } from './matching';
import { emptyVector, type Ward } from '../domain/axes';

const wardAt = (name: string, liveliness: number): Ward => ({
  code: name, name, axes: { ...emptyVector(), liveliness },
});

describe('matching', () => {
  it('computes euclidean distance', () => {
    const a = { ...emptyVector(), liveliness: 0 };
    const b = { ...emptyVector(), liveliness: 1 };
    expect(distance(a, b)).toBe(1);
  });
  it('ranks nearest ward first', () => {
    const wards = [wardAt('far', 1), wardAt('near', 0.1)];
    const user = { ...emptyVector(), liveliness: 0 };
    const ranked = rankMatches(user, wards);
    expect(ranked[0].ward.name).toBe('near');
    expect(bestMatch(user, wards).name).toBe('near');
  });
  it('puts the calibrated diagnosis winner first and keeps the remaining distance order', () => {
    const wards = [wardAt('first', 0.1), wardAt('second', 0.2), wardAt('calibrated', 0.3)];
    const ranked = rankDiagnosisMatches(emptyVector(), wards, 'calibrated');
    expect(ranked.map((match) => match.ward.name)).toEqual(['calibrated', 'first', 'second']);
  });
});

describe('compatibilityPercents', () => {
  // similarityPercent: 0.5→89, 1.0→78, 1.2→73, 1.5→66, 2.0→55
  it('逆転がなければ生の%をそのまま返す', () => {
    expect(compatibilityPercents(0.5, [1.0, 1.5])).toEqual([78, 66]);
  });
  it('相性側が結果を上回る場合は最大が「結果%−1」になるよう比例スケーリングする', () => {
    // 結果=78%、生=[89, 73, 55] → cap 77 → [77, 63, 47]
    expect(compatibilityPercents(1.0, [0.5, 1.2, 2.0])).toEqual([77, 63, 47]);
  });
  it('スケーリング後も同距離は同%のまま', () => {
    expect(compatibilityPercents(1.0, [0.5, 0.5, 2.0])).toEqual([77, 77, 47]);
  });
  it('空リストと結果0%の境界で壊れない', () => {
    expect(compatibilityPercents(1.0, [])).toEqual([]);
    const maxD = Math.sqrt(20);
    expect(compatibilityPercents(maxD, [0.1])).toEqual([0]); // cap は負にならない
    expect(compatibilityPercents(maxD, [maxD])).toEqual([0]); // 生が全0でも0除算しない
  });
});
