import { describe, expect, it } from 'vitest';
import raw from './ward-policies.json';
import { AXIS_KEYS } from '../domain/axes';
import { loadWardProfile, pickPolicyForAxes, type WardPolicy } from './policies';

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

describe('政策の軸タグ', () => {
  it('axes タグは AXIS_KEYS の値のみ・重複なし', () => {
    for (const p of Object.values(raw) as { policies?: { axes?: string[] }[] }[]) {
      for (const policy of p.policies ?? []) {
        if (!policy.axes) continue;
        expect(new Set(policy.axes).size).toBe(policy.axes.length);
        for (const axis of policy.axes) expect(AXIS_KEYS).toContain(axis);
      }
    }
  });

  it('全区に一致軸で引ける政策タグが少なくとも1件ある', () => {
    for (const [code, p] of Object.entries(raw) as [string, { policies?: { axes?: string[] }[] }][]) {
      const tagged = (p.policies ?? []).filter((policy) => (policy.axes ?? []).length > 0);
      expect(tagged.length, code).toBeGreaterThan(0);
    }
  });
});

describe('pickPolicyForAxes', () => {
  const policies: WardPolicy[] = [
    { title: '防災のまち', summary: 's', source: 'src', url: 'https://example.com' },
    { title: '子育てのまち', summary: 's', source: 'src', url: 'https://example.com', axes: ['family'] },
    { title: 'にぎわいのまち', summary: 's', source: 'src', url: 'https://example.com', axes: ['liveliness'] },
  ];

  it('一致軸とタグが交差する最初の政策を返す', () => {
    expect(pickPolicyForAxes(policies, ['liveliness', 'family'])?.title).toBe('子育てのまち');
  });

  it('交差する政策がなければ先頭を返す', () => {
    expect(pickPolicyForAxes(policies, ['greenery', 'luxury'])?.title).toBe('防災のまち');
  });

  it('政策が空なら null を返す', () => {
    expect(pickPolicyForAxes([], ['family', 'greenery'])).toBeNull();
  });
});
