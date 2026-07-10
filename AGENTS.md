# AGENTS.md

This file provides guidance to Claude Code (claude.ai/code) and other coding agents when working with code in this repository.

## プロジェクト概要

都知事杯オープンデータ・ハッカソン2026（https://odhackathon.metro.tokyo.lg.jp）の攻略リポジトリ。ソロ参加・30〜60h・追加課金なしで最優秀を狙う。

提出作品は **「うちの区ちゃん診断図鑑」** に確定済み：東京23区をオープンデータの5軸性格ベクトルで分類・擬人化し、10問診断で「あなたに一番似ている区ちゃん」にマッチさせる静的Webアプリ。狙う賞はオーディエンス賞（バズ）が本命。

現在のフェーズ: **調査・戦略・データkill test完了 → MVP実装**。アプリ本体（Next.js + TypeScript）はまだ生成されておらず、実装計画は [docs/superpowers/plans/2026-07-11-kuchan-shindan-zukan-mvp.md](docs/superpowers/plans/2026-07-11-kuchan-shindan-zukan-mvp.md) に記載。

## コマンド

```bash
# 23区×5軸データセットの再生成（data/raw/ → data/processed/wards.json, wards.csv）
/usr/bin/python3 data/build_wards.py
```

アプリ実装開始後は **Next.js（App Router・`output: 'export'` による静的エクスポート）+ TypeScript + Vitest** を使用（`npm run test` = `vitest run`、`npm run build` で `out/` に静的サイト生成）。SSR・API Routes・サーバーコンポーネントの動的機能は使わない（DBレス制約のため）。詳細はMVP実装計画を参照。

## リポジトリ構成

- `docs/research/` — 事実・調査結果。`00-summary.md`（結論サマリ、まず読む）→ 01=大会ルール・審査5軸、02=過去受賞作と競合、03=オープンデータ棚卸し、04=技術スタック
- `docs/strategy/` — 確定設計。[kuchan-shindan-zukan-design.md](docs/strategy/kuchan-shindan-zukan-design.md) が作品の設計・戦略の正典。[ward-character-profiles.md](docs/strategy/ward-character-profiles.md) にキャラ設定
- `docs/data/` — [axis-kill-test.md](docs/data/axis-kill-test.md)（5軸×23区の実データ検証、合格済み）、[data-inventory.md](docs/data/data-inventory.md)
- `docs/superpowers/plans/` — 実装計画
- `data/raw/` — ダウンロードした生データ（国勢調査・住民基本台帳・公園調書・財政指標など）。エンコーディングは utf-8-sig と cp932 が混在
- `data/processed/` — 生成物（wards.json / wards.csv）。手編集せず `build_wards.py` で再生成する
- `assets/characters/ssr/` — 区ちゃんキャラ画像（生成済み分）

## データアーキテクチャ（5軸）

軸キーは5本で固定。各値は正規化後 `[-1, 1]`。

| 軸キー | 意味 | 採用指標 | 出典 |
|---|---|---|---|
| `liveliness` | 静↔賑 | 昼夜間人口比率 | 令和2年国勢調査 |
| `maturity` | 若↔熟 | 高齢化率・年少人口率 | 住民基本台帳 |
| `greenery` | 都会↔みどり | 一人当たり公立公園面積 | 都建設局 公園調書 |
| `family` | 単身↔ファミリー | 単身世帯率・子育て世帯率 | 令和2年国勢調査 |
| `luxury` | 堅実↔華やか | 財政力指数 | 総務省 主要財政指標 |

指標選定の注意点（[axis-kill-test.md](docs/data/axis-kill-test.md) に根拠）:
- 賑わい軸は千代田区1355%が支配的なため、正規化はlogスケールを使う
- みどり軸は国民公園（皇居）・公団を除いた公立公園合計を使う

## 実装時の制約（設計ドキュメントで確定済み）

- **DBレス・静的**: 実行時のサーバAPI/DBアクセス禁止。全データはビルド時に静的JSONへ。Cloudflare Pages（`*.pages.dev`）にデプロイ
- **リアルタイムAPI禁止**: 年次〜数年更新の確定値のみ。スナップショットをリポジトリ同梱
- **無料のみ**: 追加課金・独自ドメイン購入なし
- **データ根拠の担保**: 各区の性格・系統は必ず実データの関数。個別ページに根拠数値を表示
- **地域スティグマ回避**: 性格・系統名は優劣でなく個性として中立・前向きに。否定的ラベル禁止
- **UIコピーは日本語**
- 純ロジック（正規化・採点・最近傍・k-means）は副作用のないTSモジュールに分離しTDDで固める。UIはReactの薄い層
