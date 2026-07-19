# ビルド・テスト・運用設計

## 1. 開発環境

Node.js依存関係は `package-lock.json` を使って再現する。GitHub ActionsではNode.js 24と `npm ci` を使う。Python集計はPython 3を使い、`build_wards.py` と `build_details.py` が `openpyxl` を必要とする。`build_geo.py` はPython標準ライブラリだけを使う。画像生成はNode.js依存のSharpを使う。

```bash
npm install
npm run dev
```

ローカル開発サーバーは `http://localhost:3000` で起動する。

## 2. package scripts

| コマンド | 実体 | 用途 |
|---|---|---|
| `npm run dev` | `next dev` | 開発サーバー |
| `npm test` | `vitest run` | 全単体テスト |
| `npm run test:watch` | `vitest` | 監視テスト |
| `npm run build` | `next build` | 型検査を含む静的ビルド、`out/` 出力 |
| `npm run build:diagnosis` | `vite-node scripts/build-diagnosis-assignments.ts` | 全回答パターンの校正済み診断割り当てを再生成 |
| `npm run build:images` | `node scripts/build-hero-images.mjs` | キャラクターWebP生成 |
| `npm run build:og` | `node scripts/build-og-images.mjs` | OGP用JPEG生成（`assets/og/*.png` → `public/og/*.jpg`） |
| `npm run start` | `next start` | package上は存在するが、静的エクスポートの配信手順には使わない |

モーダル用画像とタイトルの生成はpackage scriptsに登録されていないため、直接実行する。

```bash
node scripts/build-modal-images.mjs
node scripts/build-title.mjs
```

OGPの原本はスクリプトで合成しない。AIで作成した原本を `assets/og/{slug}.png` に置き、`npm run build:og` で1200×630のJPEGへ加工して `public/og/{slug}.jpg` に配置する（[05-frontend-rendering-design.md](05-frontend-rendering-design.md) を参照）。

## 3. テスト構成

Vitestは `src/**/*.test.{ts,tsx}` をjsdom環境で実行する。

| 分類 | 主な検証対象 |
|---|---|
| ドメイン | 軸キー、空ベクトル |
| 純ロジック | 正規化、採点、診断校正、距離、ランキング、タイプ命名、k-means、順位、配色、SEO、セッション、初回ロード |
| データ | 23区カバレッジ、代表値、正規化範囲、詳細・地理・政策・設定理由・相性文・タイプ特徴、slug対応 |
| ヒーロー | seed乱数、manifestのアセット・配置、タイムライン |
| UI | 診断進行、図鑑、モーダル開閉、結果、区詳細、2D地図、地図フォールバック、初回ロード、X共有文面、シェアカード |

現行テストは純関数と主要コンポーネントの振る舞いを対象とし、実ブラウザE2E、WebGL描画結果、スクリーンショット差分、アクセシビリティ自動監査は対象外である。

## 4. 品質ゲート

変更を配信可能と判断する最小ゲートは次の2つである。

```bash
npm test
NEXT_PUBLIC_SITE_URL=https://<公開ホスト> npm run build
```

`npm run build` は型エラーと静的ページ生成失敗を検出し、トップ、結果23ページ、区詳細23ページを `out/` へ出力する。`NEXT_PUBLIC_SITE_URL` を設定しないビルドも成功するが、OGP画像の絶対URLがlocalhost基準になるため配信不可とみなす。

データまたは画像を変更した場合は、追加で次を確認する。

- `data/processed/*.json` と `src/data/*.json` が一致する（`ward-geo.json` を含む）。
- 23区すべてにキャラクター原本PNG、512px・896pxのWebP、OGP原本PNG、配信用OGP JPEGが存在し、トップ用 `home.png` / `home.jpg` も存在する。
- `?view=high`、`?view=low`、`?view=2d` で主要導線が動く。ヒーローに加え、区詳細ページの「東京のどこにいる？」地図も3D/2Dが切り替わることを確認する。
- `/result/{slug}/` と `/ward/{slug}/` の代表ページを直接開ける。
- X共有画面へ渡すURLとOGPが公開ホストを指す。

## 5. デプロイ

Cloudflare Pagesへ静的成果物を配信する。

| 設定 | 値 |
|---|---|
| Build command | `npm run build` |
| Build output directory | `out` |
| Environment variable | `NEXT_PUBLIC_SITE_URL=https://<公開ホスト>` |
| Runtime API / Functions | 使用しない |

公開URLは末尾パスを含まないサイトルートを設定する。現在の公開URLは `https://uchinokuchan.pages.dev` である。

`.github/workflows/deploy.yml` がCIと本番デプロイを担当する。

| イベント | 動作 |
|---|---|
| `pull_request`（対象: `main`） | `npm ci`、`npm test`、本番URLを設定した `npm run build`。Cloudflareへはデプロイしない |
| `push`（対象: `main`） | 上記の品質ゲート通過後、`out/`を本番Pagesへデプロイ |
| `workflow_dispatch`（`main`から実行） | 上記と同じ本番デプロイを手動実行 |

本番デプロイは `cloudflare/wrangler-action` とWrangler 4.111.0を使い、GitHub Deploymentsにも結果を記録する。同じrefの古い実行はキャンセルし、新しいコミットを優先する。GitHub Actionsには次のrepository secretが必要であり、値をコードやログへ出力しない。

| Secret | 内容 |
|---|---|
| `CLOUDFLARE_ACCOUNT_ID` | Pagesプロジェクトを所有するCloudflareアカウントID |
| `CLOUDFLARE_API_TOKEN` | Account / Cloudflare Pages / Edit権限を持つAPIトークン |

Cloudflare Pagesプロジェクト名は `uchinokuchan`、production branchは `main` とする。workflowの `NEXT_PUBLIC_SITE_URL` は `https://uchinokuchan.pages.dev` に固定し、fork由来を含むPull RequestにはCloudflare secretを渡さない。

Wrangler CLIから直接デプロイする場合は次を実行する。

```bash
NEXT_PUBLIC_SITE_URL=https://uchinokuchan.pages.dev npm run build
npx wrangler pages deploy out --project-name=uchinokuchan --branch=main
```

## 6. データ更新運用

データ更新は [04-data-design.md](04-data-design.md) の生成・同期・検証を行ってから通常の品質ゲートを通す。取得元の公表時点が指標ごとに異なるため、全ファイルを一律の年度へそろえるのではなく、JSONの `sources` と画面の出典が実ファイルの時点を正しく示すことを確認する。

次の指標は取得元が年次公表であり、公表のたびに更新可否を確認する。

| 指標 | 取得元・公表周期 |
|---|---|
| `waiting_children`（待機児童数） | 東京都福祉局「保育サービスの状況」、例年8月頃に4月1日現在分を公表 |
| `crime_per_1000`（犯罪統計） | 警視庁の区市町村別犯罪認知件数、年次 |
| `income_per_taxpayer`（課税対象所得） | 総務省「市町村税課税状況等の調」、年次 |
| `population`（住民基本台帳人口） | 東京都「住民基本台帳による世帯と人口」、年次（他の基本5軸の年齢別人口とも同じ取得元） |

境界ジオメトリ（`data/raw/N03-21_13_city.topojson` → `build_geo.py`）と手動キュレーション（`src/data/ward-policies.json`、`public/emblems/*.svg`）は行政区域や区の基本構想が変わらない限り再取得の必要が薄く、上記の年次更新とは別に見直す（更新運用は [04-data-design.md](04-data-design.md) 末尾を参照）。

## 7. 障害時の確認順

1. 静的ファイルが `out/` に生成されているか確認する。
2. `NEXT_PUBLIC_SITE_URL` とOGP画像パスを確認する。
3. ブラウザコンソールでWebGL初期化またはアセット404を確認する。
4. `?view=2d` でフォールバック導線が動くか確認する。
5. `src/data` と `data/processed` の差分、23区件数、slug対応を確認する。
6. 診断結果だけの問題なら `sessionStorage` の `kuchan.diagnosis` を消して再診断する。
