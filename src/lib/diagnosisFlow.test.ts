import { describe, it, expect } from 'vitest';
import { initialFlowState, reduceFlow, FLOW_TIMINGS, REDUCED_STAMP_MS, type FlowState } from './diagnosisFlow';

const opts = (questionCount: number, reduced = false) => ({ questionCount, reduced });

describe('diagnosisFlow', () => {
  it('通常時: cover→asking→(PICK/STAMP_DONE/TURN_DONE)×9→PICK→STAMP_DONE→finale→FINALE_DONE→done', () => {
    const o = opts(10);
    let s = initialFlowState(o);
    expect(s).toEqual({ phase: 'cover', step: 0, picked: null, answers: [] });

    s = reduceFlow(s, { type: 'COVER_DONE' }, o);
    expect(s.phase).toBe('asking');

    for (let i = 0; i < 9; i++) {
      s = reduceFlow(s, { type: 'PICK', option: i % 2 }, o);
      expect(s.phase).toBe('stamping');
      expect(s.picked).toBe(i % 2);
      expect(s.answers).toHaveLength(i + 1);

      s = reduceFlow(s, { type: 'STAMP_DONE' }, o);
      expect(s.phase).toBe('turning');

      s = reduceFlow(s, { type: 'TURN_DONE' }, o);
      expect(s.phase).toBe('asking');
      expect(s.step).toBe(i + 1);
      expect(s.picked).toBeNull();
    }

    // 10問目
    s = reduceFlow(s, { type: 'PICK', option: 1 }, o);
    expect(s.phase).toBe('stamping');
    expect(s.answers).toHaveLength(10);

    s = reduceFlow(s, { type: 'STAMP_DONE' }, o);
    expect(s.phase).toBe('finale');

    s = reduceFlow(s, { type: 'FINALE_DONE' }, o);
    expect(s.phase).toBe('done');
    expect(s.answers).toEqual([0, 1, 0, 1, 0, 1, 0, 1, 0, 1]);
  });

  it('stamping/turning/finale中のPICKは無視される（answersが増えない）', () => {
    const o = opts(2);
    let s = initialFlowState(o);
    s = reduceFlow(s, { type: 'COVER_DONE' }, o);
    s = reduceFlow(s, { type: 'PICK', option: 0 }, o);
    expect(s.phase).toBe('stamping');

    // stamping中のPICKは無視
    const stamping = reduceFlow(s, { type: 'PICK', option: 1 }, o);
    expect(stamping).toEqual(s);

    s = reduceFlow(s, { type: 'STAMP_DONE' }, o);
    expect(s.phase).toBe('turning');

    // turning中のPICKは無視
    const turning = reduceFlow(s, { type: 'PICK', option: 1 }, o);
    expect(turning).toEqual(s);

    s = reduceFlow(s, { type: 'TURN_DONE' }, o);
    s = reduceFlow(s, { type: 'PICK', option: 1 }, o);
    s = reduceFlow(s, { type: 'STAMP_DONE' }, o);
    expect(s.phase).toBe('finale');

    // finale中のPICKは無視
    const finale = reduceFlow(s, { type: 'PICK', option: 0 }, o);
    expect(finale).toEqual(s);
    expect(s.answers).toHaveLength(2);
  });

  it('finale+SKIP→done、asking中のSKIPは無視', () => {
    const o = opts(1);
    let s = initialFlowState(o);
    // asking中のSKIPは無視（coverでもasking未到達なので先にaskingへ）
    s = reduceFlow(s, { type: 'COVER_DONE' }, o);
    const beforeSkip = s;
    s = reduceFlow(s, { type: 'SKIP' }, o);
    expect(s).toEqual(beforeSkip);

    s = reduceFlow(s, { type: 'PICK', option: 0 }, o);
    s = reduceFlow(s, { type: 'STAMP_DONE' }, o);
    expect(s.phase).toBe('finale');

    s = reduceFlow(s, { type: 'SKIP' }, o);
    expect(s.phase).toBe('done');
  });

  it('reduced: 初期asking、turningとfinaleを経由せず、最終問のSTAMP_DONEでdone', () => {
    const o = opts(2, true);
    let s = initialFlowState(o);
    expect(s).toEqual({ phase: 'asking', step: 0, picked: null, answers: [] });

    s = reduceFlow(s, { type: 'PICK', option: 0 }, o);
    expect(s.phase).toBe('stamping');

    s = reduceFlow(s, { type: 'STAMP_DONE' }, o);
    expect(s.phase).toBe('asking');
    expect(s.step).toBe(1);
    expect(s.picked).toBeNull();

    s = reduceFlow(s, { type: 'PICK', option: 1 }, o);
    s = reduceFlow(s, { type: 'STAMP_DONE' }, o);
    expect(s.phase).toBe('done');
    expect(s.answers).toEqual([0, 1]);
  });

  it('done後の全イベントは無視される', () => {
    const o = opts(1, true);
    let s = initialFlowState(o);
    s = reduceFlow(s, { type: 'PICK', option: 0 }, o);
    s = reduceFlow(s, { type: 'STAMP_DONE' }, o);
    expect(s.phase).toBe('done');
    const done = s;

    for (const event of [
      { type: 'COVER_DONE' } as const,
      { type: 'PICK', option: 0 } as const,
      { type: 'STAMP_DONE' } as const,
      { type: 'TURN_DONE' } as const,
      { type: 'FINALE_DONE' } as const,
      { type: 'SKIP' } as const,
    ]) {
      expect(reduceFlow(done, event, o)).toEqual(done);
    }
  });

  it('questionCount=1の境界（1問でいきなりfinale/done）', () => {
    const o = opts(1);
    let s = initialFlowState(o);
    s = reduceFlow(s, { type: 'COVER_DONE' }, o);
    s = reduceFlow(s, { type: 'PICK', option: 0 }, o);
    expect(s.phase).toBe('stamping');
    expect(s.answers).toEqual([0]);

    s = reduceFlow(s, { type: 'STAMP_DONE' }, o);
    expect(s.phase).toBe('finale');

    s = reduceFlow(s, { type: 'FINALE_DONE' }, o);
    expect(s.phase).toBe('done');
  });

  it('タイミング定数が仕様どおり', () => {
    expect(FLOW_TIMINGS.coverMs).toBe(700);
    expect(FLOW_TIMINGS.stampMs).toBe(380);
    expect(FLOW_TIMINGS.turnMs).toBe(580);
    expect(FLOW_TIMINGS.finaleMs).toBe(2000);
    expect(FLOW_TIMINGS.stampMs + FLOW_TIMINGS.turnMs).toBeLessThanOrEqual(1000);
    expect(REDUCED_STAMP_MS).toBe(160);
  });

  it('定義外イベントはstateをそのまま返す（例外を投げない）', () => {
    const o = opts(2);
    const s = initialFlowState(o);
    // cover中のPICKは無視（asking以外でのPICKは無視される）
    expect(reduceFlow(s, { type: 'PICK', option: 0 }, o)).toEqual(s);
    // cover中のSTAMP_DONE/TURN_DONE/FINALE_DONE/SKIPも無視
    expect(reduceFlow(s, { type: 'STAMP_DONE' }, o)).toEqual(s);
    expect(reduceFlow(s, { type: 'TURN_DONE' }, o)).toEqual(s);
    expect(reduceFlow(s, { type: 'FINALE_DONE' }, o)).toEqual(s);
    expect(reduceFlow(s, { type: 'SKIP' }, o)).toEqual(s);
  });
});

// 型のみの参照確認（未使用警告防止兼、型エクスポートの検証）
const _typeCheck: FlowState = { phase: 'cover', step: 0, picked: null, answers: [] };
void _typeCheck;
