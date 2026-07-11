import { AXIS_KEYS, type AxisVector, type Ward } from '../domain/axes';

export function distance(a: AxisVector, b: AxisVector): number {
  let s = 0;
  for (const key of AXIS_KEYS) {
    const d = a[key] - b[key];
    s += d * d;
  }
  return Math.sqrt(s);
}

export interface MatchResult {
  ward: Ward;
  distance: number;
}

export function rankMatches(user: AxisVector, wards: Ward[]): MatchResult[] {
  return wards
    .map((ward) => ({ ward, distance: distance(user, ward.axes) }))
    .sort((a, b) => a.distance - b.distance);
}

export function bestMatch(user: AxisVector, wards: Ward[]): Ward {
  return rankMatches(user, wards)[0].ward;
}
