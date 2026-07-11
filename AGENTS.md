# AGENTS.md

このファイルは、このリポジトリで作業するコーディングエージェント向けの現行ガイドである。

## プロジェクト概要

都知事杯オープンデータ・ハッカソン2026の提出作品「うちの区ちゃん診断図鑑」。東京23区をオープンデータの5軸性格ベクトルで分類・擬人化し、10問診断で最も近い区へマッチさせる静的Webアプリである。

アプリは実装済みで、Next.js App Router、TypeScript、Vitest、React Three Fiberを使用する。現在のシステム設計の正典は [docs/system-design/README.md](docs/system-design/README.md)。実装と設計書が食い違う場合は現行コードを調査し、同じ変更で設計書を更新する。

## コマンド

```bash
npm install
npm run dev
npm test
NEXT_PUBLIC_SITE_URL=https://example.pages.dev npm run build

# データ再生成。build_wards.py は openpyxl が必要
/usr/bin/python3 data/build_wards.py
/usr/bin/python3 data/build_details.py
cp data/processed/wards.json src/data/ward-metrics.json
cp data/processed/ward-details.json src/data/ward-details.json

# 画像再生成
npm run build:images
node scripts/build-title.mjs
node scripts/build-og-images.mjs
```

## アーキテクチャ

- `app/` — 静的ルートとメタデータ。`/`、`/result/[slug]/`、`/ward/[slug]/`
- `src/domain/` — 5軸と区データの型
- `src/lib/` — 正規化、診断採点、最近傍、順位、k-means、セッション保存の純ロジック
- `src/data/` — アプリへ同梱するJSONとローダー
- `src/ui/` — 診断、図鑑、結果、区詳細、2D/3Dレーダー
- `src/hero/` — スクロール連動3Dヒーロー、品質判定、2Dフォールバック
- `data/raw/` — 取得した公式データ
- `data/processed/` — Pythonジェネレーターの生成物。手編集しない
- `assets/` — キャラクター・タイトル原本
- `public/` — 配信用WebPとOGP
- `out/` — `npm run build` の静的成果物。手編集しない

## 重要な実装制約

- `next.config.ts` の `output: 'export'` を維持し、実行時API、DB、認証、SSR依存を追加しない。
- ブラウザで使うデータはビルド時に `src/data/*.json` へ同梱する。リアルタイムAPIへ置き換えない。
- 5軸キーと順序は `src/domain/axes.ts` の `AXIS_KEYS` を正とする。値は `[-1, 1]`。
- 賑わいは昼夜間人口比率のlog min-max、他軸は合成値のmin-max。式は `src/data/wards.ts` と [ドメイン設計](docs/system-design/03-domain-design.md) を参照する。
- 純ロジックは副作用のないTypeScriptモジュールとして保ち、変更時はVitestを先に追加または更新する。
- 診断回答は `sessionStorage` だけに保存し、外部送信しない。
- WebGL非対応、reduced motion、Canvas初期化失敗時の2D導線を維持する。
- UIコピーは日本語。区の表現は中立・前向きにし、地域スティグマにつながる否定的ラベルを避ける。
- `NEXT_PUBLIC_SITE_URL` 未設定でもビルドは通るがOGPが壊れるため、本番ビルドでは必須とする。

## データ更新時の不変条件

- 基本指標、詳細データ、slug、キャラクターはすべて23区分そろえる。
- `data/processed/wards.json` と `src/data/ward-metrics.json` を同一にする。
- `data/processed/ward-details.json` と `src/data/ward-details.json` を同一にする。
- 区コード順は `13101` から `13123`。
- キャラクター画像は各slugについて512px版、896px版、OGPをそろえる。
- データまたは区マスターの変更後は `npm test` と本番相当の `npm run build` を実行する。

## ドキュメント運用

- 現行システムの説明は `docs/system-design/` に置く。実装手順書や時系列の作業計画は置かない。
- `docs/research/`、`docs/strategy/`、`docs/ideas/` は調査・作品検討の資料であり、システム設計書と混在させない。
- ルート、データ形式、採点式、環境変数、生成手順、フォールバックを変更したら対応するシステム設計書も更新する。
- 現在把握している技術的懸念は [docs/system-design/07-risks-and-concerns.md](docs/system-design/07-risks-and-concerns.md) に集約する。
