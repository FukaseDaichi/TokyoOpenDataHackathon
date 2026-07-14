import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import FirstLoad from './FirstLoad';
import { VISITED_KEY } from '../lib/firstLoad';

// #first-load はlayout.tsxのJSXとしてReactが管理するノードのため、
// el.remove() でReactの外から消すとその後のbody直下コミットで
// insertBefore NotFoundError になる。DOMから削除せずCSSで隠すことを保証する。

function mountOverlay() {
  const el = document.createElement('div');
  el.id = 'first-load';
  document.body.appendChild(el);
  return el;
}

beforeEach(() => {
  sessionStorage.clear();
});

afterEach(() => {
  document.getElementById('first-load')?.remove();
  vi.useRealTimers();
});

describe('FirstLoad', () => {
  it('訪問済みでもDOMから削除せず非表示クラスで隠す', () => {
    sessionStorage.setItem(VISITED_KEY, '1');
    const el = mountOverlay();
    render(<FirstLoad />);
    expect(document.getElementById('first-load')).toBe(el);
    expect(el.className).toContain('uk-fl-gone');
  });

  it('プリロード完了後もDOMから削除せずフェード＋非表示クラスで隠す', async () => {
    const el = mountOverlay();
    render(<FirstLoad />);
    // jsdomでは画像がロードされないため、プリロードは2秒タイムアウトで解決する
    await waitFor(() => expect(el.className).toContain('uk-fl-hide'), { timeout: 3000 });
    await waitFor(() => expect(el.className).toContain('uk-fl-gone'), { timeout: 2000 });
    expect(document.getElementById('first-load')).toBe(el);
    expect(sessionStorage.getItem(VISITED_KEY)).toBe('1');
  });
});
