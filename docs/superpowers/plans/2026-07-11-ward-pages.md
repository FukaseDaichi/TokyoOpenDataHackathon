# 診断結果URL化＋区詳細ページ Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 診断結果を `/result/{slug}/`（23区×固定URL・区ごとOGP）にし、`/ward/{slug}/` に追加オープンデータ（地価・外国人比率・駅別乗降人員）の深堀り詳細ページを作る。

**Architecture:** Next.js App Routerの動的ルート＋`generateStaticParams` で23×2ページを静的生成。ページ本体はサーバコンポーネント（`generateMetadata` 用）で、表示はクライアント部品に委譲。新規データは `data/build_details.py` で集計→ `src/data/ward-details.json` スナップショット同梱。実行時のAPI/DBアクセスなしを維持。

**Tech Stack:** Next.js 15（`output: 'export'`）+ React 19 + TypeScript + Vitest + sharp（OG画像生成）+ Python3（データ集計）。

## Global Constraints

- DBレス・静的。リアルタイムAPI禁止。無料のみ（スペック: [2026-07-11-ward-pages-design.md](../specs/2026-07-11-ward-pages-design.md)）
- slugは `src/hero/wards.ts` の既存ローマ字slugを使う
- 新規データの品質ゲート: **23区揃う・欠損ゼロ・単位/時点明記**。通らない指標はその指標だけ落とす（診断5軸に影響させない）
- スティグマ回避: 順位・数値はネガティブ表現にしない
- UIコピーは日本語。デザインは既存の絵本トーン（`app/zukan.css` のクラスを再利用）
- Pythonは `/usr/bin/python3`（openpyxl入り）。CSVエンコーディングはcp932/utf-8-sig混在に注意

---

## File Structure

- `data/build_details.py` — 新規データ集計（地価・外国人・駅乗降）→ `data/processed/ward-details.json`
- `src/data/ward-details.json` — スナップショット同梱（手編集しない）
- `src/data/details.ts` — 詳細データローダ
- `src/data/slugs.ts` — code↔slug変換（hero WARDSから導出）
- `src/lib/rank.ts` — 順位・平均比の純関数
- `src/lib/diagnosisSession.ts` — sessionStorage保存/復元
- `src/ui/Radar.tsx` — overlay（ユーザーベクトル重ね描き）対応を追加
- `src/ui/pages/ResultPage.tsx` — 結果ページclient（本人/受け手分岐）
- `src/ui/pages/WardPage.tsx` — 詳細ページclient（指標バー・系統仲間・出典）
- `src/ui/StatBar.tsx` — 指標1行（値・順位・平均比バー）
- `app/result/[slug]/page.tsx`, `app/ward/[slug]/page.tsx` — server pages（params/metadata）
- `scripts/build-og-images.mjs` — OG画像23枚生成 → `public/og/{slug}.png`
- `next.config.ts` — `trailingSlash: true` 追加
- `src/App.tsx` — 診断完了→遷移、図鑑モーダルにリンク

---

### Task 1: slugユーティリティと順位ロジック

**Files:**
- Create: `src/data/slugs.ts`, `src/lib/rank.ts`
- Test: `src/data/slugs.test.ts`, `src/lib/rank.test.ts`

**Interfaces:**
- Produces: `CODE_TO_SLUG: Record<string, string>` / `SLUG_TO_CODE: Record<string, string>` / `ALL_SLUGS: string[]`（23件）
- Produces: `rankOf(values: number[], v: number, desc?: boolean): number`（1始まり。desc=trueで大きいほど上位）、`ratioToMean(values: number[], v: number): number`（23区平均=1.0）

- [ ] **Step 1: Write failing tests**

`src/data/slugs.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { CODE_TO_SLUG, SLUG_TO_CODE, ALL_SLUGS } from './slugs';

describe('slugs', () => {
  it('has 23 slugs, all round-trip', () => {
    expect(ALL_SLUGS).toHaveLength(23);
    expect(CODE_TO_SLUG['13103']).toBe('minato');
    expect(SLUG_TO_CODE['minato']).toBe('13103');
    for (const s of ALL_SLUGS) expect(CODE_TO_SLUG[SLUG_TO_CODE[s]]).toBe(s);
  });
});
```

`src/lib/rank.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { rankOf, ratioToMean } from './rank';

describe('rank', () => {
  it('ranks descending by default (biggest = 1位)', () => {
    expect(rankOf([10, 30, 20], 30)).toBe(1);
    expect(rankOf([10, 30, 20], 10)).toBe(3);
  });
  it('ranks ascending when desc=false', () => {
    expect(rankOf([10, 30, 20], 10, false)).toBe(1);
  });
  it('computes ratio to mean', () => {
    expect(ratioToMean([1, 2, 3], 2)).toBe(1);
    expect(ratioToMean([1, 2, 3], 4)).toBe(2);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- src/data/slugs.test.ts src/lib/rank.test.ts`
Expected: FAIL（module未定義）。

- [ ] **Step 3: Implement**

`src/data/slugs.ts`:
```ts
import { WARDS as HERO_WARDS } from '../hero/wards';

export const CODE_TO_SLUG: Record<string, string> = {};
export const SLUG_TO_CODE: Record<string, string> = {};
for (const w of HERO_WARDS) {
  if (!w.slug) continue;
  CODE_TO_SLUG[w.id] = w.slug;
  SLUG_TO_CODE[w.slug] = w.id;
}
export const ALL_SLUGS: string[] = HERO_WARDS.map((w) => w.slug!).filter(Boolean);
```

`src/lib/rank.ts`:
```ts
/** 1始まりの順位。desc=trueで値が大きいほど上位 */
export function rankOf(values: number[], v: number, desc = true): number {
  return values.filter((x) => (desc ? x > v : x < v)).length + 1;
}

/** 23区平均を1.0とした比 */
export function ratioToMean(values: number[], v: number): number {
  const mean = values.reduce((s, x) => s + x, 0) / values.length;
  return mean === 0 ? 0 : v / mean;
}
```

- [ ] **Step 4: Run tests to verify pass**

Run: `npm test -- src/data/slugs.test.ts src/lib/rank.test.ts`
Expected: PASS。

- [ ] **Step 5: Commit**

```bash
git add src/data/slugs.ts src/data/slugs.test.ts src/lib/rank.ts src/lib/rank.test.ts
git commit -m "feat: add slug mapping and ranking helpers"
```

---

### Task 2: 新規データ集計（地価・外国人・駅乗降）→ ward-details.json

**Files:**
- Create: `data/build_details.py`
- Create: `data/processed/ward-details.json`（生成物）、コピー `src/data/ward-details.json`

**Interfaces:**
- Produces: `ward-details.json` 形式:
```json
{
  "sources": { "land_price": "国土交通省 令和7年地価公示（住宅地平均）", "foreign_rate": "…", "stations": "…" },
  "wards": [
    { "id": "13101",
      "land_price_avg": 1234567,
      "land_price_points": 25,
      "foreign_rate": 3.2,
      "top_stations": [ { "name": "東京", "passengers": 462589 } ] }
  ]
}
```
（`foreign_rate` / `top_stations` は品質ゲートを通った場合のみ。落とす場合はキーごと省略し `sources` にも載せない）

- [ ] **Step 1: 地価集計を実装**

`data/build_details.py`（骨子。地価は手元CSVなので必ず動く）:
```python
#!/usr/bin/env python3
"""区詳細ページ用の追加データ集計。出力: data/processed/ward-details.json"""
import csv, json, re
from pathlib import Path

RAW = Path(__file__).parent / 'raw'
OUT = Path(__file__).parent / 'processed' / 'ward-details.json'
WARD_IDS = [f'131{i:02d}' for i in range(1, 24)]

def land_price():
    """地価公示 住宅地（用途0）の区別平均（円/㎡）"""
    result = {}
    with open(RAW / 'chika_r7_chiten.csv', encoding='cp932') as f:
        rows = list(csv.reader(f))
    header = rows[1]
    ci = {name: header.index(name) for name in ['都道府県市区町村コード', '標準地番号（用途）', '当年価格（円）']}
    acc = {}
    for row in rows[2:]:
        if len(row) <= max(ci.values()):
            continue
        code = row[ci['都道府県市区町村コード']].strip()
        youto = row[ci['標準地番号（用途）']].strip()
        price = row[ci['当年価格（円）']].replace(',', '').strip()
        if code in WARD_IDS and youto == '0' and price.isdigit():
            acc.setdefault(code, []).append(int(price))
    for code, prices in acc.items():
        result[code] = {'land_price_avg': round(sum(prices) / len(prices)), 'land_price_points': len(prices)}
    return result

def main():
    lp = land_price()
    missing = [w for w in WARD_IDS if w not in lp]
    assert not missing, f'land_price missing wards: {missing}'  # kill test: 23区揃うこと
    wards = [{'id': w, **lp[w]} for w in WARD_IDS]
    data = {'sources': {'land_price': '国土交通省 令和7年地価公示（住宅地 区別平均・円/㎡）'}, 'wards': wards}
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding='utf-8')
    print(f'wrote {OUT} ({len(wards)} wards)')

if __name__ == '__main__':
    main()
```

- [ ] **Step 2: 実行して23区揃うことを確認（地価kill test）**

Run: `/usr/bin/python3 data/build_details.py && /usr/bin/python3 -c "import json;d=json.load(open('data/processed/ward-details.json'));print(len(d['wards']))"`
Expected: `23`。assertで欠損検出。

- [ ] **Step 3: 外国人人口比率の取得を試す（kill testゲート）**

住民基本台帳「世帯と人口」シリーズ（`data/raw/jy26qv0301.csv` と同系統）に区別外国人人口がある。候補: 東京都オープンデータカタログ（catalog.data.metro.tokyo.lg.jp）で「住民基本台帳 世帯と人口 外国人」を検索し、区別×外国人数のCSVをDL → `data/raw/` に保存 → `build_details.py` に `foreign_rate()`（外国人数÷総人口×100、jy26qv0301.csvの総人口を分母に使用可）を追加。
**ゲート**: 30分以内に「23区揃う・欠損ゼロ」のCSVが取れなければこの指標は**落とす**（`sources` にも載せない）。取れたら Step 2 同様にassertで検証。

- [ ] **Step 4: 駅別乗降人員の取得を試す（kill testゲート）**

候補: 東京都カタログの「駅別乗降人員」または国土数値情報S12駅別乗降客数。区マッピングが必要（駅の所在区カラムがあるものを優先）。`top_stations()`（区ごとに乗降人員上位3駅 `{name, passengers}`）を追加。
**ゲート**: 30分以内にクリーンな区マッピング付きデータが得られなければ**落とす**。部分的欠損（駅がない区はない想定だが）が出た場合も落とす。

- [ ] **Step 5: スナップショット同梱・コミット**

```bash
cp data/processed/ward-details.json src/data/ward-details.json
git add data/build_details.py data/processed/ward-details.json src/data/ward-details.json data/raw/
git commit -m "feat: aggregate land price (+foreign rate/stations if passed) into ward-details"
```
（新規DLした生データもコミット。落とした指標があればコミットメッセージに明記）

---

### Task 3: 詳細データローダ

**Files:**
- Create: `src/data/details.ts`
- Test: `src/data/details.test.ts`

**Interfaces:**
- Consumes: `src/data/ward-details.json`（Task 2）
- Produces:
```ts
interface TopStation { name: string; passengers: number }
interface WardDetails {
  code: string;
  landPriceAvg: number;       // 円/㎡（住宅地平均）
  landPricePoints: number;    // 集計地点数
  foreignRate?: number;       // %（取得できた場合のみ）
  topStations?: TopStation[]; // 取得できた場合のみ
}
loadWardDetails(): Map<string, WardDetails>
DETAIL_SOURCES: Record<string, string>
```

- [ ] **Step 1: Write failing test**

`src/data/details.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { loadWardDetails, DETAIL_SOURCES } from './details';

describe('loadWardDetails', () => {
  const map = loadWardDetails();
  it('has details for all 23 wards', () => {
    expect(map.size).toBe(23);
  });
  it('land price is positive and Chiyoda is above 23-ward median', () => {
    const values = [...map.values()].map((d) => d.landPriceAvg).sort((a, b) => a - b);
    const chiyoda = map.get('13101')!;
    expect(chiyoda.landPriceAvg).toBeGreaterThan(values[11]);
    for (const d of map.values()) expect(d.landPriceAvg).toBeGreaterThan(0);
  });
  it('exposes sources', () => {
    expect(Object.keys(DETAIL_SOURCES).length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/data/details.test.ts`
Expected: FAIL。

- [ ] **Step 3: Implement**

`src/data/details.ts`:
```ts
import snapshot from './ward-details.json';

export interface TopStation { name: string; passengers: number }
export interface WardDetails {
  code: string;
  landPriceAvg: number;
  landPricePoints: number;
  foreignRate?: number;
  topStations?: TopStation[];
}

export const DETAIL_SOURCES: Record<string, string> = snapshot.sources;

interface RawDetail {
  id: string;
  land_price_avg: number;
  land_price_points: number;
  foreign_rate?: number;
  top_stations?: TopStation[];
}

let cache: Map<string, WardDetails> | null = null;

export function loadWardDetails(): Map<string, WardDetails> {
  if (cache) return cache;
  cache = new Map(
    (snapshot.wards as RawDetail[]).map((w) => [
      w.id,
      {
        code: w.id,
        landPriceAvg: w.land_price_avg,
        landPricePoints: w.land_price_points,
        foreignRate: w.foreign_rate,
        topStations: w.top_stations,
      },
    ]),
  );
  return cache;
}
```

- [ ] **Step 4: Run test to verify pass**

Run: `npm test -- src/data/details.test.ts`
Expected: PASS。

- [ ] **Step 5: Commit**

```bash
git add src/data/details.ts src/data/details.test.ts
git commit -m "feat: add ward details loader"
```

---

### Task 4: sessionStorageヘルパとRadar重ね描き

**Files:**
- Create: `src/lib/diagnosisSession.ts`
- Modify: `src/ui/Radar.tsx`（overlay prop追加）
- Test: `src/lib/diagnosisSession.test.ts`

**Interfaces:**
- Produces: `saveDiagnosis(v: AxisVector): void` / `loadDiagnosis(): AxisVector | null`（key `kuchan.diagnosis`、JSON不正はnull）
- Produces: `Radar` に `overlay?: AxisVector`（破線ポリゴンで重ね描き、色 `#4a3418`）

- [ ] **Step 1: Write failing test**

`src/lib/diagnosisSession.test.ts`:
```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { saveDiagnosis, loadDiagnosis } from './diagnosisSession';
import { emptyVector } from '../domain/axes';

describe('diagnosisSession', () => {
  beforeEach(() => sessionStorage.clear());
  it('round-trips a vector', () => {
    const v = { ...emptyVector(), liveliness: 0.5 };
    saveDiagnosis(v);
    expect(loadDiagnosis()).toEqual(v);
  });
  it('returns null when empty or corrupt', () => {
    expect(loadDiagnosis()).toBeNull();
    sessionStorage.setItem('kuchan.diagnosis', '{broken');
    expect(loadDiagnosis()).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/lib/diagnosisSession.test.ts`
Expected: FAIL。

- [ ] **Step 3: Implement helper**

`src/lib/diagnosisSession.ts`:
```ts
import { AXIS_KEYS, type AxisVector } from '../domain/axes';

const KEY = 'kuchan.diagnosis';

export function saveDiagnosis(v: AxisVector): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ vector: v, ts: Date.now() }));
  } catch {
    /* プライベートモード等では黙って諦める（受け手表示になるだけ） */
  }
}

export function loadDiagnosis(): AxisVector | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const v = parsed?.vector;
    if (!v || !AXIS_KEYS.every((k) => typeof v[k] === 'number')) return null;
    return v as AxisVector;
  } catch {
    return null;
  }
}
```

- [ ] **Step 4: Add overlay to Radar**

`src/ui/Radar.tsx` — propsに `overlay?: AxisVector` を追加し、性格ポリゴンの後に:
```tsx
{overlay && (
  <polygon
    points={AXIS_KEYS.map((k, i) => pt(i, overlay[k]).join(',')).join(' ')}
    fill="none"
    stroke="#4a3418"
    strokeWidth="2"
    strokeDasharray="5 4"
    strokeLinejoin="round"
  />
)}
```
（`function Radar({ vector, color = '#b8923f', size = 240, overlay }: RadarProps)` にシグネチャ変更。aria-labelは変更不要）

- [ ] **Step 5: Run all tests**

Run: `npm test`
Expected: 既存含め全てPASS。

- [ ] **Step 6: Commit**

```bash
git add src/lib/diagnosisSession.ts src/lib/diagnosisSession.test.ts src/ui/Radar.tsx
git commit -m "feat: add diagnosis session storage and radar overlay"
```

---

### Task 5: OG画像生成スクリプト

**Files:**
- Create: `scripts/build-og-images.mjs`
- Create: `public/og/{slug}.png` ×23（生成物）

**Interfaces:**
- Produces: 1200×630 PNG。羊皮紙背景＋右にSSR立ち絵＋左にロゴ（`public/title-w720.webp`）＋「◯◯区ちゃんタイプ」

- [ ] **Step 1: Implement script**

`scripts/build-og-images.mjs`:
```js
// OGP画像 1200x630 を23区分生成する。実行: node scripts/build-og-images.mjs
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const WARDS = [
  ['chiyoda', '千代田区'], ['chuo', '中央区'], ['minato', '港区'], ['shinjuku', '新宿区'],
  ['bunkyo', '文京区'], ['taito', '台東区'], ['sumida', '墨田区'], ['koto', '江東区'],
  ['shinagawa', '品川区'], ['meguro', '目黒区'], ['ota', '大田区'], ['setagaya', '世田谷区'],
  ['shibuya', '渋谷区'], ['nakano', '中野区'], ['suginami', '杉並区'], ['toshima', '豊島区'],
  ['kita', '北区'], ['arakawa', '荒川区'], ['itabashi', '板橋区'], ['nerima', '練馬区'],
  ['adachi', '足立区'], ['katsushika', '葛飾区'], ['edogawa', '江戸川区'],
];

const W = 1200, H = 630;
mkdirSync('public/og', { recursive: true });

const bg = Buffer.from(`<svg width="${W}" height="${H}">
  <defs>
    <linearGradient id="p" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f7ecd4"/><stop offset="1" stop-color="#e8d5ab"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#p)"/>
  <rect x="14" y="14" width="${W - 28}" height="${H - 28}" fill="none" stroke="#b8923f" stroke-width="4" rx="18"/>
</svg>`);

const label = (name) => Buffer.from(`<svg width="700" height="630">
  <text x="60" y="430" font-family="Hiragino Mincho ProN, serif" font-size="64" fill="#4a3418" letter-spacing="6">${name}ちゃん</text>
  <text x="60" y="510" font-family="Hiragino Mincho ProN, serif" font-size="34" fill="#7a5c2e" letter-spacing="4">タイプのあなたへ</text>
</svg>`);

const logo = await sharp('public/title-w720.webp').resize({ width: 560 }).toBuffer();

for (const [slug, name] of WARDS) {
  const art = await sharp(`public/characters/ssr/${slug}-w512.webp`)
    .resize(360, 540, { fit: 'cover' })
    .toBuffer();
  await sharp(bg)
    .composite([
      { input: logo, left: 60, top: 120 },
      { input: label(name), left: 0, top: 0 },
      { input: art, left: W - 420, top: 45 },
    ])
    .png()
    .toFile(`public/og/${slug}.png`);
}
console.log('generated 23 og images');
```

- [ ] **Step 2: Run and verify**

Run: `node scripts/build-og-images.mjs && ls public/og | wc -l`
Expected: `23`。1枚開いて（`open public/og/minato.png`）レイアウト崩れ・文字化けがないか目視確認。ずれていれば座標を調整。

- [ ] **Step 3: Commit**

```bash
git add scripts/build-og-images.mjs public/og
git commit -m "feat: generate per-ward OGP images"
```

---

### Task 6: /result/[slug]/ ページ

**Files:**
- Create: `app/result/[slug]/page.tsx`, `src/ui/pages/ResultPage.tsx`
- Modify: `next.config.ts`（trailingSlash）
- Test: `src/ui/pages/ResultPage.test.tsx`

**Interfaces:**
- Consumes: `SLUG_TO_CODE`/`ALL_SLUGS`（Task 1）、`loadDiagnosis`（Task 4）、`loadWards`/`rankMatches`/`similarityPercent`/`WardDetail`/`Radar`/`xShareUrl`（既存）
- Produces: `ResultPage({ slug }: { slug: string })` client component

- [ ] **Step 1: trailingSlash設定**

`next.config.ts`:
```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
};

export default nextConfig;
```

- [ ] **Step 2: Write failing test**

`src/ui/pages/ResultPage.test.tsx`:
```tsx
import '@testing-library/jest-dom';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ResultPage } from './ResultPage';
import { saveDiagnosis } from '../../lib/diagnosisSession';
import { emptyVector } from '../../domain/axes';

vi.mock('next/link', () => ({ default: ({ href, children, ...p }: any) => <a href={href} {...p}>{children}</a> }));

describe('ResultPage', () => {
  beforeEach(() => sessionStorage.clear());
  it('shows visitor view (CTA, no ranking) without a saved diagnosis', () => {
    render(<ResultPage slug="minato" />);
    expect(screen.getByText(/港区ちゃん/)).toBeInTheDocument();
    expect(screen.getByText(/あなたも診断する/)).toBeInTheDocument();
    expect(screen.queryByText(/相性ランキング/)).not.toBeInTheDocument();
  });
  it('shows owner view (ranking + share) with a saved diagnosis', () => {
    saveDiagnosis({ ...emptyVector(), luxury: 1 });
    render(<ResultPage slug="minato" />);
    expect(screen.getByText(/相性ランキング/)).toBeInTheDocument();
    expect(screen.getByText(/Xで結果をシェアする/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm test -- src/ui/pages/ResultPage.test.tsx`
Expected: FAIL。

- [ ] **Step 4: Implement ResultPage**

`src/ui/pages/ResultPage.tsx`:
```tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SLUG_TO_CODE } from '../../data/slugs';
import { loadWards } from '../../data/wards';
import { loadDiagnosis } from '../../lib/diagnosisSession';
import { rankMatches } from '../../lib/matching';
import type { AxisVector } from '../../domain/axes';
import { WardDetail } from '../WardDetail';
import { similarityPercent } from '../Result';
import { ShareCard, xShareUrl } from '../ShareCard';
import { wardTheme } from '../wardTheme';

const WARDS = loadWards();

export function ResultPage({ slug }: { slug: string }) {
  const ward = WARDS.find((w) => w.code === SLUG_TO_CODE[slug])!;
  // hydration差異を避けるため、sessionStorageはマウント後に読む
  const [userVector, setUserVector] = useState<AxisVector | null>(null);
  useEffect(() => setUserVector(loadDiagnosis()), []);

  const ranked = userVector ? rankMatches(userVector, WARDS) : null;
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <main className="book-section" style={{ minHeight: '100vh' }}>
      <div className="book-section-inner">
        <p className="book-section-eyebrow">SHINDAN RESULT</p>
        <h1 className="book-section-title">
          {userVector ? 'あなたに一番似ているのは…' : `この人は${ward.name}ちゃんタイプ！`}
        </h1>
        <div style={{ marginTop: 32 }}>
          <WardDetail ward={ward} userOverlay={userVector ?? undefined} />
        </div>

        {ranked && (
          <>
            <h2 className="result-ranking-title">相性ランキング</h2>
            <ol className="result-ranking">
              {ranked.slice(0, 3).map((m, i) => {
                const theme = wardTheme(m.ward.code);
                return (
                  <li key={m.ward.code} style={{ ['--ward-color' as string]: theme.color }}>
                    <span className="result-rank">{i + 1}位</span>
                    <span className="result-rank-name">{m.ward.name}</span>
                    <span className="result-rank-group">{m.ward.group}</span>
                    <span className="result-rank-score">にてる度 {similarityPercent(m.distance)}%</span>
                  </li>
                );
              })}
            </ol>
          </>
        )}

        <div className="result-actions">
          {userVector ? (
            <a className="diagnosis-option result-share-link" href={xShareUrl(ward, shareUrl)} target="_blank" rel="noopener noreferrer">
              Xで結果をシェアする
            </a>
          ) : (
            <Link className="diagnosis-option result-share-link" href="/#diagnosis">
              あなたも診断する
            </Link>
          )}
          <Link className="result-retry" href={`/ward/${slug}/`}>
            {ward.name}ちゃんをくわしく見る →
          </Link>
        </div>

        {userVector && (
          <div className="result-share-card">
            <ShareCard ward={ward} />
          </div>
        )}
      </div>
    </main>
  );
}
```
補足: `WardDetail` に `userOverlay?: AxisVector` propを追加し、内部の `<Radar vector={ward.axes} color={theme.color} />` を `<Radar vector={ward.axes} color={theme.color} overlay={userOverlay} />` にする。overlay表示時はレーダー下に凡例 `<p className="radar-legend">— {ward.name} / - - あなた</p>` を出す（classは `.ward-detail-sources` と同スタイルでよいので `className="ward-detail-sources"` を流用）。
`similarityPercent` は `src/ui/Result.tsx` からexport済み。

- [ ] **Step 5: Implement server page**

`app/result/[slug]/page.tsx`:
```tsx
import type { Metadata } from 'next';
import { ALL_SLUGS, SLUG_TO_CODE } from '@/data/slugs';
import { WARDS as HERO_WARDS } from '@/hero/wards';
import { ResultPage } from '@/ui/pages/ResultPage';

export function generateStaticParams() {
  return ALL_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const ward = HERO_WARDS.find((w) => w.id === SLUG_TO_CODE[slug])!;
  const site = process.env.NEXT_PUBLIC_SITE_URL;
  return {
    title: `${ward.name}ちゃんタイプ | うちの区ちゃん診断図鑑`,
    description: `診断結果: あなたは${ward.name}ちゃんタイプ。${ward.catch}`,
    ...(site && { metadataBase: new URL(site) }),
    openGraph: { images: [`/og/${slug}.png`], title: `${ward.name}ちゃんタイプ`, description: ward.catch },
    twitter: { card: 'summary_large_image' },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ResultPage slug={slug} />;
}
```

- [ ] **Step 6: Run tests and build**

Run: `npm test -- src/ui/pages/ResultPage.test.tsx && npm run build`
Expected: テストPASS、ビルドで `/result/[slug]` が23ルート生成（出力の Route 一覧で確認）。

- [ ] **Step 7: Commit**

```bash
git add app/result next.config.ts src/ui/pages src/ui/WardDetail.tsx
git commit -m "feat: add per-ward diagnosis result pages with OGP"
```

---

### Task 7: /ward/[slug]/ 詳細ページ

**Files:**
- Create: `app/ward/[slug]/page.tsx`, `src/ui/pages/WardPage.tsx`, `src/ui/StatBar.tsx`
- Modify: `app/zukan.css`（StatBar・仲間カードのスタイル追記）
- Test: `src/ui/pages/WardPage.test.tsx`

**Interfaces:**
- Consumes: `loadWards`/`loadWardDetails`/`DETAIL_SOURCES`/`rankOf`/`ratioToMean`/`Radar`/`wardTheme`/`ssrImage`/`CODE_TO_SLUG`
- Produces: `WardPage({ slug })` client component、`StatBar({ label, valueText, rank, ratio, positive })`

- [ ] **Step 1: Write failing test**

`src/ui/pages/WardPage.test.tsx`:
```tsx
import '@testing-library/jest-dom';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WardPage } from './WardPage';

vi.mock('next/link', () => ({ default: ({ href, children, ...p }: any) => <a href={href} {...p}>{children}</a> }));

describe('WardPage', () => {
  it('renders stats with rank and land price for Minato', () => {
    render(<WardPage slug="minato" />);
    expect(screen.getByText(/港区ちゃん/)).toBeInTheDocument();
    expect(screen.getByText(/財政力指数/)).toBeInTheDocument();
    expect(screen.getAllByText(/23区中 1位/).length).toBeGreaterThanOrEqual(1); // 財政力1.15は最大
    expect(screen.getByText(/地価公示/)).toBeInTheDocument();
  });
  it('links to fellow wards of the same group', () => {
    render(<WardPage slug="minato" />);
    expect(screen.getByText(/おなじ系統のなかま/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/ui/pages/WardPage.test.tsx`
Expected: FAIL。

- [ ] **Step 3: Implement StatBar**

`src/ui/StatBar.tsx`:
```tsx
/** 指標1行: ラベル・実値・23区中順位・平均比バー（平均=中央の基準線） */
export function StatBar({
  label, valueText, rank, ratio, note,
}: { label: string; valueText: string; rank: number; ratio: number; note?: string }) {
  const width = Math.min(100, ratio * 50); // 平均(1.0)=50%
  return (
    <div className="stat-bar">
      <div className="stat-bar-head">
        <span className="stat-bar-label">{label}</span>
        <span className="stat-bar-value">{valueText}</span>
        <span className="stat-bar-rank">23区中 {rank}位</span>
      </div>
      <div className="stat-bar-track">
        <span className="stat-bar-fill" style={{ width: `${width}%` }} />
        <span className="stat-bar-mean" aria-hidden="true" />
      </div>
      {note && <p className="stat-bar-note">{note}</p>}
    </div>
  );
}
```

`app/zukan.css` に追記:
```css
/* ---- 詳細ページ 指標バー ---- */

.stat-bar { padding: 12px 0; border-bottom: 1px dashed rgba(184, 146, 63, 0.4); }
.stat-bar-head { display: flex; align-items: baseline; gap: 12px; margin-bottom: 8px; }
.stat-bar-label { font-weight: 600; letter-spacing: 0.08em; font-size: 14px; }
.stat-bar-value { font-variant-numeric: tabular-nums; font-size: 14px; color: #6a4f26; }
.stat-bar-rank { margin-left: auto; font-size: 12px; color: #7a5c2e; white-space: nowrap; }
.stat-bar-track { position: relative; height: 8px; border-radius: 999px; background: rgba(184, 146, 63, 0.18); overflow: hidden; }
.stat-bar-fill { position: absolute; inset: 0 auto 0 0; border-radius: 999px; background: linear-gradient(90deg, var(--ward-color, #b8923f), #e8c56b); }
.stat-bar-mean { position: absolute; left: 50%; top: -2px; bottom: -2px; width: 2px; background: rgba(74, 52, 24, 0.55); }
.stat-bar-note { margin-top: 6px; font-size: 11px; color: #8a6c3c; }
.stat-section-caption { font-size: 11px; color: #8a6c3c; margin: 6px 0 0; }

.fellow-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 12px; margin-top: 12px; }
.fellow-card { display: block; text-decoration: none; text-align: center; padding: 8px; background: linear-gradient(180deg, #f7ecd4, #eeddb8); border: 2px solid #b8923f; border-radius: 8px; color: #4a3418; font-size: 13px; letter-spacing: 0.1em; }
.fellow-card img { width: 100%; aspect-ratio: 2 / 3; object-fit: cover; border-radius: 4px; margin-bottom: 6px; }
.ward-page-back { display: inline-block; color: #b8923f; text-decoration: none; letter-spacing: 0.14em; font-size: 13px; margin-bottom: 20px; }
```

- [ ] **Step 4: Implement WardPage**

`src/ui/pages/WardPage.tsx`:
```tsx
'use client';

import Link from 'next/link';
import { SLUG_TO_CODE, CODE_TO_SLUG } from '../../data/slugs';
import { loadWards } from '../../data/wards';
import { loadWardDetails, DETAIL_SOURCES } from '../../data/details';
import { DATA_SOURCES } from '../../data/wards';
import { rankOf, ratioToMean } from '../../lib/rank';
import { Radar } from '../Radar';
import { StatBar } from '../StatBar';
import { ssrImage, wardTheme } from '../wardTheme';

const WARDS = loadWards();
const DETAILS = loadWardDetails();

export function WardPage({ slug }: { slug: string }) {
  const ward = WARDS.find((w) => w.code === SLUG_TO_CODE[slug])!;
  const theme = wardTheme(ward.code);
  const detail = DETAILS.get(ward.code)!;
  const m = ward.metrics!;
  const all = WARDS.map((w) => w.metrics!);
  const allDetails = [...DETAILS.values()];
  const fellows = WARDS.filter((w) => w.group === ward.group && w.code !== ward.code);

  const stats = [
    { label: '昼夜間人口比率', v: m.daytime_population_ratio, vs: all.map((x) => x.daytime_population_ratio), text: `${m.daytime_population_ratio.toFixed(1)}%`, note: '100%を超えるほど昼に人が集まる街' },
    { label: '高齢化率', v: m.aging_rate, vs: all.map((x) => x.aging_rate), text: `${m.aging_rate.toFixed(1)}%`, note: '高いほど成熟した落ち着きのある街' },
    { label: '年少人口率', v: m.youth_rate, vs: all.map((x) => x.youth_rate), text: `${m.youth_rate.toFixed(1)}%` },
    { label: '一人当たり公立公園面積', v: m.park_area_per_capita, vs: all.map((x) => x.park_area_per_capita), text: `${m.park_area_per_capita.toFixed(2)}㎡` },
    { label: '単身世帯率', v: m.single_household_rate, vs: all.map((x) => x.single_household_rate), text: `${m.single_household_rate.toFixed(1)}%` },
    { label: '子育て世帯率', v: m.family_household_rate, vs: all.map((x) => x.family_household_rate), text: `${m.family_household_rate.toFixed(1)}%` },
    { label: '財政力指数', v: m.fiscal_strength_index, vs: all.map((x) => x.fiscal_strength_index), text: m.fiscal_strength_index.toFixed(2) },
    { label: '地価公示（住宅地平均）', v: detail.landPriceAvg, vs: allDetails.map((d) => d.landPriceAvg), text: `${Math.round(detail.landPriceAvg / 10000).toLocaleString()}万円/㎡`.replace('万円/㎡', '万円/㎡'), note: `区内${detail.landPricePoints}地点の平均` },
    ...(detail.foreignRate !== undefined
      ? [{ label: '外国人人口比率', v: detail.foreignRate, vs: allDetails.map((d) => d.foreignRate!), text: `${detail.foreignRate.toFixed(1)}%`, note: '多いほど国際色ゆたかな街' }]
      : []),
  ];

  return (
    <main className="book-section" style={{ minHeight: '100vh', ['--ward-color' as string]: theme.color }}>
      <div className="book-section-inner">
        <Link className="ward-page-back" href="/#zukan">← 図鑑にもどる</Link>
        <article className="ward-detail">
          <div className="ward-detail-portrait">
            {theme.slug && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={`/${ssrImage(theme.slug, 896)}`} alt={`${ward.name}ちゃんのイラスト`} width={896} height={1344} />
            )}
          </div>
          <div className="ward-detail-body">
            <p className="ward-detail-group">{ward.group}</p>
            <h1 className="ward-detail-name">{ward.name}ちゃん</h1>
            <p className="ward-detail-catch">{theme.catch}</p>
            <div className="ward-detail-radar"><Radar vector={ward.axes} color={theme.color} /></div>

            <h2 className="ward-detail-evidence-title">データで見る{ward.name}</h2>
            {stats.map((s) => (
              <StatBar key={s.label} label={s.label} valueText={s.text} rank={rankOf(s.vs, s.v)} ratio={ratioToMean(s.vs, s.v)} note={s.note} />
            ))}
            <p className="stat-section-caption">バーの中央線＝23区平均。順位は値の大きい順。</p>

            {detail.topStations && detail.topStations.length > 0 && (
              <>
                <h2 className="ward-detail-evidence-title" style={{ marginTop: 24 }}>区内の主要駅（乗降人員）</h2>
                <table className="ward-detail-evidence"><tbody>
                  {detail.topStations.map((st) => (
                    <tr key={st.name}>
                      <th scope="row">{st.name}駅</th>
                      <td className="evidence-value">{st.passengers.toLocaleString()}人/日</td>
                    </tr>
                  ))}
                </tbody></table>
              </>
            )}

            {fellows.length > 0 && (
              <>
                <h2 className="ward-detail-evidence-title" style={{ marginTop: 24 }}>おなじ系統のなかま</h2>
                <div className="fellow-grid">
                  {fellows.map((f) => {
                    const ft = wardTheme(f.code);
                    return (
                      <Link key={f.code} className="fellow-card" href={`/ward/${CODE_TO_SLUG[f.code]}/`}>
                        {ft.slug && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={`/${ssrImage(ft.slug)}`} alt="" loading="lazy" />
                        )}
                        {f.name}
                      </Link>
                    );
                  })}
                </div>
              </>
            )}

            <h2 className="ward-detail-evidence-title" style={{ marginTop: 24 }}>出典</h2>
            <p className="ward-detail-sources">
              {[...Object.values(DATA_SOURCES), ...Object.values(DETAIL_SOURCES)].join(' / ')}
              （数値は取得時点のスナップショット）
            </p>
          </div>
        </article>
      </div>
    </main>
  );
}
```
注意: サブルート配下では相対パス画像が壊れるため、`src` は先頭 `/` 付き（`/${ssrImage(...)}`）にする。**Task 8でトップページ側も含め全画像パスを `/` 始まりに統一する。**

- [ ] **Step 5: Implement server page**

`app/ward/[slug]/page.tsx`:
```tsx
import type { Metadata } from 'next';
import { ALL_SLUGS, SLUG_TO_CODE } from '@/data/slugs';
import { WARDS as HERO_WARDS } from '@/hero/wards';
import { WardPage } from '@/ui/pages/WardPage';

export function generateStaticParams() {
  return ALL_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const ward = HERO_WARDS.find((w) => w.id === SLUG_TO_CODE[slug])!;
  const site = process.env.NEXT_PUBLIC_SITE_URL;
  return {
    title: `${ward.name}ちゃん図鑑 | うちの区ちゃん診断図鑑`,
    description: `${ward.name}のオープンデータ深堀り: ${ward.catch}`,
    ...(site && { metadataBase: new URL(site) }),
    openGraph: { images: [`/og/${slug}.png`], title: `${ward.name}ちゃん図鑑`, description: ward.catch },
    twitter: { card: 'summary_large_image' },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <WardPage slug={slug} />;
}
```

- [ ] **Step 6: Run tests and build**

Run: `npm test -- src/ui/pages/WardPage.test.tsx && npm run build`
Expected: PASS、`/ward/[slug]` 23ルート生成。

- [ ] **Step 7: Commit**

```bash
git add app/ward src/ui/pages/WardPage.tsx src/ui/pages/WardPage.test.tsx src/ui/StatBar.tsx app/zukan.css
git commit -m "feat: add ward detail pages with open-data deep dive"
```

---

### Task 8: トップページ改修（遷移・リンク・画像パス統一）

**Files:**
- Modify: `src/App.tsx`, `src/ui/wardTheme.ts`, `src/ui/ShareCard.tsx`, `src/hero/`（画像パス参照箇所）
- Test: 既存テスト＋手動確認

**Interfaces:**
- Consumes: `saveDiagnosis`（Task 4）、`CODE_TO_SLUG`（Task 1）、`useRouter`（next/navigation）

- [ ] **Step 1: 画像パスを `/` 始まりに統一**

`src/ui/wardTheme.ts` の `ssrImage` を:
```ts
export function ssrImage(slug: string, size: 512 | 896 = 512): string {
  return `/characters/ssr/${slug}-w${size}.webp`;
}
```
に変更（呼び出し側の `/${ssrImage(...)}` は不要になるのでTask 7実装時からこの形を前提にしてよい。Task 7の `\`/\${ssrImage(...)}\`` は `ssrImage(...)` に読み替える）。
他の相対パス参照を洗い出して統一:
```bash
grep -rn "characters/ssr\|title-w" src/ | grep -v "'/"
```
ヒットした箇所（`src/App.tsx`・`src/hero/Hero2DFallback.tsx`・`src/hero/HeroOverlay.tsx`・`src/hero/textures.ts` 等）の `src=` を `/characters/...`・`/title-w720.webp` 形式に修正。

- [ ] **Step 2: 診断完了→結果ページ遷移**

`src/App.tsx`:
- import追加: `import { useRouter } from 'next/navigation';` / `import { saveDiagnosis } from './lib/diagnosisSession';` / `import { CODE_TO_SLUG } from './data/slugs';`
- `phase` state・`Result`・`ShareCard` import・`matched`・`shareUrl` を削除し、診断セクションを:
```tsx
{phase.name === 'quiz' && (
  <Diagnosis
    onComplete={(userVector) => {
      saveDiagnosis(userVector);
      router.push(`/result/${CODE_TO_SLUG[bestMatch(userVector, WARDS).code]}/`);
    }}
  />
)}
```
の形に変更（`const router = useRouter();` をコンポーネント先頭に。`phase` は `'intro' | 'quiz'` の2状態に縮小）。

- [ ] **Step 3: 図鑑モーダルに詳細リンク追加**

`src/App.tsx` のモーダル内、`WardDetail` の直後に:
```tsx
<Link
  className="diagnosis-option result-share-link"
  href={`/ward/${CODE_TO_SLUG[ward.code]}/`}
>
  {ward.name}ちゃんをくわしく見る →
</Link>
```
（`import Link from 'next/link';` を追加）

- [ ] **Step 4: xShareUrlの共有URLを結果ページに**

`ResultPage` では `window.location.href`（= `/result/{slug}/`）を渡しているのでそのままでよい。`src/ui/ShareCard.tsx` の `xShareUrl` は変更不要なことを確認。

- [ ] **Step 5: Run all tests and build**

Run: `npm test && npm run build`
Expected: 全PASS。ビルドのRoute一覧に `/`・`/result/[slug]`・`/ward/[slug]` が出る。

- [ ] **Step 6: Commit**

```bash
git add src app
git commit -m "feat: route diagnosis to result pages, link zukan to ward pages"
```

---

### Task 9: 最終検証・README更新

**Files:**
- Modify: `README.md`

- [ ] **Step 1: ブラウザ検証（devサーバ）**

`.claude/launch.json` の `dev` でプレビュー起動し確認:
1. `/` で診断完了 → `/result/{slug}/` に遷移し、本人ビュー（レーダー重ね＋TOP3＋シェア）が出る
2. 新規タブ相当（sessionStorageクリア後）で `/result/minato/` を直接開く → 受け手ビュー（CTA）が出る
3. `/ward/minato/` で指標バー・順位・地価・（あれば）駅・仲間リンク・出典が出る
4. 図鑑モーダル→「くわしく見る」→詳細ページ遷移
5. コンソールエラーなし・画像404なし（`read_network_requests` で確認）

- [ ] **Step 2: OGPメタの確認**

Run: `grep -o 'og:image[^>]*' out/result/minato/index.html | head -2`
Expected: `/og/minato.png` を含むmetaタグが出力されている。

- [ ] **Step 3: README更新**

README「アプリ」節に追記:
```markdown
### ページ構成
- `/` — 3Dヒーロー＋10問診断＋図鑑
- `/result/{slug}/` — 診断結果（23区、OGP付き。シェア着地）
- `/ward/{slug}/` — 区の詳細（オープンデータ深堀り: 順位・地価ほか）

OGP画像の再生成: `node scripts/build-og-images.mjs`
詳細データの再集計: `/usr/bin/python3 data/build_details.py`
デプロイ時は `NEXT_PUBLIC_SITE_URL` に公開URLを設定（OGPの絶対URL用）。
```

- [ ] **Step 4: Commit**

```bash
git add README.md
git commit -m "docs: document ward pages and og image pipeline"
```

---

## Self-Review

**1. Spec coverage:**
- 23区×2の実ルート＋trailingSlash → Task 6/7 ✅
- 本人/受け手分岐＋sessionStorage → Task 4/6 ✅
- OGP（メタ＋画像23枚） → Task 5/6/7、検証はTask 9 Step 2 ✅
- 詳細ページ（7指標順位バー＋地価＋外国人＋駅＋仲間＋出典） → Task 2/3/7 ✅（外国人・駅はkill testゲート付き、落とす場合の挙動も定義）
- 図鑑モーダルへのリンク → Task 8 ✅
- サブルートでの相対パス画像切れ対策 → Task 7注意書き＋Task 8 Step 1 ✅

**2. Placeholder scan:** 外国人・駅データのDL手順は探索的（URL未確定）だが、ゲート条件・落とし方・出力形式を明示済み。他にTBDなし。

**3. Type consistency:** `WardDetail` の `userOverlay` prop（Task 6補足で定義）、`Radar.overlay`（Task 4）、`WardDetails`/`loadWardDetails`（Task 3）、`rankOf`/`ratioToMean`（Task 1）で一貫。
