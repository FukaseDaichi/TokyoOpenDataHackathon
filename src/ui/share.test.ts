import { describe, it, expect } from 'vitest';
import { xWeightedLength, xShareText, xShareUrl } from './share';
import { loadWards } from '../data/wards';

describe('xWeightedLength', () => {
  it('半角は1単位、全角・絵文字は2単位で数える', () => {
    expect(xWeightedLength('abc')).toBe(3);
    expect(xWeightedLength('あ')).toBe(2);
    expect(xWeightedLength('診断#')).toBe(5);
    expect(xWeightedLength('𝕏')).toBe(2);
  });
});

describe('xShareText / xShareUrl', () => {
  const minato = loadWards().find((w) => w.code === '13103')!;

  it('診断済みは にてる度%とタイプ名入りの文面になる', () => {
    const text = xShareText(minato, { percent: 87, personaName: '華やか志向タイプ' });
    expect(text).toBe(
      '診断したら港区ちゃんと にてる度87% だった！タイプは「華やか志向タイプ」らしい\n#うちの区ちゃん\n#都知事杯オープンデータハッカソン',
    );
  });

  it('未診断（result省略）は現行のキャッチ入り文面を維持する', () => {
    const url = new URL(xShareUrl(minato, 'https://example.com/result/minato/'));
    expect(url.hostname).toMatch(/(?:x|twitter)\.com$/);
    expect(url.searchParams.get('text')).toBe(
      '「港区ちゃん」っぽいらしい。財政力1.15の絶対王者、華やかセレブ\n#うちの区ちゃん\n#都知事杯オープンデータハッカソン',
    );
    expect(url.searchParams.get('url')).toBe('https://example.com/result/minato/');
  });

  it('全23区×最長タイプ名×100%の最悪ケースでも280単位に収まる', () => {
    // personaType() の最長出力: ラベル7文字×2 + 「×」 + 「タイプ」
    const longest = 'ファミリー志向×フレッシュ志向タイプ';
    for (const ward of loadWards()) {
      const text = xShareText(ward, { percent: 100, personaName: longest });
      // URLは常に23単位 + テキストとの区切り1単位
      expect(xWeightedLength(text) + 23 + 1).toBeLessThanOrEqual(280);
    }
  });
});
