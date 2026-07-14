# うちの区ちゃん — design conventions

Magical-picture-book aesthetic: a dark leather cover with parchment cards and gold ink. All UI copy is **Japanese**.

## Setup

No provider or wrapper is required — components are plain React. But the look depends on the page background: put screens on the dark leather (`#17110c`) and content on parchment. Use `className="book-section"` for full-bleed dark sections and compose parchment surfaces with the classes below. Body text is a system mincho serif stack (`'Hiragino Mincho ProN', 'Yu Mincho', 'Noto Serif JP', serif`) — never switch to sans-serif.

## Palette & tokens

Fixed hex palette (no CSS variables except one):

- Leather (page bg): `#17110c` · light text on it: `#f4e8d0`, muted `#d8c8a4`
- Parchment (card bg): `linear-gradient(180deg, #f7ecd4 0%, #eeddb8 100%)` · ink text on it: `#4a3418`, muted `#6a4f26`/`#7a5c2e`
- Gold (borders, accents, chart ink): `#b8923f`
- `--ward-color`: the ONE custom property — each ward's accent (from `wardTheme(code).color`). Set it inline on the card root: `style={{ ['--ward-color' as string]: wardTheme(ward.code).color }}`.

## Styling idiom

Plain global CSS classes from the shipped stylesheet (read `styles.css` → `_ds_bundle.css` for the full set). Core vocabulary:

- Sections: `book-section`, `book-section-inner`, `book-section-eyebrow`, `book-section-title`, `book-section-lede`
- Zukan grid: `zukan-grid`, `zukan-card`, `zukan-card-no`, `zukan-card-img`, `zukan-card-name`, `zukan-card-group`, `zukan-card-placeholder`
- Ward detail: `ward-detail`, `ward-detail-portrait`, `ward-detail-group`, `ward-detail-name`, `ward-detail-catch`, `ward-detail-radar`, `ward-detail-evidence`, `ward-detail-sources`
- Stats: `stat-bar` (used by the StatBar component), `stat-section-caption`; fellows: `fellow-grid`, `fellow-card`
- Diagnosis: `diagnosis`, `diagnosis-progress`, `diagnosis-question`, `diagnosis-options`, `diagnosis-option`

For new layout glue, inline styles with the palette above are fine; don't invent new class names that imitate these.

## Data & components

All content is real open data — never fabricate ward stats. Get wards from the bundle:

```tsx
import { Zukan, WardDetail, Radar, StatBar, ShareCard, Diagnosis,
         loadWards, wardTheme, ssrImage, xShareUrl, DATA_SOURCES } from 'kuchan-shindan-zukan';

const wards = loadWards();                 // 23 wards: {code, name, axes, group, metrics}
const w = wards.find((x) => x.name === '渋谷区')!;

<div className="book-section">
  <div className="book-section-inner">
    <p className="book-section-eyebrow">WARD FILE</p>
    <h2 className="book-section-title">{w.name}ちゃん</h2>
    <WardDetail ward={w} />
  </div>
</div>
```

- `Radar` draws the 5-axis chart (`vector={w.axes}`, optional `color`/`overlay`); axes are `liveliness/maturity/greenery/family/luxury` in `[-1,1]`.
- `Diagnosis onComplete={(v) => …}` runs the 10-question quiz; `Zukan onSelect={(w) => …}` is the clickable 23-card grid.
- Ward accent color and catchphrase: `wardTheme(w.code)` → `{slug, color, catch}`.
- **Portraits**: `ssrImage(slug)` returns `/characters/ssr/<slug>-w512.webp` — these files exist only in the deployed app, so portraits render as empty frames here. That is expected; don't try to substitute other images.
