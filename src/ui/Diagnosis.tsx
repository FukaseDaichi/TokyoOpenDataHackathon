'use client';

import { useState } from 'react';
import { QUESTIONS, scoreAnswers } from '../lib/quiz';
import type { AxisVector } from '../domain/axes';

export function Diagnosis({ onComplete }: { onComplete: (v: AxisVector) => void }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const q = QUESTIONS[step];

  const pick = (optionIndex: number) => {
    const next = [...answers, optionIndex];
    if (step + 1 >= QUESTIONS.length) {
      onComplete(scoreAnswers(QUESTIONS, next));
    } else {
      setAnswers(next);
      setStep(step + 1);
    }
  };

  return (
    <div className="diagnosis" aria-live="polite">
      <p className="diagnosis-progress">
        <span className="diagnosis-progress-count">{step + 1} / {QUESTIONS.length}</span>
        <span className="diagnosis-progress-track" aria-hidden="true">
          <span
            className="diagnosis-progress-fill"
            style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }}
          />
        </span>
      </p>
      <h3 className="diagnosis-question">{q.text}</h3>
      <div className="diagnosis-options">
        {q.options.map((opt, i) => (
          <button key={i} className="diagnosis-option" onClick={() => pick(i)}>
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
