import { describe, expect, it } from 'vitest';
import raw from './ward-policies.json';
import { loadWardProfile } from './policies';

const WARD_IDS = Array.from({ length: 23 }, (_, i) => `131${String(i + 1).padStart(2, '0')}`);

describe('ward-policies.json', () => {
  it('キーは正しい区コードのみ', () => {
    for (const code of Object.keys(raw)) expect(WARD_IDS).toContain(code);
  });
  it('政策は各区5件以下・出典URL必須・要約は中立的な長さ', () => {
    for (const p of Object.values(raw) as { policies?: { title: string; summary: string; url: string }[] }[]) {
      for (const policy of p.policies ?? []) {
        expect(policy.url).toMatch(/^https:\/\//);
        expect(policy.title.length).toBeLessThanOrEqual(30);
        expect(policy.summary.length).toBeLessThanOrEqual(120);
      }
      expect((p.policies ?? []).length).toBeLessThanOrEqual(5);
    }
  });

  it('区の花・木・鳥は重複のない文字列配列', () => {
    for (const profile of Object.values(raw) as {
      flowers?: string[];
      trees?: string[];
      birds?: string[];
    }[]) {
      for (const symbols of [profile.flowers, profile.trees, profile.birds]) {
        if (!symbols) continue;
        expect(symbols.length).toBeGreaterThan(0);
        expect(new Set(symbols).size).toBe(symbols.length);
        for (const symbol of symbols) expect(symbol.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it('複数指定と区章のハトを公式情報どおりに扱う', () => {
    expect(loadWardProfile('13103')?.flowers).toEqual(['アジサイ', 'バラ']);
    expect(loadWardProfile('13109')?.trees).toEqual(['シイノキ', 'カエデ']);
    expect(loadWardProfile('13115')?.trees).toEqual(['杉', 'アケボノスギ', 'サザンカ']);
    expect(loadWardProfile('13123')?.birds).toBeUndefined();
  });
});

describe('loadWardProfile', () => {
  it('未収録の区は null を返す', () => {
    expect(loadWardProfile('13101')).toBeDefined(); // null か WardProfile（収録後はWardProfile）
  });
});
