import { AXIS_KEYS, type AxisVector, type Ward } from '../domain/axes';

export function distance(a: AxisVector, b: AxisVector): number {
  let s = 0;
  for (const key of AXIS_KEYS) {
    const d = a[key] - b[key];
    s += d * d;
  }
  return Math.sqrt(s);
}

export interface MatchResult {
  ward: Ward;
  distance: number;
}

export function rankMatches(user: AxisVector, wards: Ward[]): MatchResult[] {
  return wards
    .map((ward) => ({ ward, distance: distance(user, ward.axes) }))
    .sort((a, b) => a.distance - b.distance);
}

export function bestMatch(user: AxisVector, wards: Ward[]): Ward {
  return rankMatches(user, wards)[0].ward;
}

export function rankDiagnosisMatches(
  user: AxisVector,
  wards: Ward[],
  resultCode: string,
): MatchResult[] {
  const ranked = rankMatches(user, wards);
  const winnerIndex = ranked.findIndex((match) => match.ward.code === resultCode);
  if (winnerIndex <= 0) return ranked;
  return [ranked[winnerIndex], ...ranked.slice(0, winnerIndex), ...ranked.slice(winnerIndex + 1)];
}

/** 距離→「にてる度」%（0距離=100%、5軸最大距離で0%へ線形） */
export function similarityPercent(distance: number): number {
  const maxD = Math.sqrt(5 * 4); // 各軸差 ±2 の理論最大
  return Math.round(Math.max(0, 1 - distance / maxD) * 100);
}

/** 相性ランキング表示用の%。生の%の最大が結果の%以上になる場合だけ、
    最大が「結果%−1」となるよう全体を比例スケーリングし、
    表示が常に 結果 > 相性1位 ≥ 2位 ≥ 3位 の単調な並びになることを保証する。
    校正済み割り当てには影響しない（distances は距離昇順前提） */
export function compatibilityPercents(
  resultDistance: number,
  compatibleDistances: number[],
): number[] {
  const raw = compatibleDistances.map(similarityPercent);
  if (raw.length === 0) return raw;
  const resultPercent = similarityPercent(resultDistance);
  const maxRaw = Math.max(...raw);
  if (maxRaw < resultPercent || maxRaw === 0) return raw;
  const cap = Math.max(resultPercent - 1, 0);
  return raw.map((p) => Math.floor((p * cap) / maxRaw));
}
