import snapshot from './ward-geo.json';

export interface WardGeo {
  code: string;
  name: string;
  /** 局所平面km座標の重心（x=東+, y=北+） */
  center: [number, number];
  areaKm2: number;
  rings: [number, number][][];
}

export const GEO_SOURCE: string = snapshot.source;

let cache: WardGeo[] | null = null;

export function loadWardGeo(): WardGeo[] {
  if (cache) return cache;
  cache = snapshot.wards.map((w) => ({
    code: w.id,
    name: w.name,
    center: w.center as [number, number],
    areaKm2: w.area_km2,
    rings: w.rings as [number, number][][],
  }));
  return cache;
}
