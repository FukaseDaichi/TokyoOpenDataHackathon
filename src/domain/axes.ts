export type AxisKey = 'liveliness' | 'maturity' | 'greenery' | 'family' | 'luxury';

export const AXIS_KEYS: AxisKey[] = ['liveliness', 'maturity', 'greenery', 'family', 'luxury'];

export const AXIS_LABELS: Record<AxisKey, { low: string; high: string; name: string }> = {
  liveliness: { low: '静か', high: '賑やか', name: '賑わい' },
  maturity: { low: '若い', high: '成熟', name: '成熟' },
  greenery: { low: '都会的', high: 'みどり', name: 'みどり' },
  family: { low: 'おひとりさま', high: 'ファミリー', name: '世帯' },
  luxury: { low: '堅実', high: '華やか', name: '華やぎ' },
};

export type AxisVector = Record<AxisKey, number>;

/** 個別ページに表示する根拠数値（実オープンデータの生値） */
export interface WardMetrics {
  daytime_population_ratio: number;
  aging_rate: number;
  youth_rate: number;
  park_area_per_capita: number;
  single_household_rate: number;
  family_household_rate: number;
  fiscal_strength_index: number;
}

export interface Ward {
  code: string;
  name: string;
  axes: AxisVector;
  group?: string;
  metrics?: WardMetrics;
}

export function emptyVector(): AxisVector {
  return { liveliness: 0, maturity: 0, greenery: 0, family: 0, luxury: 0 };
}
