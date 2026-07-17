/** 区のテーマカラー（キャラ髪色）1色から、キャラページ全体の配色トークンを導出する。
    絵本トーン（革表紙 #17110c / 羊皮紙 #f7ecd4 / 墨 #4a3418）を土台に区色を混ぜ、
    アクセントは明度クランプでWCAGコントラストを保証する純ロジック */

export interface WardPalette {
  /** ページ背景（ほぼ黒のブラウン×区色） */
  bg: string;
  /** カード地（アイボリー×区色） */
  card: string;
  /** カード地の上で使うアクセント（%数字・ボタン・バッジ） */
  accent: string;
  /** accent の上に載せる文字色（白か墨、コントラストが高い方） */
  accentText: string;
  /** 暗背景の上で使う明るいアクセント */
  accentDark: string;
  /** カード内の本文色 */
  ink: string;
}

const BASE_BG = '#17110c';
const BASE_CARD = '#f7ecd4';
const INK = '#4a3418';
const WHITE = '#fffbf0';

type Rgb = [number, number, number];
type Hsl = [number, number, number];

function hexToRgb(hex: string): Rgb {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex([r, g, b]: Rgb): string {
  return (
    '#' +
    [r, g, b]
      .map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0'))
      .join('')
  );
}

function mix(a: string, b: string, ratioA: number): string {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  return rgbToHex([0, 1, 2].map((i) => A[i] * ratioA + B[i] * (1 - ratioA)) as Rgb);
}

function srgbChannel(v: number): number {
  const s = v / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  return 0.2126 * srgbChannel(r) + 0.7152 * srgbChannel(g) + 0.0722 * srgbChannel(b);
}

/** WCAG 2.x のコントラスト比（1〜21） */
export function contrastRatio(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

function rgbToHsl([r, g, b]: Rgb): Hsl {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
  else if (max === gn) h = ((bn - rn) / d + 2) / 6;
  else h = ((rn - gn) / d + 4) / 6;
  return [h, s, l];
}

function hue2rgb(p: number, q: number, t: number): number {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
}

function hslToRgb([h, s, l]: Hsl): Rgb {
  if (s === 0) {
    const v = l * 255;
    return [v, v, v];
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [hue2rgb(p, q, h + 1 / 3), hue2rgb(p, q, h), hue2rgb(p, q, h - 1 / 3)].map(
    (v) => v * 255,
  ) as Rgb;
}

/** 明度を0.02刻みで動かし、bg に対して minRatio 以上を確保する。
    彩度は下限0.35へ引き上げる（無彩色寄りの区色でも「色」を感じさせるため） */
function clampForContrast(
  hex: string,
  bg: string,
  minRatio: number,
  direction: 'darken' | 'lighten',
): string {
  const [h, s0, l0] = rgbToHsl(hexToRgb(hex));
  const s = Math.max(s0, 0.35);
  let l = l0;
  let out = rgbToHex(hslToRgb([h, s, l]));
  while (contrastRatio(out, bg) < minRatio && l > 0.06 && l < 0.96) {
    l = direction === 'darken' ? Math.max(0.06, l - 0.02) : Math.min(0.96, l + 0.02);
    out = rgbToHex(hslToRgb([h, s, l]));
  }
  return out;
}

export function wardPalette(baseColor: string): WardPalette {
  const bg = mix(baseColor, BASE_BG, 0.12);
  const card = mix(baseColor, BASE_CARD, 0.07);
  // カード地の上の大きい文字で3:1まで暗くし、さらにボタン文字が確保できる暗さまで下げる
  let accent = clampForContrast(baseColor, card, 3, 'darken');
  while (contrastRatio(WHITE, accent) < 4.5 && contrastRatio(INK, accent) < 4.5) {
    const [h, s, l] = rgbToHsl(hexToRgb(accent));
    if (l <= 0.06) break;
    accent = rgbToHex(hslToRgb([h, s, Math.max(0.06, l - 0.02)]));
  }
  const accentText = contrastRatio(WHITE, accent) >= contrastRatio(INK, accent) ? WHITE : INK;
  const accentDark = clampForContrast(baseColor, bg, 4.5, 'lighten');
  return { bg, card, accent, accentText, accentDark, ink: INK };
}

/** ページルート要素の style に spread するCSSカスタムプロパティ */
export function paletteVars(p: WardPalette): Record<string, string> {
  return {
    '--w-bg': p.bg,
    '--w-card': p.card,
    '--w-accent': p.accent,
    '--w-accent-text': p.accentText,
    '--w-accent-dark': p.accentDark,
    '--w-ink': p.ink,
  };
}
