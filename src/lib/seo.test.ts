import { describe, expect, it } from 'vitest';
import { buildSitemapEntries } from './seo';

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
