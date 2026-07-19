'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { QUESTIONS, scoreAnswers, type QuizQuestion } from '../lib/quiz';
import type { AxisVector } from '../domain/axes';
import { prefersReducedMotion } from '../hero/quality';
import {
  initialFlowState,
  reduceFlow,
  FLOW_TIMINGS,
  REDUCED_STAMP_MS,
  type FlowEvent,
} from '../lib/diagnosisFlow';

interface DiagnosisProps {
  onComplete: (v: AxisVector, answers: number[]) => void;
  /** 全10問回答が確定した瞬間（フィナーレ入場時）に呼ぶ。結果区の先読みに使う。 */
  onAnswersFixed?: (answers: number[]) => void;
}

const TOTAL = QUESTIONS.length;

// 残ページ数から右端の厚み線の本数を求める（離散段階）。残9問=4本 → 残り少=1本 → 最終=0本。
function thicknessLines(step: number): number {
  const remaining = TOTAL - step - 1; // この質問より後に残っているページ数
  return Math.min(4, Math.ceil(remaining / 2));
}

export function Diagnosis({ onComplete, onAnswersFixed }: DiagnosisProps) {
  // reduced判定はマウント時に一度だけ固定する（フロー分岐が途中で変わらないように）
  const reducedRef = useRef(prefersReducedMotion());
  const reduced = reducedRef.current;
  const opts = useMemo(() => ({ questionCount: TOTAL, reduced }), [reduced]);

  const [flow, setFlow] = useState(() => initialFlowState(opts));
  const { phase, step, picked } = flow;

  const dispatch = (event: FlowEvent) => setFlow((s) => reduceFlow(s, event, opts));

  // 各フェーズ入場時に次イベントを予約。アンマウント・フェーズ遷移でクリアする。
  useEffect(() => {
    let event: FlowEvent | null = null;
    let delay = 0;
    if (phase === 'cover') {
      event = { type: 'COVER_DONE' };
      delay = FLOW_TIMINGS.coverMs;
    } else if (phase === 'stamping') {
      event = { type: 'STAMP_DONE' };
      delay = reduced ? REDUCED_STAMP_MS : FLOW_TIMINGS.stampMs;
    } else if (phase === 'turning') {
      event = { type: 'TURN_DONE' };
      delay = FLOW_TIMINGS.turnMs;
    } else if (phase === 'finale') {
      event = { type: 'FINALE_DONE' };
      delay = FLOW_TIMINGS.finaleMs;
    }
    if (!event) return;
    const ev = event;
    const id = setTimeout(() => setFlow((s) => reduceFlow(s, ev, opts)), delay);
    return () => clearTimeout(id);
    // stepも依存に含め、turning→asking（同フェーズ列ではないが）等の再予約漏れを防ぐ
  }, [phase, step, reduced, opts]);

  // 完走: doneになったら結果を確定して親へ渡す（現行と同じ契約）
  const completedRef = useRef(false);
  useEffect(() => {
    if (phase === 'done' && !completedRef.current) {
      completedRef.current = true;
      onComplete(scoreAnswers(QUESTIONS, flow.answers), flow.answers);
    }
  }, [phase, flow.answers, onComplete]);

  // フィナーレ入場時（＝10問目のSTAMP_DONE時）に回答確定を通知して先読みさせる
  const answersFixedRef = useRef(false);
  useEffect(() => {
    if (phase === 'finale' && !answersFixedRef.current) {
      answersFixedRef.current = true;
      onAnswersFixed?.(flow.answers);
    }
  }, [phase, flow.answers, onAnswersFixed]);

  // ページターン完了後、新しい質問見出しへフォーカスを移す
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (phase === 'asking' && step > 0) {
      headingRef.current?.focus({ preventScroll: true });
    }
  }, [phase, step]);

  if (phase === 'done') {
    // done→onCompleteでアンマウントされる想定。念のため空表示。
    return <div className="diagnosis" aria-live="polite" data-phase="done" />;
  }

  const q = QUESTIONS[step];
  const nextQ: QuizQuestion | undefined = QUESTIONS[step + 1];
  const interactive = phase === 'asking';
  const valueNow = Math.min(step + 1, TOTAL);

  return (
    <div className="diagnosis" aria-live="polite" data-phase={phase}>
      {/* 表紙（cover）。開くと下の質問ページが現れる。reduced時は描画しない */}
      {phase === 'cover' && (
        <div className="diagnosis-cover" aria-hidden="true">
          <div className="diagnosis-cover-front">
            <p className="diagnosis-cover-eyebrow">SHINDAN</p>
            <h3 className="diagnosis-cover-title">10問診断</h3>
            <span className="diagnosis-cover-rule" />
            <p className="diagnosis-cover-lede">ページをめくって、はじめよう</p>
          </div>
        </div>
      )}

      {phase === 'finale' ? (
        <Finale onSkip={() => dispatch({ type: 'SKIP' })} />
      ) : (
        <>
          {/* 上部の金プログレスバー */}
          <div
            className="diagnosis-progress"
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={TOTAL}
            aria-valuenow={valueNow}
            aria-label="診断の進捗"
          >
            <span className="diagnosis-progress-track" aria-hidden="true">
              <span
                className="diagnosis-progress-fill"
                style={{ width: `${(valueNow / TOTAL) * 100}%` }}
              />
            </span>
          </div>
          {/* スクリーンリーダー向けの現在地（aria-live領域内） */}
          <span className="diagnosis-sronly">
            質問 {valueNow} / {TOTAL}
          </span>

          {/* 3D舞台。turning中は2層（下層=次の質問／上層=現在の質問）を重ねる */}
          <div className="diagnosis-stage">
            {phase === 'turning' && nextQ && (
              <div className="diagnosis-page diagnosis-page-under" aria-hidden="true">
                <QuestionPageBody q={nextQ} step={step + 1} picked={null} interactive={false} />
              </div>
            )}
            <div className={`diagnosis-page diagnosis-page-top${phase === 'turning' ? ' is-turning' : ''}`}>
              <QuestionPageBody
                q={q}
                step={step}
                picked={picked}
                interactive={interactive}
                headingRef={headingRef}
                onPick={(i) => dispatch({ type: 'PICK', option: i })}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// 1ページ分（羊皮紙）の中身。ターン時は同じ構造を2層描画する。
function QuestionPageBody({
  q,
  step,
  picked,
  interactive,
  headingRef,
  onPick,
}: {
  q: QuizQuestion;
  step: number;
  picked: number | null;
  interactive: boolean;
  headingRef?: React.Ref<HTMLHeadingElement>;
  onPick?: (option: number) => void;
}) {
  const lines = thicknessLines(step);
  return (
    <div className="diagnosis-sheet">
      {/* 右端の厚み表現（残ページ数に応じて減る） */}
      {lines > 0 && (
        <span className="diagnosis-thickness" aria-hidden="true">
          {Array.from({ length: lines }, (_, i) => (
            <span key={i} className="diagnosis-thickness-line" />
          ))}
        </span>
      )}

      <h3 className="diagnosis-question" tabIndex={-1} ref={headingRef}>
        {q.text}
      </h3>

      <div className="diagnosis-options">
        {q.options.map((opt, i) => {
          const isPicked = picked === i;
          const dim = picked !== null && !isPicked;
          return (
            <button
              key={i}
              type="button"
              className={`diagnosis-option${dim ? ' diagnosis-option-dim' : ''}`}
              disabled={!interactive}
              onClick={interactive && onPick ? () => onPick(i) : undefined}
            >
              {opt.label}
              {isPicked && (
                <span className="diagnosis-seal" aria-hidden="true">
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ノンブル（ページ番号） */}
      <span className="diagnosis-nombre" aria-hidden="true">
        — {step + 1} / {TOTAL} —
      </span>
    </div>
  );
}

// フィナーレ: 装飾ページがパラパラめくれ、最後に「あなたに一番似ているのは…」。
// クリック / Enter / Space でスキップ（即done）。
function Finale({ onSkip }: { onSkip: () => void }) {
  // マウント時にフォーカスを当て、Enter/Spaceが即座にスキップへ届くようにする
  // （asking時の質問見出しフォーカスと同じパターン）
  const finaleRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    finaleRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <div
      ref={finaleRef}
      className="diagnosis-finale"
      role="button"
      tabIndex={0}
      aria-label="結果へ進む"
      onClick={onSkip}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSkip();
        }
      }}
    >
      <div className="diagnosis-finale-stack" aria-hidden="true">
        <span className="diagnosis-finale-page" />
        <span className="diagnosis-finale-page" />
        <span className="diagnosis-finale-page" />
        <span className="diagnosis-finale-page" />
      </div>
      <p className="diagnosis-finale-caption">あなたに一番似ているのは…</p>
      <span className="diagnosis-finale-skip" aria-hidden="true">
        タップでスキップ
      </span>
    </div>
  );
}
