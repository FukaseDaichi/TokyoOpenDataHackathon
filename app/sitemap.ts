import type { MetadataRoute } from 'next';
import { ALL_SLUGS } from '@/data/slugs';
import { buildSitemapEntries } from '@/lib/seo';

// output: 'export' でビルド時に /sitemap.xml として静的生成する
export const dynamic = 'force-static';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://uchinokuchan.pages.dev';

export default function sitemap(): MetadataRoute.Sitemap {
  return buildSitemapEntries(SITE_URL, ALL_SLUGS);
}
