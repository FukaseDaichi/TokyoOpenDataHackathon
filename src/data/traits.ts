// タイプ特徴（AIによる事前執筆）。各区の性格ひとこと（src/hero/wards.ts の catch）と
// 5軸の傾きに沿わせ、UIコピーの中立・前向き原則で3行に要約している。
import raw from './ward-traits.json';

const DATA = raw as Record<string, string[]>;

/** 区コードからタイプ特徴3行（AI執筆）を返す。未知コードは空配列 */
export function loadWardTraits(code: string): string[] {
  return DATA[code] ?? [];
}
