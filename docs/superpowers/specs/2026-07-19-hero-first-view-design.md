# ヒーローファーストビュー改善 設計

日付: 2026-07-19 / 対象: `src/hero/`

## 課題

1. いきなり診断したい人向けのCTAがファーストビューにない。逆にスクロール終盤（Scene4）のCTAは直下の「10問診断」セクションと近接して冗長。
2. 「スクロールでページを進む」の文言だけではスクロールしてほしいことが伝わらない。
3. ファーストビューに引き込み要素が乏しい。

## 決定事項

### 1. プライマリCTA（Scene1タイトル直下）

- `HeroOverlay` のScene1ブロック（タイトル画像＋キャッチコピー）の下に金グラデのピルボタン「いますぐ診断する（約1分）」を追加。`box-shadow` のパルスグローで明滅。
- 表示は既存 `phases.title` に連動（スクロール開始でフェードアウト）。`pointerEvents` は rAF ループで `phases.title > 0.5` のときだけ `auto`。
- クリックは既存 `onCtaClick`（`#diagnosis` への smooth scroll）。
- **Scene4のCTAボタンは削除**し、締めタイトル「23区が、データの地図になった。」＋「▼ つづきは下の図鑑で」の誘導文に簡素化。
- 2Dフォールバックは既存CTAの文言を「いますぐ診断する（10問・約1分）」に揃える。

### 2. アトラクトループ

- 無操作約4秒後、スクロール進捗 t≈0 のとき、進捗に小さなオフセット（最大0.022）をサインウィンドウで往復加算し「ページがめくれかけて戻る」動きを見せる。1周期約2.6秒、休止約2.5秒で繰り返す。
- パルス波形は純関数 `attractPulse(elapsedMs)`（`src/hero/attract.ts`）としてVitestでテスト。
- 統合は `useScrollProgress` 内。ユーザーがスクロールしたら約250msで減衰キャンセル。`?herot=` 強制時と `prefers-reduced-motion` 時は無効。
- スクロールヒントも強化: シェブロン3連の順次フェードアニメ＋文言「下へスクロールして、絵本をめくる」。

### 3. タイトルシマー

- ロゴ `<img>` を relative ラッパーで包み、同サイズのオーバーレイに `mask-image: url(/title-w720.webp)`（アルファ付きRGBA確認済み）を適用。斜めの光帯グラデを約5.5秒周期で走らせる。
- `@media (prefers-reduced-motion: reduce)` でアニメーション停止。keyframes は `HeroOverlay` 内の `<style>` で定義。

### 4. カードチラ見せ

- t=0 でカメラ（z=34, fov=50）の前方左右の画面端に区ちゃんカードを2枚配置: 新宿（左）・渋谷（右）。両区はクローズアップ対象で実画像が優先ロードされる。
- `manifest.ts` に `peek` 設定を追加（**rngは消費しない**＝既存配置を変えない）。
- `cardPose` に peek 項を追加: `w = 1 - smoothstep(0.005, 0.075, t)` で peek位置→通常位置へブレンド。x はアスペクト依存（`tan(fov/2)·dist·aspect` ベース）で縦長画面でも端に収める。sheen を強め、カメラへ正対。
- `CardPose` に `peek: number` を追加し、`HeroCanvas` の可視判定を `inGather || peek有効 || 既存条件` に拡張（低ティアのバンドカット対策）。
- `timeline.test.ts` にテスト追加（t=0で左右の端・t≥0.1で既存挙動と一致・非peekカードは不変）。

## 新規アセット

不要。既存の `title-w720.webp`（アルファ付き）、`/characters/ssr/*.webp`、CSSのみで実現する。

## テスト・検証

- `attract.test.ts` / `timeline.test.ts` 追加分を含む `npm test`
- 本番相当 `npm run build`
- ブラウザでの目視確認（デスクトップ・モバイル幅、`?view=low`）
