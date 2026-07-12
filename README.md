# うちの区ちゃん診断図鑑

東京23区をオープンデータの5軸性格ベクトルで分類・擬人化し、10問の回答から「あなたに一番似ている区ちゃん」を提示する静的Webアプリです。都知事杯オープンデータ・ハッカソン2026の提出作品として開発しています。

## システム設計

現行コードを基準にした設計書は [docs/system-design/README.md](docs/system-design/README.md) にあります。

- [システム全体設計](docs/system-design/01-system-overview.md)
- [アプリケーション設計](docs/system-design/02-application-design.md)
- [ドメイン・診断設計](docs/system-design/03-domain-design.md)
- [データ設計](docs/system-design/04-data-design.md)
- [フロントエンド・描画設計](docs/system-design/05-frontend-rendering-design.md)
- [ビルド・テスト・運用設計](docs/system-design/06-build-test-operation.md)
- [現行コードの懸念事項](docs/system-design/07-risks-and-concerns.md)

## 開発

```bash
npm install
npm run dev     # http://localhost:3000
npm test        # Vitest
npm run build   # out/ に静的サイトを生成
```

本番相当のビルドでは、OGPの絶対URLを生成するため公開サイトのルートURLを指定します。

```bash
NEXT_PUBLIC_SITE_URL=https://example.pages.dev npm run build
```

## ページ

- `/` — 3D/2Dヒーロー、10問診断、23区図鑑
- `/result/{slug}/` — 23区分の診断結果・共有着地ページ
- `/ward/{slug}/` — 23区分の詳細データページ

すべてNext.js App Routerの静的エクスポートで生成します。実行時のAPI、データベース、認証はありません。

## データ更新

```bash
/usr/bin/python3 data/build_wards.py
/usr/bin/python3 data/build_details.py
/usr/bin/python3 data/build_geo.py

cp data/processed/wards.json src/data/ward-metrics.json
cp data/processed/ward-details.json src/data/ward-details.json
cp data/processed/ward-geo.json src/data/ward-geo.json

npm test
npm run build
```

`data/raw/` は取得した公式データ、`data/processed/` は集計生成物、`src/data/` はアプリへ同梱するスナップショットです。指標、出典、同期時の注意は [データ設計](docs/system-design/04-data-design.md) を参照してください。

## 画像更新

```bash
npm run build:images             # キャラクターPNG → 512/896px WebP
node scripts/build-modal-images.mjs # モーダル表紙など
node scripts/build-title.mjs     # タイトル画像
node scripts/build-og-images.mjs # 23区分のOGP画像
```

OGPはmacOSのヒラギノ明朝を使うため、同じ見た目での再生成はmacOSを前提とします。

## ドキュメント

- `docs/system-design/` — 現行システムの設計書
- `docs/research/` — 大会、競合、データ、技術の調査
- `docs/strategy/` — 作品設計とキャラクター設定
- `docs/ideas/` — アイデア資料
- `docs/submission/` — 大会提出物の要件とフォーム回答案

大会公式サイト: <https://odhackathon.metro.tokyo.lg.jp>
