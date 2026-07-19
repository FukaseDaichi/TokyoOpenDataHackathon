# 全画面「TOPに戻る」導線（蔵書票＋奥付） 設計

日付: 2026-07-20 / 対象: `src/ui/`, `app/zukan.css`

## 課題

1. 結果ページ（`/result/[slug]/`）にTOP・図鑑へ戻る導線がない。共有リンクで来た閲覧者は「あなたも診断する」以外に行き先がない。
2. 区詳細ページは上部の「← 図鑑にもどる」のみで、読み終えたページ末尾に導線がない。
3. 絵本の世界観を保つため、固定ヘッダーや常時表示のフローティングUIは置かない（栞リボン案・ミニヘッダー案と比較検討し、固定UIなしの蔵書票＋奥付案を採用。ユーザー確認済み）。

## 決定事項

### 1. 蔵書票（ページ先頭）

- 新規 `src/ui/BookNav.tsx` に `ExLibris` コンポーネントを実装。Next `Link` で `href="/"`。
- 表示: 中央揃え「❦ うちの区ちゃん」。12px・字間0.3em・基調色 `var(--w-accent-dark, #b8923f)`（周囲の既存リンクと同じ区連動アクセント）。
- `aria-label="トップページにもどる"`。上下paddingでタップ領域を44px相当確保。hover/focusで `#f0d693` に明るく。`:focus-visible` は金アウトライン。
- 配置:
  - ResultPage: `book-section-inner` の先頭（eyebrow「SHINDAN RESULT」の上）。
  - WardPage: `book-section-inner` の先頭に中央配置。既存の「← 図鑑にもどる」リンクはその下に現状のまま残す。

### 2. 奥付ナビ（ページ末尾）

- 同ファイルに `ColophonNav` コンポーネントを実装。`<nav aria-label="ページの奥付">`。
- 構成: 金の破線罫（`1px dashed rgba(184,146,63,0.55)`）＋中央に ❦ 飾り＋リンク3つ:
  - 「表紙にもどる」→ `/`
  - 「図鑑をひらく」→ `/#zukan`
  - 診断リンク → `/#diagnosis`。ラベルはprop `diagnosisLabel` で切替:
    - ResultPage 診断者: 「もういちど診断する」
    - ResultPage 共有閲覧者: 「あなたも診断する」
    - WardPage: 「診断をやってみる」
- スタイル: 12〜13px・`#e8c56b`・字間0.14em。中央揃えの `flex-wrap` 行、リンク間は「・」区切りではなくgapで分離（折返し時に区切り記号が行頭に残るのを避ける）。各リンクに `padding: 10px 12px` でタップ領域確保。hoverで下線＋ `#f0d693`。
- 配置:
  - ResultPage: 最終シェアCTA（`result-final-cta`）の後、`book-section-inner` 末尾。モバイルの追従シェアバーとの重なりは既存の `.has-share-bar { padding-bottom: 110px }` で回避済み（追加対応不要）。
  - WardPage: 「出典」セクションの後、`ward-page-main` 末尾。

### 3. 適用範囲

- `/result/[slug]/`（診断者・共有閲覧者の両方）と `/ward/[slug]/` に適用。
- TOP（`/`）は戻り先自身のため置かない。`WardModal` は×クローズがあるため置かない。

### 4. 世界観・アニメーション

- 固定表示なし・アニメーションなしの静的リンク（`prefers-reduced-motion` 対応が新たに必要になる動きは追加しない）。
- ❦（U+2766 FLEURON）は明朝系フォントで字形確認する。tofu（豆腐）になる環境があれば `SectionIcon` 方式のインラインSVG装飾に差し替える。

## 新規アセット

不要。テキストとCSSのみで実現する。

## テスト・検証

- Vitest（RTL）:
  - ResultPage: 蔵書票リンク（`href="/"`）表示、奥付3リンクのhref、診断者/共有閲覧者でのラベル切替（もういちど診断する/あなたも診断する）
  - WardPage: 蔵書票と奥付の表示、既存「← 図鑑にもどる」の維持
  - App（TOP）: 蔵書票・奥付が出ないこと
- `npm test` と本番相当 `NEXT_PUBLIC_SITE_URL=... npm run build`
- ブラウザ目視: デスクトップ・モバイル幅（375px）で奥付の折返しとシェアバー非干渉、❦の字形

## ドキュメント

- `docs/system-design/05-frontend-rendering-design.md` のナビゲーション/導線の節に蔵書票・奥付を追記する。
