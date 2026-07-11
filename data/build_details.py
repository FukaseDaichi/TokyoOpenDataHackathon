#!/usr/bin/env python3
"""区詳細ページ用の追加データ集計。出力: data/processed/ward-details.json"""
import csv, json
from pathlib import Path

import openpyxl

RAW = Path(__file__).parent / 'raw'
OUT = Path(__file__).parent / 'processed' / 'ward-details.json'
WARD_IDS = [f'131{i:02d}' for i in range(1, 24)]

# 第9表の区行の並び順（build_wards.py の WARDS と同じ23区順）は行データ内の
# 団体名文字列から直接引くため、コード対応表だけを用意する。
WARD_NAME_TO_CODE = {
    '千代田区': '13101', '中央区': '13102', '港区': '13103', '新宿区': '13104',
    '文京区': '13105', '台東区': '13106', '墨田区': '13107', '江東区': '13108',
    '品川区': '13109', '目黒区': '13110', '大田区': '13111', '世田谷区': '13112',
    '渋谷区': '13113', '中野区': '13114', '杉並区': '13115', '豊島区': '13116',
    '北区': '13117', '荒川区': '13118', '板橋区': '13119', '練馬区': '13120',
    '足立区': '13121', '葛飾区': '13122', '江戸川区': '13123',
}


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


def income():
    """納税義務者1人当たり課税対象所得（千円）。

    総務省「市町村税課税状況等の調」（令和6年度）を東京都総務局が特別区分に
    再集計した「第9表 課税標準額段階別令和６年度分所得割額等に関する調（小計）」
    （data/raw/tokyo_r06_dai9hyo.xlsx シート『表09』『表09 (2)』）から、
    課税標準額の11段階（10万円以下～5,000万円超1億円以下）＋『表09 (2)』先頭の
    12段階目（1億円超）を区ごとに合算し、
        課税対象所得（課税標準額の合計・千円）÷ 納税義務者数（所得割）
    で1人当たり課税対象所得を算出する。

    出典URL: https://www.soumu.metro.tokyo.lg.jp/documents/d/soumu/r06tokubetsukukazeiver4
    （東京都総務局行政部「区市町村行財政」→ 令和6年度 → 特別区課税状況 各表集計表）
    """
    src = RAW / 'tokyo_r06_dai9hyo.xlsx'
    if not src.exists():
        return {}
    wb = openpyxl.load_workbook(src, read_only=True, data_only=True)

    def block_indices(rows, label):
        header = rows[6]
        idx = [i for i, v in enumerate(header) if v == '納税義務者数']
        ks = [i for i, v in enumerate(header) if v and label in str(v)]
        return idx, ks

    def ward_rows(rows):
        out = {}
        for row in rows:
            if row and isinstance(row[0], int) and isinstance(row[1], str) and row[1].strip() in WARD_NAME_TO_CODE:
                out[row[1].strip()] = row
        return out

    ws1 = wb['表09']
    rows1 = list(ws1.iter_rows(values_only=True))
    nz1, ks1 = block_indices(rows1, '課税標準額')
    wards1 = ward_rows(rows1)

    ws2 = wb['表09 (2)']
    rows2 = list(ws2.iter_rows(values_only=True))
    nz2_all, ks2_all = block_indices(rows2, '課税標準額')
    nz2, ks2 = nz2_all[:1], ks2_all[:1]  # 先頭ブロックのみ = 「1億円を超える金額」
    wards2 = ward_rows(rows2)

    result = {}
    for name, code in WARD_NAME_TO_CODE.items():
        r1 = wards1.get(name)
        if not r1:
            continue
        taxpayers = sum(r1[i + 2] for i in nz1)  # (計) = あり+なし
        taxable_income = sum(r1[i] for i in ks1)
        r2 = wards2.get(name)
        if r2:
            taxpayers += sum(r2[i + 2] for i in nz2)
            taxable_income += sum(r2[i] for i in ks2)
        if taxpayers > 0:
            result[code] = {'income_per_taxpayer': round(taxable_income / taxpayers)}
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

    pop = _total_population()
    pop_missing = [w for w in WARD_IDS if w not in pop]
    assert not pop_missing, f'population missing wards: {pop_missing}'  # kill test: 23区揃うこと
    sources['population'] = '住民基本台帳による世帯と人口（令和8年1月1日現在）・人'

    inc = income()
    inc_missing = [w for w in WARD_IDS if w not in inc]
    if inc_missing:
        print(f'income DROPPED: missing wards {inc_missing or "(no source file)"}')
        inc = {}
    else:
        sources['income'] = '総務省「市町村税課税状況等の調」（令和6年度）納税義務者1人当たり課税対象所得・千円'

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
        entry = {'id': w, **lp[w], 'population': pop[w]}
        if w in inc:
            entry.update(inc[w])
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
