import { describe, it, expect, beforeEach } from 'vitest';
import { saveDiagnosis, loadDiagnosis, loadDiagnosisSession } from './diagnosisSession';
import { emptyVector } from '../domain/axes';

describe('diagnosisSession', () => {
  beforeEach(() => sessionStorage.clear());
  it('round-trips a vector', () => {
    const v = { ...emptyVector(), liveliness: 0.5 };
    saveDiagnosis(v, '13103');
    expect(loadDiagnosis()).toEqual(v);
    expect(loadDiagnosisSession()).toEqual({ vector: v, resultCode: '13103' });
  });
  it('returns null when empty or corrupt', () => {
    expect(loadDiagnosis()).toBeNull();
    sessionStorage.setItem('kuchan.diagnosis', '{broken');
    expect(loadDiagnosis()).toBeNull();
  });
});
