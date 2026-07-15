import { AXIS_KEYS, type AxisKey, type AxisVector } from '../domain/axes';

/** タイプ判定の対象とする軸の最小振れ幅 */
const SIGNAL_THRESHOLD = 0.3;

/** 各軸の極（高い側/低い側）の呼び名と一言説明。中立・前向きの原則を守る */
const POLES: Record<AxisKey, { high: { label: string; text: string }; low: { label: string; text: string } }> = {
  liveliness: {
    high: { label: '都会派', text: '賑やかな街のエネルギーが好き' },
    low: { label: 'のんびり派', text: '静かで穏やかな時間を大切にする' },
  },
  maturity: {
    high: { label: 'おとな志向', text: '落ち着きと成熟した空気に惹かれる' },
    low: { label: 'フレッシュ志向', text: '新しく若々しい空気が心地いい' },
  },
  greenery: {
    high: { label: 'みどり派', text: '緑や公園のそばで深呼吸したい' },
    low: { label: 'シティ派', text: '都会の便利さを使いこなしたい' },
  },
  family: {
    high: { label: 'ファミリー志向', text: '家族や仲間との暮らしを真ん中に置く' },
    low: { label: 'ソロ充', text: '一人の時間を上手に楽しむ' },
  },
  luxury: {
    high: { label: '華やか志向', text: '良いものや華やかさに心が動く' },
    low: { label: '堅実派', text: '堅実で等身大の暮らしが性に合う' },
  },
};

export interface PersonaType {
  name: string;
  description: string;
  /** 命名に使った軸（強い順、0〜2個） */
  axes: AxisKey[];
}

function pole(key: AxisKey, value: number) {
  return value >= 0 ? POLES[key].high : POLES[key].low;
}

/** ユーザーベクトルからタイプ名と説明文を導く。全軸が閾値未満なら「バランスタイプ」 */
export function personaType(user: AxisVector): PersonaType {
  const strong = AXIS_KEYS.filter((k) => Math.abs(user[k]) >= SIGNAL_THRESHOLD).sort(
    (a, b) => Math.abs(user[b]) - Math.abs(user[a]),
  );
  const top = strong.slice(0, 2);
  if (top.length === 0) {
    return {
      name: 'バランスタイプ',
      description: 'どの軸にも偏らない、いろいろな街を楽しめるオールラウンダーなあなた。',
      axes: [],
    };
  }
  const poles = top.map((k) => pole(k, user[k]));
  const name = `${poles.map((p) => p.label).join('×')}タイプ`;
  const description =
    poles.length === 2
      ? `${poles[0].text}。そして${poles[1].text}、そんなあなた。`
      : `${poles[0].text}、そんなあなた。`;
  return { name, description, axes: top };
}

/**
 * ユーザーと区の「一致軸」上位2つを返す。
 * ユーザー側に十分な振れ（|v|>=0.3）がある軸を差の小さい順に選び、
 * 2軸に満たなければ振れ条件を外して差の小さい順に補充する。
 */
export function selectMatchedAxes(user: AxisVector, ward: AxisVector): [AxisKey, AxisKey] {
  const byDistance = [...AXIS_KEYS].sort(
    (a, b) => Math.abs(user[a] - ward[a]) - Math.abs(user[b] - ward[b]),
  );
  const qualified = byDistance.filter((k) => Math.abs(user[k]) >= SIGNAL_THRESHOLD);
  const rest = byDistance.filter((k) => Math.abs(user[k]) < SIGNAL_THRESHOLD);
  const picked = [...qualified, ...rest].slice(0, 2);
  return [picked[0], picked[1]];
}
