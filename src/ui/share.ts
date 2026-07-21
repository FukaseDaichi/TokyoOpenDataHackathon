import type { Ward } from '../domain/axes';
import { wardTheme } from './wardTheme';

/** twitter-text の weight=1 コードポイント範囲。これ以外は2単位（CJK・絵文字など） */
const LIGHT_RANGES: Array<[number, number]> = [
  [0, 4351],
  [8192, 8205],
  [8208, 8223],
  [8242, 8247],
];

/** Xの加重文字数。上限は280単位、URLは常に23単位で別計上 */
export function xWeightedLength(text: string): number {
  let total = 0;
  for (const ch of text) {
    const cp = ch.codePointAt(0)!;
    total += LIGHT_RANGES.some(([lo, hi]) => cp >= lo && cp <= hi) ? 1 : 2;
  }
  return total;
}

export interface ShareResult {
  percent: number;
  personaName: string;
}

/** X投稿本文。診断済みなら にてる度とタイプ名でパーソナライズ、ハッシュタグ2つは必須 */
export function xShareText(ward: Ward, result?: ShareResult): string {
  const body = result
    ? `診断したら${ward.name}ちゃんと にてる度${result.percent}% だった！タイプは「${result.personaName}」らしい`
    : `「${ward.name}ちゃん」っぽいらしい。${wardTheme(ward.code).catch}`;
  return `${body}\n#23区タイプ診断\n#都知事杯オープンデータハッカソン`;
}

/** X（Twitter）シェアリンク。ユーザー自身のクリックで投稿画面を開くだけ */
export function xShareUrl(ward: Ward, appUrl: string, result?: ShareResult): string {
  const text = xShareText(ward, result);
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(appUrl)}`;
}
