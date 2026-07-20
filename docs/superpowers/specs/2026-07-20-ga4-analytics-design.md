# GA4アクセス解析導入 設計書

日付: 2026-07-20
ステータス: レビュー待ち

## 背景と目的

「うちの区ちゃん」にGoogle Analytics 4（GA4）を導入し、次の統計を取得できるようにする。

1. ページビュー統計（トップ、`/result/[slug]/`、`/ward/[slug]/` それぞれの閲覧数）
2. 診断の質問ごとの回答分布（Q1〜Q10で、どの選択肢が選ばれたか）
3. 診断結果の分布（どの区にマッチした人が多いか）

回答のたびにイベントを送る設計のため、「何問目まで進んで離脱したか」もGA4上のイベント数の減衰から読み取れる。

## プライバシー方針の変更

現行の「個別回答は保存・外部送信しない」という制約を、次のとおり緩和する。

- 個別回答を端末に保存しない方針は維持する（`sessionStorage` に入れるのは従来どおり5軸ベクトルと結果区コードのみ）。
- 質問ID・選択肢番号・結果区コードは、個人を特定しない匿名イベントとしてGA4へ送信する。
- 氏名・連絡先等の個人情報は一切扱わない。ユーザーIDの付与やクロスサイト計測は行わない。

改正電気通信事業法の外部送信規律に対応するため、トップページのフッターに利用者向けの告知を掲載する（後述）。

## アーキテクチャ

### 依存追加

- `@next/third-parties`（Next.js公式）を dependencies に追加する。

### GA4スクリプトの読み込み — `app/layout.tsx`

- 環境変数 `NEXT_PUBLIC_GA_ID`（`G-XXXXXXXXXX` 形式）が設定されているときだけ `<GoogleAnalytics gaId={...} />` を描画する。
- 未設定時はスクリプト自体を読み込まない。ローカル開発・CI・Vitestでは計測が走らない。`NEXT_PUBLIC_SITE_URL` と同じく「未設定でもビルドは通るが本番では必須」の扱いとする。
- `page_view` はGA4の拡張計測と `@next/third-parties` の挙動により、App Routerのクライアント遷移を含めて自動送信される。手動送信は実装しない。

### 計測ラッパー — `src/lib/analytics.ts`（新規）

副作用を閉じ込めた薄いモジュール。公開APIは2関数のみ。

```ts
trackDiagnosisAnswer(questionId: string, choiceIndex: number): void
trackDiagnosisResult(wardSlug: string): void
```

- 内部で `@next/third-parties/google` の `sendGAEvent` を呼ぶ。
- GA未設定（`window.gtag`/`dataLayer` 不在）、SSR実行、送信時例外のすべてで安全に no-op とし、例外を外へ漏らさない。計測は絶対に診断フローを止めない。

### イベント送信箇所

| イベント名 | 送信箇所 | パラメータ |
|---|---|---|
| `diagnosis_answer` | `src/ui/Diagnosis.tsx` の回答確定処理（選択肢タップでフローが次へ進む箇所） | `question_id`（`q1`〜`q10`、`src/lib/quiz.ts` の `QuizQuestion.id`）、`choice_index`（0始まりの選択肢番号） |
| `diagnosis_result` | `src/App.tsx` の `Diagnosis onComplete`（`bestDiagnosisMatch` で結果確定後、`router.push` の前） | `ward_slug`（`CODE_TO_SLUG[result.code]`） |

- `Diagnosis.tsx` は `trackDiagnosisAnswer` を直接呼ぶ（ラッパーが no-op 安全なため、propsでのコールバック注入はしない）。
- リプレイ・再診断時も通常どおり送信する（再挑戦も1回答としてカウントする）。

## プライバシー表記（フッター）

`src/App.tsx` のトップページ末尾に `<footer>` を新設し、次の文面を掲載する。

> 本サイトはサービス改善のため Google Analytics を利用しています。診断の回答・結果は個人を特定しない匿名の統計情報として Google に送信されます。

- 見た目は既存の book セクションのトーンに合わせた控えめなスタイル（小さめの文字、中立色）。
- サブページ（`/result/`、`/ward/`）には置かない。告知はトップページ掲載で足りると判断する。

## 環境変数と運用

- `NEXT_PUBLIC_GA_ID`: GA4測定ID。本番ビルド時に設定する。

```bash
NEXT_PUBLIC_SITE_URL=https://uchinokuchan.pages.dev NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX npm run build
wrangler pages deploy out --project-name=uchinokuchan
```

### GA4プロパティ作成手順（ドキュメント化する内容）

1. https://analytics.google.com/ でアカウント（未作成なら）とプロパティを作成する。タイムゾーン: 日本、通貨: JPY。
2. データストリーム「ウェブ」を追加し、URL `https://uchinokuchan.pages.dev` を登録して測定ID（`G-XXXX`）を取得する。
3. 管理 > データの表示 > カスタム定義 で、イベントスコープのカスタムディメンションを3つ登録する: `question_id`、`choice_index`、`ward_slug`。
4. 探索レポートで `diagnosis_answer` を `question_id` × `choice_index` で分解すると回答分布、`diagnosis_result` を `ward_slug` で分解すると結果分布が見られる。

この手順は `docs/system-design/06-build-test-operation.md` に記載する。

## ドキュメント更新

| ファイル | 変更内容 |
|---|---|
| `AGENTS.md` | プライバシー制約の行を「個別回答は端末に保存しないが、匿名イベント（質問ID・選択肢番号・結果区コード）としてGA4へ送信する。個人情報は扱わない」へ書き換え。環境変数の説明に `NEXT_PUBLIC_GA_ID` を追記 |
| `docs/system-design/01-system-overview.md` | プライバシー記述（74行目付近）を同趣旨で更新。外部依存としてGA4を追記 |
| `docs/system-design/02-application-design.md` | 診断フローに計測イベントの送信点を追記 |
| `docs/system-design/06-build-test-operation.md` | GA4プロパティ作成手順、`NEXT_PUBLIC_GA_ID`、カスタムディメンション登録手順を追記 |

## テスト

- `src/lib/analytics.test.ts`（新規）
  - GA未設定（gtag不在）で呼んでも例外にならず no-op であること
  - gtagモックあり時に、イベント名とパラメータ（`question_id`、`choice_index`、`ward_slug`）が正しい形で送られること
  - 送信中に例外が起きても外へ伝播しないこと
- `src/ui/Diagnosis.test.tsx`（追記）
  - 回答操作で `trackDiagnosisAnswer` が正しい `question_id`/`choice_index` で呼ばれること（モジュールモック）
- 既存テスト・`npm run build`（本番相当）がすべて通ること

## エラー処理

- 計測失敗は診断・画面遷移に影響させない。ラッパー内で例外をすべて握りつぶす。
- 広告ブロッカー等でgtagが読み込まれない環境でも、アプリは完全に動作する（計測だけが欠落する）。

## スコープ外

- Cookie同意バナー（フッター告知のみで対応）
- 5軸ベクトル値そのものの送信（送るのは質問ID・選択肢番号・結果区コードのみ）
- シェアボタン等の追加イベント計測（必要になったら別途）
- Google Tag Manager、サーバーサイド計測
