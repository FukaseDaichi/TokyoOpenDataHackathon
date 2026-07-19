import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { FLOW_TIMINGS, REDUCED_STAMP_MS } from '../lib/diagnosisFlow';

// prefersReducedMotion をテストから切り替える（jsdomにmatchMediaが無いためモック必須）
const { reducedState } = vi.hoisted(() => ({ reducedState: { value: false } }));
vi.mock('../hero/quality', () => ({
  prefersReducedMotion: () => reducedState.value,
}));

// モック確定後に読み込む
import { Diagnosis } from './Diagnosis';

const advance = (ms: number) => act(() => void vi.advanceTimersByTime(ms));
const firstOption = () => screen.getAllByRole('button')[0];

describe('Diagnosis（絵本ページめくり）', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    reducedState.value = false;
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('表紙が開いてから10問を封蝋→ページターンで進み、フィナーレ後にonComplete', () => {
    const onComplete = vi.fn();
    const onAnswersFixed = vi.fn();
    render(<Diagnosis onComplete={onComplete} onAnswersFixed={onAnswersFixed} />);

    // 表紙オープニングが開くまで（cover）
    advance(FLOW_TIMINGS.coverMs);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1');

    for (let i = 0; i < 10; i++) {
      fireEvent.click(firstOption()); // 常に先頭の選択肢
      // 封蝋中は選択肢がdisabled
      screen.getAllByRole('button').forEach((b) => expect(b).toBeDisabled());
      advance(reducedState.value ? REDUCED_STAMP_MS : FLOW_TIMINGS.stampMs);
      if (i < 9) advance(FLOW_TIMINGS.turnMs); // 10問目はターンせずフィナーレへ
    }

    // フィナーレ入場で回答確定通知が1回。onCompleteはまだ。
    expect(onAnswersFixed).toHaveBeenCalledTimes(1);
    expect(onAnswersFixed.mock.calls[0][0]).toEqual(new Array(10).fill(0));
    expect(onComplete).not.toHaveBeenCalled();

    // フィナーレ演出の完了でdone→onComplete
    advance(FLOW_TIMINGS.finaleMs);
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete.mock.calls[0][1]).toEqual(new Array(10).fill(0));
  });

  it('封蝋中に選択肢を連打しても回答は増えず、1問だけ進む', () => {
    const onComplete = vi.fn();
    render(<Diagnosis onComplete={onComplete} />);
    advance(FLOW_TIMINGS.coverMs);

    fireEvent.click(firstOption()); // q1確定 → stamping
    // disabledなボタンを連打
    screen.getAllByRole('button').forEach((b) => {
      fireEvent.click(b);
      fireEvent.click(b);
    });
    advance(FLOW_TIMINGS.stampMs);
    advance(FLOW_TIMINGS.turnMs);

    // q2に進んでいる（進みすぎていない）
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '2');
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('フィナーレのクリックで即スキップしonComplete', () => {
    const onComplete = vi.fn();
    render(<Diagnosis onComplete={onComplete} />);
    advance(FLOW_TIMINGS.coverMs);
    for (let i = 0; i < 10; i++) {
      fireEvent.click(firstOption());
      advance(FLOW_TIMINGS.stampMs);
      if (i < 9) advance(FLOW_TIMINGS.turnMs);
    }
    // フィナーレ表示中（finaleMs未経過）にクリック
    fireEvent.click(screen.getByRole('button', { name: '結果へ進む' }));
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete.mock.calls[0][1]).toEqual(new Array(10).fill(0));
  });

  it('progressbarとノンブルで進捗を示す', () => {
    reducedState.value = true; // 即askingで検証を簡潔に
    render(<Diagnosis onComplete={() => {}} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuemin', '1');
    expect(bar).toHaveAttribute('aria-valuemax', '10');
    expect(bar).toHaveAttribute('aria-valuenow', '1');
    expect(bar).toHaveAttribute('aria-label', '診断の進捗');
    expect(screen.getByText(/—\s*1\s*\/\s*10\s*—/)).toBeInTheDocument();
    expect(screen.getByText(/質問\s*1\s*\/\s*10/)).toBeInTheDocument();
  });

  it('reduced-motion時: 表紙なしで即座に進行し完走する', () => {
    reducedState.value = true;
    const onComplete = vi.fn();
    const onAnswersFixed = vi.fn();
    render(<Diagnosis onComplete={onComplete} onAnswersFixed={onAnswersFixed} />);

    // 表紙（cover）は描画されない
    expect(screen.queryByText('10問診断')).toBeNull();
    // 初期からaskingで選択可能
    expect(firstOption()).not.toBeDisabled();

    for (let i = 0; i < 10; i++) {
      fireEvent.click(firstOption());
      advance(REDUCED_STAMP_MS); // ターン・フィナーレを経由しない
    }
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete.mock.calls[0][1]).toEqual(new Array(10).fill(0));
    // reducedはフィナーレが無いのでonAnswersFixedは呼ばれない
    expect(onAnswersFixed).not.toHaveBeenCalled();
  });
});
