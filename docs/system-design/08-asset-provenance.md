# データ・画像アセット来歴台帳

## 1. 目的と更新ルール

この台帳は、提出時の権利確認、公開物の再配布、将来の差し替えについて、データと画像アセットの来歴をファイル単位で監査可能にするために保守する。

アセットを追加または差し替える場合は、同じ変更で本台帳の対応行を追加または更新する。出典URL、作者または生成ツール、ライセンス・利用条件、加工内容を確認できない場合は推測せず `要確認` とする。取得日・生成日欄の日付は、`git log --follow --format=%ad --date=short -- <path> | tail -1` で確認した初回コミット日であり、実際の取得日・生成日ではなくリポジトリへの初回取込日を示す。

## 2. 区章（使用を取りやめた経緯）

23区の区章SVG（Wikimedia Commons由来、著作権はいずれもPublic domain）を区詳細ページに表示していたが、2026-07-31に取りやめ、`public/emblems/` を削除した。キャラクターの円形アイコン（3.3）に置き換えている。

著作権上の問題はなかった。取りやめの理由は、著作権とは別に各区が紋章の使用手続を定めている場合があり、23区一律に適法と確認できなかったことである。調査時点（2026-07-31）で確認できた事実は次のとおり。

| 区 | 紋章の第三者使用 | 根拠 |
|---|---|---|
| 新宿区 | 承認制。「無断で使用することはできません」と明示。承認は区の施策推進に寄与する場合に限り、私的な利益を目的とする使用は不承認。使用後の報告書提出も必要 | [新宿区紋章の使用手続について](https://www.city.shinjuku.lg.jp/kusei/soumu01_002070.html) |
| 練馬区 | 承認制。区長の承認が必要で、承認できる場合を限定列挙 | [練馬区紋章使用承認基準](https://www1.g-reiki.net/nerima/reiki_honbun/a100RG00001097.html) |
| 荒川区 | 届出制。要綱が対象を「シンボルマーク及び紋章」と規定。報道・区内学校の教育目的等は免除 | [荒川区シンボルマーク等の使用に関する取扱要綱](https://www.city.arakawa.tokyo.jp/reiki_int/reiki_honbun/p800RG00000660.html) |
| 千代田区 | 規則ではないが、区サイトで紋章画像の二次利用を明示的に否定 | [千代田区 区の紋章](https://www.city.chiyoda.lg.jp/koho/kuse/gaiyo/yokoso/monsho.html) |
| 江東区 | 紋章は区の公式行事・儀式で使用と位置づけ。第三者使用の承認手続はシンボルマークとロゴマークにのみ存在し、紋章の申請ルートは公開されていない | [取扱方針](https://www.city.koto.lg.jp/reiki-koho/reiki_honbun/g109RG00000616.html) / [シンボルマーク使用承認事務取扱要綱](https://www.city.koto.lg.jp/reiki-koho/reiki_honbun/g109RG00000615.html) |
| 渋谷・杉並・豊島・北・板橋・江戸川・足立 | **未確認**。例規集がJavaScript検索UIまたはログイン必須で条文本文に到達できなかった。「規定なし」の確認ではない | — |
| 上記以外 | 制定告示（図案と作図法）のみを確認。第三者使用の定めは確認できず | 各区例規集 |

Commonsの江東区ファイルページには「使用には江東区の承認を得るべき」という個別注記があるが、上記のとおり江東区に紋章の申請ルートはなく、この注記はシンボルマークの要綱を紋章に当てはめたものと考えられる。またCommonsのinsignia警告テンプレートは国際的な汎用文であり、日本の不正競争防止法16条は「外国の」国旗・紋章等を対象とするため、国内の区章には直接適用されない。商標法4条1項6号は登録拒絶事由であって表示禁止ではない。

## 3. AI生成画像

### 3.1 23区キャラクター原本

| ファイルパス | 出典/生成手段 | 出典URLまたはプロンプト参照 | 作者/ツール | ライセンス・利用条件 | 取得日/生成日 | 加工内容 |
|---|---|---|---|---|---|---|
| `assets/characters/ssr/chiyoda.png` | 5軸実数と共通デザインルールからAI生成 | `docs/submission/作品提出フォーム回答案.md:119` | ChatGPT | 生成時点のOpenAI利用規約に従う。生成時プランと入力素材の権利は要確認 | 2026-07-11（リポジトリ初回取込日） | `scripts/build-hero-images.mjs`で`public/characters/ssr/chiyoda-w512.webp`と`chiyoda-w896.webp`へリサイズ・WebP変換 |
| `assets/characters/ssr/chuo.png` | 5軸実数と共通デザインルールからAI生成 | `docs/submission/作品提出フォーム回答案.md:119` | ChatGPT | 生成時点のOpenAI利用規約に従う。生成時プランと入力素材の権利は要確認 | 2026-07-11（リポジトリ初回取込日） | `scripts/build-hero-images.mjs`で`public/characters/ssr/chuo-w512.webp`と`chuo-w896.webp`へリサイズ・WebP変換 |
| `assets/characters/ssr/minato.png` | 5軸実数と共通デザインルールからAI生成 | `docs/submission/作品提出フォーム回答案.md:119` | ChatGPT | 生成時点のOpenAI利用規約に従う。生成時プランと入力素材の権利は要確認 | 2026-07-11（リポジトリ初回取込日） | `scripts/build-hero-images.mjs`で`public/characters/ssr/minato-w512.webp`と`minato-w896.webp`へリサイズ・WebP変換 |
| `assets/characters/ssr/shinjuku.png` | 5軸実数と共通デザインルールからAI生成 | `docs/submission/作品提出フォーム回答案.md:119` | ChatGPT | 生成時点のOpenAI利用規約に従う。生成時プランと入力素材の権利は要確認 | 2026-07-11（リポジトリ初回取込日） | `scripts/build-hero-images.mjs`で`public/characters/ssr/shinjuku-w512.webp`と`shinjuku-w896.webp`へリサイズ・WebP変換 |
| `assets/characters/ssr/bunkyo.png` | 5軸実数と共通デザインルールからAI生成 | `docs/submission/作品提出フォーム回答案.md:119` | ChatGPT | 生成時点のOpenAI利用規約に従う。生成時プランと入力素材の権利は要確認 | 2026-07-11（リポジトリ初回取込日） | `scripts/build-hero-images.mjs`で`public/characters/ssr/bunkyo-w512.webp`と`bunkyo-w896.webp`へリサイズ・WebP変換 |
| `assets/characters/ssr/taito.png` | 5軸実数と共通デザインルールからAI生成 | `docs/submission/作品提出フォーム回答案.md:119` | ChatGPT | 生成時点のOpenAI利用規約に従う。生成時プランと入力素材の権利は要確認 | 2026-07-11（リポジトリ初回取込日） | `scripts/build-hero-images.mjs`で`public/characters/ssr/taito-w512.webp`と`taito-w896.webp`へリサイズ・WebP変換 |
| `assets/characters/ssr/sumida.png` | 5軸実数と共通デザインルールからAI生成 | `docs/submission/作品提出フォーム回答案.md:119` | ChatGPT | 生成時点のOpenAI利用規約に従う。生成時プランと入力素材の権利は要確認 | 2026-07-11（リポジトリ初回取込日） | `scripts/build-hero-images.mjs`で`public/characters/ssr/sumida-w512.webp`と`sumida-w896.webp`へリサイズ・WebP変換 |
| `assets/characters/ssr/koto.png` | 5軸実数と共通デザインルールからAI生成 | `docs/submission/作品提出フォーム回答案.md:119` | ChatGPT | 生成時点のOpenAI利用規約に従う。生成時プランと入力素材の権利は要確認 | 2026-07-11（リポジトリ初回取込日） | `scripts/build-hero-images.mjs`で`public/characters/ssr/koto-w512.webp`と`koto-w896.webp`へリサイズ・WebP変換 |
| `assets/characters/ssr/shinagawa.png` | 5軸実数と共通デザインルールからAI生成 | `docs/submission/作品提出フォーム回答案.md:119` | ChatGPT | 生成時点のOpenAI利用規約に従う。生成時プランと入力素材の権利は要確認 | 2026-07-11（リポジトリ初回取込日） | `scripts/build-hero-images.mjs`で`public/characters/ssr/shinagawa-w512.webp`と`shinagawa-w896.webp`へリサイズ・WebP変換 |
| `assets/characters/ssr/meguro.png` | 5軸実数と共通デザインルールからAI生成 | `docs/submission/作品提出フォーム回答案.md:119` | ChatGPT | 生成時点のOpenAI利用規約に従う。生成時プランと入力素材の権利は要確認 | 2026-07-11（リポジトリ初回取込日） | `scripts/build-hero-images.mjs`で`public/characters/ssr/meguro-w512.webp`と`meguro-w896.webp`へリサイズ・WebP変換 |
| `assets/characters/ssr/ota.png` | 5軸実数と共通デザインルールからAI生成 | `docs/submission/作品提出フォーム回答案.md:119` | ChatGPT | 生成時点のOpenAI利用規約に従う。生成時プランと入力素材の権利は要確認 | 2026-07-11（リポジトリ初回取込日） | `scripts/build-hero-images.mjs`で`public/characters/ssr/ota-w512.webp`と`ota-w896.webp`へリサイズ・WebP変換 |
| `assets/characters/ssr/setagaya.png` | 5軸実数と共通デザインルールからAI生成 | `docs/submission/作品提出フォーム回答案.md:119` | ChatGPT | 生成時点のOpenAI利用規約に従う。生成時プランと入力素材の権利は要確認 | 2026-07-11（リポジトリ初回取込日） | `scripts/build-hero-images.mjs`で`public/characters/ssr/setagaya-w512.webp`と`setagaya-w896.webp`へリサイズ・WebP変換 |
| `assets/characters/ssr/shibuya.png` | 5軸実数と共通デザインルールからAI生成 | `docs/submission/作品提出フォーム回答案.md:119` | ChatGPT | 生成時点のOpenAI利用規約に従う。生成時プランと入力素材の権利は要確認 | 2026-07-11（リポジトリ初回取込日） | `scripts/build-hero-images.mjs`で`public/characters/ssr/shibuya-w512.webp`と`shibuya-w896.webp`へリサイズ・WebP変換 |
| `assets/characters/ssr/nakano.png` | 5軸実数と共通デザインルールからAI生成 | `docs/submission/作品提出フォーム回答案.md:119` | ChatGPT | 生成時点のOpenAI利用規約に従う。生成時プランと入力素材の権利は要確認 | 2026-07-11（リポジトリ初回取込日） | `scripts/build-hero-images.mjs`で`public/characters/ssr/nakano-w512.webp`と`nakano-w896.webp`へリサイズ・WebP変換 |
| `assets/characters/ssr/suginami.png` | 5軸実数と共通デザインルールからAI生成 | `docs/submission/作品提出フォーム回答案.md:119` | ChatGPT | 生成時点のOpenAI利用規約に従う。生成時プランと入力素材の権利は要確認 | 2026-07-11（リポジトリ初回取込日） | `scripts/build-hero-images.mjs`で`public/characters/ssr/suginami-w512.webp`と`suginami-w896.webp`へリサイズ・WebP変換 |
| `assets/characters/ssr/toshima.png` | 5軸実数と共通デザインルールからAI生成 | `docs/submission/作品提出フォーム回答案.md:119` | ChatGPT | 生成時点のOpenAI利用規約に従う。生成時プランと入力素材の権利は要確認 | 2026-07-11（リポジトリ初回取込日） | `scripts/build-hero-images.mjs`で`public/characters/ssr/toshima-w512.webp`と`toshima-w896.webp`へリサイズ・WebP変換 |
| `assets/characters/ssr/kita.png` | 5軸実数と共通デザインルールからAI生成 | `docs/submission/作品提出フォーム回答案.md:119` | ChatGPT | 生成時点のOpenAI利用規約に従う。生成時プランと入力素材の権利は要確認 | 2026-07-11（リポジトリ初回取込日） | `scripts/build-hero-images.mjs`で`public/characters/ssr/kita-w512.webp`と`kita-w896.webp`へリサイズ・WebP変換 |
| `assets/characters/ssr/arakawa.png` | 5軸実数と共通デザインルールからAI生成 | `docs/submission/作品提出フォーム回答案.md:119` | ChatGPT | 生成時点のOpenAI利用規約に従う。生成時プランと入力素材の権利は要確認 | 2026-07-11（リポジトリ初回取込日） | `scripts/build-hero-images.mjs`で`public/characters/ssr/arakawa-w512.webp`と`arakawa-w896.webp`へリサイズ・WebP変換 |
| `assets/characters/ssr/itabashi.png` | 5軸実数と共通デザインルールからAI生成 | `docs/submission/作品提出フォーム回答案.md:119` | ChatGPT | 生成時点のOpenAI利用規約に従う。生成時プランと入力素材の権利は要確認 | 2026-07-11（リポジトリ初回取込日） | `scripts/build-hero-images.mjs`で`public/characters/ssr/itabashi-w512.webp`と`itabashi-w896.webp`へリサイズ・WebP変換 |
| `assets/characters/ssr/nerima.png` | 5軸実数と共通デザインルールからAI生成 | `docs/submission/作品提出フォーム回答案.md:119` | ChatGPT | 生成時点のOpenAI利用規約に従う。生成時プランと入力素材の権利は要確認 | 2026-07-11（リポジトリ初回取込日） | `scripts/build-hero-images.mjs`で`public/characters/ssr/nerima-w512.webp`と`nerima-w896.webp`へリサイズ・WebP変換 |
| `assets/characters/ssr/adachi.png` | 5軸実数と共通デザインルールからAI生成 | `docs/submission/作品提出フォーム回答案.md:119` | ChatGPT | 生成時点のOpenAI利用規約に従う。生成時プランと入力素材の権利は要確認 | 2026-07-11（リポジトリ初回取込日） | `scripts/build-hero-images.mjs`で`public/characters/ssr/adachi-w512.webp`と`adachi-w896.webp`へリサイズ・WebP変換 |
| `assets/characters/ssr/katsushika.png` | 5軸実数と共通デザインルールからAI生成 | `docs/submission/作品提出フォーム回答案.md:119` | ChatGPT | 生成時点のOpenAI利用規約に従う。生成時プランと入力素材の権利は要確認 | 2026-07-11（リポジトリ初回取込日） | `scripts/build-hero-images.mjs`で`public/characters/ssr/katsushika-w512.webp`と`katsushika-w896.webp`へリサイズ・WebP変換 |
| `assets/characters/ssr/edogawa.png` | 5軸実数と共通デザインルールからAI生成 | `docs/submission/作品提出フォーム回答案.md:119` | ChatGPT | 生成時点のOpenAI利用規約に従う。生成時プランと入力素材の権利は要確認 | 2026-07-11（リポジトリ初回取込日） | `scripts/build-hero-images.mjs`で`public/characters/ssr/edogawa-w512.webp`と`edogawa-w896.webp`へリサイズ・WebP変換 |

### 3.2 OGP原本

| ファイルパス | 出典/生成手段 | 出典URLまたはプロンプト参照 | 作者/ツール | ライセンス・利用条件 | 取得日/生成日 | 加工内容 |
|---|---|---|---|---|---|---|
| `assets/og/chiyoda.png` | 対応するキャラクター原本を参照画像として生成AIで作成 | `docs/strategy/og-image-prompts.md:21` | ChatGPT | 生成時点のOpenAI利用規約と、入力したキャラクター原本の利用条件に従う。生成時プランは要確認 | 2026-07-13（リポジトリ初回取込日） | `scripts/build-og-images.mjs`で1200×630、JPEG品質85の`public/og/chiyoda.jpg`へ変換 |
| `assets/og/chuo.png` | 対応するキャラクター原本を参照画像として生成AIで作成 | `docs/strategy/og-image-prompts.md:41` | ChatGPT | 生成時点のOpenAI利用規約と、入力したキャラクター原本の利用条件に従う。生成時プランは要確認 | 2026-07-13（リポジトリ初回取込日） | `scripts/build-og-images.mjs`で1200×630、JPEG品質85の`public/og/chuo.jpg`へ変換 |
| `assets/og/minato.png` | 対応するキャラクター原本を参照画像として生成AIで作成 | `docs/strategy/og-image-prompts.md:61` | ChatGPT | 生成時点のOpenAI利用規約と、入力したキャラクター原本の利用条件に従う。生成時プランは要確認 | 2026-07-13（リポジトリ初回取込日） | `scripts/build-og-images.mjs`で1200×630、JPEG品質85の`public/og/minato.jpg`へ変換 |
| `assets/og/shinjuku.png` | 対応するキャラクター原本を参照画像として生成AIで作成 | `docs/strategy/og-image-prompts.md:81` | ChatGPT | 生成時点のOpenAI利用規約と、入力したキャラクター原本の利用条件に従う。生成時プランは要確認 | 2026-07-14（リポジトリ初回取込日） | `scripts/build-og-images.mjs`で1200×630、JPEG品質85の`public/og/shinjuku.jpg`へ変換 |
| `assets/og/bunkyo.png` | 対応するキャラクター原本を参照画像として生成AIで作成 | `docs/strategy/og-image-prompts.md:101` | ChatGPT | 生成時点のOpenAI利用規約と、入力したキャラクター原本の利用条件に従う。生成時プランは要確認 | 2026-07-14（リポジトリ初回取込日） | `scripts/build-og-images.mjs`で1200×630、JPEG品質85の`public/og/bunkyo.jpg`へ変換 |
| `assets/og/taito.png` | 対応するキャラクター原本を参照画像として生成AIで作成 | `docs/strategy/og-image-prompts.md:121` | ChatGPT | 生成時点のOpenAI利用規約と、入力したキャラクター原本の利用条件に従う。生成時プランは要確認 | 2026-07-14（リポジトリ初回取込日） | `scripts/build-og-images.mjs`で1200×630、JPEG品質85の`public/og/taito.jpg`へ変換 |
| `assets/og/sumida.png` | 対応するキャラクター原本を参照画像として生成AIで作成 | `docs/strategy/og-image-prompts.md:141` | ChatGPT | 生成時点のOpenAI利用規約と、入力したキャラクター原本の利用条件に従う。生成時プランは要確認 | 2026-07-14（リポジトリ初回取込日） | `scripts/build-og-images.mjs`で1200×630、JPEG品質85の`public/og/sumida.jpg`へ変換 |
| `assets/og/koto.png` | 対応するキャラクター原本を参照画像として生成AIで作成 | `docs/strategy/og-image-prompts.md:161` | ChatGPT | 生成時点のOpenAI利用規約と、入力したキャラクター原本の利用条件に従う。生成時プランは要確認 | 2026-07-14（リポジトリ初回取込日） | `scripts/build-og-images.mjs`で1200×630、JPEG品質85の`public/og/koto.jpg`へ変換 |
| `assets/og/shinagawa.png` | 対応するキャラクター原本を参照画像として生成AIで作成 | `docs/strategy/og-image-prompts.md:181` | ChatGPT | 生成時点のOpenAI利用規約と、入力したキャラクター原本の利用条件に従う。生成時プランは要確認 | 2026-07-14（リポジトリ初回取込日） | `scripts/build-og-images.mjs`で1200×630、JPEG品質85の`public/og/shinagawa.jpg`へ変換 |
| `assets/og/meguro.png` | 対応するキャラクター原本を参照画像として生成AIで作成 | `docs/strategy/og-image-prompts.md:201` | ChatGPT | 生成時点のOpenAI利用規約と、入力したキャラクター原本の利用条件に従う。生成時プランは要確認 | 2026-07-14（リポジトリ初回取込日） | `scripts/build-og-images.mjs`で1200×630、JPEG品質85の`public/og/meguro.jpg`へ変換 |
| `assets/og/ota.png` | 対応するキャラクター原本を参照画像として生成AIで作成 | `docs/strategy/og-image-prompts.md:221` | ChatGPT | 生成時点のOpenAI利用規約と、入力したキャラクター原本の利用条件に従う。生成時プランは要確認 | 2026-07-14（リポジトリ初回取込日） | `scripts/build-og-images.mjs`で1200×630、JPEG品質85の`public/og/ota.jpg`へ変換 |
| `assets/og/setagaya.png` | 対応するキャラクター原本を参照画像として生成AIで作成 | `docs/strategy/og-image-prompts.md:241` | ChatGPT | 生成時点のOpenAI利用規約と、入力したキャラクター原本の利用条件に従う。生成時プランは要確認 | 2026-07-14（リポジトリ初回取込日） | `scripts/build-og-images.mjs`で1200×630、JPEG品質85の`public/og/setagaya.jpg`へ変換 |
| `assets/og/shibuya.png` | 対応するキャラクター原本を参照画像として生成AIで作成 | `docs/strategy/og-image-prompts.md:261` | ChatGPT | 生成時点のOpenAI利用規約と、入力したキャラクター原本の利用条件に従う。生成時プランは要確認 | 2026-07-14（リポジトリ初回取込日） | `scripts/build-og-images.mjs`で1200×630、JPEG品質85の`public/og/shibuya.jpg`へ変換 |
| `assets/og/nakano.png` | 対応するキャラクター原本を参照画像として生成AIで作成 | `docs/strategy/og-image-prompts.md:281` | ChatGPT | 生成時点のOpenAI利用規約と、入力したキャラクター原本の利用条件に従う。生成時プランは要確認 | 2026-07-14（リポジトリ初回取込日） | `scripts/build-og-images.mjs`で1200×630、JPEG品質85の`public/og/nakano.jpg`へ変換 |
| `assets/og/suginami.png` | 対応するキャラクター原本を参照画像として生成AIで作成 | `docs/strategy/og-image-prompts.md:301` | ChatGPT | 生成時点のOpenAI利用規約と、入力したキャラクター原本の利用条件に従う。生成時プランは要確認 | 2026-07-14（リポジトリ初回取込日） | `scripts/build-og-images.mjs`で1200×630、JPEG品質85の`public/og/suginami.jpg`へ変換 |
| `assets/og/toshima.png` | 対応するキャラクター原本を参照画像として生成AIで作成 | `docs/strategy/og-image-prompts.md:321` | ChatGPT | 生成時点のOpenAI利用規約と、入力したキャラクター原本の利用条件に従う。生成時プランは要確認 | 2026-07-14（リポジトリ初回取込日） | `scripts/build-og-images.mjs`で1200×630、JPEG品質85の`public/og/toshima.jpg`へ変換 |
| `assets/og/kita.png` | 対応するキャラクター原本を参照画像として生成AIで作成 | `docs/strategy/og-image-prompts.md:341` | ChatGPT | 生成時点のOpenAI利用規約と、入力したキャラクター原本の利用条件に従う。生成時プランは要確認 | 2026-07-14（リポジトリ初回取込日） | `scripts/build-og-images.mjs`で1200×630、JPEG品質85の`public/og/kita.jpg`へ変換 |
| `assets/og/arakawa.png` | 対応するキャラクター原本を参照画像として生成AIで作成 | `docs/strategy/og-image-prompts.md:361` | ChatGPT | 生成時点のOpenAI利用規約と、入力したキャラクター原本の利用条件に従う。生成時プランは要確認 | 2026-07-14（リポジトリ初回取込日） | `scripts/build-og-images.mjs`で1200×630、JPEG品質85の`public/og/arakawa.jpg`へ変換 |
| `assets/og/itabashi.png` | 対応するキャラクター原本を参照画像として生成AIで作成 | `docs/strategy/og-image-prompts.md:381` | ChatGPT | 生成時点のOpenAI利用規約と、入力したキャラクター原本の利用条件に従う。生成時プランは要確認 | 2026-07-14（リポジトリ初回取込日） | `scripts/build-og-images.mjs`で1200×630、JPEG品質85の`public/og/itabashi.jpg`へ変換 |
| `assets/og/nerima.png` | 対応するキャラクター原本を参照画像として生成AIで作成 | `docs/strategy/og-image-prompts.md:401` | ChatGPT | 生成時点のOpenAI利用規約と、入力したキャラクター原本の利用条件に従う。生成時プランは要確認 | 2026-07-14（リポジトリ初回取込日） | `scripts/build-og-images.mjs`で1200×630、JPEG品質85の`public/og/nerima.jpg`へ変換 |
| `assets/og/adachi.png` | 対応するキャラクター原本を参照画像として生成AIで作成 | `docs/strategy/og-image-prompts.md:421` | ChatGPT | 生成時点のOpenAI利用規約と、入力したキャラクター原本の利用条件に従う。生成時プランは要確認 | 2026-07-14（リポジトリ初回取込日） | `scripts/build-og-images.mjs`で1200×630、JPEG品質85の`public/og/adachi.jpg`へ変換 |
| `assets/og/katsushika.png` | 対応するキャラクター原本を参照画像として生成AIで作成 | `docs/strategy/og-image-prompts.md:441` | ChatGPT | 生成時点のOpenAI利用規約と、入力したキャラクター原本の利用条件に従う。生成時プランは要確認 | 2026-07-14（リポジトリ初回取込日） | `scripts/build-og-images.mjs`で1200×630、JPEG品質85の`public/og/katsushika.jpg`へ変換 |
| `assets/og/edogawa.png` | 対応するキャラクター原本を参照画像として生成AIで作成 | `docs/strategy/og-image-prompts.md:461` | ChatGPT | 生成時点のOpenAI利用規約と、入力したキャラクター原本の利用条件に従う。生成時プランは要確認 | 2026-07-14（リポジトリ初回取込日） | `scripts/build-og-images.mjs`で1200×630、JPEG品質85の`public/og/edogawa.jpg`へ変換 |
| `assets/og/home.png` | 23区キャラクター原本を参照画像として生成AIで作成 | `docs/strategy/og-image-prompts.md:483` | ChatGPT | 生成時点のOpenAI利用規約と、入力したキャラクター原本の利用条件に従う。生成時プランは要確認 | 2026-07-14（リポジトリ初回取込日） | `scripts/build-og-images.mjs`で1200×630、JPEG品質85の`public/og/home.jpg`へ変換 |

### 3.3 区アイコン原本

区章の代替として区詳細ページ「区のプロフィール」に表示する円形アイコン。23区分を `assets/icons/{slug}.png` に置き、`npm run build:icons` で `public/icons/{slug}.webp`（256×256、WebP品質88）へ変換する。丸抜きはCSSの `border-radius` で行うため、原本・出力とも正方形である。

生成は各区のキャラクター原本（3.1）を参照画像として添付し、[docs/strategy/ward-icon-prompts.md](../strategy/ward-icon-prompts.md) のプロンプトで行う。生成後は同ファイル末尾のチェックリストで確認する。

| ファイルパス | 出典/生成手段 | 出典URLまたはプロンプト参照 | 作者/ツール | ライセンス・利用条件 | 取得日/生成日 | 加工内容 |
|---|---|---|---|---|---|---|
| `assets/icons/{slug}.png`（23区分） | 対応するキャラクター原本を参照画像としてAI生成 | `docs/strategy/ward-icon-prompts.md` | ChatGPT | 生成時点のOpenAI利用規約と、入力したキャラクター原本の利用条件に従う。生成時プランは要確認 | 未生成（生成後に日付を記入する） | `scripts/build-icons.mjs`で256×256、WebP品質88の`public/icons/{slug}.webp`へ変換 |

### 3.4 その他の生成画像原本

| ファイルパス | 出典/生成手段 | 出典URLまたはプロンプト参照 | 作者/ツール | ライセンス・利用条件 | 取得日/生成日 | 加工内容 |
|---|---|---|---|---|---|---|
| `assets/title.png` | 生成AIで作成。生成手順は未整理 | 要確認（プロンプト未記録） | 要確認（生成ツール・操作担当者未整理） | 要確認（生成ツールの利用規約、生成時プラン、入力素材の権利） | 生成日: 要確認 / 2026-07-11（リポジトリ初回取込日） | `scripts/build-title.mjs`で余白をトリミングし、`public/title-w720.webp`と`public/title-w1440.webp`へリサイズ・WebP変換 |
| `assets/book-cover.png` | 生成AIで作成。生成手順は未整理 | 要確認（プロンプト未記録） | 要確認（生成ツール・操作担当者未整理） | 要確認（生成ツールの利用規約、生成時プラン、入力素材の権利） | 生成日: 要確認 / 2026-07-12（リポジトリ初回取込日） | `scripts/build-modal-images.mjs`で幅1600px、WebP品質82の`public/book-cover.webp`へ変換 |

## 4. rawデータ

東京都オープンデータカタログ由来のデータは、同カタログの原則に従いCC BY 4.0として記録する。国のデータは、各提供サイトの利用規約・利用約款に従う。

| ファイルパス | 出典/生成手段 | 出典URLまたはプロンプト参照 | 作者/ツール | ライセンス・利用条件 | 取得日/生成日 | 加工内容 |
|---|---|---|---|---|---|---|
| `data/raw/N03-21_13_city.topojson` | 国土交通省「国土数値情報（行政区域データ）」をsmartnews-smriが簡略化した東京都TopoJSON。対象: 市区町村境界。利用プロパティ: `N03_007`、`N03_004`、境界arc | https://github.com/smartnews-smri/japan-topography | 国土交通省 / smartnews-smri | 国土数値情報ダウンロードサイト利用約款および再配布元の利用条件に従う。再配布元の個別条件は要確認 | 2026-07-12（リポジトリ初回取込日） | 元ファイル`N03-21_13_210101.json`のs0010簡略版。`build_geo.py`でarcを復号し、局所平面km座標、重心、面積へ変換。0.02km²未満のリングと内穴を除外 |
| `data/raw/chika_r7_chiten.csv` | 国土交通省「令和7年地価公示」地点別データ。対象: 住宅地（用途0）。利用列: `都道府県市区町村コード`、`標準地番号（用途）`、`当年価格（円）` | https://www.mlit.go.jp/totikensangyo/totikensangyo_fr4_000444.html | 国土交通省 | 国土交通省ウェブサイト利用規約に従う | 2026-07-11（リポジトリ初回取込日） | `build_details.py`で23区ごとに住宅地価格の単純平均と地点数を算出 |
| `data/raw/estat_table10_kazokutypes.xlsx` | 総務省統計局「令和2年国勢調査 人口等基本集計」第10表「世帯の家族類型、世帯人員の人数別一般世帯数」。対象シート: `b10`。利用列: 地域、世帯人員区分、一般世帯総数、子どもを含む3区分 | https://www.e-stat.go.jp/stat-search/database?statdisp_id=0003445080 | 総務省統計局 / e-Stat | 政府統計の総合窓口の利用規約に従う | 2026-07-11（リポジトリ初回取込日） | `build_wards.py`で単身世帯率と子育て世帯率を算出 |
| `data/raw/ga26ev0100.csv` | 東京都の統計「国籍・地域別 外国人人口」（令和8年1月1日現在）。対象: 区市町村別・国籍別外国人人口。利用列: `地域コード`、`総数` | https://www.toukei.metro.tokyo.lg.jp/gaikoku/2026/ga26ev0100.csv | 東京都総務局統計部 | CC BY 4.0（東京都オープンデータカタログ原則） | 2026-07-11（リポジトリ初回取込日） | `build_details.py`で住民基本台帳総人口を分母に外国人人口比率を算出 |
| `data/raw/jy26qv0301.csv` | 東京都の統計「住民基本台帳による東京都の世帯と人口 年齢別人口」（令和8年1月1日現在）。利用列: `地域コード`、地域名、年少・生産年齢・老年人口の各総数 | https://www.toukei.metro.tokyo.lg.jp/juukiy/2026/jy26qv0301.csv | 東京都総務局統計部 | CC BY 4.0（東京都オープンデータカタログ原則） | 2026-07-11（リポジトリ初回取込日） | `build_wards.py`で高齢化率・年少人口率を、`build_details.py`で総人口と外国人人口比率の分母を算出 |
| `data/raw/keishicho_R6_ninchikensu.csv` | 警視庁「区市町村の町丁別、罪種別及び手口別認知件数（年累計）」令和6年分。利用列: `市区町丁`、`総合計`。区名と完全一致する公式合計行を採用 | https://www.keishicho.metro.tokyo.lg.jp/about_mpd/jokyo_tokei/jokyo/ninchikensu.html | 警視庁 | CC BY 4.0 | 2026-07-12（リポジトリ初回取込日） | `build_details.py`で住民基本台帳総人口を分母に人口千人当たり刑法犯認知件数を算出。Shift_JISをデコード |
| `data/raw/kouen_r7_kushichoson.csv` | 東京都建設局「東京都都市公園等区市町村別面積・人口割比率表」（令和7年4月1日現在）。利用列: 行政区分、公立公園合計の一人当たり面積`ハ/Ｂ` | https://www.kensetsu.metro.tokyo.lg.jp/park/kouenannai/kouen_menseki | 東京都建設局 | CC BY 4.0（東京都オープンデータカタログ原則） | 2026-07-11（リポジトリ初回取込日） | `build_wards.py`で国民公園・公団を除く一人当たり公立公園面積を抽出。CP932をデコード |
| `data/raw/soumu_000983094.xlsx` | 総務省「全市町村の主要財政指標」（令和5年度）。対象シート: `全市町村の主要財政指標`。利用列: 都道府県名、団体名、財政力指数 | https://www.soumu.go.jp/main_content/000983094.xlsx | 総務省 | 総務省ウェブサイト利用規約に従う | 2026-07-11（リポジトリ初回取込日） | `build_wards.py`で東京都23区の財政力指数を抽出 |
| `data/raw/soumu_J51-24-b.xlsx` | 総務省「市町村税課税状況等の調」（令和6年度）第11表市町村別内訳。対象シート: `令和6年度_第11表市町村別データ`。利用列: 団体コード、表側、所得割納税義務者数、課税対象所得 | https://www.soumu.go.jp/main_sosiki/jichi_zeisei/czaisei/czaisei_seido/xls/J51-24-b.xlsx | 総務省 | 総務省ウェブサイト利用規約に従う | 2026-07-12（リポジトリ初回取込日） | `build_details.py`で市町村民税の課税対象所得を所得割納税義務者数で割り、1人当たり課税対象所得を算出 |
| `data/raw/tocho_hoiku_r7_hyou4.xlsx` | 東京都福祉局「保育サービスの状況」（令和7年4月1日現在）表4「区市町村別の状況」。対象シート: `表４`。利用列: 区名（B列）、2025年4月1日現在の待機児童数（F列） | https://www.metro.tokyo.lg.jp/documents/d/tosei/20250829_17_04 | 東京都福祉局 | CC BY 4.0（東京都オープンデータカタログ原則） | 2026-07-12（リポジトリ初回取込日） | `build_details.py`で23区の待機児童数を抽出 |
| `data/raw/tokyo_daytime_population_2020_tj20zv0100.csv` | 東京都の統計「令和2年国勢調査 従業地・通学地による人口・就業状態等集計」。利用列: 地域名、`昼夜間人口比率／総数（％）` | https://www.toukei.metro.tokyo.lg.jp/tyukanj/2020/tj20zv0100.csv | 東京都総務局統計部 / 総務省統計局 | CC BY 4.0（東京都オープンデータカタログ原則） | 2026-07-11（リポジトリ初回取込日） | `build_wards.py`で23区の昼夜間人口比率を抽出。UTF-8 BOMを除去して読み込み |
