# 箔押しミニヘッダー Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 結果ページと区詳細ページに、下スクロールで隠れ上スクロールで現れる絵本トーンの固定ミニヘッダー（TOP・診断・図鑑への導線）を追加する。

**Architecture:** 表示判定は純ロジック `src/lib/bookHeader.ts`（`{anchorY, visible}` のreducer）に切り出してVitest先行で実装し、`src/ui/BookHeader.tsx` がpassiveスクロール＋rAFスロットルでそれを適用する。スタイルは `app/zukan.css` に追記。ResultPage/WardPageの `main` 先頭にマウントし、WardPageの旧「← 図鑑にもどる」は削除する。

**Tech Stack:** Next.js App Router（静的エクスポート）/ TypeScript / Vitest + Testing Library / 素のCSS（`app/zukan.css`）

**Spec:** `docs/superpowers/specs/2026-07-20-book-nav-design.md`

## Global Constraints

- `next.config.ts` の `output: 'export'` を壊さない（実行時API・SSR依存を追加しない）。
- 純ロジックは副作用のないTSモジュールとし、Vitestを先に書く（AGENTS.md）。
- UIコピーは日本語。ヘッダー文言は「❦ うちの区ちゃん」「診断」「図鑑」、aria-labelは「トップページにもどる」「サイトナビゲーション」。
- 色は区色（`--ward-color`）非連動。革 `rgba(23, 17, 12, 0.92)`・金罫 `rgba(202, 162, 79, 0.55)`・金文字 `#e8c56b` / `#caa24f`・hover/focus `#f0d693`。
- `z-index: 30`（追従シェアバー40・モーダル50・初回ロード1000より下）。
- 高さ48px、640px以下は44px。TOP（`/`）とWardModalには置かない。
- `prefers-reduced-motion: reduce` ではtransitionなしの即時切替。
- 作業は `main` から切ったブランチ `feature/book-header` で行う（実行開始時に `git switch -c feature/book-header`）。
- コミット末尾に `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>` を付ける。

---

### Task 1: 表示判定の純ロジック `nextHeaderState`

**Files:**
- Create: `src/lib/bookHeader.ts`
- Create: `src/lib/bookHeader.test.ts`
- Modify: `docs/superpowers/specs/2026-07-20-book-nav-design.md`（関数署名とAppテスト方針の2行を実装に合わせて更新）

**Interfaces:**
- Consumes: なし
- Produces: `HeaderScrollState = { anchorY: number; visible: boolean }`、`nextHeaderState(state: HeaderScrollState, y: number): HeaderScrollState`、定数 `HEADER_TOP_ZONE = 120`・`HEADER_HYSTERESIS = 8`（Task 2 が使用）

- [ ] **Step 1: 失敗するテストを書く**

`src/lib/bookHeader.test.ts` を新規作成:

```ts
import { describe, it, expect } from 'vitest';
import { nextHeaderState, HEADER_TOP_ZONE, HEADER_HYSTERESIS } from './bookHeader';

describe('bookHeader', () => {
  it('上端付近（TOP_ZONE以下）では方向によらず表示する', () => {
    expect(nextHeaderState({ anchorY: 100, visible: true }, 60).visible).toBe(true);
    // 非表示状態で上端に戻ったら表示に復帰する
    expect(nextHeaderState({ anchorY: 400, visible: false }, HEADER_TOP_ZONE).visible).toBe(true);
  });
  it('上端より下では下スクロールで隠す', () => {
    expect(nextHeaderState({ anchorY: 300, visible: true }, 340)).toEqual({ anchorY: 340, visible: false });
  });
  it('上端より下でも上スクロールで表示する', () => {
    expect(nextHeaderState({ anchorY: 800, visible: false }, 760)).toEqual({ anchorY: 760, visible: true });
  });
  it('ヒステリシス未満の微小移動では状態もアンカーも変えない', () => {
    const prev = { anchorY: 500, visible: false };
    expect(nextHeaderState(prev, 500 + HEADER_HYSTERESIS - 1)).toBe(prev);
    const shown = { anchorY: 500, visible: true };
    expect(nextHeaderState(shown, 500 - (HEADER_HYSTERESIS - 1))).toBe(shown);
  });
  it('微小移動の累積はアンカー据え置きにより閾値到達で反映される', () => {
    // 505→510→512と少しずつ下へ: アンカー500のまま、512で|delta|=12>=8となり隠す
    let s = { anchorY: 500, visible: true };
    s = nextHeaderState(s, 505);
    s = nextHeaderState(s, 512);
    expect(s).toEqual({ anchorY: 512, visible: false });
  });
});
```

- [ ] **Step 2: テストが失敗することを確認**

Run: `npx vitest run src/lib/bookHeader.test.ts`
Expected: FAIL（`Cannot find module './bookHeader'` などモジュール未定義エラー）

- [ ] **Step 3: 最小実装を書く**

`src/lib/bookHeader.ts` を新規作成:

```ts
/** ページ上端からこの高さ(px)までは常にヘッダーを表示する */
export const HEADER_TOP_ZONE = 120;
/** 直前の判定位置からこの距離(px)未満のスクロールでは表示状態を変えない */
export const HEADER_HYSTERESIS = 8;

export type HeaderScrollState = { anchorY: number; visible: boolean };

/**
 * スクロール位置yからヘッダー表示を決めるreducer。
 * anchorYは「最後に判定した位置」で、微小移動では据え置いて累積を測る。
 */
export function nextHeaderState(state: HeaderScrollState, y: number): HeaderScrollState {
  if (y <= HEADER_TOP_ZONE) return { anchorY: y, visible: true };
  const delta = y - state.anchorY;
  if (Math.abs(delta) < HEADER_HYSTERESIS) return state;
  return { anchorY: y, visible: delta < 0 };
}
```

- [ ] **Step 4: テストが通ることを確認**

Run: `npx vitest run src/lib/bookHeader.test.ts`
Expected: PASS（5件）

- [ ] **Step 5: スペックの2行を実装に合わせて更新**

`docs/superpowers/specs/2026-07-20-book-nav-design.md` を編集:

1. 「判定は純ロジック `src/lib/bookHeader.ts` の `headerVisibility(prevY, currentY, visible): boolean` として切り出し、」を「判定は純ロジック `src/lib/bookHeader.ts` の `nextHeaderState(state: {anchorY, visible}, y)` reducerとして切り出し、」へ置換。
2. テスト節の「App（TOP）: ヘッダーが出ないこと」を「App（TOP）にヘッダーを置かないことは配置箇所（ResultPage/WardPageのみ）とブラウザ目視で担保（HeroがR3F依存でjsdomレンダリング不可のため自動テストは作らない）」へ置換。あわせて同節の `headerVisibility` の記述を `nextHeaderState` に合わせる。

- [ ] **Step 6: コミット**

```bash
git add src/lib/bookHeader.ts src/lib/bookHeader.test.ts docs/superpowers/specs/2026-07-20-book-nav-design.md
git commit -m "feat: ヘッダー表示判定の純ロジックnextHeaderStateを追加"
```

---

### Task 2: BookHeaderコンポーネント＋CSS＋ResultPage組み込み

**Files:**
- Create: `src/ui/BookHeader.tsx`
- Modify: `app/zukan.css`（末尾にヘッダースタイルを追記）
- Modify: `src/ui/pages/ResultPage.tsx`（import追加＋`main`先頭にマウント）
- Test: `src/ui/pages/ResultPage.test.tsx`

**Interfaces:**
- Consumes: Task 1 の `nextHeaderState` / `HeaderScrollState`
- Produces: `BookHeader(): JSX.Element`（props無し。`src/ui/BookHeader.tsx` から named export。Task 3 が使用）

- [ ] **Step 1: 失敗するテストを書く**

`src/ui/pages/ResultPage.test.tsx` の `describe` 内末尾に追加（`within` はimport済み）:

```tsx
it("shows the book header nav with top/diagnosis/zukan links", () => {
  render(<ResultPage slug="minato" />);
  const nav = screen.getByRole("navigation", { name: "サイトナビゲーション" });
  expect(
    within(nav).getByRole("link", { name: "トップページにもどる" }),
  ).toHaveAttribute("href", "/");
  expect(within(nav).getByRole("link", { name: "診断" })).toHaveAttribute(
    "href",
    "/#diagnosis",
  );
  expect(within(nav).getByRole("link", { name: "図鑑" })).toHaveAttribute(
    "href",
    "/#zukan",
  );
});
```

- [ ] **Step 2: テストが失敗することを確認**

Run: `npx vitest run src/ui/pages/ResultPage.test.tsx`
Expected: 追加した1件がFAIL（`Unable to find an accessible element with the role "navigation"`）、既存はPASS

- [ ] **Step 3: BookHeaderコンポーネントを実装**

`src/ui/BookHeader.tsx` を新規作成:

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { nextHeaderState, type HeaderScrollState } from "../lib/bookHeader";

/** サブページ共通の箔押しミニヘッダー。下スクロールで隠れ、上スクロールで現れる */
export function BookHeader() {
  const [visible, setVisible] = useState(true);
  const stateRef = useRef<HeaderScrollState>({ anchorY: 0, visible: true });
  const ticking = useRef(false);

  useEffect(() => {
    stateRef.current = { anchorY: window.scrollY, visible: true };
    const apply = () => {
      ticking.current = false;
      const next = nextHeaderState(stateRef.current, window.scrollY);
      if (next.visible !== stateRef.current.visible) setVisible(next.visible);
      stateRef.current = next;
    };
    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(apply);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={visible ? "book-header" : "book-header is-hidden"}>
      <nav className="book-header-nav" aria-label="サイトナビゲーション">
        <Link
          className="book-header-title"
          href="/"
          aria-label="トップページにもどる"
        >
          <span aria-hidden="true">❦</span> うちの区ちゃん
        </Link>
        <div className="book-header-links">
          <Link href="/#diagnosis">診断</Link>
          <Link href="/#zukan">図鑑</Link>
        </div>
      </nav>
    </header>
  );
}
```

- [ ] **Step 4: CSSを追記**

`app/zukan.css` の末尾に追加:

```css
/* ---- 箔押しミニヘッダー（サブページ共通・区色非連動） ---- */

.book-header {
  position: fixed;
  inset: 0 0 auto 0;
  z-index: 30;
  background: rgba(23, 17, 12, 0.92);
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid rgba(202, 162, 79, 0.55);
  transform: translateY(0);
  transition: transform 0.25s ease;
}

.book-header.is-hidden {
  transform: translateY(-100%);
}

/* キーボードでリンクへ到達したら隠れていても出す */
.book-header:focus-within {
  transform: translateY(0);
}

.book-header-nav {
  max-width: 1080px;
  margin: 0 auto;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.book-header-title {
  color: #e8c56b;
  text-decoration: none;
  font-size: 13px;
  letter-spacing: 0.28em;
  padding: 14px 4px;
  white-space: nowrap;
}

.book-header-links {
  display: flex;
  gap: 18px;
}

.book-header-links a {
  color: #caa24f;
  text-decoration: none;
  font-size: 12px;
  letter-spacing: 0.18em;
  padding: 15px 4px;
  white-space: nowrap;
}

.book-header-title:hover,
.book-header-title:focus-visible,
.book-header-links a:hover,
.book-header-links a:focus-visible {
  color: #f0d693;
}

.book-header a:focus-visible {
  outline: 2px solid #e8c56b;
  outline-offset: 2px;
}

@media (max-width: 640px) {
  .book-header-nav {
    height: 44px;
    padding: 0 16px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .book-header {
    transition: none;
  }
}
```

- [ ] **Step 5: ResultPageへマウント**

`src/ui/pages/ResultPage.tsx` を編集。import節（`import { Radar } from "../Radar";` の直前）に追加:

```tsx
import { BookHeader } from "../BookHeader";
```

`return (` 直後の `<main ...>` 開きタグの次の行、`<div className="book-section-inner">` の直前に追加:

```tsx
      <BookHeader />
```

- [ ] **Step 6: テストが通ることを確認**

Run: `npx vitest run src/ui/pages/ResultPage.test.tsx`
Expected: 全件PASS

- [ ] **Step 7: コミット**

```bash
git add src/ui/BookHeader.tsx app/zukan.css src/ui/pages/ResultPage.tsx src/ui/pages/ResultPage.test.tsx
git commit -m "feat: 箔押しミニヘッダーを実装し結果ページへ配置"
```

---

### Task 3: WardPage組み込みと「← 図鑑にもどる」削除

**Files:**
- Modify: `src/ui/pages/WardPage.tsx`（ヘッダーマウント＋旧backリンク削除）
- Modify: `app/zukan.css`（`.ward-page-back` スタイル削除）
- Test: `src/ui/pages/WardPage.test.tsx`

**Interfaces:**
- Consumes: Task 2 の `BookHeader`（`src/ui/BookHeader.tsx` named export、props無し）
- Produces: なし（最終ページ組み込み）

- [ ] **Step 1: 失敗するテストを書く**

`src/ui/pages/WardPage.test.tsx` のimportを更新:

```tsx
import { render, screen, within } from '@testing-library/react';
```

`describe` 内末尾にテストを追加:

```tsx
it('shows the book header nav and drops the old zukan back link', () => {
  render(<WardPage slug="minato" />);
  const nav = screen.getByRole('navigation', { name: 'サイトナビゲーション' });
  expect(within(nav).getByRole('link', { name: 'トップページにもどる' })).toHaveAttribute('href', '/');
  expect(within(nav).getByRole('link', { name: '診断' })).toHaveAttribute('href', '/#diagnosis');
  expect(within(nav).getByRole('link', { name: '図鑑' })).toHaveAttribute('href', '/#zukan');
  expect(screen.queryByText('← 図鑑にもどる')).not.toBeInTheDocument();
});
```

- [ ] **Step 2: テストが失敗することを確認**

Run: `npx vitest run src/ui/pages/WardPage.test.tsx`
Expected: 追加した1件がFAIL（navが見つからない）、既存はPASS

- [ ] **Step 3: WardPageを編集**

`src/ui/pages/WardPage.tsx` のimport節（`import { Radar } from '../Radar';` の直前）に追加:

```tsx
import { BookHeader } from '../BookHeader';
```

次の行を削除:

```tsx
        <Link className="ward-page-back" href="/#zukan">← 図鑑にもどる</Link>
```

`<main ...>` 開きタグの次の行、`<div className="book-section-inner">` の直前に追加:

```tsx
      <BookHeader />
```

注意: 削除後も `fellow-card` で `Link` を使うため、`import Link from 'next/link';` は残す。

- [ ] **Step 4: `.ward-page-back` スタイルを削除**

`app/zukan.css` から次の1行を削除:

```css
.ward-page-back { display: inline-block; color: var(--w-accent-dark, #b8923f); text-decoration: none; letter-spacing: 0.14em; font-size: 13px; margin-bottom: 20px; }
```

- [ ] **Step 5: テストが通ることを確認**

Run: `npx vitest run src/ui/pages/WardPage.test.tsx`
Expected: 全件PASS

- [ ] **Step 6: 全テストを実行**

Run: `npm test`
Expected: 全件PASS（既存234件＋今回追加分。`ward-page-back` を参照する他テストが失敗したら、その参照を削除して再実行）

- [ ] **Step 7: コミット**

```bash
git add src/ui/pages/WardPage.tsx src/ui/pages/WardPage.test.tsx app/zukan.css
git commit -m "feat: 区詳細ページへヘッダーを配置し旧「図鑑にもどる」リンクを削除"
```

---

### Task 4: 設計書更新と最終検証

**Files:**
- Modify: `docs/system-design/05-frontend-rendering-design.md`（§9の後に§10を追記）

**Interfaces:**
- Consumes: Task 1〜3 の成果一式
- Produces: なし（ドキュメントと検証）

- [ ] **Step 1: 設計書に§10を追記**

`docs/system-design/05-frontend-rendering-design.md` の末尾（§9の後）に追加:

```markdown
## 10. 共通ナビゲーション（箔押しミニヘッダー）

- `/result/[slug]/` と `/ward/[slug]/` の `main` 先頭に `src/ui/BookHeader.tsx` を配置する。TOP（`/`）とWardModalには置かない。
- 全幅fixed・高さ48px（640px以下44px）・革トーン `rgba(23,17,12,0.92)`＋blur・金の細罫。左ロゴ「❦ うちの区ちゃん」→ `/`、右「診断」→ `/#diagnosis`・「図鑑」→ `/#zukan`。区色（`--ward-color`）には連動させない。
- 表示判定は純ロジック `src/lib/bookHeader.ts` の `nextHeaderState`（上端120px以下は常時表示、アンカーから8px以上の下スクロールで非表示・上スクロールで表示）。スクロール監視はpassive＋rAFスロットル。
- 出入りは `transform` 0.25s。`prefers-reduced-motion: reduce` ではtransitionなしの即時切替。`:focus-within` で隠れていても強制表示（キーボード到達性）。`z-index: 30`（追従シェアバー40・モーダル50より下）。
- 区詳細の旧「← 図鑑にもどる」リンクはヘッダーの「図鑑」に統合して削除した。
```

- [ ] **Step 2: 本番相当ビルド**

Run: `NEXT_PUBLIC_SITE_URL=https://uchinokuchan.pages.dev npm run build`
Expected: 52ページの静的生成が成功（エラー・型エラーなし）

- [ ] **Step 3: ブラウザ目視検証**

devサーバー（`.claude/launch.json` の `dev`、ポート3000）で確認:

1. `/result/minato/` を開く → ヘッダーが最初から見える。ロゴ・診断・図鑑のリンクがTOP `/`・`/#diagnosis`・`/#zukan` へ効く
2. 下へスクロール → ヘッダーが上へ滑って消える。少し上へ戻す → 現れる。最上部へ戻る → 表示のまま
3. `/ward/minato/` でも同様＋「← 図鑑にもどる」が無いこと
4. モバイル幅375px → 高さ44px・折返しなし。結果ページ下部の追従シェアバーと重ならない
5. Tabキー連打 → 隠れた状態でもヘッダーへフォーカスが入ると出現し、金のfocusリングが見える
6. ❦ が明朝フォントで正しく描画される（tofuなら `SectionIcon` 方式のSVGへ差し替えて再検証）

注意（過去の教訓）: ブラウザペインのタブが `document.visibilityState === 'hidden'` だとスクショが黒画面になり rAF が止まる。スクロール挙動はDOMの `classList`（`is-hidden` の付け外し）でも検証できる。

- [ ] **Step 4: コミット**

```bash
git add docs/system-design/05-frontend-rendering-design.md
git commit -m "docs: 共通ナビゲーション（箔押しミニヘッダー）を設計書へ反映"
```

- [ ] **Step 5: mainへのマージ**

superpowers:finishing-a-development-branch スキルに従い、テスト全通過を確認のうえ `feature/book-header` の統合方法（マージ/PR）をユーザーに確認する。
