# 診断結果画面「結果カード化・シェア強化」実装プラン

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 診断結果画面のファーストビューを「にてる度%・タイプ名・一致軸バッジ」入りの結果カードに再構成し、パーソナライズされたX共有文面と2箇所のシェアCTAで共有率を上げる。

**Architecture:** シェア文面生成をJSXなしの純モジュール `src/ui/share.ts` に切り出し（Xの加重文字数280単位以内をテストで固定）、`ResultPage.tsx` のヒーローを診断済み/未診断で分岐（診断済み=結果カード、未診断=現行OGP画像+診断CTA）。シェアCTAはカード内と画面下部追従バーの2箇所に置き、最下部の既存シェア枠を削除する。

**Tech Stack:** Next.js App Router (static export) / TypeScript / Vitest + Testing Library / プレーンCSS (`app/zukan.css`)

**Spec:** [docs/superpowers/specs/2026-07-17-result-page-share-card-design.md](../specs/2026-07-17-result-page-share-card-design.md)

## Global Constraints

- `output: 'export'` 維持。実行時API・SSR依存を追加しない。
- シェア文面はハッシュタグ `#うちの区ちゃん` と `#都知事杯オープンデータハッカソン` を両方必ず含める。
- Xの加重文字数（全角2単位・URL23単位）で合計280単位以内をテストで保証する。
- 診断ベクトルは `sessionStorage` のみ。シェアURLは `/result/{slug}/`（区slugのみ、個人結果を含めない）。
- UIコピーは日本語、区の表現は中立・前向き。
- 純ロジックは副作用なし・Vitest先行（TDD）。
- 各タスク完了時に `npm test` が全件パスすること。

---

### Task 1: シェア文面の純ロジック（加重文字数 + パーソナライズ文面）

**Files:**
- Create: `src/ui/share.ts`
- Create: `src/ui/share.test.ts`
- Modify: `src/ui/ShareCard.tsx`（`xShareUrl` を削除し share.ts へ移動）
- Modify: `src/ui/ShareCard.test.tsx`（`xShareUrl` のテストを share.test.ts へ移動）
- Modify: `src/ui/pages/ResultPage.tsx:19`（import元の変更のみ）

**Interfaces:**
- Consumes: `wardTheme(code)`（`src/ui/wardTheme.ts`、`.catch` プロパティ）、`Ward` 型（`src/domain/axes`）
- Produces:
  - `xWeightedLength(text: string): number` — Xの加重文字数
  - `interface ShareResult { percent: number; personaName: string }`
  - `xShareText(ward: Ward, result?: ShareResult): string`
  - `xShareUrl(ward: Ward, appUrl: string, result?: ShareResult): string` — Task 3 が `result` 付きで呼ぶ

- [ ] **Step 1: 失敗するテストを書く**

`src/ui/share.test.ts` を新規作成:

```ts
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
```

- [ ] **Step 2: テストが失敗することを確認**

Run: `npx vitest run src/ui/share.test.ts`
Expected: FAIL（`Cannot find module './share'`）

- [ ] **Step 3: 実装を書く**

`src/ui/share.ts` を新規作成:

```ts
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
  return `${body}\n#うちの区ちゃん\n#都知事杯オープンデータハッカソン`;
}

/** X（Twitter）シェアリンク。ユーザー自身のクリックで投稿画面を開くだけ */
export function xShareUrl(ward: Ward, appUrl: string, result?: ShareResult): string {
  const text = xShareText(ward, result);
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(appUrl)}`;
}
```

`src/ui/ShareCard.tsx` から `xShareUrl` 関数（28〜31行目）と、不要になった場合の `wardTheme` の import 使用箇所を整理する（`wardTheme` は9行目のカード表示で使うため import 自体は残る）。削除後の末尾:

```tsx
/** シェア用の1枚カード（区名・系統・レーダー）。PNG書き出しは別プラン、まずはDOM表示。 */
export function ShareCard({ ward }: { ward: Ward }) {
  // …既存のまま変更なし…
}
```

`src/ui/ShareCard.test.tsx` から `xShareUrl` のテスト（16〜24行目の it ブロック）と import 中の `xShareUrl` を削除する。

`src/ui/pages/ResultPage.tsx:19` の import を変更:

```ts
// 変更前
import { xShareUrl } from "../ShareCard";
// 変更後
import { xShareUrl } from "../share";
```

- [ ] **Step 4: テストが通ることを確認**

Run: `npm test`
Expected: 全件PASS（share.test.ts の4件を含む）

- [ ] **Step 5: コミット**

```bash
git add src/ui/share.ts src/ui/share.test.ts src/ui/ShareCard.tsx src/ui/ShareCard.test.tsx src/ui/pages/ResultPage.tsx
git commit -m "feat: X共有文面をにてる度・タイプ名入りへパーソナライズし文字数上限をテストで固定"
```

---

### Task 2: 結果ヒーローカード（診断済みユーザーのファーストビュー）

**Files:**
- Modify: `src/ui/pages/ResultPage.tsx`（ヒーロー部の分岐、70〜104行目付近）
- Modify: `app/zukan.css`（`.result-hero` 群の直後、461行目以降に追記）
- Test: `src/ui/pages/ResultPage.test.tsx`

**Interfaces:**
- Consumes: `ssrImage(slug, 896)`（`src/ui/wardTheme.ts:22`）、`similarityPercent(distance)`（`src/lib/matching.ts:39`）、`personaType` / `selectMatchedAxes`（`src/lib/personaType.ts`）、`AXIS_LABELS`（`src/domain/axes.ts:5`）
- Produces: `percent: number | null` と `heroBadges: AxisKey[]`（コンポーネント内ローカル。Task 3 のシェアCTAが `percent`・`persona` を使う）

- [ ] **Step 1: 失敗するテストを書く**

`src/ui/pages/ResultPage.test.tsx` の owner view テスト（25〜49行目）を新構成に合わせて変更し、カード用テストを追加:

```tsx
  it("shows owner view (ranking + share) with a saved diagnosis", () => {
    saveDiagnosis({ ...emptyVector(), luxury: 1 }, "13103");
    render(<ResultPage slug="minato" />);
    expect(screen.getByText(/相性ランキング/)).toBeInTheDocument();
    // ヒーローはOGP横長画像ではなくキャラ立ち絵カード
    expect(
      screen.getByRole("img", { name: "港区ちゃん" }),
    ).toHaveAttribute("src", "/characters/ssr/minato-w896.webp");
    expect(screen.getByText("キャラクター設定理由")).toBeInTheDocument();
    expect(
      screen.getAllByText(/1を超えるほど自前の税収/).length,
    ).toBeGreaterThan(0);
    expect(screen.getByText("昼夜間人口比率")).toBeInTheDocument();
    const rankLinks = screen.getAllByRole("img", {
      name: /ちゃんの詳細を見る/,
    });
    expect(rankLinks).toHaveLength(3);
    expect(rankLinks[0].closest("a")).toHaveAttribute(
      "href",
      expect.stringMatching(/^\/ward\/.+\/$/),
    );
    expect(
      screen.getByRole("link", { name: "より詳しく見る" }),
    ).toHaveAttribute("href", "/ward/minato/");
  });

  it("shows similarity percent, type name, and match badges in the hero card", () => {
    saveDiagnosis({ ...emptyVector(), luxury: 1 }, "13103");
    render(<ResultPage slug="minato" />);
    const card = screen.getByTestId("result-card");
    expect(card).toHaveTextContent(/にてる度\d+%/);
    expect(card).toHaveTextContent(/華やか志向タイプ/);
    expect(card).toHaveTextContent(/が一致/);
  });

  it("keeps the OGP hero and diagnosis CTA for visitors", () => {
    render(<ResultPage slug="minato" />);
    expect(screen.queryByTestId("result-card")).not.toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "港区ちゃんの診断結果シェア画像" }),
    ).toHaveAttribute("src", "/og/minato.jpg");
    expect(screen.getByText(/あなたも診断する/)).toBeInTheDocument();
  });
```

（既存 owner view テストの `港区ちゃんの診断結果シェア画像` 断言は visitor 側テストへ移す。`で結果をシェアする` の断言は Task 3 で扱うため一旦削除。）

- [ ] **Step 2: テストが失敗することを確認**

Run: `npx vitest run src/ui/pages/ResultPage.test.tsx`
Expected: FAIL（`result-card` testid が存在しない / 画像alt不一致）

- [ ] **Step 3: ResultPage のヒーローを分岐実装**

`src/ui/pages/ResultPage.tsx` に追加・変更する。

import に `ssrImage` と `AXIS_LABELS`（既存）を利用（`wardTheme` の import 行を変更）:

```ts
import { ssrImage, wardTheme } from "../wardTheme";
```

導出値を追加（`trackPos` 定義の手前）:

```ts
// 自区（ランキング先頭）との距離から にてる度% を出す
const percent = ranked ? similarityPercent(ranked[0].distance) : null;
// バッジは選定軸のうち実差が小さい軸だけ（WHY WE MATCHの一致判定と同じ0.5閾値）
const heroBadges =
  userVector && matchedAxes
    ? matchedAxes.filter((k) => Math.abs(userVector[k] - ward.axes[k]) <= 0.5)
    : [];
```

ヒーロー部（現行80〜104行目の `.result-hero` div と `!userVector` ブロック）を次に置き換える:

```tsx
{userVector && percent !== null ? (
  <div
    className="result-card"
    data-testid="result-card"
    style={{ ["--ward-color" as string]: theme.color }}
  >
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img
      className="result-card-image"
      src={ssrImage(slug, 896)}
      alt={`${ward.name}ちゃん`}
      width={896}
      height={1344}
    />
    <p className="result-card-name">{ward.name}ちゃん</p>
    <p className="result-card-percent">
      <span>にてる度</span>
      <strong>{percent}%</strong>
    </p>
    {persona && (
      <p className="result-card-type">タイプは「{persona.name}」</p>
    )}
    {heroBadges.length > 0 && (
      <ul className="result-card-badges">
        {heroBadges.map((k) => (
          <li key={k}>{AXIS_LABELS[k].name}が一致</li>
        ))}
      </ul>
    )}
  </div>
) : (
  <>
    <div
      className="result-hero"
      style={{ ["--ward-color" as string]: theme.color }}
    >
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
```

- [ ] **Step 4: カードのCSSを追加**

`app/zukan.css` の `.result-character-line` ブロック（466行目）の直後に追記:

```css
.result-card {
  --ward-color: #b8923f;
  width: min(420px, 100%);
  margin: 26px auto 0;
  padding: clamp(18px, 5vw, 26px);
  border: 3px solid var(--ward-color);
  border-radius: 18px;
  background: linear-gradient(180deg, #f7ecd4 0%, #eeddb8 100%);
  color: #4a3418;
  text-align: center;
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.42);
}

.result-card-image {
  display: block;
  width: min(240px, 62%);
  height: auto;
  margin: 0 auto;
  filter: drop-shadow(0 10px 24px rgba(0, 0, 0, 0.25));
}

.result-card-name {
  margin-top: 10px;
  font-size: clamp(22px, 6vw, 28px);
  font-weight: 700;
  letter-spacing: 0.08em;
}

.result-card-percent {
  margin-top: 4px;
  line-height: 1.1;
}

.result-card-percent span {
  display: block;
  font-size: 12px;
  letter-spacing: 0.24em;
  color: #8a6c3c;
}

.result-card-percent strong {
  font-size: clamp(44px, 13vw, 60px);
  font-weight: 800;
  color: var(--ward-color);
}

.result-card-type {
  margin-top: 8px;
  font-size: clamp(15px, 4vw, 18px);
  font-weight: 700;
  letter-spacing: 0.06em;
}

.result-card-badges {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-top: 12px;
  padding: 0;
  list-style: none;
}

.result-card-badges li {
  padding: 5px 12px;
  border: 1.5px solid var(--ward-color);
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  color: #4a3418;
  background: rgba(255, 255, 255, 0.55);
}
```

- [ ] **Step 5: テストが通ることを確認**

Run: `npm test`
Expected: 全件PASS

- [ ] **Step 6: コミット**

```bash
git add src/ui/pages/ResultPage.tsx src/ui/pages/ResultPage.test.tsx app/zukan.css
git commit -m "feat: 診断済みユーザーのヒーローを にてる度・タイプ名入り結果カードへ再構成"
```

---

### Task 3: シェアCTAの2箇所配置（カード直下 + 追従バー、最下部枠の削除）

**Files:**
- Modify: `src/ui/pages/ResultPage.tsx`
- Modify: `app/zukan.css`
- Test: `src/ui/pages/ResultPage.test.tsx`

**Interfaces:**
- Consumes: `xShareUrl(ward, shareUrl, { percent, personaName })`（Task 1）、`percent`・`persona`（Task 2）
- Produces: なし（UIのみ）

- [ ] **Step 1: 失敗するテストを書く**

`src/ui/pages/ResultPage.test.tsx` に追加し、既存断言を更新:

```tsx
  it("shows share CTA twice (card + sticky bar) with personalized text for owners", () => {
    saveDiagnosis({ ...emptyVector(), luxury: 1 }, "13103");
    render(<ResultPage slug="minato" />);
    const shareLinks = screen.getAllByRole("link", {
      name: /で結果をシェアする/,
    });
    expect(shareLinks).toHaveLength(2);
    for (const link of shareLinks) {
      const url = new URL(link.getAttribute("href")!);
      const text = url.searchParams.get("text")!;
      expect(text).toContain("にてる度");
      expect(text).toContain("タイプは「華やか志向タイプ」");
      expect(text).toContain("#うちの区ちゃん");
      expect(text).toContain("#都知事杯オープンデータハッカソン");
    }
  });

  it("hides share CTA for visitors", () => {
    render(<ResultPage slug="minato" />);
    expect(
      screen.queryByRole("link", { name: /で結果をシェアする/ }),
    ).not.toBeInTheDocument();
  });
```

- [ ] **Step 2: テストが失敗することを確認**

Run: `npx vitest run src/ui/pages/ResultPage.test.tsx`
Expected: FAIL（シェアリンクが1件、パーソナライズ文面でない）

- [ ] **Step 3: 実装**

`src/ui/pages/ResultPage.tsx` を変更する。

シェアURLを1回だけ組み立てる（`heroBadges` 定義の直後）:

```ts
const shareHref =
  percent !== null && persona
    ? xShareUrl(ward, shareUrl, { percent, personaName: persona.name })
    : xShareUrl(ward, shareUrl);
```

(1) Task 2 の結果カード末尾（`result-card-badges` の後）にシェアボタンを追加:

```tsx
    <a
      className="result-x-share result-card-share"
      href={shareHref}
      target="_blank"
      rel="noopener noreferrer"
    >
      <span aria-hidden="true">𝕏</span> で結果をシェアする
    </a>
```

(2) ページ最下部の既存シェア枠（現行279〜291行目の `userVector && <div className="result-primary-action">…result-x-share…</div>`）を削除する。

(3) `</main>` 閉じタグ直前（相性ランキングの後）に追従バーを追加:

```tsx
{userVector && (
  <div className="result-share-bar">
    <a
      className="result-x-share result-share-bar-button"
      href={shareHref}
      target="_blank"
      rel="noopener noreferrer"
    >
      <span aria-hidden="true">𝕏</span> で結果をシェアする
    </a>
  </div>
)}
```

(4) 追従バーがコンテンツ最下部と重ならないよう、`<main>` のクラスを条件分岐:

```tsx
<main
  className={userVector ? "book-section has-share-bar" : "book-section"}
  style={{ minHeight: "100vh" }}
>
```

- [ ] **Step 4: CSSを追加**

`app/zukan.css` の `.result-x-share:focus-visible` ブロック（510行目付近）の直後に追記:

```css
.result-card-share {
  margin-top: 16px;
  min-width: 0;
  width: 100%;
}

.result-share-bar {
  position: fixed;
  inset: auto 0 0 0;
  display: flex;
  justify-content: center;
  padding: 10px 16px calc(10px + env(safe-area-inset-bottom));
  background: rgba(5, 5, 5, 0.72);
  backdrop-filter: blur(8px);
  z-index: 40;
}

.result-share-bar-button {
  min-width: min(340px, 100%);
  padding: 12px 24px;
  box-shadow: none;
  border-color: rgba(255, 255, 255, 0.35);
}

.has-share-bar {
  padding-bottom: 110px;
}
```

- [ ] **Step 5: テストが通ることを確認**

Run: `npm test`
Expected: 全件PASS

- [ ] **Step 6: コミット**

```bash
git add src/ui/pages/ResultPage.tsx src/ui/pages/ResultPage.test.tsx app/zukan.css
git commit -m "feat: シェアCTAを結果カード直下と下部追従バーの2箇所へ配置"
```

---

### Task 4: YOUR TYPEセクション整理・設計書更新・本番相当ビルド検証

**Files:**
- Modify: `src/ui/pages/ResultPage.tsx`（YOUR TYPE セクション、現行106〜131行目）
- Modify: `docs/system-design/05-frontend-rendering-design.md`
- Test: `src/ui/pages/ResultPage.test.tsx`

**Interfaces:**
- Consumes: `persona.description`（`src/lib/personaType.ts`）
- Produces: なし

- [ ] **Step 1: 失敗するテストを書く**

`src/ui/pages/ResultPage.test.tsx` の persona テスト（50〜68行目）の①断言を変更する。タイプ名は結果カード側に出るので、YOUR TYPE セクションには説明文が出ることを確認する:

```tsx
    // ① タイプ名は結果カードに、説明文はYOUR TYPEセクションに出る
    expect(screen.getByTestId("result-card")).toHaveTextContent(
      /華やか志向タイプ/,
    );
    expect(
      screen.getByText(/良いものや華やかさに心が動く/),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/あなたと港区ちゃんの重なり/),
    ).toBeInTheDocument();
```

- [ ] **Step 2: テストが失敗することを確認**

Run: `npx vitest run src/ui/pages/ResultPage.test.tsx`
Expected: FAIL（「あなたと港区ちゃんの重なり」が存在しない）

- [ ] **Step 3: YOUR TYPE セクションの見出しを変更**

`src/ui/pages/ResultPage.tsx` の YOUR TYPE セクションの h2 のみ変更（タイプ名の重複表示を解消し、レーダー重ね描画の意味を見出しにする）:

```tsx
// 変更前
<h2>あなたは「{persona.name}」</h2>
// 変更後
<h2>あなたと{ward.name}ちゃんの重なり</h2>
```

説明文・レーダー・凡例は現行のまま。

- [ ] **Step 4: テストが通ることを確認**

Run: `npm test`
Expected: 全件PASS

- [ ] **Step 5: レンダリング設計書を更新**

`docs/system-design/05-frontend-rendering-design.md` の結果ページ（ResultPage）の記述を読み、次の内容を既存の書式に合わせて反映する:

- 診断済みユーザーのヒーローは「結果カード」（キャラ896px立ち絵・にてる度%・タイプ名・一致軸バッジ最大2個、テーマカラー縁取り）。未診断閲覧者は従来どおりOGP画像+「あなたも診断する」CTA。
- にてる度%は `similarityPercent(ranked[0].distance)`、バッジは `selectMatchedAxes` の選定軸のうち実差0.5以内の軸のみ。
- シェアCTAは結果カード直下と画面下部追従バー（`position: fixed`、診断済みのみ）の2箇所。最下部の旧シェア枠は廃止。
- X共有文面は `src/ui/share.ts` で生成。診断済みは「診断したら{区名}ちゃんと にてる度{XX}% だった！タイプは「{タイプ名}」らしい」+ ハッシュタグ2つ、未診断文面は従来型。加重文字数280単位以内をVitestで保証。
- YOUR TYPE セクションの見出しは「あなたと{区名}ちゃんの重なり」（タイプ名表示は結果カードへ移動）。

- [ ] **Step 6: 本番相当ビルドで検証**

```bash
npm test
NEXT_PUBLIC_SITE_URL=https://uchinokuchan.pages.dev npm run build
```

Expected: テスト全件PASS、ビルド成功（`out/` 生成）。

- [ ] **Step 7: コミット**

```bash
git add src/ui/pages/ResultPage.tsx src/ui/pages/ResultPage.test.tsx docs/system-design/05-frontend-rendering-design.md
git commit -m "feat: YOUR TYPEセクションを重なり表示へ整理しレンダリング設計書を更新"
```
