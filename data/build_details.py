#!/usr/bin/env python3
"""区詳細ページ用の追加データ集計。出力: data/processed/ward-details.json"""
import csv, json
from pathlib import Path

RAW = Path(__file__).parent / 'raw'
OUT = Path(__file__).parent / 'processed' / 'ward-details.json'
WARD_IDS = [f'131{i:02d}' for i in range(1, 24)]


def land_price():
    """地価公示 住宅地（用途0）の区別平均（円/㎡）"""
    result = {}
    with open(RAW / 'chika_r7_chiten.csv', encoding='cp932') as f:
        rows = list(csv.reader(f))
    header = rows[1]
    ci = {name: header.index(name) for name in ['都道府県市区町村コード', '標準地番号（用途）', '当年価格（円）']}
    acc = {}
    for row in rows[2:]:
        if len(row) <= max(ci.values()):
            continue
        code = row[ci['都道府県市区町村コード']].strip()
        youto = row[ci['標準地番号（用途）']].strip()
        price = row[ci['当年価格（円）']].replace(',', '').strip()
        if code in WARD_IDS and youto == '0' and price.isdigit():
            acc.setdefault(code, []).append(int(price))
    for code, prices in acc.items():
        result[code] = {'land_price_avg': round(sum(prices) / len(prices)), 'land_price_points': len(prices)}
    return result


def _total_population():
    """住民基本台帳「世帯と人口」から区別総人口（年少+生産年齢+老年）を算出。"""
    pop = {}
    with open(RAW / 'jy26qv0301.csv', encoding='utf-8-sig') as f:
        rows = list(csv.reader(f))
    header = rows[0]
    code_i = header.index('地域コード')
    total_cols = [i for i, name in enumerate(header) if name.endswith('／総数(人)')]
    for row in rows[1:]:
        if len(row) <= code_i:
            continue
        code = row[code_i].strip()
        if code not in WARD_IDS:
            continue
        try:
            total = sum(int(row[i].replace(',', '')) for i in total_cols)
        except (ValueError, IndexError):
            continue
        pop[code] = total
    return pop


def foreign_rate():
    """区別 外国人人口比率（％） = 外国人人口 ÷ 総人口(住基台帳) × 100

    データソース: 東京都「国籍・地域別　外国人人口」（東京都の統計）
    data/raw/ga26ev0100.csv （区市町村別・国籍別 外国人人口, 令和8年1月1日現在）
    分母は data/raw/jy26qv0301.csv （住民基本台帳 世帯と人口, 令和8年1月1日現在）の
    年少+生産年齢+老年人口の合計。
    """
    src = RAW / 'ga26ev0100.csv'
    if not src.exists():
        return {}
    pop = _total_population()
    if not pop:
        return {}
    foreign = {}
    with open(src, encoding='utf-8-sig') as f:
        rows = list(csv.reader(f))
    header = rows[0]
    try:
        code_i = header.index('地域コード')
        foreign_i = header.index('総数')
    except ValueError:
        return {}
    for row in rows[1:]:
        if len(row) <= max(code_i, foreign_i):
            continue
        code = row[code_i].strip()
        if code not in WARD_IDS:
            continue
        val = row[foreign_i].replace(',', '').strip()
        if val.isdigit():
            foreign[code] = int(val)
    result = {}
    for code in WARD_IDS:
        if code in foreign and code in pop and pop[code] > 0:
            result[code] = {'foreign_rate': round(foreign[code] / pop[code] * 100, 2)}
    return result


def top_stations():
    """区ごとの乗降人員上位3駅。

    調査したが「区マッピング付き・23区完備」のクリーンなデータ源が
    見つからなかったため、意図的に未実装（常に空を返す）。呼び出し側は
    これを missing 扱いにしてゲートで指標ごと落とす。

    調査済みで採用しなかった候補:
    - 国土数値情報 S12 駅別乗降客数（全国, GML/Shapefile）:
      駅の所在区カラムがなく、空間結合が必要だが geopandas/pyshp 等の
      GIS ライブラリが環境に無い。
    - 東京都交通局 各駅乗降人員一覧（都営地下鉄4路線, CSV）:
      駅名のみで区カラムなし。かつ都営地下鉄は世田谷・杉並・足立・
      葛飾・江戸川区などを通らず23区を網羅できない。
    - 東京都統計年鑑 4-8/4-13/4-15（JR/私鉄/地下鉄, 2019年データ）:
      事業者ごとに別ファイルで区カラムがなく、手動の駅→区マッピングが
      必要な上にデータが2019年時点で古い。
    """
    return {}


def main():
    lp = land_price()
    missing = [w for w in WARD_IDS if w not in lp]
    assert not missing, f'land_price missing wards: {missing}'  # kill test: 23区揃うこと

    sources = {'land_price': '国土交通省 令和7年地価公示（住宅地 区別平均・円/㎡）'}

    fr = foreign_rate()
    fr_missing = [w for w in WARD_IDS if w not in fr]
    if fr_missing:
        print(f'foreign_rate DROPPED: missing wards {fr_missing or "(no source file)"}')
        fr = {}
    else:
        sources['foreign_rate'] = '東京都の統計「国籍・地域別 外国人人口」（令和8年1月1日現在）÷ 住民基本台帳による世帯と人口 総人口（令和8年1月1日現在）・％'

    ts = top_stations()
    ts_missing = [w for w in WARD_IDS if w not in ts]
    if ts_missing:
        print(f'top_stations DROPPED: missing wards {ts_missing or "(no source data)"}')
        ts = {}
    else:
        sources['stations'] = '国土数値情報 S12 駅別乗降客数'

    wards = []
    for w in WARD_IDS:
        entry = {'id': w, **lp[w]}
        if w in fr:
            entry.update(fr[w])
        if w in ts:
            entry['top_stations'] = ts[w]
        wards.append(entry)

    data = {'sources': sources, 'wards': wards}
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding='utf-8')
    print(f'wrote {OUT} ({len(wards)} wards)')


if __name__ == '__main__':
    main()
