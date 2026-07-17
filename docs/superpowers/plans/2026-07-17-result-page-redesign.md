# 診断結果ページ再構成 + 区別カラーテーマ 実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 診断結果ページを「結果カード→自分ごと化→シェア」が2〜3画面で完結する構成に再設計し、区キャラクターのイメージカラーから導出したパレットで `/result` と `/ward` の配色を区ごとに変える。

**Architecture:** 純ロジック（パレット導出・%相対スケーリング・タグ導出）を `src/lib/` にTDDで追加し、CSSカスタムプロパティでページルートに注入する。ResultPage は新IA（カード・特徴・根拠・アコーディオン・相性・最終CTA）に書き換え、既存の校正済み診断割り当てには一切触れない。

**Tech Stack:** Next.js App Router (output: 'export'), TypeScript, Vitest + Testing Library, 素のCSS（app/zukan.css）

**Spec:** [docs/superpowers/specs/2026-07-17-result-page-redesign-design.md](../specs/2026-07-17-result-page-redesign-design.md)

## Global Constraints

- `next.config.ts` の `output: 'export'` を維持。実行時API・DB・SSR依存を追加しない。
- 純ロジックは副作用のないTSモジュールとして `src/lib/` に置き、Vitestを先に書く（TDD）。
- UIコピーは日本語。区の表現は中立・前向き。地域スティグマにつながる否定的ラベルを避ける。
- 診断の個別回答は保存・送信しない。sessionStorage のキーは `kuchan.diagnosis`。
- 診断割り当て（`src/data/diagnosis-assignments.json`）と `similarityPercent` の式は変更しない。
- OGP原本・`npm run build:og` パイプラインは変更しない。
- CSS変数のフォールバック値は必ず現行のリテラル値と同一にする（トップ・図鑑の見た目を変えないため）。
- 各タスク完了時に `npm test` が全件通ること。コミットメッセージ末尾: `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`

## File Structure

| ファイル | 操作 | 責務 |
|---|---|---|
| `src/lib/matching.ts` | 変更 | `compatibilityPercents` 追加（%の単調表示） |
| `src/lib/matching.test.ts` | 変更 | 上記のテスト |
| `src/lib/personaType.ts` | 変更 | `matchedAxisTags` 追加（ハッシュタグ導出） |
| `src/lib/personaType.test.ts` | 変更 | 上記のテスト |
| `src/lib/wardPalette.ts` | 新規 | 区色→配色トークン導出 + `paletteVars` + `contrastRatio` |
| `src/lib/wardPalette.test.ts` | 新規 | 全23区のコントラスト保証 |
| `src/data/ward-traits.json` | 新規 | AI執筆の「タイプ特徴3行」×23区 |
| `src/data/traits.ts` | 新規 | traits ローダー |
| `src/data/traits.test.ts` | 新規 | 23区×3行・空なしの検証 |
| `src/ui/pages/ResultPage.tsx` | 変更 | 新IAへ全面書き換え |
| `src/ui/pages/ResultPage.test.tsx` | 変更 | 新IAのテストへ全面書き換え |
| `src/ui/pages/WardPage.tsx` | 変更 | パレット注入（構成は変更しない） |
| `app/zukan.css` | 変更 | 変数化・結果ページ新スタイル・シェアバーのメディアクエリ |
| `docs/system-design/03-domain-design.md` | 変更 | 相性%の表示式を追記 |
| `docs/system-design/05-frontend-rendering-design.md` | 変更 | 結果ページ構成・配色トークンを現行化 |

---

### Task 1: 相性%の相対スケーリング `compatibilityPercents`

**Files:**
- Modify: `src/lib/matching.ts`（末尾に追加）
- Test: `src/lib/matching.test.ts`

**Interfaces:**
- Consumes: 既存 `similarityPercent(distance: number): number`
- Produces: `compatibilityPercents(resultDistance: number, compatibleDistances: number[]): number[]` — 距離昇順の相性リストに対応する表示%配列。Task 6 が使う。

- [ ] **Step 1: 失敗するテストを書く**

`src/lib/matching.test.ts` の import 行を次に変更する:

```ts
import { distance, rankDiagnosisMatches, rankMatches, bestMatch, compatibilityPercents, similarityPercent } from './matching';
```

ファイル末尾に追加:

```ts
describe('compatibilityPercents', () => {
  // similarityPercent: 0.5→89, 1.0→78, 1.2→73, 1.5→66, 2.0→55
  it('逆転がなければ生の%をそのまま返す', () => {
    expect(compatibilityPercents(0.5, [1.0, 1.5])).toEqual([78, 66]);
  });
  it('相性側が結果を上回る場合は最大が「結果%−1」になるよう比例スケーリングする', () => {
    // 結果=78%、生=[89, 73, 55] → cap 77 → [77, 63, 47]
    expect(compatibilityPercents(1.0, [0.5, 1.2, 2.0])).toEqual([77, 63, 47]);
  });
  it('スケーリング後も同距離は同%のまま', () => {
    expect(compatibilityPercents(1.0, [0.5, 0.5, 2.0])).toEqual([77, 77, 47]);
  });
  it('空リストと結果0%の境界で壊れない', () => {
    expect(compatibilityPercents(1.0, [])).toEqual([]);
    const maxD = Math.sqrt(20);
    expect(compatibilityPercents(maxD, [0.1])).toEqual([0]); // cap は負にならない
    expect(compatibilityPercents(maxD, [maxD])).toEqual([0]); // 生が全0でも0除算しない
  });
});
```

- [ ] **Step 2: テストが失敗することを確認**

Run: `npx vitest run src/lib/matching.test.ts`
Expected: FAIL（`compatibilityPercents` is not exported）

- [ ] **Step 3: 最小実装**

`src/lib/matching.ts` の末尾に追加:

```ts
/** 相性ランキング表示用の%。生の%の最大が結果の%以上になる場合だけ、
    最大が「結果%−1」となるよう全体を比例スケーリングし、
    表示が常に 結果 > 相性1位 ≥ 2位 ≥ 3位 の単調な並びになることを保証する。
    校正済み割り当てには影響しない（distances は距離昇順前提） */
export function compatibilityPercents(
  resultDistance: number,
  compatibleDistances: number[],
): number[] {
  const raw = compatibleDistances.map(similarityPercent);
  if (raw.length === 0) return raw;
  const resultPercent = similarityPercent(resultDistance);
  const maxRaw = Math.max(...raw);
  if (maxRaw < resultPercent || maxRaw === 0) return raw;
  const cap = Math.max(resultPercent - 1, 0);
  return raw.map((p) => Math.floor((p * cap) / maxRaw));
}
```

- [ ] **Step 4: テストが通ることを確認**

Run: `npx vitest run src/lib/matching.test.ts`
Expected: PASS（既存3件 + 新4件）

- [ ] **Step 5: コミット**

```bash
git add src/lib/matching.ts src/lib/matching.test.ts
git commit -m "feat: 相性%を結果基準で相対スケーリングする compatibilityPercents を追加

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: ハッシュタグ導出 `matchedAxisTags`

**Files:**
- Modify: `src/lib/personaType.ts`（末尾に追加）
- Test: `src/lib/personaType.test.ts`

**Interfaces:**
- Consumes: 同ファイル内の非公開 `POLES` / `pole(key, value)`
- Produces: `matchedAxisTags(user: AxisVector, matched: AxisKey[]): string[]` — 一致軸ごとにユーザー側の極ラベル（例: 華やか志向）を返す。Task 6 が `#ラベル` として表示する。

- [ ] **Step 1: 失敗するテストを書く**

`src/lib/personaType.test.ts` の import に `matchedAxisTags` を追加し（`./personaType` から）、`emptyVector` が未importなら `../domain/axes` から追加する。ファイル末尾に追加:

```ts
describe('matchedAxisTags', () => {
  it('ユーザー側の極のラベルを一致軸の順に返す', () => {
    const user = { ...emptyVector(), luxury: 1, liveliness: -0.6 };
    expect(matchedAxisTags(user, ['luxury', 'liveliness'])).toEqual(['華やか志向', 'のんびり派']);
  });
  it('値0の軸は高い側のラベルになる', () => {
    expect(matchedAxisTags(emptyVector(), ['greenery'])).toEqual(['みどり派']);
  });
});
```

- [ ] **Step 2: テストが失敗することを確認**

Run: `npx vitest run src/lib/personaType.test.ts`
Expected: FAIL（`matchedAxisTags` is not exported）

- [ ] **Step 3: 最小実装**

`src/lib/personaType.ts` の末尾に追加:

```ts
/** 一致軸のハッシュタグ用ラベル。ユーザー側の極の呼び名を一致軸の順に返す */
export function matchedAxisTags(user: AxisVector, matched: AxisKey[]): string[] {
  return matched.map((k) => pole(k, user[k]).label);
}
```

- [ ] **Step 4: テストが通ることを確認**

Run: `npx vitest run src/lib/personaType.test.ts`
Expected: PASS

- [ ] **Step 5: コミット**

```bash
git add src/lib/personaType.ts src/lib/personaType.test.ts
git commit -m "feat: 一致軸からハッシュタグ用の極ラベルを導く matchedAxisTags を追加

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: 区別カラーパレット `wardPalette`

**Files:**
- Create: `src/lib/wardPalette.ts`
- Test: `src/lib/wardPalette.test.ts`

**Interfaces:**
- Consumes: `src/hero/wards.ts` の `WARDS`（テストで全23区の `color` を回す）
- Produces:
  - `interface WardPalette { bg; card; accent; accentText; accentDark; ink: string }`
  - `wardPalette(baseColor: string): WardPalette`
  - `paletteVars(p: WardPalette): Record<string, string>` — `{'--w-bg': …}` 形式。Task 5/6 がルート要素の style に spread する。
  - `contrastRatio(a: string, b: string): number` — WCAG比。テストと将来の検証用に公開。

- [ ] **Step 1: 失敗するテストを書く**

`src/lib/wardPalette.test.ts` を新規作成:

```ts
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
```

- [ ] **Step 2: テストが失敗することを確認**

Run: `npx vitest run src/lib/wardPalette.test.ts`
Expected: FAIL（モジュールが存在しない）

- [ ] **Step 3: 実装**

`src/lib/wardPalette.ts` を新規作成:

```ts
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
```

- [ ] **Step 4: テストが通ることを確認**

Run: `npx vitest run src/lib/wardPalette.test.ts`
Expected: PASS（23区の each ケース含む全件）

- [ ] **Step 5: コミット**

```bash
git add src/lib/wardPalette.ts src/lib/wardPalette.test.ts
git commit -m "feat: 区色から配色トークンを導出する wardPalette を追加（全23区コントラスト保証）

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: 区別「タイプ特徴3行」データとローダー

**Files:**
- Create: `src/data/ward-traits.json`
- Create: `src/data/traits.ts`
- Test: `src/data/traits.test.ts`

**Interfaces:**
- Produces: `loadWardTraits(code: string): string[]` — 区コード→特徴3行。未知コードは `[]`。Task 6 が「あなたの特徴」セクションで使う。

- [ ] **Step 1: 失敗するテストを書く**

`src/data/traits.test.ts` を新規作成:

```ts
import { describe, it, expect } from 'vitest';
import { loadWardTraits } from './traits';
import { loadWards } from './wards';

describe('ward traits', () => {
  it('全23区に3行ずつあり、空文字がない', () => {
    for (const ward of loadWards()) {
      const traits = loadWardTraits(ward.code);
      expect(traits, `${ward.name} (${ward.code})`).toHaveLength(3);
      for (const t of traits) {
        expect(t.trim().length).toBeGreaterThan(0);
        expect(t.length).toBeLessThanOrEqual(30); // カードに収まる短文
      }
    }
  });
  it('未知コードは空配列を返す', () => {
    expect(loadWardTraits('99999')).toEqual([]);
  });
});
```

- [ ] **Step 2: テストが失敗することを確認**

Run: `npx vitest run src/data/traits.test.ts`
Expected: FAIL（モジュールが存在しない）

- [ ] **Step 3: データとローダーを実装**

`src/data/ward-traits.json` を新規作成（AI執筆済み。各区の性格ひとこと `src/hero/wards.ts` の `catch` に沿わせ、中立・前向き原則で3行に要約）:

```json
{
  "13101": ["オンとオフの切り替えがはっきりしている", "中心にいても浮つかず、自分のペースを守る", "静かな時間に頭を整理するのが得意"],
  "13102": ["新しいことにためらいなく飛び込む", "勢いと行動力で流れを引き寄せる", "歴史や伝統への敬意も忘れない"],
  "13103": ["良いものを見抜く審美眼がある", "華やかな場でも物おじしない", "自分の価値観に自信を持っている"],
  "13104": ["自分の時間を大切にするマイペース派", "多様な人と自然体で付き合える", "頑張る人にそっと寄り添う優しさがある"],
  "13105": ["知的好奇心が行動の原動力", "落ち着いた環境で深く考えるのが好き", "学びを暮らしに活かす丁寧さがある"],
  "13106": ["祭りやイベントで真っ先に盛り上がる", "義理人情に厚く、仲間を大切にする", "古いものの良さを誰よりも知っている"],
  "13107": ["手を動かしてものを作るのが好き", "一度決めたらこつこつやり抜く", "伝統の技と新しい技術の両方を尊ぶ"],
  "13108": ["新しい環境を自分の手で切り拓く", "家族や仲間との時間を真ん中に置く", "水辺や緑のそばでリフレッシュする"],
  "13109": ["判断が速く、まず動いてみる", "新しいものと古いものをうまく両立させる", "どんな環境でも安定して力を発揮する"],
  "13110": ["さりげないおしゃれに自分らしさが出る", "流行を追いすぎず、良いものを長く使う", "落ち着いた暮らしの中に楽しみを見つける"],
  "13111": ["地道な努力を積み重ねる働き者", "困っている人を放っておけない", "現場で手を動かすことに誇りを持つ"],
  "13112": ["面倒見がよく、頼られると力が出る", "大人数の輪をやわらかくまとめる", "休日は公園や緑でのんびり過ごしたい"],
  "13113": ["新しい流行に誰よりも早く気づく", "自由な発想で周りを驚かせる", "変化の速い環境ほどわくわくする"],
  "13114": ["好きなことにとことん深く潜る", "一人の時間を上手に楽しめる", "独自の視点で物事を面白がる"],
  "13115": ["静かな環境で趣味に集中するのが至福", "流行より自分の「好き」を信じる", "穏やかだが内に熱いこだわりを持つ"],
  "13116": ["都会の便利さを遊びつくす行動派", "限られた条件でも楽しみを見つける天才", "にぎやかな場所にいると元気が出る"],
  "13117": ["昔ながらの人付き合いを大切にする", "小さな親切を自然に積み重ねる", "懐かしいものに心が安らぐ"],
  "13118": ["家族や身近な人をいちばんに考える", "つつましい暮らしに幸せを見つける", "手作りのぬくもりを大切にする"],
  "13119": ["気取らず等身大で人と付き合う", "いざという時に頼られる安定感がある", "日常の暮らしを着実に整える"],
  "13120": ["面倒見がよく、周りを明るくする", "趣味も家庭も全力で楽しむ", "土や緑に触れると元気になる"],
  "13121": ["気は優しくて、いざという時に頼りになる", "仲間や家族のためなら力を惜しまない", "経験に裏打ちされた度胸がある"],
  "13122": ["人情に厚く、涙もろい一面がある", "どこへ行っても帰る場所を大切にする", "初対面でもすぐ打ち解けられる"],
  "13123": ["外で体を動かすのが大好き", "大勢でわいわいするほど楽しい", "好奇心のままにまっすぐ突き進む"]
}
```

`src/data/traits.ts` を新規作成:

```ts
// タイプ特徴（AIによる事前執筆）。各区の性格ひとこと（src/hero/wards.ts の catch）と
// 5軸の傾きに沿わせ、UIコピーの中立・前向き原則で3行に要約している。
import raw from './ward-traits.json';

const DATA = raw as Record<string, string[]>;

/** 区コードからタイプ特徴3行（AI執筆）を返す。未知コードは空配列 */
export function loadWardTraits(code: string): string[] {
  return DATA[code] ?? [];
}
```

- [ ] **Step 4: テストが通ることを確認**

Run: `npx vitest run src/data/traits.test.ts`
Expected: PASS

- [ ] **Step 5: コミット**

```bash
git add src/data/ward-traits.json src/data/traits.ts src/data/traits.test.ts
git commit -m "feat: 区別のタイプ特徴3行（AI執筆）とローダーを追加

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 5: パレット配線（zukan.css 変数化 + WardPage 注入）

**Files:**
- Modify: `app/zukan.css`（`.book-section` / `.book-section-eyebrow` / `.ward-page` / `.ward-page-back`）
- Modify: `src/ui/pages/WardPage.tsx:61`

**Interfaces:**
- Consumes: Task 3 の `wardPalette` / `paletteVars`
- Produces: CSS変数 `--w-bg` `--w-card` `--w-accent` `--w-accent-text` `--w-accent-dark` `--w-ink` がキャラページのルートで利用可能になる。フォールバックは現行リテラル値。

- [ ] **Step 1: zukan.css の対象4箇所を変数参照に変更**

`.book-section`（現在 `background: #17110c;`）:

```css
.book-section {
  background: var(--w-bg, #17110c);
  color: #f4e8d0;
  padding: 96px 20px 120px;
}
```

`.book-section-eyebrow`（現在 `color: #b8923f;`）: `color: var(--w-accent-dark, #b8923f);` に変更。

`.ward-page` ブロック（`/* ---- 区詳細ページ */` 配下、現在 `background: linear-gradient(180deg, #f7ecd4 0%, #eeddb8 100%); border: 3px solid #b8923f; ... color: #4a3418;`）:

```css
.ward-page {
  --ward-color: #b8923f;
  display: grid;
  grid-template-columns: minmax(240px, 340px) 1fr;
  gap: 28px;
  align-items: start;
  background: var(--w-card, #f7ecd4);
  border: 3px solid var(--w-accent, #b8923f);
  border-radius: 14px;
  padding: 28px;
  color: var(--w-ink, #4a3418);
  text-align: left;
}
```

`.ward-page-back`（現在 `color: #b8923f;`）: `color: var(--w-accent-dark, #b8923f);` に変更。

上記以外の箇所（図鑑グリッド・モーダル・診断フロー・シェアカード等）は**変更しない**。トップページは変数未定義のためフォールバック値でこれまで通り表示される。

- [ ] **Step 2: WardPage にパレットを注入**

`src/ui/pages/WardPage.tsx` に import を追加:

```ts
import { paletteVars, wardPalette } from '../../lib/wardPalette';
```

`WardPage` 関数内（`const theme = wardTheme(ward.code);` の直後）に追加:

```ts
const palette = wardPalette(theme.color);
```

ルート要素（61行目）を変更:

```tsx
<main className="book-section" style={{ minHeight: '100vh', ['--ward-color' as string]: theme.color, ...paletteVars(palette) }}>
```

- [ ] **Step 3: テストとビルドで退行がないことを確認**

Run: `npm test`
Expected: 全件PASS（WardPage の既存テスト含む）

Run: `npm run build`
Expected: ビルド成功

- [ ] **Step 4: コミット**

```bash
git add app/zukan.css src/ui/pages/WardPage.tsx
git commit -m "feat: 区別パレットのCSS変数化と区詳細ページへの注入

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 6: ResultPage の新IAへの書き換え

**Files:**
- Modify: `src/ui/pages/ResultPage.tsx`（全面書き換え）
- Modify: `src/ui/pages/ResultPage.test.tsx`（全面書き換え）
- Modify: `app/zukan.css`（result-* スタイルの刷新）

**Interfaces:**
- Consumes: Task 1 `compatibilityPercents`、Task 2 `matchedAxisTags`、Task 3 `wardPalette`/`paletteVars`、Task 4 `loadWardTraits`
- Produces: 新IAの結果ページ。CSSクラス `result-card-visual/-overlay/-lead/-tags/-actions`、`result-share-button`、`result-detail-button`、`result-trait-list`、`result-accordion(-body)`、`result-final-cta` を新設。

- [ ] **Step 1: テストを新IAに合わせて全面書き換え（失敗するテスト）**

`src/ui/pages/ResultPage.test.tsx` を以下の内容に置き換える:

```tsx
import "@testing-library/jest-dom";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { ResultPage } from "./ResultPage";
import { saveDiagnosis } from "../../lib/diagnosisSession";
import { emptyVector } from "../../domain/axes";

vi.mock("next/link", () => ({
  default: ({ href, children, ...p }: any) => (
    <a href={href} {...p}>
      {children}
    </a>
  ),
}));

describe("ResultPage", () => {
  beforeEach(() => sessionStorage.clear());

  it("shows visitor view (CTA, no ranking, no result card) without a saved diagnosis", () => {
    const { container } = render(<ResultPage slug="minato" />);
    expect(screen.getAllByText(/港区ちゃん/).length).toBeGreaterThan(0);
    expect(screen.getByText(/あなたも診断する/)).toBeInTheDocument();
    expect(screen.queryByText(/相性ランキング/)).not.toBeInTheDocument();
    expect(screen.queryByTestId("result-card")).not.toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "港区ちゃんの診断結果シェア画像" }),
    ).toHaveAttribute("src", "/og/minato.jpg");
    // 訪問者にも「もっと詳しく」アコーディオン（性格・ステータス）は見える
    expect(container.querySelectorAll("details.result-accordion")).toHaveLength(2);
    expect(screen.queryByText(/タイプの特徴/)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /で結果をシェアする/ }),
    ).not.toBeInTheDocument();
  });

  it("shows the result card with overlay name+percent, catch, tags and actions", () => {
    saveDiagnosis({ ...emptyVector(), luxury: 1 }, "13103");
    render(<ResultPage slug="minato" />);
    const card = screen.getByTestId("result-card");
    // 画像上のオーバーレイに区名とにてる度
    const overlay = card.querySelector(".result-card-overlay")!;
    expect(overlay).toHaveTextContent("港区ちゃん");
    expect(overlay).toHaveTextContent(/にてる度\d+%/);
    // キャッチコピーとハッシュタグ（一致軸2本の極ラベル）
    expect(card).toHaveTextContent(/財政力1\.15の絶対王者/);
    expect(card.querySelectorAll(".result-card-tags span")).toHaveLength(2);
    expect(card).toHaveTextContent(/#華やか志向/);
    // カード内のシェアと詳細導線
    expect(
      within(card as HTMLElement).getByRole("link", { name: /で結果をシェアする/ }),
    ).toBeInTheDocument();
    expect(
      within(card as HTMLElement).getByRole("link", { name: "詳しく見る" }),
    ).toHaveAttribute("href", "/ward/minato/");
  });

  it("shows traits and persona summary in the type section", () => {
    saveDiagnosis({ ...emptyVector(), luxury: 1 }, "13103");
    render(<ResultPage slug="minato" />);
    const heading = screen.getByText("港区ちゃんタイプの特徴");
    const section = heading.closest("section")!;
    expect(section.querySelectorAll(".result-trait-list li")).toHaveLength(3);
    expect(screen.getByText(/タイプは「華やか志向タイプ」/)).toBeInTheDocument();
  });

  it("renders exactly one radar and only matched-axis tracks", () => {
    saveDiagnosis({ ...emptyVector(), luxury: 1 }, "13103");
    const { container } = render(<ResultPage slug="minato" />);
    expect(container.querySelectorAll(".ward-detail-radar")).toHaveLength(1);
    expect(container.querySelectorAll(".result-axis-compare")).toHaveLength(2);
    expect(
      screen.getByText(/なぜ、港区ちゃんと相性がいいの/),
    ).toBeInTheDocument();
    expect(screen.getAllByText("ここが一致！")).toHaveLength(2);
    expect(
      screen.getByText(/華やかさで応えてくれる度合いなら/),
    ).toBeInTheDocument();
  });

  it("badges only axes that are actually close (matched axis with a wide gap gets no badge)", () => {
    // 新宿: family差0（一致）だがliveliness差0.86（遠い）→ バッジは1つだけ
    saveDiagnosis(
      { ...emptyVector(), liveliness: 0.6, family: -1, greenery: -0.2 },
      "13104",
    );
    render(<ResultPage slug="shinjuku" />);
    expect(screen.getAllByText("ここが一致！")).toHaveLength(1);
  });

  it("puts detail content into three accordions for owners", () => {
    saveDiagnosis({ ...emptyVector(), luxury: 1 }, "13103");
    const { container } = render(<ResultPage slug="minato" />);
    expect(container.querySelectorAll("details.result-accordion")).toHaveLength(3);
    expect(screen.getByText("性格を詳しく見る")).toBeInTheDocument();
    expect(screen.getByText(/実はこんな街、港区/)).toBeInTheDocument();
    expect(screen.getByText("港区ちゃんのステータスを見る")).toBeInTheDocument();
    // 中身（閉じていてもDOMには存在する）
    expect(screen.getByText("昼夜間人口比率")).toBeInTheDocument();
    expect(screen.getByText("23区1位")).toBeInTheDocument();
    expect(screen.getByText(/はぐくむまち/)).toBeInTheDocument();
    expect(
      screen.getAllByText(/1を超えるほど自前の税収/).length,
    ).toBeGreaterThan(0);
    expect(
      screen.getByRole("link", { name: "より詳しく見る" }),
    ).toHaveAttribute("href", "/ward/minato/");
  });

  it("keeps compatibility percents strictly below the result percent", () => {
    // 港区が距離最小になりにくい正反対のベクトルでも、表示上の逆転が起きない
    saveDiagnosis({ ...emptyVector(), liveliness: -1, luxury: -1 }, "13103");
    render(<ResultPage slug="minato" />);
    const strong = screen
      .getByTestId("result-card")
      .querySelector(".result-card-overlay-percent strong")!;
    const cardPercent = Number(strong.textContent!.replace("%", ""));
    const rankPercents = screen
      .getAllByText(/にてる度 \d+%/)
      .map((el) => Number(el.textContent!.match(/(\d+)%/)![1]));
    expect(rankPercents).toHaveLength(3);
    for (const p of rankPercents) expect(p).toBeLessThan(cardPercent);
  });

  it("shows ranking cards with ward OGP images", () => {
    saveDiagnosis({ ...emptyVector(), luxury: 1 }, "13103");
    render(<ResultPage slug="minato" />);
    expect(screen.getByText(/相性ランキング/)).toBeInTheDocument();
    const rankLinks = screen.getAllByRole("img", { name: /ちゃんの詳細を見る/ });
    expect(rankLinks).toHaveLength(3);
    expect(rankLinks[0].closest("a")).toHaveAttribute(
      "href",
      expect.stringMatching(/^\/ward\/.+\/$/),
    );
  });

  it("shows share CTA three times (card + final CTA + mobile bar) with personalized text", () => {
    saveDiagnosis({ ...emptyVector(), luxury: 1 }, "13103");
    render(<ResultPage slug="minato" />);
    expect(screen.getByText(/この結果、誰かに似ていませんか/)).toBeInTheDocument();
    const shareLinks = screen.getAllByRole("link", { name: /で結果をシェアする/ });
    expect(shareLinks).toHaveLength(3);
    for (const link of shareLinks) {
      const url = new URL(link.getAttribute("href")!);
      const text = url.searchParams.get("text")!;
      expect(text).toContain("にてる度");
      expect(text).toContain("タイプは「華やか志向タイプ」");
      expect(text).toContain("#うちの区ちゃん");
      expect(text).toContain("#都知事杯オープンデータハッカソン");
    }
  });

  it("shows visitor view when the saved result belongs to a different ward", () => {
    saveDiagnosis({ ...emptyVector(), luxury: 1 }, "13101");
    render(<ResultPage slug="minato" />);
    expect(screen.queryByText(/相性ランキング/)).not.toBeInTheDocument();
    expect(screen.getByText(/あなたも診断する/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: テストが失敗することを確認**

Run: `npx vitest run src/ui/pages/ResultPage.test.tsx`
Expected: FAIL（新クラス・新構成が未実装）

- [ ] **Step 3: ResultPage.tsx を書き換え**

`src/ui/pages/ResultPage.tsx` を以下の内容に置き換える:

```tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AXIS_LABELS } from "../../domain/axes";
import { loadAffinityText } from "../../data/affinity";
import { pickPolicyForAxes, loadWardProfile } from "../../data/policies";
import { CODE_TO_SLUG, SLUG_TO_CODE } from "../../data/slugs";
import { loadCharacterRationale } from "../../data/rationale";
import { loadWardTraits } from "../../data/traits";
import { loadWards } from "../../data/wards";
import {
  loadDiagnosisSession,
  type DiagnosisSession,
} from "../../lib/diagnosisSession";
import {
  compatibilityPercents,
  rankDiagnosisMatches,
  similarityPercent,
} from "../../lib/matching";
import {
  matchedAxisTags,
  personaType,
  selectMatchedAxes,
} from "../../lib/personaType";
import { rankOf, ratioToMean } from "../../lib/rank";
import { paletteVars, wardPalette } from "../../lib/wardPalette";
import { Radar } from "../Radar";
import { xShareUrl } from "../share";
import { StatBar } from "../StatBar";
import { buildRadarStats, statLabelForAxis } from "../wardStats";
import { wardTheme } from "../wardTheme";

const WARDS = loadWards();

export function ResultPage({ slug }: { slug: string }) {
  const ward = WARDS.find((w) => w.code === SLUG_TO_CODE[slug])!;
  // hydration差異を避けるため、sessionStorageはマウント後に読む
  const [diagnosis, setDiagnosis] = useState<DiagnosisSession | null>(null);
  useEffect(() => {
    const saved = loadDiagnosisSession();
    setDiagnosis(saved?.resultCode === ward.code ? saved : null);
  }, [ward.code]);

  const userVector = diagnosis?.vector ?? null;
  const ranked = userVector
    ? rankDiagnosisMatches(userVector, WARDS, ward.code)
    : null;
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const theme = wardTheme(ward.code);
  const palette = wardPalette(theme.color);
  const rationale = loadCharacterRationale(ward.code);
  const traits = loadWardTraits(ward.code);
  const allMetrics = WARDS.map((w) => w.metrics!);
  const stats = buildRadarStats(ward.metrics!, allMetrics);
  const compatible =
    ranked?.filter((match) => match.ward.code !== ward.code).slice(0, 3) ?? [];

  // 診断者向け: あなたのタイプ・一致軸・相性文・データカード・政策
  const persona = userVector ? personaType(userVector) : null;
  const matchedAxes = userVector
    ? selectMatchedAxes(userVector, ward.axes)
    : null;
  const affinityText = matchedAxes
    ? loadAffinityText(ward.code, matchedAxes[0])
    : null;
  const matchedStats = matchedAxes
    ? matchedAxes
        .map((axis) =>
          stats.find((s) => s.label === statLabelForAxis(axis, ward.axes)),
        )
        .filter((s): s is NonNullable<typeof s> => s !== undefined)
    : [];
  const profile = loadWardProfile(ward.code);
  const policy =
    matchedAxes && profile
      ? pickPolicyForAxes(profile.policies, matchedAxes)
      : null;
  // 自区（ランキング先頭）との距離から にてる度% を出す
  const percent = ranked ? similarityPercent(ranked[0].distance) : null;
  // 相性側の表示%は結果の%を超えない（compatibilityPercents が相対スケーリング）
  const compatPercents = ranked
    ? compatibilityPercents(
        ranked[0].distance,
        compatible.map((m) => m.distance),
      )
    : [];
  const tags =
    userVector && matchedAxes ? matchedAxisTags(userVector, matchedAxes) : [];
  /** [-1,1] → トラック上の位置% */
  const trackPos = (v: number) => ((v + 1) / 2) * 100;
  const shareHref =
    percent !== null && persona
      ? xShareUrl(ward, shareUrl, { percent, personaName: persona.name })
      : xShareUrl(ward, shareUrl);

  return (
    <main
      className={userVector ? "book-section has-share-bar" : "book-section"}
      style={{
        minHeight: "100vh",
        ["--ward-color" as string]: theme.color,
        ...paletteVars(palette),
      }}
    >
      <div className="book-section-inner">
        <p className="book-section-eyebrow">SHINDAN RESULT</p>
        <h1 className="book-section-title">
          {userVector
            ? "あなたに一番似ているのは…"
            : `この人は${ward.name}ちゃんタイプ！`}
        </h1>

        {userVector && percent !== null ? (
          /* ① 結果カード: 画像オーバーレイ＋キャッチ＋タグ＋導線でファーストビュー完結 */
          <div className="result-card" data-testid="result-card">
            <div className="result-card-visual">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="result-card-image"
                src={`/og/${slug}.jpg`}
                alt={`${ward.name}ちゃんの診断結果シェア画像`}
                width={1200}
                height={630}
              />
              <p className="result-card-overlay">
                <span className="result-card-overlay-name">
                  {ward.name}ちゃん
                </span>
                <span className="result-card-overlay-percent">
                  <span>にてる度</span>
                  <strong>{percent}%</strong>
                </span>
              </p>
            </div>
            <p className="result-card-lead">
              {theme.catch}
              {tags.length > 0 && (
                <span className="result-card-tags">
                  {tags.map((t) => (
                    <span key={t}>#{t}</span>
                  ))}
                </span>
              )}
            </p>
            <div className="result-card-actions">
              <a
                className="result-share-button"
                href={shareHref}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span aria-hidden="true">𝕏</span> で結果をシェアする
              </a>
              <Link className="result-detail-button" href={`/ward/${slug}/`}>
                詳しく見る
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="result-hero">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="result-og-image"
                src={`/og/${slug}.jpg`}
                alt={`${ward.name}ちゃんの診断結果シェア画像`}
                width={1200}
                height={630}
              />
              <p className="result-character-line">{theme.catch}</p>
            </div>
            <div className="result-primary-action">
              <Link
                className="diagnosis-option result-share-link"
                href="/#diagnosis"
              >
                あなたも診断する
              </Link>
            </div>
          </>
        )}

        {/* ② あなたの特徴 */}
        {persona && userVector && (
          <section className="result-section result-type-section">
            <p className="result-section-kicker">YOUR TYPE</p>
            <h2>{ward.name}ちゃんタイプの特徴</h2>
            {traits.length > 0 && (
              <ul className="result-trait-list">
                {traits.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            )}
            <p className="result-type-description">
              タイプは「{persona.name}」。{persona.description}
            </p>
          </section>
        )}

        {/* ③ なぜこの結果になったか（ページ内で唯一のレーダー＋一致軸のみ） */}
        {userVector && matchedAxes && (
          <section className="result-section result-affinity-section">
            <p className="result-section-kicker">WHY WE MATCH</p>
            <h2>なぜ、{ward.name}ちゃんと相性がいいの？</h2>
            <div className="ward-detail-radar">
              <Radar
                vector={ward.axes}
                color={theme.color}
                overlay={userVector}
              />
            </div>
            <p className="result-radar-legend">
              <span className="result-legend-ward">{ward.name}ちゃん</span>
              <span className="result-legend-you">あなた</span>
            </p>
            <ul className="result-axis-compare-list">
              {matchedAxes.map((k) => {
                // 選定軸でも実際の差が大きい軸に「一致」を名乗らせない
                const matched = Math.abs(userVector[k] - ward.axes[k]) <= 0.5;
                return (
                  <li
                    key={k}
                    className={
                      matched
                        ? "result-axis-compare is-matched"
                        : "result-axis-compare"
                    }
                  >
                    <span className="result-axis-name">
                      {AXIS_LABELS[k].name}
                      {matched && (
                        <span className="result-axis-match-badge">
                          ここが一致！
                        </span>
                      )}
                    </span>
                    <div className="result-axis-track" aria-hidden="true">
                      <span
                        className="result-axis-marker is-ward"
                        style={{ left: `${trackPos(ward.axes[k])}%` }}
                      />
                      <span
                        className="result-axis-marker is-you"
                        style={{ left: `${trackPos(userVector[k])}%` }}
                      />
                    </div>
                    <span className="result-axis-ends" aria-hidden="true">
                      <span>{AXIS_LABELS[k].low}</span>
                      <span>{AXIS_LABELS[k].high}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
            {affinityText && (
              <>
                <span className="result-ai-badge">AIによる相性解説</span>
                <p className="result-rationale">{affinityText}</p>
              </>
            )}
          </section>
        )}

        {/* ④ もっと詳しく（アコーディオン）。訪問者にも性格・ステータスは見せる */}
        <section className="result-section result-more-section">
          <p className="result-section-kicker">MORE</p>
          <h2>もっと詳しく</h2>
          {rationale && (
            <details className="result-accordion">
              <summary>性格を詳しく見る</summary>
              <div className="result-accordion-body">
                <span className="result-ai-badge">AIによるキャラクター設定</span>
                <p className="result-rationale">{rationale}</p>
              </div>
            </details>
          )}
          {userVector && matchedAxes && (matchedStats.length > 0 || policy) && (
            <details className="result-accordion">
              <summary>実はこんな街、{ward.name}</summary>
              <div className="result-accordion-body">
                {matchedStats.length > 0 && (
                  <div className="result-town-cards">
                    {matchedStats.map((stat) => (
                      <div key={stat.label} className="result-town-card">
                        <span className="result-town-card-label">
                          {stat.label}
                        </span>
                        <span className="result-town-card-value">
                          {stat.text}
                        </span>
                        <span className="result-town-card-rank">
                          23区{rankOf(stat.vs, stat.v)}位
                        </span>
                        {stat.note && (
                          <span className="result-town-card-note">
                            {stat.note}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {policy && (
                  <div className="result-town-policy">
                    <p className="result-town-policy-kicker">
                      {ward.name}ちゃんはこんなことを頑張ってる
                    </p>
                    <p className="result-town-policy-title">{policy.title}</p>
                    <p className="result-town-policy-summary">
                      {policy.summary}
                    </p>
                    <a
                      className="result-town-policy-source"
                      href={policy.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      出典: {policy.source}
                    </a>
                  </div>
                )}
              </div>
            </details>
          )}
          <details className="result-accordion">
            <summary>{ward.name}ちゃんのステータスを見る</summary>
            <div className="result-accordion-body">
              <div className="result-stat-list">
                {stats.map((stat) => (
                  <StatBar
                    key={stat.label}
                    label={stat.label}
                    valueText={stat.text}
                    rank={rankOf(stat.vs, stat.v)}
                    ratio={ratioToMean(stat.vs, stat.v)}
                    note={stat.note}
                  />
                ))}
              </div>
              <p className="stat-section-caption">
                バーの中央線＝23区平均。順位は値の大きい順。
              </p>
              <Link
                className="result-status-detail-link"
                href={`/ward/${slug}/`}
              >
                より詳しく見る
              </Link>
            </div>
          </details>
        </section>

        {/* ⑤ 似ているキャラクター */}
        {compatible.length > 0 && (
          <>
            <h2 className="result-ranking-title">
              相性ランキング — あなたと相性のいい区ちゃん
            </h2>
            <ol className="result-ranking">
              {compatible.map((m, i) => {
                const rankTheme = wardTheme(m.ward.code);
                const matchSlug = CODE_TO_SLUG[m.ward.code];
                return (
                  <li
                    key={m.ward.code}
                    style={{ ["--ward-color" as string]: rankTheme.color }}
                  >
                    <Link
                      className="result-rank-link"
                      href={`/ward/${matchSlug}/`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/og/${matchSlug}.jpg`}
                        alt={`${m.ward.name}ちゃんの詳細を見る`}
                        width={1200}
                        height={630}
                        loading="lazy"
                      />
                      <div className="result-rank-copy">
                        <span className="result-rank">相性 {i + 1}位</span>
                        <span className="result-rank-score">
                          にてる度 {compatPercents[i]}%
                        </span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </>
        )}

        {/* ⑥ 最後のシェアCTA（カード再掲なし） */}
        {userVector && (
          <section className="result-final-cta">
            <p>この結果、誰かに似ていませんか？</p>
            <a
              className="result-share-button"
              href={shareHref}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span aria-hidden="true">𝕏</span> で結果をシェアする
            </a>
          </section>
        )}
      </div>
      {userVector && (
        <div className="result-share-bar">
          <a
            className="result-share-button result-share-bar-button"
            href={shareHref}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span aria-hidden="true">𝕏</span> で結果をシェアする
          </a>
        </div>
      )}
    </main>
  );
}
```

注意: 旧コードにあった `AXIS_KEYS` import・`heroBadges`・セクションごとのインライン `--ward-color`（ルートで一括注入に変更。相性ランキングの li のみ各区色を個別注入）は削除する。

- [ ] **Step 4: ユニットテストが通ることを確認**

Run: `npx vitest run src/ui/pages/ResultPage.test.tsx`
Expected: PASS（全11ケース）

- [ ] **Step 5: zukan.css の result-* スタイルを刷新**

**(a) 削除する既存ブロック**（`.result-card` 〜 `.result-card-share`、旧 `.result-x-share` 系、旧 `.result-share-bar` 系、`.has-share-bar`、`.result-status { position: relative; }`）:

- `.result-card`（旧: width min(420px)・border・gradient）
- `.result-card-image`（旧: border付き）
- `.result-card-name` / `.result-card-percent` / `.result-card-percent span` / `.result-card-percent strong` / `.result-card-type` / `.result-card-badges` / `.result-card-badges li`
- `.result-x-share` / `.result-x-share:hover` / `.result-x-share:focus-visible` / `.result-card-share`
- `.result-share-bar` / `.result-share-bar-button` / `.has-share-bar`
- `.result-status { position: relative; }` と `.result-status .ward-detail-radar`（`.result-status-detail-link` 本体のスタイルは残す）
- `.result-type-section .ward-detail-radar`（レーダーはWHYセクションへ移動したため）

**(b) 同じ場所に追加する新ブロック**:

```css
/* ① 結果カード: 画像オーバーレイ型・PCで最大820px */
.result-card {
  width: min(820px, 100%);
  margin: 26px auto 0;
  padding: clamp(12px, 2.2vw, 18px);
  border-radius: 18px;
  background: var(--w-card, #f7ecd4);
  color: var(--w-ink, #4a3418);
  text-align: center;
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.42);
}

.result-card-visual {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
}

.result-card-image {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 1200 / 630;
  object-fit: cover;
}

.result-card-overlay {
  position: absolute;
  inset: auto 0 0 0;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin: 0;
  padding: clamp(26px, 5vw, 44px) clamp(14px, 3vw, 24px) clamp(10px, 2vw, 16px);
  background: linear-gradient(180deg, rgba(10, 6, 2, 0) 0%, rgba(10, 6, 2, 0.82) 82%);
  color: #fff;
}

.result-card-overlay-name {
  font-size: clamp(16px, 3vw, 24px);
  font-weight: 700;
  letter-spacing: 0.08em;
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.6);
}

.result-card-overlay-percent {
  display: inline-flex;
  align-items: baseline;
  gap: 8px;
  white-space: nowrap;
}

.result-card-overlay-percent span {
  font-size: clamp(10px, 1.8vw, 13px);
  letter-spacing: 0.22em;
  opacity: 0.85;
}

.result-card-overlay-percent strong {
  font-size: clamp(36px, 7vw, 58px);
  font-weight: 800;
  line-height: 1;
  color: var(--w-accent-dark, #e8c56b);
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.55);
}

.result-card-lead {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: center;
  gap: 6px 14px;
  margin-top: 14px;
  font-size: clamp(13px, 2vw, 15px);
  line-height: 1.8;
}

.result-card-tags {
  display: inline-flex;
  gap: 10px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: var(--w-accent, #8a6c3c);
}

.result-card-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-top: 16px;
}

/* シェアはページ内で最も目立つボタン（区色） */
.result-share-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-width: min(300px, 100%);
  padding: 15px 28px;
  border-radius: 999px;
  background: var(--w-accent, #b8923f);
  color: var(--w-accent-text, #fffbf0);
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-decoration: none;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.34);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.result-share-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.46);
}

.result-share-button:focus-visible {
  outline: 3px solid var(--w-accent-dark, #e8c56b);
  outline-offset: 3px;
}

.result-detail-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 13px 26px;
  border: 2px solid var(--w-accent, #b8923f);
  border-radius: 999px;
  color: var(--w-ink, #4a3418);
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-decoration: none;
}

/* 追従シェアバーはモバイル幅のみ */
.result-share-bar {
  display: none;
}

@media (max-width: 640px) {
  .result-share-bar {
    position: fixed;
    inset: auto 0 0 0;
    display: flex;
    justify-content: center;
    padding: 10px 16px calc(10px + env(safe-area-inset-bottom));
    background: rgba(5, 5, 5, 0.72);
    -webkit-backdrop-filter: blur(8px);
    backdrop-filter: blur(8px);
    z-index: 40;
  }

  .result-share-bar-button {
    min-width: min(340px, 100%);
    padding: 12px 24px;
    box-shadow: none;
  }

  .has-share-bar {
    padding-bottom: 110px;
  }
}
```

**(c) `.result-section` と `.result-section-kicker` を装飾整理版に置き換え**（枠線・影を撤去、セクション間余白拡大・内側余白縮小、キッカー縮小）:

```css
.result-section {
  width: min(760px, 100%);
  margin: 64px auto 0;
  padding: clamp(20px, 3.4vw, 30px);
  border-radius: 14px;
  background: var(--w-card, #f7ecd4);
  color: var(--w-ink, #4a3418);
  text-align: left;
}

.result-section-kicker {
  margin-bottom: 7px;
  color: var(--w-accent, #8a6c3c);
  font-size: 9px;
  letter-spacing: 0.28em;
}
```

**(d) 新規ブロックを `.result-ai-badge` の手前に追加**:

```css
/* ③ WHYセクションのレーダー（旧 .result-type-section .ward-detail-radar の代替） */
.result-affinity-section .ward-detail-radar {
  margin: 18px 0 6px;
  display: flex;
  justify-content: center;
}

/* ② タイプ特徴3行 */
.result-trait-list {
  list-style: none;
  margin: 16px 0 0;
  padding: 0;
  display: grid;
  gap: 10px;
}

.result-trait-list li {
  position: relative;
  padding-left: 22px;
  font-size: 15px;
  line-height: 1.9;
}

.result-trait-list li::before {
  content: '◆';
  position: absolute;
  left: 0;
  top: 0.45em;
  font-size: 12px;
  color: var(--w-accent, #b8923f);
}

/* ④ 詳細アコーディオン */
.result-accordion {
  border-top: 1px solid rgba(74, 52, 24, 0.18);
}

.result-accordion:last-of-type {
  border-bottom: 1px solid rgba(74, 52, 24, 0.18);
}

.result-accordion summary {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 4px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.06em;
  list-style: none;
}

.result-accordion summary::-webkit-details-marker {
  display: none;
}

.result-accordion summary::before {
  content: '＋';
  font-weight: 800;
  color: var(--w-accent, #b8923f);
}

.result-accordion[open] summary::before {
  content: '−';
}

.result-accordion-body {
  padding: 0 4px 20px;
}

.result-accordion .result-status-detail-link {
  position: static;
  display: inline-block;
  margin-top: 14px;
}

/* ⑥ 最後のシェアCTA */
.result-final-cta {
  margin: 72px auto 0;
  text-align: center;
}

.result-final-cta p {
  margin-bottom: 16px;
  color: #d8c8a4;
  font-size: 14px;
  letter-spacing: 0.12em;
}
```

**(e) 相性ランキングのモバイル横スクロール**（既存 `.result-rank-score` ブロックの直後に追加）:

```css
@media (max-width: 640px) {
  .result-ranking {
    display: flex;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    padding: 0 4px 10px;
  }

  .result-ranking li {
    flex: 0 0 76%;
    scroll-snap-align: start;
  }
}
```

**(f) 変数参照への置き換え**（結果ページ内の残存ブロック）:

- `.result-ranking-title { color: #b8923f; }` → `color: var(--w-accent-dark, #b8923f);`
- `.result-hero { --ward-color: #b8923f; }` と `.result-og-image` は現状維持（訪問者ビュー、ルートの `--ward-color` 注入で区色になる）

- [ ] **Step 6: 全テストとビルドの確認**

Run: `npm test`
Expected: 全件PASS

Run: `npm run build`
Expected: ビルド成功（OGP警告は `NEXT_PUBLIC_SITE_URL` 未設定時の既知動作）

- [ ] **Step 7: コミット**

```bash
git add src/ui/pages/ResultPage.tsx src/ui/pages/ResultPage.test.tsx app/zukan.css
git commit -m "feat: 診断結果ページを新IA（カード完結・アコーディオン・相対%）へ再構成

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 7: システム設計書の更新

**Files:**
- Modify: `docs/system-design/03-domain-design.md`（「にてる度」の段落）
- Modify: `docs/system-design/05-frontend-rendering-design.md`（結果ページの2段落 + 配色トークンの段落追加）

**Interfaces:** なし（ドキュメントのみ）

- [ ] **Step 1: 03-domain-design.md の更新**

「表示用の「にてる度」は…整数へ丸める。」の文の直後に追加:

```
相性ランキングの表示%は `compatibilityPercents`（`src/lib/matching.ts`）で導出する。診断割り当ては校正済みで結果の区が距離最小とは限らないため、生の%の最大値が結果の区の%以上になる場合だけ、最大が「結果% − 1」となるよう全体を比例スケーリングし、表示が常に「結果 > 相性1位 ≥ 2位 ≥ 3位」の単調な並びになることを保証する。逆転がない場合は生の値のまま表示し、校正済み割り当てとX共有文面の%には影響しない。
```

- [ ] **Step 2: 05-frontend-rendering-design.md の結果ページ段落を現行化**

結果ページを説明する段落（「結果ページのヒーローは診断済みか未診断かで分岐する。…」）を以下に置き換える:

```
結果ページのヒーローは診断済みか未診断かで分岐する。診断済みユーザーには幅 `min(820px, 100%)` の「結果カード」（`data-testid="result-card"`）を表示する。区別OGP画像（`public/og/{slug}.jpg`、1200×630）の下端にスクリムを重ね、画像上へ区名（小）と `similarityPercent(ranked[0].distance)` によるにてる度%（大）をオーバーレイする。画像下にキャッチコピーと一致軸2本のハッシュタグ（`matchedAxisTags` がユーザー側の極ラベルを返す）、区色のXシェアボタンと `/ward/{slug}/` への「詳しく見る」導線を置き、ファーストビューで「結果→シェア」が完結する。未診断の閲覧者には従来どおり区別OGP画像と「あなたも診断する」CTAを表示する。

以降は ②「{区名}ちゃんタイプの特徴」（`src/data/ward-traits.json` のAI執筆3行と `personaType` の総評）、③「なぜ相性がいいの？」（ページ内で唯一のレーダーに利用者ベクトルを `overlay` で重ね、`selectMatchedAxes` の一致軸2本だけの比較バーを表示。軸差0.5以下の軸に「ここが一致！」バッジ、一致軸1位のAI相性文を添える）、④「もっと詳しく」（`<details>` のアコーディオン3つ: キャラクター設定理由・一致軸のデータカードと政策・`StatBar` によるステータス一覧と区詳細導線。レーダーは置かない）、⑤ 相性ランキング3件（各区のOGP画像。%は `compatibilityPercents` の相対スケーリング値で、結果の%を超えない。640px以下では横スクロール表示）、⑥ 最後のシェアCTA（「この結果、誰かに似ていませんか？」とシェアボタンのみ）の順に表示する。未診断の閲覧者には②③⑤⑥を出さず、④の性格・ステータスのアコーディオンのみ表示する。
```

X共有の段落末尾「共有CTAは結果カード直下のボタンと、画面下部に `position: fixed` で追従するシェアバー（診断済みのときだけ表示）の2箇所に置き、旧来の最下部単独シェア枠は廃止した。」を以下に置き換える:

```
共有CTAは結果カード内のボタン・ページ最下部のCTA・画面下部の追従シェアバーの3箇所に置く。追従シェアバーは `@media (max-width: 640px)` のモバイル幅のみ表示し、PCでは出さない。いずれも診断済みのときだけ表示する。
```

同ファイルのレーダー/テーマを説明している箇所の近くに、配色トークンの段落を追加:

```
`/result/[slug]/` と `/ward/[slug]/` は、`wardPalette`（`src/lib/wardPalette.ts`）が髪色由来テーマカラーから導出する配色トークンを `paletteVars` でルート要素のCSSカスタムプロパティ（`--w-bg` / `--w-card` / `--w-accent` / `--w-accent-text` / `--w-accent-dark` / `--w-ink`）として注入し、背景・カード・アクセントを区ごとの色合いにする。CSS側のフォールバック値は従来の絵本トーン（革表紙 #17110c / 羊皮紙 #f7ecd4 / 金 #b8923f / 墨 #4a3418）で、変数を注入しないトップ・図鑑は従来配色のまま変わらない。アクセントのコントラスト（カード地3:1以上・ボタン文字4.5:1以上・暗背景4.5:1以上）はVitestで全23区について保証する。
```

- [ ] **Step 3: 差分の整合を確認してコミット**

Run: `npm test`
Expected: PASS（ドキュメントのみの変更で影響なし）

```bash
git add docs/system-design/03-domain-design.md docs/system-design/05-frontend-rendering-design.md
git commit -m "docs: 結果ページ新IAと区別配色トークンを設計書へ反映

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 8: 最終検証（本番相当ビルド + ブラウザ実機確認）

**Files:** なし（検証のみ。問題があれば該当タスクのファイルを修正してコミット）

- [ ] **Step 1: 全テスト**

Run: `npm test`
Expected: 全件PASS

- [ ] **Step 2: 本番相当ビルド**

Run: `NEXT_PUBLIC_SITE_URL=https://uchinokuchan.pages.dev npm run build`
Expected: ビルド成功、`out/` に全ルート生成

- [ ] **Step 3: プレビューでPC幅の確認**

1. `preview_start` で `.claude/launch.json` の `dev` サーバーを起動する。
2. `/result/shibuya/` へ移動し、`javascript_tool` で診断セッションを注入してリロード:

```js
sessionStorage.setItem('kuchan.diagnosis', JSON.stringify({
  vector: { liveliness: 0.8, maturity: -0.2, greenery: -0.6, family: -0.8, luxury: 0.6 },
  resultCode: '13113', ts: 1,
}));
location.reload();
```

3. `resize_window` で 1280×800 にし、スクリーンショットで確認:
   - 結果カードが約820px幅で、画像上のオーバーレイ（区名＋にてる度%）が読める
   - 下部固定シェアバーが**表示されない**
   - 背景・カード・ボタンが渋谷のピンク系パレットになっている
   - レーダーが1つだけ、アコーディオンが閉じた状態でページが短い

- [ ] **Step 4: モバイル幅の確認**

`resize_window` で 375×812 にし、スクリーンショットで確認:
- 下部固定シェアバーが**表示される**
- 相性ランキングが横スクロールになっている
- オーバーレイの%が読める

- [ ] **Step 5: 淡色・暗色パレットの確認**

同じ手順で `resultCode` と URL を変えて確認する:
- `/result/chiyoda/`（`resultCode: '13101'`、淡色 #cdd3e8）— アクセント文字・ボタンが読めること
- `/result/shinagawa/`（`resultCode: '13109'`、暗色 #48628e）— 同上
- `/ward/shinagawa/`（セッション不要）— 区詳細ページの背景・カード枠が区色になっていること

- [ ] **Step 6: %の単調性の実機確認**

`/result/minato/` で正反対ベクトルを注入し（`vector: { liveliness: -1, maturity: 0, greenery: 0, family: 0, luxury: -1 }, resultCode: '13103'`）、結果カードの%より相性ランキングの%がすべて小さいことを確認する。

- [ ] **Step 7: 受け入れ基準の照合**

設計書「7. 受け入れ基準」の7項目をすべて満たしていることを確認し、満たさない項目があれば該当タスクに戻って修正する。

- [ ] **Step 8: 検証で修正が出た場合はコミット**

```bash
git add -A
git commit -m "fix: 結果ページ再構成の実機検証フィードバックを反映

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```
