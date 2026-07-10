// 3DシーンとDOMオーバーレイの橋渡し。
// 毎フレームこの可変オブジェクトにシーンが書き込み、オーバーレイのrAFが
// DOMのstyleへ直接反映する（React stateを介さない）。
import { scenePhases, type ScenePhases } from './timeline';

export interface HudLabel {
  x: number;
  y: number;
  opacity: number;
}

export interface HudState {
  t: number;
  phases: ScenePhases;
  labels: Record<string, HudLabel>;
}

export function createHudState(): HudState {
  return { t: 0, phases: scenePhases(0), labels: {} };
}
