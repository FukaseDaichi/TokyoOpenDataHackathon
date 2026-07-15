import raw from './ward-policies.json';
import type { AxisKey } from '../domain/axes';

export interface WardPolicy {
  title: string;
  summary: string;
  source: string;
  url: string;
  /** 関連する診断軸（手動キュレーション）。診断結果ページの政策選択に使う */
  axes?: AxisKey[];
}
export interface WardProfile {
  flowers?: string[];
  trees?: string[];
  birds?: string[];
  emblemNote?: string;
  policies: WardPolicy[];
}

const DATA = raw as Record<string, Partial<WardProfile>>;

/** 手動キュレーションの区プロフィール。未収録区は null */
export function loadWardProfile(code: string): WardProfile | null {
  const entry = DATA[code];
  if (!entry) return null;
  return { ...entry, policies: entry.policies ?? [] };
}

/** 一致軸とタグが交差する最初の政策を返す。なければ先頭、政策が空なら null */
export function pickPolicyForAxes(policies: WardPolicy[], axes: AxisKey[]): WardPolicy | null {
  if (policies.length === 0) return null;
  return policies.find((p) => p.axes?.some((a) => axes.includes(a))) ?? policies[0];
}
