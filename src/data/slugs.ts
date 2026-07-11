import { WARDS as HERO_WARDS } from '../hero/wards';

export const CODE_TO_SLUG: Record<string, string> = {};
export const SLUG_TO_CODE: Record<string, string> = {};
for (const w of HERO_WARDS) {
  if (!w.slug) continue;
  CODE_TO_SLUG[w.id] = w.slug;
  SLUG_TO_CODE[w.slug] = w.id;
}
export const ALL_SLUGS: string[] = HERO_WARDS.map((w) => w.slug!).filter(Boolean);
