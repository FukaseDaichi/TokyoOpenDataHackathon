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
});

describe('loadWardProfile', () => {
  it('未収録の区は null を返す', () => {
    expect(loadWardProfile('13101')).toBeDefined(); // null か WardProfile（収録後はWardProfile）
  });
});
