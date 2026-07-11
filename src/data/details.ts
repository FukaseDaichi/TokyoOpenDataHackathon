import snapshot from './ward-details.json';

export interface TopStation { name: string; passengers: number }
export interface WardDetails {
  code: string;
  landPriceAvg: number;
  landPricePoints: number;
  population: number;
  incomePerTaxpayer?: number;
  foreignRate?: number;
  topStations?: TopStation[];
  crimePer1000?: number;
}

export const DETAIL_SOURCES: Record<string, string> = snapshot.sources;

interface RawDetail {
  id: string;
  land_price_avg: number;
  land_price_points: number;
  population: number;
  income_per_taxpayer?: number;
  foreign_rate?: number;
  top_stations?: TopStation[];
  crime_per_1000?: number;
}

let cache: Map<string, WardDetails> | null = null;

export function loadWardDetails(): Map<string, WardDetails> {
  if (cache) return cache;
  cache = new Map(
    (snapshot.wards as RawDetail[]).map((w) => [
      w.id,
      {
        code: w.id,
        landPriceAvg: w.land_price_avg,
        landPricePoints: w.land_price_points,
        population: w.population,
        incomePerTaxpayer: w.income_per_taxpayer,
        foreignRate: w.foreign_rate,
        topStations: w.top_stations,
        crimePer1000: w.crime_per_1000,
      },
    ]),
  );
  return cache;
}
