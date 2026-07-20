import { describe, it, expect } from 'vitest';
import { nextHeaderState, HEADER_TOP_ZONE, HEADER_HYSTERESIS } from './bookHeader';

describe('bookHeader', () => {
  it('上端付近（TOP_ZONE以下）では方向によらず表示する', () => {
    expect(nextHeaderState({ anchorY: 100, visible: true }, 60).visible).toBe(true);
    // 非表示状態で上端に戻ったら表示に復帰する
    expect(nextHeaderState({ anchorY: 400, visible: false }, HEADER_TOP_ZONE).visible).toBe(true);
  });
  it('上端より下では下スクロールで隠す', () => {
    expect(nextHeaderState({ anchorY: 300, visible: true }, 340)).toEqual({ anchorY: 340, visible: false });
  });
  it('上端より下でも上スクロールで表示する', () => {
    expect(nextHeaderState({ anchorY: 800, visible: false }, 760)).toEqual({ anchorY: 760, visible: true });
  });
  it('ヒステリシス未満の微小移動では状態もアンカーも変えない', () => {
    const prev = { anchorY: 500, visible: false };
    expect(nextHeaderState(prev, 500 + HEADER_HYSTERESIS - 1)).toBe(prev);
    const shown = { anchorY: 500, visible: true };
    expect(nextHeaderState(shown, 500 - (HEADER_HYSTERESIS - 1))).toBe(shown);
  });
  it('微小移動の累積はアンカー据え置きにより閾値到達で反映される', () => {
    // 505→510→512と少しずつ下へ: アンカー500のまま、512で|delta|=12>=8となり隠す
    let s = { anchorY: 500, visible: true };
    s = nextHeaderState(s, 505);
    s = nextHeaderState(s, 512);
    expect(s).toEqual({ anchorY: 512, visible: false });
  });
  it('ヒステリシスちょうど（±8px）の移動は反映される', () => {
    expect(nextHeaderState({ anchorY: 500, visible: true }, 500 + HEADER_HYSTERESIS)).toEqual({
      anchorY: 500 + HEADER_HYSTERESIS,
      visible: false,
    });
    expect(nextHeaderState({ anchorY: 500, visible: false }, 500 - HEADER_HYSTERESIS)).toEqual({
      anchorY: 500 - HEADER_HYSTERESIS,
      visible: true,
    });
  });
});
