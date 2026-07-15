// 相性文（AIによる事前執筆）。診断者と区がその軸で近い前提で、
// 文の方向は区側の軸値の符号に合わせて書いてある（例: 新宿の世帯軸は低い→おひとりさま向け）。
// 盛り込んだ数値・順位は執筆時点の src/data/ward-metrics.json のスナップショット。
import raw from './ward-affinity.json';
import type { AxisKey } from '../domain/axes';

const DATA = raw as Record<string, Partial<Record<AxisKey, string>>>;

/** 区コード×軸の相性文（AI執筆）を返す。未知の組はnull */
export function loadAffinityText(code: string, axis: AxisKey): string | null {
  return DATA[code]?.[axis] ?? null;
}
