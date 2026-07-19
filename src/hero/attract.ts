// アトラクトループの純関数波形。
// t≈0で無操作が続いたとき、スクロール進捗にこのオフセットを加算して
// 「ページがめくれかけて戻る」チラ見せを繰り返す。統合はuseScrollProgress側。

/** 無操作からパルス開始までの待ち時間 */
export const ATTRACT_IDLE_MS = 4000;
/** 1往復（0→振幅→0）の長さ */
export const ATTRACT_CYCLE_MS = 2600;
/** 往復と往復の間の休止 */
export const ATTRACT_REST_MS = 2500;
/** 進捗オフセットの最大値。title(0.06〜)を崩さずburst(0.02〜)が僅かに動く量 */
export const ATTRACT_AMP = 0.022;

/** パルス開始からの経過msに対する進捗オフセット。サインウィンドウで往復し、休止を挟んで繰り返す */
export function attractPulse(elapsedMs: number): number {
  if (elapsedMs <= 0) return 0;
  const period = ATTRACT_CYCLE_MS + ATTRACT_REST_MS;
  const phase = elapsedMs % period;
  if (phase >= ATTRACT_CYCLE_MS) return 0;
  return ATTRACT_AMP * 0.5 * (1 - Math.cos((2 * Math.PI * phase) / ATTRACT_CYCLE_MS));
}
