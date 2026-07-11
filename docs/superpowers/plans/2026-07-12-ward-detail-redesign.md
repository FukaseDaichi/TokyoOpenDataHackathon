# 区詳細ページ リデザイン 実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 区詳細ページに3D東京都マップ・政策キュレーション・プロフィール・新統計3種を追加し「図鑑本編」に拡張する。

**Architecture:** ジオデータはビルド時に TopoJSON → 局所平面座標JSONへ変換して同梱。3DはR3F押し出しポリゴン（ヒーローの品質判定を流用、WebGL不可時はSVG 2D地図）。政策は手動キュレーションJSON。統計は既存 `build_details.py` パイプラインに追加。

**Tech Stack:** Next.js App Router (`output: 'export'`) / TypeScript / React Three Fiber + three / Vitest / Python3標準ライブラリ（＋既存のopenpyxl）

**仕様書:** `docs/superpowers/specs/2026-07-12-ward-detail-redesign-design.md`

## Global Constraints

- `next.config.ts` の `output: 'export'` を維持。実行時API・DB・SSR依存を追加しない。データはすべて `src/data/*.json` にビルド時同梱。
- 区コード順は `13101`→`13123`。すべてのデータは23区分そろえる。
- `data/processed/*.json` と `src/data/*.json` は同一内容（`cp` で複製）。`data/processed/` は手編集しない。
- 5軸キー・診断ロジックは変更しない。
- UIコピーは日本語。区の表現は中立・前向き。地域スティグマにつながる否定的ラベル禁止。
- 純ロジックは副作用のないTSモジュール＋Vitest先行（TDD）。
- 絵本図鑑トーン: 羊皮紙 `#f7ecd4→#eeddb8` グラデ、金インク `#b8923f`、墨 `#4a3418`、薄墨 `#7a5c2e`、明朝系フォント維持。
- Pythonは `/usr/bin/python3` で実行。
- コミットメッセージ末尾: `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`

---

### Task 1: ジオデータパイプライン（`data/build_geo.py` → `ward-geo.json`）

**Files:**
- Create: `data/build_geo.py`
- Create: `data/raw/N03-21_13_city.topojson`（ダウンロード）
- Create: `data/processed/ward-geo.json`（生成物）
- Create: `src/data/ward-geo.json`（コピー）
- Test: `src/data/geo.test.ts`（データ健全性のみ。ローダーはTask 2）

**Interfaces:**
- Produces: `src/data/ward-geo.json` — 形式:
  ```json
  {
    "source": "「国土数値情報（行政区域データ）」（国土交通省）を加工して作成（簡略化: smartnews-smri/japan-topography）",
    "wards": [
      { "id": "13101", "name": "千代田区", "center": [x, y], "area_km2": 11.7,
        "rings": [ [ [x, y], [x, y], ... ], ... ] }
    ]
  }
  ```
  座標は東京中心（lon 139.75, lat 35.69）基準の局所平面km、x=東+、y=北+、小数3桁。`rings` は外周リングのみ（穴なし）、各リングは閉じない（最初と最後の点は異なる）。

- [ ] **Step 1: 簡略化済みTopoJSONを取得**

リポジトリ https://github.com/smartnews-smri/japan-topography の `data/municipality/topojson/` 配下から**東京都・簡略化1%（s0010）の市区町村ファイル**を取得する。ファイル名は `N03-21_13_city.topojson` 想定だが、実行時に `gh api repos/smartnews-smri/japan-topography/contents/data/municipality/topojson` 等でディレクトリ構成を確認して正確なパスを使うこと。

```bash
curl -L -o data/raw/N03-21_13_city.topojson \
  "https://raw.githubusercontent.com/smartnews-smri/japan-topography/main/data/municipality/topojson/s0010/N03-21_13_city.topojson"
head -c 400 data/raw/N03-21_13_city.topojson   # objects名・properties構成（N03_007=5桁コード）を確認
```

Expected: TopoJSONヘッダ（`"type":"Topology"`、`transform`、`objects`）が見える。properties のキー名（`N03_004`=区名, `N03_007`=団体コード）が想定と違えば Step 2 の定数を合わせる。

- [ ] **Step 2: `data/build_geo.py` を作成**

```python
#!/usr/bin/env python3
"""区詳細ページ用ジオデータ生成。TopoJSON(N03簡略化版)→局所平面km座標JSON。
出力: data/processed/ward-geo.json"""
import json
import math
from pathlib import Path

RAW = Path(__file__).parent / 'raw' / 'N03-21_13_city.topojson'
OUT = Path(__file__).parent / 'processed' / 'ward-geo.json'
WARD_IDS = [f'131{i:02d}' for i in range(1, 24)]

# 東京中心の等距円筒近似（十分な精度。装飾地図用途）
LON0, LAT0 = 139.75, 35.69
KX = 111.320 * math.cos(math.radians(LAT0))  # 経度1度あたりkm
KY = 110.574                                  # 緯度1度あたりkm
MIN_RING_AREA = 0.02  # km^2 未満の微小リング（岩礁等）は捨てる

CODE_KEY = 'N03_007'  # 5桁団体コード
NAME_KEY = 'N03_004'  # 市区町村名


def decode_arcs(topo):
    sx, sy = topo['transform']['scale']
    tx, ty = topo['transform']['translate']
    arcs = []
    for arc in topo['arcs']:
        pts, cx, cy = [], 0, 0
        for dx, dy in arc:
            cx += dx
            cy += dy
            pts.append((cx * sx + tx, cy * sy + ty))
        arcs.append(pts)
    return arcs


def ring_coords(arc_indices, arcs):
    pts = []
    for i in arc_indices:
        seg = arcs[i] if i >= 0 else list(reversed(arcs[~i]))
        if pts and pts[-1] == seg[0]:
            seg = seg[1:]
        pts.extend(seg)
    if len(pts) > 1 and pts[0] == pts[-1]:
        pts = pts[:-1]
    return pts


def project(lon, lat):
    return round((lon - LON0) * KX, 3), round((lat - LAT0) * KY, 3)


def shoelace(ring):
    s = 0.0
    for i in range(len(ring)):
        x1, y1 = ring[i]
        x2, y2 = ring[(i + 1) % len(ring)]
        s += x1 * y2 - x2 * y1
    return s / 2  # 符号付き面積(km^2)


def centroid(ring):
    a = shoelace(ring)
    cx = cy = 0.0
    for i in range(len(ring)):
        x1, y1 = ring[i]
        x2, y2 = ring[(i + 1) % len(ring)]
        f = x1 * y2 - x2 * y1
        cx += (x1 + x2) * f
        cy += (y1 + y2) * f
    return round(cx / (6 * a), 3), round(cy / (6 * a), 3)


def main():
    topo = json.loads(RAW.read_text(encoding='utf-8'))
    layer = next(iter(topo['objects'].values()))
    arcs = decode_arcs(topo)
    wards = {}
    for geom in layer['geometries']:
        code = (geom.get('properties') or {}).get(CODE_KEY, '')
        if code not in WARD_IDS:
            continue
        polys = geom['arcs'] if geom['type'] == 'MultiPolygon' else [geom['arcs']]
        rings = []
        for poly in polys:
            outer = [project(lon, lat) for lon, lat in ring_coords(poly[0], arcs)]
            if abs(shoelace(outer)) >= MIN_RING_AREA:
                rings.append(outer)
        name = geom['properties'][NAME_KEY]
        area = round(sum(abs(shoelace(r)) for r in rings), 2)
        main_ring = max(rings, key=lambda r: abs(shoelace(r)))
        wards[code] = {'id': code, 'name': name, 'center': list(centroid(main_ring)),
                       'area_km2': area, 'rings': [[list(p) for p in r] for r in rings]}

    missing = [c for c in WARD_IDS if c not in wards]
    assert not missing, f'欠損区: {missing}'
    data = {
        'source': '「国土数値情報（行政区域データ）」（国土交通省）を加工して作成（簡略化: smartnews-smri/japan-topography）',
        'wards': [wards[c] for c in WARD_IDS],
    }
    OUT.write_text(json.dumps(data, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
    size_kb = OUT.stat().st_size / 1024
    print(f'{OUT} ({size_kb:.0f}KB, {len(wards)}区)')
    assert size_kb <= 120, f'サイズ超過: {size_kb:.0f}KB（簡略化率を上げる）'


if __name__ == '__main__':
    main()
```

- [ ] **Step 3: 生成して同梱**

```bash
/usr/bin/python3 data/build_geo.py
cp data/processed/ward-geo.json src/data/ward-geo.json
```

Expected: `data/processed/ward-geo.json (～60KB, 23区)`。120KB超なら s0001（0.1%）版に切り替える。

- [ ] **Step 4: データ健全性テストを書く（`src/data/geo.test.ts`）**

```ts
import { describe, expect, it } from 'vitest';
import snapshot from './ward-geo.json';

const WARD_IDS = Array.from({ length: 23 }, (_, i) => `131${String(i + 1).padStart(2, '0')}`);

describe('ward-geo.json', () => {
  it('23区が区コード順にそろっている', () => {
    expect(snapshot.wards.map((w) => w.id)).toEqual(WARD_IDS);
  });
  it('各区にリング・重心・面積がある', () => {
    for (const w of snapshot.wards) {
      expect(w.rings.length).toBeGreaterThan(0);
      expect(w.rings[0].length).toBeGreaterThan(10);
      expect(w.area_km2).toBeGreaterThan(5); // 最小の台東区でも10km^2強
      expect(Number.isFinite(w.center[0]) && Number.isFinite(w.center[1])).toBe(true);
    }
  });
  it('座標は東京近傍の局所km座標', () => {
    for (const w of snapshot.wards) {
      for (const [x, y] of w.rings[0]) {
        expect(Math.abs(x)).toBeLessThan(40);
        expect(Math.abs(y)).toBeLessThan(40);
      }
    }
  });
});
```

- [ ] **Step 5: テスト実行**

Run: `npx vitest run src/data/geo.test.ts`
Expected: PASS（失敗したら build_geo.py の抽出・投影を直す）

- [ ] **Step 6: コミット**

```bash
git add data/build_geo.py data/raw/N03-21_13_city.topojson data/processed/ward-geo.json src/data/ward-geo.json src/data/geo.test.ts
git commit -m "feat: 23区境界ジオデータパイプラインを追加（N03簡略化TopoJSON→局所座標JSON）"
```

---

### Task 2: ジオローダーと純ロジック（`src/data/geo.ts` / `src/lib/geo.ts`）

**Files:**
- Create: `src/data/geo.ts`
- Create: `src/lib/geo.ts`
- Test: `src/lib/geo.test.ts`

**Interfaces:**
- Consumes: `src/data/ward-geo.json`（Task 1の形式）
- Produces:
  - `loadWardGeo(): WardGeo[]`、`GEO_SOURCE: string`（`src/data/geo.ts`）
  - `WardGeo = { code: string; name: string; center: [number, number]; areaKm2: number; rings: [number, number][][] }`
  - `geoBounds(all: WardGeo[]): Bounds`（`Bounds = { minX; minY; maxX; maxY }`）
  - `toView(p: [number, number], b: Bounds, w: number, h: number, pad: number): [number, number]`（y軸反転してSVG/画面座標へ）
  - `ringToPath(ring: [number, number][], b: Bounds, w: number, h: number, pad: number): string`（`"M x,y L … Z"`）
  - `nearestWards(target: WardGeo, all: WardGeo[], k: number): WardGeo[]`（target自身を除く重心距離の近い順k件）

- [ ] **Step 1: 失敗するテストを書く（`src/lib/geo.test.ts`）**

```ts
import { describe, expect, it } from 'vitest';
import { geoBounds, nearestWards, ringToPath, toView } from './geo';
import type { WardGeo } from '../data/geo';

const sq = (cx: number, cy: number): WardGeo => ({
  code: '13101', name: 'テスト', center: [cx, cy], areaKm2: 4,
  rings: [[[cx - 1, cy - 1], [cx + 1, cy - 1], [cx + 1, cy + 1], [cx - 1, cy + 1]]],
});

describe('geoBounds', () => {
  it('全リングを含む境界を返す', () => {
    expect(geoBounds([sq(0, 0), sq(10, 5)])).toEqual({ minX: -1, minY: -1, maxX: 11, maxY: 6 });
  });
});

describe('toView', () => {
  it('北(+y)が上（小さいv）になる', () => {
    const b = { minX: 0, minY: 0, maxX: 10, maxY: 10 };
    const [, vTop] = toView([5, 10], b, 100, 100, 0);
    const [, vBottom] = toView([5, 0], b, 100, 100, 0);
    expect(vTop).toBeLessThan(vBottom);
  });
  it('アスペクト比を保ち中央寄せする', () => {
    const b = { minX: 0, minY: 0, maxX: 10, maxY: 5 };
    expect(toView([0, 5], b, 100, 100, 10)).toEqual([10, 30]); // 幅80に対し高さ40→上下40-70
    expect(toView([10, 0], b, 100, 100, 10)).toEqual([90, 70]);
  });
});

describe('ringToPath', () => {
  it('M/L/Zの閉パスを生成する', () => {
    const b = { minX: 0, minY: 0, maxX: 2, maxY: 2 };
    const d = ringToPath([[0, 0], [2, 0], [2, 2]], b, 100, 100, 0);
    expect(d).toBe('M0,100 L100,100 L100,0 Z');
  });
});

describe('nearestWards', () => {
  it('自身を除き近い順にk件返す', () => {
    const a = { ...sq(0, 0), code: 'a' };
    const wards = [a, { ...sq(1, 0), code: 'b' }, { ...sq(5, 0), code: 'c' }, { ...sq(2, 0), code: 'd' }];
    expect(nearestWards(a, wards, 2).map((w) => w.code)).toEqual(['b', 'd']);
  });
});
```

- [ ] **Step 2: 失敗確認**

Run: `npx vitest run src/lib/geo.test.ts`
Expected: FAIL（モジュール未作成）

- [ ] **Step 3: 実装**

`src/data/geo.ts`:

```ts
import snapshot from './ward-geo.json';

export interface WardGeo {
  code: string;
  name: string;
  /** 局所平面km座標の重心（x=東+, y=北+） */
  center: [number, number];
  areaKm2: number;
  rings: [number, number][][];
}

export const GEO_SOURCE: string = snapshot.source;

let cache: WardGeo[] | null = null;

export function loadWardGeo(): WardGeo[] {
  if (cache) return cache;
  cache = snapshot.wards.map((w) => ({
    code: w.id,
    name: w.name,
    center: w.center as [number, number],
    areaKm2: w.area_km2,
    rings: w.rings as [number, number][][],
  }));
  return cache;
}
```

`src/lib/geo.ts`:

```ts
import type { WardGeo } from '../data/geo';

export interface Bounds { minX: number; minY: number; maxX: number; maxY: number }

/** 全区の全リングを含む境界ボックス */
export function geoBounds(all: WardGeo[]): Bounds {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const w of all) for (const ring of w.rings) for (const [x, y] of ring) {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
  return { minX, minY, maxX, maxY };
}

/** 局所km座標→ビュー座標。y軸反転（北が上）、アスペクト比維持で中央寄せ */
export function toView(p: [number, number], b: Bounds, w: number, h: number, pad: number): [number, number] {
  const spanX = b.maxX - b.minX;
  const spanY = b.maxY - b.minY;
  const scale = Math.min((w - pad * 2) / spanX, (h - pad * 2) / spanY);
  const ox = (w - spanX * scale) / 2;
  const oy = (h - spanY * scale) / 2;
  return [ox + (p[0] - b.minX) * scale, h - oy - (p[1] - b.minY) * scale];
}

export function ringToPath(ring: [number, number][], b: Bounds, w: number, h: number, pad: number): string {
  return ring
    .map((p, i) => {
      const [x, y] = toView(p, b, w, h, pad);
      return `${i === 0 ? 'M' : 'L'}${round1(x)},${round1(y)}`;
    })
    .join(' ') + ' Z';
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/** target自身を除く、重心距離の近い順k件 */
export function nearestWards(target: WardGeo, all: WardGeo[], k: number): WardGeo[] {
  return all
    .filter((w) => w.code !== target.code)
    .map((w) => ({ w, d: (w.center[0] - target.center[0]) ** 2 + (w.center[1] - target.center[1]) ** 2 }))
    .sort((a, b) => a.d - b.d)
    .slice(0, k)
    .map((x) => x.w);
}
```

- [ ] **Step 4: テスト通過確認**

Run: `npx vitest run src/lib/geo.test.ts src/data/geo.test.ts`
Expected: PASS

- [ ] **Step 5: コミット**

```bash
git add src/data/geo.ts src/lib/geo.ts src/lib/geo.test.ts
git commit -m "feat: ジオデータローダーとビュー座標変換の純ロジックを追加"
```

---

### Task 3: 2Dフォールバック地図（`src/ui/WardMap2D.tsx`）

**Files:**
- Create: `src/ui/WardMap2D.tsx`
- Test: `src/ui/WardMap2D.test.tsx`

**Interfaces:**
- Consumes: `loadWardGeo` / `geoBounds` / `ringToPath` / `toView` / `nearestWards`（Task 2）、`wardTheme(code)`（既存）
- Produces: `<WardMap2D code={string} />` — 640×480のSVG地図。当該区をテーマカラー塗り＋封蝋ピン＋区名、近隣4区名を薄墨表示。

- [ ] **Step 1: 失敗するテストを書く（`src/ui/WardMap2D.test.tsx`）**

既存の `src/ui/Zukan.test.tsx` のセットアップ（@testing-library/react）に倣う。

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { WardMap2D } from './WardMap2D';

describe('WardMap2D', () => {
  it('23区分のパスを描き、当該区名を表示する', () => {
    const { container } = render(<WardMap2D code="13103" />);
    expect(container.querySelectorAll('path.ward-map2d-shape').length).toBe(23);
    expect(screen.getByText('港区')).toBeTruthy();
  });
  it('roleとaria-labelを持つ', () => {
    render(<WardMap2D code="13103" />);
    expect(screen.getByRole('img', { name: /港区の位置/ })).toBeTruthy();
  });
});
```

- [ ] **Step 2: 失敗確認**

Run: `npx vitest run src/ui/WardMap2D.test.tsx`
Expected: FAIL

- [ ] **Step 3: 実装（`src/ui/WardMap2D.tsx`）**

```tsx
import { loadWardGeo } from '../data/geo';
import { geoBounds, nearestWards, ringToPath, toView } from '../lib/geo';
import { wardTheme } from './wardTheme';

const W = 640;
const H = 480;
const PAD = 36;

/** 2D羊皮紙地図。WebGL不可・reduced motion時の導線であり、意味情報は3Dと等価 */
export function WardMap2D({ code }: { code: string }) {
  const all = loadWardGeo();
  const target = all.find((w) => w.code === code)!;
  const b = geoBounds(all);
  const color = wardTheme(code).color;
  const [px, py] = toView(target.center, b, W, H, PAD);
  const neighbors = nearestWards(target, all, 4);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`東京23区の中の${target.name}の位置`}
      className="ward-map2d"
    >
      {all.map((w) => (
        <g key={w.code}>
          {w.rings.map((ring, ri) => (
            <path
              key={ri}
              className="ward-map2d-shape"
              d={ringToPath(ring, b, W, H, PAD)}
              fill={w.code === code ? color : 'rgba(184, 146, 63, 0.08)'}
              fillOpacity={w.code === code ? 0.5 : 1}
              stroke="#b8923f"
              strokeWidth={w.code === code ? 1.6 : 0.7}
            />
          ))}
        </g>
      ))}
      {neighbors.map((w) => {
        const [x, y] = toView(w.center, b, W, H, PAD);
        return (
          <text key={w.code} x={x} y={y} fontSize={11} textAnchor="middle" fill="#7a5c2e" opacity={0.8}>
            {w.name}
          </text>
        );
      })}
      {/* 封蝋風ピン */}
      <circle cx={px} cy={py} r={7} fill={color} stroke="#4a3418" strokeWidth={1} />
      <circle cx={px} cy={py} r={2.6} fill="#f7ecd4" />
      <text x={px} y={py - 14} fontSize={15} fontWeight={700} textAnchor="middle" fill="#4a3418"
        stroke="#f7ecd4" strokeWidth={3} style={{ paintOrder: 'stroke', letterSpacing: '0.08em' }}>
        {target.name}
      </text>
    </svg>
  );
}
```

- [ ] **Step 4: テスト通過確認**

Run: `npx vitest run src/ui/WardMap2D.test.tsx`
Expected: PASS

- [ ] **Step 5: コミット**

```bash
git add src/ui/WardMap2D.tsx src/ui/WardMap2D.test.tsx
git commit -m "feat: 2D羊皮紙地図（3Dマップのフォールバック）を追加"
```

---

### Task 4: 3Dマップと品質切替（`WardMap3D.tsx` / `WardMapSection.tsx`）

**Files:**
- Create: `src/ui/WardMap3D.tsx`
- Create: `src/ui/WardMapSection.tsx`
- Test: `src/ui/WardMapSection.test.tsx`

**Interfaces:**
- Consumes: `loadWardGeo`（Task 2）、`wardTheme`（既存）、`detectQuality` / `QualityTier` / `QUALITY_SETTINGS`（`src/hero/quality.ts` 既存）、`WardMap2D`（Task 3）
- Produces: `<WardMapSection code={string} />` — マウント後に品質判定し、`high`/`low` はR3Fの `WardMap3D`、`fallback` またはCanvas例外時は `WardMap2D` を表示するクライアントコンポーネント。

- [ ] **Step 1: 失敗するテストを書く（`src/ui/WardMapSection.test.tsx`）**

jsdomにWebGLは無いので `detectQuality()` は `fallback` を返し、2D地図が出ることを検証する。

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { WardMapSection } from './WardMapSection';

describe('WardMapSection', () => {
  it('WebGL不可環境では2D地図を表示する', async () => {
    render(<WardMapSection code="13103" />);
    expect(await screen.findByRole('img', { name: /港区の位置/ })).toBeTruthy();
  });
});
```

※ jsdomに `window.matchMedia` が無い場合は既存テスト（`Zukan.test.tsx` 等）のモック方法に合わせて `vi.stubGlobal` でモックする。

- [ ] **Step 2: 失敗確認**

Run: `npx vitest run src/ui/WardMapSection.test.tsx`
Expected: FAIL

- [ ] **Step 3: `WardMap3D.tsx` を実装**

ヒーロー（`src/hero/HeroCanvas.tsx`）に倣いR3Fで実装。テキストは描かない（区名・近隣区名は2D側とHTMLキャプションが担う）。

```tsx
'use client';

import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { loadWardGeo, type WardGeo } from '../data/geo';
import { wardTheme } from './wardTheme';
import type { QualityTier } from '../hero/quality';

const BASE_DEPTH = 0.12;      // 通常区の厚み(km相当の scene 単位)
const TARGET_DEPTH = 0.9;     // 当該区の厚み
const PARCHMENT = '#e9d9b4';  // 通常区の面
const GOLD = '#b8923f';

function wardShapes(w: WardGeo): THREE.Shape[] {
  return w.rings.map((ring) => {
    const shape = new THREE.Shape();
    ring.forEach(([x, y], i) => (i === 0 ? shape.moveTo(x, y) : shape.lineTo(x, y)));
    shape.closePath();
    return shape;
  });
}

function WardMesh({ ward, selected }: { ward: WardGeo; selected: boolean }) {
  const color = selected ? wardTheme(ward.code).color : PARCHMENT;
  const geom = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(wardShapes(ward), {
      depth: selected ? TARGET_DEPTH : BASE_DEPTH,
      bevelEnabled: false,
    });
    return g;
  }, [ward, selected]);
  const edges = useMemo(() => new THREE.EdgesGeometry(geom, 30), [geom]);
  return (
    <group>
      <mesh geometry={geom}>
        <meshStandardMaterial
          color={color}
          emissive={selected ? wardTheme(ward.code).color : '#000000'}
          emissiveIntensity={selected ? 0.35 : 0}
          roughness={0.85}
        />
      </mesh>
      <lineSegments geometry={edges}>
        <lineBasicMaterial color={GOLD} transparent opacity={selected ? 0.9 : 0.5} />
      </lineSegments>
    </group>
  );
}

function Pin({ ward }: { ward: WardGeo }) {
  const [cx, cy] = ward.center;
  const color = wardTheme(ward.code).color;
  return (
    <group position={[cx, cy, TARGET_DEPTH]}>
      <mesh position={[0, 0, 0.55]}>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0, 0, 0.2]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.16, 0.5, 12]} />
        <meshStandardMaterial color="#4a3418" />
      </mesh>
    </group>
  );
}

function Scene({ code }: { code: string }) {
  const all = loadWardGeo();
  const target = all.find((w) => w.code === code)!;
  const group = useRef<THREE.Group>(null);
  // 23区の重心平均を原点に寄せて回転中心にする
  const offset = useMemo<[number, number]>(() => {
    const xs = all.map((w) => w.center[0]);
    const ys = all.map((w) => w.center[1]);
    return [-(Math.min(...xs) + Math.max(...xs)) / 2, -(Math.min(...ys) + Math.max(...ys)) / 2];
  }, [all]);

  useFrame(({ clock }) => {
    if (group.current) group.current.rotation.z = Math.sin(clock.elapsedTime * 0.12) * 0.16;
  });

  return (
    <group rotation={[-Math.PI / 2.6, 0, 0]}>
      <group ref={group}>
        <group position={[offset[0], offset[1], 0]}>
          {all.map((w) => (
            <WardMesh key={w.code} ward={w} selected={w.code === code} />
          ))}
          <Pin ward={target} />
        </group>
      </group>
      <ambientLight intensity={0.9} />
      <directionalLight position={[8, 12, 20]} intensity={1.1} />
    </group>
  );
}

export default function WardMap3D({ code, tier }: { code: string; tier: Exclude<QualityTier, 'fallback'> }) {
  return (
    <Canvas
      dpr={[1, tier === 'high' ? 1.5 : 1.2]}
      camera={{ position: [0, 16, 30], fov: 38 }}
      gl={{ antialias: true, alpha: true }}
    >
      <Scene code={code} />
    </Canvas>
  );
}
```

※ 実装時にブラウザで見た目を確認し、カメラ位置・回転角・厚みは調整してよい（構造は変えない）。

- [ ] **Step 4: `WardMapSection.tsx` を実装**

`src/hero/Hero.tsx` のエラーバウンダリ＋品質判定パターンを踏襲する。

```tsx
'use client';

import dynamic from 'next/dynamic';
import { Component, type ReactNode, useEffect, useState } from 'react';
import { detectQuality, type QualityTier } from '../hero/quality';
import { WardMap2D } from './WardMap2D';

const WardMap3D = dynamic(() => import('./WardMap3D'), { ssr: false });

class MapErrorBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/** 「東京のどこにいる？」地図。品質判定でR3F/2D SVGを出し分ける */
export function WardMapSection({ code }: { code: string }) {
  const [tier, setTier] = useState<QualityTier | null>(null);
  const [glFailed, setGlFailed] = useState(false);

  useEffect(() => {
    setTier(detectQuality());
  }, []);

  const use3d = tier === 'high' || tier === 'low';
  return (
    <div className="ward-map-frame">
      {use3d && !glFailed ? (
        <MapErrorBoundary onError={() => setGlFailed(true)}>
          <WardMap3D code={code} tier={tier as 'high' | 'low'} />
        </MapErrorBoundary>
      ) : (
        <WardMap2D code={code} />
      )}
    </div>
  );
}
```

※ `tier === null`（判定前）は2D表示になるため、SSR/初期描画でも必ず地図が見える。

- [ ] **Step 5: テスト通過確認**

Run: `npx vitest run src/ui/WardMapSection.test.tsx`
Expected: PASS

- [ ] **Step 6: コミット**

```bash
git add src/ui/WardMap3D.tsx src/ui/WardMapSection.tsx src/ui/WardMapSection.test.tsx
git commit -m "feat: 3D東京都マップ（R3F押し出しポリゴン＋品質切替）を追加"
```

---

### Task 5: WardPageへ地図セクション組み込み＋CSS

**Files:**
- Modify: `src/ui/pages/WardPage.tsx`（`ward-detail-catch` の直後に挿入）
- Modify: `app/zukan.css`（末尾に追記）

**Interfaces:**
- Consumes: `WardMapSection`（Task 4）、`GEO_SOURCE`（Task 2）

- [ ] **Step 1: WardPage.tsxに地図セクションを挿入**

`<p className="ward-detail-catch">{theme.catch}</p>` の直後（レーダーの前）に:

```tsx
<h2 className="ward-detail-evidence-title">東京のどこにいる？</h2>
<WardMapSection code={ward.code} />
```

あわせて `WardMapSection.tsx` の `.ward-map-frame` 内に方位記号の飾り（金インクのSVG、右上配置）を追加する:

```tsx
<svg className="ward-map-compass" viewBox="0 0 40 40" aria-hidden="true">
  <circle cx="20" cy="20" r="14" fill="none" stroke="#b8923f" strokeWidth="1" opacity="0.7" />
  <path d="M20 4 L23 20 L20 36 L17 20 Z" fill="#b8923f" opacity="0.8" />
  <text x="20" y="3" fontSize="7" textAnchor="middle" fill="#7a5c2e">N</text>
</svg>
```

import追加: `import { WardMapSection } from '../WardMapSection';`

出典欄（`ward-detail-sources`）の配列に `GEO_SOURCE` を追加:

```tsx
{[...Object.values(DATA_SOURCES), ...Object.values(DETAIL_SOURCES), GEO_SOURCE].join(' / ')}
```

import追加: `import { GEO_SOURCE } from '../../data/geo';`

- [ ] **Step 2: CSSを追加（`app/zukan.css` 末尾）**

```css
/* 東京のどこにいる？（魔法の地図） */
.ward-map-frame {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 3;
  margin: 8px 0 20px;
  border: 1px solid rgba(184, 146, 63, 0.55);
  border-radius: 8px;
  background:
    radial-gradient(ellipse at 50% 40%, rgba(184, 146, 63, 0.1), transparent 70%),
    linear-gradient(180deg, #f7ecd4 0%, #eeddb8 100%);
  box-shadow: inset 0 0 34px rgba(74, 52, 24, 0.14);
  overflow: hidden;
}
.ward-map-frame canvas { display: block; }
.ward-map2d { width: 100%; height: 100%; display: block; }
.ward-map-compass { position: absolute; top: 10px; right: 10px; width: 40px; height: 40px; overflow: visible; pointer-events: none; }
```

- [ ] **Step 3: ブラウザで確認**

dev サーバーを起動し `http://localhost:3000/ward/minato/` を開く。確認点:
- 3Dマップが表示され、港区がテーマカラーで浮上・発光している
- ゆっくり揺れる回転が動く
- `http://localhost:3000/ward/minato/?view=2d` で2D地図に切り替わる（`detectQuality` の強制上書きを利用）
- コンソールエラーなし

- [ ] **Step 4: 全テスト実行**

Run: `npm test`
Expected: 全件PASS

- [ ] **Step 5: コミット**

```bash
git add src/ui/pages/WardPage.tsx app/zukan.css
git commit -m "feat: 区詳細ページに「東京のどこにいる？」3Dマップセクションを追加"
```

---

### Task 6: 総人口・平均所得を `build_details.py` に追加

**Files:**
- Create: `data/raw/`（e-Stat 課税状況CSVを取得。ファイル名は取得時に確定）
- Modify: `data/build_details.py`
- Modify: `data/processed/ward-details.json` → `src/data/ward-details.json`（再生成・コピー）
- Modify: `src/data/details.ts`
- Modify: `src/ui/wardStats.ts`
- Test: `src/data/details.test.ts`（既存に追記）

**Interfaces:**
- Consumes: 既存 `_total_population()`（build_details.py 内で算出済み）
- Produces:
  - `ward-details.json` の各区に `population: number`（人）と `income_per_taxpayer: number`（千円）を追加、`sources` に出典を追記
  - `WardDetails` に `population: number` / `incomePerTaxpayer?: number` を追加
  - `buildWardStats` に「平均所得」行を追加

- [ ] **Step 1: 課税対象所得データを取得してフォーマット確認**

総務省「市町村税課税状況等の調」（令和6年度）から、区市町村別の「課税対象所得」「納税義務者数（所得割）」が入った表をe-Stat（https://www.e-stat.go.jp/ で「市町村税課税状況等の調」を検索）からCSV/Excelで取得し、`data/raw/` に保存する。

```bash
head -5 "data/raw/<取得したファイル>"   # 列名・エンコーディング・13101〜13123の行があるか確認
```

Expected: 団体コード列（13101等）と課税対象所得・納税義務者数の列が特定できる。**列名・行構造は取得ファイルに合わせてStep 3の実装を調整する**（`land_price()` と同様のCSV走査パターン）。

- [ ] **Step 2: 失敗するテストを書く（`src/data/details.test.ts` に追記）**

```ts
it('全区に population と income_per_taxpayer がある', () => {
  for (const w of snapshot.wards) {
    expect(w.population).toBeGreaterThan(50000); // 最小の千代田区でも6万人超
    expect(w.income_per_taxpayer).toBeGreaterThan(3000); // 千円単位
  }
});
it('港区の平均所得が23区最大', () => {
  const minato = snapshot.wards.find((w) => w.id === '13103')!;
  expect(Math.max(...snapshot.wards.map((w) => w.income_per_taxpayer))).toBe(minato.income_per_taxpayer);
});
```

Run: `npx vitest run src/data/details.test.ts` → Expected: FAIL（フィールド未生成）

- [ ] **Step 3: `build_details.py` に実装**

`income()` 関数を追加（`land_price()` のCSV走査パターンに倣う。列インデックスはStep 1で確認したものを使う）:

```python
def income():
    """納税義務者1人当たり課税対象所得（千円）。市町村税課税状況等の調（令和6年度）"""
    result = {}
    # Step 1で確認した実ファイル名・列名に合わせて読み込む。
    # 出力形式: result[code] = {'income_per_taxpayer': round(課税対象所得千円 / 納税義務者数)}
    ...
    return result
```

`main()` に組み込み: `_total_population()` の結果を `population` として各区に出力し、`income()` をマージ。23区の欠損チェック（既存の `missing` パターン）と `sources` 追記:

```python
sources['population'] = '住民基本台帳による世帯と人口（令和8年1月1日現在）・人'
sources['income'] = '総務省「市町村税課税状況等の調」（令和6年度）納税義務者1人当たり課税対象所得・千円'
```

- [ ] **Step 4: 再生成→コピー→テスト**

```bash
/usr/bin/python3 data/build_details.py
cp data/processed/ward-details.json src/data/ward-details.json
npx vitest run src/data/details.test.ts
```

Expected: PASS

- [ ] **Step 5: ローダーとStatBarへ反映**

`src/data/details.ts`: `WardDetails` に `population: number; incomePerTaxpayer?: number;` を追加し、`loadWardDetails()` のマッピングに `population: w.population, incomePerTaxpayer: w.income_per_taxpayer` を追加（`RawDetail` にも対応フィールド追加）。

`src/ui/wardStats.ts` の配列に追加:

```ts
...(detail.incomePerTaxpayer !== undefined
  ? [{ label: '平均所得（納税者1人当たり）', v: detail.incomePerTaxpayer, vs: allDetails.map((d) => d.incomePerTaxpayer!), text: `${Math.round(detail.incomePerTaxpayer / 100) / 10}百万円`, note: '課税対象所得ベース' }]
  : []),
```

- [ ] **Step 6: 全テスト＋コミット**

```bash
npm test
git add data/build_details.py data/raw/ data/processed/ward-details.json src/data/ward-details.json src/data/details.ts src/ui/wardStats.ts src/data/details.test.ts
git commit -m "feat: 総人口と平均所得（課税対象所得）を区詳細データに追加"
```

---

### Task 7: 犯罪認知件数（人口千人当たり）を追加

**Files:**
- Create: `data/raw/`（警視庁 区市町村の町丁別・罪種別認知件数CSV）
- Modify: `data/build_details.py` / `data/processed/ward-details.json` / `src/data/ward-details.json` / `src/data/details.ts` / `src/ui/wardStats.ts`
- Test: `src/data/details.test.ts`（追記）

**Interfaces:**
- Consumes: Task 6の `population`
- Produces: `crime_per_1000: number`（人口千人当たり認知件数、小数1桁）、`WardDetails.crimePer1000?: number`、StatBar行「街の安全データ」

- [ ] **Step 1: データ取得とフォーマット確認**

東京都オープンデータカタログ https://catalog.data.metro.tokyo.lg.jp/dataset/t000022d0000100001 （CC BY 4.0）から最新年の「区市町村の町丁別、罪種別及び手口別認知件数」CSVを取得し `data/raw/` へ。

```bash
head -3 "data/raw/<取得したファイル>"   # 町丁名列（例: 千代田区丸の内１丁目）と総合計列を確認
```

- [ ] **Step 2: 失敗するテストを書く（`src/data/details.test.ts` 追記）**

```ts
it('全区に crime_per_1000 があり妥当なレンジ', () => {
  for (const w of snapshot.wards) {
    expect(w.crime_per_1000).toBeGreaterThan(1);
    expect(w.crime_per_1000).toBeLessThan(60); // 昼間人口の多い千代田区でも数十
  }
});
```

Run → Expected: FAIL

- [ ] **Step 3: `crime()` を実装**

```python
def crime(population):
    """人口千人当たり刑法犯認知件数。警視庁 町丁別CSV（CC BY 4.0）を区名先頭一致で集計"""
    names = {}  # code -> 区名。data/processed/wards.json から読む
    with open(Path(__file__).parent / 'processed' / 'wards.json', encoding='utf-8') as f:
        for w in json.load(f)['wards']:
            names[w['id']] = w['name']
    totals = {c: 0 for c in WARD_IDS}
    # CSVを走査し、町丁名が「<区名>」で始まる行の総合計列を加算（列位置はStep 1で確認）
    ...
    return {c: {'crime_per_1000': round(totals[c] / population[c] * 1000, 1)} for c in WARD_IDS}
```

※ wards.json の実キー名（`id`/`code`, `name`）は実ファイルを確認して合わせる。

- [ ] **Step 4: 再生成→ローダー→StatBar**

Task 6 と同じ流れ。`sources['crime'] = '警視庁「区市町村の町丁別、罪種別及び手口別認知件数」（最新年・人口千人当たり）'`。

`wardStats.ts` への追加（**中立表現**。「治安が悪い」等の否定ラベル禁止）:

```ts
...(detail.crimePer1000 !== undefined
  ? [{ label: '街の安全データ（人口千人当たり認知件数）', v: detail.crimePer1000, vs: allDetails.map((d) => d.crimePer1000!), text: `${detail.crimePer1000.toFixed(1)}件`, note: '昼間人口が多い区ほど値が出やすい統計です' }]
  : []),
```

- [ ] **Step 5: 全テスト＋コミット**

```bash
npm test
git add -A data/ src/data/ src/ui/wardStats.ts
git commit -m "feat: 街の安全データ（人口千人当たり認知件数）を追加"
```

---

### Task 8: 待機児童数を追加

**Files:**
- Create: `data/raw/`（東京都 保育サービス状況 Excel）
- Modify: `data/build_details.py` / `data/processed/ward-details.json` / `src/data/ward-details.json` / `src/data/details.ts` / `src/ui/wardStats.ts`
- Test: `src/data/details.test.ts`（追記）

**Interfaces:**
- Produces: `waiting_children: number`（人）、`WardDetails.waitingChildren?: number`、StatBar行「保育のいま（待機児童数）」

- [ ] **Step 1: データ取得とフォーマット確認**

東京都福祉局「保育サービスの状況」最新版（毎年8月公表。2025年版: https://www.metro.tokyo.lg.jp/information/press/2025/08/2025082917 ）の区市町村別表（表4）Excelを取得し `data/raw/` へ。openpyxlでシート名・セル配置を確認（既存 `soumu_*.xlsx` の処理パターンに倣う）。

- [ ] **Step 2: 失敗するテストを書く**

```ts
it('全区に waiting_children がある（0以上の整数）', () => {
  for (const w of snapshot.wards) {
    expect(Number.isInteger(w.waiting_children)).toBe(true);
    expect(w.waiting_children).toBeGreaterThanOrEqual(0);
  }
});
```

Run → Expected: FAIL

- [ ] **Step 3: `waiting_children()` を実装して再生成**

openpyxlで区名→人数を読み、区名から区コードへ変換（Task 7の `names` 辞書を逆引き）。`sources['waiting_children'] = '東京都福祉局「保育サービスの状況」（最新年4月1日現在）・人'`。

- [ ] **Step 4: ローダー→StatBar**

```ts
...(detail.waitingChildren !== undefined
  ? [{ label: '待機児童数', v: -detail.waitingChildren, vs: allDetails.map((d) => -d.waitingChildren!), text: `${detail.waitingChildren}人`, note: '少ないほど保育に入りやすい（順位は少ない順）' }]
  : []),
```

※ `rankOf` は値の大きい順なので符号反転で「少ない順」の順位にする。表示テキストは実数のまま。

- [ ] **Step 5: 全テスト＋コミット**

```bash
npm test
git add -A data/ src/data/ src/ui/wardStats.ts
git commit -m "feat: 待機児童数を区詳細データに追加"
```

---

### Task 9: 政策・プロフィールの器（ローダー＋UIセクション、データは空でも動く）

**Files:**
- Create: `src/data/ward-policies.json`（初期値 `{}`）
- Create: `src/data/policies.ts`
- Modify: `src/ui/pages/WardPage.tsx`
- Modify: `app/zukan.css`
- Test: `src/data/policies.test.ts`

**Interfaces:**
- Consumes: `WardDetails.population`（Task 6）、`WardGeo.areaKm2`（Task 2）、`wardTheme`（既存）
- Produces:
  - `loadWardProfile(code: string): WardProfile | null`
  - `WardProfile = { flower?: string; tree?: string; bird?: string; emblemNote?: string; policies: WardPolicy[] }`
  - `WardPolicy = { title: string; summary: string; source: string; url: string }`
  - WardPage の新セクション「区のこころざし」（policies空なら非表示）「区のプロフィール」（常時表示。区章は `/emblems/<slug>.svg` があれば表示）

- [ ] **Step 1: 失敗するテストを書く（`src/data/policies.test.ts`）**

```ts
import { describe, expect, it } from 'vitest';
import raw from './ward-policies.json';
import { loadWardProfile } from './policies';

const WARD_IDS = Array.from({ length: 23 }, (_, i) => `131${String(i + 1).padStart(2, '0')}`);

describe('ward-policies.json', () => {
  it('キーは正しい区コードのみ', () => {
    for (const code of Object.keys(raw)) expect(WARD_IDS).toContain(code);
  });
  it('政策は各区5件以下・出典URL必須・要約は中立的な長さ', () => {
    for (const p of Object.values(raw) as { policies?: { title: string; summary: string; url: string }[] }[]) {
      for (const policy of p.policies ?? []) {
        expect(policy.url).toMatch(/^https:\/\//);
        expect(policy.title.length).toBeLessThanOrEqual(30);
        expect(policy.summary.length).toBeLessThanOrEqual(120);
      }
      expect((p.policies ?? []).length).toBeLessThanOrEqual(5);
    }
  });
});

describe('loadWardProfile', () => {
  it('未収録の区は null を返す', () => {
    expect(loadWardProfile('13101')).toBeDefined(); // null か WardProfile（収録後はWardProfile）
  });
});
```

- [ ] **Step 2: 失敗確認 → 実装**

`src/data/ward-policies.json`: `{}`

`src/data/policies.ts`:

```ts
import raw from './ward-policies.json';

export interface WardPolicy { title: string; summary: string; source: string; url: string }
export interface WardProfile {
  flower?: string;
  tree?: string;
  bird?: string;
  emblemNote?: string;
  policies: WardPolicy[];
}

const DATA = raw as Record<string, Partial<WardProfile>>;

/** 手動キュレーションの区プロフィール。未収録区は null */
export function loadWardProfile(code: string): WardProfile | null {
  const entry = DATA[code];
  if (!entry) return null;
  return { ...entry, policies: entry.policies ?? [] };
}
```

- [ ] **Step 3: WardPageにセクション追加**

「主要駅」セクションの後、「なかま」の前に挿入:

```tsx
{profile && profile.policies.length > 0 && (
  <>
    <h2 className="ward-detail-evidence-title" style={{ marginTop: 24 }}>{ward.name}のこころざし</h2>
    <ol className="ward-policy-list">
      {profile.policies.map((p) => (
        <li key={p.title} className="ward-policy-item">
          <h3>{p.title}</h3>
          <p>{p.summary}</p>
          <a href={p.url} target="_blank" rel="noopener noreferrer">出典: {p.source}</a>
        </li>
      ))}
    </ol>
  </>
)}

<h2 className="ward-detail-evidence-title" style={{ marginTop: 24 }}>区のプロフィール</h2>
<div className="ward-profile-card">
  {/* eslint-disable-next-line @next/next/no-img-element */}
  <img className="ward-profile-emblem" src={`/emblems/${theme.slug}.svg`} alt={`${ward.name}の区章`}
    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
  <dl>
    <div><dt>人口</dt><dd>{detail.population.toLocaleString()}人</dd></div>
    <div><dt>面積</dt><dd>{geo.areaKm2.toFixed(1)}km²</dd></div>
    {profile?.flower && <div><dt>区の花</dt><dd>{profile.flower}</dd></div>}
    {profile?.tree && <div><dt>区の木</dt><dd>{profile.tree}</dd></div>}
    {profile?.bird && <div><dt>区の鳥</dt><dd>{profile.bird}</dd></div>}
  </dl>
</div>
```

冒頭に追加:

```tsx
const profile = loadWardProfile(ward.code);
const geo = loadWardGeo().find((g) => g.code === ward.code)!;
```

※ `ward-profile-card` は client component 内での `onError` が必要なため、WardPage が `'use client'` であることを確認（既にである）。

- [ ] **Step 4: CSS追加（`app/zukan.css` 末尾）**

```css
/* 区のこころざし（巻物風リスト） */
.ward-policy-list { list-style: none; margin: 8px 0 0; padding: 0; counter-reset: policy; }
.ward-policy-item {
  counter-increment: policy;
  padding: 12px 14px 12px 44px;
  position: relative;
  border-bottom: 1px dashed rgba(184, 146, 63, 0.4);
}
.ward-policy-item::before {
  content: counter(policy, cjk-ideographic);
  position: absolute;
  left: 10px;
  top: 12px;
  color: #b8923f;
  font-weight: 700;
}
.ward-policy-item h3 { margin: 0 0 4px; font-size: 15px; color: #4a3418; letter-spacing: 0.06em; }
.ward-policy-item p { margin: 0 0 6px; font-size: 13px; line-height: 1.7; color: #6a4f26; }
.ward-policy-item a { font-size: 11px; color: #7a5c2e; }

/* 区のプロフィール */
.ward-profile-card {
  display: flex;
  gap: 18px;
  align-items: center;
  padding: 14px 16px;
  border: 1px solid rgba(184, 146, 63, 0.55);
  border-radius: 8px;
  background: rgba(247, 236, 212, 0.6);
}
.ward-profile-emblem { width: 72px; height: 72px; filter: sepia(0.35) saturate(0.8); }
.ward-profile-card dl { display: flex; flex-wrap: wrap; gap: 6px 22px; margin: 0; }
.ward-profile-card dt { font-size: 11px; color: #7a5c2e; }
.ward-profile-card dd { margin: 0; font-size: 14px; font-weight: 600; color: #4a3418; }
```

- [ ] **Step 5: 全テスト＋ブラウザ確認＋コミット**

```bash
npm test
```

ブラウザで `/ward/minato/` を確認: 政策データが空なので「こころざし」は出ず、プロフィール（人口・面積のみ、区章は非表示フォールバック）が出る。

```bash
git add src/data/ward-policies.json src/data/policies.ts src/data/policies.test.ts src/ui/pages/WardPage.tsx app/zukan.css
git commit -m "feat: 区のこころざし・プロフィールセクションの器を追加（データは後続タスクで収録）"
```

---

### Task 10: 23区キュレーション（政策・花木鳥・区章SVG）

**Files:**
- Modify: `src/data/ward-policies.json`（23区分を収録）
- Create: `public/emblems/<slug>.svg` ×23

**Interfaces:**
- Consumes: Task 9のスキーマ・健全性テスト
- Produces: 23区分の `WardProfile` データと区章SVG

※ このタスクはコードではなく調査・起草。サブエージェントで区ごとに並列調査してよい。

- [ ] **Step 1: 区章SVGを収集**

Wikimedia Commons の各区章SVG（例: https://commons.wikimedia.org/wiki/Category:SVG_emblems_of_municipalities_in_Tōkyō ）から23区分をダウンロードし、**各ファイルのライセンスがパブリックドメインであることを個別に確認**（PD以外の区はスキップし `onError` フォールバックに任せる）。`public/emblems/<slug>.svg`（slugは `src/data/slugs.ts` の23slug）に保存。中立的表示に限定（区章条例配慮）。

- [ ] **Step 2: 政策の柱と花木鳥を起草**

各区の公式サイトから基本構想・基本計画のページを確認し、区ごとに:
- `policies`: 政策の柱3〜5個。title 30字以内・summary 120字以内・中立/前向きな表現・出典ページURL
- `flower` / `tree` / `bird`: 区の花・木・鳥（制定していない区は省略）

を `src/data/ward-policies.json` に収録する。**要約は原文の言い換えにとどめ、区間比較や評価を加えない。**

- [ ] **Step 3: 健全性テスト実行**

Run: `npx vitest run src/data/policies.test.ts`
Expected: PASS（URL形式・文字数制限・件数制限）

- [ ] **Step 4: ユーザーレビュー**

23区分の政策要約を一覧できる形（区名＋タイトル＋要約）で提示し、ユーザーのレビューを受ける。**レビュー承認までコミットしない。**

- [ ] **Step 5: 承認後コミット**

```bash
git add src/data/ward-policies.json public/emblems/
git commit -m "feat: 23区の政策の柱・花木鳥・区章を収録"
```

---

### Task 11: システム設計書の更新

**Files:**
- Modify: `docs/system-design/03-domain-design.md`（WardGeo・WardProfile・新統計フィールド）
- Modify: `docs/system-design/04-data-design.md`（ward-geo.json / ward-policies.json / build_geo.py / 新raw / 不変条件）
- Modify: `docs/system-design/05-frontend-rendering-design.md`（WardMapSectionの品質切替・2Dフォールバック）
- Modify: `docs/system-design/06-build-test-operation.md`（build_geo.py 手順・年次更新するデータ一覧）
- Modify: `AGENTS.md`（データ再生成コマンドに `build_geo.py` を追記）

- [ ] **Step 1: 各設計書を現行実装に合わせて更新**

書く内容: ルート構成は不変。データ形式（ward-geo.json / ward-policies.json / ward-details.json 追加フィールド）、生成手順（`/usr/bin/python3 data/build_geo.py` → cp）、フォールバック（WebGL不可・reduced motion・Canvas失敗→2D SVG地図）、手動キュレーションデータの更新運用（年1回見直し）、犯罪統計の中立表示方針（07-risks にも1項目追記）。

- [ ] **Step 2: コミット**

```bash
git add docs/system-design/ AGENTS.md
git commit -m "docs: 区詳細ページリデザインをシステム設計書に反映"
```

---

### Task 12: 最終検証

- [ ] **Step 1: 全テスト**

Run: `npm test`
Expected: 全件PASS

- [ ] **Step 2: 本番相当ビルド**

Run: `NEXT_PUBLIC_SITE_URL=https://example.pages.dev npm run build`
Expected: 成功。`out/ward/minato/index.html` が生成される。

- [ ] **Step 3: ブラウザ実機確認（devサーバー）**

- `/ward/minato/`: 3Dマップ（港区が浮上・発光・ピン）／レーダー／新統計3種入りStatBar／こころざし／プロフィール（区章・花木鳥・人口・面積）／主要駅／なかま／出典（ジオ・新統計の出典が載る）
- `/ward/minato/?view=2d`: 2D地図に切り替わる
- モバイル幅（375px）でレイアウト崩れなし
- コンソールエラーなし

- [ ] **Step 4: スクリーンショットを添えて完了報告**

verify系スキルの手順に従い、証跡（スクリーンショット・テスト出力）付きで報告する。
