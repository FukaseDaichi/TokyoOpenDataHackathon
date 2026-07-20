# GA4アクセス解析導入 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** GA4でページビュー・診断の質問別回答分布・診断結果分布を計測できるようにする。

**Architecture:** `@next/third-parties` の `<GoogleAnalytics>` を layout に置き（`NEXT_PUBLIC_GA_ID` 設定時のみ）、`src/lib/analytics.ts` の薄いラッパー2関数からカスタムイベントを送る。ラッパーは `window.gtag`（`<GoogleAnalytics>` が定義する）を直接呼び、gtag不在・SSR・例外のすべてで無音の no-op とする。※spec では `sendGAEvent` 経由としていたが、`sendGAEvent` はGA未初期化時に console 警告を出すため `window.gtag` 直接呼びに変更する（Task 5 で spec も修正）。

**Tech Stack:** Next.js 15 (App Router, `output: 'export'`), React 19, TypeScript, Vitest + Testing Library, @next/third-parties

**Spec:** [docs/superpowers/specs/2026-07-20-ga4-analytics-design.md](../specs/2026-07-20-ga4-analytics-design.md)

## Global Constraints

- `next.config.ts` の `output: 'export'` を維持。実行時API・SSR依存を追加しない
- `NEXT_PUBLIC_GA_ID` 未設定でもビルド・全テストが通り、GAスクリプトは一切読み込まれない
- 計測の失敗は診断フロー・画面遷移に影響させない（ラッパー内で例外をすべて握りつぶす）
- `sessionStorage` に入れるのは従来どおり5軸ベクトルと結果区コードのみ（個別回答は端末に保存しない）
- UIコピーは日本語
- コミットメッセージ末尾: `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`

---

### Task 1: 計測ラッパー `src/lib/analytics.ts`

**Files:**
- Create: `src/lib/analytics.ts`
- Test: `src/lib/analytics.test.ts`

**Interfaces:**
- Consumes: なし（`window.gtag` があれば使う）
- Produces: `trackDiagnosisAnswer(questionId: string, choiceIndex: number): void` / `trackDiagnosisResult(wardSlug: string): void` — Task 3, 4 が import する

- [ ] **Step 1: 失敗するテストを書く**

`src/lib/analytics.test.ts` を作成:

```ts
import { describe, it, expect, vi, afterEach } from 'vitest';
import { trackDiagnosisAnswer, trackDiagnosisResult } from './analytics';

type GtagWindow = Window & { gtag?: (...args: unknown[]) => void };
const win = window as GtagWindow;

afterEach(() => {
  delete win.gtag;
});

describe('analytics（GA4計測ラッパー）', () => {
  it('gtag不在（GA未設定・広告ブロック）でも例外を出さずno-op', () => {
    expect(() => trackDiagnosisAnswer('q1', 0)).not.toThrow();
    expect(() => trackDiagnosisResult('chiyoda')).not.toThrow();
  });

  it('trackDiagnosisAnswerはquestion_idとchoice_indexを送る', () => {
    const gtag = vi.fn();
    win.gtag = gtag;
    trackDiagnosisAnswer('q3', 2);
    expect(gtag).toHaveBeenCalledTimes(1);
    expect(gtag).toHaveBeenCalledWith('event', 'diagnosis_answer', {
      question_id: 'q3',
      choice_index: 2,
    });
  });

  it('trackDiagnosisResultはward_slugを送る', () => {
    const gtag = vi.fn();
    win.gtag = gtag;
    trackDiagnosisResult('setagaya');
    expect(gtag).toHaveBeenCalledTimes(1);
    expect(gtag).toHaveBeenCalledWith('event', 'diagnosis_result', {
      ward_slug: 'setagaya',
    });
  });

  it('gtagが例外を投げても外へ伝播しない', () => {
    win.gtag = () => {
      throw new Error('gtag broken');
    };
    expect(() => trackDiagnosisAnswer('q1', 0)).not.toThrow();
    expect(() => trackDiagnosisResult('chiyoda')).not.toThrow();
  });
});
```

- [ ] **Step 2: テストが失敗することを確認**

Run: `npx vitest run src/lib/analytics.test.ts`
Expected: FAIL（`Cannot find module './analytics'` 等、モジュール未実装による失敗）

- [ ] **Step 3: 最小実装を書く**

`src/lib/analytics.ts` を作成:

```ts
// GA4計測の薄いラッパー。gtagは app/layout.tsx の <GoogleAnalytics> が定義する。
// gtag不在（NEXT_PUBLIC_GA_ID未設定・SSR・広告ブロック）や送信時例外は無音のno-opとし、
// 計測が診断フローを止めることは絶対にない。

type GtagFn = (command: 'event', eventName: string, params: Record<string, string | number>) => void;

function gaEvent(name: string, params: Record<string, string | number>): void {
  if (typeof window === 'undefined') return;
  try {
    const gtag = (window as Window & { gtag?: GtagFn }).gtag;
    if (typeof gtag !== 'function') return;
    gtag('event', name, params);
  } catch {
    // 計測失敗はUIへ影響させない
  }
}

/** 診断で1問回答が確定するたびに送る。choiceIndexは0始まりの選択肢番号。 */
export function trackDiagnosisAnswer(questionId: string, choiceIndex: number): void {
  gaEvent('diagnosis_answer', { question_id: questionId, choice_index: choiceIndex });
}

/** 診断結果（マッチした区）が確定したときに送る。 */
export function trackDiagnosisResult(wardSlug: string): void {
  gaEvent('diagnosis_result', { ward_slug: wardSlug });
}
```

- [ ] **Step 4: テストが通ることを確認**

Run: `npx vitest run src/lib/analytics.test.ts`
Expected: PASS（4 tests）

- [ ] **Step 5: コミット**

```bash
git add src/lib/analytics.ts src/lib/analytics.test.ts
git commit -m "feat: GA4計測ラッパー（診断回答・結果イベント、gtag不在時はno-op）

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: `@next/third-parties` 導入と layout への GoogleAnalytics 配置

**Files:**
- Modify: `package.json`（依存追加）
- Modify: `app/layout.tsx:56-85`（`RootLayout`）

**Interfaces:**
- Consumes: 環境変数 `NEXT_PUBLIC_GA_ID`
- Produces: 本番ページでの `window.gtag` 定義（Task 1 のラッパーが利用）

- [ ] **Step 1: 依存を追加**

```bash
npm install @next/third-parties@^15
```

Expected: `package.json` の dependencies に `@next/third-parties` が追加される。

- [ ] **Step 2: layout.tsx に GoogleAnalytics を条件付きで配置**

`app/layout.tsx` の import 部に追加:

```tsx
import { GoogleAnalytics } from '@next/third-parties/google';
```

`const SITE_URL = ...` の直後に追加:

```tsx
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
```

`RootLayout` の `{children}` の直後（`</body>` の直前）に追加:

```tsx
        {children}
        {/* GA4。NEXT_PUBLIC_GA_ID未設定時はスクリプト自体を読み込まない */}
        {GA_ID && <GoogleAnalytics gaId={GA_ID} />}
      </body>
```

- [ ] **Step 3: GA無しビルドでスクリプトが入らないことを確認**

Run: `npm run build && grep -c "googletagmanager" out/index.html; true`
Expected: ビルド成功、grep の出力は `0`

- [ ] **Step 4: GA有りビルドでスクリプトが入ることを確認**

Run: `NEXT_PUBLIC_GA_ID=G-TEST1234 npm run build && grep -o "G-TEST1234" out/index.html | head -1`
Expected: ビルド成功、`G-TEST1234` が出力される

- [ ] **Step 5: 検証後、通常ビルドへ戻してコミット**

```bash
npm run build
git add package.json package-lock.json app/layout.tsx
git commit -m "feat: NEXT_PUBLIC_GA_ID設定時のみGA4スクリプトを読み込む

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: 診断の回答イベント送信（Diagnosis.tsx）

**Files:**
- Modify: `src/ui/Diagnosis.tsx:153`（`onPick` ハンドラ）と import 部
- Test: `src/ui/Diagnosis.test.tsx`（追記）

**Interfaces:**
- Consumes: Task 1 の `trackDiagnosisAnswer(questionId: string, choiceIndex: number)`、`src/lib/quiz.ts` の `QuizQuestion.id`（`'q1'`〜`'q10'`）
- Produces: なし（イベント送信のみ）

- [ ] **Step 1: 失敗するテストを書く**

`src/ui/Diagnosis.test.tsx` の既存 `vi.mock('../hero/quality', ...)` の直後に analytics のモックを追加:

```ts
const { analyticsSpies } = vi.hoisted(() => ({
  analyticsSpies: { trackDiagnosisAnswer: vi.fn() },
}));
vi.mock('../lib/analytics', () => ({
  trackDiagnosisAnswer: analyticsSpies.trackDiagnosisAnswer,
  trackDiagnosisResult: vi.fn(),
}));
```

既存の `beforeEach` に1行追加:

```ts
    analyticsSpies.trackDiagnosisAnswer.mockClear();
```

`describe` 内の末尾に新テストを追加:

```ts
  it('回答が確定するたびにtrackDiagnosisAnswerへ質問IDと選択肢番号を送る', () => {
    reducedState.value = true; // 即askingで進行を簡潔に
    render(<Diagnosis onComplete={() => {}} />);

    fireEvent.click(screen.getAllByRole('button')[1]); // q1: 2番目の選択肢
    advance(REDUCED_STAMP_MS);
    fireEvent.click(screen.getAllByRole('button')[0]); // q2: 先頭の選択肢

    expect(analyticsSpies.trackDiagnosisAnswer).toHaveBeenCalledTimes(2);
    expect(analyticsSpies.trackDiagnosisAnswer).toHaveBeenNthCalledWith(1, 'q1', 1);
    expect(analyticsSpies.trackDiagnosisAnswer).toHaveBeenNthCalledWith(2, 'q2', 0);
  });

  it('封蝋中（disabled）の連打では回答イベントを重複送信しない', () => {
    reducedState.value = true;
    render(<Diagnosis onComplete={() => {}} />);

    fireEvent.click(screen.getAllByRole('button')[0]); // q1確定 → stamping
    screen.getAllByRole('button').forEach((b) => fireEvent.click(b)); // disabled連打
    expect(analyticsSpies.trackDiagnosisAnswer).toHaveBeenCalledTimes(1);
  });
```

- [ ] **Step 2: テストが失敗することを確認**

Run: `npx vitest run src/ui/Diagnosis.test.tsx`
Expected: 新規2テストが FAIL（`trackDiagnosisAnswer` が0回呼び出し）。既存テストは PASS のまま。

- [ ] **Step 3: Diagnosis.tsx に送信処理を追加**

import 部（`diagnosisFlow` の import の後）に追加:

```ts
import { trackDiagnosisAnswer } from '../lib/analytics';
```

`onPick={(i) => dispatch({ type: 'PICK', option: i })}` を次に変更:

```tsx
                onPick={(i) => {
                  trackDiagnosisAnswer(q.id, i);
                  dispatch({ type: 'PICK', option: i });
                }}
```

（`onPick` は `interactive`（= asking フェーズ）時しか渡されないため、封蝋中の連打では発火しない）

- [ ] **Step 4: テストが通ることを確認**

Run: `npx vitest run src/ui/Diagnosis.test.tsx`
Expected: PASS（既存6 + 新規2 = 8 tests）

- [ ] **Step 5: コミット**

```bash
git add src/ui/Diagnosis.tsx src/ui/Diagnosis.test.tsx
git commit -m "feat: 診断回答の確定ごとにdiagnosis_answerイベントを送信

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: 結果イベント送信とフッター告知（App.tsx）

**Files:**
- Modify: `src/App.tsx:62-66`（`onComplete`）、`src/App.tsx:83-84`（図鑑セクション直後にフッター追加）と import 部
- Modify: `app/globals.css`（末尾にフッタースタイル追加）

**Interfaces:**
- Consumes: Task 1 の `trackDiagnosisResult(wardSlug: string)`、既存の `CODE_TO_SLUG: Record<string, string>`
- Produces: なし

- [ ] **Step 1: App.tsx に結果イベントとフッターを追加**

import 部に追加:

```ts
import { trackDiagnosisResult } from './lib/analytics';
```

`onComplete` を次に変更（slug の二重計算をローカル変数へまとめる）:

```tsx
              onComplete={(userVector, answers) => {
                const result = bestDiagnosisMatch(answers, WARDS);
                const slug = CODE_TO_SLUG[result.code];
                saveDiagnosis(userVector, result.code);
                trackDiagnosisResult(slug);
                router.push(`/result/${slug}/`);
              }}
```

図鑑セクション（`</section>`、73-83行目のブロック）の直後・`{/* 個別詳細モーダル */}` の前にフッターを追加:

```tsx
      {/* フッター: 外部送信規律に基づくアクセス解析の告知 */}
      <footer className="site-footer">
        <p className="site-footer-note">
          本サイトはサービス改善のため Google Analytics を利用しています。
          診断の回答・結果は個人を特定しない匿名の統計情報として Google に送信されます。
        </p>
      </footer>
```

- [ ] **Step 2: globals.css 末尾にフッタースタイルを追加**

```css
/* ===== フッター（アクセス解析の告知） ===== */
.site-footer {
  padding: 2.5rem 1.5rem 3rem;
  text-align: center;
}

.site-footer-note {
  font-size: 0.72rem;
  letter-spacing: 0.06em;
  line-height: 1.9;
  color: #9c8c66; /* 背景#17110cに対しコントラスト比約5.6:1 */
  max-width: 34em;
  margin: 0 auto;
}
```

- [ ] **Step 3: 全テストとビルドの確認**

Run: `npm test`
Expected: 全テスト PASS

Run: `npm run build`
Expected: ビルド成功

- [ ] **Step 4: コミット**

```bash
git add src/App.tsx app/globals.css
git commit -m "feat: diagnosis_resultイベント送信とフッターの計測告知を追加

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 5: ドキュメント更新（AGENTS.md・設計書・spec）

**Files:**
- Modify: `AGENTS.md`（プライバシー制約行、ビルドコマンド、環境変数の記述）
- Modify: `docs/system-design/01-system-overview.md:74`
- Modify: `docs/system-design/02-application-design.md`（診断フロー記述）
- Modify: `docs/system-design/06-build-test-operation.md`（GA4運用手順を追記）
- Modify: `docs/superpowers/specs/2026-07-20-ga4-analytics-design.md`（sendGAEvent→window.gtag の記述修正）

**Interfaces:**
- Consumes: Task 1〜4 の実装内容（記述対象）
- Produces: なし

- [ ] **Step 1: AGENTS.md を更新**

「重要な実装制約」の次の行:

> `- 診断の5軸ベクトルと結果区コードは `sessionStorage` だけに保存し、個別回答は保存・外部送信しない。`

を次に置換:

```markdown
- 診断の5軸ベクトルと結果区コードは `sessionStorage` だけに保存し、個別回答は端末に保存しない。計測のため質問ID・選択肢番号・結果区slugは匿名イベントとしてGA4へ送信する（`src/lib/analytics.ts`。`NEXT_PUBLIC_GA_ID` 未設定時はno-op）。個人を特定する情報は扱わない。
```

「コマンド」セクションの本番ビルド行:

> `NEXT_PUBLIC_SITE_URL=https://uchinokuchan.pages.dev npm run build`

を次に置換:

```bash
NEXT_PUBLIC_SITE_URL=https://uchinokuchan.pages.dev NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX npm run build
```

「重要な実装制約」の `NEXT_PUBLIC_SITE_URL` の行の直後に追加:

```markdown
- `NEXT_PUBLIC_GA_ID`（GA4測定ID）未設定でもビルド・動作するが計測されない。本番ビルドでは設定する。運用手順は [ビルド・テスト・運用](docs/system-design/06-build-test-operation.md) を参照する。
```

- [ ] **Step 2: 01-system-overview.md を更新**

74行目:

> `- 利用者の個別回答は保存せず、採点後の5軸ベクトルと結果区コードだけを外部送信せずに同一タブの `sessionStorage` へ保存する。`

を次に置換:

```markdown
- 利用者の個別回答は保存せず、採点後の5軸ベクトルと結果区コードだけを同一タブの `sessionStorage` へ保存する。計測のため、質問ID・選択肢番号・結果区slugを個人を特定しない匿名イベントとしてGA4へ送信する（`NEXT_PUBLIC_GA_ID` 設定時のみ。`src/lib/analytics.ts`）。
```

- [ ] **Step 3: 02-application-design.md を更新**

診断フローの mermaid 図（`Match --> Save["ベクトル + 結果区コードをsessionStorageへ保存"]` を含む図）の直後の本文に、次の段落を追加:

```markdown
計測イベントは2箇所から送る。回答確定（PICK）ごとに `Diagnosis.tsx` が `trackDiagnosisAnswer(questionId, choiceIndex)` を、結果確定時に `App.tsx` の `onComplete` が `trackDiagnosisResult(wardSlug)` を呼ぶ（いずれも `src/lib/analytics.ts`。GA未設定時はno-op）。
```

- [ ] **Step 4: 06-build-test-operation.md に運用手順を追記**

ファイル末尾（または環境変数を扱うセクションの後）に追加:

```markdown
## アクセス解析（GA4）

### 環境変数

- `NEXT_PUBLIC_GA_ID`: GA4測定ID（`G-XXXXXXXXXX` 形式）。未設定でもビルド・動作するがGAスクリプトを読み込まず計測されない。本番ビルドでは必ず設定する。

### 計測イベント

| イベント名 | 送信タイミング | パラメータ |
|---|---|---|
| `page_view` | 全ページ・クライアント遷移含め自動 | GA4標準 |
| `diagnosis_answer` | 診断で1問回答が確定するたび | `question_id`（q1〜q10）、`choice_index`（0始まり） |
| `diagnosis_result` | 診断結果の確定時 | `ward_slug`（マッチした区のslug） |

### GA4プロパティの作成手順

1. https://analytics.google.com/ でアカウント（未作成なら）とプロパティを作成する。タイムゾーン: 日本、通貨: 日本円。
2. データストリーム「ウェブ」を追加し、URL `https://uchinokuchan.pages.dev` を登録して測定ID（`G-XXXX`）を取得する。
3. 管理 > データの表示 > カスタム定義 で、イベントスコープのカスタムディメンションを3つ登録する: `question_id`、`choice_index`、`ward_slug`。
4. 探索レポートで `diagnosis_answer` を `question_id` × `choice_index` で分解すると質問別の回答分布、`diagnosis_result` を `ward_slug` で分解すると結果区の分布が見られる。イベント数の質問別減衰から離脱地点も読み取れる。

### プライバシー

個別回答は端末に保存しない。GA4へ送るのは質問ID・選択肢番号・結果区slugの匿名イベントのみで、個人を特定する情報は扱わない。トップページのフッターに利用者向けの告知を掲載している。
```

- [ ] **Step 5: spec の sendGAEvent 記述を実装に合わせて修正**

`docs/superpowers/specs/2026-07-20-ga4-analytics-design.md` の

> `- 内部で `@next/third-parties/google` の `sendGAEvent` を呼ぶ。`

を次に置換:

```markdown
- `<GoogleAnalytics>` が定義する `window.gtag` を直接呼ぶ（`sendGAEvent` はGA未初期化時にconsole警告を出すため使わない）。
```

- [ ] **Step 6: 最終確認とコミット**

Run: `npm test`
Expected: 全テスト PASS

Run: `NEXT_PUBLIC_SITE_URL=https://uchinokuchan.pages.dev NEXT_PUBLIC_GA_ID=G-TEST1234 npm run build && grep -o "G-TEST1234" out/index.html | head -1`
Expected: ビルド成功、`G-TEST1234` が出力される（本番相当ビルドの確認）

```bash
git add AGENTS.md docs/system-design/01-system-overview.md docs/system-design/02-application-design.md docs/system-design/06-build-test-operation.md docs/superpowers/specs/2026-07-20-ga4-analytics-design.md
git commit -m "docs: GA4計測の導入をAGENTS.md・設計書へ反映

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

## 実装後にユーザーが行うこと（コード外）

1. GA4プロパティを作成して測定IDを取得する（手順は Task 5 で追記した 06-build-test-operation.md）。
2. 取得した測定IDで本番ビルド・デプロイする:

```bash
NEXT_PUBLIC_SITE_URL=https://uchinokuchan.pages.dev NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX npm run build
wrangler pages deploy out --project-name=uchinokuchan
```

3. GA4のカスタムディメンション3つ（`question_id`、`choice_index`、`ward_slug`）を登録する。
