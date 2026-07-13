import { describe, it, expect } from 'vitest';
import { distance, rankDiagnosisMatches, rankMatches, bestMatch } from './matching';
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
