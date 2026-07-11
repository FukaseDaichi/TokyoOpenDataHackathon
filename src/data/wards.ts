import type { AxisVector, Ward, WardMetrics } from '../domain/axes';
import { minMaxToSignedUnit, logMinMaxToSignedUnit } from '../lib/normalize';
import { kmeans } from '../lib/cluster';
import snapshot from './ward-metrics.json';

export const GROUP_COUNT = 6;

/** 各指標の出典（実オープンデータ）。個別ページの根拠表示に使う。 */
export const DATA_SOURCES: Record<string, string> = snapshot.sources;

interface RawWard {
  id: string;
  name: string;
  metrics: WardMetrics;
}

/**
 * 実データ（data/processed/wards.json のスナップショット）から5軸ベクトルを合成する。
 * - 賑わい: 昼夜間人口比率（千代田1355%が支配的なためlogスケール）
 * - 成熟: 高齢化率 − 年少人口率
 * - みどり: 一人当たり公立公園面積
 * - 世帯: 子育て世帯率 − 単身世帯率
 * - 華やぎ: 財政力指数
 */
function buildAxes(raw: RawWard[]): AxisVector[] {
  const liveliness = logMinMaxToSignedUnit(raw.map((w) => w.metrics.daytime_population_ratio));
  const maturity = minMaxToSignedUnit(raw.map((w) => w.metrics.aging_rate - w.metrics.youth_rate));
  const greenery = minMaxToSignedUnit(raw.map((w) => w.metrics.park_area_per_capita));
  const family = minMaxToSignedUnit(
    raw.map((w) => w.metrics.family_household_rate - w.metrics.single_household_rate),
  );
  const luxury = minMaxToSignedUnit(raw.map((w) => w.metrics.fiscal_strength_index));
  return raw.map((_, i) => ({
    liveliness: liveliness[i],
    maturity: maturity[i],
    greenery: greenery[i],
    family: family[i],
    luxury: luxury[i],
  }));
}

let cache: Ward[] | null = null;

export function loadWards(): Ward[] {
  if (cache) return cache;
  const raw = snapshot.wards as RawWard[];
  const axes = buildAxes(raw);
  const base: Ward[] = raw.map((w, i) => ({
    code: w.id,
    name: w.name,
    axes: axes[i],
    metrics: w.metrics,
  }));
  const labels = kmeans(base, GROUP_COUNT);
  cache = base.map((w, i) => ({ ...w, group: `系統${labels[i] + 1}` }));
  return cache;
}
