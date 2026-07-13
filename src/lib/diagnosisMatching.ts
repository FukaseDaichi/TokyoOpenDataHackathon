import snapshotJson from '../data/diagnosis-assignments.json';
import type { Ward } from '../domain/axes';
import { bestMatch } from './matching';
import { QUESTIONS, scoreAnswers } from './quiz';
import {
  encodeAnswers,
  type DiagnosisAssignmentSnapshot,
} from './diagnosisCalibration';

const snapshot = snapshotJson as DiagnosisAssignmentSnapshot;

export {
  analyzeDiagnosisAssignments,
  buildDiagnosisAssignments,
  decodeAnswers,
  encodeAnswers,
} from './diagnosisCalibration';

export function bestDiagnosisMatch(answers: number[], wards: Ward[]): Ward {
  const patternIndex = encodeAnswers(answers, snapshot.optionCounts);
  const wardIndexByCode = new Map(wards.map((ward) => [ward.code, ward]));
  if (
    patternIndex === null
    || patternIndex >= snapshot.assignments.length
    || snapshot.questionIds.some((id, index) => QUESTIONS[index]?.id !== id)
    || snapshot.optionCounts.some((count, index) => QUESTIONS[index]?.options.length !== count)
  ) {
    return bestMatch(scoreAnswers(QUESTIONS, answers), wards);
  }
  const wardCode = snapshot.wardCodes[snapshot.assignments[patternIndex]];
  return wardIndexByCode.get(wardCode) ?? bestMatch(scoreAnswers(QUESTIONS, answers), wards);
}
