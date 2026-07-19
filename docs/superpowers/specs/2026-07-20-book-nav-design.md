# 全画面「TOPに戻る」導線（箔押しミニヘッダー） 設計

日付: 2026-07-20 / 対象: `src/ui/`, `src/lib/`, `app/zukan.css`

## 課題

1. 結果ページ（`/result/[slug]/`）にTOP・図鑑へ戻る導線がない。共有リンクで来た閲覧者は「あなたも診断する」以外に行き先がない。
2. 区詳細ページは上部の「← 図鑑にもどる」のみで、長いページのスクロール途中や読了後に戻る手段がない。
3. 絵本の世界観を保ちつつ、TOP・図鑑・診断という複数の行き先へ常にアクセスできるナビゲーションが必要（栞リボン案・蔵書票＋奥付案と比較検討し、箔押しミニヘッダー案を採用。ユーザー確認済み）。

## 決定事項

### 1. ビジュアル（革表紙に金箔の細帯）

- 新規 `src/ui/BookHeader.tsx`。`position: fixed; top: 0` の全幅バー、高さ48px（モバイル44px）。
- 背景は革表紙トーン `rgba(23, 17, 12, 0.92)` ＋ `backdrop-filter: blur(8px)`（追従シェアバーと同じ手法）。下辺に金の細罫 `1px solid rgba(202, 162, 79, 0.55)`。
- 左: ロゴタイプ「❦ うちの区ちゃん」。金 `#e8c56b`・13px・字間0.28em・明朝（bodyフォント継承）。Next `Link` で `href="/"`、`aria-label="トップページにもどる"`。hover/focusで `#f0d693`。
- 右: テキストリンク2つ「診断」→ `/#diagnosis`、「図鑑」→ `/#zukan`。`#caa24f`・12px・字間0.18em・間隔18px。hover/focusで `#f0d693`。
- 区色（`--ward-color`）には連動させない。ヘッダーは「ページの持ち物ではなく本の持ち物」なので全ページ共通の金×革で統一する。
- `z-index: 30`（追従シェアバー40・モーダル50・初回ロード1000より下）。
- ❦（U+2766 FLEURON)は明朝系フォントで字形確認する。tofuになる環境があれば `SectionIcon` 方式のインラインSVG装飾に差し替える。

### 2. スクロール挙動（読んでいる間は消える）

- 表示ルール: **ページ上端付近（scrollY ≤ 120px）では常に表示。それより下では、上スクロールで表示・下スクロールで隠す**。初期表示時は見えている（共有で来た人がすぐ導線に気づける）。
- 判定は純ロジック `src/lib/bookHeader.ts` の `nextHeaderState(state: {anchorY, visible}, y)` reducerとして切り出し、Vitestを先に書く（AGENTS.mdの純ロジック方針）。8px未満の微小スクロールでは状態を変えないヒステリシスを入れる。
- スクロール監視は `passive: true` ＋ rAFスロットルで `BookHeader` 内に実装。
- 出入りは `transform: translateY(-100%) ↔ 0` の0.25s ease。`prefers-reduced-motion: reduce` ではtransitionなしの即時切替。
- キーボード操作対応: ヘッダー内リンクへフォーカスが入ったら（`:focus-within` 相当）、隠れていても強制表示する。
- コンテンツオフセットは不要（`book-section` の上padding 96pxがあるため、48pxのバーが重なっても本文を覆わない）。

### 3. 適用範囲

- `/result/[slug]/`（診断者・共有閲覧者の両方）と `/ward/[slug]/` の `main` 先頭に配置。
- TOP（`/`）には置かない（戻り先自身であり、450vhの3Dヒーロー演出に固定バーを被せない）。`WardModal` にも置かない（×クローズあり）。
- 区詳細ページ既存の「← 図鑑にもどる」リンクは**削除する**（ヘッダーの「図鑑」リンクに役割を統合。残すと導線が重複して冗長なため。ユーザー指示）。あわせて `app/zukan.css` の `.ward-page-back` スタイルも削除する。

## 新規アセット

不要。テキストとCSSのみで実現する。

## テスト・検証

- Vitest:
  - `src/lib/bookHeader.test.ts`: 上端付近で常にtrue、下スクロールでfalse、上スクロールでtrue、8px未満の移動で状態維持
  - ResultPage / WardPage: ヘッダーのリンク3つ（`/`・`/#diagnosis`・`/#zukan`）が正しいhrefで表示されること
  - WardPage: 「← 図鑑にもどる」が削除されていること（既存テストが参照していれば更新する）
  - App（TOP）にヘッダーを置かないことは配置箇所（ResultPage/WardPageのみ）とブラウザ目視で担保（HeroがR3F依存でjsdomレンダリング不可のため自動テストは作らない）
- `npm test` と本番相当 `NEXT_PUBLIC_SITE_URL=... npm run build`
- ブラウザ目視: デスクトップ・モバイル幅（375px）での表示、下/上スクロールでの出入り、追従シェアバー・モーダルとの重なり、❦の字形

## ドキュメント

- `docs/system-design/05-frontend-rendering-design.md` のナビゲーション/導線の節にミニヘッダーを追記する。
