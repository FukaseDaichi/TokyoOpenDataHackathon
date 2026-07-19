// 診断UIの演出フェーズ遷移（封蝋スタンプ→ページターン→フィナーレ）を扱う純粋なreducer。
// React/DOM/タイマーに依存しない。UI側はこのstateとFLOW_TIMINGSだけを頼りにアニメーションを組む。

export type FlowPhase = 'cover' | 'asking' | 'stamping' | 'turning' | 'finale' | 'done';

export interface FlowState {
  phase: FlowPhase;
  step: number; // 0始まりの質問インデックス
  picked: number | null; // 現在の質問で選ばれた選択肢（stamping/turning中のUI表示用）
  answers: number[]; // 確定済み回答（PICK時に確定）
}

export type FlowEvent =
  | { type: 'COVER_DONE' }
  | { type: 'PICK'; option: number }
  | { type: 'STAMP_DONE' }
  | { type: 'TURN_DONE' }
  | { type: 'FINALE_DONE' }
  | { type: 'SKIP' };

export interface FlowOptions {
  questionCount: number; // 通常10
  reduced: boolean; // prefers-reduced-motion時 true
}

export function initialFlowState(opts: FlowOptions): FlowState {
  return { phase: opts.reduced ? 'asking' : 'cover', step: 0, picked: null, answers: [] };
}

export function reduceFlow(state: FlowState, event: FlowEvent, opts: FlowOptions): FlowState {
  switch (state.phase) {
    case 'cover':
      if (event.type === 'COVER_DONE') return { ...state, phase: 'asking' };
      return state;

    case 'asking':
      if (event.type === 'PICK') {
        const answers = [...state.answers, event.option];
        return { ...state, phase: 'stamping', picked: event.option, answers };
      }
      return state;

    case 'stamping':
      if (event.type === 'STAMP_DONE') {
        const isLast = state.answers.length >= opts.questionCount;
        if (opts.reduced) {
          return isLast
            ? { ...state, phase: 'done' }
            : { ...state, phase: 'asking', step: state.step + 1, picked: null };
        }
        return { ...state, phase: isLast ? 'finale' : 'turning' };
      }
      return state;

    case 'turning':
      if (event.type === 'TURN_DONE') {
        return { ...state, phase: 'asking', step: state.step + 1, picked: null };
      }
      return state;

    case 'finale':
      if (event.type === 'FINALE_DONE' || event.type === 'SKIP') {
        return { ...state, phase: 'done' };
      }
      return state;

    case 'done':
      return state;

    default:
      return state;
  }
}

// タイミング定数（UI側がsetTimeoutに使う）
export const FLOW_TIMINGS = {
  coverMs: 700, // 表紙が開く
  stampMs: 380, // 封蝋スタンプ
  turnMs: 580, // ページターン（stamp+turn=960ms ≦ 約1秒の制約内）
  finaleMs: 2000, // パラパラ〜「あなたに一番似ているのは…」
} as const;

export const REDUCED_STAMP_MS = 160; // reduced時に蝋印を静的表示する最小時間
