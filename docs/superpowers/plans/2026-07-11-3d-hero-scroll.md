# 3Dシネマティック・スクロールヒーロー Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 「うちの区ちゃん診断図鑑」トップページに、2D SSRイラストを板ポリゴンとしてR3F空間へ配置した「魔法の絵本」スクロール演出（450vh・4シーン・決定的タイムライン）を実装する。

**Architecture:** スクロール進捗 `t∈[0,1]` から全演出を純関数で決定するタイムラインモジュール（`src/hero/timeline.ts`）を核に、R3Fはそれを毎フレーム読むだけの薄い描画層とする。カメラ・カード姿勢・シーン透明度はすべて `t` の関数なので逆スクロールで正確に逆再生される。配置はseed付き乱数から生成した固定manifest（23区分）。3D部は `src/hero/` に完全分離し、診断ロジック（未実装のMVP）には触れない。

**Tech Stack:** Next.js 15 (App Router, `output: 'export'`) + TypeScript + three / @react-three/fiber v9 / @react-three/drei + Vitest。画像最適化は sharp（devDependency・ビルド前スクリプトのみ）。

## Global Constraints

- `output: 'export'` 維持。SSR・API Route・DB禁止。Canvasは `next/dynamic` + `ssr: false`
- 追加課金なし（依存は全てOSS npm）
- UIコピーは日本語。区名はWebGL内テクスチャでなくDOMで表示
- 毎レンダー `Math.random()` 禁止 — mulberry32 seeded RNG / 固定manifest
- 原本 `assets/characters/ssr/*.png` は破壊・移動しない。Web配信用は `public/characters/ssr/*.webp` に別生成
- `devicePixelRatio` は最大1.5
- `prefers-reduced-motion: reduce` / WebGL失敗 → 2D絵本フォールバック
- 既存 `data/` `docs/` に影響を与えない
- 禁止デザイン: 円形カルーセル、全カード等速、紫青サイバー空間、スクロールジャック、常時強bloom

## 現状調査サマリ（2026-07-11）

- アプリ未scaffold（package.json無し）→ Task 1でMVP計画Task 1と同一規約の雛形を先に作る
- SSR画像13枚（1024×1536 PNG）: chiyoda, chuo, minato, shinjuku, bunkyo, taito, sumida, koto, shinagawa, meguro, ota, setagaya, shibuya
- **不足10区**: nakano, suginami, toshima, kita, arakawa, itabashi, nerima, adachi, katsushika, edogawa → 絵本風Canvasプレースホルダーで表示
- ファイル名はローマ字slug（設計書の `{ward_id}.png` と不一致）→ manifestでid⇄slug対応

## File Structure

- `package.json` / `next.config.ts` / `tsconfig.json` / `vitest.config.ts` / `app/layout.tsx` / `app/page.tsx` / `app/globals.css` / `src/App.tsx` — 雛形（MVP計画Task 1互換）
- `scripts/build-hero-images.mjs` — sharp: 原本PNG → `public/characters/ssr/{slug}-w512.webp` / `-w896.webp`
- `src/hero/rng.ts` — mulberry32（純関数・テスト対象）
- `src/hero/wards.ts` — 23区の {id, slug|null, name, catch, color} 固定テーブル
- `src/hero/manifest.ts` — 23枚のカード配置manifest（位置・回転・深度バンド・スケール・浮遊位相・クローズアップ枠）。seeded RNGで生成し内容は決定的（テスト対象）
- `src/hero/timeline.ts` — 純関数: `cameraPose(t)` / `scenePhases(t)` / `cardPose(card, t)`（テスト対象）
- `src/hero/quality.ts` — 品質ティア判定（high / low / fallback）
- `src/hero/useScrollProgress.ts` — refベースのスクロール進捗（React state更新なし）
- `src/hero/textures.ts` — 段階的テクスチャロード + 絵本風プレースホルダーCanvasTexture
- `src/hero/CardMaterial.ts` — ホロ光沢シェーダ（エッジマスク付きスイープ、白飛び防止）
- `src/hero/HeroScene.tsx` — R3Fシーン（カード群・粒子・紙背景・カメラ制御、useFrameのみ）
- `src/hero/HeroOverlay.tsx` — DOM UI（タイトル・区名ラベル・CTA・スクロールヒント）
- `src/hero/Hero2DFallback.tsx` — 2D絵本レイヤー + CSSパララックス / 静的図鑑
- `src/hero/Hero.tsx` — 統合: 450vhラッパー + sticky Canvas + ティア分岐 + `onSelectWard`
- Tests: `src/hero/rng.test.ts`, `src/hero/manifest.test.ts`, `src/hero/timeline.test.ts`

## タイムライン設計（すべて t の純関数）

| 区間 | シーン | カメラ | DOM |
|---|---|---|---|
| 0–0.15 | 絵本が開く | z=34→24 直進、暗→紙色 | タイトル浮上→フェード、金粉バースト |
| 0.15–0.65 | 回廊突入 | Catmull-Rom S字（x: 0→+6→-7→+4→0, z: 24→-58） | 近接カードの区名ラベル |
| 0.35–0.8 | クローズアップ | 回廊と重畳。closeup対象カードがガウス窓でカメラ脇へ | 区名+キャッチ、click/tapで詳細 |
| 0.8–1.0 | 星座集結 | 引きへ後退 z→-40, y+3 | タイトル+CTA「10問で、あなたに似ている区ちゃんを診断」 |

- カード姿勢: `corridorPose`（manifest固有）→ `constellationPose`（東京23区の地理配置を星座化した固定23座標）を `smoothstep(0.8, 0.95, t)` でlerp
- クローズアップ: 実画像がある13区から6枚を選び `closeupAt`（t中心値）を割当。影響度 = `exp(-((t-closeupAt)/width)²)` でカメラ相対アンカーへ吸引 + sheen強度に連動
- 浮遊: useFrame内で `sin(clock*speed + phase) * amp` を加算（位相・速度はmanifest固有、reduced時 amp=0、星座整列後は0.3倍）
- 深度バンド: z ∈ {-4, -12, -22, -34, -48, -62} の6段。近景ほどx振幅大
- 逆再生: 全て `t` の関数なので自動的に成立

## Task 1: プロジェクト雛形（MVP計画Task 1互換）

Files: `package.json`, `next.config.ts`, `tsconfig.json`, `vitest.config.ts`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `src/App.tsx`

- [ ] Next.js 15 + TS を手動scaffold（`output: 'export'`、`app/page.tsx` は `src/App.tsx` を描画するだけ）
- [ ] 依存: `next react react-dom three @react-three/fiber @react-three/drei` / dev: `typescript @types/{react,react-dom,node,three} vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom sharp`
- [ ] `npm run build` で `out/index.html` 生成を確認 → commit

## Task 2: 画像最適化パイプライン

Files: `scripts/build-hero-images.mjs`, `public/characters/ssr/*.webp`（生成物をコミット）

- [ ] sharp で13枚 → 512px幅（モバイル/遠景）・896px幅（デスクトップ近景）webp q80 に変換。縦横比2:3維持
- [ ] `package.json` に `"build:images": "node scripts/build-hero-images.mjs"`
- [ ] 原本非破壊を確認（read-only処理）→ commit

## Task 3: 純ロジック（TDD）— rng / wards / manifest / timeline

Files: `src/hero/rng.ts`, `src/hero/wards.ts`, `src/hero/manifest.ts`, `src/hero/timeline.ts` + 各test

テスト（先に書く）:
- rng: 同一seed→同一列、[0,1)範囲
- manifest: 23件・id一意・深度バンド≥5種・全slug付き区にのみ実画像参照・浮遊位相が全カード相異・左右両側に分布・スケールは2:3比
- timeline: 同一入力→同一出力（決定性）、t∈[0,1]全域でNaN/Infinity無し、カメラzが単調減少（回廊区間）、scenePhases境界値（t=0でtitle=1、t=0.3でtitle=0、t=0.85でcta=0、t=1でcta=1）、constellation lockがt=0.8で0 / t=0.95で1

- [ ] failing tests → 実装 → pass → commit

## Task 4: テクスチャ層とプレースホルダー

Files: `src/hero/textures.ts`

- [ ] Canvas 2Dで絵本風プレースホルダー生成（羊皮紙グラデ・金二重罫・コーナー装飾・区名・「SSR 準備中」小札）→ CanvasTexture
- [ ] `createTextureStore(tier)`: 全23枚プレースホルダーで即時開始 → 実画像13枚を優先度順（closeup対象→近景→遠景）に非同期ロードして差し替え。colorSpace=sRGB, anisotropy=4, mipmap
- [ ] commit

## Task 5: R3Fシーン実装

Files: `src/hero/CardMaterial.ts`, `src/hero/HeroScene.tsx`, `src/hero/useScrollProgress.ts`, `src/hero/quality.ts`

- [ ] 光沢シェーダ: `base = texture; sheen = band(uv対角スイープ) × edgeMask × 虹色ランプ; color = base + sheen×strength`（加算は0.35上限で白飛び防止）
- [ ] カード: PlaneGeometry(2,3) + 上記マテリアル + 金縁バックプレーン。姿勢はuseFrameで `cardPose(card, t)` + 浮遊 + マウスtilt（近接時のみ、±4°）+ カメラ方向へのソフトビルボード（slerp 0.35）
- [ ] 粒子: 金粉（Points, additive, 600/150個）+ 紙片（Instanced 40枚）+ 星屑遠景。全てseeded配置、速度はtとclockの関数
- [ ] 背景: 羊皮紙色フォグ + 大型グラデ板 + 雲ビルボード数枚。**紫青サイバー禁止 → 生成りベース+金+深紅茶のパレット**
- [ ] カメラ: useFrameで `cameraPose(t)` 適用。DPR `min(devicePixelRatio, 1.5)`（low: 1.2）
- [ ] raycastクリック→ `onSelectWard(id)`。遠方カードは `visible=false`（バンド距離しきい値）
- [ ] bloom不使用（加算スプライトでグロー表現、モバイル安全）
- [ ] commit

## Task 6: DOMオーバーレイ・フォールバック・統合

Files: `src/hero/HeroOverlay.tsx`, `src/hero/Hero2DFallback.tsx`, `src/hero/Hero.tsx`, `src/App.tsx`

- [ ] Overlay: タイトル/CTA/区名ラベルをrAFで直接style更新（state更新なし）。CTAは `t>0.88` でpointer-events有効・コントラスト確保
- [ ] Hero2DFallback: 紙レイヤー+カードグリッド（実画像webp+プレースホルダーdiv）。motion可ならCSS `transform` パララックス、reduced時は完全静止
- [ ] Hero.tsx: 450vhラッパー + sticky 100vh。`quality.ts` 判定で Canvas / 2D 分岐。WebGLコンテキスト生成失敗もcatchして2Dへ
- [ ] App.tsx: Hero + `onSelectWard` → 簡易詳細パネル（画像+区名+キャッチ+「詳細は診断MVPで拡張」）+ `#diagnosis` スタブセクション
- [ ] commit

## Task 7: 検証

- [ ] `npm test` 全pass
- [ ] `npm run build` → `out/` 生成、`out/characters/ssr/` のwebpパス存在確認
- [ ] ブラウザ: デスクトップ（スクロール往復・click・リサイズ）/ モバイル幅375px / reduced-motion エミュレート
- [ ] スクリーンショット確認 → 見た目調整を最低2回 → commit

## Self-Review

- Spec coverage: 4シーン✅ / 決定的逆再生✅（純関数タイムライン）/ manifest23区✅ / プレースホルダー✅ / 3ティア✅ / DPR制限✅ / 段階ロード✅ / 区名DOM✅ / CTA可読✅ / 診断ロジック非接触✅
- bloomは意図的に不使用（要件は「使う場合は限定」なので適合）
- 不足10区: nakano, suginami, toshima, kita, arakawa, itabashi, nerima, adachi, katsushika, edogawa — 最終報告に記載
