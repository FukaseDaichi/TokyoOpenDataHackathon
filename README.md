# 東京都オープンデータ・ハッカソン 攻略リポジトリ

公式: https://odhackathon.metro.tokyo.lg.jp

## 目的
最優秀・上位入賞を本気で狙う。調査 → 戦略 → アイディア → 実装を段階的に進める。

## アプリ「うちの区ちゃん診断図鑑」

23区をオープンデータの5軸性格ベクトルで分類・擬人化し、10問診断で「あなたに一番似ている区ちゃん」に出会える静的Webアプリ。

### 開発

```bash
npm install
npm run test    # ロジック・UIのユニットテスト（Vitest）
npm run dev     # ローカル開発（http://localhost:3000）
npm run build   # out/ に静的成果物（Next.js 静的エクスポート）
```

### デプロイ（Cloudflare Pages）

- Build command: `npm run build`
- Build output directory: `out`
- 独自ドメインは使わず `*.pages.dev` を利用（追加課金なし）。
- 実行時のサーバAPI/DBなし。全データはビルド時に静的バンドル。

### データ

- 実オープンデータのスナップショット: `data/processed/wards.json`（再生成は `/usr/bin/python3 data/build_wards.py`）
- アプリはそのコピー `src/data/ward-metrics.json` から5軸を合成（`src/data/wards.ts`）:
  賑わい=昼夜間人口比率(log)／成熟=高齢化率−年少率／みどり=一人当たり公立公園面積／世帯=子育て−単身世帯率／華やぎ=財政力指数
- 出典: 令和2年国勢調査・住民基本台帳・都建設局公園調書・総務省主要財政指標

### ページ構成
- `/` — 3Dヒーロー＋10問診断＋図鑑
- `/result/{slug}/` — 診断結果（23区、OGP付き。シェア着地）
- `/ward/{slug}/` — 区の詳細（オープンデータ深堀り: 順位・地価ほか）

OGP画像の再生成: `node scripts/build-og-images.mjs`
詳細データの再集計: `/usr/bin/python3 data/build_details.py`
デプロイ時は `NEXT_PUBLIC_SITE_URL` に公開URLを設定（OGPの絶対URL用）。

## 前提（プロフィール・制約）
- 参加形式: ソロ（35歳・フルスタックエンジニア／強み＝データ処理・分析）
- 投下時間: 30〜60h ／ コスト: 追加課金なし（無料枠で完成）
- 狙い: 最優秀・上位入賞

## 勝ち筋の基本式
> 勝てるアイディア ＝ (評価軸で高得点) × (強み・制約で完成できる) × (データの裏付け) × (競合と被らない)

## ドキュメント構成（AIでアイディアを練るときの読ませ方）

| 読む順 | ファイル | 中身 | 埋める空欄 |
|---|---|---|---|
| 1 | [research/00-summary.md](docs/research/00-summary.md) | **結論サマリ**（まずこれをAIに読ませる） | 全体 |
| 2 | [research/01-contest.md](docs/research/01-contest.md) | 大会ルール・審査5軸・審査員・日程・特典 | 評価軸 |
| 3 | [research/02-winners-and-competition.md](docs/research/02-winners-and-competition.md) | 過去受賞作の型・レッドオーシャン・勝率感 | 評価軸＋差別化 |
| 4 | [research/03-open-data.md](docs/research/03-open-data.md) | 使えるオープンデータ棚卸し（都＋外部、2026-07-10時点） | データ |
| 5 | [research/04-tech-stack.md](docs/research/04-tech-stack.md) | 無料で完成させる技術スタック | 実現可能性 |
| 6 | [strategy/winning-strategy.md](docs/strategy/winning-strategy.md) | 勝ち筋の言語化（統合） | — |
| 7 | [ideas/idea-candidates.md](docs/ideas/idea-candidates.md) | アイディア候補（確定: 案A「うちの区ちゃん」） | — |

```
docs/
├── research/   # 事実: 調査結果（00=結論、01〜04=根拠）
├── strategy/   # 統合: 勝ち筋の言語化
└── ideas/      # 出力: アイディア候補
assets/
├── screenshots/    # 過去作・データ画面のスクショ
└── data-samples/   # DLしたデータのサンプル
```

## 現在地（フェーズ）
1. 調査 ✅（2026-07-10 再調査反映済み）
2. 統合 ✅（勝ち筋 = 「うちの区ちゃん」＝区擬人化×予算トレードオフのデータ駆動シム）
3. 発散・選定 ✅（案Aに具体化）
4. **実装（MVP実装計画）← いまここ**。ただし2026テーマ（7/10公開予定・未公開）確認後に題材を微調整。

## 直近TODO
- [ ] 公式 [/issues/](https://odhackathon.metro.tokyo.lg.jp/issues/)＋X(@tokyo_odh) でテーマ公開を確認
- [ ] 7/16 19:00 公式「特典フル活用ガイド」視聴（Cloudflare/OpenCodeの詳細）
- [ ] エントリー（締切 **7/27 17:00**）
- [ ] データ kill test ／推計モデル骨組み／キャラ差分パイプライン／動画テンプレ（前倒し準備）
