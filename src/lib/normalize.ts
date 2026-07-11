export function minMaxToSignedUnit(values: number[]): number[] {
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (max === min) return values.map(() => 0);
  return values.map((v) => ((v - min) / (max - min)) * 2 - 1);
}

/** 支配的な外れ値（例: 千代田区の昼夜間人口比率1355%）を圧縮するlogスケール版。正の値のみ。 */
export function logMinMaxToSignedUnit(values: number[]): number[] {
  return minMaxToSignedUnit(values.map((v) => Math.log(v)));
}
