// 23区ヒーローカードの固定manifest。
// 配置はseed付き乱数(mulberry32)からモジュール初期化時に一度だけ生成され、
// 以後は完全に不変・決定的（毎レンダーの乱数は使わない）。
import { mulberry32 } from './rng';
import { WARDS, type WardInfo } from './wards';

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
  /** Scene4: 東京の地理を星座化した集結位置 */
  constellation: { x: number; y: number; z: number };
  /** Scene3: クローズアップのスクロール時刻（実画像がある区のみ） */
  closeupAt: number | null;
  closeupSide: -1 | 1;
  /** 星座整列の開始をカードごとに僅かにずらす */
  constellationDelay: number;
}

// 回廊のカメラz（timeline.tsのcorridor区間と同じ線形式）
const camZAt = (t: number) => 24 + ((t - 0.15) / 0.65) * (-58 - 24);

/** クローズアップ対象（実画像13区から映えの異なる6区）と時刻 */
const CLOSEUPS: Record<string, { at: number; side: -1 | 1 }> = {
  '13101': { at: 0.38, side: 1 },  // 千代田
  '13104': { at: 0.45, side: -1 }, // 新宿
  '13108': { at: 0.52, side: 1 },  // 江東
  '13103': { at: 0.59, side: -1 }, // 港
  '13112': { at: 0.66, side: 1 },  // 世田谷
  '13113': { at: 0.73, side: -1 }, // 渋谷
};

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

    const lateral = 2.6 + depthBand * 1.9 + rng() * 1.2;
    const y = (rng() - 0.4) * (1.5 + depthBand * 0.8);

    return {
      ...ward,
      corridor: {
        x: side * lateral,
        y,
        z,
        rotY: (rng() - 0.5) * 0.5,
        rotZ: (rng() - 0.5) * 0.14,
      },
      scale: 1.35 + depthBand * 0.11 + rng() * 0.35,
      depthBand,
      side,
      floatPhase: (i * 2.399963368) % (Math.PI * 2),
      floatSpeed: 0.35 + rng() * 0.45,
      floatAmp: 0.07 + rng() * 0.09,
      constellation: {
        x: ward.geo.x * 3.1,
        y: ward.geo.y * 2.3 + 0.9,
        z: -52 + (rng() - 0.5) * 1.6,
      },
      closeupAt: closeup ? closeup.at : null,
      closeupSide: closeup ? closeup.side : baseSide,
      constellationDelay: (i % 5) * 0.008,
    };
  });
}

export const HERO_CARDS: HeroCard[] = buildManifest();
