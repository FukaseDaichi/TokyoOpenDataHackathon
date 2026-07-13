import raw from './ward-policies.json';

export interface WardPolicy { title: string; summary: string; source: string; url: string }
export interface WardProfile {
  flowers?: string[];
  trees?: string[];
  birds?: string[];
  emblemNote?: string;
  policies: WardPolicy[];
}

const DATA = raw as Record<string, Partial<WardProfile>>;

/** 手動キュレーションの区プロフィール。未収録区は null */
export function loadWardProfile(code: string): WardProfile | null {
  const entry = DATA[code];
  if (!entry) return null;
  return { ...entry, policies: entry.policies ?? [] };
}
