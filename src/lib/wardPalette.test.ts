import { describe, it, expect } from 'vitest';
import { contrastRatio, wardPalette, paletteVars } from './wardPalette';
import { WARDS } from '../hero/wards';

describe('contrastRatio', () => {
  it('白と黒で21、同色で1になる', () => {
    expect(contrastRatio('#ffffff', '#000000')).toBeCloseTo(21, 0);
    expect(contrastRatio('#b8923f', '#b8923f')).toBeCloseTo(1, 5);
  });
});

describe('wardPalette', () => {
  it.each(WARDS.map((w) => [w.name, w.color] as const))(
    '%s (%s) のパレットがコントラスト基準を満たす',
    (_name, color) => {
      const p = wardPalette(color);
      // カード地の上の大きいアクセント文字（にてる度% など）: 3:1以上
      expect(contrastRatio(p.accent, p.card)).toBeGreaterThanOrEqual(3);
      // アクセント地のボタン文字: 4.5:1以上
      expect(contrastRatio(p.accentText, p.accent)).toBeGreaterThanOrEqual(4.5);
      // 暗背景の上のアクセント: 4.5:1以上
      expect(contrastRatio(p.accentDark, p.bg)).toBeGreaterThanOrEqual(4.5);
      // 背景は暗く（既存の本文色 #f4e8d0 が読める）、カードは墨が読める明るさ
      expect(contrastRatio('#f4e8d0', p.bg)).toBeGreaterThanOrEqual(7);
      expect(contrastRatio(p.ink, p.card)).toBeGreaterThanOrEqual(6);
    },
  );
  it('淡色・暗色の代表値で退行しない', () => {
    // 千代田(淡) / 品川(暗) / 荒川(淡ベージュ) / 墨田(暗青)
    for (const color of ['#cdd3e8', '#48628e', '#e0cb96', '#4a5f9a']) {
      const p = wardPalette(color);
      expect(contrastRatio(p.accent, p.card)).toBeGreaterThanOrEqual(3);
      expect(contrastRatio(p.accentText, p.accent)).toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(p.accentDark, p.bg)).toBeGreaterThanOrEqual(4.5);
    }
  });
  it('paletteVars がCSSカスタムプロパティ名で返す', () => {
    const vars = paletteVars(wardPalette('#e05fa0'));
    expect(Object.keys(vars)).toEqual([
      '--w-bg', '--w-card', '--w-accent', '--w-accent-text', '--w-accent-dark', '--w-ink',
    ]);
    for (const v of Object.values(vars)) expect(v).toMatch(/^#[0-9a-f]{6}$/);
  });
});
