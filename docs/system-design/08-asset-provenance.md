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

本章の画像はすべてChatGPT（ChatGPT Business）で生成した。[OpenAIサービス契約](https://openai.com/policies/business-terms/)（2026年1月1日発効）は同契約が ChatGPT Business に適用されると冒頭で定めており、権利関係は次のとおり整理できる。

- 4.1 出力の所有: 顧客が入力の所有権を保持し、すべての出力を所有する。OpenAIは出力に関する自らの一切の権利・権原・利益を顧客へ譲渡する。
- 4.2 学習利用: 顧客が明示的に同意しない限り、顧客コンテンツはサービスの開発・改善に利用されない。
- 4.3 入力データの責任: 入力データについて必要な権利・ライセンス・許可を有することを顧客が表明保証する。本作品の入力はテキストプロンプトか3.1の自作生成物だけで、第三者の素材は使用していない。

契約主体は組織だが、本作品での個人利用について契約組織の承認を得ている。

留保が2点ある。同4.4のとおり出力は一意とは限らず、他の利用者が類似コンテンツを受け取る場合がある。また日本の著作権法上、AI生成画像に著作物性が認められるかは別問題である。自作品での利用に支障はないが、第三者による類似物の作成を排除できるとは限らないため、キャラクターの独占性は前提にしない。

### 3.1 23区キャラクター原本

| ファイルパス | 出典/生成手段 | 出典URLまたはプロンプト参照 | 作者/ツール | ライセンス・利用条件 | 取得日/生成日 | 加工内容 |
|---|---|---|---|---|---|---|
| `assets/characters/ssr/chiyoda.png` | 5軸実数と共通デザインルールからAI生成 | `docs/submission/作品提出フォーム回答案.md:119` | ChatGPT（Business） | 3章冒頭のとおり出力の権利は契約組織に帰属。入力はテキストプロンプトのみで第三者素材の添付なし | 2026-07-11（リポジトリ初回取込日） | `scripts/build-hero-images.mjs`で`public/characters/ssr/chiyoda-w512.webp`と`chiyoda-w896.webp`へリサイズ・WebP変換 |
| `assets/characters/ssr/chuo.png` | 5軸実数と共通デザインルールからAI生成 | `docs/submission/作品提出フォーム回答案.md:119` | ChatGPT（Business） | 3章冒頭のとおり出力の権利は契約組織に帰属。入力はテキストプロンプトのみで第三者素材の添付なし | 2026-07-11（リポジトリ初回取込日） | `scripts/build-hero-images.mjs`で`public/characters/ssr/chuo-w512.webp`と`chuo-w896.webp`へリサイズ・WebP変換 |
| `assets/characters/ssr/minato.png` | 5軸実数と共通デザインルールからAI生成 | `docs/submission/作品提出フォーム回答案.md:119` | ChatGPT（Business） | 3章冒頭のとおり出力の権利は契約組織に帰属。入力はテキストプロンプトのみで第三者素材の添付なし | 2026-07-11（リポジトリ初回取込日） | `scripts/build-hero-images.mjs`で`public/characters/ssr/minato-w512.webp`と`minato-w896.webp`へリサイズ・WebP変換 |
| `assets/characters/ssr/shinjuku.png` | 5軸実数と共通デザインルールからAI生成 | `docs/submission/作品提出フォーム回答案.md:119` | ChatGPT（Business） | 3章冒頭のとおり出力の権利は契約組織に帰属。入力はテキストプロンプトのみで第三者素材の添付なし | 2026-07-11（リポジトリ初回取込日） | `scripts/build-hero-images.mjs`で`public/characters/ssr/shinjuku-w512.webp`と`shinjuku-w896.webp`へリサイズ・WebP変換 |
| `assets/characters/ssr/bunkyo.png` | 5軸実数と共通デザインルールからAI生成 | `docs/submission/作品提出フォーム回答案.md:119` | ChatGPT（Business） | 3章冒頭のとおり出力の権利は契約組織に帰属。入力はテキストプロンプトのみで第三者素材の添付なし | 2026-07-11（リポジトリ初回取込日） | `scripts/build-hero-images.mjs`で`public/characters/ssr/bunkyo-w512.webp`と`bunkyo-w896.webp`へリサイズ・WebP変換 |
| `assets/characters/ssr/taito.png` | 5軸実数と共通デザインルールからAI生成 | `docs/submission/作品提出フォーム回答案.md:119` | ChatGPT（Business） | 3章冒頭のとおり出力の権利は契約組織に帰属。入力はテキストプロンプトのみで第三者素材の添付なし | 2026-07-11（リポジトリ初回取込日） | `scripts/build-hero-images.mjs`で`public/characters/ssr/taito-w512.webp`と`taito-w896.webp`へリサイズ・WebP変換 |
| `assets/characters/ssr/sumida.png` | 5軸実数と共通デザインルールからAI生成 | `docs/submission/作品提出フォーム回答案.md:119` | ChatGPT（Business） | 3章冒頭のとおり出力の権利は契約組織に帰属。入力はテキストプロンプトのみで第三者素材の添付なし | 2026-07-11（リポジトリ初回取込日） | `scripts/build-hero-images.mjs`で`public/characters/ssr/sumida-w512.webp`と`sumida-w896.webp`へリサイズ・WebP変換 |
| `assets/characters/ssr/koto.png` | 5軸実数と共通デザインルールからAI生成 | `docs/submission/作品提出フォーム回答案.md:119` | ChatGPT（Business） | 3章冒頭のとおり出力の権利は契約組織に帰属。入力はテキストプロンプトのみで第三者素材の添付なし | 2026-07-11（リポジトリ初回取込日） | `scripts/build-hero-images.mjs`で`public/characters/ssr/koto-w512.webp`と`koto-w896.webp`へリサイズ・WebP変換 |
| `assets/characters/ssr/shinagawa.png` | 5軸実数と共通デザインルールからAI生成 | `docs/submission/作品提出フォーム回答案.md:119` | ChatGPT（Business） | 3章冒頭のとおり出力の権利は契約組織に帰属。入力はテキストプロンプトのみで第三者素材の添付なし | 2026-07-11（リポジトリ初回取込日） | `scripts/build-hero-images.mjs`で`public/characters/ssr/shinagawa-w512.webp`と`shinagawa-w896.webp`へリサイズ・WebP変換 |
| `assets/characters/ssr/meguro.png` | 5軸実数と共通デザインルールからAI生成 | `docs/submission/作品提出フォーム回答案.md:119` | ChatGPT（Business） | 3章冒頭のとおり出力の権利は契約組織に帰属。入力はテキストプロンプトのみで第三者素材の添付なし | 2026-07-11（リポジトリ初回取込日） | `scripts/build-hero-images.mjs`で`public/characters/ssr/meguro-w512.webp`と`meguro-w896.webp`へリサイズ・WebP変換 |
| `assets/characters/ssr/ota.png` | 5軸実数と共通デザインルールからAI生成 | `docs/submission/作品提出フォーム回答案.md:119` | ChatGPT（Business） | 3章冒頭のとおり出力の権利は契約組織に帰属。入力はテキストプロンプトのみで第三者素材の添付なし | 2026-07-11（リポジトリ初回取込日） | `scripts/build-hero-images.mjs`で`public/characters/ssr/ota-w512.webp`と`ota-w896.webp`へリサイズ・WebP変換 |
| `assets/characters/ssr/setagaya.png` | 5軸実数と共通デザインルールからAI生成 | `docs/submission/作品提出フォーム回答案.md:119` | ChatGPT（Business） | 3章冒頭のとおり出力の権利は契約組織に帰属。入力はテキストプロンプトのみで第三者素材の添付なし | 2026-07-11（リポジトリ初回取込日） | `scripts/build-hero-images.mjs`で`public/characters/ssr/setagaya-w512.webp`と`setagaya-w896.webp`へリサイズ・WebP変換 |
| `assets/characters/ssr/shibuya.png` | 5軸実数と共通デザインルールからAI生成 | `docs/submission/作品提出フォーム回答案.md:119` | ChatGPT（Business） | 3章冒頭のとおり出力の権利は契約組織に帰属。入力はテキストプロンプトのみで第三者素材の添付なし | 2026-07-11（リポジトリ初回取込日） | `scripts/build-hero-images.mjs`で`public/characters/ssr/shibuya-w512.webp`と`shibuya-w896.webp`へリサイズ・WebP変換 |
| `assets/characters/ssr/nakano.png` | 5軸実数と共通デザインルールからAI生成 | `docs/submission/作品提出フォーム回答案.md:119` | ChatGPT（Business） | 3章冒頭のとおり出力の権利は契約組織に帰属。入力はテキストプロンプトのみで第三者素材の添付なし | 2026-07-11（リポジトリ初回取込日） | `scripts/build-hero-images.mjs`で`public/characters/ssr/nakano-w512.webp`と`nakano-w896.webp`へリサイズ・WebP変換 |
| `assets/characters/ssr/suginami.png` | 5軸実数と共通デザインルールからAI生成 | `docs/submission/作品提出フォーム回答案.md:119` | ChatGPT（Business） | 3章冒頭のとおり出力の権利は契約組織に帰属。入力はテキストプロンプトのみで第三者素材の添付なし | 2026-07-11（リポジトリ初回取込日） | `scripts/build-hero-images.mjs`で`public/characters/ssr/suginami-w512.webp`と`suginami-w896.webp`へリサイズ・WebP変換 |
| `assets/characters/ssr/toshima.png` | 5軸実数と共通デザインルールからAI生成 | `docs/submission/作品提出フォーム回答案.md:119` | ChatGPT（Business） | 3章冒頭のとおり出力の権利は契約組織に帰属。入力はテキストプロンプトのみで第三者素材の添付なし | 2026-07-11（リポジトリ初回取込日） | `scripts/build-hero-images.mjs`で`public/characters/ssr/toshima-w512.webp`と`toshima-w896.webp`へリサイズ・WebP変換 |
| `assets/characters/ssr/kita.png` | 5軸実数と共通デザインルールからAI生成 | `docs/submission/作品提出フォーム回答案.md:119` | ChatGPT（Business） | 3章冒頭のとおり出力の権利は契約組織に帰属。入力はテキストプロンプトのみで第三者素材の添付なし | 2026-07-11（リポジトリ初回取込日） | `scripts/build-hero-images.mjs`で`public/characters/ssr/kita-w512.webp`と`kita-w896.webp`へリサイズ・WebP変換 |
| `assets/characters/ssr/arakawa.png` | 5軸実数と共通デザインルールからAI生成 | `docs/submission/作品提出フォーム回答案.md:119` | ChatGPT（Business） | 3章冒頭のとおり出力の権利は契約組織に帰属。入力はテキストプロンプトのみで第三者素材の添付なし | 2026-07-11（リポジトリ初回取込日） | `scripts/build-hero-images.mjs`で`public/characters/ssr/arakawa-w512.webp`と`arakawa-w896.webp`へリサイズ・WebP変換 |
| `assets/characters/ssr/itabashi.png` | 5軸実数と共通デザインルールからAI生成 | `docs/submission/作品提出フォーム回答案.md:119` | ChatGPT（Business） | 3章冒頭のとおり出力の権利は契約組織に帰属。入力はテキストプロンプトのみで第三者素材の添付なし | 2026-07-11（リポジトリ初回取込日） | `scripts/build-hero-images.mjs`で`public/characters/ssr/itabashi-w512.webp`と`itabashi-w896.webp`へリサイズ・WebP変換 |
| `assets/characters/ssr/nerima.png` | 5軸実数と共通デザインルールからAI生成 | `docs/submission/作品提出フォーム回答案.md:119` | ChatGPT（Business） | 3章冒頭のとおり出力の権利は契約組織に帰属。入力はテキストプロンプトのみで第三者素材の添付なし | 2026-07-11（リポジトリ初回取込日） | `scripts/build-hero-images.mjs`で`public/characters/ssr/nerima-w512.webp`と`nerima-w896.webp`へリサイズ・WebP変換 |
| `assets/characters/ssr/adachi.png` | 5軸実数と共通デザインルールからAI生成 | `docs/submission/作品提出フォーム回答案.md:119` | ChatGPT（Business） | 3章冒頭のとおり出力の権利は契約組織に帰属。入力はテキストプロンプトのみで第三者素材の添付なし | 2026-07-11（リポジトリ初回取込日） | `scripts/build-hero-images.mjs`で`public/characters/ssr/adachi-w512.webp`と`adachi-w896.webp`へリサイズ・WebP変換 |
| `assets/characters/ssr/katsushika.png` | 5軸実数と共通デザインルールからAI生成 | `docs/submission/作品提出フォーム回答案.md:119` | ChatGPT（Business） | 3章冒頭のとおり出力の権利は契約組織に帰属。入力はテキストプロンプトのみで第三者素材の添付なし | 2026-07-11（リポジトリ初回取込日） | `scripts/build-hero-images.mjs`で`public/characters/ssr/katsushika-w512.webp`と`katsushika-w896.webp`へリサイズ・WebP変換 |
| `assets/characters/ssr/edogawa.png` | 5軸実数と共通デザインルールからAI生成 | `docs/submission/作品提出フォーム回答案.md:119` | ChatGPT（Business） | 3章冒頭のとおり出力の権利は契約組織に帰属。入力はテキストプロンプトのみで第三者素材の添付なし | 2026-07-11（リポジトリ初回取込日） | `scripts/build-hero-images.mjs`で`public/characters/ssr/edogawa-w512.webp`と`edogawa-w896.webp`へリサイズ・WebP変換 |

### 3.2 OGP原本

| ファイルパス | 出典/生成手段 | 出典URLまたはプロンプト参照 | 作者/ツール | ライセンス・利用条件 | 取得日/生成日 | 加工内容 |
|---|---|---|---|---|---|---|
| `assets/og/chiyoda.png` | 対応するキャラクター原本を参照画像として生成AIで作成 | `docs/strategy/og-image-prompts.md:21` | ChatGPT（Business） | 3章冒頭のとおり出力の権利は契約組織に帰属。入力に添付した参照画像は3.1の自作生成物であり、第三者素材の添付なし | 2026-07-13（リポジトリ初回取込日） | `scripts/build-og-images.mjs`で1200×630、JPEG品質85の`public/og/chiyoda.jpg`へ変換 |
| `assets/og/chuo.png` | 対応するキャラクター原本を参照画像として生成AIで作成 | `docs/strategy/og-image-prompts.md:41` | ChatGPT（Business） | 3章冒頭のとおり出力の権利は契約組織に帰属。入力に添付した参照画像は3.1の自作生成物であり、第三者素材の添付なし | 2026-07-13（リポジトリ初回取込日） | `scripts/build-og-images.mjs`で1200×630、JPEG品質85の`public/og/chuo.jpg`へ変換 |
| `assets/og/minato.png` | 対応するキャラクター原本を参照画像として生成AIで作成 | `docs/strategy/og-image-prompts.md:61` | ChatGPT（Business） | 3章冒頭のとおり出力の権利は契約組織に帰属。入力に添付した参照画像は3.1の自作生成物であり、第三者素材の添付なし | 2026-07-13（リポジトリ初回取込日） | `scripts/build-og-images.mjs`で1200×630、JPEG品質85の`public/og/minato.jpg`へ変換 |
| `assets/og/shinjuku.png` | 対応するキャラクター原本を参照画像として生成AIで作成 | `docs/strategy/og-image-prompts.md:81` | ChatGPT（Business） | 3章冒頭のとおり出力の権利は契約組織に帰属。入力に添付した参照画像は3.1の自作生成物であり、第三者素材の添付なし | 2026-07-14（リポジトリ初回取込日） | `scripts/build-og-images.mjs`で1200×630、JPEG品質85の`public/og/shinjuku.jpg`へ変換 |
| `assets/og/bunkyo.png` | 対応するキャラクター原本を参照画像として生成AIで作成 | `docs/strategy/og-image-prompts.md:101` | ChatGPT（Business） | 3章冒頭のとおり出力の権利は契約組織に帰属。入力に添付した参照画像は3.1の自作生成物であり、第三者素材の添付なし | 2026-07-14（リポジトリ初回取込日） | `scripts/build-og-images.mjs`で1200×630、JPEG品質85の`public/og/bunkyo.jpg`へ変換 |
| `assets/og/taito.png` | 対応するキャラクター原本を参照画像として生成AIで作成 | `docs/strategy/og-image-prompts.md:121` | ChatGPT（Business） | 3章冒頭のとおり出力の権利は契約組織に帰属。入力に添付した参照画像は3.1の自作生成物であり、第三者素材の添付なし | 2026-07-14（リポジトリ初回取込日） | `scripts/build-og-images.mjs`で1200×630、JPEG品質85の`public/og/taito.jpg`へ変換 |
| `assets/og/sumida.png` | 対応するキャラクター原本を参照画像として生成AIで作成 | `docs/strategy/og-image-prompts.md:141` | ChatGPT（Business） | 3章冒頭のとおり出力の権利は契約組織に帰属。入力に添付した参照画像は3.1の自作生成物であり、第三者素材の添付なし | 2026-07-14（リポジトリ初回取込日） | `scripts/build-og-images.mjs`で1200×630、JPEG品質85の`public/og/sumida.jpg`へ変換 |
| `assets/og/koto.png` | 対応するキャラクター原本を参照画像として生成AIで作成 | `docs/strategy/og-image-prompts.md:161` | ChatGPT（Business） | 3章冒頭のとおり出力の権利は契約組織に帰属。入力に添付した参照画像は3.1の自作生成物であり、第三者素材の添付なし | 2026-07-14（リポジトリ初回取込日） | `scripts/build-og-images.mjs`で1200×630、JPEG品質85の`public/og/koto.jpg`へ変換 |
| `assets/og/shinagawa.png` | 対応するキャラクター原本を参照画像として生成AIで作成 | `docs/strategy/og-image-prompts.md:181` | ChatGPT（Business） | 3章冒頭のとおり出力の権利は契約組織に帰属。入力に添付した参照画像は3.1の自作生成物であり、第三者素材の添付なし | 2026-07-14（リポジトリ初回取込日） | `scripts/build-og-images.mjs`で1200×630、JPEG品質85の`public/og/shinagawa.jpg`へ変換 |
| `assets/og/meguro.png` | 対応するキャラクター原本を参照画像として生成AIで作成 | `docs/strategy/og-image-prompts.md:201` | ChatGPT（Business） | 3章冒頭のとおり出力の権利は契約組織に帰属。入力に添付した参照画像は3.1の自作生成物であり、第三者素材の添付なし | 2026-07-14（リポジトリ初回取込日） | `scripts/build-og-images.mjs`で1200×630、JPEG品質85の`public/og/meguro.jpg`へ変換 |
| `assets/og/ota.png` | 対応するキャラクター原本を参照画像として生成AIで作成 | `docs/strategy/og-image-prompts.md:221` | ChatGPT（Business） | 3章冒頭のとおり出力の権利は契約組織に帰属。入力に添付した参照画像は3.1の自作生成物であり、第三者素材の添付なし | 2026-07-14（リポジトリ初回取込日） | `scripts/build-og-images.mjs`で1200×630、JPEG品質85の`public/og/ota.jpg`へ変換 |
| `assets/og/setagaya.png` | 対応するキャラクター原本を参照画像として生成AIで作成 | `docs/strategy/og-image-prompts.md:241` | ChatGPT（Business） | 3章冒頭のとおり出力の権利は契約組織に帰属。入力に添付した参照画像は3.1の自作生成物であり、第三者素材の添付なし | 2026-07-14（リポジトリ初回取込日） | `scripts/build-og-images.mjs`で1200×630、JPEG品質85の`public/og/setagaya.jpg`へ変換 |
| `assets/og/shibuya.png` | 対応するキャラクター原本を参照画像として生成AIで作成 | `docs/strategy/og-image-prompts.md:261` | ChatGPT（Business） | 3章冒頭のとおり出力の権利は契約組織に帰属。入力に添付した参照画像は3.1の自作生成物であり、第三者素材の添付なし | 2026-07-14（リポジトリ初回取込日） | `scripts/build-og-images.mjs`で1200×630、JPEG品質85の`public/og/shibuya.jpg`へ変換 |
| `assets/og/nakano.png` | 対応するキャラクター原本を参照画像として生成AIで作成 | `docs/strategy/og-image-prompts.md:281` | ChatGPT（Business） | 3章冒頭のとおり出力の権利は契約組織に帰属。入力に添付した参照画像は3.1の自作生成物であり、第三者素材の添付なし | 2026-07-14（リポジトリ初回取込日） | `scripts/build-og-images.mjs`で1200×630、JPEG品質85の`public/og/nakano.jpg`へ変換 |
| `assets/og/suginami.png` | 対応するキャラクター原本を参照画像として生成AIで作成 | `docs/strategy/og-image-prompts.md:301` | ChatGPT（Business） | 3章冒頭のとおり出力の権利は契約組織に帰属。入力に添付した参照画像は3.1の自作生成物であり、第三者素材の添付なし | 2026-07-14（リポジトリ初回取込日） | `scripts/build-og-images.mjs`で1200×630、JPEG品質85の`public/og/suginami.jpg`へ変換 |
| `assets/og/toshima.png` | 対応するキャラクター原本を参照画像として生成AIで作成 | `docs/strategy/og-image-prompts.md:321` | ChatGPT（Business） | 3章冒頭のとおり出力の権利は契約組織に帰属。入力に添付した参照画像は3.1の自作生成物であり、第三者素材の添付なし | 2026-07-14（リポジトリ初回取込日） | `scripts/build-og-images.mjs`で1200×630、JPEG品質85の`public/og/toshima.jpg`へ変換 |
| `assets/og/kita.png` | 対応するキャラクター原本を参照画像として生成AIで作成 | `docs/strategy/og-image-prompts.md:341` | ChatGPT（Business） | 3章冒頭のとおり出力の権利は契約組織に帰属。入力に添付した参照画像は3.1の自作生成物であり、第三者素材の添付なし | 2026-07-14（リポジトリ初回取込日） | `scripts/build-og-images.mjs`で1200×630、JPEG品質85の`public/og/kita.jpg`へ変換 |
| `assets/og/arakawa.png` | 対応するキャラクター原本を参照画像として生成AIで作成 | `docs/strategy/og-image-prompts.md:361` | ChatGPT（Business） | 3章冒頭のとおり出力の権利は契約組織に帰属。入力に添付した参照画像は3.1の自作生成物であり、第三者素材の添付なし | 2026-07-14（リポジトリ初回取込日） | `scripts/build-og-images.mjs`で1200×630、JPEG品質85の`public/og/arakawa.jpg`へ変換 |
| `assets/og/itabashi.png` | 対応するキャラクター原本を参照画像として生成AIで作成 | `docs/strategy/og-image-prompts.md:381` | ChatGPT（Business） | 3章冒頭のとおり出力の権利は契約組織に帰属。入力に添付した参照画像は3.1の自作生成物であり、第三者素材の添付なし | 2026-07-14（リポジトリ初回取込日） | `scripts/build-og-images.mjs`で1200×630、JPEG品質85の`public/og/itabashi.jpg`へ変換 |
| `assets/og/nerima.png` | 対応するキャラクター原本を参照画像として生成AIで作成 | `docs/strategy/og-image-prompts.md:401` | ChatGPT（Business） | 3章冒頭のとおり出力の権利は契約組織に帰属。入力に添付した参照画像は3.1の自作生成物であり、第三者素材の添付なし | 2026-07-14（リポジトリ初回取込日） | `scripts/build-og-images.mjs`で1200×630、JPEG品質85の`public/og/nerima.jpg`へ変換 |
| `assets/og/adachi.png` | 対応するキャラクター原本を参照画像として生成AIで作成 | `docs/strategy/og-image-prompts.md:421` | ChatGPT（Business） | 3章冒頭のとおり出力の権利は契約組織に帰属。入力に添付した参照画像は3.1の自作生成物であり、第三者素材の添付なし | 2026-07-14（リポジトリ初回取込日） | `scripts/build-og-images.mjs`で1200×630、JPEG品質85の`public/og/adachi.jpg`へ変換 |
| `assets/og/katsushika.png` | 対応するキャラクター原本を参照画像として生成AIで作成 | `docs/strategy/og-image-prompts.md:441` | ChatGPT（Business） | 3章冒頭のとおり出力の権利は契約組織に帰属。入力に添付した参照画像は3.1の自作生成物であり、第三者素材の添付なし | 2026-07-14（リポジトリ初回取込日） | `scripts/build-og-images.mjs`で1200×630、JPEG品質85の`public/og/katsushika.jpg`へ変換 |
| `assets/og/edogawa.png` | 対応するキャラクター原本を参照画像として生成AIで作成 | `docs/strategy/og-image-prompts.md:461` | ChatGPT（Business） | 3章冒頭のとおり出力の権利は契約組織に帰属。入力に添付した参照画像は3.1の自作生成物であり、第三者素材の添付なし | 2026-07-14（リポジトリ初回取込日） | `scripts/build-og-images.mjs`で1200×630、JPEG品質85の`public/og/edogawa.jpg`へ変換 |
| `assets/og/home.png` | 23区キャラクター原本を参照画像として生成AIで作成 | `docs/strategy/og-image-prompts.md:483` | ChatGPT（Business） | 3章冒頭のとおり出力の権利は契約組織に帰属。入力に添付した参照画像は3.1の自作生成物であり、第三者素材の添付なし | 2026-07-14（リポジトリ初回取込日） | `scripts/build-og-images.mjs`で1200×630、JPEG品質85の`public/og/home.jpg`へ変換 |

### 3.3 区アイコン原本

区章の代替として区詳細ページ「区のプロフィール」に表示する円形アイコン。23区分を `assets/icons/{slug}.png` に置き、`npm run build:icons` で `public/icons/{slug}.webp`（256×256、WebP品質88）へ変換する。丸抜きはCSSの `border-radius` で行うため、原本・出力とも正方形である。

生成は各区のキャラクター原本（3.1）を参照画像として添付し、[docs/strategy/ward-icon-prompts.md](../strategy/ward-icon-prompts.md) のプロンプトで行う。生成後は同ファイル末尾のチェックリストで確認する。

| ファイルパス | 出典/生成手段 | 出典URLまたはプロンプト参照 | 作者/ツール | ライセンス・利用条件 | 取得日/生成日 | 加工内容 |
|---|---|---|---|---|---|---|
| `assets/icons/{slug}.png`（23区分） | 対応するキャラクター原本を参照画像としてAI生成 | `docs/strategy/ward-icon-prompts.md` | ChatGPT（Business） | 3章冒頭のとおり出力の権利は契約組織に帰属。入力に添付した参照画像は3.1の自作生成物であり、第三者素材の添付なし | 2026-07-31（リポジトリ初回取込日） | `scripts/build-icons.mjs`で256×256、WebP品質88の`public/icons/{slug}.webp`へ変換 |

### 3.4 その他の生成画像原本

3.1〜3.3と異なりプロンプトを記録していないため再現はできないが、生成手段の確認は取れている。いずれも画像を添付しないテキストプロンプトのみで生成した。

| ファイルパス | 出典/生成手段 | 出典URLまたはプロンプト参照 | 作者/ツール | ライセンス・利用条件 | 取得日/生成日 | 加工内容 |
|---|---|---|---|---|---|---|
| `assets/title.png` | テキストプロンプトからAI生成 | プロンプト未記録（再現不可） | ChatGPT（Business） | 3章冒頭のとおり出力の権利は契約組織に帰属。入力はテキストプロンプトのみで第三者素材の添付なし | 2026-07-11（リポジトリ初回取込日） | `scripts/build-title.mjs`で余白をトリミングし、`public/title-w720.webp`と`public/title-w1440.webp`へリサイズ・WebP変換 |
| `assets/book-cover.png` | テキストプロンプトからAI生成 | プロンプト未記録（再現不可） | ChatGPT（Business） | 3章冒頭のとおり出力の権利は契約組織に帰属。入力はテキストプロンプトのみで第三者素材の添付なし | 2026-07-12（リポジトリ初回取込日） | `scripts/build-modal-images.mjs`で幅1600px、WebP品質82の`public/book-cover.webp`へ変換 |

## 4. rawデータ

東京都オープンデータカタログ由来のデータは、同カタログの原則に従いCC BY 4.0として記録する。国のデータは、各提供サイトの利用規約・利用約款に従う。

| ファイルパス | 出典/生成手段 | 出典URLまたはプロンプト参照 | 作者/ツール | ライセンス・利用条件 | 取得日/生成日 | 加工内容 |
|---|---|---|---|---|---|---|
| `data/raw/N03-21_13_city.topojson` | 国土交通省「国土数値情報（行政区域データ）」をsmartnews-smriが簡略化した東京都TopoJSON。対象: 市区町村境界。利用プロパティ: `N03_007`、`N03_004`、境界arc | https://github.com/smartnews-smri/japan-topography | 国土交通省 / smartnews-smri | 国土数値情報ダウンロードサイト利用約款に従う。再配布元は、加工者としてスマートニュースおよびスマートニュース メディア研究所をクレジットする必要はないが、市区町村データには国土交通省の指示するクレジット記載が必要とREADMEで定めている。`src/data/ward-geo.json` の `source` で国土交通省を明示済み | 2026-07-12（リポジトリ初回取込日） | 元ファイル`N03-21_13_210101.json`のs0010簡略版。`build_geo.py`でarcを復号し、局所平面km座標、重心、面積へ変換。0.02km²未満のリングと内穴を除外 |
| `data/raw/chika_r7_chiten.csv` | 国土交通省「令和7年地価公示」地点別データ。対象: 住宅地（用途0）。利用列: `都道府県市区町村コード`、`標準地番号（用途）`、`当年価格（円）` | https://www.mlit.go.jp/totikensangyo/totikensangyo_fr4_000444.html | 国土交通省 | 国土交通省ウェブサイト利用規約に従う | 2026-07-11（リポジトリ初回取込日） | `build_details.py`で23区ごとに住宅地価格の単純平均と地点数を算出 |
| `data/raw/estat_table10_kazokutypes.xlsx` | 総務省統計局「令和2年国勢調査 人口等基本集計」第10表「世帯の家族類型、世帯人員の人数別一般世帯数」。対象シート: `b10`。利用列: 地域、世帯人員区分、一般世帯総数、子どもを含む3区分 | https://www.e-stat.go.jp/stat-search/database?statdisp_id=0003445080 | 総務省統計局 / e-Stat | 政府統計の総合窓口の利用規約に従う | 2026-07-11（リポジトリ初回取込日） | `build_wards.py`で単身世帯率と子育て世帯率を算出 |
| `data/raw/ga26ev0100.csv` | 東京都の統計「国籍・地域別 外国人人口」（令和8年1月1日現在）。対象: 区市町村別・国籍別外国人人口。利用列: `地域コード`、`総数` | https://www.toukei.metro.tokyo.lg.jp/gaikoku/2026/ga26ev0100.csv | 東京都総務局統計部 | CC BY 4.0（東京都オープンデータカタログ原則） | 2026-07-11（リポジトリ初回取込日） | `build_details.py`で住民基本台帳総人口を分母に外国人人口比率を算出 |
| `data/raw/jy26qv0301.csv` | 東京都の統計「住民基本台帳による東京都の世帯と人口 年齢別人口」（令和8年1月1日現在）。利用列: `地域コード`、地域名、年少・生産年齢・老年人口の各総数 | https://www.toukei.metro.tokyo.lg.jp/juukiy/2026/jy26qv0301.csv | 東京都総務局統計部 | CC BY 4.0（東京都オープンデータカタログ原則） | 2026-07-11（リポジトリ初回取込日） | `build_wards.py`で高齢化率・年少人口率を、`build_details.py`で総人口と外国人人口比率の分母を算出 |
| `data/raw/keishicho_R6_ninchikensu.csv` | 警視庁「区市町村の町丁別、罪種別及び手口別認知件数（年累計）」令和6年分。利用列: `市区町丁`、`総合計`。区名と完全一致する公式合計行を採用 | https://www.keishicho.metro.tokyo.lg.jp/about_mpd/jokyo_tokei/jokyo/ninchikensu.html | 警視庁 | CC BY 4.0 | 2026-07-12（リポジトリ初回取込日） | `build_details.py`で住民基本台帳総人口を分母に人口千人当たり刑法犯認知件数を算出。Shift_JISをデコード |
| `data/raw/kouen_r7_kushichoson.csv` | 東京都建設局「東京都都市公園等区市町村別面積・人口割比率表」（令和7年4月1日現在）。利用列: 行政区分、公立公園合計の一人当たり面積`ハ/Ｂ` | https://www.kensetsu.metro.tokyo.lg.jp/park/kouenannai/kouen_menseki | 東京都建設局 | CC BY 4.0（東京都オープンデータカタログ原則） | 2026-07-11（リポジトリ初回取込日） | `build_wards.py`で国民公園・公団を除く一人当たり公立公園面積を抽出。CP932をデコード |
| `data/raw/soumu_000983094.xlsx` | 総務省「全市町村の主要財政指標」（令和5年度）。対象シート: `全市町村の主要財政指標`。利用列: 都道府県名、団体名、財政力指数 | https://www.soumu.go.jp/main_content/000983094.xlsx | 総務省 | 総務省ウェブサイト利用規約に従う | 2026-07-11（リポジトリ初回取込日） | `build_wards.py`で東京都23区の財政力指数を抽出 |
| `data/raw/soumu_J51-24-b.xlsx` | 総務省「市町村税課税状況等の調」（令和6年度）第11表市町村別内訳。対象シート: `令和6年度_第11表市町村別データ`。利用列: 団体コード、表側、所得割納税義務者数、課税対象所得 | https://www.soumu.go.jp/main_sosiki/jichi_zeisei/czaisei/czaisei_seido/xls/J51-24-b.xlsx | 総務省 | 総務省ウェブサイト利用規約に従う | 2026-07-12（リポジトリ初回取込日） | `build_details.py`で市町村民税の課税対象所得を所得割納税義務者数で割り、1人当たり課税対象所得を算出 |
| `data/raw/cfa_hoiku_r7_shiryo.xlsx` | こども家庭庁「保育所等関連状況取りまとめ（令和7年4月1日）」の（参考）資料1～6。対象シート: `資料６－１`、`資料６－２`（東京都行の「R7.4」列）と、検証用に `資料4`（東京都計） | https://www.cfa.go.jp/policies/hoiku/torimatome/r7 | こども家庭庁 | 公共データ利用規約（PDL1.0）。出典明記と、編集・加工した場合はその旨の記載を条件に、商用・非商用を問わず二次利用可（[コピーライトポリシー](https://www.cfa.go.jp/copyright-policy)） | 2026-08-12（リポジトリ初回取込日） | `build_details.py`で23区の待機児童数を抽出。資料6は令和6年・令和7年ともにゼロの市区町村を掲載しないため未掲載の区はゼロとして扱い、東京都全市区町村の合計が資料4の東京都計と一致することをassertで検証する |
| `data/raw/tokyo_daytime_population_2020_tj20zv0100.csv` | 東京都の統計「令和2年国勢調査 従業地・通学地による人口・就業状態等集計」。利用列: 地域名、`昼夜間人口比率／総数（％）` | https://www.toukei.metro.tokyo.lg.jp/tyukanj/2020/tj20zv0100.csv | 東京都総務局統計部 / 総務省統計局 | CC BY 4.0（東京都オープンデータカタログ原則） | 2026-07-11（リポジトリ初回取込日） | `build_wards.py`で23区の昼夜間人口比率を抽出。UTF-8 BOMを除去して読み込み |

## 5. 区データ（`src/data/ward-policies.json`）

区詳細ページの「区のプロフィール」（区の花・木・鳥）と「◯◯のこころざし」（政策）に使う手動キュレーションのデータである。Pythonジェネレーターを持たないため `data/processed/` に対応ファイルはなく、`src/data/ward-policies.json` が唯一の正本である。

### 5.1 各区サイトの二次利用可否（2026-08-13 調査）

出典はすべて各区の公式サイトであり、東京都オープンデータカタログサイトには収録されていない（同カタログを `"区の鳥"` で検索して0件、`"基本構想"` で検索しても都水道局・福祉局・町田市のみで23区の基本構想は0件）。したがって東京都のデータではなく、区市町村のデータとして各区の利用規約に従う。23区すべてのサイトポリシーを確認した結果は次のとおり。

| 区 | 二次利用 | 内容 |
|---|---|---|
| 千代田区 | 可 | サイト全体をCC BY（表示2.1日本）で提供。出典記載が条件。写真・動画・イラストと区が指定するコンテンツは対象外 |
| 港区・目黒区・世田谷区・台東区・足立区 | 原則不可 | 私的使用・引用を除き禁止。区がオープンデータとして指定したものだけ例外 |
| 中央・新宿・文京・墨田・江東・品川・大田・渋谷・中野・杉並・豊島・北・荒川・板橋・練馬・葛飾・江戸川の各区 | 不可 | 私的使用・引用を除き無断転載・二次利用を禁止。新宿区は二次利用を名指しで禁止し事前の書面許諾を要求、品川区と荒川区は無断引用も禁止と明記 |

### 5.2 逐語見出しを使わない判断

当初は各区の基本構想・基本計画の政策見出しを逐語で `title` に収録していたが、2026-08-13に全98件を当方で書いた政策分野ラベル（「地域ぐるみの子育て・教育」「海抜ゼロメートル地帯の防災」など）へ置き換えた。ラベルの語は同じ政策の `summary` から取っており、98件はすべて相異なる。上表のとおり22区が二次利用を禁じており、23区×3〜5件を系統的に抜き出してアプリの中核コンテンツとする使い方は著作権法32条の引用の要件（主従関係）を満たさないためである。都知事杯事務局も、データをアプリの中核コンテンツとしてそのまま使う場合は引用と認められないと案内している。

`summary` は当初から当方が書いた要約文であり、逐語転載ではない。`source` と `url` は原典への参照として残す。編集主体は区詳細ページ・診断結果ページのバッジ「各区の基本構想をもとに編集」で明示する。

### 5.3 区の花・木・鳥

保持しているのは名称のみ（例: さくら／まつ／はくちょう）で、区が制定したという事実にあたる。名称という単語自体は著作権法2条1項1号の創作的表現に当たらず、多くの区が条例・告示で制定しているため著作権法13条により権利の目的ともならない。したがって各区サイトの無断転載禁止の記載は及ばないと判断している。

この判断は都知事杯事務局へ照会し、2026-08-13に問題ない旨の回答を得た。事務局からは、名称は各区の公式サイトに限らずWikipediaや観光協会サイト等の複数の独立した情報源から確認できる公知の事実情報であり、名称そのものは著作物として保護される創作的表現ではなく、区サイトの文章表現やコンテンツを転載しているわけでもないため、名称のみを表示する形での利用であれば問題ないとの見解が示された。ただし同回答は一般的な考え方に基づく見解であり、個別の法的判断を確約するものではないと付記されている。

以上より、名称のみを人口・面積と並べて表示する現行の形を維持する。区サイトの解説文・画像は使用しない。
