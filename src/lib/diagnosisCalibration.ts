import type { Ward } from '../domain/axes';
import { rankMatches } from './matching';
import { scoreAnswers, type QuizQuestion } from './quiz';

export const DIAGNOSIS_MINIMUM_SHARE = 0.01;
export const DIAGNOSIS_MAXIMUM_SHARE = 0.1;
export const DIAGNOSIS_MAXIMUM_RAW_RANK = 5;

export interface DiagnosisAssignmentSnapshot {
  version: 1;
  questionIds: string[];
  optionCounts: number[];
  wardCodes: string[];
  constraints: {
    minimumShare: number;
    maximumShare: number;
    maximumRawRank: number;
    minimumCount: number;
    maximumCount: number;
  };
  assignments: number[];
  counts: number[];
  maximumRawRank: number;
}

interface PatternRanking {
  rankedWardIndexes: number[];
  distances: number[];
  assignedWardIndex: number;
}

export function answerPatternCount(optionCounts: number[]): number {
  return optionCounts.reduce((total, count) => total * count, 1);
}

export function decodeAnswers(index: number, optionCounts: number[]): number[] {
  const answers: number[] = [];
  let remainder = index;
  for (const optionCount of optionCounts) {
    answers.push(remainder % optionCount);
    remainder = Math.floor(remainder / optionCount);
  }
  return answers;
}

export function encodeAnswers(answers: number[], optionCounts: number[]): number | null {
  if (answers.length !== optionCounts.length) return null;
  let index = 0;
  let multiplier = 1;
  for (let i = 0; i < optionCounts.length; i += 1) {
    const answer = answers[i];
    if (!Number.isInteger(answer) || answer < 0 || answer >= optionCounts[i]) return null;
    index += answer * multiplier;
    multiplier *= optionCounts[i];
  }
  return index;
}

function countAssignments(patterns: PatternRanking[], wardCount: number): number[] {
  const counts = new Array<number>(wardCount).fill(0);
  for (const pattern of patterns) counts[pattern.assignedWardIndex] += 1;
  return counts;
}

function moveBestPattern(
  patterns: PatternRanking[],
  counts: number[],
  canDonate: (count: number) => boolean,
  canReceive: (count: number) => boolean,
  maximumRawRank: number,
): boolean {
  let bestPatternIndex = -1;
  let bestWardIndex = -1;
  let bestDistanceIncrease = Number.POSITIVE_INFINITY;

  for (let patternIndex = 0; patternIndex < patterns.length; patternIndex += 1) {
    const pattern = patterns[patternIndex];
    if (!canDonate(counts[pattern.assignedWardIndex])) continue;
    const currentDistance = pattern.distances[pattern.assignedWardIndex];

    for (let rank = 0; rank < maximumRawRank; rank += 1) {
      const targetWardIndex = pattern.rankedWardIndexes[rank];
      if (!canReceive(counts[targetWardIndex])) continue;
      const distanceIncrease = pattern.distances[targetWardIndex] - currentDistance;
      if (distanceIncrease < bestDistanceIncrease) {
        bestPatternIndex = patternIndex;
        bestWardIndex = targetWardIndex;
        bestDistanceIncrease = distanceIncrease;
      }
    }
  }

  if (bestPatternIndex < 0) return false;
  const pattern = patterns[bestPatternIndex];
  counts[pattern.assignedWardIndex] -= 1;
  pattern.assignedWardIndex = bestWardIndex;
  counts[bestWardIndex] += 1;
  return true;
}

export function buildDiagnosisAssignments(
  questions: QuizQuestion[],
  wards: Ward[],
  minimumShare = DIAGNOSIS_MINIMUM_SHARE,
  maximumShare = DIAGNOSIS_MAXIMUM_SHARE,
  maximumRawRank = DIAGNOSIS_MAXIMUM_RAW_RANK,
): DiagnosisAssignmentSnapshot {
  const optionCounts = questions.map((question) => question.options.length);
  const totalPatterns = answerPatternCount(optionCounts);
  const minimumCount = Math.ceil(totalPatterns * minimumShare);
  const maximumCount = Math.floor(totalPatterns * maximumShare);
  if (minimumCount * wards.length > totalPatterns || maximumCount * wards.length < totalPatterns) {
    throw new Error('Diagnosis share constraints cannot cover all answer patterns.');
  }

  const wardIndexByCode = new Map(wards.map((ward, index) => [ward.code, index]));
  const patterns: PatternRanking[] = [];
  for (let patternIndex = 0; patternIndex < totalPatterns; patternIndex += 1) {
    const answers = decodeAnswers(patternIndex, optionCounts);
    const ranked = rankMatches(scoreAnswers(questions, answers), wards);
    const rankedWardIndexes = ranked.map((match) => wardIndexByCode.get(match.ward.code)!);
    const distances = new Array<number>(wards.length);
    ranked.forEach((match, rank) => {
      distances[rankedWardIndexes[rank]] = match.distance;
    });
    patterns.push({ rankedWardIndexes, distances, assignedWardIndex: rankedWardIndexes[0] });
  }

  const counts = countAssignments(patterns, wards.length);
  while (counts.some((count) => count < minimumCount)) {
    const moved = moveBestPattern(
      patterns,
      counts,
      (count) => count > minimumCount,
      (count) => count < minimumCount,
      maximumRawRank,
    );
    if (!moved) throw new Error(`Could not satisfy the diagnosis minimum with raw rank ${maximumRawRank}.`);
  }

  while (counts.some((count) => count > maximumCount)) {
    const moved = moveBestPattern(
      patterns,
      counts,
      (count) => count > maximumCount,
      (count) => count < maximumCount,
      maximumRawRank,
    );
    if (!moved) throw new Error(`Could not satisfy the diagnosis maximum with raw rank ${maximumRawRank}.`);
  }

  const assignedRawRanks = patterns.map(
    (pattern) => pattern.rankedWardIndexes.indexOf(pattern.assignedWardIndex) + 1,
  );
  return {
    version: 1,
    questionIds: questions.map((question) => question.id),
    optionCounts,
    wardCodes: wards.map((ward) => ward.code),
    constraints: {
      minimumShare,
      maximumShare,
      maximumRawRank,
      minimumCount,
      maximumCount,
    },
    assignments: patterns.map((pattern) => pattern.assignedWardIndex),
    counts,
    maximumRawRank: Math.max(...assignedRawRanks),
  };
}

export function analyzeDiagnosisAssignments(
  snapshot: DiagnosisAssignmentSnapshot,
  questions: QuizQuestion[],
  wards: Ward[],
): { totalPatterns: number; counts: number[]; maximumRawRank: number } {
  const counts = new Array<number>(wards.length).fill(0);
  let maximumRawRank = 0;
  snapshot.assignments.forEach((assignedWardIndex, patternIndex) => {
    counts[assignedWardIndex] += 1;
    const answers = decodeAnswers(patternIndex, snapshot.optionCounts);
    const ranked = rankMatches(scoreAnswers(questions, answers), wards);
    const assignedCode = snapshot.wardCodes[assignedWardIndex];
    maximumRawRank = Math.max(
      maximumRawRank,
      ranked.findIndex((match) => match.ward.code === assignedCode) + 1,
    );
  });
  return { totalPatterns: snapshot.assignments.length, counts, maximumRawRank };
}
