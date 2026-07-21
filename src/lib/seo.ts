export interface SitemapEntry {
  url: string;
  priority: number;
}

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export const SITE_NAME = 'うちの区ちゃん';
export const SITE_DESCRIPTION =
  'オープンデータでつくった東京23区タイプ診断。10問・約1分で、あなたに一番似ている区ちゃんが見つかります。';

// sitemap・JSON-LDは絶対URLが必須のため、NEXT_PUBLIC_SITE_URL 未設定時は本番URLへフォールバックする
const PRODUCTION_ORIGIN = 'https://uchinokuchan.pages.dev';

export function resolveSiteOrigin(envValue: string | undefined): string {
  const value = envValue?.trim();
  return (value ? value : PRODUCTION_ORIGIN).replace(/\/+$/, '');
}

// トップ・区詳細・診断結果の全静的ルートをsitemap用に列挙する。
// URLは next.config.ts の trailingSlash: true と一致させる。
export function buildSitemapEntries(base: string, slugs: string[]): SitemapEntry[] {
  const origin = base.replace(/\/+$/, '');
  return [
    { url: `${origin}/`, priority: 1 },
    ...slugs.map((slug) => ({ url: `${origin}/ward/${slug}/`, priority: 0.8 })),
    ...slugs.map((slug) => ({ url: `${origin}/result/${slug}/`, priority: 0.5 })),
  ];
}

export function buildWebSiteJsonLd(base: string): Record<string, unknown> {
  const origin = base.replace(/\/+$/, '');
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: `${origin}/`,
    description: SITE_DESCRIPTION,
    inLanguage: 'ja',
  };
}

export function buildBreadcrumbJsonLd(base: string, items: BreadcrumbItem[]): Record<string, unknown> {
  const origin = base.replace(/\/+$/, '');
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${origin}${item.path}`,
    })),
  };
}

// <script type="application/ld+json"> へ埋め込むための直列化。
// 値に "</script>" が含まれてもタグが閉じないよう < をエスケープする。
export function serializeJsonLd(jsonLd: Record<string, unknown>): string {
  return JSON.stringify(jsonLd).replace(/</g, '\\u003c');
}
