# プレゼン資料用 生成AIプロンプト集（First Stage 2分プレゼン）

[2分プレゼン構成案.md](../submission/2分プレゼン構成案.md) のドラフトデッキ（`docs/submission/presentation/uchinokuchan-first-stage-draft.pptx`）の装飾画像をChatGPTで生成するためのプロンプト。[og-image-prompts.md](og-image-prompts.md) と同じ運用原則に従う。

## 共通原則

- デッキのパレットに合わせる: 背景 `#17110C`（濃茶）、羊皮紙 `#F4E8D0`、金 `#B8923F`。アプリの「夜の絵本」世界観と統一する。
- **画像内に文字・ロゴ・ウォーターマークを入れない**（テキストはスライド側で載せる）。
- キャラクターを含む場合は該当区のSSR画像（`assets/characters/ssr/{slug}.png`）を**参照画像として必ず添付**し、同一性を固定する。
- 生成原本は `assets/presentation/` に置き、[来歴台帳](../system-design/08-asset-provenance.md) に生成ツール・生成日・参照素材を追記する（未整理アセットを増やさない）。
- スライドへの反映は PowerPoint 上で対象画像を右クリック →「図の変更」で差し替える。
- 否定的な地域表現・特定の実在人物・実在ブランドの写り込みを避ける（生成後に人が確認）。

## 現状の充足状況

| スライド | 現状 | 生成の要否 |
|---|---|---|
| ① 表紙 | `assets/og/home.png`（既存・高品質） | 不要 |
| ② 課題 | 世田谷区ちゃんSSR画像で成立 | 任意（A案で差し替え可） |
| ③ コンセプト | 図形のみで成立 | 任意（B案を右余白に追加可) |
| ④ デモ | 動画プレースホルダー | 不要（実機動画を埋め込む） |
| ⑤ データ×技術 | 新宿区アイコンで成立 | 不要 |
| ⑥ 広がり | `assets/og/setagaya.png`＋QRで成立 | 不要 |
| 全スライド背景 | プログラム生成のダークグラデ | **推奨（C案。6枚に効く）** |

---

## A. スライド②用「関心の外」情景イラスト（任意）

世田谷区ちゃんの代わりに、課題を情景で語る1枚。

```text
Create a moody anime-style storybook illustration, wide landscape composition designed for 16:9 slides.
Scene: a young adult in casual clothes sits absorbed in a glowing smartphone at night, while beside them on a park bench lies a beautiful ornate closed book faintly glowing gold — unnoticed. The closed book represents information about their own town, quietly waiting.
Mood: gentle, wistful, not accusatory. The person is not portrayed negatively — simply looking the other way.
Style: painterly dark-fantasy picture-book art, deep warm brown-black night palette (#17110C base), soft gold light (#B8923F) leaking from the book's page edges, parchment-cream highlights (#F4E8D0), floating dust-of-light particles, cinematic depth of field.
Composition: subject on the right half, left half kept dark and uncluttered so slide text remains readable.
Negative: no text, no logo, no watermark, no recognizable real-world landmarks, no visible smartphone UI, no sad or crying expression.
```

配置: スライド②の右側（現在の世田谷区ちゃんの位置、約2.05×3.08インチ相当の縦長トリミングでも成立するよう右半分に主題を寄せている）。差し替えた場合はキャプション「世田谷区ちゃん」を削除する。

## B. スライド③用「診断されたい→出会い」挿絵（任意）

コンセプトの4枚カードの下または右余白に置く小さな挿絵。

```text
Create a small anime-style storybook spot illustration, square composition, transparent or very dark background suitable for placement on a dark brown (#17110C) slide.
Scene: a pair of hands holds a smartphone from which a ribbon of warm golden light (#B8923F) arcs upward and outward, and at the ribbon's end a tiny glowing silhouette of a cheerful girl emerges from the pages of an open antique book — the moment of "meeting the ward that resembles you".
Style: painterly dark-fantasy picture-book art, gold and parchment-cream (#F4E8D0) glow on deep brown-black, sparkling particles, soft rim light.
Keep the silhouette generic — do NOT depict any specific existing character design.
Negative: no text, no logo, no watermark, no visible smartphone UI, no specific ward character likeness.
```

配置: スライド③のキャプション行の右側（約1.6×1.6インチ）。入れる場合はキャプション幅を w7.2 に狭める。

## C. 全スライド共通の背景テクスチャ（推奨）

現在はプログラム生成の単純なラジアルグラデーション。世界観を強化する背景に差し替える。6枚すべてに効くため費用対効果が最も高い。

```text
Create a subtle background texture for presentation slides, wide landscape 16:9, high resolution.
Base: very dark warm brown (#17110C) with a gentle radial glow toward the upper center (#2A1E12), like the inside of a candle-lit antique library at night.
Texture: extremely faint aged-parchment grain and a few scattered soft gold (#B8923F) light particles like drifting dust motes; corners slightly darker (vignette).
CRITICAL: the background must stay quiet and low-contrast — no shapes, no objects, no characters, no stars forming patterns, no light rays, nothing that competes with foreground text. Overall brightness must remain very dark so cream-colored (#F4E8D0) text stays highly readable anywhere on the canvas.
Negative: no text, no logo, no watermark, no visible brush strokes, no bright areas, no bokeh circles larger than a few pixels.
```

配置: 全内容スライドの背景。差し替えは各スライドの背景画像を置換（デッキ再生成時は `deck-assets/bg.png` を置き換え）。**差し替え後は必ず全スライドを書き出して文字の可読性を再確認する。**

---

## 差し替え後のチェック

- [ ] 生成原本を `assets/presentation/` に保存し、来歴台帳に追記した
- [ ] 画像内に文字・ロゴ・意図しない実在物が写り込んでいない
- [ ] スライド全枚を画像書き出しして可読性・重なりを確認した
- [ ] 否定的・スティグマ的な表現になっていない
