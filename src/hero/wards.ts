// 23区の固定テーブル。slugは assets/characters/ssr/{slug}.png の実在ファイル名
// （設計書の {ward_id}.png と異なりローマ字命名なのでここで対応を持つ）。
// slug=null はSSR画像が未生成の区（絵本風プレースホルダーで表示する）。
// catch は docs/strategy/ward-character-profiles.md の「性格ひとこと」。
// color はキャラ髪色由来のテーマカラー（プレースホルダー・光沢・ラベルに使用）。

export interface WardInfo {
  id: string;
  name: string;
  slug: string | null;
  catch: string;
  color: string;
  /** 東京の地理配置を星座化するための相対座標（x:東+, y:北+） */
  geo: { x: number; y: number };
}

export const WARDS: WardInfo[] = [
  { id: '13101', name: '千代田区', slug: 'chiyoda',   catch: '昼は人口約13.6倍、夜は静寂を愛す二面性エリート', color: '#cdd3e8', geo: { x: 0.0,  y: 0.0 } },
  { id: '13102', name: '中央区',   slug: 'chuo',      catch: '23区最年少、勢いに乗るニューリッチ新人',       color: '#5fc9d8', geo: { x: 0.6,  y: -0.35 } },
  { id: '13103', name: '港区',     slug: 'minato',    catch: '財政力1.15の絶対王者、華やかセレブ',           color: '#e8c56b', geo: { x: 0.1,  y: -0.9 } },
  { id: '13104', name: '新宿区',   slug: 'shinjuku',  catch: '眠らない単身者の街、面倒見のいい夜型',         color: '#9a68d0', geo: { x: -0.85, y: 0.1 } },
  { id: '13105', name: '文京区',   slug: 'bunkyo',    catch: '本と学び、育ちの良い文化人',                   color: '#3f7d5c', geo: { x: -0.1, y: 0.55 } },
  { id: '13106', name: '台東区',   slug: 'taito',     catch: '観光と祭りに生きる江戸っ子の粋なベテラン',     color: '#d84b3a', geo: { x: 0.75, y: 0.55 } },
  { id: '13107', name: '墨田区',   slug: 'sumida',    catch: 'ものづくり気質の職人娘、下町の頑固一徹',       color: '#4a5f9a', geo: { x: 1.15, y: 0.45 } },
  { id: '13108', name: '江東区',   slug: 'koto',      catch: '水辺とみどりのファミリー新興、開拓者',         color: '#3fbf8f', geo: { x: 1.25, y: -0.45 } },
  { id: '13109', name: '品川区',   slug: 'shinagawa', catch: '新旧バランス型のしごでき通勤ハブ',             color: '#48628e', geo: { x: 0.15, y: -1.5 } },
  { id: '13110', name: '目黒区',   slug: 'meguro',    catch: 'おしゃれ住宅街のセンス番長',                   color: '#d99aa8', geo: { x: -0.55, y: -1.35 } },
  { id: '13111', name: '大田区',   slug: 'ota',       catch: '羽田を抱える働き者、面倒見のいい町工場気質',   color: '#c87840', geo: { x: 0.15, y: -2.2 } },
  { id: '13112', name: '世田谷区', slug: 'setagaya',  catch: 'みんなのお姉さん、大所帯ののんびり屋',         color: '#cfa87e', geo: { x: -1.6, y: -1.15 } },
  { id: '13113', name: '渋谷区',   slug: 'shibuya',   catch: 'トレンドの発信源、華やかで自由なシングル',     color: '#e05fa0', geo: { x: -0.75, y: -0.6 } },
  { id: '13114', name: '中野区',   slug: 'nakano',    catch: 'サブカルに生きる自由な一人暮らし玄人',         color: '#8f8f98', geo: { x: -1.5, y: 0.15 } },
  { id: '13115', name: '杉並区',   slug: 'suginami',  catch: '静かな住宅街で趣味に浸る文化系',               color: '#8a8f56', geo: { x: -2.1, y: 0.0 } },
  { id: '13116', name: '豊島区',   slug: 'toshima',   catch: '密度MAXの都会っ子、公園0.76㎡/人でも元気',    color: '#e8c832', geo: { x: -0.75, y: 0.75 } },
  { id: '13117', name: '北区',     slug: 'kita',      catch: '昭和の風情を守る人情深いおばあちゃん子',       color: '#a85040', geo: { x: -0.25, y: 1.3 } },
  { id: '13118', name: '荒川区',   slug: 'arakawa',   catch: 'つつましくも家族思い、路面電車の走る街',       color: '#e0cb96', geo: { x: 0.45, y: 1.05 } },
  { id: '13119', name: '板橋区',   slug: 'itabashi',  catch: '庶民派の頼れる姐さん、実は成熟した落ち着き',   color: '#54705e', geo: { x: -1.05, y: 1.35 } },
  { id: '13120', name: '練馬区',   slug: 'nerima',    catch: 'アニメと畑のファミリー長女、面倒見抜群',       color: '#9fc84a', geo: { x: -1.9, y: 0.95 } },
  { id: '13121', name: '足立区',   slug: 'adachi',    catch: '気は優しくて力持ち、成熟した下町の姐御',       color: '#e07030', geo: { x: 0.75, y: 1.7 } },
  { id: '13122', name: '葛飾区',   slug: 'katsushika', catch: '人情と家族の絆トップ級、寅さん気質',          color: '#9a6a44', geo: { x: 1.5,  y: 1.15 } },
  { id: '13123', name: '江戸川区', slug: 'edogawa',   catch: '公園面積1位の圧倒的みどり、大家族の末っ子ガキ大将', color: '#4ac850', geo: { x: 1.85, y: 0.15 } },
];
