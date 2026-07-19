// 23区ヒーローカードの固定manifest。
// 配置はseed付き乱数(mulberry32)からモジュール初期化時に一度だけ生成され、
// 以後は完全に不変・決定的（毎レンダーの乱数は使わない）。
import { mulberry32 } from './rng';
import { WARDS, type WardInfo } from './wards';

/** Scene4の地面プレーンの高さ（カードはこの上に立つ） */
export const GROUND_Y = -1.7;
/** Scene4の集結エリアの中心z */
export const MAP_CENTER_Z = -50;

export interface GatherSlot {
  x: number;
  y: number;
  z: number;
  scale: number;
}

export interface HeroCard extends WardInfo {
  /** 回廊シーンでの基本配置 */
  corridor: { x: number; y: number; z: number; rotY: number; rotZ: number };
  /** カード幅スケール（ジオメトリは2:3固定なので縦横比は崩れない） */
  scale: number;
  /** 奥行きバンド 0(近景)〜5(遠景) */
  depthBand: number;
  side: -1 | 1;
  floatPhase: number;
  floatSpeed: number;
  floatAmp: number;
  /** Scene4(横長): 東京3Dマップ。地理位置に立ち、下端が地面に接地する */
  map: GatherSlot;
  /** Scene4(縦長): 集合写真風の雛壇。後列ほど高く・奥 */
  podium: GatherSlot;
  /** Scene3: クローズアップのスクロール時刻（実画像がある区のみ） */
  closeupAt: number | null;
  closeupSide: -1 | 1;
  /** t=0のファーストビューで画面端にチラ見せする配置（カメラ相対）。対象2区のみ */
  peek: PeekSlot | null;
  /** 集結整列の開始をカードごとに僅かにずらす */
  gatherDelay: number;
}

// 回廊のカメラz（timeline.tsのcorridor区間と同じ線形式）
const camZAt = (t: number) => 24 + ((t - 0.15) / 0.65) * (-58 - 24);

// カメラのS字経路のx（timeline.tsのpathPointと同じ式）。
// カードはこの経路からの横オフセットとして置くことで、
// カメラがカードを突き抜けない最低クリアランスを保証する。
const camXAtZ = (z: number) => {
  const u = Math.min(1, Math.max(0, (24 - z) / 82));
  return 6.2 * Math.sin(u * Math.PI * 2) * Math.sin(u * Math.PI);
};

export interface PeekSlot {
  side: -1 | 1;
  /** ワールドy（カメラ初期y=0.5基準の上下ずらし） */
  y: number;
  /** カメラからの前方距離 */
  dist: number;
  rotZ: number;
}

/** t=0チラ見せの対象と配置。優先ロードされるクローズアップ区から選ぶ。
 * static設定でrngを消費しない（既存の回廊配置を変えないため）。 */
const PEEKS: Record<string, PeekSlot> = {
  '13104': { side: -1, y: 1.15, dist: 4.6, rotZ: -0.05 }, // 新宿=左上
  '13113': { side: 1, y: -0.35, dist: 5.2, rotZ: 0.06 }, // 渋谷=右下
};

/** クローズアップ対象（映えの異なる6区）と時刻 */
const CLOSEUPS: Record<string, { at: number; side: -1 | 1 }> = {
  '13101': { at: 0.38, side: 1 },  // 千代田
  '13104': { at: 0.45, side: -1 }, // 新宿
  '13108': { at: 0.52, side: 1 },  // 江東
  '13103': { at: 0.59, side: -1 }, // 港
  '13112': { at: 0.66, side: 1 },  // 世田谷
  '13113': { at: 0.73, side: -1 }, // 渋谷
};

// 東京3Dマップ: geo.x→東西, geo.y→奥行き（北ほど奥=zが負）
const MAP_SCALE = 0.72;
const MAP_KX = 5.2;
const MAP_KZ = 4.4;

// 雛壇: 5列×5段（最終段3枚は中央寄せ）、後列ほど高く・奥
const PODIUM_SCALE = 0.56;
const PODIUM_COLS = 5;
const PODIUM_COL_SPACING = 1.25;
const PODIUM_ROW_DEPTH = 1.6;
const PODIUM_ROW_RISE = 1.05;
const PODIUM_FRONT_Z = -46;

function mapSlot(ward: WardInfo): GatherSlot {
  return {
    x: ward.geo.x * MAP_KX,
    y: GROUND_Y + 1.5 * MAP_SCALE,
    z: MAP_CENTER_Z - ward.geo.y * MAP_KZ,
    scale: MAP_SCALE,
  };
}

function podiumSlot(index: number): GatherSlot {
  const row = Math.floor(index / PODIUM_COLS);
  const col = index % PODIUM_COLS;
  const rowCount = Math.min(PODIUM_COLS, WARDS.length - row * PODIUM_COLS);
  return {
    x: (col - (rowCount - 1) / 2) * PODIUM_COL_SPACING,
    y: GROUND_Y + row * PODIUM_ROW_RISE + 1.5 * PODIUM_SCALE,
    z: PODIUM_FRONT_Z - row * PODIUM_ROW_DEPTH,
    scale: PODIUM_SCALE,
  };
}

function buildManifest(): HeroCard[] {
  const rng = mulberry32(20260711);

  // 回廊のz駅(0..22)をシャッフルして区コード順と切り離す
  const stations = Array.from({ length: 23 }, (_, i) => i);
  for (let i = stations.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [stations[i], stations[j]] = [stations[j], stations[i]];
  }

  return WARDS.map((ward, i) => {
    const depthBand = i % 6;
    const baseSide: -1 | 1 = i % 2 === 0 ? 1 : -1;
    const side: -1 | 1 = rng() < 0.22 ? ((-baseSide) as -1 | 1) : baseSide;

    const closeup = CLOSEUPS[ward.id] ?? null;
    // 回廊z: 駅ベース。クローズアップ区はその時刻のカメラ少し先に置く
    const z = closeup ? camZAt(closeup.at) - 5.5 : 14 - stations[i] * 3.4;

    const lateral = 3.4 + depthBand * 1.9 + rng() * 1.2;
    const y = (rng() - 0.4) * (1.5 + depthBand * 0.8);
    const rotY = (rng() - 0.5) * 0.5;
    const rotZ = (rng() - 0.5) * 0.14;
    const scale = 1.35 + depthBand * 0.11 + rng() * 0.35;
    // 旧星座配置がここでrngを1回消費していた。乱数列がずれると
    // 調整済みの回廊配置が全て変わるため、同じ位置で1回消費して保つ。
    rng();

    return {
      ...ward,
      corridor: { x: camXAtZ(z) + side * lateral, y, z, rotY, rotZ },
      scale,
      depthBand,
      side,
      floatPhase: (i * 2.399963368) % (Math.PI * 2),
      floatSpeed: 0.35 + rng() * 0.45,
      floatAmp: 0.07 + rng() * 0.09,
      map: mapSlot(ward),
      podium: podiumSlot(i),
      closeupAt: closeup ? closeup.at : null,
      closeupSide: closeup ? closeup.side : baseSide,
      peek: PEEKS[ward.id] ?? null,
      gatherDelay: (i % 5) * 0.008,
    };
  });
}

export const HERO_CARDS: HeroCard[] = buildManifest();
