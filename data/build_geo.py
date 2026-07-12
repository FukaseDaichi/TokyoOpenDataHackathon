#!/usr/bin/env python3
"""区詳細ページ用ジオデータ生成。TopoJSON(N03簡略化版)→局所平面km座標JSON。
出力: data/processed/ward-geo.json"""
import json
import math
from pathlib import Path

RAW = Path(__file__).parent / 'raw' / 'N03-21_13_city.topojson'
OUT = Path(__file__).parent / 'processed' / 'ward-geo.json'
WARD_IDS = [f'131{i:02d}' for i in range(1, 24)]

# 東京中心の等距円筒近似（十分な精度。装飾地図用途）
LON0, LAT0 = 139.75, 35.69
KX = 111.320 * math.cos(math.radians(LAT0))  # 経度1度あたりkm
KY = 110.574                                  # 緯度1度あたりkm
MIN_RING_AREA = 0.02  # km^2 未満の微小リング（岩礁等）は捨てる

CODE_KEY = 'N03_007'  # 5桁団体コード
NAME_KEY = 'N03_004'  # 市区町村名


def decode_arcs(topo):
    sx, sy = topo['transform']['scale']
    tx, ty = topo['transform']['translate']
    arcs = []
    for arc in topo['arcs']:
        pts, cx, cy = [], 0, 0
        for dx, dy in arc:
            cx += dx
            cy += dy
            pts.append((cx * sx + tx, cy * sy + ty))
        arcs.append(pts)
    return arcs


def ring_coords(arc_indices, arcs):
    pts = []
    for i in arc_indices:
        seg = arcs[i] if i >= 0 else list(reversed(arcs[~i]))
        if pts and pts[-1] == seg[0]:
            seg = seg[1:]
        pts.extend(seg)
    if len(pts) > 1 and pts[0] == pts[-1]:
        pts = pts[:-1]
    return pts


def project(lon, lat):
    return round((lon - LON0) * KX, 3), round((lat - LAT0) * KY, 3)


def shoelace(ring):
    s = 0.0
    for i in range(len(ring)):
        x1, y1 = ring[i]
        x2, y2 = ring[(i + 1) % len(ring)]
        s += x1 * y2 - x2 * y1
    return s / 2  # 符号付き面積(km^2)


def centroid(ring):
    a = shoelace(ring)
    cx = cy = 0.0
    for i in range(len(ring)):
        x1, y1 = ring[i]
        x2, y2 = ring[(i + 1) % len(ring)]
        f = x1 * y2 - x2 * y1
        cx += (x1 + x2) * f
        cy += (y1 + y2) * f
    return round(cx / (6 * a), 3), round(cy / (6 * a), 3)


def main():
    topo = json.loads(RAW.read_text(encoding='utf-8'))
    layer = next(iter(topo['objects'].values()))
    arcs = decode_arcs(topo)
    wards = {}
    for geom in layer['geometries']:
        code = (geom.get('properties') or {}).get(CODE_KEY, '')
        if code not in WARD_IDS:
            continue
        polys = geom['arcs'] if geom['type'] == 'MultiPolygon' else [geom['arcs']]
        rings = []
        for poly in polys:
            outer = [project(lon, lat) for lon, lat in ring_coords(poly[0], arcs)]
            if abs(shoelace(outer)) >= MIN_RING_AREA:
                rings.append(outer)
        name = geom['properties'][NAME_KEY]
        area = round(sum(abs(shoelace(r)) for r in rings), 2)
        rings.sort(key=lambda r: abs(shoelace(r)), reverse=True)  # 最大リングを先頭に
        main_ring = rings[0]
        wards[code] = {'id': code, 'name': name, 'center': list(centroid(main_ring)),
                       'area_km2': area, 'rings': [[list(p) for p in r] for r in rings]}

    missing = [c for c in WARD_IDS if c not in wards]
    assert not missing, f'欠損区: {missing}'
    data = {
        'source': '「国土数値情報（行政区域データ）」（国土交通省）を加工して作成（簡略化: smartnews-smri/japan-topography）',
        'wards': [wards[c] for c in WARD_IDS],
    }
    OUT.write_text(json.dumps(data, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
    size_kb = OUT.stat().st_size / 1024
    print(f'{OUT} ({size_kb:.0f}KB, {len(wards)}区)')
    assert size_kb <= 120, f'サイズ超過: {size_kb:.0f}KB（簡略化率を上げる）'


if __name__ == '__main__':
    main()
