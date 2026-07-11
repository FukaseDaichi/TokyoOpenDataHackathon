import { WARDS as HERO_WARDS } from '../hero/wards';

export interface WardTheme {
  slug: string | null;
  color: string;
  catch: string;
}

const byId = new Map(HERO_WARDS.map((w) => [w.id, w]));

/** 区コード（例 '13101'）からキャラ画像slug・テーマカラー・キャッチコピーを引く */
export function wardTheme(code: string): WardTheme {
  const w = byId.get(code);
  return {
    slug: w?.slug ?? null,
    color: w?.color ?? '#b8923f',
    catch: w?.catch ?? '',
  };
}

/** SSR立ち絵のパス（静的エクスポート配下 public/characters/ssr/） */
export function ssrImage(slug: string, size: 512 | 896 = 512): string {
  return `characters/ssr/${slug}-w${size}.webp`;
}
