import { AXIS_KEYS, type AxisVector } from '../domain/axes';

const KEY = 'kuchan.diagnosis';

export function saveDiagnosis(v: AxisVector): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ vector: v, ts: Date.now() }));
  } catch {
    /* プライベートモード等では黙って諦める（受け手表示になるだけ） */
  }
}

export function loadDiagnosis(): AxisVector | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const v = parsed?.vector;
    if (!v || !AXIS_KEYS.every((k) => typeof v[k] === 'number')) return null;
    return v as AxisVector;
  } catch {
    return null;
  }
}
