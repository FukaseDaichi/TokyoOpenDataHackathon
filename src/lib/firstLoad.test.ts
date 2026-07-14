import { describe, it, expect, vi, afterEach } from 'vitest';
import { firstLoadPreloadUrls, hasVisited, markVisited, waitForPreload, VISITED_KEY } from './firstLoad';

function memoryStorage(initial: Record<string, string> = {}) {
  const map = new Map(Object.entries(initial));
  return {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
  };
}

afterEach(() => {
  vi.useRealTimers();
});

describe('firstLoadPreloadUrls', () => {
  it('タイトルロゴとクローズアップ3区を指定幅で返す', () => {
    const urls = firstLoadPreloadUrls(512);
    expect(urls).toContain('/title-w720.webp');
    expect(urls).toContain('/characters/ssr/chiyoda-w512.webp');
    expect(urls).toContain('/characters/ssr/shinjuku-w512.webp');
    expect(urls).toContain('/characters/ssr/koto-w512.webp');
    expect(urls).toHaveLength(4);
  });

  it('896指定ではw896のキャラ画像を返す', () => {
    expect(firstLoadPreloadUrls(896)).toContain('/characters/ssr/chiyoda-w896.webp');
  });
});

describe('hasVisited / markVisited', () => {
  it('未訪問ならfalse、markVisited後はtrue', () => {
    const storage = memoryStorage();
    expect(hasVisited(storage)).toBe(false);
    markVisited(storage);
    expect(hasVisited(storage)).toBe(true);
    expect(storage.getItem(VISITED_KEY)).toBe('1');
  });

  it('storageがnullでも例外を出さずfalse扱い', () => {
    expect(hasVisited(null)).toBe(false);
    expect(() => markVisited(null)).not.toThrow();
  });

  it('storageが例外を投げてもfalse扱いで握りつぶす', () => {
    const broken = {
      getItem: () => {
        throw new Error('denied');
      },
      setItem: () => {
        throw new Error('denied');
      },
    };
    expect(hasVisited(broken)).toBe(false);
    expect(() => markVisited(broken)).not.toThrow();
  });
});

describe('waitForPreload', () => {
  it('全画像のロード完了で解決する', async () => {
    const loaded: string[] = [];
    await waitForPreload(['/a.webp', '/b.webp'], 2000, async (url) => {
      loaded.push(url);
    });
    expect(loaded).toEqual(['/a.webp', '/b.webp']);
  });

  it('ロードが終わらなくてもタイムアウトで解決する', async () => {
    vi.useFakeTimers();
    const never = () => new Promise<void>(() => {});
    const done = vi.fn();
    void waitForPreload(['/slow.webp'], 2000, never).then(done);
    await vi.advanceTimersByTimeAsync(1999);
    expect(done).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(done).toHaveBeenCalled();
  });

  it('ローダーが失敗しても解決する', async () => {
    await expect(
      waitForPreload(['/broken.webp'], 2000, () => Promise.reject(new Error('404'))),
    ).resolves.toBeUndefined();
  });
});
