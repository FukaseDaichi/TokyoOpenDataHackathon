# 東京都オープンデータ・ハッカソン 攻略リポジトリ

公式: https://odhackathon.metro.tokyo.lg.jp

## 目的
最優秀・上位入賞を本気で狙う。そのための調査 → 戦略 → アイディア出しを段階的に進める。

## 前提（プロフィール・制約）
- 参加形式: ソロ（35歳・フルスタックエンジニア）
- 投下時間: 30〜60h
- コスト: 追加課金は極力なし（無料枠で完成させる）
- 狙い: 最優秀・上位入賞

## 勝ち筋の基本式
> 勝てるアイディア ＝ (評価軸で高得点) × (強み・制約で完成できる) × (データの裏付け) × (競合と被らない)

各調査は必ずこの4つの「空欄」のどれかを埋めるために行う。

## 進捗ダッシュボード

| # | 調査項目 | 優先度 | 状態 | ファイル |
|---|---------|--------|------|---------|
| 1 | 大会ルールと評価軸 | 最優先 | ✅ 完了 | [01-rules-and-criteria.md](docs/research/01-rules-and-criteria.md) |
| 2 | 過去の受賞作分析 | 最優先 | ✅ 完了 | [02-past-winners.md](docs/research/02-past-winners.md) |
| 3 | 使えるオープンデータの棚卸し | 最優先 | ✅ 完了 | [03-open-data-catalog.md](docs/research/03-open-data-catalog.md) |
| 4 | 審査員と東京都の政策的関心 | 高 | ✅ 完了 | [04-judges-and-policy.md](docs/research/04-judges-and-policy.md) |
| 5 | 競合・参加者の傾向 | 中 | ✅ 完了 | [05-competition.md](docs/research/05-competition.md) |
| 6 | 無料で完成させる技術スタック＆コスト | 高 | ✅ 完了 | [06-tech-and-cost.md](docs/research/06-tech-and-cost.md) |
| - | 調査サマリ（結論） | - | ✅ 完了 | [00-summary.md](docs/research/00-summary.md) |
| - | 別視点クロスチェック（codex） | - | ✅ 完了 | [07-cross-check-codex.md](docs/research/07-cross-check-codex.md) |
| - | 勝ち筋の言語化（統合） | - | ✅ 完了 | [winning-strategy.md](docs/strategy/winning-strategy.md) |
| - | アイディア候補（出力） | - | ✅ 完了 | [idea-candidates.md](docs/ideas/idea-candidates.md) |

## フォルダ構成
```
.
├── docs/
│   ├── research/   # 事実: 調査結果（このフェーズの主役）
│   ├── strategy/   # 統合: 勝ち筋の言語化
│   └── ideas/      # 出力: アイディア候補
└── assets/
    ├── screenshots/    # 過去作・データ画面のスクショ
    └── data-samples/   # DLしたデータのサンプル
```

## 進め方（フェーズ）
1. **調査**（research/ を埋める）✅ 完了（01〜06＋00-summary）
2. **統合**（strategy/winning-strategy.md に勝ち筋をまとめる）✅ 完了
3. **発散**（ideas/idea-candidates.md でアイディアを出す）✅ 完了（案A「うちの区ちゃん」に具体化）
4. **選定 → 実装**（MVP実装計画）← いまここ

> 確定コンセプトは「うちの区ちゃん」＝区擬人化×予算トレードオフのデータ駆動シム（[strategy](docs/strategy/winning-strategy.md)／[idea](docs/ideas/idea-candidates.md)）。次は MVP の実装計画。
