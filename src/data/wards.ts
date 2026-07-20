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

/**
 * 系統名は代表区コードをキーに割り当てる。
 * k-meansの数値ラベルは入力順に依存して変わり得るため、番号へ直接名前を紐づけない。
 */
const GROUP_NAMES: ReadonlyArray<{ representative: string; name: string }> = [
  { representative: '13101', name: 'ど真ん中シティ系' }, // 千代田区
  { representative: '13102', name: 'ベイサイド新星系' }, // 中央区
  { representative: '13103', name: 'きらめきセレブ系' }, // 港区
  { representative: '13104', name: 'にぎやか繁華街系' }, // 新宿区
  { representative: '13105', name: 'おだやか住宅街系' }, // 文京区
  { representative: '13107', name: '下町あったか系' }, // 墨田区
];

/**
 * クラスタラベル列を系統名列へ変換する。
 * 代表区どうしが同一クラスタに落ちた場合は、データ更新で所属が変動した
 * サインなので例外を投げ、命名の見直しを強制する。
 */
export function nameGroups(labels: number[], codes: string[]): string[] {
  const labelByCode = new Map(codes.map((c, i) => [c, labels[i]]));
  const nameByLabel = new Map<number, string>();
  for (const { representative, name } of GROUP_NAMES) {
    const label = labelByCode.get(representative);
    if (label === undefined) throw new Error(`代表区 ${representative} がデータに存在しない`);
    const taken = nameByLabel.get(label);
    if (taken !== undefined) {
      throw new Error(`代表区 ${representative} のクラスタは既に「${taken}」。系統の命名を見直すこと`);
    }
    nameByLabel.set(label, name);
  }
  return labels.map((l, i) => {
    const name = nameByLabel.get(l);
    if (name === undefined) throw new Error(`区 ${codes[i]} のクラスタに代表区がない。系統の命名を見直すこと`);
    return name;
  });
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
  const names = nameGroups(labels, base.map((w) => w.code));
  cache = base.map((w, i) => ({ ...w, group: names[i] }));
  return cache;
}
