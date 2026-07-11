import { describe, it, expect, beforeEach } from 'vitest';
import { saveDiagnosis, loadDiagnosis } from './diagnosisSession';
import { emptyVector } from '../domain/axes';

describe('diagnosisSession', () => {
  beforeEach(() => sessionStorage.clear());
  it('round-trips a vector', () => {
    const v = { ...emptyVector(), liveliness: 0.5 };
    saveDiagnosis(v);
    expect(loadDiagnosis()).toEqual(v);
  });
  it('returns null when empty or corrupt', () => {
    expect(loadDiagnosis()).toBeNull();
    sessionStorage.setItem('kuchan.diagnosis', '{broken');
    expect(loadDiagnosis()).toBeNull();
  });
});
