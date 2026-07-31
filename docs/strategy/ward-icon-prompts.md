# 区アイコン 生成AIプロンプト集（23区分）

区詳細ページ「区のプロフィール」に72pxで表示する円形アイコンのプロンプト。
区章（各区の紋章）は新宿区・練馬区の使用承認要綱、荒川区の届出要綱などに抵触しうるため使用せず、
キャラクターのアイコンで置き換える方針とした。経緯は [来歴台帳](../system-design/08-asset-provenance.md) を参照する。

各区の現行SSR画像（`assets/characters/ssr/{slug}.png`）を**参照画像として必ず添付**して使う。
各区ブロックは共通プレフィックス込みで完結しているので、そのまま丸ごとコピペして1回の依頼で生成できる。

原則:

- 参照画像でキャラクターの同一性（顔・髪型・髪色・瞳色・シグネチャーカラー）を固定する
- 72pxで潰れないよう、線と色面を大胆に単純化する。小物は最大1つに絞る
- 円形マスクで欠けないよう、正方形の中央にバストアップを置き余白を確保する
- 背景は区のアクセントカラー1色のベタ塗り。風景・グラデーション・模様を禁止する
- 画像内に文字・ロゴ・枠線・ドロップシャドウを描かせない（枠と影はCSS側で付ける）

生成物は `assets/icons/{slug}.png` に保存し、`npm run build:icons` で
`public/icons/{slug}.webp`（256×256）へ変換する。丸抜きはCSSの `border-radius` で行う。

---

## 1. 千代田区（chiyoda）

```text
Create a simple flat vector-style circular avatar icon of the attached character, designed to stay instantly readable at 72x72 pixels.
Use the attached image as the strict character reference.
Preserve exactly the same face, hairstyle, hair color, eye color, and signature colors as the reference image. Do not redesign the character.
Compose a head-and-shoulders bust, centered in the frame, facing slightly to one side, filling most of the circle while keeping a generous margin so nothing important is cut by a circular crop.
Simplify aggressively: bold clean outlines, flat color fills, minimal cel shading, no fine texture, no small details that disappear at thumbnail size. Keep at most one signature accessory from the reference.
Background: a single flat solid color fill in the accent color below, clearly contrasting with the hair and skin. No scenery, no gradient, no pattern, no vignette.
Expression: friendly and calm with a slight smile.
Output a square image with the subject centered so that a circular crop is safe.
Negative: no text, no letters, no numbers, no logo, no watermark, no border ring, no drop shadow, no transparent checkerboard, no multiple characters, no full body, no hands raised over the face, no busy background, no gradient background, no photorealism, no redesigned hair color.

Character: Chiyoda — the dual-natured elite of day and night. Silver-white hair with midnight-blue inner color, gold/deep-blue heterochromatic eyes, tailored white-and-navy suit with gold trim, pocket watch showing both noon and midnight.
Icon accent color: silver
```

## 2. 中央区（chuo）

```text
Create a simple flat vector-style circular avatar icon of the attached character, designed to stay instantly readable at 72x72 pixels.
Use the attached image as the strict character reference.
Preserve exactly the same face, hairstyle, hair color, eye color, and signature colors as the reference image. Do not redesign the character.
Compose a head-and-shoulders bust, centered in the frame, facing slightly to one side, filling most of the circle while keeping a generous margin so nothing important is cut by a circular crop.
Simplify aggressively: bold clean outlines, flat color fills, minimal cel shading, no fine texture, no small details that disappear at thumbnail size. Keep at most one signature accessory from the reference.
Background: a single flat solid color fill in the accent color below, clearly contrasting with the hair and skin. No scenery, no gradient, no pattern, no vignette.
Expression: friendly and calm with a slight smile.
Output a square image with the subject centered so that a circular crop is safe.
Negative: no text, no letters, no numbers, no logo, no watermark, no border ring, no drop shadow, no transparent checkerboard, no multiple characters, no full body, no hands raised over the face, no busy background, no gradient background, no photorealism, no redesigned hair color.

Character: Chuo — the youngest, fastest-rising rookie. Aqua-blue glossy short bob, sparkling upturned eyes, smart office-casual jacket over a modern dress, sneaker-style heels, tablet and vintage compass.
Icon accent color: aqua blue
```

## 3. 港区（minato）

```text
Create a simple flat vector-style circular avatar icon of the attached character, designed to stay instantly readable at 72x72 pixels.
Use the attached image as the strict character reference.
Preserve exactly the same face, hairstyle, hair color, eye color, and signature colors as the reference image. Do not redesign the character.
Compose a head-and-shoulders bust, centered in the frame, facing slightly to one side, filling most of the circle while keeping a generous margin so nothing important is cut by a circular crop.
Simplify aggressively: bold clean outlines, flat color fills, minimal cel shading, no fine texture, no small details that disappear at thumbnail size. Keep at most one signature accessory from the reference.
Background: a single flat solid color fill in the accent color below, clearly contrasting with the hair and skin. No scenery, no gradient, no pattern, no vignette.
Expression: friendly and calm with a slight smile.
Output a square image with the subject centered so that a circular crop is safe.
Negative: no text, no letters, no numbers, no logo, no watermark, no border ring, no drop shadow, no transparent checkerboard, no multiple characters, no full body, no hands raised over the face, no busy background, no gradient background, no photorealism, no redesigned hair color.

Character: Minato — the glamorous absolute queen. Long champagne-gold hair with platinum highlights, confident amber eyes and elegant smirk, white-and-gold haute couture dress with asymmetric hem, jewelry, small Tokyo Tower-shaped tiara.
Icon accent color: champagne gold
```

## 4. 新宿区（shinjuku）

```text
Create a simple flat vector-style circular avatar icon of the attached character, designed to stay instantly readable at 72x72 pixels.
Use the attached image as the strict character reference.
Preserve exactly the same face, hairstyle, hair color, eye color, and signature colors as the reference image. Do not redesign the character.
Compose a head-and-shoulders bust, centered in the frame, facing slightly to one side, filling most of the circle while keeping a generous margin so nothing important is cut by a circular crop.
Simplify aggressively: bold clean outlines, flat color fills, minimal cel shading, no fine texture, no small details that disappear at thumbnail size. Keep at most one signature accessory from the reference.
Background: a single flat solid color fill in the accent color below, clearly contrasting with the hair and skin. No scenery, no gradient, no pattern, no vignette.
Expression: friendly and calm with a slight smile.
Output a square image with the subject centered so that a circular crop is safe.
Negative: no text, no letters, no numbers, no logo, no watermark, no border ring, no drop shadow, no transparent checkerboard, no multiple characters, no full body, no hands raised over the face, no busy background, no gradient background, no photorealism, no redesigned hair color.

Character: Shinjuku — the kind night owl who watches over everyone living alone. Deep purple layered hair with neon-pink streaks, sleepy but warm amber eyes, long black coat over a loose shirt, loosened tie, steaming canned coffee, earphones around neck.
Icon accent color: deep purple
```

## 5. 文京区（bunkyo）

```text
Create a simple flat vector-style circular avatar icon of the attached character, designed to stay instantly readable at 72x72 pixels.
Use the attached image as the strict character reference.
Preserve exactly the same face, hairstyle, hair color, eye color, and signature colors as the reference image. Do not redesign the character.
Compose a head-and-shoulders bust, centered in the frame, facing slightly to one side, filling most of the circle while keeping a generous margin so nothing important is cut by a circular crop.
Simplify aggressively: bold clean outlines, flat color fills, minimal cel shading, no fine texture, no small details that disappear at thumbnail size. Keep at most one signature accessory from the reference.
Background: a single flat solid color fill in the accent color below, clearly contrasting with the hair and skin. No scenery, no gradient, no pattern, no vignette.
Expression: friendly and calm with a slight smile.
Output a square image with the subject centered so that a circular crop is safe.
Negative: no text, no letters, no numbers, no logo, no watermark, no border ring, no drop shadow, no transparent checkerboard, no multiple characters, no full body, no hands raised over the face, no busy background, no gradient background, no photorealism, no redesigned hair color.

Character: Bunkyo — the well-bred scholar. Deep-green long straight hair with a low braid, calm hazel eyes behind thin glasses, dark-green academic cape over a crimson ribbon blouse, fountain pen behind her ear.
Icon accent color: deep green
```

## 6. 台東区（taito）

```text
Create a simple flat vector-style circular avatar icon of the attached character, designed to stay instantly readable at 72x72 pixels.
Use the attached image as the strict character reference.
Preserve exactly the same face, hairstyle, hair color, eye color, and signature colors as the reference image. Do not redesign the character.
Compose a head-and-shoulders bust, centered in the frame, facing slightly to one side, filling most of the circle while keeping a generous margin so nothing important is cut by a circular crop.
Simplify aggressively: bold clean outlines, flat color fills, minimal cel shading, no fine texture, no small details that disappear at thumbnail size. Keep at most one signature accessory from the reference.
Background: a single flat solid color fill in the accent color below, clearly contrasting with the hair and skin. No scenery, no gradient, no pattern, no vignette.
Expression: friendly and calm with a slight smile.
Output a square image with the subject centered so that a circular crop is safe.
Negative: no text, no letters, no numbers, no logo, no watermark, no border ring, no drop shadow, no transparent checkerboard, no multiple characters, no full body, no hands raised over the face, no busy background, no gradient background, no photorealism, no redesigned hair color.

Character: Taito — the spirited Edokko festival veteran. Fiery scarlet high ponytail with kanzashi, bold grin, deep-red happi coat with gold Edo patterns over modern streetwear, uchiwa fan.
Icon accent color: scarlet
```

## 7. 墨田区（sumida）

```text
Create a simple flat vector-style circular avatar icon of the attached character, designed to stay instantly readable at 72x72 pixels.
Use the attached image as the strict character reference.
Preserve exactly the same face, hairstyle, hair color, eye color, and signature colors as the reference image. Do not redesign the character.
Compose a head-and-shoulders bust, centered in the frame, facing slightly to one side, filling most of the circle while keeping a generous margin so nothing important is cut by a circular crop.
Simplify aggressively: bold clean outlines, flat color fills, minimal cel shading, no fine texture, no small details that disappear at thumbnail size. Keep at most one signature accessory from the reference.
Background: a single flat solid color fill in the accent color below, clearly contrasting with the hair and skin. No scenery, no gradient, no pattern, no vignette.
Expression: friendly and calm with a slight smile.
Output a square image with the subject centered so that a circular crop is safe.
Negative: no text, no letters, no numbers, no logo, no watermark, no border ring, no drop shadow, no transparent checkerboard, no multiple characters, no full body, no hands raised over the face, no busy background, no gradient background, no photorealism, no redesigned hair color.

Character: Sumida — the stubborn, warm-hearted craftswoman. Indigo-blue tight high ponytail with undercut, sharp focused eyes, sashiko-stitched navy work jacket with rolled sleeves, leather apron, work gloves, fine hammer.
Icon accent color: indigo
```

## 8. 江東区（koto）

```text
Create a simple flat vector-style circular avatar icon of the attached character, designed to stay instantly readable at 72x72 pixels.
Use the attached image as the strict character reference.
Preserve exactly the same face, hairstyle, hair color, eye color, and signature colors as the reference image. Do not redesign the character.
Compose a head-and-shoulders bust, centered in the frame, facing slightly to one side, filling most of the circle while keeping a generous margin so nothing important is cut by a circular crop.
Simplify aggressively: bold clean outlines, flat color fills, minimal cel shading, no fine texture, no small details that disappear at thumbnail size. Keep at most one signature accessory from the reference.
Background: a single flat solid color fill in the accent color below, clearly contrasting with the hair and skin. No scenery, no gradient, no pattern, no vignette.
Expression: friendly and calm with a slight smile.
Output a square image with the subject centered so that a circular crop is safe.
Negative: no text, no letters, no numbers, no logo, no watermark, no border ring, no drop shadow, no transparent checkerboard, no multiple characters, no full body, no hands raised over the face, no busy background, no gradient background, no photorealism, no redesigned hair color.

Character: Koto — the bright waterfront pioneer. Emerald-to-teal gradient half-up hair, sunny smile, sporty white parka with leaf-green accents, cargo shorts, sneakers, kayak paddle and a small potted sapling.
Icon accent color: emerald
```

## 9. 品川区（shinagawa）

```text
Create a simple flat vector-style circular avatar icon of the attached character, designed to stay instantly readable at 72x72 pixels.
Use the attached image as the strict character reference.
Preserve exactly the same face, hairstyle, hair color, eye color, and signature colors as the reference image. Do not redesign the character.
Compose a head-and-shoulders bust, centered in the frame, facing slightly to one side, filling most of the circle while keeping a generous margin so nothing important is cut by a circular crop.
Simplify aggressively: bold clean outlines, flat color fills, minimal cel shading, no fine texture, no small details that disappear at thumbnail size. Keep at most one signature accessory from the reference.
Background: a single flat solid color fill in the accent color below, clearly contrasting with the hair and skin. No scenery, no gradient, no pattern, no vignette.
Expression: friendly and calm with a slight smile.
Output a square image with the subject centered so that a circular crop is safe.
Negative: no text, no letters, no numbers, no logo, no watermark, no border ring, no drop shadow, no transparent checkerboard, no multiple characters, no full body, no hands raised over the face, no busy background, no gradient background, no photorealism, no redesigned hair color.

Character: Shinagawa — the ultimate competent career woman commuter, perfectly balanced between old post-town heritage and futuristic station city. Navy short bob with a single white streak, cool composed gray eyes, sharply fitted modern pantsuit with a subtle ukiyo-e wave-pattern lining, smartwatch, sleek briefcase.
Icon accent color: silver
```

## 10. 目黒区（meguro）

```text
Create a simple flat vector-style circular avatar icon of the attached character, designed to stay instantly readable at 72x72 pixels.
Use the attached image as the strict character reference.
Preserve exactly the same face, hairstyle, hair color, eye color, and signature colors as the reference image. Do not redesign the character.
Compose a head-and-shoulders bust, centered in the frame, facing slightly to one side, filling most of the circle while keeping a generous margin so nothing important is cut by a circular crop.
Simplify aggressively: bold clean outlines, flat color fills, minimal cel shading, no fine texture, no small details that disappear at thumbnail size. Keep at most one signature accessory from the reference.
Background: a single flat solid color fill in the accent color below, clearly contrasting with the hair and skin. No scenery, no gradient, no pattern, no vignette.
Expression: friendly and calm with a slight smile.
Output a square image with the subject centered so that a circular crop is safe.
Negative: no text, no letters, no numbers, no logo, no watermark, no border ring, no drop shadow, no transparent checkerboard, no multiple characters, no full body, no hands raised over the face, no busy background, no gradient background, no photorealism, no redesigned hair color.

Character: Meguro — the effortlessly stylish tastemaker of a quiet luxury residential town, relaxed but impeccably put together. Ash-pink wavy medium hair, half-lidded confident eyes, sunglasses pushed up on her head, oversized designer coat draped over shoulders, quality knitwear, small espresso cup.
Icon accent color: ash pink
```

## 11. 大田区（ota）

```text
Create a simple flat vector-style circular avatar icon of the attached character, designed to stay instantly readable at 72x72 pixels.
Use the attached image as the strict character reference.
Preserve exactly the same face, hairstyle, hair color, eye color, and signature colors as the reference image. Do not redesign the character.
Compose a head-and-shoulders bust, centered in the frame, facing slightly to one side, filling most of the circle while keeping a generous margin so nothing important is cut by a circular crop.
Simplify aggressively: bold clean outlines, flat color fills, minimal cel shading, no fine texture, no small details that disappear at thumbnail size. Keep at most one signature accessory from the reference.
Background: a single flat solid color fill in the accent color below, clearly contrasting with the hair and skin. No scenery, no gradient, no pattern, no vignette.
Expression: friendly and calm with a slight smile.
Output a square image with the subject centered so that a circular crop is safe.
Negative: no text, no letters, no numbers, no logo, no watermark, no border ring, no drop shadow, no transparent checkerboard, no multiple characters, no full body, no hands raised over the face, no busy background, no gradient background, no photorealism, no redesigned hair color.

Character: Ota — a cheerful hard-working big sister who keeps planes flying and neighbors smiling, town-factory pride and sento warmth. Orange-brown short spiky hair with a wrench-shaped hairpin, big friendly grin, mechanic jumpsuit tied at the waist over a white tee, tool belt, a sento towel around her neck.
Icon accent color: warm orange
```

## 12. 世田谷区（setagaya）

```text
Create a simple flat vector-style circular avatar icon of the attached character, designed to stay instantly readable at 72x72 pixels.
Use the attached image as the strict character reference.
Preserve exactly the same face, hairstyle, hair color, eye color, and signature colors as the reference image. Do not redesign the character.
Compose a head-and-shoulders bust, centered in the frame, facing slightly to one side, filling most of the circle while keeping a generous margin so nothing important is cut by a circular crop.
Simplify aggressively: bold clean outlines, flat color fills, minimal cel shading, no fine texture, no small details that disappear at thumbnail size. Keep at most one signature accessory from the reference.
Background: a single flat solid color fill in the accent color below, clearly contrasting with the hair and skin. No scenery, no gradient, no pattern, no vignette.
Expression: friendly and calm with a slight smile.
Output a square image with the subject centered so that a circular crop is safe.
Negative: no text, no letters, no numbers, no logo, no watermark, no border ring, no drop shadow, no transparent checkerboard, no multiple characters, no full body, no hands raised over the face, no busy background, no gradient background, no photorealism, no redesigned hair color.

Character: Setagaya — the gentle big sister of the largest family in Tokyo, unhurried, caring, always with room for one more. Milk-tea beige long wavy hair loosely braided over one shoulder, soft smiling eyes, long relaxed cardigan over a spring dress, wicker picnic basket, a hand-knit scarf trailing in the breeze.
Icon accent color: cream
```

## 13. 渋谷区（shibuya）

```text
Create a simple flat vector-style circular avatar icon of the attached character, designed to stay instantly readable at 72x72 pixels.
Use the attached image as the strict character reference.
Preserve exactly the same face, hairstyle, hair color, eye color, and signature colors as the reference image. Do not redesign the character.
Compose a head-and-shoulders bust, centered in the frame, facing slightly to one side, filling most of the circle while keeping a generous margin so nothing important is cut by a circular crop.
Simplify aggressively: bold clean outlines, flat color fills, minimal cel shading, no fine texture, no small details that disappear at thumbnail size. Keep at most one signature accessory from the reference.
Background: a single flat solid color fill in the accent color below, clearly contrasting with the hair and skin. No scenery, no gradient, no pattern, no vignette.
Expression: friendly and calm with a slight smile.
Output a square image with the subject centered so that a circular crop is safe.
Negative: no text, no letters, no numbers, no logo, no watermark, no border ring, no drop shadow, no transparent checkerboard, no multiple characters, no full body, no hands raised over the face, no busy background, no gradient background, no photorealism, no redesigned hair color.

Character: Shibuya — the trendsetter at the center of the world's busiest crossing, free, loud and impossible to ignore. Pink-to-cyan gradient hair in an asymmetric cut, glitter makeup, mixed street fashion — cropped neon jacket, layered accessories, platform sneakers, holographic phone in hand.
Icon accent color: magenta
```

## 14. 中野区（nakano）

```text
Create a simple flat vector-style circular avatar icon of the attached character, designed to stay instantly readable at 72x72 pixels.
Use the attached image as the strict character reference.
Preserve exactly the same face, hairstyle, hair color, eye color, and signature colors as the reference image. Do not redesign the character.
Compose a head-and-shoulders bust, centered in the frame, facing slightly to one side, filling most of the circle while keeping a generous margin so nothing important is cut by a circular crop.
Simplify aggressively: bold clean outlines, flat color fills, minimal cel shading, no fine texture, no small details that disappear at thumbnail size. Keep at most one signature accessory from the reference.
Background: a single flat solid color fill in the accent color below, clearly contrasting with the hair and skin. No scenery, no gradient, no pattern, no vignette.
Expression: friendly and calm with a slight smile.
Output a square image with the subject centered so that a circular crop is safe.
Negative: no text, no letters, no numbers, no logo, no watermark, no border ring, no drop shadow, no transparent checkerboard, no multiple characters, no full body, no hands raised over the face, no busy background, no gradient background, no photorealism, no redesigned hair color.

Character: Nakano — a laid-back subculture girl connoisseur living her best solo life, surrounded by treasures only she understands. Ash-gray messy medium hair, sharp knowing eyes behind the glow of a screen, oversized hoodie with retro game patches, chunky headphones around neck, handheld console in one hand.
Icon accent color: ash gray
```

## 15. 杉並区（suginami）

```text
Create a simple flat vector-style circular avatar icon of the attached character, designed to stay instantly readable at 72x72 pixels.
Use the attached image as the strict character reference.
Preserve exactly the same face, hairstyle, hair color, eye color, and signature colors as the reference image. Do not redesign the character.
Compose a head-and-shoulders bust, centered in the frame, facing slightly to one side, filling most of the circle while keeping a generous margin so nothing important is cut by a circular crop.
Simplify aggressively: bold clean outlines, flat color fills, minimal cel shading, no fine texture, no small details that disappear at thumbnail size. Keep at most one signature accessory from the reference.
Background: a single flat solid color fill in the accent color below, clearly contrasting with the hair and skin. No scenery, no gradient, no pattern, no vignette.
Expression: friendly and calm with a slight smile.
Output a square image with the subject centered so that a circular crop is safe.
Negative: no text, no letters, no numbers, no logo, no watermark, no border ring, no drop shadow, no transparent checkerboard, no multiple characters, no full body, no hands raised over the face, no busy background, no gradient background, no photorealism, no redesigned hair color.

Character: Suginami — a mellow bookish girl musician who found the perfect quiet street to live slow and deep. Olive-green soft shoulder-length hair tucked behind one ear, calm gentle eyes, loose vintage shirt with a corduroy jacket, canvas tote full of paperbacks, acoustic guitar.
Icon accent color: olive
```

## 16. 豊島区（toshima）

```text
Create a simple flat vector-style circular avatar icon of the attached character, designed to stay instantly readable at 72x72 pixels.
Use the attached image as the strict character reference.
Preserve exactly the same face, hairstyle, hair color, eye color, and signature colors as the reference image. Do not redesign the character.
Compose a head-and-shoulders bust, centered in the frame, facing slightly to one side, filling most of the circle while keeping a generous margin so nothing important is cut by a circular crop.
Simplify aggressively: bold clean outlines, flat color fills, minimal cel shading, no fine texture, no small details that disappear at thumbnail size. Keep at most one signature accessory from the reference.
Background: a single flat solid color fill in the accent color below, clearly contrasting with the hair and skin. No scenery, no gradient, no pattern, no vignette.
Expression: friendly and calm with a slight smile.
Output a square image with the subject centered so that a circular crop is safe.
Negative: no text, no letters, no numbers, no logo, no watermark, no border ring, no drop shadow, no transparent checkerboard, no multiple characters, no full body, no hands raised over the face, no busy background, no gradient background, no photorealism, no redesigned hair color.

Character: Toshima — a small explosive city kid who turned the densest concrete jungle into her personal playground, never runs out of energy. Vivid yellow twin-tails with black inner color, huge sparkling eyes, sporty oversized streetwear in yellow and black, sneakers with LED soles, a small owl companion perched on her shoulder.
Icon accent color: vivid yellow
```

## 17. 北区（kita）

```text
Create a simple flat vector-style circular avatar icon of the attached character, designed to stay instantly readable at 72x72 pixels.
Use the attached image as the strict character reference.
Preserve exactly the same face, hairstyle, hair color, eye color, and signature colors as the reference image. Do not redesign the character.
Compose a head-and-shoulders bust, centered in the frame, facing slightly to one side, filling most of the circle while keeping a generous margin so nothing important is cut by a circular crop.
Simplify aggressively: bold clean outlines, flat color fills, minimal cel shading, no fine texture, no small details that disappear at thumbnail size. Keep at most one signature accessory from the reference.
Background: a single flat solid color fill in the accent color below, clearly contrasting with the hair and skin. No scenery, no gradient, no pattern, no vignette.
Expression: friendly and calm with a slight smile.
Output a square image with the subject centered so that a circular crop is safe.
Negative: no text, no letters, no numbers, no logo, no watermark, no border ring, no drop shadow, no transparent checkerboard, no multiple characters, no full body, no hands raised over the face, no busy background, no gradient background, no photorealism, no redesigned hair color.

Character: Kita — a warm-hearted girl raised by her grandmother, keeper of Showa-era warmth, croquettes and cherry blossoms by the train tracks. Brick-red bob hair with a retro flower pin, round warm eyes, vintage-style sailor blouse with a hand-me-down cardigan, paper bag of fresh croquettes hugged to her chest.
Icon accent color: brick red
```

## 18. 荒川区（arakawa）

```text
Create a simple flat vector-style circular avatar icon of the attached character, designed to stay instantly readable at 72x72 pixels.
Use the attached image as the strict character reference.
Preserve exactly the same face, hairstyle, hair color, eye color, and signature colors as the reference image. Do not redesign the character.
Compose a head-and-shoulders bust, centered in the frame, facing slightly to one side, filling most of the circle while keeping a generous margin so nothing important is cut by a circular crop.
Simplify aggressively: bold clean outlines, flat color fills, minimal cel shading, no fine texture, no small details that disappear at thumbnail size. Keep at most one signature accessory from the reference.
Background: a single flat solid color fill in the accent color below, clearly contrasting with the hair and skin. No scenery, no gradient, no pattern, no vignette.
Expression: friendly and calm with a slight smile.
Output a square image with the subject centered so that a circular crop is safe.
Negative: no text, no letters, no numbers, no logo, no watermark, no border ring, no drop shadow, no transparent checkerboard, no multiple characters, no full body, no hands raised over the face, no busy background, no gradient background, no photorealism, no redesigned hair color.

Character: Arakawa — a modest, endlessly family-minded girl whose small acts of care are her greatest treasure. Cream-blonde gentle low twin-tails with ribbon, kind humble smile, simple hand-sewn apron dress in cream and sky blue, holding a beautifully packed homemade bento wrapped in cloth.
Icon accent color: cream
```

## 19. 板橋区（itabashi）

```text
Create a simple flat vector-style circular avatar icon of the attached character, designed to stay instantly readable at 72x72 pixels.
Use the attached image as the strict character reference.
Preserve exactly the same face, hairstyle, hair color, eye color, and signature colors as the reference image. Do not redesign the character.
Compose a head-and-shoulders bust, centered in the frame, facing slightly to one side, filling most of the circle while keeping a generous margin so nothing important is cut by a circular crop.
Simplify aggressively: bold clean outlines, flat color fills, minimal cel shading, no fine texture, no small details that disappear at thumbnail size. Keep at most one signature accessory from the reference.
Background: a single flat solid color fill in the accent color below, clearly contrasting with the hair and skin. No scenery, no gradient, no pattern, no vignette.
Expression: friendly and calm with a slight smile.
Output a square image with the subject centered so that a circular crop is safe.
Negative: no text, no letters, no numbers, no logo, no watermark, no border ring, no drop shadow, no transparent checkerboard, no multiple characters, no full body, no hands raised over the face, no busy background, no gradient background, no photorealism, no redesigned hair color.

Character: Itabashi — the dependable neighborhood big sister in a jersey, humble on the surface, quietly mature and steady inside. Greenish-black hair in a sporty high ponytail, easygoing reliable smile, classic green-line jersey worn open over a tee, sports towel, carrying overflowing shopping bags from the local arcade in both arms.
Icon accent color: jersey green
```

## 20. 練馬区（nerima）

```text
Create a simple flat vector-style circular avatar icon of the attached character, designed to stay instantly readable at 72x72 pixels.
Use the attached image as the strict character reference.
Preserve exactly the same face, hairstyle, hair color, eye color, and signature colors as the reference image. Do not redesign the character.
Compose a head-and-shoulders bust, centered in the frame, facing slightly to one side, filling most of the circle while keeping a generous margin so nothing important is cut by a circular crop.
Simplify aggressively: bold clean outlines, flat color fills, minimal cel shading, no fine texture, no small details that disappear at thumbnail size. Keep at most one signature accessory from the reference.
Background: a single flat solid color fill in the accent color below, clearly contrasting with the hair and skin. No scenery, no gradient, no pattern, no vignette.
Expression: friendly and calm with a slight smile.
Output a square image with the subject centered so that a circular crop is safe.
Negative: no text, no letters, no numbers, no logo, no watermark, no border ring, no drop shadow, no transparent checkerboard, no multiple characters, no full body, no hands raised over the face, no busy background, no gradient background, no photorealism, no redesigned hair color.

Character: Nerima — the eldest daughter of a big family, half farmer half anime nerd, takes care of everyone with a huge open smile. Yellow-green tousled twin braids under a pushed-back straw hat, bright friendly eyes, work overalls with one strap down over an anime-print tee, watering can in one hand, a cabbage under the other arm.
Icon accent color: yellow-green
```

## 21. 足立区（adachi）

```text
Create a simple flat vector-style circular avatar icon of the attached character, designed to stay instantly readable at 72x72 pixels.
Use the attached image as the strict character reference.
Preserve exactly the same face, hairstyle, hair color, eye color, and signature colors as the reference image. Do not redesign the character.
Compose a head-and-shoulders bust, centered in the frame, facing slightly to one side, filling most of the circle while keeping a generous margin so nothing important is cut by a circular crop.
Simplify aggressively: bold clean outlines, flat color fills, minimal cel shading, no fine texture, no small details that disappear at thumbnail size. Keep at most one signature accessory from the reference.
Background: a single flat solid color fill in the accent color below, clearly contrasting with the hair and skin. No scenery, no gradient, no pattern, no vignette.
Expression: friendly and calm with a slight smile.
Output a square image with the subject centered so that a circular crop is safe.
Negative: no text, no letters, no numbers, no logo, no watermark, no border ring, no drop shadow, no transparent checkerboard, no multiple characters, no full body, no hands raised over the face, no busy background, no gradient background, no photorealism, no redesigned hair color.

Character: Adachi — the gentle-hearted big-sister boss (anego) of downtown, twisted headband, big laugh, everyone's protector on fireworks night. Sunset-orange wild long hair swept back with a navy twisted hachimaki, broad fearless grin, open festival vest over a summer yukata tied boldly, strong athletic build, a paper fan tucked in her obi belt.
Icon accent color: sunset orange
```

## 22. 葛飾区（katsushika）

```text
Create a simple flat vector-style circular avatar icon of the attached character, designed to stay instantly readable at 72x72 pixels.
Use the attached image as the strict character reference.
Preserve exactly the same face, hairstyle, hair color, eye color, and signature colors as the reference image. Do not redesign the character.
Compose a head-and-shoulders bust, centered in the frame, facing slightly to one side, filling most of the circle while keeping a generous margin so nothing important is cut by a circular crop.
Simplify aggressively: bold clean outlines, flat color fills, minimal cel shading, no fine texture, no small details that disappear at thumbnail size. Keep at most one signature accessory from the reference.
Background: a single flat solid color fill in the accent color below, clearly contrasting with the hair and skin. No scenery, no gradient, no pattern, no vignette.
Expression: friendly and calm with a slight smile.
Output a square image with the subject centered so that a circular crop is safe.
Negative: no text, no letters, no numbers, no logo, no watermark, no border ring, no drop shadow, no transparent checkerboard, no multiple characters, no full body, no hands raised over the face, no busy background, no gradient background, no photorealism, no redesigned hair color.

Character: Katsushika — a wandering free-spirited girl with the deepest family bonds in Tokyo, a Tora-san-inspired charmer who always comes home. Warm brown slightly wavy hair under a classic fedora-style hat, crinkled smiling eyes, retro checked jacket over a haramaki belly band, old leather travel trunk in one hand.
Icon accent color: warm brown
```

## 23. 江戸川区（edogawa）

```text
Create a simple flat vector-style circular avatar icon of the attached character, designed to stay instantly readable at 72x72 pixels.
Use the attached image as the strict character reference.
Preserve exactly the same face, hairstyle, hair color, eye color, and signature colors as the reference image. Do not redesign the character.
Compose a head-and-shoulders bust, centered in the frame, facing slightly to one side, filling most of the circle while keeping a generous margin so nothing important is cut by a circular crop.
Simplify aggressively: bold clean outlines, flat color fills, minimal cel shading, no fine texture, no small details that disappear at thumbnail size. Keep at most one signature accessory from the reference.
Background: a single flat solid color fill in the accent color below, clearly contrasting with the hair and skin. No scenery, no gradient, no pattern, no vignette.
Expression: friendly and calm with a slight smile.
Output a square image with the subject centered so that a circular crop is safe.
Negative: no text, no letters, no numbers, no logo, no watermark, no border ring, no drop shadow, no transparent checkerboard, no multiple characters, no full body, no hands raised over the face, no busy background, no gradient background, no photorealism, no redesigned hair color.

Character: Edogawa — the youngest of the whole 23-ward family, a little tomboy gang-leader girl of the great outdoors with the biggest park kingdom in Tokyo. Vivid green unruly short twin-tails with a big leaf perched on top like a crown, sparkling mischievous eyes, tank top and shorts with a net over her shoulder, insect cage on her hip, band-aid on one cheek, a little penguin buddy running beside her.
Icon accent color: vivid green
```

---

## 生成後チェックリスト

- [ ] 23区すべての `assets/icons/{slug}.png` がそろっている（slugは `src/data/slugs.ts` と一致）
- [ ] 正方形で、中央のバストアップが円形クロップで欠けない
- [ ] 72pxに縮小しても、髪色とシルエットでどの区ちゃんか見分けられる
- [ ] 画像内に文字・ロゴ・枠線・影が描き込まれていない
- [ ] 背景がベタ塗り1色で、キャラクターとのコントラストが十分にある
- [ ] 参照画像と髪色・瞳色・シグネチャーカラーが一致している
- [ ] `npm run build:icons` を実行し、`public/icons/{slug}.webp` が23件生成された
