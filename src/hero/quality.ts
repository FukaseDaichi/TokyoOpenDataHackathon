// 端末に応じた品質ティア。
// - high: フル演出（デスクトップ）
// - low: 粒子・DPR・テクスチャ解像度を抑え、最遠景バンドのカードを非表示
// - fallback: prefers-reduced-motion または WebGL不可 → 2D絵本表示
export type QualityTier = 'high' | 'low' | 'fallback';

export interface QualitySettings {
  dprMax: number;
  goldDust: number;
  paperBits: number;
  textureWidth: 512 | 896;
  /** これより奥の深度バンドは回廊中は描画しない（集結では全員登場） */
  maxCorridorBand: number;
  mouseTilt: boolean;
}

export const QUALITY_SETTINGS: Record<Exclude<QualityTier, 'fallback'>, QualitySettings> = {
  high: { dprMax: 2, goldDust: 600, paperBits: 42, textureWidth: 896, maxCorridorBand: 5, mouseTilt: true },
  low: { dprMax: 1.2, goldDust: 180, paperBits: 16, textureWidth: 512, maxCorridorBand: 4, mouseTilt: false },
};

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  // matchMedia非対応環境は静的表示（ward-modal-staticと同じ方針）にフォールバックする
  if (typeof window.matchMedia !== 'function') return true;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function detectQuality(): QualityTier {
  if (typeof window === 'undefined') return 'fallback';
  // デモ・検証用の強制上書き: ?view=2d|low|high
  const forced = new URLSearchParams(window.location.search).get('view');
  if (forced === '2d') return 'fallback';
  if (forced === 'low' || forced === 'high') return forced;
  if (prefersReducedMotion()) return 'fallback';
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
    if (!gl) return 'fallback';
  } catch {
    return 'fallback';
  }
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const small = window.innerWidth < 768;
  const mem = (navigator as { deviceMemory?: number }).deviceMemory;
  if (coarse || small || (mem !== undefined && mem <= 4)) return 'low';
  return 'high';
}
