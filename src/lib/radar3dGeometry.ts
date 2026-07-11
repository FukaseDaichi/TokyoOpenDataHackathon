// 3Dレーダー（魔法陣ホログラム）の座標計算。three.js非依存の純関数のみ。
// 座標系: XZ平面が魔法陣の床、Yが上。カメラは+Z側の斜め上から見下ろす。

export type Point3 = [number, number, number];

/** 正規化値 [-1,1] → 中心からの距離 [0,r] */
export function valueToRadius(value: number, r: number): number {
  return ((value + 1) / 2) * r;
}

/** 軸iの方位角。軸0を手前（+Z）に置き、上から見て時計回りに均等配置 */
export function axisAngle(i: number, n: number): number {
  return Math.PI / 2 - (Math.PI * 2 * i) / n;
}

/** 軸iの値に対応する3D頂点 */
export function axisPoint(i: number, n: number, value: number, r: number, y: number): Point3 {
  const a = axisAngle(i, n);
  const radius = valueToRadius(value, r);
  return [radius * Math.cos(a), y, radius * Math.sin(a)];
}

/** 目盛りリング（値vの正n角形）。始点と終点が同じ閉ループ（n+1点） */
export function ringPoints(n: number, value: number, r: number, y: number): Point3[] {
  const pts: Point3[] = [];
  for (let i = 0; i <= n; i++) {
    pts.push(axisPoint(i % n, n, value, r, y));
  }
  // 浮動小数の揺れで閉じ損ねないよう終点は始点を複製
  pts[n] = [...pts[0]] as Point3;
  return pts;
}

/** 軸ラベル（ビルボード）の配置。最大半径の外側 scale 倍・高さ y */
export function labelPoint(i: number, n: number, r: number, y: number, scale: number): Point3 {
  const a = axisAngle(i, n);
  return [r * scale * Math.cos(a), y, r * scale * Math.sin(a)];
}
