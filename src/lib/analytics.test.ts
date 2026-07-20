import { describe, it, expect, vi, afterEach } from 'vitest';
import { trackDiagnosisAnswer, trackDiagnosisResult } from './analytics';

type GtagWindow = Window & { gtag?: (...args: unknown[]) => void };
const win = window as GtagWindow;

afterEach(() => {
  delete win.gtag;
});

describe('analytics（GA4計測ラッパー）', () => {
  it('gtag不在（GA未設定・広告ブロック）でも例外を出さずno-op', () => {
    expect(() => trackDiagnosisAnswer('q1', 0)).not.toThrow();
    expect(() => trackDiagnosisResult('chiyoda')).not.toThrow();
  });

  it('trackDiagnosisAnswerはquestion_idとchoice_indexを送る', () => {
    const gtag = vi.fn();
    win.gtag = gtag;
    trackDiagnosisAnswer('q3', 2);
    expect(gtag).toHaveBeenCalledTimes(1);
    expect(gtag).toHaveBeenCalledWith('event', 'diagnosis_answer', {
      question_id: 'q3',
      choice_index: 2,
    });
  });

  it('trackDiagnosisResultはward_slugを送る', () => {
    const gtag = vi.fn();
    win.gtag = gtag;
    trackDiagnosisResult('setagaya');
    expect(gtag).toHaveBeenCalledTimes(1);
    expect(gtag).toHaveBeenCalledWith('event', 'diagnosis_result', {
      ward_slug: 'setagaya',
    });
  });

  it('gtagが例外を投げても外へ伝播しない', () => {
    win.gtag = () => {
      throw new Error('gtag broken');
    };
    expect(() => trackDiagnosisAnswer('q1', 0)).not.toThrow();
    expect(() => trackDiagnosisResult('chiyoda')).not.toThrow();
  });
});
