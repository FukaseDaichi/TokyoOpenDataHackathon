import type { WardMetrics } from '../domain/axes';
import type { WardDetails } from '../data/details';

export interface WardStatItem {
  label: string;
  v: number;
  vs: number[];
  text: string;
  note?: string;
}

/** 「データで見る◯◯」のステータス項目。区詳細ページとモーダルで共用する */
export function buildWardStats(
  m: WardMetrics,
  detail: WardDetails,
  all: WardMetrics[],
  allDetails: WardDetails[],
): WardStatItem[] {
  return [
    { label: '昼夜間人口比率', v: m.daytime_population_ratio, vs: all.map((x) => x.daytime_population_ratio), text: `${m.daytime_population_ratio.toFixed(1)}%`, note: '100%を超えるほど昼に人が集まる街' },
    { label: '高齢化率', v: m.aging_rate, vs: all.map((x) => x.aging_rate), text: `${m.aging_rate.toFixed(1)}%`, note: '高いほど成熟した落ち着きのある街' },
    { label: '年少人口率', v: m.youth_rate, vs: all.map((x) => x.youth_rate), text: `${m.youth_rate.toFixed(1)}%` },
    { label: '一人当たり公立公園面積', v: m.park_area_per_capita, vs: all.map((x) => x.park_area_per_capita), text: `${m.park_area_per_capita.toFixed(2)}㎡` },
    { label: '単身世帯率', v: m.single_household_rate, vs: all.map((x) => x.single_household_rate), text: `${m.single_household_rate.toFixed(1)}%` },
    { label: '子育て世帯率', v: m.family_household_rate, vs: all.map((x) => x.family_household_rate), text: `${m.family_household_rate.toFixed(1)}%` },
    { label: '財政力指数', v: m.fiscal_strength_index, vs: all.map((x) => x.fiscal_strength_index), text: m.fiscal_strength_index.toFixed(2) },
    { label: '地価公示（住宅地平均）', v: detail.landPriceAvg, vs: allDetails.map((d) => d.landPriceAvg), text: `${Math.round(detail.landPriceAvg / 10000).toLocaleString()}万円/㎡`, note: `区内${detail.landPricePoints}地点の平均` },
    ...(detail.foreignRate !== undefined
      ? [{ label: '外国人人口比率', v: detail.foreignRate, vs: allDetails.map((d) => d.foreignRate!), text: `${detail.foreignRate.toFixed(1)}%`, note: '多いほど国際色ゆたかな街' }]
      : []),
    ...(detail.incomePerTaxpayer !== undefined
      ? [{ label: '平均所得（納税者1人当たり）', v: detail.incomePerTaxpayer, vs: allDetails.map((d) => d.incomePerTaxpayer!), text: `${Math.round(detail.incomePerTaxpayer / 100) / 10}百万円`, note: '課税対象所得ベース' }]
      : []),
  ];
}
