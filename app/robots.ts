import type { MetadataRoute } from 'next';
import { resolveSiteOrigin } from '@/lib/seo';

// output: 'export' でビルド時に /robots.txt として静的生成する
export const dynamic = 'force-static';

const SITE_URL = resolveSiteOrigin(process.env.NEXT_PUBLIC_SITE_URL);

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
