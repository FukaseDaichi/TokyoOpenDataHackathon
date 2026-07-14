# うちの区ちゃん診断図鑑

東京23区をオープンデータの5軸性格ベクトルで分類・擬人化し、10問の回答から「あなたに一番似ている区ちゃん」を提示する静的Webアプリです。都知事杯オープンデータ・ハッカソン2026の提出作品として開発しています。

公開サイト: <https://uchinokuchan.pages.dev>

## できること

- **10問診断** — 暮らしの好みに答えると、5軸ベクトルの距離で一番近い区ちゃんとマッチします。
- **23区図鑑** — 全区のキャラクターと性格タイプを一覧できます。
- **区詳細データ** — 各区のオープンデータ指標、23区内順位、同系統の区を確認できます。
- **共有** — 診断結果はOGP画像つきのURLでXへ共有できます。

すべてNext.js App Routerの静的エクスポートで生成し、実行時のAPI、データベース、認証はありません。個別の回答内容は保存・送信しません。

## ページ構成

- `/` — 3D/2Dヒーロー、10問診断、23区図鑑
- `/result/{slug}/` — 23区分の診断結果・共有着地ページ
- `/ward/{slug}/` — 23区分の詳細データページ

## 開発を始める

```bash
npm install
npm run dev     # http://localhost:3000
npm test        # Vitest
```

## デプロイ

Cloudflare Pagesへ静的成果物を配信します。OGPの絶対URLを生成するため、本番ビルドでは公開サイトのルートURLを必ず指定します。

```bash
NEXT_PUBLIC_SITE_URL=https://uchinokuchan.pages.dev npm run build
wrangler pages deploy out --project-name=uchinokuchan
```

## データ・画像の更新

区のデータや画像を更新する手順、更新時の検証項目は設計書にまとめています。

- データの生成・同期・検証 — [データ設計](docs/system-design/04-data-design.md)
- 画像アセットの原本と生成物 — [フロントエンド・描画設計](docs/system-design/05-frontend-rendering-design.md)
- コマンド一覧と品質ゲート — [ビルド・テスト・運用設計](docs/system-design/06-build-test-operation.md)

OGP画像はスクリプトで合成せず、AIで作成した原本(`assets/og/`)を1200×630に加工して `public/og/` へ配置します。

## ドキュメント

現行コードを基準にした設計書は [docs/system-design/README.md](docs/system-design/README.md) から辿れます。

- [システム全体設計](docs/system-design/01-system-overview.md)
- [アプリケーション設計](docs/system-design/02-application-design.md)
- [ドメイン・診断設計](docs/system-design/03-domain-design.md)
- [データ設計](docs/system-design/04-data-design.md)
- [フロントエンド・描画設計](docs/system-design/05-frontend-rendering-design.md)
- [ビルド・テスト・運用設計](docs/system-design/06-build-test-operation.md)
- [現行コードの懸念事項](docs/system-design/07-risks-and-concerns.md)

そのほかのディレクトリ:

- `docs/research/` — 大会、競合、データ、技術の調査
- `docs/strategy/` — 作品設計とキャラクター設定
- `docs/ideas/` — アイデア資料
- `docs/submission/` — 大会提出物の要件とフォーム回答案

コーディングエージェント向けの作業ガイドは [AGENTS.md](AGENTS.md)(`CLAUDE.md` から参照)にあります。

大会公式サイト: <https://odhackathon.metro.tokyo.lg.jp>
