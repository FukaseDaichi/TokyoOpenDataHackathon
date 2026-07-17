export interface SitemapEntry {
  url: string;
  priority: number;
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
