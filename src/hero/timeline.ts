// スクロール進捗 t∈[0,1] から演出全体を決定する純関数タイムライン。
// すべて t の関数なので、逆スクロールすれば演出も正確に逆再生される。
// R3F層はここの戻り値を毎フレーム反映するだけの薄い描画層に保つ。
//
// aspect = viewport width / height。Scene4の集結は横長=東京3Dマップ(俯瞰)、
// 縦長=集合写真風の雛壇(正面)に分岐する。
import { MAP_CENTER_Z, type HeroCard } from './manifest';

export interface CameraPose {
  pos: [number, number, number];
  look: [number, number, number];
}

export interface ScenePhases {
  /** Scene1: 冒頭タイトルの不透明度 */
  title: number;
  /** Scene1: 紙片・金粉が手前へ流れるバーストの強さ */
  burst: number;
  /** Scene1: 開幕の暗転の残り */
  vignette: number;
  /** t=0付近のスクロールヒント */
  scrollHint: number;
  /** Scene4: 集結（マップ/雛壇）整列の進行 */
  gather: number;
  /** Scene4: 最終タイトル */
  endTitle: number;
  /** Scene4: 診断CTA */
  cta: number;
}

export interface CardPose {
  pos: [number, number, number];
  rotY: number;
  rotZ: number;
  scale: number;
  /** ホロ光沢の強さ 0..1 */
  sheen: number;
  /** 区名DOMラベルの不透明度 */
  labelOpacity: number;
  /** t=0チラ見せの強さ 0..1（HeroCanvasの可視判定がバンドカットより優先する） */
  peek: number;
}

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export function smoothstep(a: number, b: number, x: number): number {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
}

const isPortrait = (aspect: number) => aspect < 1;

/** カメラ経路上の位置（look計算のため分離） */
function pathPoint(tRaw: number, aspect: number): [number, number, number] {
  const t = clamp01(tRaw);
  if (t <= 0.15) {
    // Scene1: 暗がりから絵本の中へ直進
    const u = smoothstep(0, 0.15, t);
    return [0, lerp(0.5, 0.4, u), lerp(34, 24, u)];
  }
  if (t <= 0.8) {
    // Scene2-3: S字カーブで回廊を進む（zは線形＝単調前進）
    const u = (t - 0.15) / 0.65;
    return [
      6.2 * Math.sin(u * Math.PI * 2) * Math.sin(u * Math.PI),
      0.4 + 0.8 * Math.sin(u * Math.PI * 1.3),
      lerp(24, -58, u),
    ];
  }
  // Scene4: 引いて集結を見渡す。
  // 横長: 高く上がって東京3Dマップを俯瞰 / 縦長: 目線の高さから雛壇を正面に
  const v = smoothstep(0.8, 1, t);
  const yStart = 0.4 + 0.8 * Math.sin(Math.PI * 1.3);
  return isPortrait(aspect)
    ? [0, lerp(yStart, 1.8, v), lerp(-58, -30, v)]
    : [0, lerp(yStart, 10.5, v), lerp(-58, -27, v)];
}

export function cameraPose(tRaw: number, aspect = 16 / 9): CameraPose {
  const t = clamp01(tRaw);
  const pos = pathPoint(t, aspect);
  const ahead = pathPoint(clamp01(t + 0.045), aspect);
  const look: [number, number, number] = [ahead[0], ahead[1], ahead[2] - 6];
  // 終盤は集結の中心へ視線を送る（俯瞰では地面付近を見下ろす）
  const v = smoothstep(0.82, 0.96, t);
  const target: [number, number, number] = isPortrait(aspect)
    ? [0, 1.0, MAP_CENTER_Z + 1]
    : [0, -1.0, MAP_CENTER_Z];
  look[0] = lerp(look[0], target[0], v);
  look[1] = lerp(look[1], target[1], v);
  look[2] = lerp(look[2], target[2], v);
  return { pos, look };
}

export function scenePhases(tRaw: number): ScenePhases {
  const t = clamp01(tRaw);
  return {
    title: 1 - smoothstep(0.06, 0.15, t),
    burst: smoothstep(0.02, 0.08, t) * (1 - smoothstep(0.12, 0.2, t)),
    vignette: 1 - smoothstep(0, 0.12, t),
    scrollHint: 1 - smoothstep(0.03, 0.09, t),
    gather: smoothstep(0.8, 0.95, t),
    endTitle: smoothstep(0.84, 0.93, t),
    cta: smoothstep(0.88, 0.97, t),
  };
}

/**
 * aspect = viewport width / height。縦長画面ではクローズアップを
 * 中央寄り・やや遠めに補正して見切れを防ぐ（デフォルトは16:9）。
 */
export function cardPose(card: HeroCard, tRaw: number, aspect = 16 / 9): CardPose {
  const t = clamp01(tRaw);
  const cam = cameraPose(t, aspect);
  const { corridor } = card;

  let x = corridor.x;
  let y = corridor.y;
  let z = corridor.z;
  let scale = card.scale;

  // 通過時の緩い回転（カメラが横を過ぎる瞬間に重量感を出す）
  const passTwist = 0.35 * card.side * Math.tanh((cam.pos[2] - z) / 7);
  // カメラ方向への緩やかな追従（正面固定にしない）
  const angleToCam = Math.atan2(cam.pos[0] - x, cam.pos[2] - z);
  const facingWeight = 0.35 * smoothstep(-4, 8, cam.pos[2] - z);
  let rotY = corridor.rotY * (1 - facingWeight) + angleToCam * facingWeight + passTwist;
  let rotZ = corridor.rotZ;

  // Scene3: クローズアップ（ガウス窓でカメラ脇へ吸引）
  let sheen = 0.12;
  let labelOpacity = 0;
  if (card.closeupAt !== null) {
    const g = Math.exp(-(((t - card.closeupAt) / 0.05) ** 2));
    if (g > 1e-4) {
      const fwd = [cam.look[0] - cam.pos[0], cam.look[1] - cam.pos[1], cam.look[2] - cam.pos[2]];
      const fl = Math.hypot(fwd[0], fwd[1], fwd[2]) || 1;
      const fx = fwd[0] / fl, fy = fwd[1] / fl, fz = fwd[2] / fl;
      // 右ベクトル（up=+Yの外積）
      const rx = -fz, rz = fx;
      const narrow = Math.min(1, aspect / 1.5);
      const dist = 8.6 * (2 - narrow);
      const sideOff = 2.8 * narrow * card.closeupSide;
      const ax = cam.pos[0] + fx * dist + rx * sideOff;
      const ay = cam.pos[1] + fy * dist - 0.35;
      const az = cam.pos[2] + fz * dist + rz * sideOff;
      const w = g * 0.88;
      x = lerp(x, ax, w);
      y = lerp(y, ay, w);
      z = lerp(z, az, w);
      scale *= 1 + 0.1 * g;
      rotY = lerp(rotY, Math.atan2(cam.pos[0] - x, cam.pos[2] - z), g * 0.85);
      rotZ = lerp(rotZ, 0.06 * card.closeupSide, g);
      sheen = Math.min(1, sheen + g);
      labelOpacity = smoothstep(0.35, 0.75, g);
    }
  }

  // t=0のチラ見せ: カメラ前方の画面端に浮かべ、スクロール開始で回廊の定位置へ返す
  let peekW = 0;
  if (card.peek) {
    peekW = 1 - smoothstep(0.005, 0.075, t);
    if (peekW > 1e-4) {
      // HeroCanvasのカメラ(fov=50)と同じ画角で画面端のワールドxを求める。
      // 縦長画面では遠く・小さくして、カードが画面を覆わないようにする
      const HALF_FOV_TAN = 0.46631; // tan(25deg)
      const portrait = aspect < 1;
      const peekScale = portrait ? 0.8 : 1.15;
      const dist = card.peek.dist + (portrait ? 1.6 : 0);
      const halfW = HALF_FOV_TAN * dist * aspect;
      const px = cam.pos[0] + card.peek.side * (halfW + 0.5 * peekScale);
      const py = card.peek.y;
      const pz = cam.pos[2] - dist;
      x = lerp(x, px, peekW);
      y = lerp(y, py, peekW);
      z = lerp(z, pz, peekW);
      scale = lerp(scale, peekScale, peekW);
      // カメラへ緩く正対させ、内側へ視線を誘導する
      rotY = lerp(rotY, Math.atan2(cam.pos[0] - px, cam.pos[2] - pz) * 0.55, peekW);
      rotZ = lerp(rotZ, card.peek.rotZ, peekW);
      sheen = Math.max(sheen, peekW * 0.75);
    } else {
      peekW = 0;
    }
  }

  // Scene4: 集結へ整列（カードごとに位相をずらして流れ込む）。
  // 横長は東京3Dマップの立ち位置、縦長は雛壇へ。
  const c = smoothstep(0.8 + card.gatherDelay, 0.94 + card.gatherDelay, t);
  if (c > 0) {
    const slot = isPortrait(aspect) ? card.podium : card.map;
    x = lerp(x, slot.x, c);
    y = lerp(y, slot.y, c);
    z = lerp(z, slot.z, c);
    rotY = lerp(rotY, 0, c);
    rotZ = lerp(rotZ, 0, c);
    scale = lerp(scale, slot.scale, c);
    sheen = lerp(sheen, 0.3, c);
    // 雛壇(縦長)は23枚分のラベルで画面が埋まるため区名を出さない
    labelOpacity = isPortrait(aspect)
      ? labelOpacity * (1 - c)
      : Math.max(labelOpacity, c * 0.9);
  }

  return { pos: [x, y, z], rotY, rotZ, scale, sheen, labelOpacity, peek: peekW };
}

/**
 * 静止中の呼吸のような浮遊（useFrameで加算する）。
 * factor=0（reduced motion）で完全静止、集結整列後は呼び出し側で減衰させる。
 */
export function floatOffset(card: HeroCard, time: number, factor: number): [number, number] {
  if (factor === 0) return [0, 0];
  const p = time * card.floatSpeed + card.floatPhase;
  return [
    Math.sin(p) * card.floatAmp * factor,
    Math.cos(p * 0.83 + card.floatPhase * 0.7) * card.floatAmp * 0.6 * factor,
  ];
}
