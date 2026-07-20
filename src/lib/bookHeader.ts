/** ページ上端からこの高さ(px)までは常にヘッダーを表示する */
export const HEADER_TOP_ZONE = 120;
/** 直前の判定位置からこの距離(px)未満のスクロールでは表示状態を変えない */
export const HEADER_HYSTERESIS = 8;

export type HeaderScrollState = { anchorY: number; visible: boolean };

/**
 * スクロール位置yからヘッダー表示を決めるreducer。
 * anchorYは「最後に判定した位置」で、微小移動では据え置いて累積を測る。
 */
export function nextHeaderState(state: HeaderScrollState, y: number): HeaderScrollState {
  if (y <= HEADER_TOP_ZONE) return { anchorY: y, visible: true };
  const delta = y - state.anchorY;
  if (Math.abs(delta) < HEADER_HYSTERESIS) return state;
  return { anchorY: y, visible: delta < 0 };
}
