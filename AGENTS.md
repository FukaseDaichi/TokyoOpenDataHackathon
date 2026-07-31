# AGENTS.md

このファイルは、このリポジトリで作業するコーディングエージェント向けの現行ガイドである。人間向けの概要・クイックスタート・デプロイ手順は [README.md](README.md) に置き、このファイルにはエージェントが作業判断に使う制約・不変条件・コマンドだけを置く。両者の内容は重複させず、役割を分ける。

## プロジェクト概要

都知事杯オープンデータ・ハッカソン2026の提出作品「うちの区ちゃん」。東京23区をオープンデータの5軸性格ベクトルで分類・擬人化し、10問診断で最も近い区へマッチさせる静的Webアプリである。

アプリは実装済みで、Next.js App Router、TypeScript、Vitest、React Three Fiberを使用する。現在のシステム設計の正典は [docs/system-design/README.md](docs/system-design/README.md)。実装と設計書が食い違う場合は現行コードを調査し、同じ変更で設計書を更新する。

## コマンド

```bash
npm install
npm run dev
npm test

# 本番ビルドとデプロイ（Cloudflare Pages）
NEXT_PUBLIC_SITE_URL=https://uchinokuchan.pages.dev NEXT_PUBLIC_GA_ID=G-XJB4S2R07X npm run build
wrangler pages deploy out --project-name=uchinokuchan

# データ再生成。build_wards.py / build_details.py は openpyxl が必要
/usr/bin/python3 data/build_wards.py
/usr/bin/python3 data/build_details.py
/usr/bin/python3 data/build_geo.py
npm run sync:data
npm run build:diagnosis

# 画像再生成（OGP原本は生成しない。下記「重要な実装制約」を参照）
npm run build:images
npm run build:og
npm run build:icons
node scripts/build-title.mjs
```

## アーキテクチャ

- `app/` — 静的ルートとメタデータ。`/`、`/result/[slug]/`、`/ward/[slug]/`
- `src/domain/` — 5軸と区データの型
- `src/lib/` — 正規化、診断採点、最近傍、順位、k-means、セッション保存の純ロジック
- `src/data/` — アプリへ同梱するJSONとローダー
- `src/ui/` — 診断、図鑑、結果、区詳細、2Dレーダー、2D/3D区地図
- `src/hero/` — スクロール連動3Dヒーロー、品質判定、2Dフォールバック
- `data/raw/` — 取得した公式データ
- `data/processed/` — Pythonジェネレーターの生成物。手編集しない
- `assets/` — キャラクター・タイトル・OGP・区アイコンの原本（`assets/og/` はAI作成のOGP原本、`assets/icons/` はAI作成の区アイコン原本）
- `public/` — 配信用WebPとOGP
- `out/` — `npm run build` の静的成果物。手編集しない

## 重要な実装制約

- `next.config.ts` の `output: 'export'` を維持し、実行時API、DB、認証、SSR依存を追加しない。
- ブラウザで使うデータはビルド時に `src/data/*.json` へ同梱する。リアルタイムAPIへ置き換えない。
- 5軸キーと順序は `src/domain/axes.ts` の `AXIS_KEYS` を正とする。値は `[-1, 1]`。
- 賑わいは昼夜間人口比率のlog min-max、他軸は合成値のmin-max。式は `src/data/wards.ts` と [ドメイン設計](docs/system-design/03-domain-design.md) を参照する。
- 純ロジックは副作用のないTypeScriptモジュールとして保ち、変更時はVitestを先に追加または更新する。
- 診断の5軸ベクトルと結果区コードは `sessionStorage` だけに保存し、個別回答は端末に保存しない。計測のため質問ID・選択肢番号・結果区slugは匿名イベントとしてGA4へ送信する（`src/lib/analytics.ts`。`NEXT_PUBLIC_GA_ID` 未設定時はno-op）。個人を特定する情報は扱わない。
- WebGL非対応、reduced motion、Canvas初期化失敗時の2D導線を維持する。
- UIコピーは日本語。区の表現は中立・前向きにし、地域スティグマにつながる否定的ラベルを避ける。
- `NEXT_PUBLIC_SITE_URL` 未設定でもビルドは通るがOGPが壊れるため、本番ビルドでは必須とする。
- `NEXT_PUBLIC_GA_ID`（GA4測定ID）未設定でもビルド・動作するが計測されない。本番ビルドでは設定する。運用手順は [ビルド・テスト・運用](docs/system-design/06-build-test-operation.md) を参照する。
- OGP画像はコード合成しない。生成AIに依頼して作成した原本を `assets/og/{slug}.png`（トップ用は `home.png`）に置き、`npm run build:og` で1200×630のJPEGへ加工して `public/og/{slug}.jpg` に配置する。プロンプトは [docs/strategy/og-image-prompts.md](docs/strategy/og-image-prompts.md) にある。
- 区章（各区の紋章）は使用しない。著作権はPublic domainだが、新宿区・練馬区は紋章の使用承認要綱、荒川区は届出要綱を持ち、23区一律に適法と確認できないため取りやめた。経緯は [来歴台帳](docs/system-design/08-asset-provenance.md) の2章。代替の区アイコンは生成AIで作成した原本を `assets/icons/{slug}.png` に置き、`npm run build:icons` で `public/icons/{slug}.webp` へ加工する。プロンプトは [docs/strategy/ward-icon-prompts.md](docs/strategy/ward-icon-prompts.md) にある。
- 全ページ共通フッター（`src/ui/SiteFooter.tsx`）の「本サイトは非公式であり、東京都および東京23区の各区とは関係ありません」という表示は削除しない。公式発信との誤認を防ぐための記載である。

## データ更新時の不変条件

- 基本指標、詳細データ、slug、キャラクターはすべて23区分そろえる。
- `data/processed/wards.json` と `src/data/ward-metrics.json` を同一にする。
- `data/processed/ward-details.json` と `src/data/ward-details.json` を同一にする。
- `data/processed/ward-geo.json` と `src/data/ward-geo.json` を同一にする。
- 区コード順は `13101` から `13123`。
- 診断割り当ては全区1%以上10%以下、未校正の距離順位5位以内とし、質問・基本指標・区順序の変更後は `npm run build:diagnosis` で再生成する。
- キャラクター画像は各slugについて512px版、896px版、OGPをそろえる。
- データまたは区マスターの変更後は `npm test` と本番相当の `npm run build` を実行する。

## ドキュメント運用

- 現行システムの説明は `docs/system-design/` に置く。実装手順書や時系列の作業計画は置かない。
- `docs/research/`、`docs/strategy/` は調査・作品検討の資料であり、システム設計書と混在させない。
- `docs/knowledge/` は開発プロセスの振り返りナレッジを置く。現行システムの説明ではないため、システム設計書と混在させない。
- ルート、データ形式、採点式、環境変数、生成手順、フォールバックを変更したら対応するシステム設計書も更新する。
- 現在把握している技術的懸念は [docs/system-design/07-risks-and-concerns.md](docs/system-design/07-risks-and-concerns.md) に集約する。
