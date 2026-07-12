# システム設計書

このフォルダは、稼働対象である「うちの区ちゃん診断図鑑」の現行設計をまとめる。記載内容の正は現行ソースコードと設定ファイルであり、将来案、実装手順、検討経緯は扱わない。

## 読み方

| 文書 | 対象 |
|---|---|
| [01-system-overview.md](01-system-overview.md) | システム境界、技術構成、ディレクトリ責務 |
| [02-application-design.md](02-application-design.md) | URL、画面、状態、コンポーネント構成 |
| [03-domain-design.md](03-domain-design.md) | 5軸、診断採点、マッチング、クラスタリング |
| [04-data-design.md](04-data-design.md) | オープンデータ、生成パイプライン、更新方法 |
| [05-frontend-rendering-design.md](05-frontend-rendering-design.md) | 3Dヒーロー、フォールバック、アセット、アクセシビリティ |
| [06-build-test-operation.md](06-build-test-operation.md) | ビルド、テスト、デプロイ、運用手順 |
| [07-risks-and-concerns.md](07-risks-and-concerns.md) | 現行コードの懸念点と対応優先度 |

## 文書の境界

- `docs/system-design/`: 現在のシステムを説明する保守対象の設計書
- `docs/research/`: 大会・競合・技術などの調査結果
- `docs/strategy/`: 作品コンセプトとキャラクター戦略
- `docs/ideas/`: アイデア資料
- `docs/submission/`: 大会提出物の要件とフォーム回答案

システムの実装を変更した場合は、同じ変更で該当する設計書も更新する。特にルート、データ形式、採点式、環境変数、生成コマンドの変更は文書更新を必須とする。
