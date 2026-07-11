# 診断結果URL化＋区詳細ページ 設計スペック（2026-07-11）

## 目的

1. 診断結果を23区ごとの固定URL（`/result/{slug}/`）にし、Xシェアで区ごとのOGPカードを出す（バズ導線の強化）。
2. 興味を持った人向けに、区ごとの詳細ページ（`/ward/{slug}/`）を追加し、オープンデータの深堀り情報を載せる。

## URL構成（Next.js静的エクスポート・実ルート）

| ルート | 生成数 | 役割 |
|---|---|---|
| `/` | 1 | 現行（3Dヒーロー＋診断＋図鑑） |
| `/result/[slug]/` | 23 | 診断結果ページ。シェアの着地点 |
| `/ward/[slug]/` | 23 | 区の詳細ページ（データ深堀り） |

- slugは `src/hero/wards.ts` の既存ローマ字slug（chiyoda, chuo, minato, …）を使う。
- `generateStaticParams` で23件を列挙。`next.config.ts` に `trailingSlash: true` を追加（Cloudflare Pagesでの `…/index.html` 解決を確実にする）。
- ページはサーバコンポーネント（`generateMetadata` のため）＋クライアント部品の組み合わせ。実行時のAPI/DBアクセスは引き続きゼロ。

## 診断フロー変更

- `Diagnosis` 完了時: 回答から `userVector` を計算 → `sessionStorage['kuchan.diagnosis']` に `{ vector, ts }` を保存 → `router.push('/result/{bestMatchSlug}/')`。
- `/result/{slug}/` の表示分岐（クライアント側で sessionStorage を読む）:
  - **本人**（vectorあり）: 区ちゃん紹介＋レーダーに自分のベクトルを重ね描き＋にてる度TOP3＋Xシェア＋「くわしく見る」→ `/ward/{slug}/`
  - **受け手**（vectorなし）: 区ちゃん紹介＋「あなたも診断する」CTA（`/#diagnosis` へ）＋「くわしく見る」
- Xシェア文言・URLは `/result/{slug}/` を指す。

## OGP

- 各 `/result/[slug]/` と `/ward/[slug]/` に `generateMetadata` で区ごとの title / description / og:image / twitter:card=summary_large_image を設定。
- OG画像（1200×630 PNG）はビルド前スクリプト `scripts/build-og-images.mjs`（sharp）で生成し `public/og/{slug}.png` にコミット同梱:
  - 羊皮紙背景＋SSR立ち絵＋タイトルロゴ＋「◯◯区ちゃんタイプ」テキスト。
- OGPの絶対URLは環境変数 `NEXT_PUBLIC_SITE_URL`（未設定時は相対でビルドは通す。デプロイ時に `*.pages.dev` URLを設定）。

## 詳細ページ `/ward/[slug]/` の内容

1. キャラヒーロー: SSR立ち絵・キャッチ・系統・レーダー（既存 `WardDetail` の部品を再構成）。
2. 「データで見る◯◯区」— 各指標を **値＋23区中順位＋23区平均比の横バー** で表示:
   - 既存7指標（昼夜間人口比率・高齢化率・年少人口率・一人当たり公園面積・単身世帯率・子育て世帯率・財政力指数）
   - **地価公示**（手元 `data/raw/chika_r7_chiten.csv` の区別平均、新規集計）
   - **外国人人口比率**（住民基本台帳シリーズ、新規DL）
   - **駅別乗降人員**（区内トップ駅TOP3を表示、新規DL＋駅→区マッピング）
3. 同じ系統の仲間（リンク付きミニカード）。
4. 出典リスト（データ名・出典・時点）。
5. 図鑑モーダルに「くわしく見る →」リンクを追加。

## データパイプライン

- `data/build_details.py`（新規、`/usr/bin/python3`）:
  - 地価: `chika_r7_chiten.csv` を区別平均（円/㎡）に集計。
  - 外国人人口: 住基台帳（区別外国人数/総人口）を取得し比率算出。
  - 駅別乗降人員: 都カタログ等のCSVを取得し、駅→区マッピングで区内TOP3駅を抽出。
  - 出力: `data/processed/ward-details.json` → スナップショットを `src/data/ward-details.json` に同梱。
- **品質ゲート（kill test）**: 新規データは「23区揃う・欠損ゼロ・単位/時点明記」を通過したものだけ採用。通らない指標はその指標だけ落とす（診断5軸には影響なし）。スティグマ回避（順位はネガティブ表現にしない。例: 高齢化率が高い→「成熟した街」）。

## 変更影響（既存コード）

- `src/App.tsx`: 結果表示（`Result`/`ShareCard`）を `/result/` ページへ移設。診断完了時は遷移に変更。
- `src/ui/Result.tsx` / `ShareCard.tsx`: 結果ページ用に再構成（本人/受け手分岐）。
- `Radar`: ユーザーベクトルの重ね描き（2ポリゴン）対応。
- 図鑑モーダル: 詳細ページへのリンク追加（モーダル自体は残す）。

## テスト

- 純ロジック: 順位計算・平均比・詳細データローダ（TDD）。
- UI: 結果ページの本人/受け手分岐、詳細ページの指標表示（RTL）。
- ビルド: `npm run build` で47ページ以上の静的出力と `public/og/` の23枚を確認。

## スコープ外

- 系統の日本語命名、シェア画像のクライアントサイドPNG化、犯罪・経済センサス等の追加データ。
