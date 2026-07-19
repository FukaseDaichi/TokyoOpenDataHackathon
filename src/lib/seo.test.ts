import { describe, expect, it } from 'vitest';
import {
  buildBreadcrumbJsonLd,
  buildSitemapEntries,
  buildWebSiteJsonLd,
  resolveSiteOrigin,
  serializeJsonLd,
} from './seo';

describe('buildSitemapEntries', () => {
  const base = 'https://example.com';
  const slugs = ['chiyoda', 'shibuya'];

  it('トップ + 区詳細 + 結果ページの全URLを返す', () => {
    const entries = buildSitemapEntries(base, slugs);
    expect(entries).toHaveLength(1 + slugs.length * 2);
    const urls = entries.map((e) => e.url);
    expect(urls).toContain('https://example.com/');
    expect(urls).toContain('https://example.com/ward/shibuya/');
    expect(urls).toContain('https://example.com/result/shibuya/');
  });

  it('trailingSlash設定と一致する末尾スラッシュ付きURLを生成する', () => {
    const entries = buildSitemapEntries(base, slugs);
    for (const e of entries) {
      expect(e.url.endsWith('/')).toBe(true);
    }
  });

  it('baseの末尾スラッシュ有無に関わらず二重スラッシュを作らない', () => {
    const entries = buildSitemapEntries('https://example.com/', slugs);
    for (const e of entries) {
      expect(e.url).not.toMatch(/([^:])\/\//);
    }
  });

  it('トップを最優先、区詳細、結果ページの順のpriorityを付ける', () => {
    const entries = buildSitemapEntries(base, slugs);
    const byUrl = new Map(entries.map((e) => [e.url, e]));
    expect(byUrl.get('https://example.com/')?.priority).toBe(1);
    expect(byUrl.get('https://example.com/ward/shibuya/')?.priority).toBe(0.8);
    expect(byUrl.get('https://example.com/result/shibuya/')?.priority).toBe(0.5);
  });
});

describe('resolveSiteOrigin', () => {
  it('環境変数の値の末尾スラッシュを除去して返す', () => {
    expect(resolveSiteOrigin('https://example.com/')).toBe('https://example.com');
  });

  it('未設定なら本番URLへフォールバックする', () => {
    expect(resolveSiteOrigin(undefined)).toBe('https://uchinokuchan.pages.dev');
    expect(resolveSiteOrigin('')).toBe('https://uchinokuchan.pages.dev');
  });
});

describe('buildWebSiteJsonLd', () => {
  it('WebSiteスキーマをサイト名・URL・日本語指定つきで返す', () => {
    const jsonLd = buildWebSiteJsonLd('https://example.com');
    expect(jsonLd).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'うちの区ちゃん',
      url: 'https://example.com/',
      inLanguage: 'ja',
    });
    expect(typeof jsonLd.description).toBe('string');
  });
});

describe('buildBreadcrumbJsonLd', () => {
  it('パンくずをposition昇順・絶対URLのListItemで返す', () => {
    const jsonLd = buildBreadcrumbJsonLd('https://example.com', [
      { name: 'うちの区ちゃん', path: '/' },
      { name: '渋谷区ちゃん図鑑', path: '/ward/shibuya/' },
    ]);
    expect(jsonLd).toEqual({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'うちの区ちゃん',
          item: 'https://example.com/',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: '渋谷区ちゃん図鑑',
          item: 'https://example.com/ward/shibuya/',
        },
      ],
    });
  });
});

describe('serializeJsonLd', () => {
  it('script終了タグとして解釈されないよう < をエスケープする', () => {
    const out = serializeJsonLd({ name: '</script><b>' });
    expect(out).not.toContain('</script>');
    expect(out).toContain('\\u003c');
    expect(JSON.parse(out)).toEqual({ name: '</script><b>' });
  });
});
