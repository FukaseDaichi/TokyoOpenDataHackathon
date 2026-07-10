# 23区「区ちゃん」キャラクター設計書（データ駆動）

全キャラの性格・ビジュアルは `data/processed/wards.json`（kill test合格済みの実オープンデータ）から導出。
根拠→性格→画像の一方向トレーサビリティを保つ（審査の「データ活用」軸対策）。

各区は **SSR版（リアル等身の1枚絵）** と **ちび版（図鑑・UI用）** の2段構え。
色とモチーフはSSR版を正としてちび版に引き継ぐ。

## データ→ビジュアルの変換ルール

| 軸（指標） | 高い | 低い |
|---|---|---|
| 賑わい（昼夜間人口比率） | スーツ/仕事道具・都会背景・シャキッとした姿勢 | 私服・住宅街背景・リラックス |
| 成熟（高齢化率↑/年少率↓） | 落ち着いた物腰・和の要素・渋い色 | 幼さ・明るい色・元気なポーズ |
| みどり（公園面積/人） | 植物モチーフ・緑の差し色・葉や花の小物 | 都市的な無機質モチーフ |
| 世帯（単身率↔子育て率） | 単身:一人で楽しむ小物（コーヒー、本、イヤホン） | 子育て:世話焼きアイテム（お弁当、絆創膏） |
| 華やか（財政力指数） | 上質な服・アクセサリー・キラキラ | 質素で親しみやすい服・下町感 |

## SSR版 シリーズ共通スタイル（港区v1で確定・全23体に必ず付ける）

パイロット（港区、2026-07-11生成・承認済み）から抽出した共通スタイル指定。
各区の個別プロンプトの末尾にこのブロックをそのまま連結する。

```
Style: high-quality anime gacha-game SSR splash art, vivid saturated colors,
dramatic rim lighting, glowing particle effects, bokeh background lights,
detailed painterly finish, dynamic diagonal composition, glossy detailed hair,
2:3 vertical aspect ratio, full body visible head to toe, no text, no logo,
single female character only (all 23 wards are personified as girls/women).
```

生成運用:
- 生成先: ChatGPT（手動）。1区=1枚、崩れたら同プロンプトで再生成。
- 保存先: `assets/characters/ssr/{ward_id}.png`（港区=13103.png）／ちび版: `assets/characters/chibi/{ward_id}.png`
- 港区v1は承認済み。他区は港区の「質感・光・仕上げ」を基準に判定する。

## 個性配分表（被り防止マトリクス）

髪色・カメラ・時間帯・ポーズをシリーズ全体で分散させる。生成前にここで衝突チェック。

| 区 | 髪色 | 時間帯 | カメラ/構図 |
|---|---|---|---|
| 千代田 | シルバーホワイト×紺 | 昼夜スプリット | 正面シンメトリー |
| 中央 | アクアブルー | 朝 | 跳躍ミッドエア |
| 港 | シャンパンゴールド | 夜 | ローアングル見上げ ✅済 |
| 新宿 | 深紫×ネオンピンク | 深夜 | ネオン逆光シルエット |
| 文京 | 深緑 | 午後 | 本の塔に腰掛け俯瞰 |
| 台東 | 緋色（ポニーテール） | 夕暮れ | 祭り踊りの躍動 |
| 墨田 | 藍色 | 黄昏 | 腕組み仁王立ち・見上げ |
| 江東 | エメラルドグラデ | 快晴の昼 | 水辺で振り向き・風 |
| 品川 | ネイビー×白メッシュ | 朝ラッシュ | 歩き向かってくる・モーションブラー |
| 目黒 | アッシュピンク | ゴールデンアワー | 桜並木で欄干にもたれる |
| 大田 | オレンジブラウン | 夕焼け | 滑走路でサムズアップ・広角 |
| 世田谷 | ミルクティーベージュ | 午後の公園 | 芝生に座る・横からの風 |
| 渋谷 | ピンク×シアンのグラデ | 夜（ネオン） | 魚眼気味・交差点を疾走 |
| 中野 | アッシュグレー | 夜（室内） | あぐらで浮遊ガジェット |
| 杉並 | オリーブ | 夜のアーケード | ギターを爪弾く・ランプ光 |
| 豊島 | ビビッドイエロー | 昼 | ビル峡谷をルーフ跳び |
| 北 | レンガ色 | ノスタルジック夕方 | 都電の窓から手を振る |
| 荒川 | クリームブロンド | やわらかい朝 | 停留所ベンチでお弁当 |
| 板橋 | 緑がかった黒 | 夕方 | 商店街を闊歩・買い物袋 |
| 練馬 | 黄緑 | 明るい昼 | 畑でじょうろ・フィルム舞う |
| 足立 | サンセットオレンジ | 花火の夜 | 腕組みニカッ・打ち上げ花火 |
| 葛飾 | ウォームブラウン | 夕暮れ河川敷 | 歩き去りざま振り返り |
| 江戸川 | ビビッドグリーン | 青空 | 虫取り網で駆けてくる・超広角 |

## 区別プロファイル（性格・根拠・SSRプロンプト）

書式: **性格ひとこと** / 根拠(実数値)。英語ブロック＋共通スタイルを連結してChatGPTに貼る。

### 1. 千代田区「昼だけ人口20倍、夜は静寂を愛す二面性エリート」
根拠: 昼夜比1355%(23区断トツ) / 財政0.84
```
Character: "Chiyoda" — personification of Chiyoda Ward. A cool silver-haired
elite young lady with a calm, mysterious dual nature: ruler of the daytime
crowds, guardian of the silent night.
Appearance: sleek silver-white hair with midnight-blue inner color, sharp
heterochromatic eyes (gold / deep blue), immaculate tailored white-and-navy suit
with imperial gold trim, a pocket watch showing both noon and midnight.
Composition: symmetrical front-facing full-body shot standing on a glass rooftop;
the image is split diagonally — left half bright daytime with crowds of light
particles, right half serene night with the moonlit Imperial Palace forest.
Background: Marunouchi skyscrapers on the day side, dark quiet palace greenery
and stars on the night side.
```

### 2. 中央区「23区最年少、勢いに乗るニューリッチ新人」
根拠: 高齢化率14.2%(最低) / 昼夜比374%
```
Character: "Chuo" — personification of Chuo Ward. The youngest of the 23 wards,
a fresh and ambitious rookie riding a wave of momentum.
Appearance: aqua-blue short bob with a bright sheen, sparkling upturned eyes,
smart office-casual jacket over a modern dress with sneaker-style heels,
a tablet and a vintage compass (old merchant town heritage).
Composition: dynamic mid-air jump over the historic Nihonbashi bridge,
one arm reaching to the sky, papers and light particles swirling around her.
Background: morning sun rising between glass high-rise towers and the retro
stone bridge, fresh blue-and-white color scheme.
```

### 3. 港区「財政力1.15の絶対王者、華やかセレブ」✅ v1承認済み
根拠: 財政1.15(1位) / 単身57% / 昼夜比373%
```
Character: "Minato" — the glamorous, supremely confident young queen. The
"absolute champion" of wealth and luxury among Tokyo's 23 wards.
Appearance: long flowing champagne-gold hair with platinum highlights, sharp
confident amber eyes, an elegant smirk, luxurious white-and-gold haute couture
dress with asymmetric hem, gold chain accessories, sparkling jewelry, and a
small tiara shaped like the silhouette of Tokyo Tower.
Composition: dynamic low-angle full-body shot, hair and dress ribbons swept by
wind, one hand on her hip, the other tossing a glowing gold coin.
Background: night skyline of Minato — Tokyo Tower glowing red-orange, glittering
bay-area high-rises, champagne-gold sparkle particles.
```

### 4. 新宿区「眠らない単身者の街、面倒見のいい夜型」
根拠: 単身率67.8%(1位) / 年少率8.3%(最低)
```
Character: "Shinjuku" — a tall night-owl young woman, guardian of everyone who
lives alone. Looks tired but has impossibly kind eyes.
Appearance: deep purple layered hair with neon-pink streaks, sleepy amber eyes
with gentle warmth, long black coat over loose shirt, loosened tie, holding a
steaming canned coffee, earphones around neck.
Composition: backlit full-body silhouette walking through a rain-slicked neon
alley at 2 a.m., turning back over her shoulder with a soft smile, coat hem
flowing, neon reflections rippling at her feet.
Background: Kabukicho-style neon signs in pink, purple and cyan, glowing shop
lanterns, bokeh crowds fading into darkness.
```

### 5. 文京区「本と学び、育ちの良い文化人」
根拠: 年少率12.4%(上位) / 昼夜比147%(落ち着き)
```
Character: "Bunkyo" — a well-bred scholarly young woman raised among books
and universities, gentle but quietly brilliant.
Appearance: deep-green long straight hair with a low braid, calm hazel eyes
behind elegant thin glasses, refined dark-green academic cape over a crimson
ribbon blouse (classic school colors), fountain pen tucked behind her ear.
Composition: seated gracefully atop a spiraling tower of giant antique books,
legs crossed, one open book floating before her as glowing letters drift
upward like petals; slightly high-angle shot.
Background: warm afternoon light through a grand library window, ginkgo
leaves and paper pages floating, dark green and burgundy palette.
```

### 6. 台東区「観光と祭りに生きる江戸っ子の粋なベテラン」
根拠: 高齢化率20.4% / 年少率8.1%(下位)
```
Character: "Taito" — a spirited Edokko festival girl, stylish young veteran of
downtown Tokyo, always at the center of the matsuri.
Appearance: fiery scarlet hair in a high ponytail with a kanzashi, bold
confident grin, festival happi coat in deep red with gold Edo patterns worn
over modern streetwear, uchiwa fan and a giant red lantern.
Composition: dynamic mid-dance pose on a festival float, one leg raised,
fan swung wide, sweat and light sparks flying, low-angle worm's-eye view.
Background: Kaminarimon's giant red lantern at dusk, rows of glowing
chochin lanterns, fireworks starting in the twilight sky, festive red-gold.
```

### 7. 墨田区「ものづくり気質の職人娘、下町の頑固一徹」
根拠: 財政0.42 / 昼夜比104%(職住近接)
```
Character: "Sumida" — a stubborn but warm-hearted young craftswoman who carries
the pride of downtown manufacturing on her back.
Appearance: indigo-blue hair in a tight high ponytail with an undercut, sharp
focused eyes, navy work jacket (sashiko-stitched) with rolled sleeves, leather
apron, work gloves tucked in belt, a fine hammer on her shoulder.
Composition: full-body arms-crossed stance on a workshop rooftop at twilight,
looking up defiantly; golden sparks from craftsmanship swirl around her like
fireflies, slight low angle.
Background: Tokyo Skytree towering directly behind her lit in iki-blue,
tiled downtown roofs and small factory chimneys, indigo-and-copper palette.
```

### 8. 江東区「水辺とみどりのファミリー新興、開拓者」
根拠: 公園10.7㎡/人(2位) / 子育て世帯32%
```
Character: "Koto" — a bright young pioneer girl raising the next generation by
the water, energetic and open-hearted.
Appearance: emerald-to-teal gradient medium hair tied half-up, sunny smile,
sporty white parka with leaf-green accents, cargo shorts, canvas sneakers,
a kayak paddle over one shoulder and a small potted sapling in the other hand.
Composition: standing on a canal-side boardwalk turning back toward the camera
with wind rushing past, hair and jacket streaming, water spray and green
leaves swirling in the air; bright eye-level shot.
Background: clear midday sky, canal water sparkling, waterfront park greenery
and new tower apartments, gulls flying, fresh green-and-white palette.
```

### 9. 品川区「新旧バランス型のしごでき通勤ハブ」
根拠: 昼夜比138% / 全指標が中庸で安定
```
Character: "Shinagawa" — the ultimate competent career woman commuter,
perfectly balanced between old post-town heritage and futuristic station city.
Appearance: navy short bob with a single white streak (shinkansen motif),
cool composed gray eyes, sharply fitted modern pantsuit with a subtle ukiyo-e
wave-pattern lining, smartwatch, sleek briefcase.
Composition: striding straight toward the camera on a station platform,
coat flaring with speed lines and motion blur, one hand adjusting her necktie;
a bullet train streaks past behind her as pure light.
Background: morning rush hour, glass station architecture blended with
an old Tokaido post-town gate, silver-and-navy palette with a red accent line.
```

### 10. 目黒区「おしゃれ住宅街のセンス番長」
根拠: 財政0.73(上位) / 昼夜比105%(住宅街)
```
Character: "Meguro" — the effortlessly stylish tastemaker of a quiet luxury
residential town, relaxed but impeccably put together.
Appearance: ash-pink wavy medium hair, half-lidded confident eyes, sunglasses
pushed up on her head, high-fashion casual — oversized designer coat draped
over shoulders, quality knitwear, small espresso cup in hand.
Composition: leaning back against a river railing with one ankle crossed,
golden-hour light from behind, cherry petals streaming past her in the wind;
slightly low, editorial-magazine angle.
Background: the Meguro River lined with cherry trees in full bloom at sunset,
chic cafe lights turning on, dusty-pink and warm-gray palette.
```

### 11. 大田区「羽田を抱える働き者、面倒見のいい町工場気質」
根拠: 高齢化率22%(上位) / 昼夜比97%
```
Character: "Ota" — a cheerful hard-working big sister who keeps planes flying
and neighbors smiling, town-factory pride and sento warmth.
Appearance: orange-brown short spiky hair with a wrench-shaped hairpin,
big friendly grin, mechanic jumpsuit tied at the waist over a white tee,
tool belt, a sento towel around her neck.
Composition: wide-angle full-body shot on an airport runway at sunset giving
a huge thumbs-up, jet wind blasting her clothes, bolts and small gears
glinting in the air around her.
Background: a passenger jet lifting off right overhead, orange sunset sky,
control tower and small factory silhouettes, warm orange-and-steel palette.
```

### 12. 世田谷区「みんなのお姉さん、大所帯ののんびり屋」
根拠: 子育て世帯29% / 昼夜比91%(ベッドタウン)
```
Character: "Setagaya" — the gentle big sister of the largest family in Tokyo,
unhurried, caring, always with room for one more.
Appearance: milk-tea beige long wavy hair loosely braided over one shoulder,
soft smiling eyes, long relaxed cardigan over a spring dress, wicker picnic
basket, a hand-knit scarf trailing in the breeze.
Composition: sitting gracefully on a grassy park hill with legs folded aside,
one hand holding down her hat against the wind, a colorful kite string in the
other hand leading up out of frame; side-lit eye-level shot.
Background: wide afternoon park with families picnicking as soft bokeh,
suburban rooftops and green trees, cream-and-sage gentle palette.
```

### 13. 渋谷区「トレンドの発信源、華やかで自由なシングル」
根拠: 財政0.96(2位) / 単身64.5%
```
Character: "Shibuya" — the trendsetter at the center of the world's busiest
crossing, free, loud and impossible to ignore.
Appearance: pink-to-cyan gradient hair in an asymmetric cut, glitter makeup,
mixed street fashion — cropped neon jacket, layered accessories, platform
sneakers, holographic phone in hand.
Composition: fisheye-style dynamic shot sprinting across the scramble crossing
mid-stride, jacket flying open, pointing forward at the viewer with a fearless
grin; motion trails of neon light follow her.
Background: Shibuya scramble at night — giant glowing video billboards,
crowds as streaks of light, vivid magenta-cyan-yellow palette.
```

### 14. 中野区「サブカルに生きる自由な一人暮らし玄人」
根拠: 単身率62.4% / 子育て世帯19.9%(下位)
```
Character: "Nakano" — a laid-back subculture girl connoisseur living her best
solo life, surrounded by treasures only she understands.
Appearance: ash-gray messy medium hair, sharp knowing eyes behind the glow of
a screen, oversized hoodie with retro game patches, chunky headphones around
neck, handheld console in one hand.
Composition: sitting cross-legged floating slightly above a cushion, leaning
back casually, surrounded by orbiting figures, capsule toys, manga volumes
and glowing UI windows; cozy top-down tilted angle.
Background: a dim room at night lit by shelf LEDs and a CRT glow, walls of
collectibles in loving chaos, ash-gray with warm amber accent palette.
```

### 15. 杉並区「静かな住宅街で趣味に浸る文化系」
根拠: 昼夜比84%(最低圏) / 単身58.6%
```
Character: "Suginami" — a mellow bookish girl musician who found the perfect
quiet street to live slow and deep.
Appearance: olive-green soft shoulder-length hair tucked behind one ear,
calm gentle eyes, loose vintage shirt with a corduroy jacket, canvas tote
full of paperbacks, acoustic guitar.
Composition: perched on a stool under a shopping-arcade lamp at night,
strumming the guitar with eyes half closed, musical notes drifting up as
soft golden light; warm intimate eye-level shot.
Background: a quiet retro arcade street after closing time, shuttered shops
with warm lamplight pools, a cat listening nearby, olive-and-amber palette.
```

### 16. 豊島区「密度MAXの都会っ子、公園ゼロでも元気」
根拠: 公園0.76㎡/人(最小) / 単身64%
```
Character: "Toshima" — a small explosive city kid who turned the densest
concrete jungle into her personal playground, never runs out of energy.
Appearance: vivid yellow twin-tails with black inner color, huge sparkling
eyes, sporty oversized streetwear in yellow and black, sneakers with LED
soles, a small owl companion perched on her shoulder (Ikebukuro motif).
Composition: leaping between rooftops in a narrow canyon of buildings,
grabbing her cap, legs kicked up mid-jump, grinning down at the camera;
dramatic vertical composition looking up between the towers.
Background: densely packed Ikebukuro buildings and signs closing in on all
sides, laundry lines and rooftop gardens as her 'parks', pop yellow palette.
```

### 17. 北区「昭和の風情を守る人情深いおばあちゃん子」
根拠: 高齢化率22.7%(上位) / 財政0.39
```
Character: "Kita" — a warm-hearted girl raised by her grandmother, keeper of
Showa-era warmth, croquettes and cherry blossoms by the train tracks.
Appearance: brick-red bob hair with a retro flower pin, round warm eyes,
vintage-style sailor blouse with a hand-me-down cardigan, paper bag of
fresh croquettes hugged to her chest.
Composition: leaning out of a retro train window waving cheerfully, hair and
scarf fluttering, cherry petals from Asukayama swirling into the carriage;
nostalgic side-angle shot with warm lens glow.
Background: a Showa-era shopping street and cherry trees rolling past at
golden dusk, film-grain nostalgia, brick-red and sakura-pink palette.
```

### 18. 荒川区「つつましくも家族思い、路面電車の走る街」
根拠: 財政0.34(最低) / 子育て世帯29.8%(上位)
```
Character: "Arakawa" — a modest, endlessly family-minded girl whose small
acts of care are her greatest treasure.
Appearance: cream-blonde gentle low twin-tails with ribbon, kind humble
smile, simple hand-sewn apron dress in cream and sky blue, holding a
beautifully packed homemade bento wrapped in cloth.
Composition: sitting neatly on a tram-stop bench in soft morning light,
offering the bento toward the camera with both hands and a warm smile,
roses (Toden line motif) blooming beside the tracks; gentle eye-level shot.
Background: a cute retro streetcar approaching along flower-lined tracks,
quiet morning downtown, soft cream-and-rose palette.
```

### 19. 板橋区「庶民派の頼れる姐さん、実は成熟した落ち着き」
根拠: 高齢化率22.5% / 昼夜比90%
```
Character: "Itabashi" — the dependable neighborhood big sister in a jersey,
humble on the surface, quietly mature and steady inside.
Appearance: greenish-black hair in a sporty high ponytail, easygoing reliable
smile, classic green-line jersey worn open over a tee, sports towel, carrying
overflowing shopping bags from the local arcade in both arms.
Composition: mid-stride power-walk through a shopping street at evening,
kids running alongside her as blurred silhouettes, one bag balanced on her
shoulder; energetic three-quarter tracking shot.
Background: a lively evening shotengai with a sento chimney and rising bath
steam behind, paper flyers fluttering, green-and-warm-brown palette.
```

### 20. 練馬区「アニメと畑のファミリー長女、面倒見抜群」
根拠: 子育て世帯31.6%(上位) / 単身47.7%(低)
```
Character: "Nerima" — the eldest daughter of a big family, half farmer half
anime nerd, takes care of everyone with a huge open smile.
Appearance: yellow-green tousled twin braids under a pushed-back straw hat,
bright friendly eyes, work overalls with one strap down over an anime-print
tee, watering can in one hand, a cabbage under the other arm.
Composition: standing in a sunlit cabbage field mid-laugh, watering can
raised as droplets catch the light like sparkles, strips of anime film
spiraling around her in the wind; bright wide eye-level shot.
Background: neat vegetable fields meeting suburban homes, an anime studio
building in the distance, drifting clouds, fresh yellow-green palette.
```

### 21. 足立区「気は優しくて力持ち、成熟した下町の姐御」
根拠: 高齢化率23.9%(最高圏) / 公園4.6㎡/人
```
Character: "Adachi" — the gentle-hearted big-sister boss (anego) of downtown,
twisted headband, big laugh, everyone's protector on fireworks night.
Appearance: sunset-orange wild long hair swept back with a navy twisted
hachimaki, broad fearless grin, open festival vest over a summer yukata tied
boldly, strong athletic build, a paper fan tucked in her obi belt.
Composition: arms crossed in a proud stance on the riverbank grass, laughing
with her head tilted up at the fireworks, sparks reflecting in her eyes;
heroic low-angle full-body shot.
Background: massive fireworks blooming over the Arakawa river at night,
families on picnic sheets below as warm silhouettes, festival stalls glowing,
orange-and-navy palette.
```

### 22. 葛飾区「人情と家族の絆No.1、寅さん気質」
根拠: 単身率43.6%(最低)＝家族率最高圏 / 高齢化率24%(最高)
```
Character: "Katsushika" — a wandering free-spirited girl with the deepest
family bonds in Tokyo, a Tora-san-inspired charmer who always comes home.
Appearance: warm brown slightly wavy hair under a classic fedora-style hat,
crinkled smiling eyes, retro checked jacket over a haramaki belly band,
old leather travel trunk in one hand.
Composition: walking away down a riverbank path at sunset but turning back
with a big fond grin and a raised hand of farewell, coat and grass swaying;
cinematic three-quarter back shot.
Background: the Shibamata riverside at dusk, an old temple street with
lanterns lighting up, a family waving from afar, retro brown-and-gold palette.
```

### 23. 江戸川区「公園11.3㎡/人の圧倒的みどり、大家族の末っ子ガキ大将」
根拠: 公園11.26㎡/人(1位) / 子育て世帯34.9%(1位)
```
Character: "Edogawa" — the youngest of the whole 23-ward family, a little
tomboy gang-leader girl of the great outdoors with the biggest park kingdom
in Tokyo.
Appearance: vivid green unruly short twin-tails with a big leaf perched on
top like a crown, sparkling mischievous eyes, tank top and shorts with a net
over her shoulder, insect cage on her hip, band-aid on one cheek, a little
penguin buddy running beside her (aquarium motif).
Composition: super-wide-angle shot sprinting straight at the camera across
a huge sunlit lawn, net swung high, grass and butterflies exploding around
her, penguin flapping behind; ground-level action shot.
Background: an endless green park under a brilliant blue summer sky, giant
ferris wheel and water fountains in the distance, vivid green palette.
```

## ちび版（図鑑・UI用）共通プロンプト

SSR版と同じ髪色・衣装・小物・パレットを引き継いで簡略化する。

```
chibi version of the same character, full body, standing, soft flat pastel
illustration, clean thick outlines, sticker style, simple two-tone background,
cheerful mobile-game mascot aesthetic, consistent 2-head-tall proportion,
front facing, white margin
— [SSR版と同じ: 髪色・衣装・シグネチャー小物・配色] —
```

ネガティブ: `photorealistic, 3d render, text, logo, multiple characters`

生成のコツ: ChatGPTならSSR版の画像を添付して「この子をちび2頭身ステッカー風に」と
指示するのが最も色・モチーフがブレない。

## 生成・運用メモ

- SSR版は港区v1を品質基準に、崩れた区のみ再生成。共通スタイルブロックは一字も変えない。
- 生成画像の配置: `assets/characters/ssr/{ward_id}.png` / `assets/characters/chibi/{ward_id}.png`
- 各キャラページには根拠数値（上記の実数値）をそのまま表示する。
- スティグマ回避チェック済み: 全キャラ「弱み」を性格の魅力に反転して表現
  （財政最下位の荒川→「つつましくも家族思い」等）。ネガティブな序列表現は使わない。
