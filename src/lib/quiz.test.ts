import { describe, it, expect } from 'vitest';
import { scoreAnswers, QUESTIONS, type QuizQuestion } from './quiz';

const sample: QuizQuestion[] = [
  { id: 'q1', text: '?', options: [
    { label: 'A', deltas: { liveliness: 1 } },
    { label: 'B', deltas: { liveliness: -1 } },
  ] },
  { id: 'q2', text: '?', options: [
    { label: 'A', deltas: { liveliness: 1, greenery: -1 } },
    { label: 'B', deltas: { greenery: 1 } },
  ] },
];

describe('scoreAnswers', () => {
  it('averages deltas per axis across answered questions', () => {
    // q1->A(liveliness+1), q2->A(liveliness+1, greenery-1)
    const v = scoreAnswers(sample, [0, 0]);
    expect(v.liveliness).toBe(1); // (1+1)/2
    expect(v.greenery).toBe(-1);  // (-1)/1
    expect(v.maturity).toBe(0);   // untouched
  });
  it('ignores out-of-range answers', () => {
    const v = scoreAnswers(sample, [5, 1]);
    expect(v.liveliness).toBe(0); // only q2->B touches nothing for liveliness
    expect(v.greenery).toBe(1);
  });
});

describe('QUESTIONS', () => {
  it('has exactly 10 questions, each with >=2 options', () => {
    expect(QUESTIONS).toHaveLength(10);
    expect(QUESTIONS.every((q) => q.options.length >= 2)).toBe(true);
  });
  it('every axis is touched by at least 2 questions', () => {
    const counts: Record<string, number> = {};
    for (const q of QUESTIONS) {
      const touched = new Set(q.options.flatMap((o) => Object.keys(o.deltas)));
      for (const k of touched) counts[k] = (counts[k] ?? 0) + 1;
    }
    for (const k of ['liveliness', 'maturity', 'greenery', 'family', 'luxury']) {
      expect(counts[k], `axis ${k}`).toBeGreaterThanOrEqual(2);
    }
  });
});
