/** 1始まりの順位。desc=trueで値が大きいほど上位 */
export function rankOf(values: number[], v: number, desc = true): number {
  return values.filter((x) => (desc ? x > v : x < v)).length + 1;
}

/** 23区平均を1.0とした比 */
export function ratioToMean(values: number[], v: number): number {
  const mean = values.reduce((s, x) => s + x, 0) / values.length;
  return mean === 0 ? 0 : v / mean;
}
