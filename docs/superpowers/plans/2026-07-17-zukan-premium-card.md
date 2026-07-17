# 図鑑一覧プレミアムカード化 実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** トップページの図鑑一覧カードを、系統ラベルを廃止した「区テーマカラー縁取り＋フルブリード立ち絵＋金文字区名」のプレミアムカードに刷新する。

**Architecture:** 変更は `src/ui/Zukan.tsx`（カードDOM組み替え＋タッチ環境用シャイン発火のIntersectionObserver）と `app/zukan.css`（カードスタイル刷新）の2ファイルに閉じる。データ・モーダル・採番ロジックは変更しない。仕様の正典は [docs/superpowers/specs/2026-07-17-zukan-premium-card-design.md](../specs/2026-07-17-zukan-premium-card-design.md)。

**Tech Stack:** Next.js (App Router, `output: 'export'`) / React / TypeScript / Vitest + jsdom + @testing-library/react / 素のCSS（`app/zukan.css`）

## Global Constraints

- `output: 'export'` の静的エクスポートを壊さない（実行時API・SSR依存を追加しない）
- タップでモーダルを開く挙動・`aria-label={`${w.name}の詳細を見る`}`・キーボード操作を維持
- `zukanNo()`（JIS区コード順のNo.採番）は変更しない
- 画像の `loading="lazy"` と `is-loaded` フェードイン（Chromiumのlazy画像スキップ回避コメント含む）を維持
- `src/data/wards.ts` の `group` 生成は削除しない（結果画面・シェアカードで使用中）。図鑑カード上の表示だけ外す
- `prefers-reduced-motion: reduce` で浮き上がり・シャイン・スライドインを全て無効化
- 新規画像アセットは作らない（全23区の512px WebPが `public/characters/ssr/` に存在）
- UIコピーは日本語。テスト追加はVitest先行（TDD）

## File Structure

- Modify: `src/ui/Zukan.tsx` — カードDOM組み替え（系統span削除、シャイン要素・ネームプレート追加）、タッチ環境用IntersectionObserver
- Modify: `app/zukan.css` — `.zukan-card` 系スタイルの刷新（43〜148行の図鑑グリッド節、1351〜1357行のreduced-motion節）
- Create: `src/ui/Zukan.test.tsx` — カードDOMとObserver挙動のテスト

---

### Task 1: カードDOMの組み替え（系統削除・プレート/シャイン要素追加）

**Files:**
- Create: `src/ui/Zukan.test.tsx`
- Modify: `src/ui/Zukan.tsx`

**Interfaces:**
- Consumes: `loadWards()`（`src/data/wards.ts`）、`wardTheme(code)` / `ssrImage(slug)`（`src/ui/wardTheme.ts`。`wardTheme` は `{ slug, color, catch }` を返す）
- Produces: カードDOM構造。Task 2のObserverは `.zukan-grid` 直下の `.zukan-card` に `is-shine` クラスを付ける前提。Task 3のCSSは以下のクラス名に依存する: `zukan-card` `zukan-card-no` `zukan-card-img` `zukan-card-placeholder` `zukan-card-shine` `zukan-card-plate` `zukan-card-name` `zukan-card-catch`

- [ ] **Step 1: 失敗するテストを書く**

`src/ui/Zukan.test.tsx` を新規作成:

```tsx
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Zukan, zukanNo } from './Zukan';

describe('zukanNo', () => {
  it('JIS区コード順で2桁ゼロ埋めのNo.を返す', () => {
    expect(zukanNo(0)).toBe('No.01');
    expect(zukanNo(22)).toBe('No.23');
  });
});

describe('Zukan', () => {
  it('23区分のカードを描画する', () => {
    render(<Zukan onSelect={() => {}} />);
    expect(screen.getAllByRole('button')).toHaveLength(23);
    expect(screen.getByRole('button', { name: '千代田区の詳細を見る' })).toBeInTheDocument();
  });

  it('系統ラベルを表示しない', () => {
    const { container } = render(<Zukan onSelect={() => {}} />);
    expect(screen.queryByText(/^系統/)).not.toBeInTheDocument();
    expect(container.querySelector('.zukan-card-group')).toBeNull();
  });

  it('ネームプレートに区名とキャッチコピーを持つ', () => {
    const { container } = render(<Zukan onSelect={() => {}} />);
    const card = screen.getByRole('button', { name: '千代田区の詳細を見る' });
    expect(card.querySelector('.zukan-card-plate .zukan-card-name')).toHaveTextContent('千代田区');
    // キャッチコピーはホバー環境でCSS表示する前提でDOMには常に置く
    expect(card.querySelector('.zukan-card-catch')).toHaveTextContent(
      '昼だけ人口20倍、夜は静寂を愛す二面性エリート'
    );
    // シャイン用の装飾要素（全カード分）
    expect(container.querySelectorAll('.zukan-card-shine')).toHaveLength(23);
  });

  it('カードに区テーマカラーのCSS変数を設定する', () => {
    render(<Zukan onSelect={() => {}} />);
    const minato = screen.getByRole('button', { name: '港区の詳細を見る' });
    expect(minato.getAttribute('style')).toContain('--ward-color: #e8c56b');
  });

  it('クリックで対象の区をonSelectへ渡す', () => {
    const onSelect = vi.fn();
    render(<Zukan onSelect={onSelect} />);
    screen.getByRole('button', { name: '新宿区の詳細を見る' }).click();
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls[0][0].name).toBe('新宿区');
  });
});
```

- [ ] **Step 2: テストが失敗することを確認**

Run: `npx vitest run src/ui/Zukan.test.tsx`
Expected: FAIL — 「系統ラベルを表示しない」（`.zukan-card-group` が存在）と「ネームプレートに…」（`.zukan-card-plate` が無い）が落ちる。23枚描画・onSelect・CSS変数のテストは現行実装でも通ってよい

- [ ] **Step 3: Zukan.tsx のカードDOMを組み替える**

`src/ui/Zukan.tsx` の `return` 内カード部分を以下へ変更（`zukanNo` と冒頭は変更なし）:

```tsx
export function Zukan({ onSelect }: { onSelect: (w: Ward) => void }) {
  return (
    <div className="zukan-grid">
      {WARDS.map((w, i) => {
        const theme = wardTheme(w.code);
        return (
          <button
            key={w.code}
            className="zukan-card"
            style={{ ['--ward-color' as string]: theme.color }}
            onClick={() => onSelect(w)}
            aria-label={`${w.name}の詳細を見る`}
          >
            <span className="zukan-card-no">{zukanNo(i)}</span>
            {theme.slug ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className="zukan-card-img"
                src={ssrImage(theme.slug)}
                alt=""
                loading="lazy"
                width={512}
                height={768}
                onLoad={(e) => e.currentTarget.classList.add('is-loaded')}
                ref={(el) => {
                  // キャッシュ済みでonLoadがハイドレーション前に発火済みのケースを拾う
                  if (el?.complete) el.classList.add('is-loaded');
                }}
              />
            ) : (
              <span className="zukan-card-img zukan-card-placeholder" aria-hidden="true" />
            )}
            <span className="zukan-card-shine" aria-hidden="true" />
            <span className="zukan-card-plate">
              <span className="zukan-card-name">{w.name}</span>
              {theme.catch ? <span className="zukan-card-catch">{theme.catch}</span> : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}
```

変更点: `zukan-card-group` のspanを削除し、`zukan-card-shine`（装飾、aria-hidden）と `zukan-card-plate`（区名＋キャッチコピー）を追加。

- [ ] **Step 4: テストが通ることを確認**

Run: `npx vitest run src/ui/Zukan.test.tsx`
Expected: PASS（6件）

Run: `npm test`
Expected: 既存テスト含め全件PASS（系統表示は図鑑カード以外に依存が無いこと）

- [ ] **Step 5: コミット**

```bash
git add src/ui/Zukan.tsx src/ui/Zukan.test.tsx
git commit -m "feat: 図鑑カードから系統表示を外しネームプレート構造へ組み替え"
```

---

### Task 2: タッチ環境のスクロールシャイン（IntersectionObserver）

**Files:**
- Modify: `src/ui/Zukan.tsx`
- Modify: `src/ui/Zukan.test.tsx`（テスト追記）

**Interfaces:**
- Consumes: Task 1のカードDOM（`.zukan-grid` 直下に `.zukan-card`）
- Produces: 条件成立時（ホバー不可・reduced motionでない環境）にカードへ `is-shine` クラスを1回だけ付与する挙動。Task 3のCSSは `.zukan-card.is-shine .zukan-card-shine` にアニメーションを当てる

- [ ] **Step 1: 失敗するテストを書く**

`src/ui/Zukan.test.tsx` に追記:

```tsx
import { afterEach, beforeEach } from 'vitest';

// ...既存describeの後に追加...

describe('Zukan タッチ環境のスクロールシャイン', () => {
  class MockIntersectionObserver {
    static instances: MockIntersectionObserver[] = [];
    callback: IntersectionObserverCallback;
    observed: Element[] = [];
    constructor(cb: IntersectionObserverCallback) {
      this.callback = cb;
      MockIntersectionObserver.instances.push(this);
    }
    observe(el: Element) {
      this.observed.push(el);
    }
    unobserve(el: Element) {
      this.observed = this.observed.filter((e) => e !== el);
    }
    disconnect() {
      this.observed = [];
    }
  }

  const stubMedia = (opts: { hoverNone: boolean; reduced: boolean }) => {
    vi.stubGlobal('matchMedia', (query: string) => ({
      matches: query.includes('hover: none') ? opts.hoverNone : opts.reduced,
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }));
  };

  beforeEach(() => {
    MockIntersectionObserver.instances = [];
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('ホバー不可環境では画面に入ったカードに is-shine を1回だけ付ける', () => {
    stubMedia({ hoverNone: true, reduced: false });
    const { container } = render(<Zukan onSelect={() => {}} />);

    const io = MockIntersectionObserver.instances[0];
    expect(io).toBeDefined();
    expect(io.observed).toHaveLength(23);

    const card = container.querySelector('.zukan-card')!;
    io.callback(
      [{ target: card, isIntersecting: true } as unknown as IntersectionObserverEntry],
      io as unknown as IntersectionObserver
    );
    expect(card.classList.contains('is-shine')).toBe(true);
    // 付与後はunobserveされ再発火しない
    expect(io.observed).toHaveLength(22);
  });

  it('ホバー可能環境ではObserverを起動しない', () => {
    stubMedia({ hoverNone: false, reduced: false });
    render(<Zukan onSelect={() => {}} />);
    expect(MockIntersectionObserver.instances).toHaveLength(0);
  });

  it('reduced motion環境ではObserverを起動しない', () => {
    stubMedia({ hoverNone: true, reduced: true });
    render(<Zukan onSelect={() => {}} />);
    expect(MockIntersectionObserver.instances).toHaveLength(0);
  });
});
```

注意: 既存の `import { describe, it, expect, vi } from 'vitest';` を `import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';` に統合すること（import文を2つに分けない）。

- [ ] **Step 2: テストが失敗することを確認**

Run: `npx vitest run src/ui/Zukan.test.tsx`
Expected: FAIL — Observerが未実装のため `io` がundefined（1件目）。2・3件目は実装前でも通る（起動しないので）

- [ ] **Step 3: Zukan.tsx にObserverを実装**

`src/ui/Zukan.tsx` の先頭importと `Zukan` 関数を以下へ変更:

```tsx
import { useEffect, useRef } from 'react';
import { loadWards } from '../data/wards';
import type { Ward } from '../domain/axes';
import { ssrImage, wardTheme } from './wardTheme';
```

`Zukan` 関数の冒頭に追加（return文の前）:

```tsx
export function Zukan({ onSelect }: { onSelect: (w: Ward) => void }) {
  const gridRef = useRef<HTMLDivElement>(null);

  // タッチ環境（ホバー不可）ではスクロールで画面に入ったカードのシャインを1回再生する。
  // reduced motion時とIntersectionObserver非対応環境は静的表示のままにする。
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    if (typeof IntersectionObserver === 'undefined' || typeof matchMedia === 'undefined') return;
    if (!matchMedia('(hover: none)').matches) return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const observer = new IntersectionObserver(
      (entries, io) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('is-shine');
          io.unobserve(entry.target);
        }
      },
      { threshold: 0.6 }
    );
    for (const card of grid.querySelectorAll('.zukan-card')) observer.observe(card);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="zukan-grid" ref={gridRef}>
      {/* Task 1のカードDOMのまま */}
```

- [ ] **Step 4: テストが通ることを確認**

Run: `npx vitest run src/ui/Zukan.test.tsx`
Expected: PASS（9件）

Run: `npm test`
Expected: 全件PASS

- [ ] **Step 5: コミット**

```bash
git add src/ui/Zukan.tsx src/ui/Zukan.test.tsx
git commit -m "feat: タッチ環境で図鑑カードのシャインをスクロール発火にする"
```

---

### Task 3: カードスタイルの刷新（app/zukan.css）

**Files:**
- Modify: `app/zukan.css`（「図鑑グリッド」節 43〜148行と、末尾のreduced-motion節 1351〜1357行）

**Interfaces:**
- Consumes: Task 1のクラス名（`zukan-card` `zukan-card-no` `zukan-card-img` `zukan-card-placeholder` `zukan-card-shine` `zukan-card-plate` `zukan-card-name` `zukan-card-catch`）と Task 2の `is-shine`
- Produces: なし（最終タスク）

- [ ] **Step 1: 図鑑グリッド節を置き換える**

`app/zukan.css` の `/* ---- 図鑑グリッド ---- */` から `.zukan-card-group::before { ... }` まで（現行43〜148行）を、以下で丸ごと置き換える。`html.uk-js .zukan-card-img.is-loaded` のフェード節（コメント含む）はそのまま残す:

```css
/* ---- 図鑑グリッド（プレミアムカード） ---- */

.zukan-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 18px;
}

.zukan-card {
  --ward-color: #b8923f;
  position: relative;
  display: block;
  padding: 0;
  overflow: hidden;
  background: radial-gradient(circle at 50% 36%, #fff6e0 0%, #e5d0a4 100%);
  border: 2.5px solid var(--ward-color);
  border-radius: 12px;
  color: #f4e8d0;
  cursor: pointer;
  text-align: center;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.45);
}

.zukan-card:focus-visible {
  outline: 3px solid var(--ward-color);
  outline-offset: 3px;
}

/* メダリオンNo.（左上） */
.zukan-card-no {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 2;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1.5px solid rgba(232, 197, 107, 0.85);
  background: radial-gradient(circle at 50% 28%, #4a3418 0%, #17110c 100%);
  color: #f0d693;
  font-size: 10px;
  letter-spacing: 0.14em;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
}

/* フルブリード立ち絵 */
.zukan-card-img {
  width: 100%;
  /* height属性(768)の presentational hint に勝たせ、aspect-ratioで高さを決める */
  height: auto;
  aspect-ratio: 2 / 3;
  object-fit: cover;
  display: block;
}

.zukan-card-placeholder {
  display: block;
}

/* シャイン（斜めに走る光沢。ホバー時 or is-shine付与時に1回再生） */
.zukan-card-shine {
  position: absolute;
  top: -20%;
  bottom: -20%;
  left: 0;
  width: 45%;
  z-index: 1;
  pointer-events: none;
  background: linear-gradient(
    90deg,
    rgba(255, 244, 214, 0) 0%,
    rgba(255, 244, 214, 0.45) 50%,
    rgba(255, 244, 214, 0) 100%
  );
  transform: translateX(-140%) skewX(-18deg);
}

@keyframes zukanShine {
  0% {
    transform: translateX(-140%) skewX(-18deg);
  }
  100% {
    transform: translateX(240%) skewX(-18deg);
  }
}

.zukan-card.is-shine .zukan-card-shine {
  animation: zukanShine 0.9s ease 0.15s both;
}

/* ネームプレート（下部グラデーション上の金文字） */
.zukan-card-plate {
  position: absolute;
  inset: auto 0 0 0;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
  padding: 36px 10px 12px;
  background: linear-gradient(
    180deg,
    rgba(23, 17, 12, 0) 0%,
    rgba(23, 17, 12, 0.62) 45%,
    rgba(23, 17, 12, 0.88) 100%
  );
  pointer-events: none;
}

.zukan-card-name {
  font-size: 15px;
  letter-spacing: 0.14em;
  font-weight: 600;
  color: #f4e0a8;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
}

/* キャッチコピーはホバー環境でのみスライドイン表示 */
.zukan-card-catch {
  display: none;
  font-size: 11px;
  line-height: 1.6;
  color: #f4e8d0;
}

/* ホバー環境のみの演出（タッチ環境のsticky hoverを避ける） */
@media (hover: hover) {
  .zukan-card {
    transition: transform 0.25s ease, box-shadow 0.25s ease;
  }

  .zukan-card:hover {
    transform: translateY(-6px);
    box-shadow:
      0 14px 30px rgba(0, 0, 0, 0.55),
      0 0 20px -2px var(--ward-color);
  }

  .zukan-card:hover .zukan-card-shine {
    animation: zukanShine 0.9s ease;
  }

  .zukan-card-catch {
    display: block;
    max-height: 0;
    opacity: 0;
    overflow: hidden;
    transition: max-height 0.3s ease, opacity 0.3s ease;
  }

  .zukan-card:hover .zukan-card-catch,
  .zukan-card:focus-visible .zukan-card-catch {
    max-height: 4.8em;
    opacity: 1;
  }
}
```

- [ ] **Step 2: reduced-motion節を更新する**

末尾付近の既存ブロック:

```css
@media (prefers-reduced-motion: reduce) {
  .zukan-card,
  .zukan-card:hover {
    transition: none;
    transform: none;
  }
}
```

を以下へ置き換える:

```css
@media (prefers-reduced-motion: reduce) {
  .zukan-card,
  .zukan-card:hover {
    transition: none;
    transform: none;
  }
  .zukan-card-shine {
    display: none;
  }
  .zukan-card-catch {
    transition: none;
  }
}
```

- [ ] **Step 3: テストとビルドを確認**

Run: `npm test`
Expected: 全件PASS

Run: `NEXT_PUBLIC_SITE_URL=https://uchinokuchan.pages.dev npm run build`
Expected: 静的エクスポート成功（`out/` 生成、エラーなし）

- [ ] **Step 4: ブラウザで視覚確認**

dev server（`npm run dev` 相当は `.claude/launch.json` 経由のプレビューを使用）でトップページの図鑑セクションを確認:

- デスクトップ幅: 区ごとの色縁、下部グラデーション上の金文字区名、左上メダリオンNo.、ホバーで浮き上がり＋区色グロー＋シャイン＋キャッチコピーのスライドイン
- モバイル幅（375px）: 2カラムで立ち絵の顔が見えること、系統ラベルが無いこと
- 区名の可読性: グラデーション上で `#f4e0a8` が読めること（薄い髪色の区でも背景はグラデーションなので影響なし）

- [ ] **Step 5: コミット**

```bash
git add app/zukan.css
git commit -m "feat: 図鑑カードをテーマカラー縁取りのプレミアムカードデザインへ刷新"
```

---

## 完了条件（スペックとの対応）

- 系統ラベル非表示 → Task 1
- フルブリード立ち絵・色縁・金文字プレート・メダリオンNo. → Task 3 Step 1
- ホバー演出（浮き上がり・グロー・シャイン・キャッチコピー） → Task 3 Step 1 の `@media (hover: hover)`
- タッチ環境のスクロールシャイン → Task 2 ＋ Task 3 の `.is-shine`
- reduced motion対応 → Task 2 Step 3 のガード ＋ Task 3 Step 2
- グリッド160px化 → Task 3 Step 1
- lazy読み込み・is-loadedフェード維持 → Task 1 Step 3（DOM維持）＋ Task 3 Step 1（該当CSS節を残す）
- `npm test` / 本番相当ビルド → Task 3 Step 3
