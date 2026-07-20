import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { FLOW_TIMINGS, REDUCED_STAMP_MS } from '../lib/diagnosisFlow';

// prefersReducedMotion をテストから切り替える（jsdomにmatchMediaが無いためモック必須）
const { reducedState } = vi.hoisted(() => ({ reducedState: { value: false } }));
vi.mock('../hero/quality', () => ({
  prefersReducedMotion: () => reducedState.value,
}));

const { analyticsSpies } = vi.hoisted(() => ({
  analyticsSpies: { trackDiagnosisAnswer: vi.fn() },
}));
vi.mock('../lib/analytics', () => ({
  trackDiagnosisAnswer: analyticsSpies.trackDiagnosisAnswer,
  trackDiagnosisResult: vi.fn(),
}));

// モック確定後に読み込む
import { Diagnosis } from './Diagnosis';

const advance = (ms: number) => act(() => void vi.advanceTimersByTime(ms));
const firstOption = () => screen.getAllByRole('button')[0];

describe('Diagnosis（絵本ページめくり）', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    reducedState.value = false;
    analyticsSpies.trackDiagnosisAnswer.mockClear();
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
      advance(FLOW_TIMINGS.stampMs);
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

  it('フィナーレはマウント時にフォーカスされ、Enterで即スキップしonComplete', () => {
    const onComplete = vi.fn();
    render(<Diagnosis onComplete={onComplete} />);
    advance(FLOW_TIMINGS.coverMs);
    for (let i = 0; i < 10; i++) {
      fireEvent.click(firstOption());
      advance(FLOW_TIMINGS.stampMs);
      if (i < 9) advance(FLOW_TIMINGS.turnMs);
    }
    const finale = screen.getByRole('button', { name: '結果へ進む' });
    // フィナーレ表示中（finaleMs未経過）にフォーカスが当たっている
    expect(finale).toHaveFocus();
    fireEvent.keyDown(finale, { key: 'Enter' });
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

  it('回答が確定するたびにtrackDiagnosisAnswerへ質問IDと選択肢番号を送る', () => {
    reducedState.value = true; // 即askingで進行を簡潔に
    render(<Diagnosis onComplete={() => {}} />);

    fireEvent.click(screen.getAllByRole('button')[1]); // q1: 2番目の選択肢
    advance(REDUCED_STAMP_MS);
    fireEvent.click(screen.getAllByRole('button')[0]); // q2: 先頭の選択肢

    expect(analyticsSpies.trackDiagnosisAnswer).toHaveBeenCalledTimes(2);
    expect(analyticsSpies.trackDiagnosisAnswer).toHaveBeenNthCalledWith(1, 'q1', 1);
    expect(analyticsSpies.trackDiagnosisAnswer).toHaveBeenNthCalledWith(2, 'q2', 0);
  });

  it('封蝋中（disabled）の連打では回答イベントを重複送信しない', () => {
    reducedState.value = true;
    render(<Diagnosis onComplete={() => {}} />);

    fireEvent.click(screen.getAllByRole('button')[0]); // q1確定 → stamping
    screen.getAllByRole('button').forEach((b) => fireEvent.click(b)); // disabled連打
    expect(analyticsSpies.trackDiagnosisAnswer).toHaveBeenCalledTimes(1);
  });
});
