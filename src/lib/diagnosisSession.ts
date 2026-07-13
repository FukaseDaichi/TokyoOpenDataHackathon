import { AXIS_KEYS, type AxisVector } from '../domain/axes';

const KEY = 'kuchan.diagnosis';

export interface DiagnosisSession {
  vector: AxisVector;
  resultCode: string | null;
}

export function saveDiagnosis(v: AxisVector, resultCode?: string): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ vector: v, resultCode, ts: Date.now() }));
  } catch {
    /* プライベートモード等では黙って諦める（受け手表示になるだけ） */
  }
}

export function loadDiagnosisSession(): DiagnosisSession | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const v = parsed?.vector;
    if (!v || !AXIS_KEYS.every((k) => typeof v[k] === 'number')) return null;
    const resultCode = typeof parsed?.resultCode === 'string' ? parsed.resultCode : null;
    return { vector: v as AxisVector, resultCode };
  } catch {
    return null;
  }
}

export function loadDiagnosis(): AxisVector | null {
  return loadDiagnosisSession()?.vector ?? null;
}
