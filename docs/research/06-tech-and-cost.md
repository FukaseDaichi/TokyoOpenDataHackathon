# ⑥無料で完成させる技術スタック＆コスト　【高】

> 目的: 「30〜60h・ソロ・無料」で完成できる構成を確定する
> 埋める空欄: 実現可能性・制約

- 調査日: 2026-06-24
- 出典:
  - [都知事杯オープンデータ・ハッカソン 2026 トップページ](https://odhackathon.metro.tokyo.lg.jp/)
  - [都知事杯オープンデータ・ハッカソン 2026 募集要項（recruitment）](https://odhackathon.metro.tokyo.lg.jp/recruitment/)
  - [Vercel Hobby Plan（公式 docs）](https://vercel.com/docs/plans/hobby)
  - [Cloudflare Workers / Pages Pricing（公式 docs）](https://developers.cloudflare.com/workers/platform/pricing/)
  - [Cloudflare Pages Functions Pricing（公式 docs）](https://developers.cloudflare.com/pages/functions/pricing/)
  - [Netlify Pricing and Plans（公式）](https://www.netlify.com/pricing/)
  - [GitHub Pages limits（公式 docs）](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)
  - [Supabase Pricing & Fees（公式）](https://supabase.com/pricing)
  - [Firebase pricing plans（公式 docs）](https://firebase.google.com/docs/projects/billing/firebase-pricing-plans)
  - [Render: Platforms with a real free tier for developers in 2026（公式ブログ）](https://render.com/articles/platforms-with-a-real-free-tier-for-developers-in-2026)
  - [Gemini API Rate limits（公式 docs）](https://ai.google.dev/gemini-api/docs/rate-limits)
  - [Groq API Rate Limits（公式 docs）](https://console.groq.com/docs/rate-limits)
  - [OpenCode 公式（The open source AI coding agent）](https://opencode.ai/) / [Models](https://opencode.ai/docs/models/)
  - [国土地理院コンテンツ利用規約](https://www.gsi.go.jp/kikakuchousei/kikakuchousei40182.html) / [地理院タイル一覧](https://maps.gsi.go.jp/development/ichiran.html)
  - [OpenStreetMap 著作権・ライセンス（ODbL）](https://www.openstreetmap.org/copyright)
  - [MapLibre GL JS 公式](https://maplibre.org/)
  - [OpenFreeMap（商用可・無料ベクタタイル）解説（データのじかん）](https://data.wingarc.com/openfreemap-76889)

## 調べること（チェックリスト）
- [x] 無料ホスティング（Vercel / Netlify / Cloudflare Pages・Workers / GitHub Pages / Firebase / Supabase / Render）
- [x] 無料/低コスト LLM・AI API 枠（無料クレジット・ローカルLLM含む）
- [x] 無料の地図・可視化（MapLibre / Leaflet+OSM / deck.gl / Mapbox無料枠）
- [x] 費用が発生しがちな箇所と回避策（独自ドメイン・DB・ストレージ等）
- [x] 30〜60h でソロが完成できる構成（手に馴染んだ＋速く作れる）

## ★最重要: 主催が無料提供する開発リソース（これが本質）
公式トップ／募集要項で、参加申込後に「申請」すると **9月末まで** 以下が**無料提供**される（出典: [公式トップ](https://odhackathon.metro.tokyo.lg.jp/)、[募集要項](https://odhackathon.metro.tokyo.lg.jp/recruitment/)）。2025年も同様の提供実績あり。

| 提供物 | 内容（公式記載ベース） | 本企画での意味 |
|--------|----------------------|----------------|
| サービス公開環境 | **Cloudflare Paidプラン相当**（申請制・9月末まで） | ホスティング/エッジ/DB(D1・KV・R2想定)の上位枠が実質タダ。自前の無料枠探しより強い |
| 生成AI開発ツール | **OpenCode（LLMセット付き）** 申請制・9月末まで | AIコーディング支援＋LLM API が手元の無料枠を消費せず使える可能性 |
| 受賞特典 | オープンバッジ、東京ポイント500pt（Final Stage進出チーム） | コストではなくインセンティブ |

> 注意（要確認）: 「Cloudflare Paidプラン相当」の**具体的な数値枠（D1/R2/Workers の上限）**、OpenCodeに付く**LLMの種類・トークン上限**、9月末以降（Final Stage=2026/10/17, Demo Day=**2027**/3/27）の扱いは公式トップ/募集要項に数値記載が無い（提供は「利用申請後、順次付与」とのみ記載。出典: [募集要項](https://odhackathon.metro.tokyo.lg.jp/recruitment/)）。詳細は事務局（`9_opendata-hackathon.tokyo@mizuho-rt.co.jp`）かキックオフ（2026/8/6）で要確認。
> 主要日程（出典: [公式トップ](https://odhackathon.metro.tokyo.lg.jp/)）: エントリー受付 6/12〜**7/27締切**、作品提出 7/10〜**8/23**、キックオフ **8/6**、ハッカソン本体 **8/22〜23**、First Stage収録 8/26〜30、Final Stage **10/17**、Demo Day **2027/3/27**。※「9月末まで提供」のリソースは、提出締切(8/23)・Final Stage(10/17)を考えると開発の主戦場(夏)はカバーするが、Final Stage直前の改修やDemo Day(翌年3月)は提供外の可能性 → 要確認。
> OpenCode自体はOSSのAIコーディングエージェント（ターミナル/IDE、75+のLLMプロバイダ対応、ローカルモデルやOAuth接続も可）。出典: [OpenCode公式](https://opencode.ai/docs/models/)。

## 候補スタック
※「主催提供のCloudflare相当環境」を本命に置き、提供前の開発期間や、提供に頼らない保険として一般無料枠も併記。**数値は2026年6月時点**。

| 用途 | サービス/技術 | 無料枠 | 制限・注意 |
|------|--------------|--------|-----------|
| ホスティング（本命） | **Cloudflare Pages + Workers**（主催のPaid相当を申請） | 一般無料枠でも Workers/Pages Functions 計 **10万リクエスト/日**、静的アセット配信は無制限。Paid相当なら更に緩和 | Worker無料はCPU 10ms/req。商用制約なし。SSR/エッジ関数を置きやすい |
| ホスティング（静的・最速） | **Vercel Hobby** | 関数呼び出し **100万/月**、Active CPU 4 CPU時/月、Fluid Memory 360GB時/月、Edgeリクエスト最大100万、ビルドは4vCPU/8GB・デプロイ100回/日。関数の最大実行時間は **300秒(5分)** | **規約上「非商用・個人利用」限定**（[fair-use guidelines](https://vercel.com/docs/limits/fair-use-guidelines#commercial-usage)）。超過は課金でなく機能停止（多くは30日後まで復帰不可）。※2025年に従来の「帯域100GB/月」表記からCPU/メモリ従量ベースの枠表記に変更。出典: [Vercel Hobby Plan docs](https://vercel.com/docs/plans/hobby) |
| ホスティング（代替） | Netlify Free | **2025/9/4以降の新規は300クレジット/月制**（デプロイ15cr/回等。帯域は約10〜20cr/GBで**要確認**＝実効十数GB級）。**9/4以前の旧アカウントは100GB帯域+300ビルド分**を維持可 | 新クレジット制は枠が小さめ。2026/4にも料金改定あり（要確認）。枠超過でプロジェクト一時停止。出典: [Netlify 料金](https://www.netlify.com/pricing/) |
| ホスティング（純静的） | GitHub Pages | 帯域 **100GB/月（ソフト）**、公開サイト1GB、ビルド10回/時 | **サーバサイド/DB不可（完全静的のみ）**。SPA+外部APIなら可 |
| DB/ストレージ | **Supabase Free**（Postgres+Auth+Storage） | DB **500MB**、ファイル1GB、egress 5GB/月、MAU 5万、無料は**2プロジェクトまで** | **7日間DB無アクティビティで一時停止**（復帰に約30秒）。デモ直前にウォームアップ要。バックアップ無 |
| DB/ストレージ（Cloudflare内） | Cloudflare D1 / KV / R2 | 主催Paid相当に内包される想定（要確認）。R2は**下り(egress)無料**が強み | D1はSQLite互換でWorkersと相性良。R2は画像/PDF等の静的配信向き |
| DB/ストレージ（代替） | Firebase Spark（無料） | Hosting 1GB保存+10GB/月DL、Firestore等に無料枠 | 月内に無料枠超過でその機能が翌月まで停止。Blazeは従量課金=請求リスク |
| バックエンド常駐（任意） | Render Free（Webサービス） | 750インスタンス時/月 | **15分無アクセスでスリープ→次アクセスで約1分かけ起動**。デモで初回もたつき注意 |
| AI/LLM（無料・本命） | **OpenCode付属LLM**（主催提供） | 申請制・9月末まで（モデル/上限は要確認） | 手元のAPI無料枠を温存できる。提供条件は事務局確認 |
| AI/LLM（無料・自前） | **Google Gemini API 無料枠** | 2026年時点: 2.5 Flash **10RPM/250RPD**、2.5 Flash-Lite **15RPM/1,000RPD**、2.5 Proは**約5RPM/100RPD**に縮小。**Gemini 3系のProは無料枠から除外（有料のみ、2026/4〜）** | 無料枠は実質Flash/Flash-Lite中心。RPM・RPD上限に当たりやすく本番常用は不可。PT(米)0時リセット。出典: [Gemini API Rate limits](https://ai.google.dev/gemini-api/docs/rate-limits)（正確な枠はAI Studioのrate-limit表で要確認） |
| AI/LLM（無料・自前） | **Groq 無料枠**（Llama 3.3 70B等） | 組織単位 30 RPM・モデル別RPD（例: llama-3.3-70bは1K RPD/12K TPM） | 高速推論。クレカ不要。本番常用というよりデモ/プロトタイプ向き |
| AI/LLM（完全無料・ローカル） | **Ollama**（Llama/gpt-oss等をローカル実行） | API費0・レート無制限・データ外部送信なし | 自PCのGPU/RAM依存。**公開デモには別途推論ホストが必要**＝デプロイ環境では使いにくい |
| 地図/可視化（本命） | **MapLibre GL JS + 地理院タイル** | ライブラリOSS無料。**地理院タイルは出典明示のみで申請不要・無料**でWeb地図に読込可 | 出典「国土地理院」表記＋一覧ページへのリンク必須。東京都の地理データと相性◎ |
| 地図/可視化（代替タイル） | OpenStreetMap + Leaflet | Leafletは軽量OSS。OSMデータは **ODbL**（帰属表示＋継承義務） | OSM公式タイルは本番大量配信NG。OpenFreeMap/MapTiler/Protomos等の無料/低コストタイル併用が安全 |
| 地図/可視化（大量点群） | deck.gl（+MapLibre） | OSS無料。数万〜の点/ヒートマップ/3Dを高速描画 | WebGL前提。表現力で差別化したい時に有効 |
| 地図/可視化（注意枠） | Mapbox 無料枠 | 月5万ロード等の無料枠あり（要確認） | 規約・課金体系がやや複雑。MapLibre+無料タイルで代替可なら回避が無難 |

## 30〜60hでソロが完成できる「型」（推奨2案）
- **A. 静的フロント＋外部API型（最速・最安・落ちにくい）**
  - Next.js or Vite/React → **Cloudflare Pages**（主催Paid相当）。データは**ビルド時にCSV/JSONへ前処理して同梱**（DB無し）。地図は **MapLibre+地理院タイル**。LLMは Gemini無料枠 or OpenCode付属を必要箇所だけ。
  - 利点: DBの一時停止/起動遅延リスクが無く、デモが安定。コスト実質0。
- **B. フロント＋エッジ関数＋軽量DB型（動的・少しリッチ）**
  - 同上＋ **Workers/Pages Functions** で集計API、**Cloudflare D1 or Supabase** に保存。
  - 注意: Supabaseは7日休止対策（デモ前ウォームアップ）。エッジ関数のCPU/タイムアウト上限を意識。

## 費用が発生しがちな箇所と回避策
- **独自ドメイン**: 最も油断する出費。**`*.pages.dev` / `*.vercel.app` のサブドメインで十分**。審査・デモはURLが通れば良い（公式提出物は「デモURL（任意）」）。無理に独自ドメインを取らない。
- **DB**: 常駐DBは無料枠の休止・起動遅延・容量超過が事故源。**「ビルド時にデータを静的化して同梱」できないか**をまず検討（案A）。必要時のみD1/Supabase。
- **ストレージ/帯域**: 画像/PDFは**下りegress無料のCloudflare R2**か、リポジトリ同梱の静的配信に寄せる。重い動画は外部（YouTube限定公開）へ。
- **LLM API課金**: 従量課金キーを本番URLに直結しない。**サーバ側(Edge関数)に隠し、無料枠/主催提供分でレート制御**。Blaze等「無料枠超過で従量」系は上限アラート必須。
- **ビルド時間/関数実行**: 無料枠はビルド分・関数秒数・1日リクエスト数に上限。重い処理はクライアント/ビルド時に寄せ、エッジ関数は薄く保つ。

## 示唆（So what？／勝ち筋への影響）
- **実現可能性: ほぼ確定でクリア。** 主催が「Cloudflare Paid相当＋OpenCode(LLM付)」を9月末まで無料提供するため、**ソロ・無料・短時間でも“インフラ費0”は構造的に成立**。コストはむしろ非論点。差は「何を作るか」で付く。**ただし提供は「9月末まで」かつ「利用申請後、順次付与」=即時保証ではない**点に注意。**作品提出締切(8/23)はカバーされるが、Final Stage(10/17)直前の改修やDemo Day(2027/3/27)は提供期間外**になり得るため、その時期は一般無料枠（Cloudflare Workers 10万req/日＋静的無制限など）への退避を前提にしておくと安全。
- **評価軸への直結: 「技術賞」を狙うなら主催スタックの上で“エッジ/AI/地図”を実装で見せるのが筋。** 全8賞（都知事杯/データ活用賞/アイデア賞/技術賞/ソーシャルインパクト賞/サービスデザイン賞/学生賞/オーディエンス賞）が存在し、技術賞・データ活用賞・サービスデザイン賞はいずれも実在（出典: [募集要項 8.賞](https://odhackathon.metro.tokyo.lg.jp/recruitment/)）。審査基準は5項目（データ活用/アイデア力/技術力/ソーシャルインパクト/サービスデザイン）の共通セットで、**各賞ごとの配点比率は公開されていない**（→担当①と要すり合わせ）。安定したデモが効くので、**案A（静的化＋MapLibre+地理院タイル）で「落ちない・速い・出典が綺麗」**を最優先にし、AIは「効く一箇所」に絞ると費用対効果が高い。
- **差別化: 地図表現とデータ前処理が差になる。** 地理院タイル/MapLibre/deck.glは全部無料で“見栄え”を作れる。コストをかけず可視化のリッチさ（3D・ヒートマップ・時系列）で「データ活用賞/サービスデザイン賞」に寄せられる。
- **データ: 東京都オープンデータ＋地理院タイルは無料かつ出典明示だけで使え、ライセンス事故が起きにくい。** OSM公式タイルの本番直叩きだけ回避すれば安全（→OpenFreeMap等へ）。データ選定は担当（データ系トピック）と連携。
- **リスク回避（So what的に最重要）: デモ当日の“起動遅延/枠超過”が一番の失点源。** 無料枠の罠（Supabase 7日休止、Render 15分スリープ、Vercel非商用規約、Netlify新クレジット制）を踏まないよう、**DBレス案Aを基本線**に置く。独自ドメインは買わない。これだけで「無料・安定・上位入賞狙い」の前提が崩れない。
- **要確認（断定回避）**: 主催Cloudflare/OpenCodeの具体枠とLLM種別・9月末以降の扱い、各賞の配点。いずれも公式に数値が無いため事務局/キックオフで裏取りが必要。
