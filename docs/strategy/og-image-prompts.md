# OG画像 生成AIプロンプト集（23区分）

nazotypeの `nazotype-type-ogp-images` スキルの設計を踏襲したOGP画像生成プロンプト。
各区の現行SSR画像（`assets/characters/ssr/{slug}.png`）を**参照画像として必ず添付**して使う。

各区ブロックは共通プレフィックス込みで完結しているので、そのまま丸ごとコピペして1回の依頼で生成できる。

nazotypeから引き継ぐ原則:

- 参照画像でキャラクターの同一性（顔・髪型・衣装・小物・パレット）を固定し、毎回明示する
- ポーズは参照より大胆に。非対称・動きの途中・斜めのアクションを強制し、静的なステッカーポーズを禁止する
- タイトル文字（`○○区ちゃん`）はモデルに画像内タイポグラフィとして描かせる
- 右下に小さなセーフエリアを空け、サービスラベル「うちの区ちゃん」はローカル合成で載せる
- 背景は白抜きステッカー風を禁止し、奥行きと動きのあるシネマティックな設計にする
- 余計な文字・ロゴ・ウォーターマーク・複数キャラを禁止する

出力は1200x630へリサイズ/クロップ後、右下にブランドラベルを合成する。

---

## 1. 千代田区（chiyoda）

```text
Create a polished anime-style OGP share card for X (Twitter), wide landscape composition designed for 1200x630.
Use the attached image as the strict character reference.
Preserve exactly the same face, hairstyle, hair color, eye color, outfit, props, and core color palette as the reference image. Do not redesign the character.
Compose exactly one female character, large in frame on the right side, with a clean silhouette that reads clearly at social-card thumbnail size.
Make the pose bold, asymmetrical, and mid-action — clearly more dynamic than the reference, never a static standing or mascot pose.
Render the exact Japanese title text 「千代田区ちゃん」 inside the image on the left side as large integrated editorial typography. Keep the spelling exactly as given and do not add any other text.
Build a substantial cinematic background with depth, perspective, and motion energy; keep the left text side readable and uncluttered.
Keep a small clean safe area in the bottom-right corner for a service label.
Style: high-quality anime gacha-game splash art, vivid saturated colors, dramatic rim lighting, glowing particle effects, bokeh lights, detailed painterly finish.
Negative: no extra text, no logo, no watermark, no multiple characters, no plain white background, no empty gradient background, no tiny character, no redesigned outfit, no missing props, no wrong spelling.

Character: Chiyoda — the dual-natured elite of day and night. Silver-white hair with midnight-blue inner color, gold/deep-blue heterochromatic eyes, tailored white-and-navy suit with gold trim, pocket watch showing both noon and midnight.
Pose direction: do NOT reuse the reference image's symmetric front-facing standing pose — invent a distinctly different, bolder action instead. Low dutch-angle shot from the rooftop floor: she strides straight off the edge of a glass rooftop without hesitation, caught mid-air the instant her heels leave the ledge, coat and silver hair flung in a hard diagonal, snapping the pocket watch shut behind her back — daylight striking one side of her body, moonlight the other.
Background: the card itself is split — left (text side) calm moonlit Imperial Palace forest in deep navy for readability, right bright Marunouchi daytime skyline with light particles; the split line runs diagonally behind her.
Palette: silver, navy, imperial gold.
```

## 2. 中央区（chuo）

```text
Create a polished anime-style OGP share card for X (Twitter), wide landscape composition designed for 1200x630.
Use the attached image as the strict character reference.
Preserve exactly the same face, hairstyle, hair color, eye color, outfit, props, and core color palette as the reference image. Do not redesign the character.
Compose exactly one female character, large in frame on the right side, with a clean silhouette that reads clearly at social-card thumbnail size.
Make the pose bold, asymmetrical, and mid-action — clearly more dynamic than the reference, never a static standing or mascot pose.
Render the exact Japanese title text 「中央区ちゃん」 inside the image on the left side as large integrated editorial typography. Keep the spelling exactly as given and do not add any other text.
Build a substantial cinematic background with depth, perspective, and motion energy; keep the left text side readable and uncluttered.
Keep a small clean safe area in the bottom-right corner for a service label.
Style: high-quality anime gacha-game splash art, vivid saturated colors, dramatic rim lighting, glowing particle effects, bokeh lights, detailed painterly finish.
Negative: no extra text, no logo, no watermark, no multiple characters, no plain white background, no empty gradient background, no tiny character, no redesigned outfit, no missing props, no wrong spelling.

Character: Chuo — the youngest, fastest-rising rookie. Aqua-blue glossy short bob, sparkling upturned eyes, smart office-casual jacket over a modern dress, sneaker-style heels, tablet and vintage compass.
Pose direction: do NOT reuse the reference image's jumping-over-the-bridge pose — invent a distinctly different, bolder action instead. She plants one hand on the bridge's stone railing and whips into a sharp acrobatic handspring, fully inverted and airborne at the peak of the flip, legs scissored high in a steep diagonal, aqua-blue hair whipping downward like a comet tail, her free arm flung wide as the vintage compass spins loose on its chain and the tablet hangs weightless in the air beside her.
Background: morning sun breaking low between glass high-rise towers right at Nihonbashi bridge, the stone railing and river glinting just behind her, sharp motion-blur streaks trailing from the spin, loose papers scattering outward from the force of the flip; keep the left sky area clean for the title.
Palette: aqua blue, white, sunrise gold.
```

## 3. 港区（minato）

```text
Create a polished anime-style OGP share card for X (Twitter), wide landscape composition designed for 1200x630.
Use the attached image as the strict character reference.
Preserve exactly the same face, hairstyle, hair color, eye color, outfit, props, and core color palette as the reference image. Do not redesign the character.
Compose exactly one female character, large in frame on the right side, with a clean silhouette that reads clearly at social-card thumbnail size.
Make the pose bold, asymmetrical, and mid-action — clearly more dynamic than the reference, never a static standing or mascot pose.
Render the exact Japanese title text 「港区ちゃん」 inside the image on the left side as large integrated editorial typography. Keep the spelling exactly as given and do not add any other text.
Build a substantial cinematic background with depth, perspective, and motion energy; keep the left text side readable and uncluttered.
Keep a small clean safe area in the bottom-right corner for a service label.
Style: high-quality anime gacha-game splash art, vivid saturated colors, dramatic rim lighting, glowing particle effects, bokeh lights, detailed painterly finish.
Negative: no extra text, no logo, no watermark, no multiple characters, no plain white background, no empty gradient background, no tiny character, no redesigned outfit, no missing props, no wrong spelling.

Character: Minato — the glamorous absolute queen. Long champagne-gold hair with platinum highlights, confident amber eyes and elegant smirk, white-and-gold haute couture dress with asymmetric hem, jewelry, small Tokyo Tower-shaped tiara.
Pose direction: do NOT reuse the reference image's low-angle standing queen pose — invent a distinctly different, bolder action instead. Bird's-eye aerial shot looking straight down: she reclines back across the edge of a glass helipad high above the bay, one knee raised, champagne-gold hair pooling in waves over the glowing helipad ring, flicking the gold coin straight up at the camera with a victorious smirk.
Background: far below her, Tokyo Tower glowing red-orange and the glittering bay-area high-rises spread out like her personal chessboard, champagne sparkle particles rising toward the lens; the darker bay water on the left carries the title.
Palette: champagne gold, white, night navy.
```

## 4. 新宿区（shinjuku）

```text
Create a polished anime-style OGP share card for X (Twitter), wide landscape composition designed for 1200x630.
Use the attached image as the strict character reference.
Preserve exactly the same face, hairstyle, hair color, eye color, outfit, props, and core color palette as the reference image. Do not redesign the character.
Compose exactly one female character, large in frame on the right side, with a clean silhouette that reads clearly at social-card thumbnail size.
Make the pose bold, asymmetrical, and mid-action — clearly more dynamic than the reference, never a static standing or mascot pose.
Render the exact Japanese title text 「新宿区ちゃん」 inside the image on the left side as large integrated editorial typography. Keep the spelling exactly as given and do not add any other text.
Build a substantial cinematic background with depth, perspective, and motion energy; keep the left text side readable and uncluttered.
Keep a small clean safe area in the bottom-right corner for a service label.
Style: high-quality anime gacha-game splash art, vivid saturated colors, dramatic rim lighting, glowing particle effects, bokeh lights, detailed painterly finish.
Negative: no extra text, no logo, no watermark, no multiple characters, no plain white background, no empty gradient background, no tiny character, no redesigned outfit, no missing props, no wrong spelling.

Character: Shinjuku — the kind night owl who watches over everyone living alone. Deep purple layered hair with neon-pink streaks, sleepy but warm amber eyes, long black coat over a loose shirt, loosened tie, steaming canned coffee, earphones around neck.
Pose direction: do NOT reuse the reference image's looking-up-from-the-alley pose — invent a distinctly different, bolder action instead. Ground-level shot from a rain puddle at 2 a.m.: she drops into a deep crouch right into frame, one knee on the wet asphalt, holding the steaming coffee can out toward the lens like a small rescue, coat pooling around her boots, neon reflections rippling outward from where she landed, her tired kind smile filling the upper frame.
Background: the rain-slicked Kabukicho alley rising behind her, pink/purple/cyan neon signs doubled in the puddle across the foreground like a shattered mirror; darker, calmer neon glow on the left text side.
Palette: deep purple, neon pink, cyan.
```

## 5. 文京区（bunkyo）

```text
Create a polished anime-style OGP share card for X (Twitter), wide landscape composition designed for 1200x630.
Use the attached image as the strict character reference.
Preserve exactly the same face, hairstyle, hair color, eye color, outfit, props, and core color palette as the reference image. Do not redesign the character.
Compose exactly one female character, large in frame on the right side, with a clean silhouette that reads clearly at social-card thumbnail size.
Make the pose bold, asymmetrical, and mid-action — clearly more dynamic than the reference, never a static standing or mascot pose.
Render the exact Japanese title text 「文京区ちゃん」 inside the image on the left side as large integrated editorial typography. Keep the spelling exactly as given and do not add any other text.
Build a substantial cinematic background with depth, perspective, and motion energy; keep the left text side readable and uncluttered.
Keep a small clean safe area in the bottom-right corner for a service label.
Style: high-quality anime gacha-game splash art, vivid saturated colors, dramatic rim lighting, glowing particle effects, bokeh lights, detailed painterly finish.
Negative: no extra text, no logo, no watermark, no multiple characters, no plain white background, no empty gradient background, no tiny character, no redesigned outfit, no missing props, no wrong spelling.

Character: Bunkyo — the well-bred scholar. Deep-green long straight hair with a low braid, calm hazel eyes behind thin glasses, dark-green academic cape over a crimson ribbon blouse, fountain pen behind her ear.
Pose direction: do NOT reuse the reference image's sitting-atop-the-book-tower pose — invent a distinctly different, bolder action instead. Worm's-eye shot from the library floor looking straight up the spiraling tower of giant books: she has stepped off the top edge and floats down toward the camera, cape spread wide like wings, one hand steadying her glasses, the other catching a glowing open book mid-fall, skirt and loose pages fluttering upward past her.
Background: the book spiral corkscrewing up toward a grand skylight of warm afternoon light, ginkgo leaves and glowing letters raining down past her toward the lens; soft dark green depths on the left for the title.
Palette: deep green, burgundy, warm gold.
```

## 6. 台東区（taito）

```text
Create a polished anime-style OGP share card for X (Twitter), wide landscape composition designed for 1200x630.
Use the attached image as the strict character reference.
Preserve exactly the same face, hairstyle, hair color, eye color, outfit, props, and core color palette as the reference image. Do not redesign the character.
Compose exactly one female character, large in frame on the right side, with a clean silhouette that reads clearly at social-card thumbnail size.
Make the pose bold, asymmetrical, and mid-action — clearly more dynamic than the reference, never a static standing or mascot pose.
Render the exact Japanese title text 「台東区ちゃん」 inside the image on the left side as large integrated editorial typography. Keep the spelling exactly as given and do not add any other text.
Build a substantial cinematic background with depth, perspective, and motion energy; keep the left text side readable and uncluttered.
Keep a small clean safe area in the bottom-right corner for a service label.
Style: high-quality anime gacha-game splash art, vivid saturated colors, dramatic rim lighting, glowing particle effects, bokeh lights, detailed painterly finish.
Negative: no extra text, no logo, no watermark, no multiple characters, no plain white background, no empty gradient background, no tiny character, no redesigned outfit, no missing props, no wrong spelling.

Character: Taito — the spirited Edokko festival veteran. Fiery scarlet high ponytail with kanzashi, bold grin, deep-red happi coat with gold Edo patterns over modern streetwear, uchiwa fan.
Pose direction: do NOT reuse the reference image's dancing-on-the-float-seen-from-below pose — invent a distinctly different, bolder action instead. High crane shot from above the festival: she leaps the gap between two float rooftops mid-dance, body stretched in a wild diagonal, fan snapped open overhead, happi coat flying, looking up at the camera with a fearless grin as the lantern-lit crowd swirls dizzyingly far below.
Background: a sea of glowing chochin lanterns and festival streets beneath her, Kaminarimon's giant red lantern in the distance, fireworks bursting at the camera's own altitude; the twilight sky on the left stays clear for the title.
Palette: scarlet, gold, twilight indigo.
```

## 7. 墨田区（sumida）

```text
Create a polished anime-style OGP share card for X (Twitter), wide landscape composition designed for 1200x630.
Use the attached image as the strict character reference.
Preserve exactly the same face, hairstyle, hair color, eye color, outfit, props, and core color palette as the reference image. Do not redesign the character.
Compose exactly one female character, large in frame on the right side, with a clean silhouette that reads clearly at social-card thumbnail size.
Make the pose bold, asymmetrical, and mid-action — clearly more dynamic than the reference, never a static standing or mascot pose.
Render the exact Japanese title text 「墨田区ちゃん」 inside the image on the left side as large integrated editorial typography. Keep the spelling exactly as given and do not add any other text.
Build a substantial cinematic background with depth, perspective, and motion energy; keep the left text side readable and uncluttered.
Keep a small clean safe area in the bottom-right corner for a service label.
Style: high-quality anime gacha-game splash art, vivid saturated colors, dramatic rim lighting, glowing particle effects, bokeh lights, detailed painterly finish.
Negative: no extra text, no logo, no watermark, no multiple characters, no plain white background, no empty gradient background, no tiny character, no redesigned outfit, no missing props, no wrong spelling.

Character: Sumida — the stubborn, warm-hearted craftswoman. Indigo-blue tight high ponytail with undercut, sharp focused eyes, sashiko-stitched navy work jacket with rolled sleeves, leather apron, work gloves, fine hammer.
Pose direction: do NOT reuse the reference image's arms-crossed low-angle rooftop stance — invent a distinctly different, bolder action instead. Directly overhead vertical shot looking down at her workbench: she looks up at the camera at the exact moment of the hammer strike, sparks bursting upward toward the lens like a small firework, ponytail whipping with the swing, tools, blueprints and metal fittings arranged around her like a craftsman's mandala.
Background: the workbench glowing with forge light at twilight, Tokyo Skytree's iki-blue illumination reflected in a sheet of polished metal beside her; the darker workbench corner on the left carries the title.
Palette: indigo, copper, spark gold.
```

## 8. 江東区（koto）

```text
Create a polished anime-style OGP share card for X (Twitter), wide landscape composition designed for 1200x630.
Use the attached image as the strict character reference.
Preserve exactly the same face, hairstyle, hair color, eye color, outfit, props, and core color palette as the reference image. Do not redesign the character.
Compose exactly one female character, large in frame on the right side, with a clean silhouette that reads clearly at social-card thumbnail size.
Make the pose bold, asymmetrical, and mid-action — clearly more dynamic than the reference, never a static standing or mascot pose.
Render the exact Japanese title text 「江東区ちゃん」 inside the image on the left side as large integrated editorial typography. Keep the spelling exactly as given and do not add any other text.
Build a substantial cinematic background with depth, perspective, and motion energy; keep the left text side readable and uncluttered.
Keep a small clean safe area in the bottom-right corner for a service label.
Style: high-quality anime gacha-game splash art, vivid saturated colors, dramatic rim lighting, glowing particle effects, bokeh lights, detailed painterly finish.
Negative: no extra text, no logo, no watermark, no multiple characters, no plain white background, no empty gradient background, no tiny character, no redesigned outfit, no missing props, no wrong spelling.

Character: Koto — the bright waterfront pioneer. Emerald-to-teal gradient half-up hair, sunny smile, sporty white parka with leaf-green accents, cargo shorts, sneakers, kayak paddle and a small potted sapling.
Pose direction: do NOT reuse the reference image's turning-back-on-the-boardwalk pose — invent a distinctly different, bolder action instead. High-angle action shot from above the canal: she leaps off the boardwalk in mid-air toward a kayak waiting on the water below, paddle already swung back for the first stroke, legs tucked, the sapling pot hugged safe to her chest, a fan of water spray and green leaves exploding up from where she will land.
Background: sparkling canal water filling the lower frame, the boardwalk and waterfront park greenery rushing away diagonally, new tower apartments and gulls mirrored in the water; bright open water on the left for the title.
Palette: emerald, white, sky blue.
```

## 9. 品川区（shinagawa）

```text
Create a polished anime-style OGP share card for X (Twitter), wide landscape composition designed for 1200x630.
Use the attached image as the strict character reference.
Preserve exactly the same face, hairstyle, hair color, eye color, outfit, props, and core color palette as the reference image. Do not redesign the character.
Compose exactly one female character, large in frame on the right side, with a clean silhouette that reads clearly at social-card thumbnail size.
Make the pose bold, asymmetrical, and mid-action — clearly more dynamic than the reference, never a static standing or mascot pose.
Render the exact Japanese title text 「品川区ちゃん」 inside the image on the left side as large integrated editorial typography. Keep the spelling exactly as given and do not add any other text.
Build a substantial cinematic background with depth, perspective, and motion energy; keep the left text side readable and uncluttered.
Keep a small clean safe area in the bottom-right corner for a service label.
Style: high-quality anime gacha-game splash art, vivid saturated colors, dramatic rim lighting, glowing particle effects, bokeh lights, detailed painterly finish.
Negative: no extra text, no logo, no watermark, no multiple characters, no plain white background, no empty gradient background, no tiny character, no redesigned outfit, no missing props, no wrong spelling.

Character: Shinagawa — the ultimate competent career woman commuter, perfectly balanced between old post-town heritage and futuristic station city. Navy short bob with a single white streak, cool composed gray eyes, sharply fitted modern pantsuit with a subtle ukiyo-e wave-pattern lining, smartwatch, sleek briefcase.
Pose direction: do NOT reuse the reference image's striding-toward-camera dutch-angle pose — invent a distinctly different, bolder action instead. Low side-on tracking shot at platform level: she sprints in full profile, racing the departing bullet train stride for stride, briefcase swung far back, coat snapping horizontally with hard speed lines, her silhouette cutting cleanly against the train's streak of pure light — and she is winning.
Background: the bullet train reduced to a horizontal ribbon of light behind her, glass station architecture and the old Tokaido post-town gate blurring past in the morning rush; the emptier stretch of platform ahead of her on the left holds the title.
Palette: silver, navy, one red accent line.
```

## 10. 目黒区（meguro）

```text
Create a polished anime-style OGP share card for X (Twitter), wide landscape composition designed for 1200x630.
Use the attached image as the strict character reference.
Preserve exactly the same face, hairstyle, hair color, eye color, outfit, props, and core color palette as the reference image. Do not redesign the character.
Compose exactly one female character, large in frame on the right side, with a clean silhouette that reads clearly at social-card thumbnail size.
Make the pose bold, asymmetrical, and mid-action — clearly more dynamic than the reference, never a static standing or mascot pose.
Render the exact Japanese title text 「目黒区ちゃん」 inside the image on the left side as large integrated editorial typography. Keep the spelling exactly as given and do not add any other text.
Build a substantial cinematic background with depth, perspective, and motion energy; keep the left text side readable and uncluttered.
Keep a small clean safe area in the bottom-right corner for a service label.
Style: high-quality anime gacha-game splash art, vivid saturated colors, dramatic rim lighting, glowing particle effects, bokeh lights, detailed painterly finish.
Negative: no extra text, no logo, no watermark, no multiple characters, no plain white background, no empty gradient background, no tiny character, no redesigned outfit, no missing props, no wrong spelling.

Character: Meguro — the effortlessly stylish tastemaker of a quiet luxury residential town, relaxed but impeccably put together. Ash-pink wavy medium hair, half-lidded confident eyes, sunglasses pushed up on her head, oversized designer coat draped over shoulders, quality knitwear, small espresso cup.
Pose direction: do NOT reuse the reference image's leaning-on-the-railing pose — invent a distinctly different, bolder action instead. Top-down editorial shot from directly above the riverside walkway: she spins once on her heel amid a carpet of fallen cherry petals, coat flaring out from her shoulders in a perfect circle, espresso cup held out steady and unspilled, sunglasses catching the golden light as she glances up at the camera mid-turn.
Background: the petal-covered walkway and the pink-dusted river surface framing her like a spotlight, chic cafe lights blooming as warm bokeh at the frame edges; a calm sweep of petals on the left carries the title.
Palette: ash pink, warm gray, golden hour amber.
```

## 11. 大田区（ota）

```text
Create a polished anime-style OGP share card for X (Twitter), wide landscape composition designed for 1200x630.
Use the attached image as the strict character reference.
Preserve exactly the same face, hairstyle, hair color, eye color, outfit, props, and core color palette as the reference image. Do not redesign the character.
Compose exactly one female character, large in frame on the right side, with a clean silhouette that reads clearly at social-card thumbnail size.
Make the pose bold, asymmetrical, and mid-action — clearly more dynamic than the reference, never a static standing or mascot pose.
Render the exact Japanese title text 「大田区ちゃん」 inside the image on the left side as large integrated editorial typography. Keep the spelling exactly as given and do not add any other text.
Build a substantial cinematic background with depth, perspective, and motion energy; keep the left text side readable and uncluttered.
Keep a small clean safe area in the bottom-right corner for a service label.
Style: high-quality anime gacha-game splash art, vivid saturated colors, dramatic rim lighting, glowing particle effects, bokeh lights, detailed painterly finish.
Negative: no extra text, no logo, no watermark, no multiple characters, no plain white background, no empty gradient background, no tiny character, no redesigned outfit, no missing props, no wrong spelling.

Character: Ota — a cheerful hard-working big sister who keeps planes flying and neighbors smiling, town-factory pride and sento warmth. Orange-brown short spiky hair with a wrench-shaped hairpin, big friendly grin, mechanic jumpsuit tied at the waist over a white tee, tool belt, a sento towel around her neck.
Pose direction: do NOT reuse the reference image's low-angle frontal standing pose with a thumbs-up and a jet passing overhead — invent a distinctly different, bolder action instead. High-angle crane shot diving diagonally down onto the airport apron: she rides standing on the rear deck of a speeding baggage tow tractor, body leaning hard into the curve in full side profile, one hand gripping the rail, the other thrusting a big wrench forward like a race flag toward the runway, sento towel and tied jumpsuit sleeves streaming horizontally behind her, bolts and small gears skittering off the cart in her wake.
Background: a taxiing passenger jet fills the lower-right diagonal beside her, its fuselage mirroring the orange sunset, wet tarmac guide-lines and blue taxiway lights streaking with motion blur toward the vanishing point, control tower and small factory silhouettes tilted at the frame edge; the calm sunset sky in the upper-left stays clean for the title.
Palette: warm orange, steel gray, sunset red.
```

## 12. 世田谷区（setagaya）

```text
Create a polished anime-style OGP share card for X (Twitter), wide landscape composition designed for 1200x630.
Use the attached image as the strict character reference.
Preserve exactly the same face, hairstyle, hair color, eye color, outfit, props, and core color palette as the reference image. Do not redesign the character.
Compose exactly one female character, large in frame on the right side, with a clean silhouette that reads clearly at social-card thumbnail size.
Make the pose bold, asymmetrical, and mid-action — clearly more dynamic than the reference, never a static standing or mascot pose.
Render the exact Japanese title text 「世田谷区ちゃん」 inside the image on the left side as large integrated editorial typography. Keep the spelling exactly as given and do not add any other text.
Build a substantial cinematic background with depth, perspective, and motion energy; keep the left text side readable and uncluttered.
Keep a small clean safe area in the bottom-right corner for a service label.
Style: high-quality anime gacha-game splash art, vivid saturated colors, dramatic rim lighting, glowing particle effects, bokeh lights, detailed painterly finish.
Negative: no extra text, no logo, no watermark, no multiple characters, no plain white background, no empty gradient background, no tiny character, no redesigned outfit, no missing props, no wrong spelling.

Character: Setagaya — the gentle big sister of the largest family in Tokyo, unhurried, caring, always with room for one more. Milk-tea beige long wavy hair loosely braided over one shoulder, soft smiling eyes, long relaxed cardigan over a spring dress, wicker picnic basket, a hand-knit scarf trailing in the breeze.
Pose direction: top-down bird's-eye drone shot looking straight down — she lies back gently on a picnic blanket on the grass, hair fanned out in soft waves around her head, one hand holding her hat, a colorful kite floating between her and the camera casting a playful shadow across the lawn.
Background: wide afternoon park with families picnicking as soft bokeh, suburban rooftops and green trees; a calm grass area on the left side holds the title.
Palette: cream, milk-tea beige, sage green.
```

## 13. 渋谷区（shibuya）

```text
Create a polished anime-style OGP share card for X (Twitter), wide landscape composition designed for 1200x630.
Use the attached image as the strict character reference.
Preserve exactly the same face, hairstyle, hair color, eye color, outfit, props, and core color palette as the reference image. Do not redesign the character.
Compose exactly one female character, large in frame on the right side, with a clean silhouette that reads clearly at social-card thumbnail size.
Make the pose bold, asymmetrical, and mid-action — clearly more dynamic than the reference, never a static standing or mascot pose.
Render the exact Japanese title text 「渋谷区ちゃん」 inside the image on the left side as large integrated editorial typography. Keep the spelling exactly as given and do not add any other text.
Build a substantial cinematic background with depth, perspective, and motion energy; keep the left text side readable and uncluttered.
Keep a small clean safe area in the bottom-right corner for a service label.
Style: high-quality anime gacha-game splash art, vivid saturated colors, dramatic rim lighting, glowing particle effects, bokeh lights, detailed painterly finish.
Negative: no extra text, no logo, no watermark, no multiple characters, no plain white background, no empty gradient background, no tiny character, no redesigned outfit, no missing props, no wrong spelling.

Character: Shibuya — the trendsetter at the center of the world's busiest crossing, free, loud and impossible to ignore. Pink-to-cyan gradient hair in an asymmetric cut, glitter makeup, mixed street fashion — cropped neon jacket, layered accessories, platform sneakers, holographic phone in hand.
Pose direction: low fisheye-style dynamic shot from knee height — sprinting across the scramble crossing mid-stride toward the camera, jacket flying open, pointing forward at the viewer with a fearless grin; the buildings curve around the frame edges and motion trails of neon light follow her.
Background: Shibuya scramble at night — giant glowing video billboards, crowds as streaks of light; a darker billboard glow on the left keeps the title punchy and readable.
Palette: magenta, cyan, electric yellow.
```

## 14. 中野区（nakano）

```text
Create a polished anime-style OGP share card for X (Twitter), wide landscape composition designed for 1200x630.
Use the attached image as the strict character reference.
Preserve exactly the same face, hairstyle, hair color, eye color, outfit, props, and core color palette as the reference image. Do not redesign the character.
Compose exactly one female character, large in frame on the right side, with a clean silhouette that reads clearly at social-card thumbnail size.
Make the pose bold, asymmetrical, and mid-action — clearly more dynamic than the reference, never a static standing or mascot pose.
Render the exact Japanese title text 「中野区ちゃん」 inside the image on the left side as large integrated editorial typography. Keep the spelling exactly as given and do not add any other text.
Build a substantial cinematic background with depth, perspective, and motion energy; keep the left text side readable and uncluttered.
Keep a small clean safe area in the bottom-right corner for a service label.
Style: high-quality anime gacha-game splash art, vivid saturated colors, dramatic rim lighting, glowing particle effects, bokeh lights, detailed painterly finish.
Negative: no extra text, no logo, no watermark, no multiple characters, no plain white background, no empty gradient background, no tiny character, no redesigned outfit, no missing props, no wrong spelling.

Character: Nakano — a laid-back subculture girl connoisseur living her best solo life, surrounded by treasures only she understands. Ash-gray messy medium hair, sharp knowing eyes behind the glow of a screen, oversized hoodie with retro game patches, chunky headphones around neck, handheld console in one hand.
Pose direction: tilted top-down shot — she leans back mid-float above her cushion in zero-gravity ease, one leg kicked up, console raised in victory as orbiting figures, capsule toys, manga volumes and glowing UI windows spiral around her in a dynamic ring.
Background: a dim room at night lit by shelf LEDs and a CRT glow, walls of collectibles in loving chaos; a soft dark gradient on the left gives the title space.
Palette: ash gray, warm amber, LED cyan.
```

## 15. 杉並区（suginami）

```text
Create a polished anime-style OGP share card for X (Twitter), wide landscape composition designed for 1200x630.
Use the attached image as the strict character reference.
Preserve exactly the same face, hairstyle, hair color, eye color, outfit, props, and core color palette as the reference image. Do not redesign the character.
Compose exactly one female character, large in frame on the right side, with a clean silhouette that reads clearly at social-card thumbnail size.
Make the pose bold, asymmetrical, and mid-action — clearly more dynamic than the reference, never a static standing or mascot pose.
Render the exact Japanese title text 「杉並区ちゃん」 inside the image on the left side as large integrated editorial typography. Keep the spelling exactly as given and do not add any other text.
Build a substantial cinematic background with depth, perspective, and motion energy; keep the left text side readable and uncluttered.
Keep a small clean safe area in the bottom-right corner for a service label.
Style: high-quality anime gacha-game splash art, vivid saturated colors, dramatic rim lighting, glowing particle effects, bokeh lights, detailed painterly finish.
Negative: no extra text, no logo, no watermark, no multiple characters, no plain white background, no empty gradient background, no tiny character, no redesigned outfit, no missing props, no wrong spelling.

Character: Suginami — a mellow bookish girl musician who found the perfect quiet street to live slow and deep. Olive-green soft shoulder-length hair tucked behind one ear, calm gentle eyes, loose vintage shirt with a corduroy jacket, canvas tote full of paperbacks, acoustic guitar.
Pose direction: caught at the emotional peak of a song — rising off her stool under the arcade lamp, leaning back with the final strum, hair swinging, glowing musical notes bursting upward in a diagonal stream, a cat startled mid-leap beside her.
Background: a quiet retro arcade street after closing time, shuttered shops with warm lamplight pools receding into depth; the dark arcade left side carries the title in warm light.
Palette: olive, amber, lamplight gold.
```

## 16. 豊島区（toshima）

```text
Create a polished anime-style OGP share card for X (Twitter), wide landscape composition designed for 1200x630.
Use the attached image as the strict character reference.
Preserve exactly the same face, hairstyle, hair color, eye color, outfit, props, and core color palette as the reference image. Do not redesign the character.
Compose exactly one female character, large in frame on the right side, with a clean silhouette that reads clearly at social-card thumbnail size.
Make the pose bold, asymmetrical, and mid-action — clearly more dynamic than the reference, never a static standing or mascot pose.
Render the exact Japanese title text 「豊島区ちゃん」 inside the image on the left side as large integrated editorial typography. Keep the spelling exactly as given and do not add any other text.
Build a substantial cinematic background with depth, perspective, and motion energy; keep the left text side readable and uncluttered.
Keep a small clean safe area in the bottom-right corner for a service label.
Style: high-quality anime gacha-game splash art, vivid saturated colors, dramatic rim lighting, glowing particle effects, bokeh lights, detailed painterly finish.
Negative: no extra text, no logo, no watermark, no multiple characters, no plain white background, no empty gradient background, no tiny character, no redesigned outfit, no missing props, no wrong spelling.

Character: Toshima — a small explosive city kid who turned the densest concrete jungle into her personal playground, never runs out of energy. Vivid yellow twin-tails with black inner color, huge sparkling eyes, sporty oversized streetwear in yellow and black, sneakers with LED soles, a small owl companion perched on her shoulder.
Pose direction: extreme vertical shot from street level directly below — she leaps across the gap between rooftops high overhead, framed against the sliver of sky between the towers, grinning down at the camera, cap held tight, legs kicked up mid-jump, her owl diving alongside.
Background: densely packed Ikebukuro buildings and signs closing in on all sides, laundry lines and rooftop gardens as her 'parks'; the deepest slice of sky sits left for the title.
Palette: vivid yellow, black, sky blue.
```

## 17. 北区（kita）

```text
Create a polished anime-style OGP share card for X (Twitter), wide landscape composition designed for 1200x630.
Use the attached image as the strict character reference.
Preserve exactly the same face, hairstyle, hair color, eye color, outfit, props, and core color palette as the reference image. Do not redesign the character.
Compose exactly one female character, large in frame on the right side, with a clean silhouette that reads clearly at social-card thumbnail size.
Make the pose bold, asymmetrical, and mid-action — clearly more dynamic than the reference, never a static standing or mascot pose.
Render the exact Japanese title text 「北区ちゃん」 inside the image on the left side as large integrated editorial typography. Keep the spelling exactly as given and do not add any other text.
Build a substantial cinematic background with depth, perspective, and motion energy; keep the left text side readable and uncluttered.
Keep a small clean safe area in the bottom-right corner for a service label.
Style: high-quality anime gacha-game splash art, vivid saturated colors, dramatic rim lighting, glowing particle effects, bokeh lights, detailed painterly finish.
Negative: no extra text, no logo, no watermark, no multiple characters, no plain white background, no empty gradient background, no tiny character, no redesigned outfit, no missing props, no wrong spelling.

Character: Kita — a warm-hearted girl raised by her grandmother, keeper of Showa-era warmth, croquettes and cherry blossoms by the train tracks. Brick-red bob hair with a retro flower pin, round warm eyes, vintage-style sailor blouse with a hand-me-down cardigan, paper bag of fresh croquettes hugged to her chest.
Pose direction: leaning far out of a moving retro tram window waving with her whole arm, hair, scarf and cherry petals streaming backward with the motion, one croquette almost escaping the bag; side tracking shot with warm lens glow.
Background: a Showa-era shopping street and cherry trees rolling past at golden dusk with gentle motion blur and film-grain nostalgia; the blurred street on the left holds the title.
Palette: brick red, sakura pink, dusk gold.
```

## 18. 荒川区（arakawa）

```text
Create a polished anime-style OGP share card for X (Twitter), wide landscape composition designed for 1200x630.
Use the attached image as the strict character reference.
Preserve exactly the same face, hairstyle, hair color, eye color, outfit, props, and core color palette as the reference image. Do not redesign the character.
Compose exactly one female character, large in frame on the right side, with a clean silhouette that reads clearly at social-card thumbnail size.
Make the pose bold, asymmetrical, and mid-action — clearly more dynamic than the reference, never a static standing or mascot pose.
Render the exact Japanese title text 「荒川区ちゃん」 inside the image on the left side as large integrated editorial typography. Keep the spelling exactly as given and do not add any other text.
Build a substantial cinematic background with depth, perspective, and motion energy; keep the left text side readable and uncluttered.
Keep a small clean safe area in the bottom-right corner for a service label.
Style: high-quality anime gacha-game splash art, vivid saturated colors, dramatic rim lighting, glowing particle effects, bokeh lights, detailed painterly finish.
Negative: no extra text, no logo, no watermark, no multiple characters, no plain white background, no empty gradient background, no tiny character, no redesigned outfit, no missing props, no wrong spelling.

Character: Arakawa — a modest, endlessly family-minded girl whose small acts of care are her greatest treasure. Cream-blonde gentle low twin-tails with ribbon, kind humble smile, simple hand-sewn apron dress in cream and sky blue, holding a beautifully packed homemade bento wrapped in cloth.
Pose direction: low child's-eye camera — she springs up from the tram-stop bench toward the camera, holding the bento out with both hands and a burst of a smile, ribbon and apron fluttering, rose petals from the trackside swirling around her.
Background: a cute retro streetcar approaching along rose-lined tracks in soft morning light, quiet downtown waking up; the soft morning sky on the left carries the title.
Palette: cream, sky blue, rose pink.
```

## 19. 板橋区（itabashi）

```text
Create a polished anime-style OGP share card for X (Twitter), wide landscape composition designed for 1200x630.
Use the attached image as the strict character reference.
Preserve exactly the same face, hairstyle, hair color, eye color, outfit, props, and core color palette as the reference image. Do not redesign the character.
Compose exactly one female character, large in frame on the right side, with a clean silhouette that reads clearly at social-card thumbnail size.
Make the pose bold, asymmetrical, and mid-action — clearly more dynamic than the reference, never a static standing or mascot pose.
Render the exact Japanese title text 「板橋区ちゃん」 inside the image on the left side as large integrated editorial typography. Keep the spelling exactly as given and do not add any other text.
Build a substantial cinematic background with depth, perspective, and motion energy; keep the left text side readable and uncluttered.
Keep a small clean safe area in the bottom-right corner for a service label.
Style: high-quality anime gacha-game splash art, vivid saturated colors, dramatic rim lighting, glowing particle effects, bokeh lights, detailed painterly finish.
Negative: no extra text, no logo, no watermark, no multiple characters, no plain white background, no empty gradient background, no tiny character, no redesigned outfit, no missing props, no wrong spelling.

Character: Itabashi — the dependable neighborhood big sister in a jersey, humble on the surface, quietly mature and steady inside. Greenish-black hair in a sporty high ponytail, easygoing reliable smile, classic green-line jersey worn open over a tee, sports towel, carrying overflowing shopping bags from the local arcade in both arms.
Pose direction: low tracking shot from near the ground — mid-stride power-walk through a shopping street at evening, kids running alongside her as blurred silhouettes, one bag balanced on her shoulder, the pavement rushing past in the blurred foreground.
Background: a lively evening shotengai with a sento chimney and rising bath steam behind, paper flyers fluttering; warm shop lights blur left into space for the title.
Palette: jersey green, warm brown, steam white.
```

## 20. 練馬区（nerima）

```text
Create a polished anime-style OGP share card for X (Twitter), wide landscape composition designed for 1200x630.
Use the attached image as the strict character reference.
Preserve exactly the same face, hairstyle, hair color, eye color, outfit, props, and core color palette as the reference image. Do not redesign the character.
Compose exactly one female character, large in frame on the right side, with a clean silhouette that reads clearly at social-card thumbnail size.
Make the pose bold, asymmetrical, and mid-action — clearly more dynamic than the reference, never a static standing or mascot pose.
Render the exact Japanese title text 「練馬区ちゃん」 inside the image on the left side as large integrated editorial typography. Keep the spelling exactly as given and do not add any other text.
Build a substantial cinematic background with depth, perspective, and motion energy; keep the left text side readable and uncluttered.
Keep a small clean safe area in the bottom-right corner for a service label.
Style: high-quality anime gacha-game splash art, vivid saturated colors, dramatic rim lighting, glowing particle effects, bokeh lights, detailed painterly finish.
Negative: no extra text, no logo, no watermark, no multiple characters, no plain white background, no empty gradient background, no tiny character, no redesigned outfit, no missing props, no wrong spelling.

Character: Nerima — the eldest daughter of a big family, half farmer half anime nerd, takes care of everyone with a huge open smile. Yellow-green tousled twin braids under a pushed-back straw hat, bright friendly eyes, work overalls with one strap down over an anime-print tee, watering can in one hand, a cabbage under the other arm.
Pose direction: low-angle shot from between the cabbage leaves looking up at her against the wide open sky — mid-laugh, watering can raised high as droplets catch the light like sparkles, strips of anime film spiraling around her in the wind.
Background: neat vegetable fields meeting suburban homes, an anime studio building in the distance, drifting clouds; the wide blue sky on the left holds the title.
Palette: yellow-green, sky blue, straw gold.
```

## 21. 足立区（adachi）

```text
Create a polished anime-style OGP share card for X (Twitter), wide landscape composition designed for 1200x630.
Use the attached image as the strict character reference.
Preserve exactly the same face, hairstyle, hair color, eye color, outfit, props, and core color palette as the reference image. Do not redesign the character.
Compose exactly one female character, large in frame on the right side, with a clean silhouette that reads clearly at social-card thumbnail size.
Make the pose bold, asymmetrical, and mid-action — clearly more dynamic than the reference, never a static standing or mascot pose.
Render the exact Japanese title text 「足立区ちゃん」 inside the image on the left side as large integrated editorial typography. Keep the spelling exactly as given and do not add any other text.
Build a substantial cinematic background with depth, perspective, and motion energy; keep the left text side readable and uncluttered.
Keep a small clean safe area in the bottom-right corner for a service label.
Style: high-quality anime gacha-game splash art, vivid saturated colors, dramatic rim lighting, glowing particle effects, bokeh lights, detailed painterly finish.
Negative: no extra text, no logo, no watermark, no multiple characters, no plain white background, no empty gradient background, no tiny character, no redesigned outfit, no missing props, no wrong spelling.

Character: Adachi — the gentle-hearted big-sister boss (anego) of downtown, twisted headband, big laugh, everyone's protector on fireworks night. Sunset-orange wild long hair swept back with a navy twisted hachimaki, broad fearless grin, open festival vest over a summer yukata tied boldly, strong athletic build, a paper fan tucked in her obi belt.
Pose direction: heroic super-low angle — she throws one fist to the sky as the biggest firework bursts, laughing head-back, vest and hair blasted sideways by the shockwave, sparks reflecting in her eyes; stance wide and unshakable on the riverbank grass.
Background: massive fireworks blooming over the Arakawa river at night, families on picnic sheets below as warm silhouettes, festival stalls glowing; the dark river sky on the left carries the title between bursts.
Palette: sunset orange, navy, firework gold.
```

## 22. 葛飾区（katsushika）

```text
Create a polished anime-style OGP share card for X (Twitter), wide landscape composition designed for 1200x630.
Use the attached image as the strict character reference.
Preserve exactly the same face, hairstyle, hair color, eye color, outfit, props, and core color palette as the reference image. Do not redesign the character.
Compose exactly one female character, large in frame on the right side, with a clean silhouette that reads clearly at social-card thumbnail size.
Make the pose bold, asymmetrical, and mid-action — clearly more dynamic than the reference, never a static standing or mascot pose.
Render the exact Japanese title text 「葛飾区ちゃん」 inside the image on the left side as large integrated editorial typography. Keep the spelling exactly as given and do not add any other text.
Build a substantial cinematic background with depth, perspective, and motion energy; keep the left text side readable and uncluttered.
Keep a small clean safe area in the bottom-right corner for a service label.
Style: high-quality anime gacha-game splash art, vivid saturated colors, dramatic rim lighting, glowing particle effects, bokeh lights, detailed painterly finish.
Negative: no extra text, no logo, no watermark, no multiple characters, no plain white background, no empty gradient background, no tiny character, no redesigned outfit, no missing props, no wrong spelling.

Character: Katsushika — a wandering free-spirited girl with the deepest family bonds in Tokyo, a Tora-san-inspired charmer who always comes home. Warm brown slightly wavy hair under a classic fedora-style hat, crinkled smiling eyes, retro checked jacket over a haramaki belly band, old leather travel trunk in one hand.
Pose direction: cinematic crane shot from slightly above and behind — she spins back toward the camera mid-stride on the riverbank path, hat caught in one hand as the wind takes it, trunk swinging wide, coat and long grass swept in one motion, big fond grin and a raised farewell hand.
Background: the Shibamata riverside at dusk, an old temple street with lanterns lighting up, a family waving from afar, her shadow stretching long across the path; the dusk sky on the left holds the title.
Palette: warm brown, retro gold, dusk orange.
```

## 23. 江戸川区（edogawa）

```text
Create a polished anime-style OGP share card for X (Twitter), wide landscape composition designed for 1200x630.
Use the attached image as the strict character reference.
Preserve exactly the same face, hairstyle, hair color, eye color, outfit, props, and core color palette as the reference image. Do not redesign the character.
Compose exactly one female character, large in frame on the right side, with a clean silhouette that reads clearly at social-card thumbnail size.
Make the pose bold, asymmetrical, and mid-action — clearly more dynamic than the reference, never a static standing or mascot pose.
Render the exact Japanese title text 「江戸川区ちゃん」 inside the image on the left side as large integrated editorial typography. Keep the spelling exactly as given and do not add any other text.
Build a substantial cinematic background with depth, perspective, and motion energy; keep the left text side readable and uncluttered.
Keep a small clean safe area in the bottom-right corner for a service label.
Style: high-quality anime gacha-game splash art, vivid saturated colors, dramatic rim lighting, glowing particle effects, bokeh lights, detailed painterly finish.
Negative: no extra text, no logo, no watermark, no multiple characters, no plain white background, no empty gradient background, no tiny character, no redesigned outfit, no missing props, no wrong spelling.

Character: Edogawa — the youngest of the whole 23-ward family, a little tomboy gang-leader girl of the great outdoors with the biggest park kingdom in Tokyo. Vivid green unruly short twin-tails with a big leaf perched on top like a crown, sparkling mischievous eyes, tank top and shorts with a net over her shoulder, insect cage on her hip, band-aid on one cheek, a little penguin buddy running beside her.
Pose direction: super-wide-angle shot sprinting straight at the camera across a huge sunlit lawn, net swung high, grass and butterflies exploding around her, penguin flapping behind; ground-level action shot.
Background: an endless green park under a brilliant blue summer sky, giant ferris wheel and water fountains in the distance; the open lawn-and-sky left side carries the title.
Palette: vivid green, summer blue, sun white.
```

---

## 24. メインページ（home）

サービス全体のキービジュアル。区別カードと違い**参照画像なし・キャラクター単体なし**で生成する。参照なしで23人を描かせるとキャラ崩れするため、キャラクターは「逆光シルエット＋色のオーラ」に抽象化し、色パレットで23区の多様性を表現する。タイトルがサービス名そのものなので、右下のブランドラベル合成は不要（セーフエリア指定も外している）。

出力は1200x630へリサイズ/クロップ後、`assets/og/home.png` に原本を置き、`public/og/home.png` へ配置する。あわせて `app/layout.tsx` の `metadata.openGraph.images` に `/og/home.png` を設定する（現状は未設定）。

```text
Create a polished anime-style OGP share card for X (Twitter), wide landscape composition designed for 1200x630. This is the hero key visual for a web service — there is NO character reference image and NO single main character.
Render the exact Japanese title text 「うちの区ちゃん」 inside the image as very large integrated editorial typography, placed slightly left of center on two lines, bold and readable even at thumbnail size. Keep the spelling exactly as given and do not add any other text.
Concept: a giant enchanted picture-book encyclopedia lies open at a low dramatic three-quarter angle in the lower half of the frame, and from its glowing pages 23 trading-card-shaped panels burst upward in a fanned spiral arc; each card carries only an abstract backlit girl silhouette with its own distinct color aura — gold, aqua, champagne, neon purple, deep green, scarlet, indigo, emerald, ash pink, sunset orange and more, 23 clearly different hues — never a readable face, never a detailed character.
Between the pages and the cards, a stylized map of Tokyo's 23 wards rises from the book as a hologram of glowing outlines, each ward district lit in the same color as its card, sparkling data particles streaming upward along the card arc.
Background: a twilight Tokyo skyline silhouette wrapping the horizon behind the book, deep navy-to-violet gradient sky with soft bokeh city lights, dramatic rim lighting on the book edges and card frames.
Style: high-quality anime gacha-game splash art, vivid saturated colors, dramatic rim lighting, glowing particle effects, bokeh lights, detailed painterly finish.
Negative: no extra text, no logo, no watermark, no readable character faces, no realistic map labels, no plain white background, no empty gradient background, no wrong spelling.
Palette: deep navy, violet, prismatic 23-color card glow, warm book-light gold.
```

---

## 生成後チェックリスト（nazotypeスキル準拠）

- 参照画像と同一キャラクターに見えるか（顔・髪・衣装・小物・パレット）
- ポーズが明らかに動的・非対称か（直立・左右対称・ステッカー風は不可）
- 「○○区ちゃん」の綴りが正確で、サムネイルサイズでも読めるか
- 余計な文字・ロゴ・ウォーターマークがないか
- 背景が白抜き・単純グラデでなく、設計された奥行きがあるか
- 右下セーフエリアが空いているか（ラベル「うちの区ちゃん」はローカル合成）
- 最終出力を1200x630に整え、`public/og/{slug}.png` へ配置する
