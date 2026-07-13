import { describe, expect, it } from 'vitest';
import snapshot from '../data/diagnosis-assignments.json';
import { loadWards } from '../data/wards';
import { QUESTIONS } from './quiz';
import {
  analyzeDiagnosisAssignments,
  bestDiagnosisMatch,
  buildDiagnosisAssignments,
  decodeAnswers,
} from './diagnosisMatching';

const wards = loadWards();

describe('diagnosis matching calibration', () => {
  it('covers every ward between 1% and 10% of all answer patterns', () => {
    const report = analyzeDiagnosisAssignments(snapshot, QUESTIONS, wards);

    expect(report.totalPatterns).toBe(1024);
    expect(report.counts).toHaveLength(23);
    expect(Math.min(...report.counts)).toBeGreaterThanOrEqual(11);
    expect(Math.max(...report.counts)).toBeLessThanOrEqual(102);
    expect(report.maximumRawRank).toBeLessThanOrEqual(5);
  });

  it('keeps the committed snapshot synchronized with the deterministic generator', () => {
    expect(buildDiagnosisAssignments(QUESTIONS, wards)).toEqual(snapshot);
  });

  it('uses the calibrated result for every valid answer pattern', () => {
    for (let index = 0; index < snapshot.assignments.length; index += 1) {
      const answers = decodeAnswers(index, snapshot.optionCounts);
      expect(bestDiagnosisMatch(answers, wards).code).toBe(
        snapshot.wardCodes[snapshot.assignments[index]],
      );
    }
  });
});
