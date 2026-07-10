# うちの区ちゃん診断図鑑（MVP）Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 23区をオープンデータの性格軸ベクトルで表し、10問診断で最も近い区ちゃんにマッチさせ、2D図鑑で全区の特性を閲覧・シェアできる静的Webアプリの動く最小版を作る。

**Architecture:** 純ロジック（正規化・診断採点・最近傍マッチング・クラスタリング）を副作用のないTypeScriptモジュールに分離しTDDで固める。UIはReactの薄い層で、静的JSON（23区の軸ベクトル）を読むだけ。DBもサーバAPIも持たず、Cloudflare Pagesに静的デプロイする。

**Tech Stack:** Vite + React 18 + TypeScript + Vitest（+ @testing-library/react, jsdom）。デプロイは Cloudflare Pages（`*.pages.dev`）。

## Global Constraints

- **DBレス・静的化**：実行時のサーバAPI/DBアクセス禁止。全データはビルド時に静的JSONへ。
- **リアルタイムAPI禁止**：使うデータは年次〜数年更新の確定値。スナップショットをリポジトリ同梱。
- **無料のみ**：追加課金なし。独自ドメインを買わない（`*.pages.dev`）。
- **データ根拠の担保**：各区の性格・系統は必ず実データの関数。個別ページに根拠数値を必ず表示。
- **地域スティグマ回避**：性格・系統名は優劣でなく個性として中立・前向きに。否定的ラベル禁止。
- **UIコピーは日本語**。
- **軸キーは5本で固定**：`liveliness`（静↔賑）/ `maturity`（若↔熟）/ `greenery`（都会↔みどり）/ `family`（単身↔ファミリー）/ `luxury`（堅実↔華やか）。各値は正規化後 `[-1, 1]`。
- **設計の出典**：[docs/strategy/kuchan-shindan-zukan-design.md](../../strategy/kuchan-shindan-zukan-design.md)
- **スコープ外（別プラン）**：3Dビジュアライズ、系統名の高度な自動命名、実オープンデータのkill test後の本データ差し替え。本プランは2D MVPと固定fixtureデータで動く状態までを作る。

---

## File Structure

- `package.json`, `vite.config.ts`, `tsconfig.json`, `vitest.config.ts` — プロジェクト設定
- `src/domain/axes.ts` — 軸キー定義・型（`AxisKey`, `AXIS_KEYS`, `AxisVector`, `Ward`）
- `src/lib/normalize.ts` — 指標配列の正規化（純関数）
- `src/lib/quiz.ts` — 診断質問の型・定義・採点（純関数）
- `src/lib/matching.ts` — 距離・最近傍・相性ランキング（純関数）
- `src/lib/cluster.ts` — k-meansによる系統分類（純関数・決定的）
- `src/data/ward-vectors.fixture.json` — 23区の軸ベクトル固定データ（開発用）
- `src/data/wards.ts` — fixture読込＋系統付与のロード関数
- `scripts/build-ward-data.ts` — 生CSV→軸ベクトルJSON生成（実データ差し替え用の骨格）
- `src/ui/Zukan.tsx` — 2D図鑑グリッド
- `src/ui/WardDetail.tsx` — 個別ページ（レーダー＋根拠数値）
- `src/ui/Radar.tsx` — 5軸レーダーチャート（SVG）
- `src/ui/Diagnosis.tsx` — 10問診断フロー
- `src/ui/Result.tsx` — 結果＋相性TOP3
- `src/ui/ShareCard.tsx` — シェア画像生成
- `src/App.tsx`, `src/main.tsx` — 画面ルーティング（トップ→図鑑/診断）

---

### Task 1: プロジェクト雛形とドメイン型

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `vitest.config.ts`, `index.html`, `src/main.tsx`, `src/App.tsx`
- Create: `src/domain/axes.ts`
- Test: `src/domain/axes.test.ts`

**Interfaces:**
- Produces: `AxisKey`, `AXIS_KEYS: AxisKey[]`, `AxisVector = Record<AxisKey, number>`, `Ward { code: string; name: string; axes: AxisVector; group?: string }`, `emptyVector(): AxisVector`

- [ ] **Step 1: Scaffold Vite React TS project**

Run:
```bash
npm create vite@latest . -- --template react-ts
npm install
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```
Expected: `src/`, `package.json` 生成。

- [ ] **Step 2: Configure Vitest (jsdom)**

Create `vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: { environment: 'jsdom', globals: true, setupFiles: [] },
});
```
Add to `package.json` scripts: `"test": "vitest run"`, `"test:watch": "vitest"`.

- [ ] **Step 3: Write the failing test for domain types**

Create `src/domain/axes.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { AXIS_KEYS, emptyVector } from './axes';

describe('axes domain', () => {
  it('has exactly 5 axis keys in fixed order', () => {
    expect(AXIS_KEYS).toEqual(['liveliness', 'maturity', 'greenery', 'family', 'luxury']);
  });
  it('emptyVector returns 0 for every axis', () => {
    const v = emptyVector();
    expect(AXIS_KEYS.every((k) => v[k] === 0)).toBe(true);
  });
});
```

- [ ] **Step 4: Run test to verify it fails**

Run: `npm test -- src/domain/axes.test.ts`
Expected: FAIL（`./axes` が存在しない）。

- [ ] **Step 5: Implement domain types**

Create `src/domain/axes.ts`:
```ts
export type AxisKey = 'liveliness' | 'maturity' | 'greenery' | 'family' | 'luxury';

export const AXIS_KEYS: AxisKey[] = ['liveliness', 'maturity', 'greenery', 'family', 'luxury'];

export const AXIS_LABELS: Record<AxisKey, { low: string; high: string }> = {
  liveliness: { low: '静か', high: '賑やか' },
  maturity: { low: '若い', high: '成熟' },
  greenery: { low: '都会的', high: 'みどり' },
  family: { low: 'おひとりさま', high: 'ファミリー' },
  luxury: { low: '堅実', high: '華やか' },
};

export type AxisVector = Record<AxisKey, number>;

export interface Ward {
  code: string;
  name: string;
  axes: AxisVector;
  group?: string;
}

export function emptyVector(): AxisVector {
  return { liveliness: 0, maturity: 0, greenery: 0, family: 0, luxury: 0 };
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npm test -- src/domain/axes.test.ts`
Expected: PASS。

- [ ] **Step 7: Commit**

```bash
git add package.json vite.config.ts tsconfig.json vitest.config.ts index.html src/
git commit -m "feat: scaffold project and axis domain types"
```

---

### Task 2: 指標の正規化ライブラリ

**Files:**
- Create: `src/lib/normalize.ts`
- Test: `src/lib/normalize.test.ts`

**Interfaces:**
- Consumes: なし
- Produces: `minMaxToSignedUnit(values: number[]): number[]` — 各値を配列内min→-1, max→+1に線形マップ。全要素同値なら全て0。

- [ ] **Step 1: Write the failing test**

Create `src/lib/normalize.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { minMaxToSignedUnit } from './normalize';

describe('minMaxToSignedUnit', () => {
  it('maps min to -1, max to +1, mid to 0', () => {
    expect(minMaxToSignedUnit([0, 5, 10])).toEqual([-1, 0, 1]);
  });
  it('returns all zeros when every value is equal', () => {
    expect(minMaxToSignedUnit([4, 4, 4])).toEqual([0, 0, 0]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/lib/normalize.test.ts`
Expected: FAIL（module未定義）。

- [ ] **Step 3: Write minimal implementation**

Create `src/lib/normalize.ts`:
```ts
export function minMaxToSignedUnit(values: number[]): number[] {
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (max === min) return values.map(() => 0);
  return values.map((v) => ((v - min) / (max - min)) * 2 - 1);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/lib/normalize.test.ts`
Expected: PASS。

- [ ] **Step 5: Commit**

```bash
git add src/lib/normalize.ts src/lib/normalize.test.ts
git commit -m "feat: add min-max signed-unit normalization"
```

---

### Task 3: 診断質問の定義と採点

**Files:**
- Create: `src/lib/quiz.ts`
- Test: `src/lib/quiz.test.ts`

**Interfaces:**
- Consumes: `AxisKey`, `AXIS_KEYS`, `AxisVector`, `emptyVector` from `src/domain/axes.ts`
- Produces:
  - `QuizOption { label: string; deltas: Partial<AxisVector> }`
  - `QuizQuestion { id: string; text: string; options: QuizOption[] }`
  - `QUESTIONS: QuizQuestion[]`（10問）
  - `scoreAnswers(questions: QuizQuestion[], answers: number[]): AxisVector` — 各軸ごとに、その軸にdeltaを持つ回答の平均を取る。回答が範囲外/未回答なら無視。

- [ ] **Step 1: Write the failing test**

Create `src/lib/quiz.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { scoreAnswers, QUESTIONS, type QuizQuestion } from './quiz';

const sample: QuizQuestion[] = [
  { id: 'q1', text: '?', options: [
    { label: 'A', deltas: { liveliness: 1 } },
    { label: 'B', deltas: { liveliness: -1 } },
  ] },
  { id: 'q2', text: '?', options: [
    { label: 'A', deltas: { liveliness: 1, greenery: -1 } },
    { label: 'B', deltas: { greenery: 1 } },
  ] },
];

describe('scoreAnswers', () => {
  it('averages deltas per axis across answered questions', () => {
    // q1->A(liveliness+1), q2->A(liveliness+1, greenery-1)
    const v = scoreAnswers(sample, [0, 0]);
    expect(v.liveliness).toBe(1); // (1+1)/2
    expect(v.greenery).toBe(-1);  // (-1)/1
    expect(v.maturity).toBe(0);   // untouched
  });
  it('ignores out-of-range answers', () => {
    const v = scoreAnswers(sample, [5, 1]);
    expect(v.liveliness).toBe(0); // only q2->B touches nothing for liveliness
    expect(v.greenery).toBe(1);
  });
});

describe('QUESTIONS', () => {
  it('has exactly 10 questions, each with >=2 options', () => {
    expect(QUESTIONS).toHaveLength(10);
    expect(QUESTIONS.every((q) => q.options.length >= 2)).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/lib/quiz.test.ts`
Expected: FAIL（module未定義）。

- [ ] **Step 3: Write minimal implementation**

Create `src/lib/quiz.ts`:
```ts
import { AXIS_KEYS, type AxisKey, type AxisVector, emptyVector } from '../domain/axes';

export interface QuizOption {
  label: string;
  deltas: Partial<AxisVector>;
}
export interface QuizQuestion {
  id: string;
  text: string;
  options: QuizOption[];
}

export function scoreAnswers(questions: QuizQuestion[], answers: number[]): AxisVector {
  const sum = emptyVector();
  const count: Record<AxisKey, number> = { liveliness: 0, maturity: 0, greenery: 0, family: 0, luxury: 0 };
  questions.forEach((q, i) => {
    const opt = q.options[answers[i]];
    if (!opt) return;
    for (const key of AXIS_KEYS) {
      const d = opt.deltas[key];
      if (d !== undefined) {
        sum[key] += d;
        count[key] += 1;
      }
    }
  });
  const result = emptyVector();
  for (const key of AXIS_KEYS) result[key] = count[key] ? sum[key] / count[key] : 0;
  return result;
}

// 10問。各回答は対応軸に +1 / -1 を与える。UIコピーは日本語。
export const QUESTIONS: QuizQuestion[] = [
  { id: 'q1', text: '休日の理想は？', options: [
    { label: '賑やかな街を歩き回る', deltas: { liveliness: 1 } },
    { label: '静かに家や近所で過ごす', deltas: { liveliness: -1 } },
  ] },
  { id: 'q2', text: '住むなら？', options: [
    { label: '緑や公園が多い場所', deltas: { greenery: 1 } },
    { label: '駅前で何でも揃う都会', deltas: { greenery: -1 } },
  ] },
  { id: 'q3', text: '暮らしのスタイルは？', options: [
    { label: '家族・仲間とわいわい', deltas: { family: 1 } },
    { label: '一人の時間を大切に', deltas: { family: -1 } },
  ] },
  { id: 'q4', text: 'お金の使い方は？', options: [
    { label: '堅実にコツコツ', deltas: { luxury: -1 } },
    { label: '良いものに華やかに', deltas: { luxury: 1 } },
  ] },
  { id: 'q5', text: '好きな街の雰囲気は？', options: [
    { label: '新しく若々しい', deltas: { maturity: -1 } },
    { label: '落ち着いて成熟した', deltas: { maturity: 1 } },
  ] },
  { id: 'q6', text: '夜の過ごし方は？', options: [
    { label: '外食や繁華街へ', deltas: { liveliness: 1 } },
    { label: '家でゆっくり', deltas: { liveliness: -1 } },
  ] },
  { id: 'q7', text: '週末の買い物は？', options: [
    { label: '大型商業施設やブランド', deltas: { luxury: 1 } },
    { label: '地元の商店街やスーパー', deltas: { luxury: -1 } },
  ] },
  { id: 'q8', text: '子育て環境の優先度は？', options: [
    { label: '高い（家族向け重視）', deltas: { family: 1 } },
    { label: '低い（身軽さ重視）', deltas: { family: -1 } },
  ] },
  { id: 'q9', text: '通勤・通学は？', options: [
    { label: '職住近接でアクティブに', deltas: { liveliness: 1, greenery: -1 } },
    { label: '郊外からのんびり', deltas: { liveliness: -1, greenery: 1 } },
  ] },
  { id: 'q10', text: '街に求めるのは？', options: [
    { label: '刺激と最先端', deltas: { maturity: -1, luxury: 1 } },
    { label: '安定と暮らしやすさ', deltas: { maturity: 1, luxury: -1 } },
  ] },
];
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/lib/quiz.test.ts`
Expected: PASS。

- [ ] **Step 5: Commit**

```bash
git add src/lib/quiz.ts src/lib/quiz.test.ts
git commit -m "feat: add quiz definition and answer scoring"
```

---

### Task 4: 距離・最近傍・相性ランキング

**Files:**
- Create: `src/lib/matching.ts`
- Test: `src/lib/matching.test.ts`

**Interfaces:**
- Consumes: `AXIS_KEYS`, `AxisVector`, `Ward` from `src/domain/axes.ts`
- Produces:
  - `distance(a: AxisVector, b: AxisVector): number` — ユークリッド距離
  - `MatchResult { ward: Ward; distance: number }`
  - `rankMatches(user: AxisVector, wards: Ward[]): MatchResult[]` — 距離昇順
  - `bestMatch(user: AxisVector, wards: Ward[]): Ward`

- [ ] **Step 1: Write the failing test**

Create `src/lib/matching.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { distance, rankMatches, bestMatch } from './matching';
import { emptyVector, type Ward } from '../domain/axes';

const wardAt = (name: string, liveliness: number): Ward => ({
  code: name, name, axes: { ...emptyVector(), liveliness },
});

describe('matching', () => {
  it('computes euclidean distance', () => {
    const a = { ...emptyVector(), liveliness: 0 };
    const b = { ...emptyVector(), liveliness: 1 };
    expect(distance(a, b)).toBe(1);
  });
  it('ranks nearest ward first', () => {
    const wards = [wardAt('far', 1), wardAt('near', 0.1)];
    const user = { ...emptyVector(), liveliness: 0 };
    const ranked = rankMatches(user, wards);
    expect(ranked[0].ward.name).toBe('near');
    expect(bestMatch(user, wards).name).toBe('near');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/lib/matching.test.ts`
Expected: FAIL（module未定義）。

- [ ] **Step 3: Write minimal implementation**

Create `src/lib/matching.ts`:
```ts
import { AXIS_KEYS, type AxisVector, type Ward } from '../domain/axes';

export function distance(a: AxisVector, b: AxisVector): number {
  let s = 0;
  for (const key of AXIS_KEYS) {
    const d = a[key] - b[key];
    s += d * d;
  }
  return Math.sqrt(s);
}

export interface MatchResult {
  ward: Ward;
  distance: number;
}

export function rankMatches(user: AxisVector, wards: Ward[]): MatchResult[] {
  return wards
    .map((ward) => ({ ward, distance: distance(user, ward.axes) }))
    .sort((a, b) => a.distance - b.distance);
}

export function bestMatch(user: AxisVector, wards: Ward[]): Ward {
  return rankMatches(user, wards)[0].ward;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/lib/matching.test.ts`
Expected: PASS。

- [ ] **Step 5: Commit**

```bash
git add src/lib/matching.ts src/lib/matching.test.ts
git commit -m "feat: add distance and nearest-ward matching"
```

---

### Task 5: 系統クラスタリング（k-means・決定的）

**Files:**
- Create: `src/lib/cluster.ts`
- Test: `src/lib/cluster.test.ts`

**Interfaces:**
- Consumes: `AXIS_KEYS`, `AxisVector`, `Ward` from `src/domain/axes.ts`; `distance` from `src/lib/matching.ts`
- Produces: `kmeans(wards: Ward[], k: number, iterations?: number): number[]` — 各区のクラスタindexを返す。初期centroidは先頭k区（決定的）。

- [ ] **Step 1: Write the failing test**

Create `src/lib/cluster.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { kmeans } from './cluster';
import { emptyVector, type Ward } from '../domain/axes';

const w = (name: string, liveliness: number): Ward => ({
  code: name, name, axes: { ...emptyVector(), liveliness },
});

describe('kmeans', () => {
  it('separates two obvious clusters', () => {
    // 2 low + 2 high on liveliness, k=2, seeds = first 2 (one low, one high)
    const wards = [w('lowA', -1), w('highA', 1), w('lowB', -0.9), w('highB', 0.9)];
    const labels = kmeans(wards, 2);
    expect(labels[0]).toBe(labels[2]); // lowA, lowB same cluster
    expect(labels[1]).toBe(labels[3]); // highA, highB same cluster
    expect(labels[0]).not.toBe(labels[1]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/lib/cluster.test.ts`
Expected: FAIL（module未定義）。

- [ ] **Step 3: Write minimal implementation**

Create `src/lib/cluster.ts`:
```ts
import { AXIS_KEYS, type AxisVector, type Ward } from '../domain/axes';
import { distance } from './matching';

export function kmeans(wards: Ward[], k: number, iterations = 20): number[] {
  let centroids: AxisVector[] = wards.slice(0, k).map((wd) => ({ ...wd.axes }));
  let assignments = new Array(wards.length).fill(0);

  for (let iter = 0; iter < iterations; iter++) {
    assignments = wards.map((wd) => {
      let best = 0;
      let bestD = Infinity;
      centroids.forEach((c, ci) => {
        const d = distance(wd.axes, c);
        if (d < bestD) {
          bestD = d;
          best = ci;
        }
      });
      return best;
    });

    for (let ci = 0; ci < k; ci++) {
      const members = wards.filter((_, i) => assignments[i] === ci);
      if (members.length === 0) continue;
      const c = {} as AxisVector;
      for (const key of AXIS_KEYS) {
        c[key] = members.reduce((s, m) => s + m.axes[key], 0) / members.length;
      }
      centroids[ci] = c;
    }
  }
  return assignments;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/lib/cluster.test.ts`
Expected: PASS。

- [ ] **Step 5: Commit**

```bash
git add src/lib/cluster.ts src/lib/cluster.test.ts
git commit -m "feat: add deterministic k-means ward grouping"
```

---

### Task 6: 固定データと区ロード関数

**Files:**
- Create: `src/data/ward-vectors.fixture.json`
- Create: `src/data/wards.ts`
- Test: `src/data/wards.test.ts`

**Interfaces:**
- Consumes: `Ward`, `AXIS_KEYS` from `src/domain/axes.ts`; `kmeans` from `src/lib/cluster.ts`
- Produces:
  - `loadWards(): Ward[]` — fixtureを読み、`kmeans(wards, 6)` で `group` を `系統1`..`系統6` として付与して返す
  - `GROUP_COUNT = 6`

- [ ] **Step 1: Create fixture data (23 wards)**

Create `src/data/ward-vectors.fixture.json`（23区・各軸 `[-1,1]` の暫定値。実データkill test後に差し替え）:
```json
[
  { "code": "13101", "name": "千代田区", "axes": { "liveliness": 1.0, "maturity": 0.6, "greenery": -0.2, "family": -0.8, "luxury": 1.0 } },
  { "code": "13102", "name": "中央区", "axes": { "liveliness": 0.9, "maturity": 0.2, "greenery": -0.6, "family": -0.3, "luxury": 0.9 } },
  { "code": "13103", "name": "港区", "axes": { "liveliness": 0.8, "maturity": 0.1, "greenery": 0.0, "family": -0.2, "luxury": 1.0 } },
  { "code": "13104", "name": "新宿区", "axes": { "liveliness": 1.0, "maturity": 0.0, "greenery": -0.3, "family": -0.6, "luxury": 0.4 } },
  { "code": "13105", "name": "文京区", "axes": { "liveliness": -0.2, "maturity": 0.5, "greenery": 0.3, "family": 0.4, "luxury": 0.3 } },
  { "code": "13106", "name": "台東区", "axes": { "liveliness": 0.6, "maturity": 0.7, "greenery": -0.2, "family": 0.0, "luxury": -0.2 } },
  { "code": "13107", "name": "墨田区", "axes": { "liveliness": 0.3, "maturity": 0.5, "greenery": -0.1, "family": 0.3, "luxury": -0.4 } },
  { "code": "13108", "name": "江東区", "axes": { "liveliness": 0.2, "maturity": -0.3, "greenery": 0.2, "family": 0.5, "luxury": 0.1 } },
  { "code": "13109", "name": "品川区", "axes": { "liveliness": 0.4, "maturity": 0.0, "greenery": 0.0, "family": 0.2, "luxury": 0.3 } },
  { "code": "13110", "name": "目黒区", "axes": { "liveliness": 0.1, "maturity": 0.2, "greenery": 0.3, "family": 0.1, "luxury": 0.7 } },
  { "code": "13111", "name": "大田区", "axes": { "liveliness": 0.0, "maturity": 0.3, "greenery": 0.2, "family": 0.4, "luxury": -0.1 } },
  { "code": "13112", "name": "世田谷区", "axes": { "liveliness": -0.3, "maturity": 0.1, "greenery": 0.6, "family": 0.8, "luxury": 0.4 } },
  { "code": "13113", "name": "渋谷区", "axes": { "liveliness": 1.0, "maturity": -0.4, "greenery": 0.1, "family": -0.5, "luxury": 0.9 } },
  { "code": "13114", "name": "中野区", "axes": { "liveliness": 0.3, "maturity": 0.0, "greenery": -0.2, "family": -0.4, "luxury": -0.1 } },
  { "code": "13115", "name": "杉並区", "axes": { "liveliness": -0.2, "maturity": 0.2, "greenery": 0.5, "family": 0.5, "luxury": 0.1 } },
  { "code": "13116", "name": "豊島区", "axes": { "liveliness": 0.7, "maturity": -0.1, "greenery": -0.3, "family": -0.4, "luxury": 0.2 } },
  { "code": "13117", "name": "北区", "axes": { "liveliness": 0.0, "maturity": 0.6, "greenery": 0.1, "family": 0.3, "luxury": -0.5 } },
  { "code": "13118", "name": "荒川区", "axes": { "liveliness": 0.1, "maturity": 0.6, "greenery": -0.1, "family": 0.4, "luxury": -0.6 } },
  { "code": "13119", "name": "板橋区", "axes": { "liveliness": -0.1, "maturity": 0.3, "greenery": 0.3, "family": 0.5, "luxury": -0.4 } },
  { "code": "13120", "name": "練馬区", "axes": { "liveliness": -0.4, "maturity": 0.1, "greenery": 0.7, "family": 0.7, "luxury": -0.2 } },
  { "code": "13121", "name": "足立区", "axes": { "liveliness": -0.2, "maturity": 0.4, "greenery": 0.4, "family": 0.6, "luxury": -0.7 } },
  { "code": "13122", "name": "葛飾区", "axes": { "liveliness": -0.3, "maturity": 0.5, "greenery": 0.4, "family": 0.6, "luxury": -0.7 } },
  { "code": "13123", "name": "江戸川区", "axes": { "liveliness": -0.3, "maturity": -0.2, "greenery": 0.5, "family": 0.8, "luxury": -0.5 } }
]
```

- [ ] **Step 2: Write the failing test**

Create `src/data/wards.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { loadWards, GROUP_COUNT } from './wards';
import { AXIS_KEYS } from '../domain/axes';

describe('loadWards', () => {
  const wards = loadWards();
  it('loads all 23 wards', () => {
    expect(wards).toHaveLength(23);
  });
  it('every ward has all 5 axes in [-1,1] and a group', () => {
    for (const w of wards) {
      for (const k of AXIS_KEYS) {
        expect(w.axes[k]).toBeGreaterThanOrEqual(-1);
        expect(w.axes[k]).toBeLessThanOrEqual(1);
      }
      expect(w.group).toBeTruthy();
    }
  });
  it('produces at most GROUP_COUNT distinct groups', () => {
    const groups = new Set(wards.map((w) => w.group));
    expect(groups.size).toBeLessThanOrEqual(GROUP_COUNT);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm test -- src/data/wards.test.ts`
Expected: FAIL（module未定義）。

- [ ] **Step 4: Write minimal implementation**

Create `src/data/wards.ts`:
```ts
import type { Ward } from '../domain/axes';
import { kmeans } from '../lib/cluster';
import fixture from './ward-vectors.fixture.json';

export const GROUP_COUNT = 6;

export function loadWards(): Ward[] {
  const base = (fixture as Ward[]).map((w) => ({ ...w }));
  const labels = kmeans(base, GROUP_COUNT);
  return base.map((w, i) => ({ ...w, group: `系統${labels[i] + 1}` }));
}
```

Ensure `tsconfig.json` has `"resolveJsonModule": true`.

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- src/data/wards.test.ts`
Expected: PASS。

- [ ] **Step 6: Commit**

```bash
git add src/data/ tsconfig.json
git commit -m "feat: add 23-ward fixture data and grouped loader"
```

---

### Task 7: レーダーチャートと図鑑・個別ページ

**Files:**
- Create: `src/ui/Radar.tsx`, `src/ui/Zukan.tsx`, `src/ui/WardDetail.tsx`
- Test: `src/ui/Zukan.test.tsx`

**Interfaces:**
- Consumes: `loadWards` from `src/data/wards.ts`; `AXIS_KEYS`, `AXIS_LABELS`, `Ward`, `AxisVector` from `src/domain/axes.ts`
- Produces:
  - `Radar({ vector }: { vector: AxisVector }): JSX.Element` — 5軸SVGレーダー
  - `Zukan({ onSelect }: { onSelect: (w: Ward) => void }): JSX.Element` — 23区グリッド
  - `WardDetail({ ward }: { ward: Ward }): JSX.Element` — キャラ枠＋レーダー＋根拠数値＋系統

- [ ] **Step 1: Write the failing test**

Create `src/ui/Zukan.test.tsx`:
```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Zukan } from './Zukan';

describe('Zukan', () => {
  it('renders all 23 ward names', () => {
    render(<Zukan onSelect={() => {}} />);
    expect(screen.getByText('千代田区')).toBeInTheDocument();
    expect(screen.getByText('江戸川区')).toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(23);
  });
});
```

Add `import '@testing-library/jest-dom';` at top of the test (or in a setup file referenced by `vitest.config.ts`).

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/ui/Zukan.test.tsx`
Expected: FAIL（`./Zukan` 未定義）。

- [ ] **Step 3: Implement Radar**

Create `src/ui/Radar.tsx`:
```tsx
import { AXIS_KEYS, AXIS_LABELS, type AxisVector } from '../domain/axes';

export function Radar({ vector }: { vector: AxisVector }) {
  const size = 220;
  const c = size / 2;
  const r = size / 2 - 30;
  const n = AXIS_KEYS.length;
  const pt = (i: number, value: number) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const radius = ((value + 1) / 2) * r; // [-1,1] -> [0,r]
    return [c + radius * Math.cos(angle), c + radius * Math.sin(angle)];
  };
  const poly = AXIS_KEYS.map((k, i) => pt(i, vector[k]).join(',')).join(' ');
  return (
    <svg width={size} height={size} role="img" aria-label="性格レーダー">
      <polygon points={AXIS_KEYS.map((_, i) => pt(i, 1).join(',')).join(' ')} fill="none" stroke="#ccc" />
      <polygon points={poly} fill="rgba(80,140,255,0.4)" stroke="#508cff" />
      {AXIS_KEYS.map((k, i) => {
        const [x, y] = pt(i, 1.25);
        return <text key={k} x={x} y={y} fontSize="10" textAnchor="middle">{AXIS_LABELS[k].high}</text>;
      })}
    </svg>
  );
}
```

- [ ] **Step 4: Implement Zukan and WardDetail**

Create `src/ui/Zukan.tsx`:
```tsx
import { loadWards } from '../data/wards';
import type { Ward } from '../domain/axes';

const WARDS = loadWards();

export function Zukan({ onSelect }: { onSelect: (w: Ward) => void }) {
  return (
    <div className="zukan-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(120px,1fr))', gap: 8 }}>
      {WARDS.map((w) => (
        <button key={w.code} onClick={() => onSelect(w)} aria-label={w.name}>
          <div>{w.name}</div>
          <small>{w.group}</small>
        </button>
      ))}
    </div>
  );
}
```

Create `src/ui/WardDetail.tsx`:
```tsx
import { AXIS_KEYS, AXIS_LABELS, type Ward } from '../domain/axes';
import { Radar } from './Radar';

export function WardDetail({ ward }: { ward: Ward }) {
  return (
    <div>
      <h2>{ward.name}ちゃん</h2>
      <p>系統：{ward.group}</p>
      <Radar vector={ward.axes} />
      <h3>データ根拠</h3>
      <ul>
        {AXIS_KEYS.map((k) => (
          <li key={k}>
            {AXIS_LABELS[k].low}〜{AXIS_LABELS[k].high}：{ward.axes[k].toFixed(2)}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- src/ui/Zukan.test.tsx`
Expected: PASS。

- [ ] **Step 6: Commit**

```bash
git add src/ui/Radar.tsx src/ui/Zukan.tsx src/ui/WardDetail.tsx src/ui/Zukan.test.tsx
git commit -m "feat: add 2D zukan grid, ward detail, radar chart"
```

---

### Task 8: 診断フローと結果画面

**Files:**
- Create: `src/ui/Diagnosis.tsx`, `src/ui/Result.tsx`
- Test: `src/ui/Diagnosis.test.tsx`

**Interfaces:**
- Consumes: `QUESTIONS`, `scoreAnswers` from `src/lib/quiz.ts`; `rankMatches` from `src/lib/matching.ts`; `loadWards` from `src/data/wards.ts`; `Radar`, `WardDetail`
- Produces:
  - `Diagnosis({ onComplete }: { onComplete: (userVector: AxisVector) => void }): JSX.Element`
  - `Result({ userVector }: { userVector: AxisVector }): JSX.Element` — 最も近い区＋相性TOP3

- [ ] **Step 1: Write the failing test**

Create `src/ui/Diagnosis.test.tsx`:
```tsx
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Diagnosis } from './Diagnosis';

describe('Diagnosis', () => {
  it('advances through 10 questions then calls onComplete', () => {
    const onComplete = vi.fn();
    render(<Diagnosis onComplete={onComplete} />);
    for (let i = 0; i < 10; i++) {
      // always pick first option
      fireEvent.click(screen.getAllByRole('button')[0]);
    }
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/ui/Diagnosis.test.tsx`
Expected: FAIL（`./Diagnosis` 未定義）。

- [ ] **Step 3: Implement Diagnosis**

Create `src/ui/Diagnosis.tsx`:
```tsx
import { useState } from 'react';
import { QUESTIONS, scoreAnswers } from '../lib/quiz';
import type { AxisVector } from '../domain/axes';

export function Diagnosis({ onComplete }: { onComplete: (v: AxisVector) => void }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const q = QUESTIONS[step];

  const pick = (optionIndex: number) => {
    const next = [...answers, optionIndex];
    if (step + 1 >= QUESTIONS.length) {
      onComplete(scoreAnswers(QUESTIONS, next));
    } else {
      setAnswers(next);
      setStep(step + 1);
    }
  };

  return (
    <div>
      <p>{step + 1} / {QUESTIONS.length}</p>
      <h2>{q.text}</h2>
      {q.options.map((opt, i) => (
        <button key={i} onClick={() => pick(i)}>{opt.label}</button>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Implement Result**

Create `src/ui/Result.tsx`:
```tsx
import { rankMatches } from '../lib/matching';
import { loadWards } from '../data/wards';
import type { AxisVector } from '../domain/axes';
import { WardDetail } from './WardDetail';

const WARDS = loadWards();

export function Result({ userVector }: { userVector: AxisVector }) {
  const ranked = rankMatches(userVector, WARDS);
  const top = ranked[0].ward;
  return (
    <div>
      <h1>あなたに一番似ているのは…</h1>
      <WardDetail ward={top} />
      <h3>相性TOP3</h3>
      <ol>
        {ranked.slice(0, 3).map((m) => (
          <li key={m.ward.code}>{m.ward.name}（{m.ward.group}）</li>
        ))}
      </ol>
    </div>
  );
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- src/ui/Diagnosis.test.tsx`
Expected: PASS。

- [ ] **Step 6: Commit**

```bash
git add src/ui/Diagnosis.tsx src/ui/Result.tsx src/ui/Diagnosis.test.tsx
git commit -m "feat: add diagnosis flow and result screen"
```

---

### Task 9: 画面ルーティングとシェアカード

**Files:**
- Modify: `src/App.tsx`
- Create: `src/ui/ShareCard.tsx`
- Test: `src/ui/ShareCard.test.tsx`

**Interfaces:**
- Consumes: `Zukan`, `WardDetail`, `Diagnosis`, `Result`; `Ward`, `AxisVector`
- Produces:
  - `ShareCard({ ward }: { ward: Ward }): JSX.Element` — シェア用の1枚（区名・系統・レーダー）。`data-testid="share-card"`
  - `App` はトップ（図鑑＋「診断する」）→ 診断 → 結果 を状態で切替

- [ ] **Step 1: Write the failing test**

Create `src/ui/ShareCard.test.tsx`:
```tsx
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ShareCard } from './ShareCard';
import { loadWards } from '../data/wards';

describe('ShareCard', () => {
  it('shows ward name and group in a card', () => {
    const ward = loadWards()[0];
    render(<ShareCard ward={ward} />);
    const card = screen.getByTestId('share-card');
    expect(card).toHaveTextContent(ward.name);
    expect(card).toHaveTextContent(ward.group!);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/ui/ShareCard.test.tsx`
Expected: FAIL（`./ShareCard` 未定義）。

- [ ] **Step 3: Implement ShareCard**

Create `src/ui/ShareCard.tsx`:
```tsx
import type { Ward } from '../domain/axes';
import { Radar } from './Radar';

export function ShareCard({ ward }: { ward: Ward }) {
  return (
    <div data-testid="share-card" style={{ width: 600, padding: 24, background: '#fff' }}>
      <h2>うちの区ちゃん：{ward.name}</h2>
      <p>系統：{ward.group}</p>
      <Radar vector={ward.axes} />
      <p>#うちの区ちゃん診断図鑑</p>
    </div>
  );
}
```

- [ ] **Step 4: Wire up App routing**

Replace `src/App.tsx`:
```tsx
import { useState } from 'react';
import { Zukan } from './ui/Zukan';
import { WardDetail } from './ui/WardDetail';
import { Diagnosis } from './ui/Diagnosis';
import { Result } from './ui/Result';
import type { AxisVector, Ward } from './domain/axes';

type View =
  | { name: 'top' }
  | { name: 'ward'; ward: Ward }
  | { name: 'diagnosis' }
  | { name: 'result'; userVector: AxisVector };

export default function App() {
  const [view, setView] = useState<View>({ name: 'top' });
  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: 16 }}>
      <h1>うちの区ちゃん診断図鑑</h1>
      {view.name === 'top' && (
        <>
          <button onClick={() => setView({ name: 'diagnosis' })}>診断する</button>
          <h2>図鑑</h2>
          <Zukan onSelect={(ward) => setView({ name: 'ward', ward })} />
        </>
      )}
      {view.name === 'ward' && (
        <>
          <button onClick={() => setView({ name: 'top' })}>← 図鑑へ戻る</button>
          <WardDetail ward={view.ward} />
        </>
      )}
      {view.name === 'diagnosis' && (
        <Diagnosis onComplete={(userVector) => setView({ name: 'result', userVector })} />
      )}
      {view.name === 'result' && (
        <>
          <Result userVector={view.userVector} />
          <button onClick={() => setView({ name: 'top' })}>図鑑を見る</button>
        </>
      )}
    </main>
  );
}
```

- [ ] **Step 5: Run test to verify it passes and app builds**

Run: `npm test && npm run build`
Expected: 全テストPASS、`dist/` 生成。

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx src/ui/ShareCard.tsx src/ui/ShareCard.test.tsx
git commit -m "feat: wire app routing and share card"
```

---

### Task 10: Cloudflare Pagesデプロイ設定

**Files:**
- Create: `public/_redirects`（SPAフォールバック）
- Create: `README.md`（ビルド・デプロイ手順）

**Interfaces:**
- Consumes: `npm run build` の `dist/`
- Produces: 静的成果物のデプロイ手順

- [ ] **Step 1: Add SPA redirect**

Create `public/_redirects`:
```
/*  /index.html  200
```

- [ ] **Step 2: Document build & deploy**

Create `README.md`:
```markdown
# うちの区ちゃん診断図鑑

23区をオープンデータの性格軸で分類し、診断で似ている区に出会える静的Webアプリ。

## 開発
- `npm install`
- `npm run test` — ロジックのユニットテスト
- `npm run dev` — ローカル開発
- `npm run build` — `dist/` に静的成果物

## デプロイ（Cloudflare Pages）
- Build command: `npm run build`
- Build output: `dist`
- 独自ドメインは使わず `*.pages.dev` を利用。

## データ
- 現状は `src/data/ward-vectors.fixture.json`（暫定値）。
- 実オープンデータのkill test後、`scripts/build-ward-data.ts` で本データに差し替える（別プラン）。
```

- [ ] **Step 3: Verify build succeeds**

Run: `npm run build`
Expected: `dist/index.html` と `public/_redirects` が `dist/` に含まれる。

- [ ] **Step 4: Commit**

```bash
git add public/_redirects README.md
git commit -m "chore: add Cloudflare Pages deploy config and README"
```

---

## Self-Review

**1. Spec coverage:**
- 連続レーダー指紋（23区固有）→ Task 6 fixture + Radar（Task 7）✅
- 系統グルーピング（飾り）→ Task 5 kmeans + Task 6 group付与 ✅
- 診断→最近傍マッチング → Task 3 + Task 4 + Task 8 ✅
- 2D図鑑＋根拠数値表示 → Task 7 ✅
- シェアカード → Task 9 ✅
- DBレス静的・無料デプロイ → Task 10 ✅
- 3Dビジュアライズ → **スコープ外（別プラン）**。設計のMVPスコープに沿い意図的に除外。
- 実オープンデータ取り込み（kill test） → **別プラン**。fixtureで先行開発、`scripts/build-ward-data.ts` は骨格のみ（本プランでは未実装＝README/残課題に明記）。

**2. Placeholder scan:** コード各ステップに実コードあり。TBD/TODOなし。

**3. Type consistency:** `AxisVector`, `Ward`, `loadWards`, `rankMatches`, `scoreAnswers`, `kmeans` の名前・シグネチャは全タスクで一貫。`group` は `string | undefined`、テストでは `!` で明示。

## 残課題（本MVP後）
- 別プラン①：実オープンデータのkill test → `scripts/build-ward-data.ts` 実装 → fixture差し替え。
- 別プラン②：3Dビジュアライズ（地図ジオラマ/浮遊ギャラリー）＋2Dフォールバック。
- 別プラン③：系統の日本語命名（データ特徴からの中立ラベル）＋キャラ画像23体の生成・配置。
- シェア画像のPNG化（html-to-image等）は本MVPではDOMカードまで。画像書き出しは別途。
